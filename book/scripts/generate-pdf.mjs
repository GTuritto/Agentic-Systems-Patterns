import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { chromium } from 'playwright';
import { bookSections, pdfChapters } from './book-manifest.mjs';
import {
  createMermaidSvgRenderer,
  resetGeneratedMermaidArtifacts,
  replaceMermaidWithDiagramImages
} from './mermaid-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(bookRoot, 'docs');
const releasesRoot = path.join(bookRoot, 'releases');
const publicReleasesRoot = path.join(docsRoot, 'public', 'releases');
const pdfName = 'Agentic-Systems-Patterns.pdf';
const epubName = 'Agentic-Systems-Patterns.epub';
const edition = '2026-06-16';
const siteUrl = 'https://gturitto.github.io/Agentic-Systems-Patterns/';
const pdfUrl = `${siteUrl}releases/${pdfName}`;
const epubUrl = `${siteUrl}releases/${epubName}`;
const repoUrl = 'https://github.com/GTuritto/Agentic-Systems-Patterns';
const pdfPageWidthMm = 210;
const pdfPageHeightMm = 297;
const pdfHorizontalMarginMm = 32;
const pdfVerticalMarginMm = 36;
const tocColumnGapPx = 26;
const tocColumnsPerPage = 2;

const sectionsById = new Map(bookSections.map(section => [section.id, section]));

function chapterLabel(chapter) {
  const section = sectionsById.get(chapter.sectionId);
  if (!section) {
    throw new Error(`Unknown PDF chapter sectionId "${chapter.sectionId}" for chapter "${chapter.id}"`);
  }
  if (chapter.title === 'Introduction') return chapter.title;
  return `${section.title} / ${chapter.title}`;
}

const chapters = pdfChapters.map(chapter => [chapterLabel(chapter), chapter.path]);

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

const defaultImageRender = md.renderer.rules.image ?? ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));
md.renderer.rules.image = (tokens, index, options, env, self) => {
  const token = tokens[index];
  const src = token.attrGet('src') ?? '';
  if (src.includes('/diagrams/')) {
    token.attrJoin('class', 'diagram-asset');
  }
  return defaultImageRender(tokens, index, options, env, self);
};

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function rewriteLinks(markdown) {
  return markdown.replace(/\]\((?!https?:\/\/|mailto:|#)([^)]+)\)/g, (_match, target) => {
    if (target.startsWith('../public/diagrams/')) {
      return `](../docs/public/diagrams/${target.replace('../public/diagrams/', '')})`;
    }
    const cleaned = target.replace(/\.md(#.*)?$/, '$1');
    return `](${cleaned})`;
  });
}

function chapterId(index) {
  return `chapter-${index + 1}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mmToPx(value) {
  return value * 96 / 25.4;
}

async function renderChapters(renderer) {
  const rendered = [];
  for (const [index, [fallbackTitle, relativePath]] of chapters.entries()) {
    const fullPath = path.join(docsRoot, relativePath);
    const raw = await fs.readFile(fullPath, 'utf8');
    const { markdown: diagramMarkdown } = await replaceMermaidWithDiagramImages(stripFrontmatter(raw).trim(), relativePath, renderer, {
      linkPrefix: '../docs/public/diagrams'
    });
    const markdown = rewriteLinks(diagramMarkdown);
    const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? fallbackTitle;
    rendered.push(`
      <section class="chapter" id="${chapterId(index)}">
        <div class="chapter-label">${fallbackTitle}</div>
        ${md.render(markdown || `# ${title}`)}
      </section>
    `);
  }
  return rendered.join('\n');
}

async function measureTableOfContents(browser) {
  const contentWidth = mmToPx(pdfPageWidthMm - pdfHorizontalMarginMm);
  const contentHeight = mmToPx(pdfPageHeightMm - pdfVerticalMarginMm);
  const columnWidth = (contentWidth - tocColumnGapPx) / tocColumnsPerPage;
  const page = await browser.newPage({
    viewport: {
      width: Math.ceil(contentWidth),
      height: Math.ceil(contentHeight)
    }
  });

  try {
    const measuredItems = chapters
      .map(([title], index) => `<li><a href="#${chapterId(index)}">${escapeHtml(title)}</a></li>`)
      .join('\n');

    await page.setContent(`<!doctype html>
      <html>
      <head>
        <style>
          body {
            color: #202124;
            font: 11.5pt/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            margin: 0;
          }

          .chapter-label {
            color: #b7791f;
            font-size: 8.5pt;
            font-weight: 700;
            letter-spacing: 0.04em;
            margin-bottom: 10px;
            text-transform: uppercase;
          }

          h1 {
            color: #173f4f;
            font-size: 24pt;
            line-height: 1.15;
            margin: 0 0 18px;
          }

          .toc h1 {
            border-bottom: 3px solid #1f8a8a;
            padding-bottom: 8px;
          }

          .toc-grid {
            margin-top: 18px;
          }

          .measure-column {
            width: ${columnWidth}px;
          }

          .measure-column ol {
            font-size: 8.8pt;
            line-height: 1.28;
            margin: 0;
            padding-left: 34px;
          }

          .measure-column li {
            break-inside: avoid;
            margin-bottom: 3px;
          }

          a {
            color: #1f8a8a;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <section class="toc">
          <div class="chapter-label">Front Matter</div>
          <h1>Table of Contents, Continued</h1>
          <div class="toc-grid"></div>
        </section>
        <div class="measure-column">
          <ol>${measuredItems}</ol>
        </div>
      </body>
      </html>`);

    return await page.evaluate(() => {
      const gridTop = document.querySelector('.toc-grid').getBoundingClientRect().top;
      const availableHeight = window.innerHeight - gridTop;
      const itemHeights = [...document.querySelectorAll('.measure-column li')].map(item => {
        const style = window.getComputedStyle(item);
        return item.getBoundingClientRect().height + Number.parseFloat(style.marginBottom || '0');
      });
      return { availableHeight, itemHeights };
    });
  } finally {
    await page.close();
  }
}

function paginateTableOfContents(itemHeights, availableHeight) {
  const pages = [];
  let page = [[], []];
  let columnIndex = 0;
  let columnHeight = 0;

  for (const [index, [title]] of chapters.entries()) {
    const itemHeight = itemHeights[index] ?? 16;
    if (page[columnIndex].length > 0 && columnHeight + itemHeight > availableHeight) {
      columnIndex += 1;
      columnHeight = 0;
      if (columnIndex >= tocColumnsPerPage) {
        pages.push(page);
        page = [[], []];
        columnIndex = 0;
      }
    }

    page[columnIndex].push({ index, title, height: itemHeight });
    columnHeight += itemHeight;
  }

  if (page.some(column => column.length > 0)) pages.push(page);
  return pages;
}

async function renderTableOfContents(browser) {
  const { availableHeight, itemHeights } = await measureTableOfContents(browser);
  return paginateTableOfContents(itemHeights, availableHeight).map((page, pageIndex) => {
    const columns = page
      .filter(column => column.length > 0)
      .map((column, columnIndex) => {
        const columnStart = column[0].index;
        const measuredHeight = Math.ceil(column.reduce((total, item) => total + item.height, 0));
        const items = column
          .map(({ index, title }) => `<li><a href="#${chapterId(index)}">${escapeHtml(title)}</a></li>`)
          .join('\n');
        return `
        <ol start="${columnStart + 1}" data-toc-column="${columnIndex + 1}" data-toc-items="${column.length}" data-toc-measured-height="${measuredHeight}">
          ${items}
        </ol>
      `;
      }).join('\n');
    const title = pageIndex === 0 ? 'Table of Contents' : 'Table of Contents, Continued';
    return `
      <section class="toc" data-toc-mode="auto-fit" data-toc-available-height="${Math.floor(availableHeight)}">
        <div class="chapter-label">Front Matter</div>
        <h1>${title}</h1>
        <div class="toc-grid">
          ${columns}
        </div>
      </section>
    `;
  }).join('\n');
}

function htmlDocument(toc, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Agentic Systems Patterns</title>
  <style>
    :root {
      --asp-navy: #173f4f;
      --asp-blue: #245f73;
      --asp-teal: #1f8a8a;
      --asp-amber: #b7791f;
      --asp-panel: #f7fafb;
      --asp-panel-strong: #eef5f6;
      --asp-border: #d9e2e6;
      --asp-muted: #4f5b62;
      --asp-code-bg: #f3f6f7;
    }

    @page {
      size: A4;
      margin: 18mm 16mm;
    }

    body {
      color: #202124;
      font: 11.5pt/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
    }

    .cover {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: 92vh;
      justify-content: center;
      page-break-after: always;
      text-align: center;
    }

    .cover-logo {
      height: auto;
      margin: 0 0 28px;
      max-width: 380px;
      width: 58%;
    }

    .cover h1 {
      color: var(--asp-navy);
      font-size: 38pt;
      line-height: 1.05;
      margin: 0 0 16px;
    }

    .cover p {
      color: var(--asp-blue);
      font-size: 14pt;
      max-width: 620px;
    }

    .cover-meta {
      color: var(--asp-muted);
      font-size: 10pt;
      line-height: 1.7;
      margin-top: 30px;
    }

    .license {
      color: var(--asp-amber);
      font-size: 9pt;
      margin-top: 42px;
    }

    .toc {
      break-before: page;
      page-break-after: always;
    }

    .toc-grid {
      column-gap: 26px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: 18px;
    }

    .toc ol {
      font-size: 8.8pt;
      line-height: 1.28;
      margin: 0;
      padding-left: 34px;
    }

    .toc li {
      break-inside: avoid;
      margin-bottom: 3px;
    }

    .toc h1 {
      border-bottom: 3px solid var(--asp-teal);
      padding-bottom: 8px;
    }

    .chapter {
      break-before: page;
    }

    .chapter-label {
      color: var(--asp-amber);
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    h1 {
      color: var(--asp-navy);
      font-size: 24pt;
      line-height: 1.15;
      margin: 0 0 18px;
    }

    h2 {
      color: var(--asp-blue);
      font-size: 15pt;
      margin: 24px 0 8px;
    }

    h3 {
      color: var(--asp-amber);
      font-size: 12.5pt;
      margin: 18px 0 6px;
    }

    p, li {
      orphans: 3;
      widows: 3;
    }

    a {
      color: var(--asp-teal);
      text-decoration: none;
    }

    code {
      background: var(--asp-code-bg);
      border: 1px solid var(--asp-border);
      border-radius: 3px;
      color: var(--asp-blue);
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 9.5pt;
      padding: 1px 3px;
    }

    pre {
      background: var(--asp-code-bg);
      border: 1px solid var(--asp-border);
      border-radius: 6px;
      overflow-wrap: anywhere;
      padding: 10px 12px;
      white-space: pre-wrap;
    }

    pre code {
      background: transparent;
      padding: 0;
    }

    blockquote {
      background: var(--asp-panel);
      border-left: 4px solid var(--asp-amber);
      border-radius: 0 6px 6px 0;
      color: var(--asp-muted);
      margin-left: 0;
      padding: 8px 12px;
    }

    table {
      border-collapse: collapse;
      margin: 14px 0;
      width: 100%;
    }

    th {
      background: var(--asp-panel-strong);
      color: var(--asp-navy);
      font-weight: 700;
    }

    td,
    th {
      border: 1px solid var(--asp-border);
      padding: 6px 8px;
      vertical-align: top;
    }

    img {
      display: block;
      height: auto;
      margin: 16px auto;
      max-width: 100%;
    }

    p:has(> img.diagram-asset) {
      break-inside: avoid;
      margin: 8px 0 10px;
      page-break-inside: avoid;
    }

    img.diagram-asset {
      box-sizing: border-box;
      max-height: 128mm;
      max-width: min(100%, 168mm);
      object-fit: contain;
      width: 100%;
    }
  </style>
</head>
<body>
  <section class="cover">
    <img class="cover-logo" src="../docs/public/brand/agent-graph-cover.svg" alt="Agentic systems graph mark">
    <h1>Agentic Systems Patterns</h1>
    <p>A practical reference for modern agent architecture: goals, loops, tools, skills, memory, protocols, multi-agent systems, and production runtimes.</p>
    <div class="cover-meta">
      <div>Edition: ${edition}</div>
      <div>Site: ${siteUrl}</div>
      <div>Courtesy PDF: ${pdfUrl}</div>
      <div>Courtesy EPUB: ${epubUrl}</div>
      <div>Repository: ${repoUrl}</div>
    </div>
    <div class="license">Content licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0). Code examples licensed under MIT.</div>
  </section>
  ${toc}
  ${body}
</body>
</html>`;
}

async function main() {
  await resetGeneratedMermaidArtifacts();
  const mermaidRenderer = await createMermaidSvgRenderer();
  let body;
  try {
    body = await renderChapters(mermaidRenderer);
  } finally {
    await mermaidRenderer.close();
  }

  const htmlPath = path.join(releasesRoot, 'Agentic-Systems-Patterns.html');
  const pdfPath = path.join(releasesRoot, pdfName);
  const publicPdfPath = path.join(publicReleasesRoot, pdfName);

  await fs.mkdir(releasesRoot, { recursive: true });
  await fs.mkdir(publicReleasesRoot, { recursive: true });

  const browser = await chromium.launch();
  try {
    const toc = await renderTableOfContents(browser);
    const html = htmlDocument(toc, body);
    await fs.writeFile(htmlPath, html, 'utf8');

    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="font-size:8px;color:#78909c;width:100%;padding:0 16mm;text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' }
    });
  } finally {
    await browser.close();
  }

  await fs.copyFile(pdfPath, publicPdfPath);
  console.log(`PDF written to ${pdfPath}`);
  console.log(`Deploy copy written to ${publicPdfPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
