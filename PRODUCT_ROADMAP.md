# ContextPortal Product & Release Roadmap

## 🎯 The North Star Principle
> **"One install. One setup. One MCP server. Zero credential handling."**

The goal of ContextPortal is not just to be a Python package, but to minimize the Time-To-Value (TTV) for an AI user. A developer should go from hearing about ContextPortal to having an AI agent fetch an authenticated webpage in under 2 minutes.

No API keys. No cloud accounts. No copying cookies. No manual MCP JSON configuration.

---

## 🚀 Release 0.1 — Developer Preview
**Status:** Completed ✅

The transition from "my local project" to "public developer tool".
- [x] Functional CLI (`login`, `fetch`, `mcp`)
- [x] Packaged as a standard Python wheel
- [x] Published to TestPyPI for validation
- [x] Published to PyPI (`uv tool install contextportal`)

**Target Audience**: Developers and early adopters.

---

## 🪄 Release 0.2 — "It Just Works" (The UX Update)
**Status:** Implemented & Verified ✅

Transforming the installation experience from 5 minutes to 30 seconds by hiding the complexity of JSON, virtual environments, and browser profiles.

- [x] **`contextportal setup`**: Auto-detects installed AI clients (Claude Desktop, Cursor, Antigravity) and safely injects the `context-portal` MCP server with atomic backups.
- [x] **`contextportal doctor` / `status`**: Diagnostics command to audit Python environment, PATH accessibility, browser profile, and client readiness.
- [x] Comprehensive test suite for client discovery, atomic updates, and idempotency.

---

## 🧠 Release 0.3 — Intelligent Retrieval
**Status:** Completed ✅

Hardened the retrieval pipeline with retry logic, SPA detection, PDF handling, and image stripping.

- [x] 4-tier fetch strategy: HTTP → Headless JS → Persistent Browser → Interactive Login
- [x] Retry with trim for flaky HTTP responses
- [x] SPA detection and Playwright fallback
- [x] PDF and binary content graceful handling

---

## 🔍 Release 0.4 — Autonomous Discovery (Search + Fetch Loop)
**Status:** Completed ✅

Adding a web search layer so AI agents can autonomously discover URLs before fetching them.
Agents no longer need to know the exact URL — they can search naturally and ContextPortal finds the right page.

- [x] **`search_context` MCP tool**: SerpAPI-powered web search returning ranked, agent-readable results
- [x] **`contextportal search <query>` CLI command**: Direct terminal discovery for debugging and dev workflows
- [x] **Autonomous search → fetch loop**: Agent calls `search_context`, picks the best URL, calls `fetch_context` — fully end-to-end
- [x] Full test suite (59/59 passing) with SerpAPI mocking
- [x] Configurable: `SERPAPI_API_KEY` loaded from `.env` or environment

**Future enhancement (planned for 0.5):** Context URL caching — remember previously discovered URLs per query so repeat agent calls skip the search step entirely. See [`docs/search-and-discovery.md`](docs/search-and-discovery.md) for full design notes.

---

## 📦 Release 0.5 — Binary Distribution
**Status:** Planned

Solving the "I don't want Python" problem.
- Standalone executables: `ContextPortal-Setup.exe`, `ContextPortal.dmg`, `ContextPortal.AppImage`.
- Python disappears entirely from the user's mental model.

---

## 🌐 Release 1.0 — Universal Agent Gateway
**Status:** Planned

The mature architecture where ContextPortal serves as the standard, secure, local bridge between any AI agent and the user's authenticated web identity.

