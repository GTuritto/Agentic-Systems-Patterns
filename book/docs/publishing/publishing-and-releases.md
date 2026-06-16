---
title: Publishing and Releases
---

# Publishing and Releases

The book is published as a GitHub Pages site and as a downloadable PDF.

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

## Local Publishing Commands

From the repository root:

```sh
npm run book:content
npm run book:diagrams
npm run book:pdf
npm run book:build
```

Use `npm run book:start` for local preview.

## Deployment

Deployment is handled by:

```text
.github/workflows/publish-book.yml
```

The workflow runs on every push to `main` and can also be triggered manually with `workflow_dispatch`.

## License

This book/reference and its examples are licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) (`CC-BY-SA-4.0`).

When reusing or adapting the material, preserve attribution and share adapted material under the same license.
