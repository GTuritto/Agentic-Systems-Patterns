---
title: Lab Framework and Language Matrix
---

# Lab Framework and Language Matrix

The labs are intentionally language- and framework-agnostic. They use different tools so you can see the architectural pattern beneath the framework API.

Use this page before you start coding. It answers two questions: which lab should I run first, and what production boundary should I inspect while I run it?

## Coverage Graph

Use this graph to see the learning emphasis across languages, runtimes, framework slices, and capstones. The goal is balanced architecture exposure, not equal package coverage.

![Framework and language lab coverage](../public/diagrams/framework-language-coverage.svg)

| Lab | Pattern | Language | Framework / Runtime | Framework-Agnostic Lesson |
| --- | --- | --- | --- | --- |
| [Lab 01 - Tool-Using Agent](./lab-01-tool-using-agent.md) | Tool use | TypeScript | Minimal custom runtime / AutoGen-style example | The model proposes a capability use; software owns validation and execution. |
| [Lab 02 - Agent Loop and Planning](./lab-02-agent-loop-and-planning.md) | Planning and execution | TypeScript, with Python mirror | Framework-neutral planner/executor | Planning and execution are separate responsibilities even when one framework packages both. |
| [Lab 03 - Agentic RAG](./lab-03-agentic-rag.md) | Retrieval and grounding | Python | LangChain/LangGraph-style retrieval stack | Retrieval produces scoped evidence; generation must stay grounded in that evidence. |
| [Lab 04 - A2A Communication](./lab-04-a2a-communication.md) | Agent-to-agent protocol | TypeScript | Protocol-first runtime with Ajv schema validation | Agent communication needs typed envelopes, correlation IDs, refusals, errors, and cancellation. |
| [Lab 05 - Multi-Agent Supervisor](./lab-05-multi-agent-supervisor.md) | Supervisor / worker | TypeScript | AutoGen-style manager/worker example | A supervisor owns decomposition, worker contracts, and final synthesis. |
| [Lab 06 - Observability and Evals](./lab-06-observability-and-evals.md) | Trace and eval harness | TypeScript | Framework-neutral tests over examples | Evals should inspect trajectories, not only final answers. |
| [Lab 07 - Mastra Runtime Packaging](./lab-07-mastra-runtime-packaging.md) | Runtime packaging | TypeScript | Mastra-style agents, tools, workflows, memory, and evals | Framework runtime packaging does not remove product ownership of state, policy, and acceptance. |
| [Lab 08 - CrewAI Flows and Crews](./lab-08-crewai-flows-and-crews.md) | Flow and crew orchestration | Python | CrewAI-style flows, crews, roles, and tasks | Flows own state and acceptance; crews perform bounded specialist work. |
| [Mini-Framework Track](./from-scratch-mini-framework.md) | Runtime primitives | TypeScript or Python | From-scratch educational runtime | Building the primitives once clarifies what frameworks package. |
| [Lab 09 - Minimal Agent Loop](./lab-09-minimal-agent-loop.md) | Agent loop | TypeScript or Python | From-scratch educational runtime | State, decisions, observations, budgets, and stop reasons are the core loop. |
| [Lab 10 - Tool Registry and Policy Gate](./lab-10-tool-registry-and-policy-gate.md) | Tool and policy boundary | TypeScript or Python | From-scratch educational runtime | Tool availability and policy authorization are different runtime decisions. |
| [Lab 11 - Context, Memory, Trace, and Evals](./lab-11-context-memory-trace-evals.md) | Runtime observability | TypeScript or Python | From-scratch educational runtime | Context, memory, traces, and trajectory evals make the runtime reviewable. |
| [Lab 12 - LangGraph State Graph](./lab-12-langgraph-state-graph.md) | State graph and resume | Python | LangGraph-style graph state, nodes, edges, checkpoints, and interrupts | Graph execution is strongest when state, branching, pause/resume, and node observability matter. |
| [Lab 13 - AutoGen Transcript Evals](./lab-13-autogen-transcript-evals.md) | Multi-agent transcript evaluation | TypeScript | AutoGen-style agents, teams, messages, and transcript evals | A multi-agent run needs a reviewable transcript, explicit stop reason, and role-level acceptance criteria. |

## How To Read The Matrix

Do not treat the framework column as the point of the lab. Treat it as the implementation surface. The durable lesson is the boundary: state, tools, policy, context, communication, evaluation, or runtime control.

If you later use LangGraph, Mastra AI, AutoGen, CrewAI, Semantic Kernel, MCP, or a custom runtime, keep the same questions in view:

- What does the framework own?
- What does your application still own?
- Where is state persisted?
- Where are tool calls validated?
- Where is policy enforced?
- What can be replayed after a failure?

## Choose By Situation

Use this table when you already know the problem you are trying to solve.

| If Your Current Problem Is... | Start With | Then Read | Why |
| --- | --- | --- | --- |
| Exposing one tool to a model | [Lab 01](./lab-01-tool-using-agent.md) | [Tool Capability Design](../tools-skills-protocols/tool-capability-design) | You need typed inputs, controlled errors, and permission boundaries before autonomy. |
| Adding planning or step-by-step execution | [Lab 02](./lab-02-agent-loop-and-planning.md) | [Planning and Execution](../control-loops/planning-and-execution) | You need to separate plan creation, execution, and stop reasons. |
| Grounding answers in documents | [Lab 03](./lab-03-agentic-rag.md) | [Semantic Recall and RAG](../memory-knowledge/semantic-recall-rag) | You need source eligibility, retrieval quality, citations, and missing-evidence behavior. |
| Connecting agents or services | [Lab 04](./lab-04-a2a-communication.md) | [A2A Agent Interoperability](../tools-skills-protocols/a2a-agent-interoperability) | You need typed envelopes, identity, refusals, errors, cancellation, and replay. |
| Splitting work across roles | [Lab 05](./lab-05-multi-agent-supervisor.md) | [Supervisor / Worker](../multi-agent-systems/supervisor-worker) | You need worker contracts, merge policy, and one final owner. |
| Proving behavior with traces and evals | [Lab 06](./lab-06-observability-and-evals.md) | [Observability and Evals](../production-runtime/observability-and-evals) | You need trajectory evidence, not just final answers. |
| Comparing framework runtime packaging | [Lab 07](./lab-07-mastra-runtime-packaging.md) | [Framework Selection](../agent-engineering-practice/framework-selection) | You need to see what a runtime packages and what your product still owns. |
| Modeling crew-style orchestration | [Lab 08](./lab-08-crewai-flows-and-crews.md) | [Choosing Multi-Agent Topology](../multi-agent-systems/choosing-multi-agent-topology) | You need to distinguish flow state from role-based worker output. |
| Understanding what frameworks package | [Mini-Framework Track](./from-scratch-mini-framework.md) | [Building a Minimal Agent Runtime](../agent-engineering-practice/building-a-minimal-agent-runtime) | You need the primitives before comparing framework abstractions. |
| Testing resume, interrupts, or graph state | [Lab 12](./lab-12-langgraph-state-graph.md) | [Durable Workflows](../production-runtime/durable-workflows) | You need checkpoints, state transitions, and failure recovery. |
| Evaluating multi-agent conversations | [Lab 13](./lab-13-autogen-transcript-evals.md) | [Debate and Consensus](../multi-agent-systems/debate-and-consensus) | You need transcript evidence, role acceptance, and stop conditions. |

If several rows apply, start with the riskiest boundary. A write-capable tool, private data source, long-running workflow, or multi-agent handoff should drive the lab choice.

## Fast Decision Shortcut

Use this shortcut when you have five minutes and need a starting path.

| Highest Risk In Your System | Run First | Add Next | Production Check |
| --- | --- | --- | --- |
| A model can call a tool | Lab 01 | Lab 10 | Tool schema, permission, idempotency, timeout, and audit record. |
| A model can plan several steps | Lab 02 | Lab 09 | Stop reason, budget, retry rule, cancellation, and trace events. |
| A model answers from documents | Lab 03 | Lab 11 | Source ACLs, freshness, citations, missing-evidence behavior, and retrieval evals. |
| Agents exchange messages | Lab 04 | Lab 13 | Typed envelope, identity, correlation ID, refusal, cancellation, and transcript replay. |
| Work splits across roles | Lab 05 | Lab 08 | Worker contract, merge policy, final owner, role permissions, and acceptance eval. |
| Release quality is unclear | Lab 06 | Lab 11 | Trace contract, negative cases, trajectory evals, and blocking thresholds. |
| Work can pause and resume | Lab 12 | Durable Workflows chapter | Checkpoint store, interrupt payload, state migration, and stuck-run dashboard. |
| Framework choice is unclear | Mini-Framework Track | Lab 07 | Ownership split between framework runtime and product policy. |

Do not optimize for the most interesting lab. Optimize for the boundary most likely to hurt users, leak data, spend money, or block operators.

## Lab-To-Product Paths

Use these paths when you want a lab to become design-review material.

| Product Slice | Run | Compare With | Finish With |
| --- | --- | --- | --- |
| Support refund agent | Lab 01, Lab 07, Lab 12 | `native-framework-examples/mastra-refund/`, `native-framework-examples/langgraph-refund/` | [Support Refund Agent Capstone](../capstone-projects/support-refund-agent) |
| Research RAG assistant | Lab 03, Lab 06, Lab 11 | `native-framework-examples/langgraph-research-rag/` | [Research RAG Agent Capstone](../capstone-projects/research-rag-agent) |
| Multi-agent delivery workflow | Lab 05, Lab 08, Lab 13 | `native-framework-examples/autogen-delivery/`, `native-framework-examples/crewai-delivery/` | [Multi-Agent Delivery Workflow Capstone](../capstone-projects/multi-agent-delivery-workflow) |
| Custom runtime foundation | Labs 09, 10, 11 | Mini-framework TypeScript or Python implementation | [Reference Architecture](../systems-architecture/reference-architecture) |

Each path should end with a worksheet, not just a passing command. Use the [lab completion worksheet](/capstone-assets/templates/lab-completion-worksheet.txt), then the [lab production readiness worksheet](/capstone-assets/templates/lab-production-readiness-worksheet.txt).

## Current Coverage

The current labs now cover TypeScript, Python, protocol boundaries, framework-neutral tests, LangGraph-style state graphs, AutoGen-style transcripts, Mastra-style runtime packaging, CrewAI-style flow orchestration, from-scratch runtime primitives, production readiness gates, and isolated native framework examples.

Repository native examples:

| Example | Framework | Connects To |
| --- | --- | --- |
| `native-framework-examples/langgraph-refund/` | LangGraph | Lab 12 and Support Refund Agent capstone |
| `native-framework-examples/langgraph-research-rag/` | LangGraph | Lab 03 and Research RAG Agent capstone |
| `native-framework-examples/mastra-refund/` | Mastra | Lab 07 and Support Refund Agent capstone |
| `native-framework-examples/autogen-delivery/` | AutoGen | Lab 13 and Multi-Agent Delivery Workflow capstone |
| `native-framework-examples/crewai-delivery/` | CrewAI | Lab 08 and Multi-Agent Delivery Workflow capstone |

Planned lab expansion should add:

- deeper deployment walkthroughs that connect the readiness checklist to concrete cloud/runtime targets.

## Matrix Review Gate

Before adding a new lab, update this page only if the lab changes reader choice. A new lab should add at least one of these:

- a new architecture boundary;
- a missing language or runtime comparison;
- a production concern not covered by existing labs;
- a capstone path that readers can follow end to end;
- a native framework slice that clarifies what the framework owns.

Do not add labs only to cover another library. Add them when they teach a boundary that engineers need to ship safer systems.
