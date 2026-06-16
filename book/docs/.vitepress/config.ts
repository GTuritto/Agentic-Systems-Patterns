import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Agentic Systems Patterns',
  description: 'A practical reference for modern agent architecture',
  base: '/Agentic-Systems-Patterns/',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Book', link: '/' },
      { text: 'GitHub', link: 'https://github.com/GTuritto/Agentic-Systems-Patterns' }
    ],
    sidebar: [
      {
        text: 'Foundations',
        items: [
          { text: 'Single Agent', link: '/foundations/single-agent' },
          { text: 'Agent Loop', link: '/foundations/agent-loop' },
          { text: 'Goals and State', link: '/foundations/goals-and-state' },
          { text: 'Tool Use', link: '/foundations/tool-use' },
          { text: 'Structured Output', link: '/foundations/structured-output' },
          { text: 'Context Engineering', link: '/foundations/context-engineering' }
        ]
      },
      {
        text: 'Pattern Selection',
        items: [
          { text: 'Choosing the Right Pattern', link: '/pattern-selection/choosing-the-right-pattern' },
          { text: 'Prompt Chaining and Gates', link: '/pattern-selection/prompt-chaining-and-gates' },
          { text: 'Routing and Handoffs', link: '/pattern-selection/routing-and-handoffs' },
          { text: 'Circuit Breakers, Fallbacks, and Replay', link: '/pattern-selection/circuit-breakers-fallbacks-replay' },
          { text: 'Source Map', link: '/pattern-selection/source-map' }
        ]
      },
      {
        text: 'Control Loops',
        items: [
          { text: 'Planning and Execution', link: '/control-loops/planning-and-execution' },
          { text: 'ReAct', link: '/control-loops/react' },
          { text: 'Reflection', link: '/control-loops/reflection' },
          { text: 'Evaluator-Optimizer', link: '/control-loops/evaluator-optimizer' },
          { text: 'Self-Improvement', link: '/control-loops/self-improvement' },
          { text: 'Self-Healing Workflows', link: '/control-loops/self-healing-workflows' }
        ]
      },
      {
        text: 'Memory and Knowledge',
        items: [
          { text: 'Memory-Augmented Agent', link: '/memory-knowledge/memory-augmented-agent' },
          { text: 'Long-Term Episodic Memory', link: '/memory-knowledge/long-term-episodic-memory' },
          { text: 'Semantic Recall and RAG', link: '/memory-knowledge/semantic-recall-rag' },
          { text: 'Working Memory', link: '/memory-knowledge/working-memory' },
          { text: 'Knowledge-Bound Agents', link: '/memory-knowledge/knowledge-bound-agents' }
        ]
      },
      {
        text: 'Tools, Skills, and Protocols',
        items: [
          { text: 'Skills', link: '/tools-skills-protocols/skills' },
          { text: 'MCP-first Tool Use', link: '/tools-skills-protocols/mcp-first-tool-use' },
          { text: 'A2A Agent Interoperability', link: '/tools-skills-protocols/a2a-agent-interoperability' },
          { text: 'Secure Agent Communication', link: '/tools-skills-protocols/secure-agent-communication' },
          { text: 'Human Approval Gates', link: '/tools-skills-protocols/human-approval-gates' }
        ]
      },
      {
        text: 'Multi-Agent Systems',
        items: [
          { text: 'Task Delegation', link: '/multi-agent-systems/task-delegation' },
          { text: 'Supervisor / Worker', link: '/multi-agent-systems/supervisor-worker' },
          { text: 'Debate and Consensus', link: '/multi-agent-systems/debate-and-consensus' },
          { text: 'Parallel Agents', link: '/multi-agent-systems/parallel-agents' },
          { text: 'CrewAI Flows and Crews', link: '/multi-agent-systems/crewai-flows-and-crews' }
        ]
      },
      {
        text: 'Systems Architecture',
        items: [
          { text: 'Agentic System Architecture', link: '/systems-architecture/agentic-system-architecture' },
          { text: 'Agentic RAG Systems', link: '/systems-architecture/agentic-rag-systems' },
          { text: 'Open Personal Agent Architectures', link: '/systems-architecture/open-personal-agent-architectures' },
          { text: 'Coding Agents', link: '/systems-architecture/coding-agents' },
          { text: 'Architecture Decision Records', link: '/systems-architecture/architecture-decision-records' },
          { text: 'Reference Architecture', link: '/systems-architecture/reference-architecture' }
        ]
      },
      {
        text: 'Production Runtime',
        items: [
          { text: 'Durable Workflows', link: '/production-runtime/durable-workflows' },
          { text: 'Observability and Evals', link: '/production-runtime/observability-and-evals' },
          { text: 'Policy Enforcement', link: '/production-runtime/policy-enforcement' },
          { text: 'Event-Triggered Agents', link: '/production-runtime/event-triggered-agents' },
          { text: 'Mastra Runtime', link: '/production-runtime/mastra-runtime' }
        ]
      },
      {
        text: 'Deprecated',
        items: [{ text: 'Historical Patterns', link: '/deprecated/historical-patterns' }]
      }
    ],
    footer: {
      message: 'Licensed under CC BY-SA 4.0.',
      copyright: 'Copyright (c) 2025-2026 Giuseppe Turitto'
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/GTuritto/Agentic-Systems-Patterns' }
    ]
  }
});
