# Hands-On Labs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a guided Hands-On Labs section that turns the existing runnable examples into a practical learning path.

**Architecture:** Add hand-written VitePress chapters under `book/docs/hands-on-labs/`. Each lab links to the existing generated pattern chapters, source bundles, and root npm commands instead of duplicating implementations. Update the sidebar, homepage, and PDF manifest so the labs publish to both GitHub Pages and the offline PDF.

**Tech Stack:** VitePress Markdown, existing TypeScript/Python example folders, npm scripts, Playwright PDF generation.

---

### Task 1: Add Lab Chapters

**Files:**
- Create: `book/docs/hands-on-labs/index.md`
- Create: `book/docs/hands-on-labs/lab-01-tool-using-agent.md`
- Create: `book/docs/hands-on-labs/lab-02-agent-loop-and-planning.md`
- Create: `book/docs/hands-on-labs/lab-03-agentic-rag.md`
- Create: `book/docs/hands-on-labs/lab-04-a2a-communication.md`
- Create: `book/docs/hands-on-labs/lab-05-multi-agent-supervisor.md`
- Create: `book/docs/hands-on-labs/lab-06-observability-and-evals.md`

- [ ] **Step 1: Create the lab index**

The index must explain the lab sequence and link to all six labs. It must tell readers to run `npm install`, `npm test`, and `npm run typecheck` from the repository root.

- [ ] **Step 2: Create each lab page**

Each lab page must include:

- Objective
- What you will use
- Setup
- Run it
- Inspect the code
- Change one thing
- Expected result
- Production extension
- Related chapters
- Download link

- [ ] **Step 3: Keep labs grounded in existing commands**

Use these commands:

```sh
npm run tool-using-agent
npm run plan:test
npm run plan:run -- "Compute average of [1,2,3,4]"
npm run plan:py
npm run a2a:test
npm run a2a:run
npm run hierarchical-agent
npm run mcp:test
npm test
```

For labs where the current source is more illustrative than executable, state that plainly and point to the source folder and pattern chapter.

### Task 2: Wire Labs Into the Book

**Files:**
- Modify: `book/docs/.vitepress/config.ts`
- Modify: `book/scripts/generate-pdf.mjs`
- Modify: `book/docs/index.md`

- [ ] **Step 1: Add sidebar section**

Add a `Hands-On Labs` section after `Agent Engineering Practice` and before `Control Loops`.

- [ ] **Step 2: Add labs to PDF manifest**

Insert the lab chapters after Agent Engineering Practice and before Control Loops so the PDF reads like a learning path before the full reference catalog resumes.

- [ ] **Step 3: Update homepage**

Add a homepage feature that points readers to guided labs and update the hero action or feature text so the labs are discoverable.

### Task 3: Verify and Publish

**Files:**
- Modify: `book/releases/Agentic-Systems-Patterns.pdf`
- Modify: `book/docs/public/releases/Agentic-Systems-Patterns.pdf`

- [ ] **Step 1: Build content and PDF**

Run:

```sh
npm run book:content
npm run book:pdf
npm run book:build
```

Expected result: all commands pass.

- [ ] **Step 2: Run tests**

Run:

```sh
npm test
npm run typecheck
```

Expected result: all commands pass.

- [ ] **Step 3: Scan for private PDF paths**

Run the private path scan used in prior work and confirm no local source PDF paths or labels appear in `book/docs` or this plan.

- [ ] **Step 4: Commit and deploy**

Stage only intended files, leave `.specstory/` unstaged, commit with:

```sh
git commit -m "feat(book): add hands-on labs"
```

Push to `origin main`, watch the `Publish Book` workflow, and confirm representative live lab URLs return `HTTP/2 200`.
