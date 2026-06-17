---
title: Production Runtime Overview
---

# Production Runtime Overview

Production agentic systems need more than prompts, tools, and a good model. They need a runtime that owns the execution boundary.

The core rule is the same throughout this book: the model proposes, the runtime decides. The model can propose a plan, a tool call, a memory write, a retrieval query, a reply, or a stop condition. The runtime owns whether that proposal is valid, allowed, affordable, observable, durable, and safe to execute.

This is where many agent projects fail. They treat the model call as the system, then add logging, retries, approvals, evals, and rollback after the first incident. A production runtime inverts that order. It gives the agent a controlled place to operate.

![Production runtime control plane](../public/diagrams/production-runtime-overview.svg)

## What The Runtime Owns

The production runtime is the control plane around model judgment.

| Runtime Concern | What It Owns |
| --- | --- |
| State | Goal, run status, workflow step, attempts, tool results, approvals, stop reason. |
| Policy | Permissions, risk classification, denial, approval, escalation, audit requirements. |
| Budgets | Tokens, model calls, tool calls, retries, delegations, wall-clock time, cost. |
| Tools | Schemas, permissions, timeouts, idempotency, side-effect records. |
| Memory and retrieval | Source eligibility, freshness, access control, evidence references, memory writes. |
| Observability | Trace IDs, spans, costs, latency, model and tool events, replay metadata. |
| Evaluation | Runtime checks, incident fixtures, release gates, regression datasets. |
| Recovery | Retries, fallbacks, circuit breakers, checkpoints, compensation, rollback. |

The runtime does not remove autonomy. It makes autonomy bounded enough to trust.

## The Runtime Loop

A production runtime loop is not just observe, decide, act. It is closer to:

1. receive a request, event, schedule, webhook, or workflow command;
2. authenticate the caller and load task class, risk class, state, policy, budget, and trace ID;
3. assemble the working set: goal, constraints, evidence, allowed tools, memory, and stop rules;
4. ask the model or deterministic router for a bounded proposal;
5. validate the proposal against schema, policy, budget, state, evidence, and approval rules;
6. execute one bounded step through a tool, workflow, retrieval service, evaluator, or approval gate;
7. checkpoint state, trace events, cost, latency, side effects, and stop reason;
8. decide whether to continue, fallback, wait, escalate, refuse, compensate, or complete;
9. convert important failures and near misses into eval cases.

This loop is what separates an agentic product from a demo. The model can still be creative and adaptive, but the system knows what happened and why.

## Runtime Boundaries

A good runtime creates explicit boundaries:

- **Decision boundary:** the model can suggest actions, but software validates them.
- **Authority boundary:** side effects require tool schemas, permissions, budgets, and approval rules.
- **State boundary:** durable workflow state is separate from model context.
- **Context boundary:** the model sees a selected working set, not every available document or memory.
- **Cost boundary:** every loop, tool, retry, model call, and delegation spends from a budget.
- **Policy boundary:** denial and escalation are runtime outcomes, not prompt preferences.
- **Recovery boundary:** retries, fallbacks, replay, and rollback are designed before production traffic.

When these boundaries are missing, the model becomes the control plane by accident.

## How The Production Runtime Chapters Compose

Read the production runtime section as one operating model:

- [Durable Workflows](./durable-workflows) own long-running state, retries, checkpoints, approvals, compensation, and resumability.
- [Observability and Evals](./observability-and-evals) records what happened and turns behavior into something engineers can inspect.
- [Production Evaluation Feedback Loops](./production-evaluation-feedback-loops) converts production failures into regression cases and release gates.
- [Cost Controls and Runtime Budgets](./cost-controls-runtime-budgets) defines how much autonomy, spend, time, and human attention a run may consume.
- [Policy Enforcement](./policy-enforcement) keeps permission, risk, and compliance decisions outside the model.
- [Event-Triggered Agents](./event-triggered-agents) shows how agents respond to events without losing idempotency, state, and auditability.
- [Mastra Runtime](./mastra-runtime) maps these production concerns into a concrete runtime style.

The chapters are separate because each boundary deserves attention. In a real system, they should work together.

## Minimal Runtime Contract

Every production run should be able to produce a contract like this:

```ts
type RuntimeRun = {
  runId: string;
  traceId: string;
  caller: string;
  goal: string;
  riskClass: 'low' | 'medium' | 'high';
  status: 'running' | 'waiting' | 'succeeded' | 'failed' | 'refused';
  budgetPolicyVersion: string;
  policyVersion: string;
  workflowStep?: string;
  allowedTools: string[];
  stopReason?: string;
};
```

This is not enough to implement a full platform, but it is enough to make the hidden parts visible. If a run does not have a trace ID, risk class, budget policy, policy version, allowed tools, status, and stop reason, it will be hard to operate.

## Runtime Checklist

Before a production agent handles real work, answer:

- What owns the active goal?
- Where is durable run state stored?
- Which component validates model proposals?
- Which tools are allowed for this task class?
- Which actions require approval?
- What budget applies to the run?
- What happens when the budget is exhausted?
- What trace events are required?
- What side effects need idempotency or compensation?
- What breaker, fallback, or escalation path exists?
- What evals block release?
- What can be rolled back without redeploying the whole system?

If those answers are vague, the system is still a prototype, even if it is already serving users.

## Failure Modes

- The model owns state transitions because the runtime has no workflow state.
- Policy lives in the prompt instead of a runtime enforcement layer.
- Tool calls happen before budget, permission, schema, or approval checks.
- Retry logic repeats side effects without idempotency keys.
- Observability records final answers but not proposals, validation decisions, tool calls, and stop reasons.
- Evals test final prose while the runtime path remains untested.
- Operators cannot disable a risky tool, prompt version, model route, or workflow step quickly.
- The system can continue spending tokens, tool calls, and human attention after the task is no longer worth it.

## Design Rule

Production runtime is where agentic architecture becomes honest. If the runtime cannot explain, bound, replay, and stop the agent, the model is not the only risk. The architecture is.

## Related Chapters

- [Architecture Before Autonomy](../pattern-selection/architecture-before-autonomy)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
- [Reference Architecture](../systems-architecture/reference-architecture)
- [Durable Workflows](./durable-workflows)
- [Observability and Evals](./observability-and-evals)
- [Production Evaluation Feedback Loops](./production-evaluation-feedback-loops)
- [Cost Controls and Runtime Budgets](./cost-controls-runtime-budgets)
- [Policy Enforcement](./policy-enforcement)
