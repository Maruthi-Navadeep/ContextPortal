import argparse
import asyncio
import sys


def run_mcp() -> None:
    """Run the ContextPortal MCP server."""
    from app.mcp.server import main as mcp_main

    mcp_main()


def run_login(start_url: str | None = None) -> None:
    """Launch persistent browser for manual login and session seeding."""
    import time
    from pathlib import Path

    from playwright.sync_api import sync_playwright

    # Use global profile directory so sessions persist no matter where the CLI is run
    profile_dir = Path.home() / ".contextportal" / "playwright_profile"
    print(f"Using persistent profile at: {profile_dir}")
    print("A browser window will now open.")
    print("1. Navigate to the websites you want your AI agent to access.")
    print("2. Log in manually (Google Sign-In, SSO, username/password, etc.).")
    print("3. Close the browser window when you are finished.")
    print("\nLaunching browser...\n")

    with sync_playwright() as p:
        # Use real Chrome. --disable-blink-features=AutomationControlled suppresses
        # the automation banner so Google Sign-In and similar OAuth providers work
        # normally. This is not stealth/evasion — the user still authenticates
        # legitimately; we are only reducing Playwright-specific UX friction.
        browser_context = p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=False,
            channel="chrome",
            args=["--disable-blink-features=AutomationControlled"],
        )

        page = (
            browser_context.pages[0]
            if browser_context.pages
            else browser_context.new_page()
        )

        if start_url:
            print(f"Navigating to {start_url}...")
            page.goto(start_url)
        else:
            page.goto("about:blank")

        print("\nWaiting for you to close the browser window...")
        print("Your session will be saved automatically.")

        # Keep process alive until user closes the context/browser
        try:
            while browser_context.pages:
                time.sleep(1)
        except Exception:
            pass

    print("\nBrowser closed. Session saved successfully!")
    print("You can now ask your AI agent to fetch authenticated resources.")


def run_fetch(url: str) -> None:
    """Fetch a URL directly from the CLI (useful for testing without an agent)."""
    from app.core.retriever import get_context

    print(f"Fetching context for: {url}\n")

    async def _do_fetch() -> None:
        result = await get_context(url)
        if not result:
            print("Error: Could not retrieve content.")
            sys.exit(1)

        print("=" * 80)
        print(f"Title: {result.title}")
        print(
            f"Retrieval Method: {result.retrieval_method} (Authenticated: {result.authenticated})"
        )
        print("=" * 80)
        print(result.content)

    asyncio.run(_do_fetch())


def run_search(query: str, engine: str = "google", num_results: int = 5) -> None:
    """Search using SerpApi directly from the CLI."""
    from app.core.search import format_results_as_markdown, search

    print(f"Searching for: {query} (engine: {engine})\n")
    try:
        response = search(query, engine=engine, num_results=num_results)
        print(format_results_as_markdown(response))
    except ValueError as e:
        print(f"Configuration error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error executing search: {e}")
        sys.exit(1)


def run_setup(client_filter: str = "all", dry_run: bool = False) -> None:
    """Auto-configure MCP clients to connect to ContextPortal."""
    from app.core.setup import get_supported_clients, inject_mcp_config

    print("=" * 60)
    print("  [ContextPortal] Auto-Configuration Setup")
    print("=" * 60)
    print("Detecting and configuring AI agent clients...\n")

    clients = get_supported_clients()
    if client_filter != "all":
        clients = [c for c in clients if c.name == client_filter]
        if not clients:
            print(
                f"Unknown client '{client_filter}'. Available options: all, claude, cursor, antigravity"
            )
            sys.exit(1)

    is_specific = client_filter != "all"
    for client in clients:
        success, message = inject_mcp_config(
            client.config_path,
            key_name=client.key_name,
            dry_run=dry_run,
            force=is_specific,
        )
        is_skipped = "skipped" in message.lower()
        symbol = "[-]" if is_skipped else ("[+]" if success else "[!]")
        print(f"  {symbol} {client.display_name:<16}: {message}")
        print(f"      Target: {client.config_path}")

    print("\n" + "=" * 60)
    if dry_run:
        print("Dry run completed. No files were modified.")
    else:
        print("Done! Restart your AI agent client to load ContextPortal.")
        print("Run 'contextportal doctor' anytime to verify your environment.")
    print("=" * 60 + "\n")


def run_update(check_only: bool = False) -> None:
    """Check for updates from PyPI and upgrade ContextPortal."""
    from app.core.updater import run_update as do_update

    do_update(check_only=check_only)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="ContextPortal — The authenticated fetch layer for AI agents."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # MCP Server Command
    subparsers.add_parser(
        "mcp", help="Start the Model Context Protocol (MCP) server over STDIO."
    )

    # Login Command
    login_parser = subparsers.add_parser(
        "login", help="Open a browser to manually authenticate and save your session."
    )
    login_parser.add_argument(
        "url",
        nargs="?",
        default=None,
        help="Optional starting URL to open for login (e.g., https://github.com/login).",
    )
    login_parser.add_argument(
        "--url",
        dest="url_flag",
        type=str,
        default=None,
        help="Optional starting URL to open for login (e.g., https://github.com/login).",
    )

    # Fetch Command
    fetch_parser = subparsers.add_parser(
        "fetch", help="Test retrieval of a URL directly from the CLI."
    )
    fetch_parser.add_argument("url", type=str, help="The URL to fetch.")

    # Search Command (SerpApi)
    search_parser = subparsers.add_parser(
        "search", help="Search the web using SerpApi directly from the CLI."
    )
    search_parser.add_argument("query", type=str, help="The search query.")
    search_parser.add_argument(
        "--engine",
        type=str,
        default="google",
        help="SerpApi engine to use (default: google).",
    )
    search_parser.add_argument(
        "--num",
        dest="num_results",
        type=int,
        default=5,
        help="Number of results to return (default: 5).",
    )

    # Setup Command (Release 0.2)
    setup_parser = subparsers.add_parser(
        "setup",
        help="Auto-configure MCP connections in Claude, Cursor, and Antigravity.",
    )
    setup_parser.add_argument(
        "--client",
        choices=["all", "claude", "cursor", "antigravity"],
        default="all",
        help="Specific AI client to configure (default: all)",
    )
    setup_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing to configuration files.",
    )

    # Doctor / Diagnostics Command (Release 0.2)
    subparsers.add_parser(
        "doctor", help="Check system health, browser storage, and MCP client readiness."
    )
    subparsers.add_parser("status", help="Alias for 'doctor'.")

    # Update Command (Release 0.3)
    update_parser = subparsers.add_parser(
        "update", help="Check for updates from PyPI and upgrade ContextPortal."
    )
    update_parser.add_argument(
        "--check",
        action="store_true",
        help="Check if an update is available without installing it.",
    )

    args = parser.parse_args()

    if args.command == "mcp":
        run_mcp()
    elif args.command == "login":
        run_login(args.url_flag or args.url)
    elif args.command == "fetch":
        run_fetch(args.url)
    elif args.command == "search":
        run_search(args.query, engine=args.engine, num_results=args.num_results)
    elif args.command == "setup":
        run_setup(client_filter=args.client, dry_run=args.dry_run)
    elif args.command in ("doctor", "status"):
        from app.core.doctor import run_doctor

        run_doctor()
    elif args.command == "update":
        run_update(check_only=args.check)


if __name__ == "__main__":
    main()
