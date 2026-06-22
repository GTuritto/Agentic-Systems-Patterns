import fs from 'node:fs/promises';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import type { SiteChapter } from './book-manifest.ts';
import { siteChapters } from './book-manifest.ts';
import { localizedBase, siteBase, type Language } from './i18n.ts';

const repoRoot = path.resolve(process.cwd(), '..');
const docsRoot = path.join(repoRoot, 'book', 'docs');
const spanishDocsRoot = path.join(repoRoot, 'book', 'docs-es');

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

const defaultHeadingOpen = md.renderer.rules.heading_open ?? ((tokens: any, idx: any, options: any, _env: any, self: any) => {
  return self.renderToken(tokens, idx, options);
});
const defaultFence = md.renderer.rules.fence ?? ((tokens: any, idx: any, options: any, _env: any, self: any) => {
  return self.renderToken(tokens, idx, options);
});

md.renderer.rules.heading_open = (tokens: any, idx: any, options: any, env: any, self: any) => {
  const nextToken = tokens[idx + 1];
  if (nextToken?.type === 'inline') {
    env.headingCounts ??= new Map<string, number>();
    const baseSlug = slugifyHeading(nextToken.content);
    const count = env.headingCounts.get(baseSlug) ?? 0;
    env.headingCounts.set(baseSlug, count + 1);
    tokens[idx].attrSet('id', count === 0 ? baseSlug : `${baseSlug}-${count + 1}`);
  }

  return defaultHeadingOpen(tokens, idx, options, env, self);
};

md.renderer.rules.fence = (tokens: any, idx: any, options: any, env: any, self: any) => {
  if (tokens[idx].info.trim().split(/\s+/)[0] === 'mermaid') {
    return `<div class="mermaid">${md.utils.escapeHtml(tokens[idx].content)}</div>`;
  }

  return defaultFence(tokens, idx, options, env, self);
};

function docsRootForLanguage(language: Language) {
  return language === 'es' ? spanishDocsRoot : docsRoot;
}

function normalizeMarkdownTarget(target: string, fromChapterPath: string, language: Language) {
  const [rawPath, hash] = target.split('#');
  const hashSuffix = hash ? `#${hash}` : '';
  const base = localizedBase(language);

  if (rawPath.startsWith('../public/')) {
    return `${siteBase}/${rawPath.slice('../public/'.length)}${hashSuffix}`;
  }

  if (rawPath.startsWith('/downloads/') || rawPath.startsWith('/diagrams/') || rawPath.startsWith('/brand/') || rawPath.startsWith('/releases/')) {
    return `${siteBase}${rawPath}${hashSuffix}`;
  }

  if (rawPath.startsWith('/capstone-assets/')) {
    return `${siteBase}${rawPath}${hashSuffix}`;
  }

  if (rawPath.startsWith('/')) {
    const slug = rawPath.replace(/^\//, '').replace(/\/$/, '');
    if (siteChapters.some(chapter => chapter.slug === slug)) {
      return `${base}/book/${slug}/${hashSuffix}`;
    }
    return `${base}${rawPath}${hashSuffix}`;
  }

  if (rawPath.endsWith('.md')) {
    const fromDir = path.posix.dirname(fromChapterPath);
    const resolved = path.posix.normalize(path.posix.join(fromDir, rawPath));
    const slug = resolved.replace(/\.md$/, '').replace(/\/index$/, '');
    return `${base}/book/${slug}/${hashSuffix}`;
  }

  return target;
}

function rewriteLinks(markdown: string, fromChapterPath: string, language: Language) {
  return markdown.replace(/\]\((?!https?:\/\/|mailto:|#)([^)]+)\)/g, (_match, target) => {
    return `](${normalizeMarkdownTarget(target, fromChapterPath, language)})`;
  });
}

function wordCount(markdown: string) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, ' ');
  const words = withoutCode.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g);
  return words?.length ?? 0;
}

function chapterSummary(markdown: string) {
  const paragraphs = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\n{2,}/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph =>
      paragraph &&
      !paragraph.startsWith('#') &&
      !paragraph.startsWith('|') &&
      !paragraph.startsWith('>') &&
      !paragraph.startsWith('![') &&
      !paragraph.startsWith('- ') &&
      !/^\d+\./.test(paragraph)
    );

  const summary = paragraphs[0]
    ?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!summary) return 'A chapter from Agentic Systems Patterns.';
  return summary.length > 180 ? `${summary.slice(0, 177).trim()}...` : summary;
}

export async function renderChapter(chapter: SiteChapter, language: Language = 'en') {
  const filePath = path.join(docsRootForLanguage(language), chapter.path);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = matter(raw);
  const body = rewriteLinks(parsed.content.trim(), chapter.path, language);
  const words = wordCount(parsed.content);
  return {
    title: parsed.data.title ?? chapter.title,
    html: md.render(body, { headingCounts: new Map<string, number>() }),
    summary: chapterSummary(parsed.content),
    wordCount: words,
    readingMinutes: Math.max(1, Math.ceil(words / 220))
  };
}
