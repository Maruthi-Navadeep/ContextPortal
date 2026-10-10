import asyncio
import time

import httpx
import markdownify
from bs4 import BeautifulSoup
from playwright.sync_api import Page, sync_playwright
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from pydantic import BaseModel
from readability import Document


class ContextResult(BaseModel):
    url: str
    title: str | None = None
    content: str
    content_type: str = "text/markdown"
    retrieval_method: str
    authenticated: bool


# ── constants ─────────────────────────────────────────────────────────────────

USER_AGENT = "ContextPortal/0.1.0 (+https://github.com/NavadeepDj/ContextPortal)"

# 1 retry (initial attempt + 1 backoff) for genuine server-overload signals only.
# Timeouts fall through to the browser immediately — retrying a timeout just adds
# latency before the Playwright fallback, which is the right tool for slow/auth-gated sites.
# See decisions/ADR-004-http-retry-strategy.md for the full rationale.
MAX_HTTP_RETRIES = 2
RETRY_ON_STATUS = {429, 503}
MIN_CONTENT_CHARS = 100

# Patterns in raw HTML that indicate a JavaScript-only SPA shell with no real content.
# Checked before extraction to catch shells whose error/loading text passes the char threshold.
SPA_MARKERS = [
    'id="root"',
    "id='root'",
    'id="app"',
    "id='app'",
    "you need to enable javascript",
    "please enable javascript",
    "this site requires javascript",
]


# ── shared extraction helper ───────────────────────────────────────────────────

def _extract_content(html: str) -> tuple[str, str]:
    """Single source of truth: HTML → (markdown, title)."""
    doc = Document(html)
    title = doc.title()
    main_html = doc.summary()
    soup = BeautifulSoup(main_html, "lxml")
    md = markdownify.markdownify(
        str(soup), heading_style="ATX", strip=["script", "style", "img"]
    )
    md = "\n".join([line for line in md.splitlines() if line.strip() or line == ""])
    return md.strip(), title


async def extract_markdown(html: str) -> tuple[str, str]:
    """Async shim kept for backwards compatibility — delegates to _extract_content."""
    return _extract_content(html)


# ── HTTP fetch ────────────────────────────────────────────────────────────────

async def fetch_public(url: str) -> ContextResult | None:
    """Attempts to fetch the URL normally. Returns ContextResult if successful and not blocked, else None."""
    headers = {"User-Agent": USER_AGENT}
    try:
        async with httpx.AsyncClient(
            headers=headers, follow_redirects=True, timeout=10.0
        ) as client:
            for attempt in range(MAX_HTTP_RETRIES):
                try:
                    response = await client.get(url)
                except httpx.TimeoutException:
                    print("Request timed out — falling back to browser immediately.")
                    return None
                except Exception as e:
                    print(f"Public fetch failed: {e}")
                    return None

                if response.status_code in (401, 403):
                    print("Public fetch hit 401/403.")
                    return None

                if response.status_code in RETRY_ON_STATUS:
                    if attempt < MAX_HTTP_RETRIES - 1:
                        print(
                            f"Got {response.status_code}, retrying in {2 ** attempt}s "
                            f"(attempt {attempt + 1}/{MAX_HTTP_RETRIES})..."
                        )
                        await asyncio.sleep(2**attempt)
                        continue
                    print(f"Got {response.status_code} after {MAX_HTTP_RETRIES} attempts.")
                    return None

                response.raise_for_status()

                final_url = str(response.url).lower()
                if "login" in final_url or "signin" in final_url or "auth" in final_url:
                    print(f"Public fetch redirected to auth page: {final_url}")
                    return None

                content_type = response.headers.get("content-type", "")

                if "application/pdf" in content_type:
                    return ContextResult(
                        url=final_url,
                        title=None,
                        content=(
                            "[PDF file: direct text extraction is not supported. "
                            "Download the file and use a dedicated PDF reader.]"
                        ),
                        content_type=content_type,
                        retrieval_method="http",
                        authenticated=False,
                    )

                if "text/html" not in content_type:
                    return ContextResult(
                        url=final_url,
                        title=None,
                        content=response.text,
                        content_type=content_type,
                        retrieval_method="http",
                        authenticated=False,
                    )

                # Detect SPA shells before running the full extraction pipeline
                raw_lower = response.text.lower()
                if any(marker in raw_lower for marker in SPA_MARKERS):
                    print("SPA shell markers detected in HTML.")
                    return None

                md, title = await extract_markdown(response.text)

                if len(md.strip()) < MIN_CONTENT_CHARS:
                    print(
                        "Public fetch returned virtually empty content (likely an SPA shell)."
                    )
                    return None

                return ContextResult(
                    url=final_url,
                    title=title,
                    content=md,
                    content_type="text/markdown",
                    retrieval_method="http",
                    authenticated=False,
                )

    except Exception as e:
        print(f"Public fetch failed: {e}")
        return None

    return None


# ── browser auth helpers ──────────────────────────────────────────────────────

def _is_on_target_content(page: Page, target_url: str) -> bool:
    """Check if the page has navigated to (or near) the target URL's domain/path."""
    from urllib.parse import urlparse

    current = urlparse(page.url)
    target = urlparse(target_url)
    # Consider it "on target" if the domain matches the target domain
    # and the URL no longer looks like a login/auth/access page.
    current_url_lower = page.url.lower()
    auth_indicators = ["login", "signin", "sign-in", "auth", "/access"]
    is_auth_page = any(indicator in current_url_lower for indicator in auth_indicators)
    return current.netloc == target.netloc and not is_auth_page


def _fetch_authenticated_sync(url: str) -> ContextResult:
    """
    Sync function that runs Playwright in a thread.
    Uses sync_api to avoid the Windows asyncio subprocess bug.

    Handles OAuth popup flows (e.g. Google Sign-In) by polling the
    main page's URL rather than watching for DOM changes on the page,
    since OAuth opens new windows that we can't inspect.
    """
    # Use a deterministic global directory for the user profile so it persists across different CWDs
    from pathlib import Path

    user_data_dir = str(Path.home() / ".contextportal" / "playwright_profile")

    with sync_playwright() as p:
        browser_context = p.chromium.launch_persistent_context(
            user_data_dir,
            headless=False,
            channel="chrome",
            args=["--disable-blink-features=AutomationControlled"],
            viewport={"width": 1280, "height": 800},
        )

        page = browser_context.new_page()

        try:
            print(f"Navigating to {url}...")
            page.goto(url, wait_until="domcontentloaded")

            try:
                page.wait_for_load_state("networkidle", timeout=5000)
            except PlaywrightTimeoutError:
                pass

            # Detect if we landed on a login/auth page
            current_url_lower = page.url.lower()
            auth_indicators = ["login", "signin", "sign-in", "auth", "/access"]
            has_password_field = page.evaluate(
                "() => !!document.querySelector('input[type=\"password\"]')"
            )
            is_login_page = has_password_field or any(
                indicator in current_url_lower for indicator in auth_indicators
            )

            if is_login_page:
                print(
                    "Authentication required. Please log in using the opened browser window."
                )
                print(
                    "This supports OAuth popups (Google, SSO, etc.) — complete login in any window that opens."
                )
                print("Waiting for you to complete login (up to 5 minutes)...")

                # Poll-based approach: check every 2 seconds if the main page
                # has navigated back to the target domain after auth completion.
                # This works with OAuth popups, SSO redirects, and multi-step flows
                # where the auth happens in a separate window.
                login_timeout_seconds = 300
                poll_interval_seconds = 2
                elapsed = 0
                login_succeeded = False

                while elapsed < login_timeout_seconds:
                    time.sleep(poll_interval_seconds)
                    elapsed += poll_interval_seconds

                    if _is_on_target_content(page, url):
                        print("Login detected! Page has returned to target domain.")
                        login_succeeded = True
                        break

                if not login_succeeded:
                    # One final attempt: navigate back to the target URL.
                    # The browser context may now have valid session cookies
                    # even if the page itself didn't redirect back.
                    print(
                        "Login wait period ended. Attempting to navigate to the target resource..."
                    )
                    page.goto(url, wait_until="domcontentloaded")
                    try:
                        page.wait_for_load_state("networkidle", timeout=10000)
                    except PlaywrightTimeoutError:
                        pass

                    if not _is_on_target_content(page, url):
                        raise RuntimeError(
                            "Authentication timed out. Could not access the target resource. "
                            "Please try again and complete the login within 5 minutes."
                        )

                # Wait for the page to fully settle after auth redirect
                try:
                    page.wait_for_load_state("networkidle", timeout=10000)
                except PlaywrightTimeoutError:
                    pass

                # If we're on target domain but not the exact target URL, navigate there
                if url not in page.url:
                    print(f"Redirecting to target resource: {url}")
                    page.goto(url, wait_until="domcontentloaded")
                    try:
                        page.wait_for_load_state("networkidle", timeout=10000)
                    except PlaywrightTimeoutError:
                        pass

            print("Extracting content...")
            html_content = page.content()
            final_url = page.url

            md_content, title = _extract_content(html_content)

            return ContextResult(
                url=final_url,
                title=title,
                content=md_content,
                content_type="text/markdown",
                retrieval_method="browser",
                authenticated=True,
            )

        finally:
            browser_context.close()


async def fetch_authenticated(url: str) -> ContextResult:
    """Runs Playwright in a background thread to avoid Windows asyncio issues."""
    return await asyncio.to_thread(_fetch_authenticated_sync, url)


async def get_context(url: str) -> ContextResult:
    """Main entrypoint: tries public fetch, falls back to authenticated fetch."""
    print(f"Attempting normal public fetch for: {url}")
    public_result = await fetch_public(url)

    if public_result:
        print("Successfully retrieved publicly.")
        return public_result

    print(
        "Public fetch failed or requires authentication. Falling back to authorized session..."
    )
    return await fetch_authenticated(url)
