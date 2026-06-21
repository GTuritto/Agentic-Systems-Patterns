// @ts-expect-error The shared book manifest is authored as ESM JavaScript.
import { bookChapters, bookSections, sidebarGroups } from '../../../book/scripts/book-manifest.mjs';
// @ts-expect-error The shared pattern manifest is authored as ESM JavaScript.
import { patterns } from '../../../book/scripts/pattern-manifest.mjs';

type BookChapter = {
  id: string;
  title: string;
  path: string;
  sectionId: string;
  ownership?: string;
};

type SidebarItem = {
  text: string;
  path: string;
};

type SidebarGroup = {
  text: string;
  items: SidebarItem[];
};

type PatternManifestItem = {
  chapterPath: string;
  summary: string;
};

export type SiteChapter = {
  id: string;
  title: string;
  path: string;
  sectionId: string;
  slug: string;
  type: string;
  difficulty: string;
  effort: string;
  readerPaths: string[];
};

export const siteBase = '/Agentic-Systems-Patterns';

export const featuredChapterIds = [
  'choosing-the-right-pattern',
  'agent-loop',
  'tool-use',
  'semantic-recall-rag',
  'task-delegation',
  'observability-and-evals'
];

export const sectionDescriptions = new Map([
  ['front-matter', 'Orientation chapters that define the book, the reader paths, and the basic agent model.'],
  ['pattern-selection', 'Decision guides for choosing, scoring, composing, routing, budgeting, and hardening patterns before implementation.'],
  ['foundations', 'Runtime primitives every agentic system depends on: single agents, loops, state, tools, and structured outputs.'],
  ['agent-engineering-practice', 'Engineering workflow, harnesses, runtime primitives, framework choices, setup notes, and worksheets.'],
  ['evaluation-security-trust', 'Evaluation, threat modeling, sandboxing, policy trust, and UX controls for systems that affect users.'],
  ['control-loops', 'Planning, reflection, evaluator-optimizer, and self-healing control patterns.'],
  ['memory-knowledge', 'Context assembly, working sets, durable memory, semantic recall, RAG, and knowledge-bound behavior.'],
  ['tools-skills-protocols', 'Tool contracts, skills, MCP, A2A, approval gates, and secure communication.'],
  ['multi-agent-systems', 'Topology choices, delegation, supervisors, parallelism, and consensus.'],
  ['systems-architecture', 'Reference architectures for agentic services, RAG, coding, personal agents, and domains.'],
  ['production-runtime', 'Runtime controls, observability, policy, budgets, durable workflows, and events.'],
  ['hands-on-labs', 'Practical implementation paths and vertical slices.'],
  ['capstone-projects', 'Complete product-shaped examples that combine patterns, evals, traces, ADRs, runbooks, and rollout controls.'],
  ['deprecated', 'Historical patterns retained for context.'],
  ['publishing', 'Release, publishing, and maintenance notes.']
]);

export const sectionUseWhen = new Map([
  ['front-matter', 'Use when you are starting the book or need the shortest path into the material.'],
  ['pattern-selection', 'Use when you need to choose, compare, combine, or constrain patterns before implementation.'],
  ['foundations', 'Use when you need the basic runtime building blocks of any agentic system.'],
  ['agent-engineering-practice', 'Use when moving from demo behavior to engineered, framework-backed agent systems.'],
  ['evaluation-security-trust', 'Use when behavior quality, risk, safety, human trust, or release gates matter.'],
  ['control-loops', 'Use when the agent needs structured reasoning, correction, or iterative execution.'],
  ['memory-knowledge', 'Use when the system must assemble context, retrieve evidence, remember facts, or verify knowledge.'],
  ['tools-skills-protocols', 'Use when agents need safe external capabilities or communication protocols.'],
  ['multi-agent-systems', 'Use when one agent is not enough and work must be split or coordinated.'],
  ['systems-architecture', 'Use when designing full systems, services, reference architectures, or domain agents.'],
  ['production-runtime', 'Use when operating agents under real constraints: cost, policy, evals, events, and durability.'],
  ['hands-on-labs', 'Use when you want implementation practice and vertical slices.'],
  ['capstone-projects', 'Use when you want to see how multiple patterns combine into reviewable systems.'],
  ['deprecated', 'Use when comparing modern patterns with historical terminology.'],
  ['publishing', 'Use when preparing releases or maintaining publishing outputs.']
]);

function chapterSlug(chapterPath: string) {
  return chapterPath.replace(/\.md$/, '').replace(/\/index$/, '');
}

function chapterType(chapter: BookChapter) {
  if (chapter.sectionId === 'hands-on-labs') return 'Lab';
  if (chapter.sectionId === 'capstone-projects') return 'Capstone';
  if (chapter.sectionId === 'publishing' || chapter.sectionId === 'deprecated') return 'Reference';
  if (chapter.path.includes('glossary') || chapter.path.includes('logical-groups') || chapter.path.includes('content-index') || chapter.path.includes('production-gate')) return 'Reference';
  if (chapter.sectionId === 'front-matter') return 'Concept';
  if (chapter.path.includes('checklist') || chapter.path.includes('matrix') || chapter.path.includes('templates') || chapter.path.includes('source-map')) {
    return 'Reference';
  }
  if (chapter.ownership === 'generated') return 'Pattern';
  return 'Guide';
}

function chapterDifficulty(chapter: BookChapter) {
  if (chapter.sectionId === 'front-matter' || chapter.sectionId === 'foundations') return 'Beginner';
  if (chapter.sectionId === 'hands-on-labs') return 'Hands-on';
  if (['evaluation-security-trust', 'multi-agent-systems', 'systems-architecture', 'production-runtime', 'capstone-projects'].includes(chapter.sectionId)) {
    return 'Advanced';
  }
  return 'Intermediate';
}

function chapterEffort(chapter: BookChapter) {
  if (chapter.sectionId === 'hands-on-labs') return '45-90 min lab';
  if (chapter.sectionId === 'capstone-projects') return '60-120 min review';
  if (chapter.sectionId === 'publishing') return '10-25 min reference';
  if (chapter.sectionId === 'deprecated') return '10-20 min translation';
  if (chapter.path.includes('templates') || chapter.path.includes('checklist') || chapter.path.includes('matrix') || chapter.path.includes('source-map')) {
    return '10-20 min reference';
  }
  if (chapter.sectionId === 'systems-architecture' || chapter.sectionId === 'production-runtime') return '20-35 min design review';
  if (chapter.sectionId === 'agent-engineering-practice') return '15-30 min implementation review';
  if (chapter.ownership === 'generated') return '12-25 min pattern review';
  return '10-20 min read';
}

function chapterReaderPaths(chapter: BookChapter) {
  const pathsBySection = new Map<string, string[]>([
    ['front-matter', ['Student', 'Architect']],
    ['pattern-selection', ['Architect', 'Reviewer']],
    ['foundations', ['Builder', 'Student']],
    ['agent-engineering-practice', ['Builder', 'Architect']],
    ['evaluation-security-trust', ['Reviewer', 'Security']],
    ['control-loops', ['Builder', 'Architect']],
    ['memory-knowledge', ['Builder', 'Architect']],
    ['tools-skills-protocols', ['Builder', 'Security']],
    ['multi-agent-systems', ['Architect', 'Builder']],
    ['systems-architecture', ['Architect', 'Operator']],
    ['production-runtime', ['Operator', 'Reviewer']],
    ['hands-on-labs', ['Builder', 'Student']],
    ['capstone-projects', ['Architect', 'Reviewer']],
    ['deprecated', ['Architect', 'Student']],
    ['publishing', ['Operator', 'Reviewer']]
  ]);

  const readerPaths = [...(pathsBySection.get(chapter.sectionId) ?? ['Builder'])];
  const type = chapterType(chapter);

  if (type === 'Lab') readerPaths.push('Student');
  if (type === 'Capstone') readerPaths.push('Builder');
  if (chapter.path.includes('security') || chapter.path.includes('threat') || chapter.path.includes('policy')) readerPaths.push('Security');
  if (chapter.path.includes('deployment') || chapter.path.includes('runtime') || chapter.path.includes('release')) readerPaths.push('Operator');

  return [...new Set(readerPaths)].slice(0, 3);
}

const typedBookChapters = bookChapters as BookChapter[];
const typedSidebarGroups = sidebarGroups as SidebarGroup[];
const patternSummaryByPath = new Map(
  (patterns as PatternManifestItem[]).map(pattern => [pattern.chapterPath, pattern.summary])
);
const authoredSummaryByPath = new Map([
  ['intro.md', 'The introduction defines the book promise: practical agentic system patterns, clear ownership boundaries, and release-quality evidence.'],
  ['publishing/how-to-read.md', 'This guide maps the book to reader goals: learning the field, choosing a pattern, building a lab, reviewing production risk, or publishing the book.'],
  ['publishing/logical-groups.md', 'Logical Groups organizes the chapters into a reading order that moves from foundations to selection, implementation, runtime, labs, and capstones.'],
  ['foundations/what-is-an-agent.md', 'This chapter defines an agent as a loop around goals, state, tools, context, decisions, and stop conditions.'],
  ['publishing/glossary.md', 'The glossary stabilizes the vocabulary used across the book so terms like state, memory, tool, policy, eval, and trace stay precise.'],
  ['publishing/ten-out-of-ten-production-gate.md', 'The 10/10 Production Gate defines the release bar for agentic systems that affect users, money, data, or operations.'],
  ['pattern-selection/architecture-before-autonomy.md', 'Architecture Before Autonomy explains why ownership, policy, state, evals, and rollback should come before adding agentic behavior.'],
  ['pattern-selection/choosing-the-right-pattern.md', 'Choosing the Right Pattern helps you select the least agentic architecture that can meet the workload with acceptable quality, cost, latency, and risk.'],
  ['pattern-selection/pattern-evaluation-checklist.md', 'The evaluation checklist turns pattern choice into reviewable evidence: use cases, avoid cases, failure modes, evals, and release blockers.'],
  ['pattern-selection/pattern-classification-mind-map.md', 'The mind map gives a visual index of how agentic system patterns relate across control, memory, tools, runtime, and multi-agent design.'],
  ['pattern-selection/from-patterns-to-systems.md', 'This chapter shows how individual patterns compose into systems with explicit state, tools, policy, evals, runtime, and ownership.'],
  ['pattern-selection/pattern-composition-playbook.md', 'The playbook shows common pattern combinations and the controls needed when loops, tools, memory, routing, and evaluation meet.'],
  ['pattern-selection/prompt-chaining-and-gates.md', 'Prompt Chaining and Gates covers fixed multi-step model workflows where software validates each stage before the next one runs.'],
  ['pattern-selection/routing-and-handoffs.md', 'Routing and Handoffs explains how to send work to the right model, tool, agent, policy, or human without hiding authority boundaries.'],
  ['pattern-selection/resource-aware-agent-design.md', 'Resource-Aware Agent Design helps bound token use, latency, tool calls, model choice, retries, and operating cost before autonomy expands.'],
  ['pattern-selection/circuit-breakers-fallbacks-replay.md', 'Circuit Breakers, Fallbacks, and Replay describes the controls that stop bad runs, preserve evidence, and recover from failure.'],
  ['pattern-selection/source-map.md', 'The Source Map connects external agent-pattern references to this book’s chapters and explains how each source informs the catalog.'],
  ['agent-engineering-practice/agent-development-lifecycle.md', 'The lifecycle chapter turns agent work into an engineering process: design, harness, eval, trace, review, rollout, and maintenance.'],
  ['agent-engineering-practice/agent-harnesses.md', 'Agent Harnesses explains the controlled environment around an agent: instructions, tools, permissions, state, evals, traces, and approvals.'],
  ['agent-engineering-practice/building-a-minimal-agent-runtime.md', 'This chapter shows the smallest runtime shape that can run an agent with goals, state, tools, policies, traces, and stop reasons.'],
  ['agent-engineering-practice/agent-engineer-toolkit.md', 'The toolkit chapter helps choose the engineering surfaces needed for governable tools, prompts, evals, traces, memory, and deployment.'],
  ['agent-engineering-practice/framework-selection.md', 'Framework Selection helps compare agent frameworks by state, tools, workflows, evals, deployment, observability, and team fit.'],
  ['agent-engineering-practice/cross-framework-decision-matrix.md', 'The matrix compares framework options so teams can choose based on runtime needs instead of vendor excitement.'],
  ['agent-engineering-practice/real-framework-setup-notes.md', 'Setup notes capture practical framework setup concerns: local runs, environment variables, examples, tests, and release evidence.'],
  ['agent-engineering-practice/templates-and-worksheets.md', 'Templates and Worksheets provide reusable review artifacts for design, evaluation, production readiness, and release evidence.'],
  ['agent-engineering-practice/evaluation-driven-agent-development.md', 'Evaluation-Driven Agent Development shows how to make evals part of design, implementation, release, and incident learning.'],
  ['agent-engineering-practice/agent-threat-model.md', 'The threat model chapter identifies attack paths specific to agents: prompt injection, unsafe tools, memory poisoning, data leaks, and overbroad authority.'],
  ['agent-engineering-practice/agent-security-and-sandboxing.md', 'Security and Sandboxing explains how to restrict execution, isolate tools, protect data, and keep model proposals behind policy gates.'],
  ['agent-engineering-practice/agent-ux-and-human-trust.md', 'Agent UX and Human Trust shows how to present capability, uncertainty, approvals, reversibility, and evidence so users can judge the system.'],
  ['foundations/context-budgets-and-working-sets.md', 'Context Budgets and Working Sets explains how to select, label, compress, retrieve, and drop context before it becomes hidden risk.'],
  ['tools-skills-protocols/tool-capability-design.md', 'Tool Capability Design shows how to expose external actions through narrow schemas, permissions, examples, traces, and safe errors.'],
  ['multi-agent-systems/choosing-multi-agent-topology.md', 'Choosing Multi-Agent Topology helps decide when to use supervisors, delegation, parallel agents, consensus, or simpler single-agent designs.'],
  ['systems-architecture/agentic-system-architecture.md', 'Agentic System Architecture maps how loops, tools, memory, policy, evals, runtime, and product services fit into one system.'],
  ['systems-architecture/agents-as-services.md', 'Agents As Services explains how to package agent behavior behind APIs, queues, contracts, observability, and operational ownership.'],
  ['systems-architecture/agentic-rag-systems.md', 'Agentic RAG Systems shows how retrieval, planning, evidence checks, refusal, and escalation work together in source-grounded answers.'],
  ['systems-architecture/open-personal-agent-architectures.md', 'Open Personal Agent Architectures explores user-owned agents with explicit consent, local context, safe tools, memory boundaries, and portability.'],
  ['systems-architecture/coding-agents.md', 'Coding Agents covers agent loops for software work: repository context, planning, edits, tests, review, handoff, and rollback.'],
  ['systems-architecture/computer-use-agents.md', 'Computer-Use Agents explains how to govern screen-based actions with observation limits, action spaces, approvals, traces, and recovery.'],
  ['systems-architecture/domain-agent-architectures.md', 'Domain Agent Architectures shows how to constrain agents in high-stakes fields with policy, evidence, reviewer roles, and domain ownership.'],
  ['systems-architecture/architecture-decision-records.md', 'Architecture Decision Records make agentic design choices reviewable when authority, tools, memory, evals, or rollback change.'],
  ['systems-architecture/reference-architecture.md', 'The reference architecture defines production ownership boundaries around models, tools, policy, state, memory, evals, approvals, and traces.'],
  ['production-runtime/overview.md', 'Production Runtime Overview defines the control plane that admits work, validates proposals, owns state, enforces policy, and records evidence.'],
  ['production-runtime/deployment-walkthrough.md', 'Deployment Walkthrough turns an agentic system into a release path with local evidence, gates, canaries, rollback, and incident learning.'],
  ['production-runtime/production-evaluation-feedback-loops.md', 'Production Evaluation Feedback Loops explain how incidents, near misses, traces, and user feedback become regression tests and release gates.'],
  ['production-runtime/cost-controls-runtime-budgets.md', 'Cost Controls and Runtime Budgets show how to cap model calls, tokens, tools, retries, latency, and spend before runs become unbounded.'],
  ['hands-on-labs/index.md', 'The lab guide explains how to use runnable examples to connect patterns to code, tests, traces, and production gaps.'],
  ['hands-on-labs/framework-language-matrix.md', 'The framework and language matrix maps each lab to its language, framework style, runtime concern, and expected evidence.'],
  ['hands-on-labs/production-readiness-checklist.md', 'The lab checklist helps turn working demos into production candidates by naming the missing controls, evals, traces, and runbooks.'],
  ['hands-on-labs/lab-01-tool-using-agent.md', 'Lab 01 builds the smallest useful tool boundary: validate a proposed call, execute through code, label trust, and return structured results.'],
  ['hands-on-labs/lab-02-agent-loop-and-planning.md', 'Lab 02 separates planning from execution so the planner proposes steps while bounded code runs operations and records results.'],
  ['hands-on-labs/lab-03-agentic-rag.md', 'Lab 03 builds an Agentic RAG boundary with scoped retrieval, grounded answers, and refusal or escalation when evidence is weak.'],
  ['hands-on-labs/lab-04-a2a-communication.md', 'Lab 04 builds typed agent-to-agent messages with correlation IDs, acceptance, refusal, errors, and cancellation states.'],
  ['hands-on-labs/lab-05-multi-agent-supervisor.md', 'Lab 05 builds a supervisor shape where one coordinator owns the goal, delegates bounded work, merges outputs, and produces the final answer.'],
  ['hands-on-labs/lab-06-observability-and-evals.md', 'Lab 06 adds trace data, regression tasks, expected outcomes, and trajectory checks to evaluate behavior beyond final answers.'],
  ['hands-on-labs/lab-07-mastra-runtime-packaging.md', 'Lab 07 packages agents, tools, workflows, memory, trace events, and evals in a Mastra-style TypeScript runtime shape.'],
  ['hands-on-labs/lab-08-crewai-flows-and-crews.md', 'Lab 08 uses a CrewAI-style Python shape to separate flow ownership from specialist crew collaboration.'],
  ['hands-on-labs/from-scratch-mini-framework.md', 'The from-scratch track builds a minimal agent runtime so engineers can see the framework ideas without framework magic.'],
  ['hands-on-labs/lab-09-minimal-agent-loop.md', 'Lab 09 builds a minimal loop that receives a goal, asks for a typed decision, updates state, and stops for an explicit reason.'],
  ['hands-on-labs/lab-10-tool-registry-and-policy-gate.md', 'Lab 10 extends the mini-runtime with a tool registry and policy gate so software decides whether a proposed tool call may run.'],
  ['hands-on-labs/lab-11-context-memory-trace-evals.md', 'Lab 11 makes the mini-runtime inspectable with context packets, scoped memory reads, trace events, and trajectory evals.'],
  ['hands-on-labs/lab-12-langgraph-state-graph.md', 'Lab 12 models LangGraph-style state graphs with explicit state, nodes, edges, checkpoints, interrupts, and resume behavior.'],
  ['hands-on-labs/lab-13-autogen-transcript-evals.md', 'Lab 13 evaluates AutoGen-style team transcripts so multi-agent collaboration has reviewable messages, turn order, and stop reasons.'],
  ['hands-on-labs/vertical-slice-examples.md', 'Vertical Slice Examples show how to combine patterns into small product workflows with clear runtime and evidence boundaries.'],
  ['capstone-projects/index.md', 'Capstone Projects combine multiple patterns into reviewable system packets with traces, evals, ADRs, runbooks, and rollout controls.'],
  ['capstone-projects/support-refund-agent.md', 'The support refund capstone shows a policy-bound, approval-aware agentic workflow for evidence gathering and refund recommendations.'],
  ['capstone-projects/research-rag-agent.md', 'The research RAG capstone shows a source-grounded research assistant with retrieval, evidence checks, citation discipline, and refusal paths.'],
  ['capstone-projects/multi-agent-delivery-workflow.md', 'The delivery workflow capstone shows how specialist agents can contribute while one workflow owner keeps state, merge policy, evals, and acceptance.'],
  ['deprecated/historical-patterns.md', 'Historical Patterns translates older agent terminology into clearer current architecture language and explains why some terms were retired.'],
  ['publishing/publishing-and-releases.md', 'Publishing and Releases documents how to build, verify, package, and publish the online book and courtesy formats.'],
  ['publishing/release-readiness-checklist.md', 'The release checklist defines the evidence needed before publishing content, diagrams, links, PDF, EPUB, and GitHub Pages output.'],
  ['publishing/release-notes.md', 'Release Notes summarizes reader-facing changes, verification evidence, and known limitations for the current book release.']
]);

export const siteSections = bookSections;

export const siteChapters: SiteChapter[] = typedBookChapters.map((chapter: BookChapter) => ({
  id: chapter.id,
  title: chapter.title,
  path: chapter.path,
  sectionId: chapter.sectionId,
  slug: chapterSlug(chapter.path),
  type: chapterType(chapter),
  difficulty: chapterDifficulty(chapter),
  effort: chapterEffort(chapter),
  readerPaths: chapterReaderPaths(chapter)
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

export function chapterSearchExcerpt(chapter: SiteChapter) {
  const patternSummary = patternSummaryByPath.get(chapter.path);
  if (patternSummary) return patternSummary;

  const authoredSummary = authoredSummaryByPath.get(chapter.path);
  if (authoredSummary) return authoredSummary;

  const sectionSummary = sectionDescriptions.get(chapter.sectionId);
  if (sectionSummary) return `${chapter.type}: ${sectionSummary}`;

  return 'Open this chapter from the search results.';
}
