<p align="center">
  <h1 align="center">🔑 ContextPortal</h1>
  <p align="center">
    <strong>Give your AI agent access to authenticated web pages — without giving it your credentials.</strong>
  </p>
  <p align="center">
    <a href="https://context-portal.vercel.app/"><img src="https://img.shields.io/badge/Website-context--portal.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Website" /></a>
    <a href="https://pypi.org/project/contextportal/"><img src="https://img.shields.io/pypi/v/contextportal?style=for-the-badge&color=blue&logo=pypi&logoColor=white" alt="PyPI Version" /></a>
    <a href="https://github.com/NavadeepDj/ContextPortal/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" /></a>
  </p>
  <p align="center">
    <a href="https://context-portal.vercel.app/">🌐 Live Demo</a> · 
    <a href="#-see-it-in-action-demo-video">🎬 Demo Video</a> · 
    <a href="#-the-math-5-minutes-vs-3-seconds">The Math</a> · 
    <a href="#-quickstart">Quickstart</a> · 
    <a href="#-how-it-works">How It Works</a> · 
    <a href="#-security">Security</a> · 
    <a href="#-documentation">Docs</a>
  </p>
</p>

---

### 💬 The Reality of AI Agents Today

> 🤖 **Agent:** *"I can't read this ticket. It's behind an SSO login wall."*  
> 🤖 **Agent:** *"Please take 5 screenshots of the page, crop them, and paste the comments here."*  
> 👤 **You:** *"No way. Why am I doing homework for an AI?"*  
> 🔑 **ContextPortal:** *"Say less. Log in once in your browser; your agent retrieves the page forever."*

---

### 🎬 See It In Action (Demo Video)

<!-- <p align="center">
  <a href="https://github.com/NavadeepDj/ContextPortal/blob/main/ContextPortal_README_Demo.mp4">
    <img src="docs/assets/demo_preview.png" alt="ContextPortal Demo Video" width="100%" style="max-width: 820px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
  </a>
  <br />
  <em>▶️ <strong><a href="https://github.com/NavadeepDj/ContextPortal/blob/main/ContextPortal_README_Demo.mp4">Click to watch full demo video (ContextPortal_README_Demo.mp4)</a></strong></em>
</p> -->



https://github.com/user-attachments/assets/39335366-4e37-4f18-b48a-47015b84ade3


> 💡 **What's happening in this demo:**
> 1. **The Wall:** The AI agent attempts to read an internal, authenticated ticket. Instead of failing or begging for manual screenshots...
> 2. **The Rescue:** ContextPortal bridges your local authenticated browser session via MCP, rendering the page headless in ~2.5s.
> 3. **The Guarantee:** Clean, token-efficient ATX Markdown is delivered directly to the model. Zero cookies or credentials ever leave your machine.

---

### 🏛️ The 4 Pillars

| Pillar | What it Means for You |
|---|---|
| 🛑 **Stop feeding your AI screenshots.** | Copy-pasting and screenshotting is not an agent architecture. Give your agent autonomous retrieval. |
| 🔁 **Authenticate once. Retrieve context continuously.** | Complete SSO or MFA once in your local browser. ContextPortal reuses your session for every future agent request. |
| 🔐 **Your browser holds the session. Your agent gets the page. Zero cookies leaked.** | Cookies and tokens never leave your local disk. The agent receives clean, sanitized Markdown only. |
| 🎯 **Give your agent a retrieval tool, not a browser to operate.** | Browsers are complex tools for humans. Don't make agents click, type, and navigate. Give them an atomic `fetch_context` tool. |

---

### ⏱️ The Math: 5 Minutes vs 3 Seconds

| Step | ❌ The Screenshot Tax (Manual) | ✅ ContextPortal Flow (Autonomous) |
|---|---|---|
| **Human Action** | Open browser, find tab, screenshot, crop, paste, repeat | Zero. Your agent fetches in the background. |
| **Latency** | **5 to 7 minutes** of context switching per ticket | **~2.5 seconds** (Playwright session reuse + Readability) |
| **Agent Context** | Noisy OCR text, vision-token bloat, hallucinated tables | Clean, token-optimized ATX Markdown |
| **Security** | Accidental leaks of auth headers or personal bookmarks in screenshots | 0 cookies or session tokens ever exposed to the model |
| **Daily Impact** | ~50+ minutes lost across a typical 10-ticket workday | Completely frictionless and autonomous |

---

## ⚡ Quickstart - Connect ContextPortal to your AI
## 🔌 Connect ContextPortal to your AI

Three steps. Under two minutes.
ContextPortal works through the Model Context Protocol (MCP) and configures supported AI clients automatically.

### 1. Install
```text
┌──────────────────────────────────────────────┐
│  Connect your agent                          │
│                                              │
│  $ contextportal setup                       │
│                                              │
│  ✓ MCP server                                │
│  ✓ Browser profile                           │
│  ✓ AI client                                 │
│                                              │
│  Ready.                                      │
└──────────────────────────────────────────────┘
```

Onboarding shouldn't feel like wrestling with JSON files and virtual environments.  
It's three steps: **Install ContextPortal → Connect your agent → Give it the URL.**

---

### Step 1: Install ContextPortal

```bash
uv tool install contextportal
```

> Don't have `uv`? → `pip install contextportal` works too.

### 2. Auto-configure your AI agent
---

### Step 2: Connect your AI agent

```bash
contextportal setup
```

That's it! ContextPortal automatically detects **Claude Desktop**, **Cursor**, and **Antigravity IDE**, and safely registers the MCP server for you. No manual JSON editing required.
That's it! ContextPortal scans your system, detects installed AI agent clients, creates a safety backup, and registers the MCP server automatically.

> Run `contextportal doctor` anytime to check your system and MCP connection status.
> 🩺 Run `contextportal doctor` anytime to audit your system health and client connections.

### 3. Log into your private sites
---

```bash
contextportal login
```
### 🤖 Supported AI Clients

A Chrome window opens. Log into whatever private sites you want your agent to access — Jira, Confluence, internal wikis, Handshake, enterprise dashboards. Close the window when you're done. Your session lives locally on your machine and never leaves your computer.
ContextPortal provides zero-friction automatic setup for major AI developer tools, plus a standard manual fallback:

### 4. Ask your agent anything
| AI Client | Platform | Automatic Setup | Manual Config Path |
| :--- | :--- | :--- | :--- |
| **Cursor** | Win / Mac / Linux | `contextportal setup --client cursor` | `~/.cursor/mcp.json` |
| **Google Antigravity** | Win / Mac / Linux | `contextportal setup --client antigravity` | `~/.gemini/antigravity/mcp_config.json` |
| **Claude Desktop** | Win / Mac / Linux | `contextportal setup --client claude` | `%APPDATA%\Claude\` or `~/Library/Application Support/Claude/` |
| **VS Code (Cline / Roo / Copilot)** | Universal | Built-in MCP settings | `.vscode/mcp.json` or Extension settings |
| **Any Custom MCP Client** | Universal | STDIO transport | Standard JSON payload |

> *"Summarize the roadmap at https://internal.company.com/q3-roadmap"*
<details>
<summary><b>🛠️ Manual Configuration Fallback (Click to expand)</b></summary>

Your agent calls ContextPortal → ContextPortal retrieves the page through your authenticated session → clean, LLM-ready Markdown comes back.
If you prefer to configure your agent manually, add this to your client's MCP configuration:

### Manual Configuration (Optional)

If you prefer to configure your agent manually:

```json
{
  "mcpServers": {
    "context-portal": {
      "command": "contextportal",
      "args": ["mcp"]
    }
  }
}
```
</details>

**You're done. Go build something cool.**
---

### Step 3: Log into your private sites (once)

```bash
contextportal login
```

A clean browser opens. Log into your private tools — Jira, Confluence, internal wikis, GitHub enterprise, Handshake. Close the window when you're done. Your session stays locally on your machine.

---

### 🎉 You're ready. Now just give your agent the URL.

In your AI chat (Cursor, Claude, Antigravity, etc.):

> *"Summarize the roadmap at https://internal.company.com/q3-roadmap"*

Your agent calls ContextPortal → ContextPortal retrieves the page through your authenticated session → clean, token-optimized Markdown comes back.

**No screenshots. No copy-pasting. You're done.**

---

## 🧠 How It Works

```
                         Your AI Agent
                              │
                        fetch_context(url)
                              │
                              ▼
                      ┌───────────────┐
                      │ ContextPortal │
                      └───────┬───────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
        Public page?                   Protected page?
              │                               │
              ▼                               ▼
     Fast HTTP fetch                 Browser engine with
     (no browser needed)             your saved session
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
                     Clean Markdown
                              │
                              ▼
                       Back to Agent
```

ContextPortal operates a **two-tier retrieval engine** alongside **live web discovery via SerpApi**:

### 🛠️ Agent MCP Tools

| Tool | Purpose | Description |
|------|---------|-------------|
| 🔍 `search_context` | **Live Web Discovery** (powered by SerpApi) | Searches Google, Scholar, News, Maps, Jobs, and 100+ engines via SerpApi. Returns structured Markdown with links and direct answer boxes. |
| 📄 `fetch_context` | **Deep Content Retrieval** | Fetches public or login-protected pages (Jira, Confluence, Handshake, private dashboards) using local authenticated browser sessions. |

#### 🔄 Autonomous Search & Retrieve Workflow

```
User: "Get the latest status on my Handshake AI applications."
  │
  ├── 1. Agent calls search_context("Handshake student applications")
  │      └── SerpApi returns structured search results and direct portal link
  │
  ├── 2. Agent calls fetch_context("https://app.joinhandshake.com/stu/experiences")
  │      └── ContextPortal uses your local authenticated Chrome session
  │
  └── 3. Clean Markdown delivered to agent with ZERO leaked credentials!
```

| Tier | When | How | Speed |
|------|------|-----|-------|
| **SerpApi Search** | Discovery & finding URLs | Live search via 100+ SerpApi engines | ⚡ Fast |
| **HTTP Fetch** | Public pages, docs, blogs | Lightweight `httpx` request | ⚡ Fast |
| **Browser Engine** | Login-protected pages | Playwright with your local Chrome session | 🔐 Authenticated |

The agent doesn't know or care which tier was used. It just gets content.

---

## 🔐 Security

Security isn't a feature we bolted on. It's the reason ContextPortal exists.

### What ContextPortal does:
- ✅ Fetches page **content** and returns sanitized Markdown
- ✅ Keeps your browser session **local** on your machine
- ✅ Validates URLs against SSRF attacks (no `localhost`, no internal IPs)
- ✅ Identifies itself transparently as `ContextPortal/0.1.0` in HTTP requests

### What ContextPortal does NOT do:
- ❌ Send your cookies, tokens, or credentials to the AI agent
- ❌ Upload your session data anywhere
- ❌ Give the agent control over your browser
- ❌ Store or cache authenticated page content
- ❌ Require a cloud account or API key

> **Your credentials stay in your browser. ContextPortal gives your agent access to the content, not your credentials.**

Read more: [Security & Automation Philosophy](docs/security-and-automation-philosophy.md)

---

## 🛠️ CLI Reference

```
contextportal <command>
```

| Command | What it does |
|---------|-------------|
| `search <query>` | Search the web using SerpApi directly from your terminal |
| `fetch <url>` | Test-fetch a URL from the terminal (great for debugging) |
| `login` | Open Chrome to authenticate with your private sites |
| `mcp` | Start the MCP server (your AI agent runs this automatically) |

### Examples

```bash
# Search the web with SerpApi
contextportal search "Handshake AI Fellowship"

# Test that a protected page works
contextportal fetch https://internal.company.com/docs

# Log into your enterprise sites
contextportal login

# Start the MCP server (usually done by your AI agent)
contextportal mcp
```

---

## 🤝 Contributing

We'd love your help! ContextPortal is open source and contributions of all sizes are welcome.

### Getting Started

```bash
# Clone the repo
git clone https://github.com/NavadeepDj/ContextPortal.git
cd ContextPortal/backend

# Install dependencies (dev mode)
uv pip install -e ".[dev]"

# Install the browser engine
uv run playwright install chromium

# Run the test suite
uv run pytest
```

### Guidelines

1. **Keep it simple.** ContextPortal's power comes from doing one thing well. If a feature doesn't serve the core thesis — *authenticated retrieval for AI agents* — it probably doesn't belong here yet.

2. **Security first.** Every change that touches URL handling, browser sessions, or credential storage gets extra scrutiny. Read [`AGENT_RULES.md`](AGENT_RULES.md) before submitting security-adjacent PRs.

3. **Test your changes.** We maintain unit tests across the retriever, MCP server, API, and security modules. Run `uv run pytest` and make sure everything passes.

4. **Document decisions.** Major architectural choices get an ADR (Architecture Decision Record) in [`decisions/`](decisions/). If your change involves a meaningful trade-off, write one.

5. **Be a good internet citizen.** ContextPortal identifies itself transparently ([ADR-002](decisions/ADR-002-http-client-identity-and-user-agent.md)). We don't spoof headers, we don't bypass rate limits, and we don't pretend to be something we're not.

### Reporting Issues

Found a bug? Have a feature idea? [Open an issue](https://github.com/NavadeepDj/ContextPortal/issues). Please include:
- What you expected to happen
- What actually happened
- Your OS and Python version
- The output of `contextportal fetch <url>` if relevant

---

## 📚 Documentation

### Core
| Document | Description |
|----------|-------------|
| [**Product Thesis**](docs/PRODUCT_THESIS.md) | Why ContextPortal exists and the engineering philosophy behind it |
| [**Product Roadmap**](PRODUCT_ROADMAP.md) | Release plan from 0.1 → 1.0 |
| [**Agent Rules**](AGENT_RULES.md) | Security constraints and engineering rules for AI agents |

### Architecture Decisions
| ADR | Decision |
|-----|----------|
| [**ADR-001**](decisions/ADR-001-ephemeral-context.md) | Ephemeral context delivery (no caching of authenticated content) |
| [**ADR-002**](decisions/ADR-002-http-client-identity-and-user-agent.md) | Transparent application User-Agent identity |
| [**ADR-003**](decisions/ADR-003-transparent-browser-automation.md) | Using real Chrome for transparent browser automation |

### Deep Dives
| Document | Topic |
|----------|-------|
| [**Session Persistence**](docs/session-persistence-and-storage.md) | How browser sessions are stored and isolated |
| [**Security Philosophy**](docs/security-and-automation-philosophy.md) | The "context, not control" security model |
| [**User-Agent Policy**](docs/user-agent-and-client-identity/README.md) | Why ContextPortal identifies itself honestly |
| [**OIDC Trusted Publishing**](docs/publishing-and-releases/understanding-oidc.md) | Zero-secret automated PyPI release architecture |
| [**MCP Integration**](docs/agent-interface-mcp/) | How the Model Context Protocol server works |
| [**API Usage**](docs/api-usage.md) | Using the FastAPI REST endpoint directly |

---

## 📄 License

MIT — do whatever you want with it. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with 🧠 by <a href="https://github.com/NavadeepDj">NavadeepDj</a></sub>
</p>
