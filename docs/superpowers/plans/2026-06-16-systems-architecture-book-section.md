# Systems Architecture Book Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Systems Architecture area to the published book with chapters for system composition, Agentic RAG, open personal agents, coding agents, ADRs, and a reference architecture.

**Architecture:** The new section will be static VitePress Markdown pages under `book/docs/systems-architecture/`. The sidebar in `book/docs/.vitepress/config.ts` and the PDF chapter list in `book/scripts/generate-pdf.mjs` will be updated manually because these chapters are conceptual architecture material, not generated source-pattern pages.

**Tech Stack:** VitePress Markdown, Mermaid diagrams, existing Playwright PDF generation.

---

### Task 1: Add Systems Architecture Chapters

**Files:**
- Create: `book/docs/systems-architecture/agentic-system-architecture.md`
- Create: `book/docs/systems-architecture/agentic-rag-systems.md`
- Create: `book/docs/systems-architecture/open-personal-agent-architectures.md`
- Create: `book/docs/systems-architecture/coding-agents.md`
- Create: `book/docs/systems-architecture/architecture-decision-records.md`
- Create: `book/docs/systems-architecture/reference-architecture.md`

- [ ] Write each chapter with frontmatter, clear intent, architecture guidance, operational concerns, failure modes, and links to related chapters.
- [ ] Include Mermaid architecture diagrams where useful.
- [ ] Include source/reference links for OpenClaw, Hermes Agent, OpenHands, AutoGPT, Codex, Cursor, and Claude Code without making the chapter vendor-only.

### Task 2: Wire Navigation and PDF Order

**Files:**
- Modify: `book/docs/.vitepress/config.ts`
- Modify: `book/scripts/generate-pdf.mjs`

- [ ] Add a new `Systems Architecture` sidebar section between `Multi-Agent Systems` and `Production Runtime`.
- [ ] Add all six chapter paths to the PDF `chapters` list in the same order.

### Task 3: Update Catalog and README

**Files:**
- Modify: `Agentic_Patterns.md`
- Modify: `README.md`
- Modify: `book/docs/intro.md`

- [ ] Add Systems Architecture to the book map and publishing description.
- [ ] Link the new architecture chapters from the canonical pattern catalog.
- [ ] Keep deprecated content unchanged.

### Task 4: Regenerate and Verify

**Files:**
- Modify: `book/releases/Agentic-Systems-Patterns.pdf`

- [ ] Run `npm run book:pdf`.
- [ ] Run `npm run book:build`.
- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Review `git diff --stat`.

### Task 5: Commit and Deploy

**Files:**
- Stage only intended book, docs, catalog, README, and plan changes.

- [ ] Exclude `.specstory/` session-history files.
- [ ] Commit with a Conventional Commit message.
- [ ] Push `main`.
- [ ] Watch the `Publish Book` workflow.
- [ ] Verify the public site and PDF URLs.
