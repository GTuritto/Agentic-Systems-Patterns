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

Use this diagram to read Mastra Runtime as a system boundary, not only a code shape. The key ownership question is: the runtime owns durable state, retries, traces, triggers, deployment configuration, and operational controls.

![Mastra runtime architecture](../public/diagrams/mastra-runtime.svg)

## System Shape

- **Application boundary:** the product service owns user identity, tenant scope, request validation, and response delivery.
- **Runtime boundary:** Mastra hosts the agent, workflow, tools, memory, evals, and observability concerns.
- **Workflow boundary:** deterministic state transitions, retries, approval waits, and rollback points belong in workflows, not prompts.
- **Tool boundary:** tools expose typed inputs, typed outputs, side-effect labels, permission requirements, and trace fields.
- **Policy boundary:** product policy runs before tools, memory writes, outbound messages, or external side effects.
- **Portability boundary:** prompts, tool manifests, eval fixtures, trace schema, and policy rules remain readable outside Mastra-specific code.

## Core Protocol

1. Accept a request with actor, tenant, goal, release version, and idempotency key.
2. Load runtime configuration, memory policy, tool registry, and workflow state.
3. Route deterministic steps through the workflow and open-ended decisions through the agent.
4. Check policy before retrieval, memory writes, tool calls, and final answers that require approved evidence.
5. Execute tools through typed wrappers that record status, latency, cost, retry count, and side-effect IDs.
6. Emit trace events for workflow steps, model calls, tool calls, policy decisions, memory access, and eval results.
7. Run post-run evals or CI evals against the trace before promoting the change.
8. Roll back by disabling the risky tool, prompt, model, workflow, or whole agent route.

## Implementation Notes

- Use agents for open-ended decisions where the next step is not known upfront.
- Use workflows for predetermined control flow, state transitions, retries, and production orchestration.
- Keep tools typed and independently testable.
- Capture traces and evals from the beginning rather than adding them after failures.
- Keep provider credentials in environment variables and document them in `.env.example`.
- Keep framework-generated defaults out of product policy. Product policy should be visible in code, tests, ADRs, and eval fixtures.
- Version prompts, tools, policies, memory contracts, eval datasets, and workflow definitions together.
- Treat framework upgrades like runtime changes: run regression evals and inspect traces before promotion.

## Failure Modes

- Treating the framework as the architecture instead of modeling goals, state, and failure modes.
- Putting deterministic workflow logic inside prompts.
- Creating tools with vague descriptions and unvalidated inputs.
- Shipping without eval datasets or trace review.
- Letting memory writes bypass retention, deletion, correction, or consent rules.
- Exporting traces without redaction or without enough fields to replay a failure.
- Hiding rollback inside code deploys instead of feature flags, tool disablement, or policy tightening.

## Evaluation Strategy

- Test the agent path, workflow path, policy denial path, approval path, and tool failure path separately.
- Assert that the trace contains workflow, model, tool, policy, memory, and evaluator events for representative runs.
- Compare prompt, model, tool, and framework changes against the same fixture set before release.
- Include a negative case where the runtime must draft or escalate instead of executing a side effect.

## Production Checklist

- Document install, local run, test, eval, and cleanup commands.
- Commit `.env.example` and keep secret values out of source.
- Define workflow state, memory retention, tool side effects, and policy enforcement points.
- Export redacted traces to the team's observability system.
- Add CI eval gates for prompt, model, tool, policy, memory, and workflow changes.
- Define rollback for model, prompt, tool, workflow, policy, and full agent disablement.

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
