# Deeper PDF-Informed Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the remaining high-value source-informed chapters from the uploaded PDFs without copying or distributing source material.

**Architecture:** Extend the existing VitePress book with original synthesis chapters. Keep domain-specific and UI/computer-use content in the Systems Architecture section, and keep framework/cost guidance in Agent Engineering Practice and Pattern Selection.

**Tech Stack:** VitePress Markdown, existing Node.js PDF generator, GitHub Pages deployment.

---

## File Structure

- Create `book/docs/systems-architecture/computer-use-agents.md`
- Create `book/docs/systems-architecture/domain-agent-architectures.md`
- Create `book/docs/agent-engineering-practice/framework-selection.md`
- Create `book/docs/pattern-selection/resource-aware-agent-design.md`
- Modify `book/docs/.vitepress/config.ts`
- Modify `book/scripts/generate-pdf.mjs`
- Modify `book/docs/pattern-selection/source-map.md`
- Modify `book/docs/index.md`

## Task 1: Add Original Synthesis Chapters

- [ ] Add `Computer-Use Agents` to Systems Architecture.
- [ ] Add `Domain Agent Architectures` to Systems Architecture.
- [ ] Add `Framework Selection` to Agent Engineering Practice.
- [ ] Add `Resource-Aware Agent Design` to Pattern Selection.

## Task 2: Wire Book Outputs

- [ ] Add the new chapters to the sidebar.
- [ ] Add the new chapters to the PDF manifest.
- [ ] Update the home page feature copy.
- [ ] Update the source map's local-PDF coverage note to include these additions.

## Task 3: Verify

- [ ] Run `npm run book:pdf`.
- [ ] Run `npm run book:build`.
- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Confirm no local PDF paths or copied source filenames leak into book docs.

## Task 4: Commit and Publish

- [ ] Commit with `feat(book): expand pdf-informed architecture guidance`.
- [ ] Push to `main`.
- [ ] Verify GitHub Pages deployment and live URLs.

## Self-Review

- This plan adds original synthesis only.
- The uploaded PDFs remain outside the repository.
- The new chapters fit existing book sections and avoid repeating existing content.
