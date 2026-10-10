# Search & Discovery in ContextPortal

> **Added in v0.4.0** — The `search_context` MCP tool and `contextportal search` CLI command.

## Overview

Before v0.4, agents had to already know the exact URL they wanted to fetch.
This was a hard limitation: if an agent didn't know where Handshake's project list lived, it was stuck.

**v0.4 solves this with an autonomous search → fetch loop.**

The agent can now:
1. Call `search_context("Handshake projects list")` → gets ranked URLs back
2. Pick the best result
3. Call `fetch_context("<url>")` → gets the full, authenticated page content

No URL knowledge required upfront.

---

## Architecture

```
Agent prompt: "Give me my projects on Handshake"
        │
        ▼
  search_context(query)          ← MCP tool: SerpAPI web search
        │
        │  returns ranked markdown list of URLs + snippets
        ▼
  Agent picks best URL
        │
        ▼
  fetch_context(url)             ← MCP tool: HTTP / Playwright fetch
        │
        │  returns full page content as markdown
        ▼
  Agent answers the user
```

### Files

| File | Purpose |
|---|---|
| `backend/app/core/search.py` | Core SerpAPI search logic, result parsing, markdown formatting |
| `backend/app/mcp/server.py` | MCP tool registration (`search_context`) |
| `backend/app/cli.py` | CLI command (`contextportal search <query>`) |
| `backend/tests/test_search.py` | Unit tests for search logic (SerpAPI mocked) |
| `backend/tests/test_mcp.py` | MCP integration tests for `search_context` |

---

## Configuration

Set your SerpAPI key in `.env` at the project root or in `backend/.env`:

```env
SERPAPI_API_KEY=your_key_here
```

Get a free key at [serpapi.com](https://serpapi.com/users/sign_up).

---

## MCP Tool: `search_context`

```
Tool name: search_context
Parameters:
  - query (str, required): Natural language search query
  - engine (str, optional): SerpAPI engine — "google" (default), "google_news", "google_scholar", etc.
  - num_results (int, optional): Max results to return, 1–10 (default: 10)

Returns: Markdown-formatted ranked list of URLs + snippets
```

### Example agent call

```python
result = await session.call_tool("search_context", {
    "query": "Handshake AI Fellowship expectations site:joinhandshake.com"
})
```

---

## CLI: `contextportal search`

Useful for debugging or quick lookups in the terminal:

```bash
contextportal search "Handshake AI Fellowship expectations"
contextportal search "Notion projects list" --engine google --num-results 5
```

---

## Why Multiple Search Calls Sometimes Happen

When an agent doesn't find a confident result on the first query, it refines:

1. `"Handshake projects"` → broad, many results
2. `"site:joinhandshake.com projects list"` → narrowed to official domain
3. Agent picks the top result and proceeds to `fetch_context`

This is normal LLM behavior — the agent iterates until it finds a URL it trusts.

**To help agents converge faster**, query phrasing like `site:<domain>` or including the platform name tends to get accurate results in one call.

---

## Future: Context URL Caching

> **Status: Planned — target v0.5**

### Problem

Every repeat query to `search_context` costs a SerpAPI API call, even when the same query was already answered earlier in the session (or in a prior session). This is wasteful and slows down the agent on repeated lookups.

### Proposed Design

A lightweight cache layer that maps `query → [SearchResultItem]` and short-circuits the SerpAPI call when a warm result exists.

#### Cache tiers (in priority order)

| Tier | Storage | TTL | Scope |
|---|---|---|---|
| **In-memory** | Python `dict` (LRU) | Session lifetime | Per-process |
| **File cache** | JSON in `~/.contextportal/cache/` | 24 hours (configurable) | Per-user, cross-session |
| **Redis** (optional) | Existing Redis dep | Configurable | Multi-agent, shared |

#### Key design decisions

- **Cache key**: normalized lowercase query string (strip punctuation, sort tokens?) — needs design
- **Invalidation**: time-based TTL, not event-based (searches are idempotent)
- **Opt-out**: `--no-cache` flag on CLI, `use_cache=False` parameter on MCP tool
- **Cache warm-up**: after a successful `search_context` + `fetch_context` loop, store the winning URL with higher weight for future queries
- **Storage format** (file tier):

```json
{
  "handshake projects list": {
    "cached_at": "2026-10-10T18:00:00Z",
    "ttl_seconds": 86400,
    "results": [
      {
        "position": 1,
        "title": "Projects — Handshake",
        "link": "https://app.joinhandshake.com/projects",
        "snippet": "...",
        "source": "Handshake"
      }
    ]
  }
}
```

#### Implementation sketch

```python
# backend/app/core/search_cache.py (to be created)

from pathlib import Path
from datetime import datetime, timedelta
import json

CACHE_DIR = Path.home() / ".contextportal" / "cache"
DEFAULT_TTL = 86400  # 24 hours

def get_cached(query: str) -> list[SearchResultItem] | None:
    """Return cached results if fresh, else None."""
    ...

def set_cached(query: str, results: list[SearchResultItem], ttl: int = DEFAULT_TTL) -> None:
    """Persist results to file cache."""
    ...
```

The `search()` function in `search.py` would gain an optional `use_cache: bool = True` parameter,
checking `get_cached()` before calling SerpAPI.

#### GitHub Issue

See the tracking issue: **"feat: Context URL caching for search_context"**
_(link to be added once issue is filed)_

---

## Testing

```bash
cd backend

# Unit tests (SerpAPI mocked — no real API calls)
uv run pytest tests/test_search.py -v

# MCP integration tests
uv run pytest tests/test_mcp.py -v

# Full suite
uv run pytest tests/ -v --cov=app --cov-report=term-missing
```
