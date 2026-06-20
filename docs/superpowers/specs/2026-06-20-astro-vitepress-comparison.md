# Astro vs VitePress Decision Record

## Decision

Use Astro as the target online book platform, but keep VitePress as the current stable publishing path until Astro reaches full chapter parity.

## Why Astro Fits This Book

The book is online-first. Astro gives the project more control over reader experience than VitePress while still supporting static hosting:

- Custom book layouts without fighting a documentation theme.
- Data-driven chapter and pattern views from the canonical manifest.
- Pagefind static search.
- MDX/component islands for future interactive diagrams, comparison cards, and pattern galleries.
- Static output compatible with GitHub Pages-style deployment.
- Similar direction to the referenced `awesome-agentic-patterns` site, which uses Astro for a pattern-oriented reading/catalog experience.

## Tradeoff Matrix

| Area | Astro | VitePress |
| --- | --- | --- |
| Online book UX | Best fit for custom reading and pattern catalog pages. | Good for docs, less flexible for book-specific UX. |
| Markdown chapters | Works with adapter/rendering layer. | Already works. |
| Navigation | Manifest-driven prototype works. | Manifest-driven production sidebar already works. |
| Search | Pagefind prototype works on static output. | Built-in/local docs search path is simpler. |
| PDF pipeline | Should remain separate. | Already integrated with current book pipeline. |
| Migration risk | Medium until all 79 chapters render. | Low; already stable. |
| Long-term ceiling | Higher for online-first book/product experience. | Lower; stronger as documentation site. |

## Migration Criteria

Move production from VitePress to Astro only after:

1. All 79 manifest chapters render in Astro.
2. Internal links and assets resolve under the configured base path.
3. Diagrams render or have a documented fallback.
4. Search indexes the full book.
5. Existing PDF generation still passes from the canonical manifest.
6. `npm run site:build`, `npm run book:build`, and PDF generation pass together.

## Recommendation

Proceed with Astro expansion. The next engineering step is full-chapter parity in the Astro app, not visual polish.
