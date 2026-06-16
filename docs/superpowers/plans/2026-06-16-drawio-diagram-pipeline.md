# Draw.io Diagram Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the main Systems Architecture Mermaid diagrams with diagrams.net/draw.io-maintained image assets that render in GitHub Pages and the generated PDF.

**Architecture:** Store editable `.drawio` files under `book/diagrams/` and rendered SVG images under `book/docs/public/diagrams/`. Add a `book:diagrams` build step that exports via the draw.io CLI when available and otherwise validates that committed SVG exports exist.

**Tech Stack:** diagrams.net `.drawio` XML, SVG image assets, Node.js ESM scripts, VitePress Markdown, Playwright PDF.

---

### Task 1: Add Diagram Export Script

**Files:**
- Create: `book/scripts/generate-diagrams.mjs`
- Modify: `book/package.json`
- Modify: `package.json`

- [ ] Add a script that scans `book/diagrams/*.drawio`.
- [ ] If `drawio` is available, export each `.drawio` to `book/docs/public/diagrams/<name>.svg`.
- [ ] If `drawio` is not available, verify the matching SVG exists and fail if it does not.
- [ ] Add `book:diagrams` at the root and run it before `book:build` and `book:pdf`.

### Task 2: Add Editable Draw.io Sources and Rendered Images

**Files:**
- Create: `book/diagrams/agentic-system-architecture.drawio`
- Create: `book/diagrams/agentic-rag-system.drawio`
- Create: `book/diagrams/open-personal-agent-architecture.drawio`
- Create: `book/diagrams/coding-agent-loop.drawio`
- Create: `book/diagrams/reference-architecture.drawio`
- Create: `book/docs/public/diagrams/agentic-system-architecture.svg`
- Create: `book/docs/public/diagrams/agentic-rag-system.svg`
- Create: `book/docs/public/diagrams/open-personal-agent-architecture.svg`
- Create: `book/docs/public/diagrams/coding-agent-loop.svg`
- Create: `book/docs/public/diagrams/reference-architecture.svg`

- [ ] Keep `.drawio` files editable in diagrams.net.
- [ ] Use accessible, high-contrast SVG exports for the book and PDF.

### Task 3: Replace Mermaid Blocks in Systems Architecture Chapters

**Files:**
- Modify: `book/docs/systems-architecture/agentic-system-architecture.md`
- Modify: `book/docs/systems-architecture/agentic-rag-systems.md`
- Modify: `book/docs/systems-architecture/open-personal-agent-architectures.md`
- Modify: `book/docs/systems-architecture/coding-agents.md`
- Modify: `book/docs/systems-architecture/reference-architecture.md`

- [ ] Replace Mermaid code blocks with Markdown image links to `/diagrams/*.svg`.
- [ ] Keep explanatory text around each diagram.

### Task 4: Document and Verify

**Files:**
- Modify: `README.md`
- Modify: `book/releases/Agentic-Systems-Patterns.pdf`

- [ ] Document how to edit and regenerate diagrams.
- [ ] Run `npm run book:diagrams`.
- [ ] Run `npm run book:pdf`.
- [ ] Run `npm run book:build`.
- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.

### Task 5: Commit and Deploy

**Files:**
- Stage only intended diagram, book, package, README, plan, and regenerated PDF changes.

- [ ] Exclude `.specstory/` session-history files.
- [ ] Commit with a Conventional Commit message.
- [ ] Push `main`.
- [ ] Watch GitHub Pages deployment.
- [ ] Verify a public diagram URL and PDF URL.
