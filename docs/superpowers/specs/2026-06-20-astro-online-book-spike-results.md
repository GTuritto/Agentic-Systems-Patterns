# Astro Online Book Spike Results

## Scope

Prototype Astro rendering for five chapters from the canonical book manifest. VitePress remains the production site during the spike.

## Verified

- [x] Manifest-driven chapter list works.
- [x] Homepage builds.
- [x] Dynamic chapter routes build.
- [x] Markdown tables and code blocks render acceptably.
- [x] Pagefind indexes static output.
- [x] GitHub Pages-compatible base path works.

## Build Result

`npm run site:build` generated 6 static pages and Pagefind indexed 6 pages / 1,358 words.

## Open Questions

- Should the full site migrate to Astro or only selected reader-facing pages?
- Should generated pattern chapters remain Markdown files or become data-driven cards?
- Should PDF export keep using the existing `book/scripts/generate-pdf.mjs` pipeline?

## Recommendation

Astro is viable for the online-first book. Keep VitePress as the stable production path until the spike is expanded to all chapters, but use Astro as the target for the richer reader experience: manifest-driven routes, custom layouts, Pagefind search, and future interactive pattern views.
