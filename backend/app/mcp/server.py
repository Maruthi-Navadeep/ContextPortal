import asyncio

from mcp.server.mcpserver import MCPServer

from app.core.retriever import get_context
from app.core.search import format_results_as_markdown, search
from app.core.security import validate_url_policy

# Initialize the MCP Server
mcp = MCPServer(
    "ContextPortal",
    instructions=(
        "ContextPortal retrieves web content for AI agents — including "
        "pages behind login walls, SSO portals, and authenticated dashboards.\n"
        "\n"
        "EFFICIENT USAGE (aim for 1–2 tool calls total):\n"
        "• Know the URL? → call fetch_context directly. One call. Done.\n"
        "• Don't know the URL? → call search_context ONCE with a simple, "
        "natural query, pick the best URL from results, then call "
        "fetch_context on it. Two calls. Done.\n"
        "\n"
        "AVOID THESE COMMON MISTAKES:\n"
        "• Multiple search attempts — one well-phrased query is enough. "
        "If the first search reveals the domain, try fetch_context on it "
        "directly instead of searching again.\n"
        "• Fetching help articles or documentation ABOUT a site when your "
        "goal is the site itself (e.g. don't fetch a support article "
        "about a dashboard — fetch the dashboard).\n"
        "• Any preparation before calling these tools (reading source code, "
        "env files, configs, etc.) — just call the tools.\n"
    ),
)


@mcp.tool()
async def fetch_context(url: str) -> str:
    """Fetch and extract clean markdown content from any URL.

    Handles authentication automatically using the user's saved browser
    session — works on SSO-protected portals, login-walled dashboards,
    and internal tools without any extra setup.

    WHEN TO USE:
    • You have a URL → call this directly. This is the most common case.
    • You got a URL from search_context → call this to get full page content.

    The URL may redirect (e.g. a base domain to a dashboard). The content
    from the final destination is returned.
    """
    if not url:
        raise ValueError("url is required")

    try:
        # Enforce security policy before any retrieval
        validate_url_policy(url)
    except ValueError as e:
        # Return a formatted error message so the agent understands why it was blocked.
        # Returning a string prefixed with 'Error:' is a common pattern for LLMs
        # when we can't directly override the is_error flag in the high-level API.
        return f"Error: {str(e)}"

    # Delegate entirely to the retrieval orchestrator
    try:
        result = await get_context(url)
        if not result:
            return "Error: Could not retrieve content from the URL. The page might be empty, heavily obfuscated, or the auth session may have expired."

        formatted_response = (
            f"# {result.title or 'Untitled Document'}\n"
            f"**Source URL**: {result.url}\n"
            f"**Retrieval Method**: {result.retrieval_method} (Authenticated: {result.authenticated})\n"
            f"---\n\n"
            f"{result.content}"
        )
        return formatted_response
    except Exception as e:
        return f"Error retrieving context: {str(e)}"


@mcp.tool()
async def search_context(
    query: str,
    engine: str = "google",
    num_results: int = 5,
) -> str:
    """Search the web using SerpApi and return structured results with URLs.

    Use this ONLY when you don't already know the target URL.
    After getting results, call fetch_context with the best URL — don't
    keep searching.

    SEARCH TIPS:
    • Start with simple, natural queries (e.g. "Notion API docs",
      "Jira dashboard login"). One search is usually enough.
    • If the first search reveals a domain, try fetch_context on it
      directly instead of refining the search query.
    • Avoid complex boolean operators or site: queries on the first attempt.

    Supported engines: google, google_scholar, google_news, google_maps,
    google_shopping, google_jobs, youtube, bing, and 100+ more.

    Example workflow:
    1. search_context("Handshake AI projects") -> find relevant URLs
    2. fetch_context("https://ai.joinhandshake.com/...") -> get full page
    """
    if not query:
        raise ValueError("query is required")

    if not query.strip():
        return "Error: Search query cannot be empty."

    try:
        response = await asyncio.to_thread(search, query, engine, num_results)
        return format_results_as_markdown(response)
    except ValueError as e:
        return f"Error: {str(e)}"
    except Exception as e:
        return f"Error performing search: {str(e)}"


def main() -> None:
    """Run the MCP server over STDIO transport."""
    # MCPServer provides a synchronous run method that handles asyncio internally
    mcp.run()


if __name__ == "__main__":
    main()
