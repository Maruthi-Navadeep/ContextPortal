import asyncio

from mcp.server.mcpserver import MCPServer

from app.core.retriever import get_context
from app.core.search import format_results_as_markdown, search
from app.core.security import validate_url_policy

# Initialize the MCP Server
mcp = MCPServer("ContextPortal")


@mcp.tool()
async def fetch_context(url: str) -> str:
    """Fetch context from a given URL.
    Can retrieve content from authenticated/protected enterprise portals using the user's secure browser session.
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
    """Search the web using SerpApi and return structured results.

    Use this tool to discover relevant URLs and information before
    fetching full page content with fetch_context.

    Supported engines: google, google_scholar, google_news, google_maps,
    google_shopping, google_jobs, youtube, bing, and 100+ more.

    Example workflow:
    1. search_context("Handshake AI projects") -> get URLs
    2. fetch_context("https://app.joinhandshake.com/...") -> get full page content
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
