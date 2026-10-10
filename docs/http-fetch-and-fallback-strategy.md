# HTTP Fetch Tier: Strategy, Retry Logic, and Browser Fallback

## Overview

ContextPortal retrieves content through a two-tier pipeline:

1. **HTTP tier** (`httpx`) — fast, lightweight, no browser overhead
2. **Browser tier** (Playwright + Chrome) — full rendering, auth support, session reuse

The HTTP tier runs first and returns `None` on any signal that browser rendering or authentication is needed. When `None` is returned, `get_context()` immediately hands off to the browser tier.

This document covers how the HTTP tier decides what to retry, what to exit immediately, and why — particularly the timeout decision, which is non-obvious.

---

## Retry Strategy

### What we retry

| Signal | Action | Why |
|---|---|---|
| `503 Service Unavailable` | 1 retry after 1s | Genuine transient server overload |
| `429 Too Many Requests` | 1 retry after 1s | Possible CDN rate-limit blip |
| `httpx.TimeoutException` | **No retry — fall to browser immediately** | See below |
| `401 / 403` | No retry | Auth block, not transient |
| DNS failure | No retry | Network issue, not transient |
| Any other exception | No retry | Fall to browser |

**Constants** (`retriever.py`):
```python
MAX_HTTP_RETRIES = 2   # initial attempt + 1 retry
RETRY_ON_STATUS = {429, 503}
```

### Why only one retry (not three)

Three retries with exponential backoff (1s + 2s = 3s minimum) is noticeable latency to a user waiting on an AI agent response. One retry is enough to distinguish a genuine fluke from a persistent block. If the second attempt also fails, the right tool is the browser — not a third HTTP request.

---

## Why timeouts fall to browser immediately

This is the most important design decision in this tier.

### The naive approach (what we tried first)

The original implementation retried `httpx.TimeoutException` up to 3 times with exponential backoff. The reasoning was: "avoid escalating to the expensive Playwright path for a transient timeout."

### Why it was wrong in practice

A timeout in the HTTP tier means the server did not respond in 10 seconds. In practice this falls into two categories:

**Category 1 — Auth-gated or firewall-blocked (the common case)**
The server receives an unauthenticated request and silently drops it, or the response is held behind a session check. Retrying sends the same unauthenticated request again. It will time out again. You paid 1s + 2s + (up to 4s) = **up to 7 seconds of dead latency** before the browser fallback that was always going to be needed.

**Category 2 — JavaScript-rendered page (also common)**
The server responds with an empty SPA shell quickly, but the actual content only exists after client-side rendering executes. `httpx` has no JS engine, so the meaningful content never arrives within the timeout window. Again: retrying the same request changes nothing.

**Category 3 — Genuinely slow public server (rare)**
The server is overloaded but publicly accessible and would succeed on retry. This is the only case retrying actually helps — and it's uncommon compared to categories 1 and 2. In this case we accept the cost: the browser fallback will handle it fine.

### The principle

> **A timeout is not a transient HTTP signal — it is a signal to use a different tool.**

503 says "I'm temporarily overloaded, try again." A timeout says "I didn't respond at all" — which in the context of ContextPortal overwhelmingly means the request needs a session or a JS runtime, both of which the browser tier provides.

```python
except httpx.TimeoutException:
    print("Request timed out — falling back to browser immediately.")
    return None
```

See also: `decisions/ADR-004-http-retry-strategy.md`

---

## SPA Shell Detection

Even when the server responds with 200 OK, the HTML may be a JavaScript-only shell with no real content — just a `<div id="root"></div>` waiting for React to populate it.

The pipeline checks for shell markers **before** running the extraction pipeline:

```python
SPA_MARKERS = [
    'id="root"', "id='root'",
    'id="app"',  "id='app'",
    "you need to enable javascript",
    "please enable javascript",
    "this site requires javascript",
]

raw_lower = response.text.lower()
if any(marker in raw_lower for marker in SPA_MARKERS):
    return None  # browser fallback
```

This check runs before `readability` and `markdownify` to avoid running the full extraction pipeline on content that will produce nothing useful. It also catches shells whose noscript/error text is long enough to pass the 100-character minimum threshold check that comes after extraction.

---

## Content Extraction

After a successful HTTP response, extraction is handled by a single shared function used by both the HTTP and browser paths:

```python
def _extract_content(html: str) -> tuple[str, str]:
    doc = Document(html)          # readability-lxml: isolates main article content
    title = doc.title()
    main_html = doc.summary()
    soup = BeautifulSoup(main_html, "lxml")
    md = markdownify.markdownify(
        str(soup),
        heading_style="ATX",
        strip=["script", "style", "img"],  # removes noise, inline images stripped
    )
    md = "\n".join([line for line in md.splitlines() if line.strip() or line == ""])
    return md.strip(), title
```

Both the HTTP tier and the Playwright browser tier call `_extract_content()`. Before this was deduplicated, fixes applied to one path silently missed the other. Having a single extraction function means any improvement (e.g. adding to the `strip` list) applies everywhere automatically.

---

## PDF Handling

PDFs trigger a special early exit before the HTML extraction pipeline runs:

```python
if "application/pdf" in content_type:
    return ContextResult(
        content="[PDF file: direct text extraction is not supported. "
                "Download the file and use a dedicated PDF reader.]",
        ...
    )
```

Without this, `response.text` on a PDF returns garbled binary-as-text that is useless to an LLM. The message gives the agent an actionable hint instead.

---

## Decision Log

- `decisions/ADR-004-http-retry-strategy.md` — retry count and timeout behavior
- `decisions/ADR-003-transparent-browser-automation.md` — browser tier: why real Chrome, why `--disable-blink-features`
- `decisions/ADR-002-http-client-identity-and-user-agent.md` — User-Agent policy
