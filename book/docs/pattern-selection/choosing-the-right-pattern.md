---
title: Choosing the Right Pattern
---

# Choosing the Right Pattern

Agentic design is a spectrum. The best architecture is usually the least agentic system that can meet the requirement with acceptable quality, latency, cost, and risk.

Use this chapter before choosing a framework, adding agents, or building a multi-agent topology. The decision should start with the workload, not with the most powerful pattern available.

## The Autonomy Ladder

Move up the ladder only when the lower rung cannot handle the job.

| Level | Pattern Shape | Use When | Main Risk |
| --- | --- | --- | --- |
| 1 | LLM call | A single answer, rewrite, classification, extraction, or summary is enough. | No access to live data or action. |
| 2 | Prompt chain | The work has known phases and each phase can be validated before the next one starts. | Brittle gates or unnecessary latency. |
| 3 | Deterministic workflow with LLM steps | Code owns the sequence, while LLMs handle bounded judgment inside steps. | Overfitting the workflow to today's process. |
| 4 | Routing and handoffs | Different inputs need different models, prompts, tools, agents, or policies. | Bad routing sends work to the wrong authority. |
| 5 | Single agent loop | The next step depends on observations discovered during execution. | Loops, tool misuse, and compounding errors. |
| 6 | Orchestrator-workers | The system must break an unknown task into subtasks and synthesize results. | The orchestrator becomes a hidden control plane. |
| 7 | Multi-agent system | Different specialists need separate context, tools, permissions, or review roles. | Coordination overhead, trace fragmentation, and cost growth. |
| 8 | Autonomous long-running agent | The task spans time, failures, external events, and partial progress. | Unbounded autonomy without strong state, policy, and observability. |

This ladder is not a maturity model. A production system can stay at level 2 forever if the task is stable and the value is clear.

## First Questions

Ask these questions before selecting a pattern:

- Is the workflow known before execution starts?
- Does the model need to choose the next step, or can code do it?
- Does the task need current data, private data, tools, or side effects?
- Can the system tolerate extra latency from multiple model calls?
- What is the maximum acceptable cost per run?
- What requires human approval?
- What evidence proves the answer or action is correct?
- What state must be replayable after a failure?
- What could go wrong if the model is persuasive but wrong?

If the answers are unclear, start with a deterministic workflow and add agentic behavior only where the workflow needs model judgment.

## Selection Matrix

| Workload Signal | Prefer | Avoid |
| --- | --- | --- |
| Known fixed sequence | Prompt Chaining and Gates | Autonomous agents |
| One of several known task types | Routing and Handoffs | One giant prompt |
| Independent subtasks | Parallel Agents | Sequential chains that create avoidable latency |
| Unknown subtasks | Orchestrator-workers | Hard-coded task lists |
| Quality improves with review | Evaluator-Optimizer | Single-pass generation |
| High-risk side effects | Human Approval Gates | Direct tool execution from model output |
| Large tool surface | MCP-first Tool Use with policy | Broad untyped tools |
| Long-running work | Durable Workflows and Goals and State | Hidden in-memory loops |
| Sensitive data or compliance | Policy Enforcement and audit logs | Prompt-only controls |
| Retrieval-heavy answers | Agentic RAG Systems | Blind model responses |
| Debugging matters | Observability and Evals | Final-answer-only logs |

The same product may combine several rows. For example, a support refund workflow may use routing to classify the request, deterministic workflow steps for account lookup, RAG for policy evidence, human approval for exceptions, and an agent loop only for open-ended investigation.

## Workflows vs Agents

A workflow uses code to control the path. A model may classify, extract, summarize, critique, or generate inside a step, but software decides what happens next.

An agent uses the model to decide parts of the path. It observes state, decides the next action, calls tools, reads results, and continues until a goal is complete or a limit is reached.

Prefer workflows when:

- the process is stable;
- correctness depends on deterministic rules;
- latency or cost must stay low;
- the system must be easy to audit;
- operators need predictable failure modes.

Prefer agents when:

- the process is open-ended;
- the system must discover missing information;
- tool choice depends on intermediate observations;
- the number of steps is unknown;
- a fixed workflow would branch into an unmaintainable tree.

## Complexity Budget

Every additional agent, model call, tool, memory store, and evaluator spends part of the system's complexity budget. Spend it deliberately.

Add complexity when it buys one of these outcomes:

- higher task completion rate;
- lower human effort;
- better evidence grounding;
- safer side effects;
- lower cost through routing or smaller models;
- better debuggability;
- clearer ownership boundaries.

Do not add complexity only because a pattern is popular. A multi-agent system that replaces a reliable four-step workflow usually makes the product slower, harder to test, and harder to explain.

## Pattern Evolution Path

A practical evolution path looks like this:

1. Start with one prompt or deterministic workflow.
2. Add structured outputs and validation.
3. Add retrieval or tools where the model needs evidence or action.
4. Add routing when inputs diverge into distinct paths.
5. Add evaluator loops where quality improves with critique.
6. Add durable state when work spans several steps or sessions.
7. Add agents only where dynamic decisions are required.
8. Add multi-agent coordination when separate roles need separate context, tools, or permissions.

Each step should improve a measured outcome. If a pattern does not improve accuracy, reliability, latency, cost, safety, or maintainability, remove it.

## Minimum Production Bar

Before a pattern handles users, money, private data, infrastructure, or customer communication, the system should have:

- typed inputs and outputs;
- explicit stop conditions;
- bounded tool permissions;
- traceable model and tool calls;
- replayable state transitions;
- eval datasets for expected behavior;
- fallback behavior for model, retrieval, and tool failure;
- human approval for high-risk actions;
- rollback or remediation for bad actions.

This minimum bar applies to simple systems too. Small systems fail faster because their boundaries are often implicit.

## Related Chapters

- [Prompt Chaining and Gates](./prompt-chaining-and-gates)
- [Routing and Handoffs](./routing-and-handoffs)
- [Circuit Breakers, Fallbacks, and Replay](./circuit-breakers-fallbacks-replay)
- [Agent Loop](../foundations/agent-loop)
- [Goals and State](../foundations/goals-and-state)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
- [Source Map](./source-map)
