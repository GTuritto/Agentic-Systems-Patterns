---
title: Source Map
---

# Source Map

This page maps external references to this book's chapters. Use it as a reading guide, not as a replacement for the book's pattern language.

The sources repeat several core ideas: start simple, separate workflows from agents, use tools through typed contracts, add memory deliberately, evaluate behavior, and reserve multi-agent systems for cases where specialization justifies orchestration cost.

## Primary References

| Source | Useful Ideas | Book Mapping |
| --- | --- | --- |
| [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | Workflows vs agents, prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer, autonomous agents. | [Choosing the Right Pattern](./choosing-the-right-pattern), [Prompt Chaining and Gates](./prompt-chaining-and-gates), [Routing and Handoffs](./routing-and-handoffs), [Evaluator-Optimizer](../control-loops/evaluator-optimizer), [Agent Loop](../foundations/agent-loop). |
| [Google Cloud: Choose a design pattern for your agentic AI system](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system) | Requirements-first selection, single-agent and multi-agent patterns, sequential, parallel, iterative refinement, human-in-the-loop, custom logic. | [Choosing the Right Pattern](./choosing-the-right-pattern), [Parallel Agents](../multi-agent-systems/parallel-agents), [Human Approval Gates](../tools-skills-protocols/human-approval-gates), [Agentic System Architecture](../systems-architecture/agentic-system-architecture). |
| [Databricks: Agent system design patterns](https://docs.databricks.com/gcp/en/agents/agent-system-design-patterns) | Complexity continuum from prompt to deterministic chain to single-agent and multi-agent systems, plus production guidance for testing, tracing, failure handling, model updates, and cost. | [Choosing the Right Pattern](./choosing-the-right-pattern), [Circuit Breakers, Fallbacks, and Replay](./circuit-breakers-fallbacks-replay), [Observability and Evals](../production-runtime/observability-and-evals). |
| [LangChain: Choosing the Right Multi-Agent Architecture](https://www.langchain.com/blog/choosing-the-right-multi-agent-architecture) | Multi-agent selection across subagents, skills, handoffs, and routers, with explicit tradeoffs around context isolation, state, parallelism, and model-call overhead. | [Choosing the Right Pattern](./choosing-the-right-pattern), [Routing and Handoffs](./routing-and-handoffs), [Skills](../tools-skills-protocols/skills), [Supervisor / Worker](../multi-agent-systems/supervisor-worker), [Parallel Agents](../multi-agent-systems/parallel-agents). |
| [LangChain: Deep Agents overview](https://docs.langchain.com/oss/python/deepagents/overview) and [Frameworks, runtimes, and harnesses](https://docs.langchain.com/oss/python/concepts/products#agent-harnesses-like-the-deep-agents-sdk) | Agent harness framing: planning, files, context management, subagents, long-term memory, human approval, permissions, sandboxes, durable execution, and framework/runtime/harness distinctions. | [Agent Harnesses](../agent-engineering-practice/agent-harnesses), [Context Budgets and Working Sets](../foundations/context-budgets-and-working-sets), [Agent Engineer Toolkit](../agent-engineering-practice/agent-engineer-toolkit), [Framework Selection](../agent-engineering-practice/framework-selection), [Skills](../tools-skills-protocols/skills), [Durable Workflows](../production-runtime/durable-workflows). |
| [MongoDB: 7 Practical Design Patterns for Agentic Systems](https://www.mongodb.com/resources/basics/artificial-intelligence/agentic-systems) | Controlled flows, LLM routing, parallelization, reflection, human-in-the-loop, agents, and multi-agent architectures. | [Prompt Chaining and Gates](./prompt-chaining-and-gates), [Routing and Handoffs](./routing-and-handoffs), [Reflection](../control-loops/reflection), [Supervisor / Worker](../multi-agent-systems/supervisor-worker). |
| [Agentic Patterns Graph](https://www.agentic-patterns.com/graph) | Large pattern catalog with categories for context, orchestration, reliability, security, tool use, learning, and UX. | [Circuit Breakers, Fallbacks, and Replay](./circuit-breakers-fallbacks-replay), [Context Engineering](../foundations/context-engineering), [Working Memory](../memory-knowledge/working-memory), [Policy Enforcement](../production-runtime/policy-enforcement). |
| [GitHub: awesome-agentic-patterns](https://github.com/nibzard/awesome-agentic-patterns) | Curated repository of production and emerging patterns, useful as a discovery index. | This source informs the extended catalog and future additions, especially reliability, context, coding-agent, security, and tool-use patterns. |

## Secondary References

| Source | Useful Ideas | How To Use |
| --- | --- | --- |
| [ByteByteGo: Top AI Agentic Workflow Patterns](https://blog.bytebytego.com/p/top-ai-agentic-workflow-patterns) | Accessible explanations of reflection, tool use, ReAct, planning, and multi-agent patterns. | Good introductory reading for readers who want a lighter explanation before the deeper chapters. |
| [Phil Schmid: Zero to One - Learning Agentic Patterns](https://www.philschmid.de/agentic-pattern) | Practical examples for routing, parallelization, tool use, orchestrator-workers, and multi-agent systems. | Useful for implementation intuition and example shapes. |
| [ProjectPro: Agentic AI Design Patterns](https://www.projectpro.io/article/agentic-ai-design-patterns/1126) | Planning, tool use, reflection, multi-agent examples, and a practical MCP discussion. | Useful for explaining common enterprise examples. |
| [Tungsten Automation: Tool-Use Pattern](https://www.tungstenautomation.com/learn/blog/the-agentic-ai-tool-use-pattern) | Enterprise framing for tool use, ground truth, and workflow APIs. | Maps to [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use) and [Policy Enforcement](../production-runtime/policy-enforcement). |
| [Towards AI: 5 Design Patterns in Agentic AI Workflow](https://pub.towardsai.net/5-design-patterns-in-agentic-ai-workflow-c972c83f77e4) | Introductory framing for prompt chaining and workflow decomposition. | Useful as a light overview; the article is partially gated. |
| [Medium: Multi-Agent System Patterns](https://medium.com/@mjgmario/multi-agent-system-patterns-a-unified-guide-to-designing-agentic-architectures-04bb31ab9c41) | Multi-agent architecture dimensions: control, execution, coordination, and interaction. Useful distinction between roles and patterns. | Good support for a future bridge chapter on composing multi-agent systems without turning the book into a flat catalog. |
| [Medium: Agentic Design Patterns](https://medium.com/@bijit211987/agentic-design-patterns-cbd0aae2962f) | Common pattern explanations for reflection, tool use, planning, and multi-agent design. | Duplicates core concepts already covered here. |
| [Medium: Agentic Patterns - Architectures for Coordinated AI Systems](https://medium.com/@learning_37638/agentic-patterns-architectures-for-coordinated-ai-systems-34d9d8d8e1e2) | Hierarchical, peer-to-peer, market-based, and swarm coordination. | Useful for future expansion of multi-agent coordination patterns. |
| [YouTube: AI agent design patterns](https://www.youtube.com/watch?v=GDm_uH6VxPY) | Video walkthrough of agent design patterns. | Use as companion media, not as a primary textual source unless transcript review is added. |
| [YouTube: Master ALL 20 Agentic AI Design Patterns](https://www.youtube.com/watch?v=e2zIr_2JMbE) | Broad video catalog of pattern names and examples. | Use as discovery material; validate individual claims against primary sources. |

The LinkedIn checkpoint link was not useful as a public source because it requires a login challenge. The Google search URL was used only as a discovery route, not as a source to map.

## Local Pattern Repository Coverage

A local flattened digest of the `awesome-agentic-patterns` project was used as a coverage checklist. Its patterns were not copied into this book. They helped identify missing or underdeveloped areas that now have authored treatment here.

The 2026-06-20 intake scan extracted 167 pattern records across orchestration and control, tool use and environment, reliability and evaluation, context and memory, UX and collaboration, security and safety, feedback loops, and learning and adaptation. The online book should use this catalog as an expansion queue for chapter quality and cross-links, not as a replacement taxonomy.

| Local Pattern Area | Representative Patterns Reviewed | Book Mapping |
| --- | --- | --- |
| Agent threat model and tool security | `lethal-trifecta-threat-model`, `policy-gated-tool-proxy`, `sandboxed-tool-authorization`, `egress-lockdown-no-exfiltration-channel`, `pii-tokenization`. | [Agent Threat Model](../agent-engineering-practice/agent-threat-model), [Agent Security and Sandboxing](../agent-engineering-practice/agent-security-and-sandboxing), [Policy Enforcement](../production-runtime/policy-enforcement), [Tool Capability Design](../tools-skills-protocols/tool-capability-design). |
| Tool capability and agent-friendly interfaces | `cli-first-skill-design`, `tool-capability-compartmentalization`, `llm-friendly-api-design`, `agent-first-tooling-and-logging`, `static-service-manifest-for-agents`, `code-first-tool-interface-pattern`. | [Skills](../tools-skills-protocols/skills), [Tool Capability Design](../tools-skills-protocols/tool-capability-design), [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use), [Agent Harnesses](../agent-engineering-practice/agent-harnesses). |
| Context operations | `curated-file-context-window`, `curated-code-context-window`, `context-window-auto-compaction`, `context-minimization-pattern`, `context-window-anxiety-management`. | [Context Budgets and Working Sets](../foundations/context-budgets-and-working-sets), [Context Engineering](../foundations/context-engineering), [Agent Harnesses](../agent-engineering-practice/agent-harnesses). |
| Production eval feedback | `incident-to-eval-synthesis`, `workflow-evals-with-mocked-tools`, `canary-rollout-and-automatic-rollback-for-agent-policy-changes`, `anti-reward-hacking-grader-design`, `background-agent-ci`. | [Production Evaluation Feedback Loops](../production-runtime/production-evaluation-feedback-loops), [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development), [Observability and Evals](../production-runtime/observability-and-evals), [Coding Agents](../systems-architecture/coding-agents). |
| Coding-agent runtime | `coding-agent-ci-feedback-loop`, `background-agent-ci`, `asynchronous-coding-agent-pipeline`, `shell-command-contextualization`, `custom-sandboxed-background-agent`. | [Coding Agents](../systems-architecture/coding-agents), [Agent Harnesses](../agent-engineering-practice/agent-harnesses), [Production Evaluation Feedback Loops](../production-runtime/production-evaluation-feedback-loops). |
| Multi-agent topology and coordination | `declarative-multi-agent-topology-definition`, `board-mediated-inter-agent-coordination`, `workspace-native-multi-agent-orchestration`, `oracle-and-worker-multi-model`, `multi-model-orchestration-for-complex-edits`. | [Choosing Multi-Agent Topology](../multi-agent-systems/choosing-multi-agent-topology), [Agents As Services](../systems-architecture/agents-as-services), [A2A Agent Interoperability](../tools-skills-protocols/a2a-agent-interoperability), [Supervisor / Worker](../multi-agent-systems/supervisor-worker). |

This local source is best treated as a checklist, not as the book's taxonomy. Some entries are production-proven, some are emerging, and some are research or product-specific. The book should keep absorbing the useful engineering ideas while preserving its own structure: boundaries first, then patterns, then evaluation and operations.

## Local PDF References Reviewed

The following PDFs were reviewed or intake-scanned locally as source-of-knowledge inputs. They are not included in this repository, linked from the book, or reproduced. They inform coverage checks, chapter structure, and topic prioritization only.

| Local Reference | Useful Themes | Book Mapping |
| --- | --- | --- |
| *AI Agents in Action*, Micheal Lanham | Agent definitions, LLM interfaces, GPT assistants, AutoGen and CrewAI multi-agent systems, agent actions, behavior-tree orchestration, agent platforms, RAG, memory, prompt flow, reasoning, evaluation, planning, and feedback. | [What Is An Agent?](../foundations/what-is-an-agent), [Framework Selection](../agent-engineering-practice/framework-selection), [CrewAI Flows and Crews](../multi-agent-systems/crewai-flows-and-crews), [Tool Use](../foundations/tool-use), [Memory-Augmented Agent](../memory-knowledge/memory-augmented-agent), [Planning and Execution](../control-loops/planning-and-execution), [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development). |
| *30 Agents Every AI Engineer Must Build*, Imran Ahmad | Agent engineering foundations, toolkit decisions, domain agents, retrieval agents, tool orchestration, software agents, explainability, and domain-specific agents. | [Agent Engineer Toolkit](../agent-engineering-practice/agent-engineer-toolkit), [Framework Selection](../agent-engineering-practice/framework-selection), [Domain Agent Architectures](../systems-architecture/domain-agent-architectures), [Coding Agents](../systems-architecture/coding-agents), [Agentic RAG Systems](../systems-architecture/agentic-rag-systems). |
| *Agentic Architectural Patterns for Building Multi-Agent Systems*, Ali Arsanjani, Juan Pablo Bustos, Thomas Kurian | Enterprise maturity, agent-ready model selection, RAG-to-fine-tuning spectrum, coordination patterns, compliance, robustness, human-agent interaction, production readiness. | [Choosing the Right Pattern](./choosing-the-right-pattern), [Agent Development Lifecycle](../agent-engineering-practice/agent-development-lifecycle), [Agent Security and Sandboxing](../agent-engineering-practice/agent-security-and-sandboxing), [Domain Agent Architectures](../systems-architecture/domain-agent-architectures), [Agentic System Architecture](../systems-architecture/agentic-system-architecture). |
| *Agentic Design Patterns*, Antonio Gulli | Prompt chaining, routing, parallelization, reflection, tool use, planning, memory, MCP, A2A, monitoring, guardrails, resource optimization, CLI and coding agents. | [Prompt Chaining and Gates](./prompt-chaining-and-gates), [Routing and Handoffs](./routing-and-handoffs), [Resource-Aware Agent Design](./resource-aware-agent-design), [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use), [A2A Agent Interoperability](../tools-skills-protocols/a2a-agent-interoperability). |
| *Designing Multi-Agent Systems*, Victor Dibia | Multi-agent taxonomy, UX principles, execution loops, cancellation, memory, middleware, computer-use agents, workflow graphs, observability, evaluation, distributed protocols, ethics. | [Agent UX and Human Trust](../agent-engineering-practice/agent-ux-and-human-trust), [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development), [Computer-Use Agents](../systems-architecture/computer-use-agents), [Supervisor / Worker](../multi-agent-systems/supervisor-worker), [Secure Agent Communication](../tools-skills-protocols/secure-agent-communication). |
| *Patterns for Building AI Agents*, Sam Bhagwat and Michelle Gienow | Agent capability design, context engineering, context compression, eval suites, production data evaluation, sandboxing, granular access control, guardrails. | [Context Budgets and Working Sets](../foundations/context-budgets-and-working-sets), [Context Engineering](../foundations/context-engineering), [Resource-Aware Agent Design](./resource-aware-agent-design), [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development), [Agent Security and Sandboxing](../agent-engineering-practice/agent-security-and-sandboxing). |
| *Build a Multi-Agent System (from Scratch)*, Val Andrei Fajardo | Foundational LLM agent construction, tools, LLM interfaces, MCP tools, skills, memory, human-in-the-loop, A2A, and building a small educational framework from first principles. | [Tool Use](../foundations/tool-use), [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use), [Skills](../tools-skills-protocols/skills), [Memory-Augmented Agent](../memory-knowledge/memory-augmented-agent), [A2A Agent Interoperability](../tools-skills-protocols/a2a-agent-interoperability). |
| *Build an AI Agent (From Scratch)*, Jungjun Hur and Younghee Song | LLM interface design, tool use, ReAct, RAG, memory, planning, reflection, code execution, multi-agent orchestration, and agent evaluation. | [Single Agent](../foundations/single-agent), [ReAct](../control-loops/react), [Semantic Recall and RAG](../memory-knowledge/semantic-recall-rag), [Planning and Execution](../control-loops/planning-and-execution), [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development). |
| *Designing AI Agents*, Jia Huang | Agent harnesses, bounded resource allocation, cognitive functions, execution topology, governance, and a running code-review-agent example. | [Agentic System Architecture](../systems-architecture/agentic-system-architecture), [Resource-Aware Agent Design](./resource-aware-agent-design), [Coding Agents](../systems-architecture/coding-agents), [Policy Enforcement](../production-runtime/policy-enforcement), [Architecture Decision Records](../systems-architecture/architecture-decision-records). |
| *Multi-Agent Systems with AutoGen*, Victor Dibia | AutoGen-based multi-agent foundations, UX, interface agents, evaluation, optimization, deployment, messaging protocols, safety, and sandboxing. | [CrewAI Flows and Crews](../multi-agent-systems/crewai-flows-and-crews), [Agent UX and Human Trust](../agent-engineering-practice/agent-ux-and-human-trust), [Computer-Use Agents](../systems-architecture/computer-use-agents), [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development), [Agent Security and Sandboxing](../agent-engineering-practice/agent-security-and-sandboxing). |
| *AI Agents and Applications*, Roberto Infante | LangChain, LangGraph, MCP, RAG, tool-based agents, multi-agent systems, memory, guardrails, and productionization. | [Framework Selection](../agent-engineering-practice/framework-selection), [Agentic RAG Systems](../systems-architecture/agentic-rag-systems), [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use), [Multi-Agent Systems](../multi-agent-systems/supervisor-worker), [Observability and Evals](../production-runtime/observability-and-evals). |
| *Agentic Transformation Playbook* | Business adoption framing, agent lifecycle management, governance, human role design, and common enterprise use cases. | [Agent Development Lifecycle](../agent-engineering-practice/agent-development-lifecycle), [Agent UX and Human Trust](../agent-engineering-practice/agent-ux-and-human-trust), [Policy Enforcement](../production-runtime/policy-enforcement), [Domain Agent Architectures](../systems-architecture/domain-agent-architectures). |

## Pattern Coverage Map

| External Pattern Name | Current Book Chapter |
| --- | --- |
| Augmented LLM | [Single Agent](../foundations/single-agent), [Tool Use](../foundations/tool-use), [Structured Output](../foundations/structured-output) |
| Prompt chaining | [Prompt Chaining and Gates](./prompt-chaining-and-gates) |
| Routing | [Routing and Handoffs](./routing-and-handoffs) |
| Parallelization | [Parallel Agents](../multi-agent-systems/parallel-agents) |
| Orchestrator-workers | [Supervisor / Worker](../multi-agent-systems/supervisor-worker), [Planning and Execution](../control-loops/planning-and-execution) |
| Evaluator-optimizer | [Evaluator-Optimizer](../control-loops/evaluator-optimizer) |
| Reflection | [Reflection](../control-loops/reflection) |
| ReAct | [ReAct](../control-loops/react) |
| Agent loop | [Agent Loop](../foundations/agent-loop) |
| Human-in-the-loop | [Human Approval Gates](../tools-skills-protocols/human-approval-gates) |
| Tool use | [Tool Use](../foundations/tool-use), [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use) |
| Memory and context | [Context Engineering](../foundations/context-engineering), [Working Memory](../memory-knowledge/working-memory), [Long-Term Episodic Memory](../memory-knowledge/long-term-episodic-memory) |
| Resource-aware optimization | [Resource-Aware Agent Design](./resource-aware-agent-design) |
| Agentic RAG | [Semantic Recall and RAG](../memory-knowledge/semantic-recall-rag), [Agentic RAG Systems](../systems-architecture/agentic-rag-systems) |
| Multi-agent supervisor | [Supervisor / Worker](../multi-agent-systems/supervisor-worker) |
| Peer or network agents | [A2A Agent Interoperability](../tools-skills-protocols/a2a-agent-interoperability), [Debate and Consensus](../multi-agent-systems/debate-and-consensus) |
| Circuit breaker | [Circuit Breakers, Fallbacks, and Replay](./circuit-breakers-fallbacks-replay) |
| Action replay | [Circuit Breakers, Fallbacks, and Replay](./circuit-breakers-fallbacks-replay), [Observability and Evals](../production-runtime/observability-and-evals) |
| Deterministic chain | [Choosing the Right Pattern](./choosing-the-right-pattern), [Durable Workflows](../production-runtime/durable-workflows) |
| Coding agent | [Coding Agents](../systems-architecture/coding-agents) |
| Computer-use agent | [Computer-Use Agents](../systems-architecture/computer-use-agents) |
| Domain-specific agent | [Domain Agent Architectures](../systems-architecture/domain-agent-architectures) |

## Editorial Rule

External sources are used to validate coverage and expose missing patterns. The book keeps its own taxonomy:

- foundations first;
- control loops second;
- memory and knowledge as a separate concern;
- tools, skills, and protocols as integration boundaries;
- multi-agent systems only when specialization has value;
- production runtime patterns for safety, evaluation, and operations;
- source-informed pattern selection as the entry point for choosing the right design.

This keeps the book useful as a reference instead of turning it into a link dump.
