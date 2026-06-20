---
title: How To Read This Book
---

# How To Read This Book

This book has two jobs.

First, it makes an argument: agentic systems need architecture before autonomy. Second, it gives you a pattern reference you can use during design work.

You do not need to read every chapter in order. But do read the selection chapters before adding loops, tools, memory, or multiple agents to a system.

## Recommended First Pass

Start here if you want the book to read like a book, not a catalog:

1. [Introduction](/intro)
2. [What Is An Agent?](/foundations/what-is-an-agent)
3. [Architecture Before Autonomy](/pattern-selection/architecture-before-autonomy)
4. [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
5. [Pattern Classification Mind Map](/pattern-selection/pattern-classification-mind-map)
6. [From Patterns To Systems](/pattern-selection/from-patterns-to-systems)
7. [Agent Development Lifecycle](/agent-engineering-practice/agent-development-lifecycle)
8. [Agent Harnesses](/agent-engineering-practice/agent-harnesses)
9. [Building a Minimal Agent Runtime](/agent-engineering-practice/building-a-minimal-agent-runtime)
10. [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
11. [Agent Threat Model](/agent-engineering-practice/agent-threat-model)
12. [Tool Capability Design](/tools-skills-protocols/tool-capability-design)
13. [Agentic System Architecture](/systems-architecture/agentic-system-architecture)
14. [Agents As Services](/systems-architecture/agents-as-services)
15. [Choosing Multi-Agent Topology](/multi-agent-systems/choosing-multi-agent-topology)
16. [Coding Agents](/systems-architecture/coding-agents)
17. [Production Runtime Overview](/production-runtime/overview)
18. [Production Evaluation Feedback Loops](/production-runtime/production-evaluation-feedback-loops)
19. [Cost Controls and Runtime Budgets](/production-runtime/cost-controls-runtime-budgets)
20. [Reference Architecture](/systems-architecture/reference-architecture)

This path gives you the thesis before the catalog details.

## First-Time Path

Start here if you are new to agentic systems:

1. [Introduction](/intro)
2. [What Is An Agent?](/foundations/what-is-an-agent)
3. [Single Agent](/foundations/single-agent)
4. [Agent Loop](/foundations/agent-loop)
5. [Goals and State](/foundations/goals-and-state)
6. [Tool Use](/foundations/tool-use)
7. [Tool Capability Design](/tools-skills-protocols/tool-capability-design)
8. [Context Budgets and Working Sets](/foundations/context-budgets-and-working-sets)
9. [Context Engineering](/foundations/context-engineering)
10. [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
11. [Pattern Classification Mind Map](/pattern-selection/pattern-classification-mind-map)
12. [Hands-On Labs](/hands-on-labs/)

This path gives you the core vocabulary before the production runtime chapters.

## Builder Path

Use this path when you are designing or reviewing a system:

1. [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
2. [Pattern Classification Mind Map](/pattern-selection/pattern-classification-mind-map)
3. [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
4. [Agent Development Lifecycle](/agent-engineering-practice/agent-development-lifecycle)
5. [Agent Harnesses](/agent-engineering-practice/agent-harnesses)
6. [Building a Minimal Agent Runtime](/agent-engineering-practice/building-a-minimal-agent-runtime)
7. [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
8. [Agent Threat Model](/agent-engineering-practice/agent-threat-model)
9. [Tool Capability Design](/tools-skills-protocols/tool-capability-design)
10. [Agent Security and Sandboxing](/agent-engineering-practice/agent-security-and-sandboxing)
11. [Agents As Services](/systems-architecture/agents-as-services)
12. [Choosing Multi-Agent Topology](/multi-agent-systems/choosing-multi-agent-topology)
13. [Reference Architecture](/systems-architecture/reference-architecture)
14. [Production Runtime Overview](/production-runtime/overview)
15. [Observability and Evals](/production-runtime/observability-and-evals)
16. [Production Evaluation Feedback Loops](/production-runtime/production-evaluation-feedback-loops)
17. [Cost Controls and Runtime Budgets](/production-runtime/cost-controls-runtime-budgets)

This path is best for architecture work, design reviews, and production readiness checks.

## Lab Path

Use this path when you want to run code:

1. [Lab Framework and Language Matrix](/hands-on-labs/framework-language-matrix)
2. [Lab 01 - Tool-Using Agent](/hands-on-labs/lab-01-tool-using-agent)
3. [Lab 02 - Agent Loop and Planning](/hands-on-labs/lab-02-agent-loop-and-planning)
4. [Lab 03 - Agentic RAG](/hands-on-labs/lab-03-agentic-rag)
5. [Lab 04 - A2A Communication](/hands-on-labs/lab-04-a2a-communication)
6. [Lab 05 - Multi-Agent Supervisor](/hands-on-labs/lab-05-multi-agent-supervisor)
7. [Lab 06 - Observability and Evals](/hands-on-labs/lab-06-observability-and-evals)
8. [Lab 07 - Mastra Runtime Packaging](/hands-on-labs/lab-07-mastra-runtime-packaging)
9. [Lab 08 - CrewAI Flows and Crews](/hands-on-labs/lab-08-crewai-flows-and-crews)
10. [From-Scratch Mini-Framework Track](/hands-on-labs/from-scratch-mini-framework)
11. [Lab 09 - Minimal Agent Loop](/hands-on-labs/lab-09-minimal-agent-loop)
12. [Lab 10 - Tool Registry and Policy Gate](/hands-on-labs/lab-10-tool-registry-and-policy-gate)
13. [Lab 11 - Context, Memory, Trace, and Evals](/hands-on-labs/lab-11-context-memory-trace-evals)
14. [Lab 12 - LangGraph State Graph](/hands-on-labs/lab-12-langgraph-state-graph)
15. [Lab 13 - AutoGen Transcript Evals](/hands-on-labs/lab-13-autogen-transcript-evals)

Each lab links back to the pattern chapters and downloadable source bundles. The labs intentionally move between Python, TypeScript, framework-neutral code, LangChain/LangGraph-style retrieval, LangGraph-style state graphs, AutoGen-style supervision and transcript evals, Mastra-style runtime packaging, CrewAI-style flow orchestration, protocol-first A2A code, and test-based evals so you can see the architecture beneath the API.

## Reference Path

Use the sidebar or search when you need a specific pattern. Each generated pattern chapter follows the same structure:

- when to use it
- when to avoid it
- architecture
- system shape
- core protocol
- implementation notes
- failure modes
- evaluation strategy
- production checklist
- source code and downloads

The repeated structure makes chapters easy to scan during design work. Do not read those pages like a novel. Use the authored chapters for the argument and the pattern pages for decisions.
