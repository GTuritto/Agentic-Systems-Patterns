---
title: Publishing and Releases
---

# Publishing and Releases

The book is published as an Astro GitHub Pages site and as a downloadable PDF. The PDF is a companion artifact; the online reader is the primary product.

## Public URLs

- Book site: <https://gturitto.github.io/Agentic-Systems-Patterns/>
- PDF: <https://gturitto.github.io/Agentic-Systems-Patterns/releases/Agentic-Systems-Patterns.pdf>
- Repository: <https://github.com/GTuritto/Agentic-Systems-Patterns>

## Release Artifacts

The checked-in PDF lives at:

```text
book/releases/Agentic-Systems-Patterns.pdf
```

The GitHub Pages deployment publishes the same PDF at:

```text
/releases/Agentic-Systems-Patterns.pdf
```

Each `Publish Book` workflow run also uploads the PDF as a workflow artifact. Use that artifact when you need to inspect the exact PDF produced by a specific CI run.

Before tagging or announcing a release, use the [Release Readiness Checklist](./release-readiness-checklist.md). Use [Release Notes](./release-notes.md) as the reader-facing summary of what changed and what evidence supports the release.

## Local Publishing Commands

From the repository root:

```sh
npm test
npm run typecheck
npm run native-examples:validate
npm run native-examples:smoke:langgraph
npm run book:build
npm run site:build
npm run site:parity
npm run book:pdf
```

These commands cover runnable examples, TypeScript contracts, native framework slices, generated chapters, diagrams, site routes, internal links, and the downloadable PDF.

Use `npm run site:dev` for the primary local reader preview.

Use `npm run book:start` only for the VitePress authoring preview.

The main outputs are:

```text
site/dist
book/releases/Agentic-Systems-Patterns.pdf
```

`site/dist` is deployed to GitHub Pages. The Astro build uses the base path `/Agentic-Systems-Patterns/`.

The lower-level book pipeline commands are:

```sh
npm run book:content
npm run book:diagrams
```

Run lower-level commands only when you are editing generated chapters, source bundles, or diagram exports directly. A release should still pass the full command set above.

## Deployment

Deployment is handled by:

```text
.github/workflows/publish-book.yml
```

The workflow runs on every push to `main` and can also be triggered manually with `workflow_dispatch`. It builds the PDF, validates the VitePress authoring build, builds the Astro site, runs Astro parity/link checks, and deploys `site/dist`.

## License

This book/reference and its examples are licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) (`CC-BY-SA-4.0`).

When reusing or adapting the material, preserve attribution and share adapted material under the same license.
