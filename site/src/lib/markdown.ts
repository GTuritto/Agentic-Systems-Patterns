import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import type { SiteChapter } from './book-manifest.ts';
import { siteBase } from './book-manifest.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const docsRoot = path.join(repoRoot, 'book', 'docs');

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

function normalizeMarkdownTarget(target: string, fromChapterPath: string) {
  const [rawPath, hash] = target.split('#');
  if (!rawPath.endsWith('.md')) return target;

  const fromDir = path.posix.dirname(fromChapterPath);
  const resolved = path.posix.normalize(path.posix.join(fromDir, rawPath));
  const slug = resolved.replace(/\.md$/, '').replace(/\/index$/, '');
  return `${siteBase}/book/${slug}/${hash ? `#${hash}` : ''}`;
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
