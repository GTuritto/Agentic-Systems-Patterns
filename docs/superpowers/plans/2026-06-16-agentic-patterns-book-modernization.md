# Agentic Patterns Book Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the repository into a modern agentic patterns book/reference with deprecated archives, updated pattern chapters, VitePress publishing, GitHub Pages deployment, and a repo-local PDF release path.

**Architecture:** Keep runnable pattern examples at the repository root, add `book/` as the publishable VitePress source, and move weak or obsolete pattern folders into `deprecated/`. `Agentic_Patterns.md` remains the source index; `book/docs/` is the public reference site.

**Tech Stack:** Markdown, TypeScript, Python, npm scripts, VitePress, GitHub Actions, GitHub Pages, MIT code license, Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (`CC-BY-NC-SA-4.0`) content license.

---

## Implementation Note

The original design considered Docusaurus, but Docusaurus SSR builds failed in this environment. The implementation uses VitePress because it builds successfully, supports Markdown-first authoring, local search, sidebars, GitHub Pages deployment, and the same PDF release path.

## File Structure

- `Agentic_Patterns.md`: sectioned active/deprecated pattern index.
- `README.md`: repository entry point with book, site, PDF, and license instructions.
- `deprecated/`: archived pattern folders removed from the active learning path.
- `book/package.json`: VitePress package and build scripts.
- `book/docs/.vitepress/config.ts`: VitePress site configuration, sidebar, base URL, search, and footer.
- `book/docs/`: publishable manuscript pages.
- `book/releases/`: checked-in release artifact path for `Agentic-Systems-Patterns.pdf`.
- `.github/workflows/publish-book.yml`: GitHub Pages continuous deployment workflow.
- `LICENSE`: repository code license notice pointing to MIT.
- `LICENSE-CONTENT.md`: repository content license notice pointing to CC BY-NC-SA 4.0.

## Tasks

- [x] Create `book/` VitePress publishing skeleton.
- [x] Configure GitHub Pages deployment to publish `book/docs/.vitepress/dist`.
- [x] Add root scripts: `book:install`, `book:start`, `book:build`, and `book:serve`.
- [x] Move deprecated patterns into `deprecated/` and keep archive links in the index.
- [x] Add active modern pattern folders: Agent Loop, Goals and State, Skills, Structured Output, Evaluator-Optimizer, Durable Workflow, Observability and Evals, Mastra Runtime, and CrewAI Flows and Crews.
- [x] Add matching `book/docs/` pages for the public reference.
- [x] Deepen A2A and MCP-first tool-use README content.
- [x] Rewrite `Agentic_Patterns.md` into the modern sectioned catalog.
- [x] Update publishing and license references for MIT code and `CC-BY-NC-SA-4.0` content.

## Verification Commands

Run from the repository root:

```bash
npm test
npm run typecheck
npm audit --omit=dev
npm audit --prefix book --omit=dev
npm run book:build
```

Expected results:

- Repository tests pass.
- TypeScript exits with code 0.
- Root production audit reports `found 0 vulnerabilities`.
- Book production audit reports `found 0 vulnerabilities`.
- VitePress builds the static site into `book/docs/.vitepress/dist`.

## GitHub Pages Setup

In the GitHub repository settings:

1. Open `Settings`.
2. Open `Pages`.
3. Set source to **GitHub Actions**.
4. Push to `main`.

The workflow publishes to:

```text
https://gturitto.github.io/Agentic-Systems-Patterns/
```

## PDF Release Path

Offline PDFs should be stored at:

```text
book/releases/Agentic-Systems-Patterns.pdf
```

The current implementation creates the release folder and documentation. PDF generation can be automated later from the built VitePress site.
