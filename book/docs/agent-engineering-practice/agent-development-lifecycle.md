---
title: Agent Development Lifecycle
---

# Agent Development Lifecycle

Agent development is not prompt writing with deployment at the end. It is product engineering with a probabilistic component inside it.

That distinction matters. A prompt can make a demo work. A lifecycle makes the system survivable after the demo: when users ask unclear questions, tools fail, policies change, costs spike, and the model confidently proposes the wrong action.

Use this lifecycle when an agent will serve real users, call tools, touch private data, change external systems, or run for more than a demo session.

The lifecycle has one job: keep autonomy connected to evidence, state, policy, evaluation, and operations.

## Lifecycle Stages

| Stage | Main Question | Output |
| --- | --- | --- |
| 1. Capability framing | What should the agent do, and what should it never do? | Capability map, exclusions, risk class. |
| 2. Pattern selection | What is the least agentic architecture that works? | Pattern choice and complexity budget. |
| 3. Boundary design | Where do model decisions stop and software controls begin? | Tool contracts, policies, state model. |
| 4. Implementation | How does the agent perceive, decide, act, and stop? | Runnable agent, workflow, or multi-agent system. |
| 5. Evaluation | How do we know it works? | Eval suite, failure modes, quality gates. |
| 6. Deployment | How does it run safely in production? | Observability, rollback, rate limits, approvals. |
| 7. Governance | How does it improve without losing control? | Review process, audit logs, versioning, incident loop. |

The lifecycle is iterative. Production data should update evals, policies, prompts, tool design, and sometimes the architecture itself. If production failures only produce prompt tweaks, the team is probably treating symptoms.

## Capability Framing

Start with a capability map, not a framework choice. A framework cannot tell you what the agent is allowed to do.

Capture the user jobs and business outcomes, the allowed and forbidden actions, the required evidence, the required tools and data, the approval points, the privacy and compliance constraints, the acceptable latency and cost, and the expected failure behavior. The important part is the negative space. An agent with a clear "will not do" list is easier to ship than an agent defined only by what it might do.

Good capability framing sounds concrete:

- "The agent can draft refund recommendations, but cannot issue refunds."
- "The agent can query account history, but cannot access payment instruments."
- "The agent can summarize an incident, but cannot page an on-call engineer without approval."

If the team cannot write boundaries this plainly, the agent is not ready for implementation.

## Pattern Selection

Select the simplest pattern that handles the task. This is where many teams overbuild. A prompt handles a single bounded task. A prompt chain handles known phases. Routing handles inputs that need different paths. An agent loop handles the case where the next step depends on observations. Multi-agent systems handle separate roles that need separate context, tools, or permissions.

Do not start with a multi-agent architecture because the domain has many tasks. Start by grouping capabilities into stable workflows. Split agents only where role boundaries are real: different context, different tools, different permissions, different review responsibilities, or real parallel work.

The wrong pattern usually fails in one of two ways. It is too simple, so it cannot handle uncertainty. Or it is too agentic, so it becomes expensive, slow, and hard to debug. The lifecycle should catch both.

## Boundary Design

Before implementation, define the system boundaries. This is the architecture work that prevents the model from quietly becoming the whole application.

- What owns state?
- What owns policy?
- What owns tool permissions?
- What owns memory writes?
- What owns final approval?
- What can be replayed after failure?
- What can be changed without redeploying code?

The model may propose actions. Software validates, executes, logs, and enforces.

This boundary should be visible in code. Tool schemas should not be vague. State transitions should not be hidden in natural language. Approval rules should not live only in the system prompt. Memory writes should be reviewed or constrained before they become future context.

## Implementation

Implementation should make the lifecycle visible in code. A reader should be able to find the goal object, the state model, the tool boundary, the policy checks, the stop condition, and the trace emission without reverse-engineering a prompt.

Minimum implementation units:

- a goal or request object;
- typed state;
- tool schemas;
- policy checks;
- stop conditions;
- trace events;
- eval fixtures;
- deployment configuration.

Avoid implementations where the only durable artifact is a conversation transcript. Transcripts are useful evidence. They are not a state model.

The implementation should also make failure explicit. A failed tool call, a denied policy check, a budget stop, and a user cancellation are different outcomes. Do not collapse them into "the agent failed."

## Evaluation

Evaluate before launch and after launch. Agents change behavior when prompts, tools, models, memory, retrieval indexes, policies, or user populations change. Evaluation is not a launch checklist. It is the feedback loop for the system.

Pre-launch evaluation should cover happy-path tasks, ambiguous user requests, missing data, tool failure, retrieval failure, prompt-injection attempts, approval-required actions, and cost and latency budgets. Post-launch evaluation should add production failures, user corrections, human override cases, and edge cases found in traces. Every serious incident should leave behind an eval case.

## Deployment

Production deployment needs more than a hosted endpoint. It needs operational control: model and prompt versioning, rate limits and cost budgets, tool-level timeouts, audit logs, trace IDs that span tools and agents, alerting for breaker events, human escalation paths, and rollback for prompts, policies, and tools. If a deployment cannot explain what the agent did, it is not ready for high-impact work. The operator should be able to answer what goal was active, what evidence was used, what tools were called, what policies passed, what changed, and why the run stopped.

## Governance

Governance is the control loop around the agent. It decides how the system changes without losing the boundaries that made it safe enough to ship. That means reviewing new tools, prompt and policy changes, memory schemas, eval changes, approval thresholds, incident reports, and model upgrades.

Treat agent changes like product and infrastructure changes. Small prompt edits can change behavior as much as code changes. New tools can change the risk class of the whole system. A model upgrade can invalidate old eval results. A memory schema change can change what the agent believes about returning users.

The lifecycle is complete only when these changes are reviewed, tested, deployed, observed, and fed back into the next iteration.

## Related Chapters

- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [Goals and State](../foundations/goals-and-state)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
