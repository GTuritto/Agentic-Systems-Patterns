# Publishing Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the book as a digital publication with reader guidance, clearer release information, a better PDF front matter, and a downloadable PDF workflow artifact.

**Architecture:** Add hand-written publishing pages under `book/docs/publishing/`. Update the PDF generator to render a cover with edition metadata and an auto-generated table of contents from the existing chapter manifest. Update GitHub Actions to upload the generated PDF as a workflow artifact in addition to publishing it through GitHub Pages.

**Tech Stack:** VitePress Markdown, Playwright PDF generation, GitHub Actions Pages workflow.

---

### Task 1: Add Publishing Pages

**Files:**
- Create: `book/docs/publishing/how-to-read.md`
- Create: `book/docs/publishing/publishing-and-releases.md`

- [ ] **Step 1: Add a reader guide**

Document the recommended paths for first-time readers, experienced engineers, and readers who want only the labs.

- [ ] **Step 2: Add publishing and release guidance**

Document the live site, PDF URL, checked-in PDF, workflow artifact, local commands, and split MIT code / CC BY-NC-SA 4.0 content licenses.

### Task 2: Improve PDF Front Matter

**Files:**
- Modify: `book/scripts/generate-pdf.mjs`

- [ ] **Step 1: Add edition metadata**

Add a stable edition label, site URL, PDF URL, repository URL, and license to the cover.

- [ ] **Step 2: Add generated table of contents**

Generate a PDF table of contents from the existing `chapters` array before rendering chapter content.

### Task 3: Wire Publishing Polish Into Site And Workflow

**Files:**
- Modify: `book/docs/.vitepress/config.ts`
- Modify: `book/docs/index.md`
- Modify: `README.md`
- Modify: `.github/workflows/publish-book.yml`

- [ ] **Step 1: Add publishing sidebar links**

Add a `Publishing` sidebar section for the new pages.

- [ ] **Step 2: Surface reader guide on homepage and README**

Add links to the reader guide and publishing page.

- [ ] **Step 3: Upload PDF artifact in CI**

Add `actions/upload-artifact@v4` after the PDF/build steps so each workflow run includes a downloadable PDF artifact.

### Task 4: Regenerate, Verify, Commit, Deploy

**Files:**
- Modify: `book/releases/Agentic-Systems-Patterns.pdf`
- Modify: `book/docs/public/releases/Agentic-Systems-Patterns.pdf`

- [ ] **Step 1: Run local builds**

Run:

```sh
npm run book:pdf
npm run book:build
npm test
npm run typecheck
```

- [ ] **Step 2: Verify scans and live deployment**

Check for no private local PDF paths, render sample PDF pages, commit, push, and verify the `Publish Book` workflow succeeds.
