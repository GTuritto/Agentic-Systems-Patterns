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
        text: 'Publishing',
        items: [
          { text: 'How To Read This Book', link: '/publishing/how-to-read' },
          { text: 'Publishing and Releases', link: '/publishing/publishing-and-releases' }
        ]
      },
      {
        text: 'Pattern Selection',
        items: [
          { text: 'Choosing the Right Pattern', link: '/pattern-selection/choosing-the-right-pattern' },
          { text: 'Prompt Chaining and Gates', link: '/pattern-selection/prompt-chaining-and-gates' },
          { text: 'Routing and Handoffs', link: '/pattern-selection/routing-and-handoffs' },
          { text: 'Resource-Aware Agent Design', link: '/pattern-selection/resource-aware-agent-design' },
          { text: 'Circuit Breakers, Fallbacks, and Replay', link: '/pattern-selection/circuit-breakers-fallbacks-replay' },
          { text: 'Source Map', link: '/pattern-selection/source-map' }
        ]
      },
      {
        text: 'Agent Engineering Practice',
        items: [
          { text: 'Agent Development Lifecycle', link: '/agent-engineering-practice/agent-development-lifecycle' },
          { text: 'Agent Engineer Toolkit', link: '/agent-engineering-practice/agent-engineer-toolkit' },
          { text: 'Framework Selection', link: '/agent-engineering-practice/framework-selection' },
          { text: 'Evaluation-Driven Agent Development', link: '/agent-engineering-practice/evaluation-driven-agent-development' },
          { text: 'Agent Security and Sandboxing', link: '/agent-engineering-practice/agent-security-and-sandboxing' },
          { text: 'Agent UX and Human Trust', link: '/agent-engineering-practice/agent-ux-and-human-trust' }
        ]
      },
      {
        text: 'Hands-On Labs',
        items: [
          { text: 'Lab Guide', link: '/hands-on-labs/' },
          { text: '01 - Tool-Using Agent', link: '/hands-on-labs/lab-01-tool-using-agent' },
          { text: '02 - Agent Loop and Planning', link: '/hands-on-labs/lab-02-agent-loop-and-planning' },
          { text: '03 - Agentic RAG', link: '/hands-on-labs/lab-03-agentic-rag' },
          { text: '04 - A2A Communication', link: '/hands-on-labs/lab-04-a2a-communication' },
          { text: '05 - Multi-Agent Supervisor', link: '/hands-on-labs/lab-05-multi-agent-supervisor' },
          { text: '06 - Observability and Evals', link: '/hands-on-labs/lab-06-observability-and-evals' }
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
          { text: 'Computer-Use Agents', link: '/systems-architecture/computer-use-agents' },
          { text: 'Domain Agent Architectures', link: '/systems-architecture/domain-agent-architectures' },
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
