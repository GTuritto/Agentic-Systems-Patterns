---
title: Mastra Runtime
---

# Mastra Runtime

Mastra is a TypeScript runtime pattern for applications that need agents, workflows, tools, memory, evals, and observability in one framework.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/mastra-runtime-pattern)
> - [Download code bundle](/downloads/mastra-runtime.zip)

## Intent

The Mastra Runtime Pattern uses Mastra as a TypeScript runtime for production agent applications. Mastra gives agents, workflows, tools, memory, evals, and observability a shared application structure.

## Use When

- You are building a TypeScript or Node-based agent product.
- You need agents and deterministic workflows in the same runtime.
- You want memory, tools, evals, and tracing to be first-class concerns.

## Avoid When

- You only need a small script or single model call.
- Your team is committed to a Python-first agent stack.
- You cannot accept framework conventions around project structure and deployment.

## Architecture

![Mastra runtime architecture](../public/diagrams/mastra-runtime.svg)

## System Shape

- **Pattern boundary:** a production service or framework hosts the agent behind durable workflow, policy, observability, and deployment boundaries.
- **State owner:** the runtime owns durable state, retries, traces, triggers, deployment configuration, and operational controls.
- **Primary artifact:** `mastra-runtime-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** Mastra is a TypeScript runtime pattern for applications that need agents, workflows, tools, memory, evals, and observability in one framework.
- **Runnable path:** start with `npm run mastra-runtime:demo` before adapting the pattern to a larger system.

## Core Protocol

1. Receive a user request, event, schedule, or workflow step with an idempotency key.
2. Load durable state, policy context, memory, and runtime configuration.
3. Execute one bounded step through the agent, tool, or workflow engine.
4. Checkpoint result, trace data, cost, and error state.
5. Retry, compensate, continue, or escalate according to operational policy.

## Implementation Notes

- Use agents for open-ended decisions where the next step is not known upfront.
- Use workflows for predetermined control flow, state transitions, retries, and production orchestration.
- Keep tools typed and independently testable.
- Capture traces and evals from the beginning rather than adding them after failures.

## Failure Modes

- Treating the framework as the architecture instead of modeling goals, state, and failure modes.
- Putting deterministic workflow logic inside prompts.
- Creating tools with vague descriptions and unvalidated inputs.
- Shipping without eval datasets or trace review.

## Evaluation Strategy

- Replay production-like traces through regression evals before deployment.
- Test retries, duplicate events, partial outages, policy denial, and human approval waits.
- Measure reliability, recovery time, cost, latency, user impact, and eval regression rate.
- Include cases that prove each "Use When" condition is true for this pattern.
- Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.

## Production Checklist

- Use durable checkpoints for long-running or externally visible work.
- Add structured traces, metrics, cost tracking, and replay data.
- Define deployment rollback and feature-flag strategy.
- Document operational ownership, alerts, and escalation paths.
- Define human escalation for ambiguous, high-risk, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

## Run the Example

```sh
npm run mastra-runtime:demo
npm run mastra-runtime:test
```

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

These excerpts show the implementation shape. The complete code is available in the download bundle and repository source.

### `mastra-runtime-pattern/typescript/src/runtime_packaging.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/mastra-runtime-pattern/typescript/src/runtime_packaging.ts)

```ts
export type ToolCall = {
  name: string;
  input: Record<string, unknown>;
};

export type RuntimeTrace = {
  step: string;
  detail: Record<string, unknown>;
};

export type RuntimeState = {
  runId: string;
  goal: string;
  memory: Record<string, string>;
  traces: RuntimeTrace[];
  toolCalls: ToolCall[];
  result?: string;
};

export type Tool = {
  name: string;
  description: string;
  execute(input: Record<string, unknown>, state: RuntimeState): Promise<string>;
};

export type Agent = {
  name: string;
  instructions: string;
  decide(state: RuntimeState): Promise<ToolCall | { answer: string }>;
};

export type WorkflowStep = {
  name: string;
  run(state: RuntimeState): Promise<RuntimeState>;
};

export type PackagedRuntime = {
  agent: Agent;
  tools: Record<string, Tool>;
  workflow: WorkflowStep[];
  run(goal: string): Promise<RuntimeState>;
};

function trace(state: RuntimeState, step: string, detail: Record<string, unknown>) {
  state.traces.push({ step, detail });
}

export function createSupportRuntime(): PackagedRuntime {
  const tools: Record<string, Tool> = {
    read_policy: {
      name: "read_policy",
      description: "Read the support policy for a refund request.",
      execute: async input => `Policy ${input.policyId}: refunds under 30 days can be drafted for review.`,
    },
    draft_response: {
      name: "draft_response",
      description: "Draft a customer-safe response without sending it.",
      execute: async input => `Draft response for ${input.customerId}: refund request is ready for review.`,
    },
  };

  const agent: Agent = {
    name: "support-runtime-agent",
    instructions: "Check policy before drafting. Do not send messages directly.",
    decide: async state => {
      if (!state.memory.policy) {
        return { name: "read_policy", input: { policyId: "refund-v1" } };
      }
      if (!state.memory.draft) {
        return { name: "draft_response", input: { customerId: "cust_123" } };
      }
      return { answer: "Policy checked and draft created for human review." };
    },
  };

  const workflow: WorkflowStep[] = [
    {
      name: "agent_decision",
      run: async state => {
        const decision = await agent.decide(state);
        trace(state, "agent_decision", { decision });

        if ("answer" in decision) {
          state.result = decision.answer;
          return state;
        }

        const tool = tools[decision.name];
        if (!tool) throw new Error(`Unknown tool: ${decision.name}`);
```

_Excerpt truncated for readability. Download the bundle or open the source file for the complete implementation._

### `mastra-runtime-pattern/typescript/test/runtime_packaging.spec.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/mastra-runtime-pattern/typescript/test/runtime_packaging.spec.ts)

```ts
import { createSupportRuntime, evaluateRuntime } from "../src/runtime_packaging.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const runtime = createSupportRuntime();
const state = await runtime.run("Prepare a policy-safe refund response");
const evaluation = evaluateRuntime(state);

assert(state.result === "Policy checked and draft created for human review.", "Expected final runtime result");
assert(state.toolCalls.map(call => call.name).join(",") === "read_policy,draft_response", "Expected ordered tool calls");
assert(state.memory.policy.includes("refunds under 30 days"), "Expected policy memory");
assert(state.memory.draft.includes("ready for review"), "Expected draft memory");
assert(state.traces.some(event => event.step === "workflow_step"), "Expected workflow trace");
assert(state.traces.some(event => event.step === "agent_decision"), "Expected agent decision trace");
assert(evaluation.status === "pass", "Expected runtime evaluation to pass");

console.log("Mastra-style runtime packaging tests OK");
```

## Download

- [Download source bundle](/downloads/mastra-runtime.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/mastra-runtime-pattern)

The download bundle contains the current `mastra-runtime-pattern/` folder from this repository.

## Related Patterns

- [Durable Workflow](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
- [Observability and Evals](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/observability-and-evals-pattern/README.md)
- [Agent Loop](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-loop-pattern/README.md)
