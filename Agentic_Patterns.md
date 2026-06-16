# Agentic Systems Patterns

This is the canonical index for the active book catalog. The structure favors practical patterns for building, testing, and operating agentic systems.

The public book site is designed to publish at:

```text
https://gturitto.github.io/Agentic-Systems-Patterns/
```

## Foundations

- [Single Agent](./single-agent-pattern/README.md): A single autonomous worker that receives a goal or message and produces an answer or action.
- [Agent Loop](./agent-loop-pattern/README.md): The observe, decide, act, evaluate, and stop cycle that turns model calls into bounded agents.
- [Goals and State](./goals-and-state-pattern/README.md): Explicit objectives and task state for resumable, inspectable execution.
- [Tool-Using Agent](./tool-using-agent-pattern/README.md): Agents calling external tools through controlled interfaces.
- [Structured Output](./structured-output-pattern/README.md): Typed model outputs that software can validate and consume.
- [Context Engineering](./context-engineering-pattern/README.md): Deliberate construction of model context from instructions, state, memory, retrieval, tools, and examples.
- [Prompt Engineering](./prompt-engineering-pattern/README.md): Prompt structure, examples, constraints, and output contracts.

## Control Loops

- [Planning Pattern](./planning-pattern/README.md): Planner and executor separation with deterministic fallback examples.
- [Planning Agent](./planning-agent-pattern/README.md): Goal decomposition and adaptive execution in an agent wrapper.
- [ReAct](./react-pattern-reason-act/README.md): Reasoning and acting interleaved with observations.
- [Reflection and Self-Improvement](./reflection-and-self-improvement-pattern/README.md): Agents reviewing outputs and improving future behavior.
- [Evaluator-Optimizer](./evaluator-optimizer-pattern/README.md): Generator and evaluator loops for quality improvement.
- [Self-Healing Workflow](./self-healing-workflow-agent-pattern/README.md): Recovery through retry, fallback, re-planning, or escalation.
- [CodeAct](./codeact-agent-pattern/README.md): Planning small code actions, executing them in a sandbox, and iterating from observations.
- [Simulation-Based Planner](./simulation-based-planner-agent-pattern/README.md): Simulated rollouts to compare possible action sequences.

## Memory and Knowledge

- [Memory-Augmented Agent](./memory-augmented-agent-pattern/README.md): Short-term and long-term memory for context across interactions.
- [Long-Term Episodic Memory](./long-term-episodic-memory-agent-pattern/README.md): Timelines of events retrieved for future reasoning.
- [Context Engineering](./context-engineering-pattern/README.md): Retrieval-augmented generation and context assembly.
- [DSPy](./dspy-pattern/README.md): Modular LLM pipelines and optimization.
- [Goal-Conditioned Agent](./goal-conditioned-agent-pattern/README.md): Agents that adapt actions around explicit goals.

## Tools, Skills, and Protocols

- [Skills](./skills-pattern/README.md): Packaged procedural knowledge with instructions, scripts, references, and assets.
- [Modern Tool Use / MCP-first](./modern-tool-use-pattern/README.md): Tool discovery, schema validation, and invocation through MCP-style manifests.
- [MCP Context Exchange](./mcp-context-exchange-pattern/README.md): Minimal context and tool exchange over a manifest/invoke boundary.
- [A2A Agent-to-Agent Communication](./agent-to-agent-communication-pattern/README.md): Protocol-first remote agent collaboration.
- [Secure Agent Communication](./secure-agent-communication-pattern/README.md): Authentication, integrity, confidentiality, and policy controls for agent messages.
- [Human-in-the-Loop Approval](./human-in-the-loop-approval-agent/README.md): Explicit human gates before sensitive or irreversible actions.
- [Adversarial Testing Agent](./adversarial-testing-agent-pattern/README.md): Red-team agents that test robustness and safety boundaries.

## Multi-Agent Systems

- [Task Delegation](./task-delegation-pattern/README.md): Manager agents assigning bounded work to specialists.
- [Hierarchical Agent](./hierarchical-agent-pattern/README.md): Supervisor/sub-agent organization for decomposed work.
- [Multi-Agent Collaboration](./multi-agent-collaboration-pattern/README.md): Role-based collaboration among agents.
- [Consensus-Seeking Multi-Agent System](./consensus-seeking-multi-agent-system-pattern/README.md): Independent proposals aggregated by voting, ranking, or critique.
- [Agent Chain / Pipeline](./agent-chain-pipeline-pattern/README.md): Sequential agents transforming output through a pipeline.
- [Agent Orchestration](./agent-orchestration-pattern/README.md): A coordinator assigning roles and managing multi-agent flow.
- [CrewAI Flows and Crews](./crewai-flows-and-crews-pattern/README.md): Python flow state plus collaborative crews.

## Systems Architecture

- [Agentic System Architecture](./book/docs/systems-architecture/agentic-system-architecture.md): How to compose agents, tools, memory, state, workflows, policies, evals, and observability.
- [Agentic RAG Systems](./book/docs/systems-architecture/agentic-rag-systems.md): Query planning, retrieval routing, grounding, corrective loops, and production controls for RAG with agents.
- [Open Personal Agent Architectures](./book/docs/systems-architecture/open-personal-agent-architectures.md): OpenClaw, Hermes Agent, and related self-hosted personal-agent architectures.
- [Coding Agents](./book/docs/systems-architecture/coding-agents.md): Codex, Cursor, Claude Code, OpenHands, and repo-operating agents that edit files, run checks, and produce diffs.
- [Architecture Decision Records for Agents](./book/docs/systems-architecture/architecture-decision-records.md): ADRs for model, memory, tool, workflow, policy, and eval decisions.
- [Reference Architecture](./book/docs/systems-architecture/reference-architecture.md): A conservative end-to-end production architecture for agentic systems.

## Routing and Interaction

- [LLM Router](./llm-router-pattern/README.md): Routing requests to specialists using classifier, embedding, policy, and fallback logic.
- [Context-Aware Routing Agent](./context-aware-routing-agent-pattern/README.md): Routing based on intent and context.
- [Environment-Interactive Agent](./environment-interactive-agent-pattern/README.md): Agents that perceive and act in an external environment.
- [Event-Triggered Agent](./event-triggered-agent-pattern/README.md): Agents activated by events, webhooks, queues, or schedules.

## Production Runtime

- [Durable Workflow](./durable-workflow-pattern/README.md): Resumable workflows with checkpoints, retries, approvals, and compensation.
- [Observability and Evals](./observability-and-evals-pattern/README.md): Traces, metrics, datasets, and quality gates for agent behavior.
- [Compliance/Policy Enforcer](./compliance-policy-enforcer-agent/README.md): Policy checks and controlled action boundaries.
- [Mastra Runtime](./mastra-runtime-pattern/README.md): TypeScript runtime pattern for agents, workflows, tools, memory, evals, and observability.

## Deprecated / Historical Patterns

Deprecated patterns are preserved under [`deprecated/`](./deprecated/README.md). They are not part of the active learning path.

- [Agent Marketplace](./deprecated/agent-marketplace-pattern/README.md): Deprecated because it is speculative compared with practical A2A, routing, and orchestration patterns.
- [Agent Swarm](./deprecated/agent-swarm-pattern/README.md): Deprecated as a standalone chapter; concrete use cases now belong under Parallel Agents, search, or optimization.
- [Hybrid Agent](./deprecated/hybrid-agent-pattern/README.md): Deprecated because it is too broad; the useful parts are covered by runtime architecture and tool/context patterns.
- [Meta-Cognitive Agent](./deprecated/meta-cognitive-agent-pattern/README.md): Deprecated as a standalone chapter; merged into Reflection, Evaluator-Optimizer, and Self-Improvement.
- [Recursive Agent](./deprecated/recursive-agent-pattern/README.md): Deprecated as a standalone chapter; merged into Planning, Goals and State, and Task Delegation.
- [Distributed Agent](./deprecated/distributed-agent-pattern/README.md): Deprecated as a standalone chapter; replaced by A2A, durable workflows, and protocol-first composition.
- [API Integration Copilot](./deprecated/api-integration-copilot/README.md): Deprecated because it is an applied placeholder rather than a developed pattern.
- [Data Pipeline Orchestrator Agent](./deprecated/data-pipeline-orchestrator-agent/README.md): Deprecated because it is an applied placeholder; durable workflow and event-triggered patterns cover the core design.
- [Multi-Modal Tool-Using Agent](./deprecated/multi-modal-tool-using-agent/README.md): Deprecated until expanded into a real multimodal chapter with runnable examples.

## Publishing

- Manuscript source: [`book/docs`](./book/docs/intro.md)
- Static site build: `npm run book:build`
- GitHub Pages workflow: [`.github/workflows/publish-book.yml`](./.github/workflows/publish-book.yml)
- Offline PDF path: [`book/releases/Agentic-Systems-Patterns.pdf`](./book/releases/README.md)

## License

This book/reference and its examples are licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) (`CC-BY-SA-4.0`).
