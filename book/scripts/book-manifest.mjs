function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value)) deepFreeze(nestedValue);
    Object.freeze(value);
  }
  return value;
}

export const bookSections = deepFreeze([
  { id: 'front-matter', title: 'Start Here and Pattern Selection' },
  { id: 'foundations', title: 'Foundations' },
  { id: 'agent-engineering-practice', title: 'Agent Engineering Practice' },
  { id: 'control-loops', title: 'Control Loops' },
  { id: 'memory-knowledge', title: 'Memory and Knowledge' },
  { id: 'tools-skills-protocols', title: 'Tools, Skills, and Protocols' },
  { id: 'multi-agent-systems', title: 'Multi-Agent Systems' },
  { id: 'systems-architecture', title: 'Systems Architecture' },
  { id: 'production-runtime', title: 'Production Runtime' },
  { id: 'hands-on-labs', title: 'Hands-On Labs' },
  { id: 'deprecated', title: 'Historical Patterns' },
  { id: 'publishing', title: 'Publishing Appendix' }
]);

function chapter(id, title, path, sectionId, ownership = 'authored') {
  return {
    id,
    title,
    path,
    sectionId,
    ownership,
    sidebar: true,
    pdf: true
  };
}

export const bookChapters = deepFreeze([
  chapter('introduction', 'Introduction', 'intro.md', 'front-matter'),
  chapter('how-to-read', 'How To Read This Book', 'publishing/how-to-read.md', 'front-matter'),
  chapter('what-is-an-agent', 'What Is An Agent?', 'foundations/what-is-an-agent.md', 'front-matter'),
  chapter('architecture-before-autonomy', 'Architecture Before Autonomy', 'pattern-selection/architecture-before-autonomy.md', 'front-matter'),
  chapter('choosing-the-right-pattern', 'Choosing the Right Pattern', 'pattern-selection/choosing-the-right-pattern.md', 'front-matter'),
  chapter('pattern-evaluation-checklist', 'Pattern Evaluation Checklist', 'pattern-selection/pattern-evaluation-checklist.md', 'front-matter'),
  chapter('pattern-classification-mind-map', 'Linked Pattern Mind Map', 'pattern-selection/pattern-classification-mind-map.md', 'front-matter'),
  chapter('from-patterns-to-systems', 'From Patterns To Systems', 'pattern-selection/from-patterns-to-systems.md', 'front-matter'),
  chapter('pattern-composition-playbook', 'Pattern Composition Playbook', 'pattern-selection/pattern-composition-playbook.md', 'front-matter'),
  chapter('prompt-chaining-and-gates', 'Prompt Chaining and Gates', 'pattern-selection/prompt-chaining-and-gates.md', 'front-matter'),
  chapter('routing-and-handoffs', 'Routing and Handoffs', 'pattern-selection/routing-and-handoffs.md', 'front-matter'),
  chapter('resource-aware-agent-design', 'Resource-Aware Agent Design', 'pattern-selection/resource-aware-agent-design.md', 'front-matter'),
  chapter('circuit-breakers-fallbacks-replay', 'Circuit Breakers, Fallbacks, and Replay', 'pattern-selection/circuit-breakers-fallbacks-replay.md', 'front-matter'),
  chapter('source-map', 'Source Map', 'pattern-selection/source-map.md', 'front-matter'),

  chapter('single-agent', 'Single Agent', 'foundations/single-agent.md', 'foundations', 'generated'),
  chapter('agent-loop', 'Agent Loop', 'foundations/agent-loop.md', 'foundations', 'generated'),
  chapter('goals-and-state', 'Goals and State', 'foundations/goals-and-state.md', 'foundations', 'generated'),
  chapter('tool-use', 'Tool Use', 'foundations/tool-use.md', 'foundations', 'generated'),
  chapter('structured-output', 'Structured Output', 'foundations/structured-output.md', 'foundations', 'generated'),
  chapter('context-budgets-and-working-sets', 'Context Budgets and Working Sets', 'foundations/context-budgets-and-working-sets.md', 'foundations'),
  chapter('context-engineering', 'Context Engineering', 'foundations/context-engineering.md', 'foundations', 'generated'),

  chapter('agent-development-lifecycle', 'Agent Development Lifecycle', 'agent-engineering-practice/agent-development-lifecycle.md', 'agent-engineering-practice'),
  chapter('agent-harnesses', 'Agent Harnesses', 'agent-engineering-practice/agent-harnesses.md', 'agent-engineering-practice'),
  chapter('building-a-minimal-agent-runtime', 'Building a Minimal Agent Runtime', 'agent-engineering-practice/building-a-minimal-agent-runtime.md', 'agent-engineering-practice'),
  chapter('agent-engineer-toolkit', 'Agent Engineer Toolkit', 'agent-engineering-practice/agent-engineer-toolkit.md', 'agent-engineering-practice'),
  chapter('framework-selection', 'Framework Selection', 'agent-engineering-practice/framework-selection.md', 'agent-engineering-practice'),
  chapter('cross-framework-decision-matrix', 'Cross-Framework Decision Matrix', 'agent-engineering-practice/cross-framework-decision-matrix.md', 'agent-engineering-practice'),
  chapter('evaluation-driven-agent-development', 'Evaluation-Driven Agent Development', 'agent-engineering-practice/evaluation-driven-agent-development.md', 'agent-engineering-practice'),
  chapter('agent-threat-model', 'Agent Threat Model', 'agent-engineering-practice/agent-threat-model.md', 'agent-engineering-practice'),
  chapter('agent-security-and-sandboxing', 'Agent Security and Sandboxing', 'agent-engineering-practice/agent-security-and-sandboxing.md', 'agent-engineering-practice'),
  chapter('agent-ux-and-human-trust', 'Agent UX and Human Trust', 'agent-engineering-practice/agent-ux-and-human-trust.md', 'agent-engineering-practice'),

  chapter('planning-and-execution', 'Planning and Execution', 'control-loops/planning-and-execution.md', 'control-loops', 'generated'),
  chapter('react', 'ReAct', 'control-loops/react.md', 'control-loops', 'generated'),
  chapter('reflection', 'Reflection', 'control-loops/reflection.md', 'control-loops', 'generated'),
  chapter('evaluator-optimizer', 'Evaluator-Optimizer', 'control-loops/evaluator-optimizer.md', 'control-loops', 'generated'),
  chapter('self-improvement', 'Self-Improvement', 'control-loops/self-improvement.md', 'control-loops', 'generated'),
  chapter('self-healing-workflows', 'Self-Healing Workflows', 'control-loops/self-healing-workflows.md', 'control-loops', 'generated'),

  chapter('memory-augmented-agent', 'Memory-Augmented Agent', 'memory-knowledge/memory-augmented-agent.md', 'memory-knowledge', 'generated'),
  chapter('long-term-episodic-memory', 'Long-Term Episodic Memory', 'memory-knowledge/long-term-episodic-memory.md', 'memory-knowledge', 'generated'),
  chapter('semantic-recall-rag', 'Semantic Recall and RAG', 'memory-knowledge/semantic-recall-rag.md', 'memory-knowledge', 'generated'),
  chapter('working-memory', 'Working Memory', 'memory-knowledge/working-memory.md', 'memory-knowledge', 'generated'),
  chapter('knowledge-bound-agents', 'Knowledge-Bound Agents', 'memory-knowledge/knowledge-bound-agents.md', 'memory-knowledge', 'generated'),

  chapter('skills', 'Skills', 'tools-skills-protocols/skills.md', 'tools-skills-protocols', 'generated'),
  chapter('tool-capability-design', 'Tool Capability Design', 'tools-skills-protocols/tool-capability-design.md', 'tools-skills-protocols'),
  chapter('mcp-first-tool-use', 'MCP-first Tool Use', 'tools-skills-protocols/mcp-first-tool-use.md', 'tools-skills-protocols', 'generated'),
  chapter('a2a-agent-interoperability', 'A2A Agent Interoperability', 'tools-skills-protocols/a2a-agent-interoperability.md', 'tools-skills-protocols', 'generated'),
  chapter('secure-agent-communication', 'Secure Agent Communication', 'tools-skills-protocols/secure-agent-communication.md', 'tools-skills-protocols', 'generated'),
  chapter('human-approval-gates', 'Human Approval Gates', 'tools-skills-protocols/human-approval-gates.md', 'tools-skills-protocols', 'generated'),

  chapter('choosing-multi-agent-topology', 'Choosing Multi-Agent Topology', 'multi-agent-systems/choosing-multi-agent-topology.md', 'multi-agent-systems'),
  chapter('task-delegation', 'Task Delegation', 'multi-agent-systems/task-delegation.md', 'multi-agent-systems', 'generated'),
  chapter('supervisor-worker', 'Supervisor / Worker', 'multi-agent-systems/supervisor-worker.md', 'multi-agent-systems', 'generated'),
  chapter('debate-and-consensus', 'Debate and Consensus', 'multi-agent-systems/debate-and-consensus.md', 'multi-agent-systems', 'generated'),
  chapter('parallel-agents', 'Parallel Agents', 'multi-agent-systems/parallel-agents.md', 'multi-agent-systems', 'generated'),
  chapter('crewai-flows-and-crews', 'CrewAI Flows and Crews', 'multi-agent-systems/crewai-flows-and-crews.md', 'multi-agent-systems', 'generated'),

  chapter('agentic-system-architecture', 'Agentic System Architecture', 'systems-architecture/agentic-system-architecture.md', 'systems-architecture'),
  chapter('agents-as-services', 'Agents As Services', 'systems-architecture/agents-as-services.md', 'systems-architecture'),
  chapter('agentic-rag-systems', 'Agentic RAG Systems', 'systems-architecture/agentic-rag-systems.md', 'systems-architecture'),
  chapter('open-personal-agent-architectures', 'Open Personal Agent Architectures', 'systems-architecture/open-personal-agent-architectures.md', 'systems-architecture'),
  chapter('coding-agents', 'Coding Agents', 'systems-architecture/coding-agents.md', 'systems-architecture'),
  chapter('computer-use-agents', 'Computer-Use Agents', 'systems-architecture/computer-use-agents.md', 'systems-architecture'),
  chapter('domain-agent-architectures', 'Domain Agent Architectures', 'systems-architecture/domain-agent-architectures.md', 'systems-architecture'),
  chapter('architecture-decision-records', 'Architecture Decision Records', 'systems-architecture/architecture-decision-records.md', 'systems-architecture'),
  chapter('reference-architecture', 'Reference Architecture', 'systems-architecture/reference-architecture.md', 'systems-architecture'),

  chapter('production-runtime-overview', 'Overview', 'production-runtime/overview.md', 'production-runtime'),
  chapter('durable-workflows', 'Durable Workflows', 'production-runtime/durable-workflows.md', 'production-runtime', 'generated'),
  chapter('observability-and-evals', 'Observability and Evals', 'production-runtime/observability-and-evals.md', 'production-runtime', 'generated'),
  chapter('production-evaluation-feedback-loops', 'Production Evaluation Feedback Loops', 'production-runtime/production-evaluation-feedback-loops.md', 'production-runtime'),
  chapter('cost-controls-runtime-budgets', 'Cost Controls and Runtime Budgets', 'production-runtime/cost-controls-runtime-budgets.md', 'production-runtime'),
  chapter('policy-enforcement', 'Policy Enforcement', 'production-runtime/policy-enforcement.md', 'production-runtime', 'generated'),
  chapter('event-triggered-agents', 'Event-Triggered Agents', 'production-runtime/event-triggered-agents.md', 'production-runtime', 'generated'),
  chapter('mastra-runtime', 'Mastra Runtime', 'production-runtime/mastra-runtime.md', 'production-runtime', 'generated'),

  chapter('hands-on-labs', 'Lab Guide', 'hands-on-labs/index.md', 'hands-on-labs'),
  chapter('framework-language-matrix', 'Framework and Language Matrix', 'hands-on-labs/framework-language-matrix.md', 'hands-on-labs'),
  chapter('lab-production-readiness-checklist', 'Lab Production Readiness Checklist', 'hands-on-labs/production-readiness-checklist.md', 'hands-on-labs'),
  chapter('lab-01-tool-using-agent', '01 - Tool-Using Agent', 'hands-on-labs/lab-01-tool-using-agent.md', 'hands-on-labs'),
  chapter('lab-02-agent-loop-and-planning', '02 - Agent Loop and Planning', 'hands-on-labs/lab-02-agent-loop-and-planning.md', 'hands-on-labs'),
  chapter('lab-03-agentic-rag', '03 - Agentic RAG', 'hands-on-labs/lab-03-agentic-rag.md', 'hands-on-labs'),
  chapter('lab-04-a2a-communication', '04 - A2A Communication', 'hands-on-labs/lab-04-a2a-communication.md', 'hands-on-labs'),
  chapter('lab-05-multi-agent-supervisor', '05 - Multi-Agent Supervisor', 'hands-on-labs/lab-05-multi-agent-supervisor.md', 'hands-on-labs'),
  chapter('lab-06-observability-and-evals', '06 - Observability and Evals', 'hands-on-labs/lab-06-observability-and-evals.md', 'hands-on-labs'),
  chapter('lab-07-mastra-runtime-packaging', '07 - Mastra Runtime Packaging', 'hands-on-labs/lab-07-mastra-runtime-packaging.md', 'hands-on-labs'),
  chapter('lab-08-crewai-flows-and-crews', '08 - CrewAI Flows and Crews', 'hands-on-labs/lab-08-crewai-flows-and-crews.md', 'hands-on-labs'),
  chapter('from-scratch-mini-framework', 'From-Scratch Mini-Framework Track', 'hands-on-labs/from-scratch-mini-framework.md', 'hands-on-labs'),
  chapter('lab-09-minimal-agent-loop', '09 - Minimal Agent Loop', 'hands-on-labs/lab-09-minimal-agent-loop.md', 'hands-on-labs'),
  chapter('lab-10-tool-registry-and-policy-gate', '10 - Tool Registry and Policy Gate', 'hands-on-labs/lab-10-tool-registry-and-policy-gate.md', 'hands-on-labs'),
  chapter('lab-11-context-memory-trace-evals', '11 - Context, Memory, Trace, and Evals', 'hands-on-labs/lab-11-context-memory-trace-evals.md', 'hands-on-labs'),
  chapter('lab-12-langgraph-state-graph', '12 - LangGraph State Graph', 'hands-on-labs/lab-12-langgraph-state-graph.md', 'hands-on-labs'),
  chapter('lab-13-autogen-transcript-evals', '13 - AutoGen Transcript Evals', 'hands-on-labs/lab-13-autogen-transcript-evals.md', 'hands-on-labs'),
  chapter('vertical-slice-examples', 'Vertical Slice Examples', 'hands-on-labs/vertical-slice-examples.md', 'hands-on-labs'),

  chapter('historical-patterns', 'Historical Patterns', 'deprecated/historical-patterns.md', 'deprecated'),
  chapter('publishing-and-releases', 'Publishing and Releases', 'publishing/publishing-and-releases.md', 'publishing')
]);

export const startHereChapterIds = deepFreeze([
  'introduction',
  'how-to-read',
  'what-is-an-agent',
  'architecture-before-autonomy',
  'choosing-the-right-pattern',
  'pattern-evaluation-checklist',
  'pattern-classification-mind-map',
  'from-patterns-to-systems',
  'pattern-composition-playbook'
]);

function siteLink(chapterPath) {
  if (chapterPath === 'hands-on-labs/index.md') return '/hands-on-labs/';
  return `/${chapterPath.replace(/\.md$/, '')}`;
}

function sidebarItem(chapter) {
  return { text: chapter.title, link: siteLink(chapter.path), path: chapter.path };
}

function chapterById(id, context) {
  const matchedChapter = bookChapters.find(chapter => chapter.id === id);
  if (!matchedChapter) throw new Error(`unknown ${context} chapter: ${id}`);
  return matchedChapter;
}

export const sidebarGroups = deepFreeze([
  {
    id: 'start-here',
    text: 'Start Here',
    items: startHereChapterIds.map(id =>
      sidebarItem(chapterById(id, 'Start Here'))
    )
  },
  ...bookSections.map(section => ({
    id: section.id,
    text: section.title,
    items: bookChapters
      .filter(chapter => chapter.sectionId === section.id && chapter.sidebar)
      .map(sidebarItem)
  }))
].filter(group => group.items.length > 0));

export const vitepressSidebar = deepFreeze(sidebarGroups.map(group => ({
  text: group.text,
  items: group.items.map(({ text, link }) => ({ text, link }))
})));

export const pdfChapters = deepFreeze(bookChapters.filter(chapter => chapter.pdf));
