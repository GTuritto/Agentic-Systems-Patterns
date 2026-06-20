# Astro Online Book Spike Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prototype an Astro-based online reading experience for the book without replacing the current VitePress site or PDF pipeline.

**Architecture:** Add a separate `site/` Astro app that consumes the existing `book/scripts/book-manifest.mjs` manifest and renders a small representative subset of chapters. Keep VitePress as the production path during the spike. The spike proves navigation, Markdown rendering, diagrams, static output, and search viability before any migration decision.

**Tech Stack:** Astro, MDX/Markdown rendering, Pagefind, existing Node.js ESM book manifest, static build output.

---

## File Structure

- Create `site/package.json`: isolated Astro app scripts and dependencies.
- Create `site/astro.config.mjs`: static Astro configuration with GitHub Pages-compatible output.
- Create `site/src/lib/book-manifest.ts`: imports and adapts `book/scripts/book-manifest.mjs`.
- Create `site/src/lib/markdown.ts`: reads selected Markdown chapters and renders them safely.
- Create `site/src/layouts/BookLayout.astro`: shared online book layout.
- Create `site/src/components/Sidebar.astro`: manifest-driven navigation.
- Create `site/src/pages/index.astro`: online-first landing page.
- Create `site/src/pages/book/[...slug].astro`: dynamic chapter route for spike chapters.
- Create `site/src/styles/global.css`: minimal reader-focused styling.
- Modify root `package.json`: add `site:install`, `site:dev`, and `site:build` scripts.
- Do not remove or modify `book/docs/.vitepress/config.ts`.
- Do not change PDF generation except to verify it still works after the spike if needed.

## Spike Scope

Render these five representative chapters:

1. `intro.md`
2. `pattern-selection/choosing-the-right-pattern.md`
3. `tools-skills-protocols/tool-capability-design.md`
4. `multi-agent-systems/choosing-multi-agent-topology.md`
5. `systems-architecture/coding-agents.md`

These cover front matter, normal authored Markdown, deep prose, generated-style links, tables, code blocks, and architecture content.

## Task 1: Scaffold Isolated Astro App

**Files:**
- Create: `site/package.json`
- Create: `site/astro.config.mjs`
- Create: `site/src/styles/global.css`
- Modify: `package.json`

- [ ] **Step 1: Create `site/package.json`**

```json
{
  "name": "agentic-systems-patterns-site-spike",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/mdx": "^5.0.0",
    "astro": "^6.0.0",
    "gray-matter": "^4.0.3",
    "markdown-it": "^14.1.0",
    "pagefind": "^1.4.0",
    "rehype-mermaid": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "typescript": "^5.7.3"
  }
}
```

- [ ] **Step 2: Create `site/astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://gturitto.github.io',
  base: '/Agentic-Systems-Patterns/',
  outDir: 'dist',
  publicDir: 'public',
  integrations: [mdx()],
  output: 'static'
});
```

- [ ] **Step 3: Create global reader CSS**

Create `site/src/styles/global.css`:

```css
:root {
  color-scheme: light;
  --bg: #f7fafb;
  --panel: #ffffff;
  --text: #17242b;
  --muted: #52636d;
  --border: #d9e2e6;
  --accent: #1f8a8a;
  --nav: #173f4f;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  margin: 0;
}

a {
  color: var(--accent);
}

.book-shell {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  min-height: 100vh;
}

.book-sidebar {
  background: var(--panel);
  border-right: 1px solid var(--border);
  height: 100vh;
  overflow: auto;
  padding: 24px;
  position: sticky;
  top: 0;
}

.book-content {
  margin: 0 auto;
  max-width: 880px;
  padding: 48px 32px 80px;
  width: 100%;
}

.book-content h1 {
  color: var(--nav);
  font-size: clamp(2.25rem, 5vw, 4rem);
  line-height: 1;
}

.book-content h2 {
  color: var(--nav);
  margin-top: 2.25rem;
}

.book-content p,
.book-content li {
  font-size: 1.05rem;
  line-height: 1.75;
}

.book-content pre {
  background: #eef5f6;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: auto;
  padding: 16px;
}

.book-content table {
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  width: 100%;
}

.book-content th,
.book-content td {
  border: 1px solid var(--border);
  padding: 10px 12px;
  vertical-align: top;
}

@media (max-width: 860px) {
  .book-shell {
    display: block;
  }

  .book-sidebar {
    height: auto;
    position: static;
  }
}
```

- [ ] **Step 4: Add root scripts**

In root `package.json`, add:

```json
"site:install": "npm install --prefix site",
"site:dev": "npm run dev --prefix site",
"site:build": "npm run build --prefix site"
```

- [ ] **Step 5: Install dependencies**

Run:

```sh
npm run site:install
```

Expected: `site/package-lock.json` is created and dependencies install.

- [ ] **Step 6: Commit scaffold**

```sh
git add package.json site/package.json site/package-lock.json site/astro.config.mjs site/src/styles/global.css
git commit -m "chore(site): scaffold Astro book spike"
```

## Task 2: Adapt The Existing Book Manifest For Astro

**Files:**
- Create: `site/src/lib/book-manifest.ts`
- Create: `site/src/lib/markdown.ts`

- [ ] **Step 1: Create manifest adapter**

Create `site/src/lib/book-manifest.ts`:

```ts
import { bookChapters, bookSections, sidebarGroups } from '../../../book/scripts/book-manifest.mjs';

export type SiteChapter = {
  id: string;
  title: string;
  path: string;
  sectionId: string;
  slug: string;
};

export const spikeChapterPaths = new Set([
  'intro.md',
  'pattern-selection/choosing-the-right-pattern.md',
  'tools-skills-protocols/tool-capability-design.md',
  'multi-agent-systems/choosing-multi-agent-topology.md',
  'systems-architecture/coding-agents.md'
]);

export const siteSections = bookSections;

export const siteChapters: SiteChapter[] = bookChapters
  .filter(chapter => spikeChapterPaths.has(chapter.path))
  .map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    path: chapter.path,
    sectionId: chapter.sectionId,
    slug: chapter.path.replace(/\.md$/, '').replace(/\/index$/, '')
  }));

export const siteSidebarGroups = sidebarGroups.map(group => ({
  ...group,
  items: group.items
    .filter(item => spikeChapterPaths.has(item.path))
    .map(item => ({
      ...item,
      href: `/Agentic-Systems-Patterns/book/${item.path.replace(/\.md$/, '').replace(/\/index$/, '')}/`
    }))
})).filter(group => group.items.length > 0);

export function chapterBySlug(slug: string) {
  return siteChapters.find(chapter => chapter.slug === slug);
}
```

- [ ] **Step 2: Create Markdown reader**

Create `site/src/lib/markdown.ts`:

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import type { SiteChapter } from './book-manifest';

const repoRoot = path.resolve('../../');
const docsRoot = path.join(repoRoot, 'book', 'docs');

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

function rewriteLinks(markdown: string) {
  return markdown.replace(/\]\((?!https?:\/\/|mailto:|#)([^)]+)\)/g, (_match, target) => {
    const [rawPath, hash = ''] = target.split('#');
    const cleanPath = rawPath.replace(/^\.\//, '').replace(/^\.\.\//, '');
    if (!cleanPath.endsWith('.md')) return `](${target})`;
    return `](/Agentic-Systems-Patterns/book/${cleanPath.replace(/\.md$/, '')}/${hash ? `#${hash}` : ''})`;
  });
}

export async function renderChapter(chapter: SiteChapter) {
  const filePath = path.join(docsRoot, chapter.path);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = matter(raw);
  const body = rewriteLinks(parsed.content.trim());
  return {
    title: parsed.data.title ?? chapter.title,
    html: md.render(body)
  };
}
```

- [ ] **Step 3: Verify TypeScript can load manifest**

Run:

```sh
node -e "import('./site/src/lib/book-manifest.ts').then(m => console.log(m.siteChapters.length))"
```

Expected: prints `5`.

- [ ] **Step 4: Commit manifest adapter**

```sh
git add site/src/lib/book-manifest.ts site/src/lib/markdown.ts
git commit -m "feat(site): adapt book manifest for Astro spike"
```

## Task 3: Build The Online Reading Routes

**Files:**
- Create: `site/src/layouts/BookLayout.astro`
- Create: `site/src/components/Sidebar.astro`
- Create: `site/src/pages/index.astro`
- Create: `site/src/pages/book/[...slug].astro`

- [ ] **Step 1: Create sidebar component**

Create `site/src/components/Sidebar.astro`:

```astro
---
import { siteSidebarGroups } from '../lib/book-manifest';
---

<aside class="book-sidebar" aria-label="Book navigation">
  <a class="brand" href="/Agentic-Systems-Patterns/">Agentic Systems Patterns</a>
  <nav>
    {siteSidebarGroups.map(group => (
      <section class="nav-group">
        <h2>{group.text}</h2>
        <ul>
          {group.items.map(item => (
            <li><a href={item.href}>{item.text}</a></li>
          ))}
        </ul>
      </section>
    ))}
  </nav>
</aside>

<style>
  .brand {
    color: var(--nav);
    display: inline-block;
    font-size: 1.1rem;
    font-weight: 800;
    margin-bottom: 24px;
    text-decoration: none;
  }

  .nav-group h2 {
    color: var(--muted);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    margin-top: 24px;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin: 8px 0;
  }

  a {
    text-decoration: none;
  }
</style>
```

- [ ] **Step 2: Create book layout**

Create `site/src/layouts/BookLayout.astro`:

```astro
---
import Sidebar from '../components/Sidebar.astro';
import '../styles/global.css';

const { title = 'Agentic Systems Patterns' } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <meta name="description" content="An online book for designing, evaluating, and operating agentic systems." />
  </head>
  <body>
    <div class="book-shell">
      <Sidebar />
      <main class="book-content" id="main-content">
        <slot />
      </main>
    </div>
  </body>
</html>
```

- [ ] **Step 3: Create homepage**

Create `site/src/pages/index.astro`:

```astro
---
import BookLayout from '../layouts/BookLayout.astro';
import { siteChapters } from '../lib/book-manifest';
---

<BookLayout title="Agentic Systems Patterns">
  <h1>Agentic Systems Patterns</h1>
  <p>A practical online book for modern agent architecture: goals, loops, tools, skills, memory, protocols, multi-agent systems, and production runtimes.</p>

  <h2>Astro Spike</h2>
  <p>This prototype renders a representative slice of the existing book from the canonical manifest. VitePress remains the production site until this spike is accepted.</p>

  <h2>Prototype Chapters</h2>
  <ul>
    {siteChapters.map(chapter => (
      <li><a href={`/Agentic-Systems-Patterns/book/${chapter.slug}/`}>{chapter.title}</a></li>
    ))}
  </ul>
</BookLayout>
```

- [ ] **Step 4: Create dynamic chapter route**

Create `site/src/pages/book/[...slug].astro`:

```astro
---
import BookLayout from '../../layouts/BookLayout.astro';
import { chapterBySlug, siteChapters } from '../../lib/book-manifest';
import { renderChapter } from '../../lib/markdown';

export function getStaticPaths() {
  return siteChapters.map(chapter => ({
    params: { slug: chapter.slug },
    props: { chapter }
  }));
}

const { chapter } = Astro.props;
const rendered = await renderChapter(chapter);
---

<BookLayout title={`${rendered.title} | Agentic Systems Patterns`}>
  <article set:html={rendered.html} />
</BookLayout>
```

- [ ] **Step 5: Run Astro build**

Run:

```sh
npm run site:build
```

Expected: Astro build exits 0 and Pagefind indexes `site/dist`.

- [ ] **Step 6: Commit reading routes**

```sh
git add site/src/components/Sidebar.astro site/src/layouts/BookLayout.astro site/src/pages/index.astro site/src/pages/book/[...slug].astro
git commit -m "feat(site): render Astro book prototype"
```

## Task 4: Add Basic Search And Spike Notes

**Files:**
- Modify: `site/src/layouts/BookLayout.astro`
- Create: `site/src/components/SearchBox.astro`
- Create: `docs/superpowers/specs/2026-06-20-astro-online-book-spike-results.md`

- [ ] **Step 1: Create search component**

Create `site/src/components/SearchBox.astro`:

```astro
<div class="search" role="search">
  <label for="search-input">Search prototype</label>
  <input id="search-input" type="search" placeholder="Search chapters..." />
  <div id="search-results"></div>
</div>

<script>
  const input = document.querySelector<HTMLInputElement>('#search-input');
  const results = document.querySelector<HTMLDivElement>('#search-results');

  async function loadPagefind() {
    const pagefind = await import('/Agentic-Systems-Patterns/pagefind/pagefind.js');
    await pagefind.options({ baseUrl: '/Agentic-Systems-Patterns/' });
    return pagefind;
  }

  let pagefindPromise: ReturnType<typeof loadPagefind> | undefined;

  input?.addEventListener('input', async () => {
    const q = input.value.trim();
    if (!results) return;
    if (!q) {
      results.innerHTML = '';
      return;
    }

    pagefindPromise ??= loadPagefind();
    const pagefind = await pagefindPromise;
    const search = await pagefind.search(q);
    const items = await Promise.all(search.results.slice(0, 5).map(result => result.data()));
    results.innerHTML = items.map(item => `<a href="${item.url}">${item.meta.title}</a>`).join('');
  });
</script>

<style>
  .search {
    border-top: 1px solid var(--border);
    margin-top: 24px;
    padding-top: 16px;
  }

  label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  input {
    border: 1px solid var(--border);
    border-radius: 8px;
    box-sizing: border-box;
    padding: 10px;
    width: 100%;
  }

  #search-results {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }
</style>
```

- [ ] **Step 2: Add search to sidebar**

Modify `site/src/components/Sidebar.astro` to import and render `SearchBox` under the brand link:

```astro
---
import SearchBox from './SearchBox.astro';
import { siteSidebarGroups } from '../lib/book-manifest';
---

<aside class="book-sidebar" aria-label="Book navigation">
  <a class="brand" href="/Agentic-Systems-Patterns/">Agentic Systems Patterns</a>
  <SearchBox />
  <nav>
```

- [ ] **Step 3: Write spike result template**

Create `docs/superpowers/specs/2026-06-20-astro-online-book-spike-results.md`:

```markdown
# Astro Online Book Spike Results

## Scope

Prototype Astro rendering for five chapters from the canonical book manifest. VitePress remains the production site during the spike.

## Verified

- [ ] Manifest-driven chapter list works.
- [ ] Homepage builds.
- [ ] Dynamic chapter routes build.
- [ ] Markdown tables and code blocks render acceptably.
- [ ] Pagefind indexes static output.
- [ ] GitHub Pages-compatible base path works.

## Open Questions

- Should the full site migrate to Astro or only selected reader-facing pages?
- Should generated pattern chapters remain Markdown files or become data-driven cards?
- Should PDF export keep using the existing `book/scripts/generate-pdf.mjs` pipeline?

## Recommendation

Pending spike execution.
```

- [ ] **Step 4: Build and preview static output**

Run:

```sh
npm run site:build
```

Expected: build exits 0 and Pagefind completes.

- [ ] **Step 5: Commit search and notes**

```sh
git add site/src/components/SearchBox.astro site/src/components/Sidebar.astro docs/superpowers/specs/2026-06-20-astro-online-book-spike-results.md
git commit -m "feat(site): add prototype search"
```

## Task 5: Compare Astro Against VitePress

**Files:**
- Modify: `docs/superpowers/specs/2026-06-20-astro-online-book-spike-results.md`

- [ ] **Step 1: Run current production book build**

Run:

```sh
npm run book:manifest:test
npm run book:build
```

Expected: existing VitePress build still exits 0.

- [ ] **Step 2: Run Astro spike build**

Run:

```sh
npm run site:build
```

Expected: Astro spike build exits 0.

- [ ] **Step 3: Update spike results**

Update `docs/superpowers/specs/2026-06-20-astro-online-book-spike-results.md` with:

```markdown
## Decision Matrix

| Criterion | VitePress Current | Astro Spike | Notes |
| --- | --- | --- | --- |
| Online reading experience |  |  |  |
| Navigation from canonical manifest |  |  |  |
| Search |  |  |  |
| Markdown compatibility |  |  |  |
| Diagram compatibility |  |  |  |
| GitHub Pages/static deployment |  |  |  |
| PDF impact |  |  |  |
| Maintenance cost |  |  |  |

## Final Recommendation

Choose one:

- Keep VitePress.
- Migrate fully to Astro.
- Use Astro for main website and keep existing book/PDF tooling temporarily.
```

- [ ] **Step 4: Commit results**

```sh
git add docs/superpowers/specs/2026-06-20-astro-online-book-spike-results.md
git commit -m "docs(site): record Astro spike comparison"
```

## Task 6: Final Verification

**Files:**
- Test only unless generated outputs changed unexpectedly

- [ ] **Step 1: Verify current book still works**

Run:

```sh
npm run book:manifest:test
npm run book:build
```

Expected: both commands exit 0.

- [ ] **Step 2: Verify Astro spike works**

Run:

```sh
npm run site:build
```

Expected: command exits 0.

- [ ] **Step 3: Verify no public local paths leaked**

Run:

```sh
LOCAL_PATH_PATTERN='/(Volumes|Users)/'
rg -n "$LOCAL_PATH_PATTERN" book/docs site/src README.md docs/superpowers/specs/2026-06-20-astro-online-book-spike-results.md
```

Expected: no output.

- [ ] **Step 4: Check git status**

Run:

```sh
git status --short
```

Expected: only intended files are changed or untracked. Existing local `.specstory`, `.claude`, and local PDF source artifacts remain ignored for this work.

## Self-Review

- Spec coverage: The plan prototypes Astro without replacing VitePress, consumes the canonical manifest, renders representative chapters, adds search, validates static output, and records a migration recommendation.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: The plan consistently uses `site/` for the Astro app and `book/scripts/book-manifest.mjs` as the manifest source.
