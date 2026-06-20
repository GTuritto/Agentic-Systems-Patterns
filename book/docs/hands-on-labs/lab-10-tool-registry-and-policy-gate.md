---
title: Lab 10 - Build a Tool Registry and Policy Gate
---

# Lab 10 - Build a Tool Registry and Policy Gate

## Objective

Extend the mini-runtime with a tool registry and policy gate. The model can propose a tool call, but software decides whether the tool exists, whether the input is acceptable, and whether policy allows execution.

## What You Will Use

- Language: TypeScript or Python
- Framework/runtime: from-scratch educational runtime
- Framework-agnostic lesson: tool descriptions are not permissions; registry and policy are separate runtime boundaries.
- Pattern chapters: [Tool Use](/foundations/tool-use), [Tool Capability Design](/tools-skills-protocols/tool-capability-design), [Policy Enforcement](/production-runtime/policy-enforcement)
- Previous lab: [Lab 09 - Minimal Agent Loop](./lab-09-minimal-agent-loop.md)

## Setup

Start from the Lab 09 loop. Add a registry object or map keyed by tool name.

Use deterministic tools. Do not call external systems in this lab.

## Runtime Contract

```ts
type ToolResult =
  | { status: "ok"; data: unknown }
  | { status: "refused"; reason: string }
  | { status: "error"; reason: string };

type ToolDefinition = {
  name: string;
  description: string;
  sideEffect: "read" | "draft" | "write";
  execute(input: unknown): Promise<ToolResult>;
};

type PolicyDecision =
  | { status: "allow" }
  | { status: "deny"; reason: string }
  | { status: "approval_required"; reason: string };
```

## Guided Change

Add two tools:

```ts
const tools: Record<string, ToolDefinition> = {
  lookup_policy: {
    name: "lookup_policy",
    description: "Read policy guidance for the current task.",
    sideEffect: "read",
    execute: async input => ({ status: "ok", data: { input, policy: "approval required for writes" } }),
  },
  draft_message: {
    name: "draft_message",
    description: "Create a draft message for review.",
    sideEffect: "draft",
    execute: async input => ({ status: "ok", data: { draft: String(input) } }),
  },
};
```

Then add policy:

```ts
function authorize(tool: ToolDefinition): PolicyDecision {
  if (tool.sideEffect === "write") {
    return { status: "approval_required", reason: "write_tool_requires_approval" };
  }
  return { status: "allow" };
}
```

Update the loop so tool decisions pass through:

1. registry lookup;
2. policy decision;
3. tool execution only when allowed;
4. observation recording for refused, denied, approval-required, and successful outcomes.

## Baseline Run

Use a decision function that calls `lookup_policy`.

Expected result:

```text
tool result: ok
stopReason: success or budget_exhausted depending on your decide function
observation includes lookup_policy
```

## Failure Cases

Test these cases:

1. Unknown tool name.
2. Tool with `write` side effect.
3. Tool execution returns `error`.

Expected outcomes:

```text
unknown tool -> refused
write tool -> approval_required
tool error -> tool_failure or recorded error observation
```

The exact stop behavior can vary, but the runtime must not silently execute forbidden or unknown tools.

## Verify

Check these assertions:

- unknown tools are not executed;
- policy runs before execution;
- approval-required is represented as a runtime state;
- tool results are structured;
- observations record both allowed and refused paths.

## Production Extension

Before using this pattern with real tools, add:

- input schema validation;
- idempotency keys;
- timeout and retry policy;
- actor, tenant, route, and approval context;
- trace IDs for proposed call, policy decision, execution, and result;
- separate policies for read, draft, write, external communication, money movement, memory write, and code execution.

## Cross-Framework Mapping

- In LangGraph, this can be implemented as a tool node guarded by a policy node.
- In Mastra AI, this maps to tool definitions plus workflow or tool-level policy.
- In AutoGen-style systems, this maps to function execution guarded by the manager or runtime.
- In CrewAI, this maps to role-assigned tools plus flow-level constraints.

## Related Chapters

- [Tool Use](/foundations/tool-use)
- [Tool Capability Design](/tools-skills-protocols/tool-capability-design)
- [Human Approval Gates](/tools-skills-protocols/human-approval-gates)
- [Policy Enforcement](/production-runtime/policy-enforcement)
