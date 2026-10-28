# Contributing to ContextPortal

Thanks for contributing! This guide covers how to run the project locally and what each CI check does.

---

## Project structure

```
contextportal/
├── backend/          # Python package — MCP server, CLI, retrieval engine
└── frontend/         # Next.js marketing site (landing page)
```

---

## Running locally

### Backend

Requires [uv](https://docs.astral.sh/uv/).

```bash
cd backend
uv sync --all-extras          # install dependencies
uv run pytest -v              # run tests
uv run ruff check app/ tests/ # lint
uv run mypy app/ tests/       # type check
```

To install the CLI locally from source:

```bash
uv tool install --editable .
contextportal --help
```

### Frontend

Requires [Node.js 20+](https://nodejs.org/) and [pnpm](https://pnpm.io/).

```bash
cd frontend
pnpm install      # install dependencies
pnpm dev          # dev server at http://localhost:3000
pnpm lint         # ESLint
pnpm build        # production build
```

---

## CI checks

Every pull request runs the following checks. All must pass before merging.

| Check | What it does |
|---|---|
| **Lint & Type Check** | Ruff (Python linter) + Mypy (static type checker) on `backend/` |
| **Test (ubuntu / windows)** | Full pytest suite on both OSes — catches platform-specific bugs |
| **Build & Package Validation** | `uv build` + `twine check` — ensures the pip package is valid before release |
| **Frontend CI** | ESLint + `pnpm build` — ensures the landing page compiles without errors |
| **Dependency Vulnerability Audit** | pip-audit (Python CVEs) + pnpm audit (JS CVEs at high severity) |
| **CodeQL (python + js)** | SAST scan for SQL injection, XSS, path traversal, and similar issues |
| **Detect Secrets (gitleaks)** | Scans full git history for leaked API keys, tokens, and passwords |
| **Block High-Severity Deps** | Compares dependency graph before/after the PR; blocks new high-severity CVEs |

Dependabot opens weekly PRs to keep pip, npm, and GitHub Actions dependencies up to date.

### Running security checks locally

```bash
# Python vulnerabilities
cd backend
uv run --with pip-audit pip-audit

# JS vulnerabilities
cd frontend
pnpm audit --audit-level high

# Secret scan (requires gitleaks installed)
gitleaks detect --source .
```

---

## Pull request guidelines

- Keep PRs focused — one logical change per PR.
- Backend changes need tests. Run `pytest -v` before pushing.
- Frontend changes: run `pnpm lint && pnpm build` locally before pushing.
- For significant changes, open an issue first to align on direction.
