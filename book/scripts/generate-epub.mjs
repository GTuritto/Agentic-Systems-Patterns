import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { bookSections, pdfChapters } from './book-manifest.mjs';
import {
  createMermaidSvgRenderer,
  diagramsRoot,
  replaceMermaidWithDiagramImages,
  resetGeneratedMermaidArtifacts
} from './mermaid-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const language = process.env.BOOK_LANGUAGE === 'es' ? 'es' : 'en';
const docsRoot = path.join(bookRoot, language === 'es' ? 'docs-es' : 'docs');
const releasesRoot = path.join(bookRoot, 'releases');
const publicReleasesRoot = path.join(bookRoot, 'docs', 'public', 'releases');
const epubName = language === 'es' ? 'Agentic-Systems-Patterns-es.epub' : 'Agentic-Systems-Patterns.epub';
const edition = '2026-06-16';
const siteUrl = language === 'es'
  ? 'https://gturitto.github.io/Agentic-Systems-Patterns/es/'
  : 'https://gturitto.github.io/Agentic-Systems-Patterns/';
const releaseUrl = 'https://gturitto.github.io/Agentic-Systems-Patterns/';
const epubUrl = `${releaseUrl}releases/${epubName}`;
const repoUrl = 'https://github.com/GTuritto/Agentic-Systems-Patterns';

const sectionsById = new Map(bookSections.map(section => [section.id, section]));

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  xhtmlOut: true
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

function chapterLabel(chapter) {
  const section = sectionsById.get(chapter.sectionId);
  if (!section) {
    throw new Error(`Unknown EPUB chapter sectionId "${chapter.sectionId}" for chapter "${chapter.id}"`);
  }
  if (chapter.title === 'Introduction') return chapter.title;
  return `${section.title} / ${chapter.title}`;
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rewriteLinks(markdown, fromChapterPath) {
  return markdown.replace(/\]\((?!https?:\/\/|mailto:|#)([^)]+)\)/g, (_match, target) => {
    const [rawPath, hash] = target.split('#');
    const hashSuffix = hash ? `#${hash}` : '';

    if (rawPath.startsWith('../public/diagrams/')) {
      return `](../assets/diagrams/${rawPath.slice('../public/diagrams/'.length)}${hashSuffix})`;
    }

    if (rawPath.startsWith('../public/')) {
      return `](${releaseUrl}${rawPath.slice('../public/'.length)}${hashSuffix})`;
    }

    if (rawPath.startsWith('../assets/')) {
      return `](${rawPath}${hashSuffix})`;
    }

    if (rawPath.startsWith('/diagrams/')) {
      return `](../assets/diagrams/${rawPath.slice('/diagrams/'.length)}${hashSuffix})`;
    }

    if (rawPath.startsWith('/')) {
      if (rawPath.startsWith('/diagrams/') || rawPath.startsWith('/brand/') || rawPath.startsWith('/releases/')) {
        return `](${releaseUrl}${rawPath.replace(/^\//, '')}${hashSuffix})`;
      }
      return `](${siteUrl}${rawPath.replace(/^\//, '')}${hashSuffix})`;
    }

    if (rawPath.endsWith('.md')) {
      const fromDir = path.posix.dirname(fromChapterPath);
      const resolved = path.posix.normalize(path.posix.join(fromDir, rawPath));
      const slug = resolved.replace(/\.md$/, '').replace(/\/index$/, '');
      return `](${siteUrl}book/${slug}/${hashSuffix})`;
    }

    return `](${target})`;
  });
}

function collectEpubDiagramAssets(markdown) {
  const assets = new Set();
  for (const match of markdown.matchAll(/!\[[^\]]*]\(\.\.\/assets\/diagrams\/([^)#?]+)(?:[#?][^)]*)?\)/g)) {
    assets.add(match[1]);
  }
  return assets;
}

function xhtmlDocument(title, body) {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${language === 'es' ? 'es-419' : 'en'}" xml:lang="${language === 'es' ? 'es-419' : 'en'}">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="../styles.css" />
</head>
<body>
${body}
</body>
</html>
`;
}

async function renderChapters(renderer) {
  const rendered = [];
  const diagramAssets = new Set();

  for (const [index, chapter] of pdfChapters.entries()) {
    const fullPath = path.join(docsRoot, chapter.path);
    const raw = await fs.readFile(fullPath, 'utf8');
    const { markdown: diagramMarkdown, assets } = await replaceMermaidWithDiagramImages(stripFrontmatter(raw).trim(), chapter.path, renderer, {
      linkPrefix: '../assets/diagrams'
    });
    for (const asset of assets) diagramAssets.add(asset);
    const markdown = rewriteLinks(diagramMarkdown, chapter.path);
    for (const asset of collectEpubDiagramAssets(markdown)) diagramAssets.add(asset);
    const fallbackTitle = chapterLabel(chapter);
    const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? fallbackTitle;
    const body = [
      `<p class="chapter-label">${escapeXml(fallbackTitle)}</p>`,
      md.render(markdown || `# ${title}`)
    ].join('\n');

    rendered.push({
      id: `chapter-${index + 1}`,
      href: `chapters/chapter-${index + 1}.xhtml`,
      title,
      label: fallbackTitle,
      content: xhtmlDocument(title, body)
    });
  }

  return {
    chapters: rendered,
    diagramAssets: [...diagramAssets].sort()
  };
}

function coverDocument() {
  const body = `
<section class="cover">
  <h1>Agentic Systems Patterns</h1>
  <p>A practical reference for modern agent architecture: goals, loops, tools, skills, memory, protocols, multi-agent systems, and production runtimes.</p>
  <dl>
    <dt>Edition</dt><dd>${edition}</dd>
    <dt>Primary reader</dt><dd><a href="${siteUrl}">${siteUrl}</a></dd>
    <dt>Courtesy EPUB</dt><dd><a href="${epubUrl}">${epubUrl}</a></dd>
    <dt>Repository</dt><dd><a href="${repoUrl}">${repoUrl}</a></dd>
  </dl>
  <p class="license">Content licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0). Code examples licensed under MIT.</p>
</section>`;
  return xhtmlDocument('Agentic Systems Patterns', body);
}

function navDocument(chapters) {
  const items = chapters
    .map(chapter => `<li><a href="${chapter.href}">${escapeXml(chapter.label)}</a></li>`)
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language === 'es' ? 'es-419' : 'en'}" xml:lang="${language === 'es' ? 'es-419' : 'en'}">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="cover.xhtml">Cover</a></li>
      ${items}
    </ol>
  </nav>
</body>
</html>
`;
}

function packageDocument(chapters, diagramAssets) {
  const manifestItems = chapters
    .map(chapter => `<item id="${chapter.id}" href="${chapter.href}" media-type="application/xhtml+xml" />`)
    .join('\n    ');
  const diagramItems = diagramAssets
    .map((asset, index) => `<item id="diagram-${index + 1}" href="assets/diagrams/${escapeXml(asset)}" media-type="image/svg+xml" />`)
    .join('\n    ');
  const spineItems = chapters
    .map(chapter => `<itemref idref="${chapter.id}" />`)
    .join('\n    ');

  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
    <dc:identifier id="book-id">https://gturitto.github.io/Agentic-Systems-Patterns/</dc:identifier>
    <dc:title>Agentic Systems Patterns</dc:title>
    <dc:creator>Giuseppe Turitto</dc:creator>
    <dc:language>${language === 'es' ? 'es-419' : 'en'}</dc:language>
    <dc:date>${edition}</dc:date>
    <dc:rights>Content licensed under CC BY-NC-SA 4.0. Code examples licensed under MIT.</dc:rights>
    <meta property="dcterms:modified">${edition}T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml" />
    <item id="styles" href="styles.css" media-type="text/css" />
    ${manifestItems}
    ${diagramItems}
  </manifest>
  <spine>
    <itemref idref="cover" />
    ${spineItems}
  </spine>
</package>
`;
}

const containerDocument = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>
`;

const stylesheet = `
body {
  color: #202124;
  font-family: serif;
  line-height: 1.55;
}

h1, h2, h3 {
  color: #173f4f;
}

pre, code {
  background: #f3f6f7;
  font-family: monospace;
}

pre {
  border: 1px solid #d9e2e6;
  padding: 0.75rem;
  white-space: pre-wrap;
}

blockquote {
  border-left: 0.25rem solid #b7791f;
  color: #4f5b62;
  padding-left: 0.75rem;
}

table {
  border-collapse: collapse;
  width: 100%;
}

img.diagram-asset {
  display: block;
  height: auto;
  margin: 1rem auto;
  max-height: 72vh;
  max-width: 100%;
  object-fit: contain;
  width: 100%;
}

td, th {
  border: 1px solid #d9e2e6;
  padding: 0.35rem;
  vertical-align: top;
}

.chapter-label,
.license {
  color: #7f321c;
  font-size: 0.85rem;
  font-weight: bold;
}
`;

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime() {
  return { time: 0, date: 33 };
}

function zipArchive(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, date } = dosDateTime();

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content, 'utf8');
    const crc = crc32(content);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(content.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    localParts.push(local, name, content);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(content.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);

    centralParts.push(central, name);
    offset += local.length + name.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

async function main() {
  await resetGeneratedMermaidArtifacts();
  const mermaidRenderer = await createMermaidSvgRenderer();
  let rendered;
  try {
    rendered = await renderChapters(mermaidRenderer);
  } finally {
    await mermaidRenderer.close();
  }
  const { chapters, diagramAssets } = rendered;
  const entries = [
    { name: 'mimetype', content: 'application/epub+zip' },
    { name: 'META-INF/container.xml', content: containerDocument },
    { name: 'OEBPS/content.opf', content: packageDocument(chapters, diagramAssets) },
    { name: 'OEBPS/nav.xhtml', content: navDocument(chapters) },
    { name: 'OEBPS/cover.xhtml', content: coverDocument() },
    { name: 'OEBPS/styles.css', content: stylesheet },
    ...chapters.map(chapter => ({ name: `OEBPS/${chapter.href}`, content: chapter.content })),
    ...(await Promise.all(diagramAssets.map(async asset => ({
      name: `OEBPS/assets/diagrams/${asset}`,
      content: await fs.readFile(path.join(diagramsRoot, asset))
    }))))
  ];

  const epub = zipArchive(entries);
  const epubPath = path.join(releasesRoot, epubName);
  const publicEpubPath = path.join(publicReleasesRoot, epubName);

  await fs.mkdir(releasesRoot, { recursive: true });
  await fs.mkdir(publicReleasesRoot, { recursive: true });
  await fs.writeFile(epubPath, epub);
  await fs.copyFile(epubPath, publicEpubPath);

  console.log(`EPUB written to ${epubPath}`);
  console.log(`Deploy copy written to ${publicEpubPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
