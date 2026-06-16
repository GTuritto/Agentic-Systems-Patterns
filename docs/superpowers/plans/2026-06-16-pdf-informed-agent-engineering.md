# PDF-Informed Agent Engineering Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Agent Engineering Practice section informed by the uploaded PDFs while keeping all prose original and source material out of the repository.

**Architecture:** The book stays as VitePress Markdown plus generated PDF. New chapters synthesize recurring topics from the PDFs: lifecycle, toolkit choices, evaluation-driven development, security, sandboxing, and UX/trust.

**Tech Stack:** VitePress, Markdown, Node.js PDF generation with Playwright, existing npm scripts.

---

## File Structure

- Create `book/docs/agent-engineering-practice/agent-development-lifecycle.md`
- Create `book/docs/agent-engineering-practice/agent-engineer-toolkit.md`
- Create `book/docs/agent-engineering-practice/evaluation-driven-agent-development.md`
- Create `book/docs/agent-engineering-practice/agent-security-and-sandboxing.md`
- Create `book/docs/agent-engineering-practice/agent-ux-and-human-trust.md`
- Modify `book/docs/.vitepress/config.ts`
- Modify `book/scripts/generate-pdf.mjs`
- Modify `book/docs/pattern-selection/source-map.md`
- Modify `book/docs/index.md`

## Task 1: Add Agent Engineering Practice Chapters

- [ ] Create the new directory.
- [ ] Add five original Markdown chapters.
- [ ] Link chapters to existing foundations, runtime, security, memory, and systems architecture sections.

## Task 2: Wire Navigation and PDF

- [ ] Add an `Agent Engineering Practice` sidebar group after `Pattern Selection`.
- [ ] Add the new chapters to `book/scripts/generate-pdf.mjs` after the pattern selection chapters.
- [ ] Update the home page feature list to mention lifecycle, evals, security, and UX.

## Task 3: Update Source Map

- [ ] Add a `Local PDF References Reviewed` section.
- [ ] Mention only title, author, and high-level themes.
- [ ] Do not link to local files, copy passages, or distribute the PDFs.

## Task 4: Verify and Publish

- [ ] Run `npm run book:pdf`.
- [ ] Run `npm run book:build`.
- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Commit with `feat(book): add pdf-informed agent engineering practice`.
- [ ] Push to `main` and verify GitHub Pages deployment.

## Self-Review

- The plan keeps copyrighted PDFs out of the repository.
- The plan adds original synthesis, not excerpts.
- The plan fits the existing book structure and PDF pipeline.
