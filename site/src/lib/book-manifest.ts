// @ts-expect-error The shared book manifest is authored as ESM JavaScript.
import { bookChapters, bookSections, sidebarGroups } from '../../../book/scripts/book-manifest.mjs';

export type SiteChapter = {
  id: string;
  title: string;
  path: string;
  sectionId: string;
  slug: string;
};

export const siteBase = '/Agentic-Systems-Patterns';

export const spikeChapterPaths = new Set([
  'intro.md',
  'pattern-selection/choosing-the-right-pattern.md',
  'tools-skills-protocols/tool-capability-design.md',
  'multi-agent-systems/choosing-multi-agent-topology.md',
  'systems-architecture/coding-agents.md'
]);

function chapterSlug(chapterPath: string) {
  return chapterPath.replace(/\.md$/, '').replace(/\/index$/, '');
}

export const siteSections = bookSections;

export const siteChapters: SiteChapter[] = bookChapters
  .filter(chapter => spikeChapterPaths.has(chapter.path))
  .map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    path: chapter.path,
    sectionId: chapter.sectionId,
    slug: chapterSlug(chapter.path)
  }));

export const siteSidebarGroups = sidebarGroups.map(group => ({
  ...group,
  items: group.items
    .filter(item => spikeChapterPaths.has(item.path))
    .map(item => ({
      ...item,
      href: `${siteBase}/book/${chapterSlug(item.path)}/`
    }))
})).filter(group => group.items.length > 0);

export function chapterBySlug(slug: string) {
  return siteChapters.find(chapter => chapter.slug === slug);
}
