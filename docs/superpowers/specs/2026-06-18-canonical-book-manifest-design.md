# Canonical Book Manifest Design

## Goal

Create one canonical chapter registry so the website and PDF contain the same complete book in the same editorial order.

## Scope

This change covers:

- chapter and section metadata;
- VitePress sidebar generation;
- PDF chapter generation;
- complete site/PDF parity;
- authored versus generated ownership;
- structural validation.

It does not rewrite chapters, repair labs, reconcile the root pattern catalog, or regenerate the final release PDF.

## Architecture

Add `book/scripts/book-manifest.mjs` as the source of truth for book structure.

Each section defines:

- stable section ID;
- displayed section title;
- canonical order;
- whether it appears in the main sidebar.

Each chapter defines:

- stable chapter ID;
- title;
- relative Markdown path;
- section ID;
- ownership: `authored` or `generated`;
- sidebar inclusion;
- PDF inclusion.

All unique manuscript chapters included on the website will also be included in the PDF. “Start Here” remains a curated navigation group whose links reference existing chapters without creating duplicate PDF entries.

`book/scripts/pattern-manifest.mjs` remains responsible only for generating pattern-reference content and download bundles.

## Canonical Order

1. Start Here and Pattern Selection
2. Foundations
3. Agent Engineering Practice
4. Control Loops
5. Memory and Knowledge
6. Tools, Skills, and Protocols
7. Multi-Agent Systems
8. Systems Architecture
9. Production Runtime
10. Hands-On Labs
11. Historical Patterns
12. Publishing Appendix

The introduction and reading guide lead the book. “Start Here” links do not duplicate chapters in later sections.

## Consumers

### VitePress

`book/docs/.vitepress/config.ts` imports manifest helpers that produce:

- the curated “Start Here” group;
- canonical section groups;
- one link per chapter in its owning section.

### PDF

`book/scripts/generate-pdf.mjs` imports the same ordered chapter list. PDF table-of-contents labels use the section title and chapter title from the manifest.

### Validation

Add a validation script that fails when:

- a chapter ID is duplicated;
- a Markdown path is duplicated;
- a section ID is unknown;
- a referenced Markdown file is missing;
- a website chapter is excluded from the PDF;
- a generated chapter is absent from `pattern-manifest.mjs`;
- sidebar or PDF consumers introduce independent chapter arrays.

## Data Flow

```text
book-manifest.mjs
    ├── VitePress sidebar
    ├── PDF chapter order
    └── manifest validation

pattern-manifest.mjs
    └── generated chapter content and downloads
```

## Error Handling

Manifest validation runs before website and PDF builds. Structural errors stop the build with a specific chapter or section identifier.

The validator reports all detected errors in one run rather than stopping after the first error.

## Testing

Tests must prove:

- chapter IDs and paths are unique;
- every referenced Markdown file exists;
- all website chapters are included once in the PDF;
- “Start Here” links do not duplicate canonical chapters;
- all generated chapters map to the pattern manifest;
- the 12 chapters previously missing from the PDF are present;
- both consumers derive their chapter data from the canonical manifest.

Run:

```sh
npm run book:manifest:test
npm run book:build
npm run book:pdf
```

## Migration

1. Add the manifest and validation tests.
2. Move current sidebar metadata into the manifest.
3. Replace the hard-coded PDF chapter array.
4. Add the 12 missing PDF chapters through canonical parity.
5. Remove duplicated structural metadata from both consumers.
6. Build and inspect the website and PDF.

## Success Criteria

- Website and PDF include the same unique manuscript chapters.
- Both use the same canonical order.
- “Start Here” remains available without duplicating PDF chapters.
- Chapter ownership is explicit.
- A structural test prevents future edition drift.
