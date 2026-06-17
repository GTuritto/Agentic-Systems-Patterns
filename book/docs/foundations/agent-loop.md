---
title: Agent Loop
---

# Agent Loop

The agent loop turns a model call into an agent: observe state, decide the next action, act, evaluate the result, and stop when the goal is complete or a limit is reached.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-loop-pattern)
> - [Download code bundle](/downloads/agent-loop.zip)

## Intent

The agent loop is the smallest runtime structure that makes a model act like an agent. It observes state, decides a next step, validates the proposed action, acts through a bounded interface, records the observation, and stops when success, failure, budget, or escalation says the run is over.

The loop is powerful because the next step can depend on what just happened. It is dangerous for the same reason. Without explicit state, budgets, validation, and stop reasons, the loop becomes a place where cost, latency, unsafe tool use, and hidden failures accumulate.

## Use When

- The task cannot be solved by a fixed sequence known ahead of time.
- The next step depends on observations from tools, retrieval, users, or intermediate outputs.
- The agent may need multiple attempts, but those attempts can be bounded.
- The system can persist enough loop state to replay or debug the run.
- You can define success, failure, budget exhaustion, and escalation conditions.

## Avoid When

- A deterministic workflow or prompt chain can express the steps clearly.
- The task has no useful intermediate observations.
- Tool use, cost, runtime, or side effects cannot be bounded.
- The loop state would live only inside the model context.
- The team cannot explain why the loop stopped.

## Architecture

![Agent loop architecture](../public/diagrams/agent-loop.svg)

## System Shape

- **Pattern boundary:** a loop controller owns progress, budget, validation, state updates, and stop decisions.
- **State owner:** the loop runtime owns task-local state during the run and checkpoints durable state when the run must survive interruption.
- **Model role:** the model proposes the next step, but software validates whether the step is allowed.
- **Action boundary:** tools, handoffs, memory writes, and final answers pass through typed validation.
- **Operational promise:** the loop handles uncertainty without giving the model unlimited time, tools, or authority.

## Core Protocol

1. Receive a task with a goal, caller, constraints, budget, and trace ID.
2. Load or initialize loop state: observations, evidence, attempts, errors, and remaining budget.
3. Assemble the working set for the next step.
4. Ask the model to propose either an action, a final result, a refusal, or an escalation.
5. Validate the proposal against schema, tools, policy, state, and budget.
6. Execute the allowed action and record the observation.
7. Update state, budget counters, trace events, and stop reason.
8. Stop on success, failure, refusal, cancellation, budget exhaustion, or escalation.

## Implementation Notes

Keep the controller boring. The loop should be easy to inspect.

```ts
type StopReason =
  | 'completed'
  | 'failed'
  | 'refused'
  | 'needs_human'
  | 'max_steps'
  | 'max_tool_calls'
  | 'timeout';

type LoopState = {
  taskId: string;
  goal: string;
  step: number;
  toolCalls: number;
  startedAtMs: number;
  observations: unknown[];
  errors: string[];
};

type LoopBudget = {
  maxSteps: number;
  maxToolCalls: number;
  timeoutMs: number;
};

function shouldStop(state: LoopState, budget: LoopBudget, nowMs: number): StopReason | null {
  if (state.step >= budget.maxSteps) return 'max_steps';
  if (state.toolCalls >= budget.maxToolCalls) return 'max_tool_calls';
  if (nowMs - state.startedAtMs >= budget.timeoutMs) return 'timeout';
  return null;
}
```

A minimal loop controller can then enforce the boundary:

```ts
async function runAgentLoop(task: AgentTask, budget: LoopBudget) {
  const state = initializeLoopState(task);

  while (true) {
    const stopReason = shouldStop(state, budget, Date.now());
    if (stopReason) return finishRun(state, stopReason);

    const proposal = await proposeNextStep(task, state);
    const decision = validateProposal(proposal, state, task.policy);

    if (decision.status === 'deny') {
      return finishRun(state, 'refused');
    }

    if (decision.status === 'escalate') {
      return finishRun(state, 'needs_human');
    }

    if (decision.status === 'final') {
      return finishRunWithResult(state, decision.result, 'completed');
    }

    const observation = await executeAction(decision.action, {
      traceId: task.traceId,
      idempotencyKey: `${task.taskId}:${state.step}`
    });

    recordObservation(state, observation);
    if (decision.action.kind === 'tool') state.toolCalls += 1;
    state.step += 1;
  }
}
```

The controller does not need to be complicated. It needs to make the hidden parts explicit: the active goal, the proposal, the validation decision, the action, the observation, the budget counters, and the stop reason.

## Failure Modes

- The goal is vague, so the loop keeps working without a stable success condition.
- The model is allowed to decide when the loop should stop without a software-owned budget.
- The loop repeats the same tool call because it does not compare new observations with prior observations.
- Retries happen without idempotency, duplicating side effects.
- State exists only in the prompt, so replay and recovery are impossible.
- The loop summarizes away evidence that was needed for the next decision.
- Tool errors are treated as normal observations, causing confused follow-up actions.
- The agent declares success because it produced an answer, not because the goal was satisfied.
- Traces capture the final output but not the iteration history.

## Evaluation Strategy

Loop evals should test the trajectory, not only the final response.

- Test a task that completes within budget.
- Test a task that must stop on `max_steps`.
- Test a task that must stop on `max_tool_calls`.
- Test a task with a malformed tool result.
- Test a task with repeated tool failure that should escalate.
- Test a task where the model proposes a forbidden action.
- Test a task where the model claims completion but required evidence is missing.
- Test replay from a saved loop state.

A compact eval fixture can make the expected stop behavior explicit:

```json
{
  "case_id": "shipping_lookup_repeated_failure",
  "goal": "Investigate whether an order arrived late.",
  "mocked_tools": {
    "shipping.read_delivery_status": [
      { "status": "retryable_error", "reason": "upstream_timeout" },
      { "status": "retryable_error", "reason": "upstream_timeout" }
    ]
  },
  "expected": {
    "stop_reason": "needs_human",
    "max_tool_calls": 2,
    "forbidden_tools": ["refunds.issue_refund"],
    "requires_trace_events": ["proposal", "validation", "tool_result", "stop"]
  }
}
```

Measure completion rate, correct stop reason, invalid-action rate, repeated-action rate, escalation accuracy, token and tool cost, latency, and replay success.

## Production Checklist

- Define the loop goal and success criteria before the first model call.
- Store loop state outside the model context.
- Set hard limits for steps, tool calls, wall-clock time, retries, and cost.
- Validate every action before execution.
- Make side-effectful actions idempotent or approval-gated.
- Record proposal, validation decision, action, observation, error, and stop reason for every iteration.
- Treat cancellation, refusal, timeout, and escalation as normal outcomes.
- Add circuit breakers for repeated failures or unsafe action proposals.
- Keep loop prompts, tool manifests, policies, and model routes versioned.
- Replay production failures into regression evals.

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/agent-loop.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-loop-pattern)

The download bundle contains the current `agent-loop-pattern/` folder from this repository.

## Related Patterns

- [Goals and State](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/goals-and-state-pattern/README.md)
- [Tool-Using Agent](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/tool-using-agent-pattern/README.md)
- [Structured Output](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/structured-output-pattern/README.md)
- [Evaluator-Optimizer](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/evaluator-optimizer-pattern/README.md)
- [Durable Workflows](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
- [Pattern Evaluation Checklist](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/book/docs/pattern-selection/pattern-evaluation-checklist.md)
- [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
