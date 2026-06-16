# Book Code Interleaving Design

## Goal

Expand the published book so each active pattern chapter includes deeper explanatory content, embedded code excerpts, source links, and downloadable code bundles. The same content must work in GitHub Pages and in the generated PDF.

## Audience

The primary reader is an engineer using the book as a practical reference. They should be able to read the concept, inspect the most relevant code inside the chapter, and download the complete source folder from the deployed site.

## Design

The book will use a generated chapter layer driven by a manifest. The manifest maps each active book chapter to its source folder, source URL, optional runnable commands, and representative code files.

The generator will write expanded Markdown pages under `book/docs`. Each generated chapter will use this structure:

1. Title and summary
2. Intent
3. Use When
4. Avoid When
5. Architecture or flow, when available from the source README
6. Implementation Notes
7. Failure Modes
8. Code Walkthrough
9. Source Code
10. Download
11. Related Patterns, when available

The generator will reuse sections from the source pattern README when those sections exist. If a source README is short or missing a section, the generator will fill the section from manifest metadata. This keeps the book consistent while still preserving hand-written source material.

## Code Interleaving

Book pages will contain ordinary fenced code blocks. This keeps the feature compatible with VitePress, MarkdownIt, and the Playwright PDF renderer.

Each chapter will embed curated excerpts from one or more representative files. The excerpt should be long enough to show the pattern but bounded so the PDF remains readable. If a file is truncated, the chapter will state that the full source is available in the download bundle and repository link.

## Downloads

The generator will create one ZIP bundle per active pattern under:

```text
book/docs/public/downloads/
```

After deployment, those bundles will be available at:

```text
https://gturitto.github.io/Agentic-Systems-Patterns/downloads/<bundle-name>.zip
```

The bundles are generated artifacts. They do not need to be committed, but the checked-in book pages may link to their deployed paths because the deployment pipeline generates them before the VitePress build.

## Publishing Pipeline

The `book` package will gain a content-generation script. `book:build` and `book:pdf` will run content generation before building the site or PDF, so GitHub Pages and the PDF use the same expanded chapters.

The existing GitHub Actions workflow can remain structurally the same because it already calls:

```sh
npm run book:pdf
npm run book:build
```

## Scope

This change expands active chapters. Deprecated chapters remain short historical references and link to the deprecated archive.

## Validation

Validation requires:

- `npm run book:content`
- `npm run book:pdf`
- `npm run book:build`
- `npm test`
- `npm run typecheck`

The generated site must include download links under `/downloads/`, and the generated PDF must include embedded code excerpts.
