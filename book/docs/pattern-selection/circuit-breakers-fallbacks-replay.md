---
title: Circuit Breakers, Fallbacks, and Replay
---

# Circuit Breakers, Fallbacks, and Replay

Agentic systems need controls that stop waste, contain damage, and make failures explainable. Circuit breakers stop unsafe or unproductive execution. Fallbacks give the system a safer next move. Replay lets engineers reconstruct what happened.

This is a reliability pattern for agent loops, tool use, RAG, workflow orchestration, and multi-agent systems.

## Intent

Protect the system from repeated failure and make every run recoverable enough to debug.

An agent should not keep calling the same failing tool, searching the same empty corpus, revising the same bad draft, or handing the same task between agents without progress.

## Use When

- Agents can call tools, APIs, browsers, shells, or workflows.
- Work can loop, retry, delegate, or wait.
- Costs can grow with each model or tool call.
- Partial state matters after failure.
- Operators need to explain why a run stopped.

This pattern is mandatory for production systems with side effects.

## Avoid When

- The task is a throwaway prototype with no external effect.
- The system has no loop, retry, or tool use.
- Failures do not need investigation.

Even then, keep a simple run log. The prototype that works often becomes the production seed.

## Circuit Breakers

A circuit breaker turns repeated or high-risk failure into a stop, fallback, or escalation.

| Breaker | Trigger | Action |
| --- | --- | --- |
| Tool failure breaker | Same tool fails N times or returns malformed output. | Disable tool for run and choose fallback. |
| No-progress breaker | State does not change across iterations. | Stop loop and return blocked status. |
| Cost breaker | Token, model-call, or money budget is reached. | Stop, summarize progress, and ask for approval. |
| Latency breaker | Step or run exceeds time budget. | Defer, enqueue, or return partial result. |
| Retrieval breaker | Search returns low-coverage or conflicting evidence. | Ask clarification or escalate. |
| Policy breaker | Tool intent violates permissions or risk rules. | Block action and log policy reason. |
| Handoff breaker | Agents bounce a task between roles. | Assign owner or escalate to human. |
| Output breaker | Final answer fails schema, citation, or eval checks. | Repair once, then fail safely. |

Breakers need names and thresholds. "The agent got stuck" is not operational enough. "No-progress breaker fired after 4 iterations with unchanged evidence set" is debuggable.

## Fallbacks

A fallback should be safer than the failed path.

Useful fallback types:

- ask the user for missing information;
- return a partial answer with explicit limits;
- switch from autonomous tool use to deterministic workflow;
- switch from a weak model to a stronger model;
- switch from write action to read-only analysis;
- use cached or previously verified data;
- route to human review;
- schedule background processing;
- fail closed for restricted actions.

Do not use fallback as a way to hide failure. The user or operator should know what changed.

## Replay

Replay is the ability to reconstruct a run from durable state.

Store:

- run ID and parent run ID;
- goal and normalized intent;
- model calls, model versions, parameters, and prompt references;
- tool calls, inputs, outputs, errors, and side-effect identifiers;
- retrieval queries, source IDs, and citation metadata;
- state transitions;
- route decisions and handoffs;
- policy checks;
- breaker and fallback events;
- final output and eval results.

Redact sensitive content when required, but keep enough references to investigate the run.

## Replay Levels

| Level | Capability | Use |
| --- | --- | --- |
| Trace replay | Reconstruct what happened from logs. | Incident review and debugging. |
| Deterministic replay | Re-run deterministic code with recorded model/tool outputs. | Regression tests and workflow validation. |
| Full replay | Re-run model and tool calls in a sandbox. | Reproduction when external systems are stable. |
| Counterfactual replay | Re-run with changed prompt, policy, model, or tool. | Evaluate fixes before rollout. |

Most teams should start with trace replay. Full replay is useful but harder because models, tools, and external data change.

## Implementation Notes

- Add breakers at the loop, tool, retrieval, route, and workflow levels.
- Record breaker events as first-class trace events.
- Tie fallback decisions to explicit failure reasons.
- Separate safe retries from repeated guessing.
- Make every side effect idempotent or traceable.
- Store enough state to resume or fail cleanly.
- Turn incidents into eval cases.

## Example Breaker Logic

```ts
interface ToolFailure {
  tool: string;
  count: number;
  lastError: string;
}

interface RunBudget {
  maxIterations: number;
  maxToolFailuresPerTool: number;
  maxCostUsd: number;
}

function shouldOpenToolBreaker(
  failure: ToolFailure,
  budget: RunBudget
): boolean {
  return failure.count >= budget.maxToolFailuresPerTool;
}

function shouldStopLoop(iteration: number, costUsd: number, budget: RunBudget): string | null {
  if (iteration >= budget.maxIterations) return 'max_iterations_reached';
  if (costUsd >= budget.maxCostUsd) return 'max_cost_reached';
  return null;
}
```

The important part is not the code size. The important part is that the stop reason becomes part of the run state and trace.

## Failure Modes

- Breakers exist in logs but do not affect execution.
- Fallbacks silently lower quality without telling the user.
- Retries repeat the same inputs and expect different outcomes.
- Traces omit tool inputs, making replay impossible.
- Side effects cannot be matched to the agent run that created them.
- Multi-agent systems have no single owner when a breaker fires.

## Production Checklist

- Does every loop have max iterations, max cost, and max wall-clock time?
- Does every tool have timeout, retry, and failure thresholds?
- Does every fallback tell the operator what changed?
- Can the system stop safely after partial progress?
- Can a failed run become an eval fixture?
- Can side effects be audited and reversed when possible?
- Can operators replay a run without reading raw prompts from scattered logs?

## Related Chapters

- [Agent Loop](../foundations/agent-loop)
- [Goals and State](../foundations/goals-and-state)
- [Self-Healing Workflows](../control-loops/self-healing-workflows)
- [Durable Workflows](../production-runtime/durable-workflows)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Policy Enforcement](../production-runtime/policy-enforcement)
