"""SerpApi search integration for ContextPortal.

Provides web search capabilities using SerpApi, enabling AI agents
to discover relevant URLs before fetching their content.
"""

import os
from dataclasses import dataclass
from typing import Any

import serpapi


@dataclass
class SearchResultItem:
    """A single search result."""

    position: int
    title: str
    link: str
    snippet: str
    source: str | None = None


@dataclass
class SearchResponse:
    """Structured search response."""

    query: str
    engine: str
    total_results: int
    results: list[SearchResultItem]
    answer_box: str | None = None
    knowledge_panel: str | None = None


def _get_api_key() -> str:
    """Get SerpApi API key from environment or settings."""
    from app.config import settings

    key = os.environ.get("SERPAPI_API_KEY") or settings.serpapi_api_key or ""
    if not key:
        raise ValueError(
            "SERPAPI_API_KEY environment variable is not set. "
            "Get a free API key at https://serpapi.com/users/sign_up"
        )
    return key


def search(
    query: str,
    engine: str = "google",
    num_results: int = 10,
    location: str | None = None,
    gl: str | None = None,
    hl: str = "en",
) -> SearchResponse:
    """Execute a search query via SerpApi.

    Args:
        query: The search query string.
        engine: SerpApi engine to use (google, google_scholar, google_news, etc.).
        num_results: Max number of organic results to return (1-10).
        location: Geographic location for the search (e.g., "India").
        gl: Country code for Google search (e.g., "in" for India).
        hl: Language code (default "en").

    Returns:
        SearchResponse with structured results.
    """
    api_key = _get_api_key()
    client = serpapi.Client(api_key=api_key)

    params: dict[str, Any] = {
        "engine": engine,
        "q": query,
        "hl": hl,
        "num": min(num_results, 10),
    }
    if location:
        params["location"] = location
    if gl:
        params["gl"] = gl

    raw: dict[str, Any] = client.search(params)

    # Parse organic results
    results: list[SearchResultItem] = []
    for item in raw.get("organic_results", []):
        results.append(
            SearchResultItem(
                position=item.get("position", 0),
                title=item.get("title", ""),
                link=item.get("link", ""),
                snippet=item.get("snippet", ""),
                source=item.get("source"),
            )
        )

    # Extract answer box if present
    answer_box: str | None = None
    if "answer_box" in raw:
        ab = raw["answer_box"]
        answer_box = ab.get("answer") or ab.get("snippet") or ab.get("result")

    # Extract knowledge panel if present
    knowledge_panel: str | None = None
    if "knowledge_graph" in raw:
        kg = raw["knowledge_graph"]
        kg_title = kg.get("title", "")
        kg_desc = kg.get("description", "")
        if kg_title or kg_desc:
            knowledge_panel = f"{kg_title}: {kg_desc}".strip(": ")

    total = int(raw.get("search_information", {}).get("total_results", len(results)))

    return SearchResponse(
        query=query,
        engine=engine,
        total_results=total,
        results=results,
        answer_box=answer_box,
        knowledge_panel=knowledge_panel,
    )


def format_results_as_markdown(response: SearchResponse) -> str:
    """Format SearchResponse as clean, agent-readable Markdown."""
    lines = [
        f"# Search Results: {response.query}",
        f"**Engine**: {response.engine} | **Results found**: {response.total_results}",
        "---",
        "",
    ]

    # Answer box (direct answer)
    if response.answer_box:
        lines.append(f"> **Direct Answer:** {response.answer_box}")
        lines.append("")

    # Knowledge panel
    if response.knowledge_panel:
        lines.append(f"> **Knowledge Panel:** {response.knowledge_panel}")
        lines.append("")

    # Organic results
    if response.results:
        for r in response.results:
            lines.append(f"### {r.position}. {r.title}")
            lines.append(f"**URL:** {r.link}")
            if r.source:
                lines.append(f"**Source:** {r.source}")
            lines.append(f"{r.snippet}")
            lines.append("")
    else:
        lines.append("No results found for this query.")

    # Tip for agent
    lines.append("---")
    lines.append(
        "*To read any of these pages in full, use `fetch_context` with the URL above.*"
    )

    return "\n".join(lines)
