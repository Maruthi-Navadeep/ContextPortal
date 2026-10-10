# ADR-004: HTTP Retry Strategy — One Retry for Server Errors, No Retry on Timeout

## Status
Accepted

## Context

ContextPortal's fetch pipeline has two tiers: a lightweight HTTP path (`httpx`) and a full browser fallback (Playwright). The HTTP path runs first; if it fails or returns no usable content, the browser handles it.

An earlier implementation added a 3-attempt exponential-backoff retry loop that covered both transient HTTP status codes (429, 503) **and** `httpx.TimeoutException`. The goal was to avoid prematurely escalating to the expensive Playwright path.

After live testing we identified that this was the wrong trade-off in practice:

### Why retrying on timeout is wrong

A timeout means the server did not respond within 10 seconds. In the context of ContextPortal:

- If the server is genuinely slow, it is probably rendering JavaScript — exactly the case Playwright is built for.
- If the server is behind an auth wall, it times out the unauthenticated request on purpose. Retrying adds 1s + 2s + 4s = **up to 7 seconds of dead latency** before the browser fallback that was always going to be needed.
- Corporate networks and firewalls often drop unauthenticated connections silently. Retrying is guaranteed to timeout again.

**A timeout is a signal to fall through to the browser immediately, not a signal to retry.**

### Why three retries for 429/503 is also too much

429 (rate-limited) and 503 (server overload) are genuinely transient, but:

- If a site is 429-ing the unauthenticated request, it is almost certainly session-gated. A second unauthenticated request will 429 again.
- Three retries with backoff (1s + 2s = 3s minimum) is noticeable latency before the browser fallback.
- One retry is enough to distinguish "fluke" from "persistent block."

## Decision

1. **No timeout retry.** On `httpx.TimeoutException`, return `None` immediately and let the browser fallback run.

2. **One retry for 429 / 503.** `MAX_HTTP_RETRIES = 2` (initial attempt + one retry). Backoff is 1 second. If the second attempt also returns 429/503, return `None`.

3. **All other errors remain immediate exits.** 401/403, non-2xx after raise_for_status, DNS failures — no retry, fall to browser.

## Consequences

- **Positive**: Timeout URLs reach the Playwright fallback 3–7 seconds faster for the user.
- **Positive**: Rate-limited URLs that genuinely need auth reach the browser in ~1s instead of ~3s.
- **Positive**: Simpler code — the timeout branch is a single `return None`.
- **Neutral**: Genuine transient timeouts (rare) now always go to Playwright. Playwright handles them fine and will succeed if the content is actually there.
- **Trade-off accepted**: A publicly accessible page that times out once and would have succeeded on retry now costs one Playwright launch. This is the uncommon case; the auth-gated timeout is the common case.
