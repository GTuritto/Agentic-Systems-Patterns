// @ts-expect-error The shared book manifest is authored as ESM JavaScript.
import { bookChapters, bookSections, sidebarGroups } from '../../../book/scripts/book-manifest.mjs';

type BookChapter = {
  id: string;
  title: string;
  path: string;
  sectionId: string;
};

type SidebarItem = {
  text: string;
  path: string;
};

type SidebarGroup = {
  text: string;
  items: SidebarItem[];
};

export type SiteChapter = {
  id: string;
  title: string;
  path: string;
  sectionId: string;
  slug: string;
};

export const siteBase = '/Agentic-Systems-Patterns';

export const sectionDescriptions = new Map([
  ['front-matter', 'Orientation, selection criteria, and pattern composition.'],
  ['foundations', 'Core agent primitives: loops, tools, state, context, and outputs.'],
  ['agent-engineering-practice', 'Engineering workflow, evaluation, security, UX, and operating discipline.'],
  ['control-loops', 'Planning, reflection, evaluator-optimizer, and self-healing control patterns.'],
  ['memory-knowledge', 'Working memory, long-term memory, RAG, and knowledge-bound behavior.'],
  ['tools-skills-protocols', 'Tool contracts, skills, MCP, A2A, approval gates, and secure communication.'],
  ['multi-agent-systems', 'Topology choices, delegation, supervisors, parallelism, and consensus.'],
  ['systems-architecture', 'Reference architectures for agentic services, RAG, coding, personal agents, and domains.'],
  ['production-runtime', 'Runtime controls, observability, policy, budgets, durable workflows, and events.'],
  ['hands-on-labs', 'Practical implementation paths and vertical slices.'],
  ['deprecated', 'Historical patterns retained for context.'],
  ['publishing', 'Release, publishing, and maintenance notes.']
]);

export const sectionUseWhen = new Map([
  ['front-matter', 'Use when you need to choose, compare, or combine patterns before implementation.'],
  ['foundations', 'Use when you need the basic building blocks of any agentic system.'],
  ['agent-engineering-practice', 'Use when moving from demo behavior to engineered, testable agent systems.'],
  ['control-loops', 'Use when the agent needs structured reasoning, correction, or iterative execution.'],
  ['memory-knowledge', 'Use when the system must retrieve, remember, budget, or verify knowledge.'],
  ['tools-skills-protocols', 'Use when agents need safe external capabilities or communication protocols.'],
  ['multi-agent-systems', 'Use when one agent is not enough and work must be split or coordinated.'],
  ['systems-architecture', 'Use when designing full systems, services, reference architectures, or domain agents.'],
  ['production-runtime', 'Use when operating agents under real constraints: cost, policy, evals, events, and durability.'],
  ['hands-on-labs', 'Use when you want implementation practice and vertical slices.'],
  ['deprecated', 'Use when comparing modern patterns with historical terminology.'],
  ['publishing', 'Use when preparing releases or maintaining publishing outputs.']
]);

function chapterSlug(chapterPath: string) {
  return chapterPath.replace(/\.md$/, '').replace(/\/index$/, '');
}

const typedBookChapters = bookChapters as BookChapter[];
const typedSidebarGroups = sidebarGroups as SidebarGroup[];

export const siteSections = bookSections;

export const siteChapters: SiteChapter[] = typedBookChapters.map((chapter: BookChapter) => ({
  id: chapter.id,
  title: chapter.title,
  path: chapter.path,
  sectionId: chapter.sectionId,
  slug: chapterSlug(chapter.path)
}));

export const siteSidebarGroups = typedSidebarGroups.map((group: SidebarGroup) => ({
  ...group,
  items: group.items.map((item: SidebarItem) => ({
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

export function relatedChapters(slug: string, limit = 4) {
  const current = chapterBySlug(slug);
  if (!current) return [];

  const sectionChapters = siteChapters.filter(chapter => chapter.sectionId === current.sectionId);
  const currentIndex = sectionChapters.findIndex(chapter => chapter.slug === slug);
  const ordered = [
    ...sectionChapters.slice(currentIndex + 1),
    ...sectionChapters.slice(0, currentIndex)
  ];

  return ordered.filter(chapter => chapter.slug !== slug).slice(0, limit);
}

export function chaptersForSection(sectionId: string) {
  return siteChapters.filter(chapter => chapter.sectionId === sectionId);
}
