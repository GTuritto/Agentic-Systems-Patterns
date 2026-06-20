import fs from 'node:fs/promises';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import type { SiteChapter } from './book-manifest.ts';
import { siteBase, siteChapters } from './book-manifest.ts';

const repoRoot = path.resolve(process.cwd(), '..');
const docsRoot = path.join(repoRoot, 'book', 'docs');

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

function normalizeMarkdownTarget(target: string, fromChapterPath: string) {
  const [rawPath, hash] = target.split('#');
  const hashSuffix = hash ? `#${hash}` : '';

  if (rawPath.startsWith('../public/')) {
    return `${siteBase}/${rawPath.slice('../public/'.length)}${hashSuffix}`;
  }

  if (rawPath.startsWith('/downloads/') || rawPath.startsWith('/diagrams/') || rawPath.startsWith('/brand/') || rawPath.startsWith('/releases/')) {
    return `${siteBase}${rawPath}${hashSuffix}`;
  }

  if (rawPath.startsWith('/')) {
    const slug = rawPath.replace(/^\//, '').replace(/\/$/, '');
    if (siteChapters.some(chapter => chapter.slug === slug)) {
      return `${siteBase}/book/${slug}/${hashSuffix}`;
    }
    return `${siteBase}${rawPath}${hashSuffix}`;
  }

  if (rawPath.endsWith('.md')) {
    const fromDir = path.posix.dirname(fromChapterPath);
    const resolved = path.posix.normalize(path.posix.join(fromDir, rawPath));
    const slug = resolved.replace(/\.md$/, '').replace(/\/index$/, '');
    return `${siteBase}/book/${slug}/${hashSuffix}`;
  }

  return target;
}

function rewriteLinks(markdown: string, fromChapterPath: string) {
  return markdown.replace(/\]\((?!https?:\/\/|mailto:|#)([^)]+)\)/g, (_match, target) => {
    return `](${normalizeMarkdownTarget(target, fromChapterPath)})`;
  });
}

export async function renderChapter(chapter: SiteChapter) {
  const filePath = path.join(docsRoot, chapter.path);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = matter(raw);
  const body = rewriteLinks(parsed.content.trim(), chapter.path);
  return {
    title: parsed.data.title ?? chapter.title,
    html: md.render(body)
  };
}
