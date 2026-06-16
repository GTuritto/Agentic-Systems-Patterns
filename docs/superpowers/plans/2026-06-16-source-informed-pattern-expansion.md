# Source-Informed Pattern Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a source-informed pattern selection section that turns the reviewed external agentic-pattern references into practical book chapters.

**Architecture:** The book remains a VitePress reference with Markdown chapters, generated code bundles, and generated PDF output. The new section adds synthesis chapters rather than copying external text, and it links to reviewed sources through a dedicated source map page.

**Tech Stack:** VitePress, Markdown, Node.js PDF generation with Playwright, existing npm scripts.

---

## File Structure

- Create `book/docs/pattern-selection/choosing-the-right-pattern.md`: pattern selection guide and trade-off matrix.
- Create `book/docs/pattern-selection/prompt-chaining-and-gates.md`: fixed chain pattern with typed gates between LLM steps.
- Create `book/docs/pattern-selection/routing-and-handoffs.md`: classifier/router and state handoff pattern.
- Create `book/docs/pattern-selection/circuit-breakers-fallbacks-replay.md`: reliability controls for loops, tools, and multi-agent workflows.
- Create `book/docs/pattern-selection/source-map.md`: curated source review and mapping to book chapters.
- Modify `book/docs/.vitepress/config.ts`: add the new section to the sidebar.
- Modify `book/scripts/generate-pdf.mjs`: include the new chapters in the PDF.
- Modify `book/docs/index.md`: mention the new selection section from the landing page.

## Task 1: Add Pattern Selection Chapters

**Files:**
- Create: `book/docs/pattern-selection/choosing-the-right-pattern.md`
- Create: `book/docs/pattern-selection/prompt-chaining-and-gates.md`
- Create: `book/docs/pattern-selection/routing-and-handoffs.md`
- Create: `book/docs/pattern-selection/circuit-breakers-fallbacks-replay.md`
- Create: `book/docs/pattern-selection/source-map.md`

- [ ] **Step 1: Create the `pattern-selection` directory**

Run: `mkdir -p book/docs/pattern-selection`

Expected: directory exists.

- [ ] **Step 2: Add the chapter Markdown files**

Use prose that synthesizes the reviewed sources. Do not copy long passages. Include direct external links only in the source map and short source notes in chapters where useful.

- [ ] **Step 3: Review chapter links**

Run: `rg "https://|\\.\\.\\/|\\]\\(" book/docs/pattern-selection`

Expected: internal links are relative and source links are complete HTTPS URLs.

## Task 2: Wire Navigation and PDF

**Files:**
- Modify: `book/docs/.vitepress/config.ts`
- Modify: `book/scripts/generate-pdf.mjs`
- Modify: `book/docs/index.md`

- [ ] **Step 1: Add sidebar section**

Insert a new `Pattern Selection` sidebar group after `Foundations` and before `Control Loops`.

- [ ] **Step 2: Add PDF chapters**

Insert the new chapters after `Foundations / Context Engineering` in `book/scripts/generate-pdf.mjs`.

- [ ] **Step 3: Update home page summary**

Update the landing page tagline/features so readers can find the new selection guide and source map.

## Task 3: Verify Book Output

**Files:**
- Generated: `book/releases/Agentic-Systems-Patterns.pdf`
- Generated: `book/docs/public/releases/Agentic-Systems-Patterns.pdf`

- [ ] **Step 1: Build diagrams and content**

Run: `npm run book:diagrams`

Expected: diagram validation passes, with or without the local draw.io CLI.

- [ ] **Step 2: Generate PDF**

Run: `npm run book:pdf`

Expected: PDF is written to `book/releases/Agentic-Systems-Patterns.pdf` and deploy copy is updated.

- [ ] **Step 3: Build VitePress site**

Run: `npm run book:build`

Expected: VitePress build passes.

- [ ] **Step 4: Run repository checks**

Run: `npm test`

Expected: tests pass.

Run: `npm run typecheck`

Expected: typecheck passes.

## Task 4: Commit and Push

**Files:**
- All files changed in Tasks 1-3.

- [ ] **Step 1: Inspect worktree**

Run: `git status --short`

Expected: only intended book, plan, and generated PDF files are staged later. Existing `.specstory` changes remain unstaged.

- [ ] **Step 2: Commit**

Run: `git add docs/superpowers/plans/2026-06-16-source-informed-pattern-expansion.md book/docs book/scripts/generate-pdf.mjs book/releases/Agentic-Systems-Patterns.pdf`

Run: `git commit -m "feat(book): add source-informed pattern selection guide"`

Expected: commit succeeds.

- [ ] **Step 3: Push**

Run: `git push origin main`

Expected: push succeeds and GitHub Pages deployment starts.

## Self-Review

- Spec coverage: The plan adds the approved new section, advanced pattern chapters, source map, sidebar, PDF output, and verification.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: This is a documentation and build wiring change; file paths match the existing VitePress/PDF structure.
