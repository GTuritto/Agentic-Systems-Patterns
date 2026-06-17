---
title: Architecture Before Autonomy
---

# Architecture Before Autonomy

Do not start with the framework. Start with the boundary: what is the model allowed to decide?

Agents earn their place when software cannot know every step in advance. They become a liability when the system lets the model own decisions that should belong to code, things like permission checks, stop conditions, budget limits, state transitions, audit records, and irreversible side effects. Good agentic architecture separates judgment from authority. The model proposes the next useful action; the system decides whether that action is valid, allowed, affordable, observable, and safe to execute.

## The Model Is Not The System

An LLM can summarize context, propose plans, choose from tools, critique outputs, and explain tradeoffs. None of that makes it the control plane. The control plane owns the active goal, the allowed tools, the current state, the budget, the stop condition, the policy context, the approval requirements, the retry and fallback rules, and the trace of what happened.

When those responsibilities live only in a prompt, the system gets hard to test and harder to operate. A prompt can influence behavior. It cannot replace a durable boundary.

## A Practical Boundary

Use this division of responsibility as your default:

| Concern | Owned By Software | Proposed By Model |
| --- | --- | --- |
| Goal | The task contract and success criteria | Clarifying questions or subgoals |
| State | Durable store, workflow engine, or application service | Summaries or candidate memory writes |
| Tools | Typed schemas, permissions, timeouts, and audit logs | Tool choice and arguments |
| Policy | Runtime checks and approval gates | Risk explanation or escalation request |
| Evaluation | Tests, rubrics, traces, and review workflow | Self-critique or candidate score |
| Stopping | Explicit success, failure, budget, or cancellation rule | Claim that the goal appears complete |

This does not make the system less agentic. It makes the autonomy legible, which is what lets you operate it.

In code, the boundary can be small and explicit:

```ts
interface ProposedAction {
  kind: 'read' | 'write' | 'notify' | 'stop';
  tool?: string;
  input?: unknown;
  risk: 'low' | 'medium' | 'high';
}

function decideExecution(action: ProposedAction, policy: RuntimePolicy) {
  if (action.kind === 'stop') return { status: 'stop' };

  if (!action.tool || !policy.allowedTools.includes(action.tool)) {
    return { status: 'deny', reason: 'tool_not_allowed' };
  }

  if (action.risk === 'high' && !policy.hasHumanApproval) {
    return { status: 'pause', reason: 'approval_required' };
  }

  return { status: 'execute', tool: action.tool, input: action.input };
}
```

The model proposes `ProposedAction`. The runtime decides whether it is denied, paused, executed, or stopped.

## Premature Autonomy

Premature autonomy shows up when a team reaches for an agent loop before answering simpler questions first: Could this be a deterministic workflow with model-assisted steps? Could a prompt chain with validation solve it? Could routing isolate the different task types? Could a human approval gate handle the risky cases? Can the system already prove why an action was taken, and can a failed run be replayed?

When the answer to those is no, adding more agents tends to hide the weakness rather than fix it. Multi-agent systems amplify unclear goals, weak state, and poor observability far more reliably than they cure them.

## The Engineering Test

Before adding autonomy, ask whether an operator could inspect a failed run and answer:

1. What goal was active?
2. What state did the system believe?
3. What evidence was available?
4. What did the model propose?
5. What did software validate?
6. What tool calls ran?
7. What policy checks passed or failed?
8. Why did the run stop?
9. What changed in the outside world?

If those answers are not available, the next thing to build is not another agent. It is state, policy, evaluation, or observability.

## Design Rule

Autonomy is a budget. Spend it only where it buys a better outcome than deterministic software, and surround it with boundaries that make failure visible.

## Related Chapters

- [Choosing the Right Pattern](./choosing-the-right-pattern)
- [Pattern Evaluation Checklist](./pattern-evaluation-checklist)
- [Agent Loop](../foundations/agent-loop)
- [Goals and State](../foundations/goals-and-state)
- [Tool Use](../foundations/tool-use)
- [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
