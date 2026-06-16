# Book Code Interleaving Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate expanded book chapters with embedded code excerpts and downloadable source bundles for every active pattern.

**Architecture:** Add a manifest-driven generator under `book/scripts`. The generator writes Markdown chapters into `book/docs`, creates ZIP bundles under `book/docs/public/downloads`, and is invoked before the site build and PDF generation.

**Tech Stack:** Node.js ESM scripts, VitePress, MarkdownIt, Playwright PDF, GitHub Pages.

---

### Task 1: Add Book Content Manifest

**Files:**
- Create: `book/scripts/pattern-manifest.mjs`

- [ ] Define active chapter metadata with title, chapter path, source folder, summary, use/avoid text, commands, and representative code files.
- [ ] Include all active VitePress chapters from the sidebar except `intro.md`, `index.md`, and deprecated historical content.
- [ ] Keep deprecated content out of the active manifest.

### Task 2: Add Chapter and Bundle Generator

**Files:**
- Create: `book/scripts/generate-pattern-pages.mjs`
- Modify: `.gitignore`

- [ ] Read the manifest.
- [ ] Reuse sections from each source `README.md` when present.
- [ ] Generate expanded Markdown pages with source links, code excerpts, commands, and download links.
- [ ] Create one ZIP bundle per source folder under `book/docs/public/downloads`.
- [ ] Ignore generated download ZIP files in `.gitignore`.

### Task 3: Wire Generation Into Publishing

**Files:**
- Modify: `book/package.json`
- Modify: `package.json`
- Modify: `README.md`

- [ ] Add `content` script to the book package.
- [ ] Run content generation before `vitepress build`.
- [ ] Run content generation before PDF generation.
- [ ] Add root `book:content` script.
- [ ] Document the generated chapter/download flow in the root README.

### Task 4: Regenerate and Verify

**Files:**
- Modify: generated `book/docs/**/*.md`
- Modify: `book/releases/Agentic-Systems-Patterns.pdf`

- [ ] Run `npm run book:content`.
- [ ] Run `npm run book:pdf`.
- [ ] Run `npm run book:build`.
- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Review `git diff --stat` and ensure only intended files changed.

### Task 5: Commit

**Files:**
- Stage only intended book, README, package, spec, and plan changes.

- [ ] Exclude `.specstory/` session-history files.
- [ ] Commit with a Conventional Commit message.
