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

function chapterSlug(chapterPath: string) {
  return chapterPath.replace(/\.md$/, '').replace(/\/index$/, '');
}

export const siteSections = bookSections;

export const siteChapters: SiteChapter[] = bookChapters.map(chapter => ({
  id: chapter.id,
  title: chapter.title,
  path: chapter.path,
  sectionId: chapter.sectionId,
  slug: chapterSlug(chapter.path)
}));

export const siteSidebarGroups = sidebarGroups.map(group => ({
  ...group,
  items: group.items.map(item => ({
    ...item,
    href: `${siteBase}/book/${chapterSlug(item.path)}/`
  }))
}));

export function chapterBySlug(slug: string) {
  return siteChapters.find(chapter => chapter.slug === slug);
}

export function chapterNavigation(slug: string) {
  const index = siteChapters.findIndex(chapter => chapter.slug === slug);
  return {
    previous: index > 0 ? siteChapters[index - 1] : undefined,
    next: index >= 0 && index < siteChapters.length - 1 ? siteChapters[index + 1] : undefined
  };
}
