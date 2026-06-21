---
title: Tool Use
---

# Tool Use

Tool use gives an agent controlled access to external capability such as calculators, search, databases, files, code execution, APIs, or business systems.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/tool-using-agent-pattern)
> - [Download code bundle](/downloads/tool-use.zip)

## Intent

Tool use lets an agent cross the boundary between language and action. The model can propose a calculation, lookup, retrieval, file operation, API call, workflow step, or business action, but software still owns the real execution boundary.

The important idea is simple: the model does not "use the tool" directly. The model proposes a tool call. The runtime validates the call, checks policy, executes the tool, records the result, and decides whether the observation can influence the next step.

This pattern owns the proposal-to-execution boundary. It does not own business authorization, human approval policy, durable orchestration, or the internal implementation of each capability. Keep those responsibilities in policy, approval, workflow, and service layers.

## Use When

- The task needs facts, computation, retrieval, or system access outside the model context.
- The tool can be expressed as a narrow capability with typed inputs and structured outputs.
- Software can validate arguments before execution.
- Permissions and policy checks can sit between model intent and tool execution.
- The result can be traced, replayed, mocked, or audited.

## Avoid When

- A deterministic function or workflow can do the job without model selection.
- The proposed tool is a broad primitive such as `run_sql`, `send_http_request`, or `execute_shell`.
- The tool can create high-risk side effects without approval.
- Tool results contain untrusted content but the system cannot separate data from instructions.
- The team cannot explain which tool calls are allowed, forbidden, retried, or escalated.

## Architecture

Use this diagram to read Tool Use as a system boundary, not only a code shape. The key ownership question is: the caller or a small application service owns task state until a runtime pattern is introduced.

![Tool use policy boundary](../public/diagrams/tool-use-policy-boundary.svg)

## System Shape

- **Pattern boundary:** an agent runtime receives a task, exposes only the tools needed for that task, validates model-proposed calls, and returns a typed result.
- **State owner:** the caller, workflow engine, or agent runtime owns task state. The model should not be the durable state store.
- **Tool owner:** each tool has an owning service or team responsible for schema, permissions, side effects, errors, and trace fields.
- **Policy boundary:** tool execution happens only after schema validation, authorization, budget checks, and approval rules.
- **Operational promise:** tool use expands agent capability without handing the model unrestricted authority.

## Core Protocol

1. Receive a bounded task with caller identity, goal, state reference, and budget.
2. Select the smallest useful tool set for the current task or phase.
3. Ask the model for the next action or final answer.
4. Validate any proposed tool call against schema, permissions, budget, and policy.
5. Execute the tool with timeout, idempotency key, and trace correlation.
6. Return the tool result as observation data, not as new instructions.
7. Stop, retry, escalate, or continue according to explicit runtime rules.

## Implementation Notes

Treat the tool registry as an authority surface. A small registry is better than a large list of vague capabilities.

```ts
type ToolName = 'read_order' | 'search_refund_policy' | 'draft_refund_request';

type ToolRequest = {
  runId: string;
  callerId: string;
  tool: ToolName;
  args: Record<string, unknown>;
  idempotencyKey: string;
};

const allowedToolsByRoute: Record<string, ToolName[]> = {
  refund_investigation: ['read_order', 'search_refund_policy', 'draft_refund_request']
};

function authorizeToolCall(route: string, request: ToolRequest) {
  const allowed = allowedToolsByRoute[route] ?? [];

  if (!allowed.includes(request.tool)) {
    return { status: 'denied', reason: 'tool_not_allowed' };
  }

  if (!request.idempotencyKey) {
    return { status: 'denied', reason: 'missing_idempotency_key' };
  }

  return { status: 'allowed' };
}
```

The model can choose among `read_order`, `search_refund_policy`, and `draft_refund_request`, but it cannot invent `issue_refund` unless the runtime exposes that tool and policy allows it.

Use structured tool results:

```ts
type ToolResult =
  | { status: 'ok'; data: unknown; evidenceRef: string }
  | { status: 'refused'; reason: string }
  | { status: 'retryable_error'; reason: string; retryAfterMs?: number }
  | { status: 'fatal_error'; reason: string };
```

Do not return plain strings for important tools. Plain strings force the model to infer whether the call succeeded, whether retry is safe, and whether the content is trusted.

## Failure Modes

- The model is allowed to call a broad tool that can perform many hidden actions.
- Tool descriptions become the only permission boundary.
- Tool arguments are not validated before execution.
- A retry duplicates a side effect because there is no idempotency key.
- Tool results containing emails, web pages, tickets, or documents are treated as instructions.
- The final answer looks correct, but the tool trajectory used a forbidden or unsafe path.
- Tool errors are vague, so the agent retries blindly or invents missing evidence.
- Traces record the final response but not the proposed call, policy decision, tool result, and stop reason.

## Evaluation Strategy

Tool-use evals should test both capability and restraint.

- Use positive cases where the agent must choose the right tool with valid arguments.
- Use negative cases where the correct behavior is to call no tool, ask for missing input, refuse, or escalate.
- Include forbidden-tool cases such as direct refund issuance, external messaging, shell execution, or private-data export.
- Mock tools so evals can inspect the trajectory without touching real systems.
- Test malformed tool results, timeouts, retryable errors, fatal errors, and untrusted instructions inside tool output.
- Measure tool-selection accuracy, invalid-argument rate, unauthorized-call rate, approval-routing accuracy, unsafe-chain prevention, cost, latency, and stop reason quality.

A minimal mocked-tool eval can look like this:

```json
{
  "case_id": "refund_missing_policy",
  "input": "Customer asks for a refund, but no refund policy is available.",
  "expected": {
    "tools_called": ["read_order", "search_refund_policy"],
    "tools_not_called": ["draft_refund_request", "issue_refund"],
    "final_status": "needs_human"
  }
}
```

The eval is not only checking the final answer. It is checking the path.

## Production Checklist

- Keep every tool narrow and named by business capability.
- Use typed input and output schemas.
- Declare capability class, side effects, permissions, approval rules, and trace fields.
- Validate arguments before execution.
- Enforce permissions outside the prompt.
- Add timeouts, retry limits, idempotency keys, and cancellation behavior.
- Treat untrusted tool output as data, not instructions.
- Log proposed tool call, policy decision, execution result, latency, cost, and stop reason.
- Mock tools in evals before connecting to production systems.
- Keep a circuit breaker for risky tools, model routes, or agent capabilities.

The architectural rule is simple: expose the smallest capability that completes the task, then validate every proposed use before execution. Continue with [Tool Capability Design](/tools-skills-protocols/tool-capability-design) for interface design and [Human Approval Gates](/tools-skills-protocols/human-approval-gates) for high-risk actions.

## Run the Example

```sh
npm run tool-using-agent
npm run tool-runtime:test
```

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

These excerpts show the implementation shape. The complete code is available in the download bundle and repository source.

### `tool-using-agent-pattern/typescript/src/tool_runtime.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/tool-using-agent-pattern/typescript/src/tool_runtime.ts)

```ts
export type Route = "refund_investigation" | "order_status";
export type ToolName =
  | "read_order"
  | "search_refund_policy"
  | "draft_refund_request";

export type ToolProposal = {
  name: string;
  args: unknown;
  idempotencyKey: string;
};

export type ToolObservation =
  | {
      status: "ok";
      tool: ToolName;
      data: unknown;
      trust: "trusted_system" | "untrusted_content";
      evidenceRef: string;
    }
  | {
      status: "refused" | "retryable_error" | "fatal_error";
      tool?: string;
      reason: string;
    };

export type ToolContext = {
  route: Route;
  actorId: string;
  approvedActionIds: string[];
  timeoutMs: number;
  maxAttempts: number;
};

type ValidatedCall =
  | {
      name: "read_order";
      args: { orderId: string };
      idempotencyKey: string;
    }
  | {
      name: "search_refund_policy";
      args: { query: string };
      idempotencyKey: string;
    }
  | {
      name: "draft_refund_request";
      args: { orderId: string; amountCents: number; approvalId: string };
      idempotencyKey: string;
    };

export type ToolHandlers = {
  readOrder(args: { orderId: string }): Promise<unknown>;
  searchRefundPolicy(args: { query: string }): Promise<unknown>;
  draftRefundRequest(args: {
    orderId: string;
    amountCents: number;
    approvalId: string;
  }): Promise<unknown>;
};

const toolsByRoute: Record<Route, ToolName[]> = {
  refund_investigation: [
    "read_order",
    "search_refund_policy",
    "draft_refund_request",
  ],
  order_status: ["read_order"],
};

export function disclosedTools(route: Route): ToolName[] {
  return [...toolsByRoute[route]];
}

function objectArgs(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function validateProposal(
  proposal: ToolProposal,
  context: ToolContext,
): ValidatedCall | ToolObservation {
  if (!toolsByRoute[context.route].includes(proposal.name as ToolName)) {
    return {
      status: "refused",
      tool: proposal.name,
      reason: "tool_not_disclosed_for_route",
    };
```

_Excerpt truncated for readability. Download the bundle or open the source file for the complete implementation._

### `tool-using-agent-pattern/typescript/test/tool_runtime.spec.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/tool-using-agent-pattern/typescript/test/tool_runtime.spec.ts)

```ts
import {
  disclosedTools,
  ToolRuntime,
  type ToolContext,
  type ToolHandlers,
} from "../src/tool_runtime.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const baseContext: ToolContext = {
  route: "refund_investigation",
  actorId: "support-agent",
  approvedActionIds: [],
  timeoutMs: 20,
  maxAttempts: 2,
};

function handlers(overrides: Partial<ToolHandlers> = {}): ToolHandlers {
  return {
    readOrder: async ({ orderId }) => ({ orderId, status: "delivered" }),
    searchRefundPolicy: async ({ query }) => ({ text: query }),
    draftRefundRequest: async args => args,
    ...overrides,
  };
}

assert(
  disclosedTools("order_status").join(",") === "read_order",
  "Route must disclose only required tools",
);

const runtime = new ToolRuntime(handlers());
const valid = await runtime.execute(
  {
    name: "read_order",
    args: { orderId: "ORD-104" },
    idempotencyKey: "read:104",
  },
  baseContext,
);
assert(valid.status === "ok", "Valid read must execute");

const forbidden = await runtime.execute(
  {
    name: "issue_refund",
    args: { orderId: "ORD-104" },
    idempotencyKey: "refund:104",
  },
  baseContext,
);
assert(
  forbidden.status === "refused" &&
    forbidden.reason === "tool_not_disclosed_for_route",
  "Undisclosed tool must be refused",
);

const invalid = await runtime.execute(
  {
    name: "read_order",
    args: { orderId: 104 },
    idempotencyKey: "read:invalid",
  },
  baseContext,
);
assert(
  invalid.status === "refused" && invalid.reason === "invalid_arguments",
  "Invalid arguments must be refused",
);

const missingApproval = await runtime.execute(
  {
    name: "draft_refund_request",
    args: {
      orderId: "ORD-104",
      amountCents: 12500,
      approvalId: "APR-104",
    },
    idempotencyKey: "draft:104",
  },
  baseContext,
);
assert(
  missingApproval.status === "refused" &&
    missingApproval.reason === "approval_required",
  "Write-like tool must require approval",
);

let draftedRefunds = 0;
```

_Excerpt truncated for readability. Download the bundle or open the source file for the complete implementation._

## Download

- [Download source bundle](/downloads/tool-use.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/tool-using-agent-pattern)

The download bundle contains the current `tool-using-agent-pattern/` folder from this repository.

## Related Patterns

- [Single Agent](/foundations/single-agent)
- [Agent Loop](/foundations/agent-loop)
- [Structured Output](/foundations/structured-output)
- [MCP-first Tool Use](/tools-skills-protocols/mcp-first-tool-use)
- [Tool Capability Design](/tools-skills-protocols/tool-capability-design)
- [Human Approval Gates](/tools-skills-protocols/human-approval-gates)
- [Pattern Evaluation Checklist](/pattern-selection/pattern-evaluation-checklist)
- [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
