import {
  runAgentLoop,
  type LoopDependencies,
  type LoopState,
  type Proposal,
} from "../src/agent_loop.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function scriptedDependencies(
  proposals: Proposal[],
  toolStatus: "ok" | "error" = "ok",
): LoopDependencies {
  return {
    propose: async (_state: LoopState) =>
      proposals.shift() ?? { kind: "escalate", reason: "script_exhausted" },
    execute: async (proposal, idempotencyKey) => ({
      tool: proposal.name,
      status: toolStatus,
      output: { idempotencyKey },
    }),
  };
}

const completed = await runAgentLoop(
  "Read an order",
  3,
  scriptedDependencies([
    { kind: "tool", name: "lookup_order", input: { orderId: "A-104" } },
    { kind: "answer", text: "The order shipped." },
  ]),
);
assert(completed.stopReason === "completed", "Expected completed run");
assert(completed.state.observations.length === 1, "Expected one observation");
assert(
  completed.trace.includes("step:0:validation:execute"),
  "Expected validation trace",
);

const denied = await runAgentLoop(
  "Delete an order",
  3,
  scriptedDependencies([
    { kind: "tool", name: "delete_order", input: { orderId: "A-104" } },
  ]),
);
assert(denied.stopReason === "refused", "Expected forbidden tool refusal");
assert(denied.state.observations.length === 0, "Denied tool must not execute");

const failed = await runAgentLoop(
  "Read an order",
  3,
  scriptedDependencies(
    [{ kind: "tool", name: "lookup_order", input: { orderId: "A-104" } }],
    "error",
  ),
);
assert(failed.stopReason === "tool_failure", "Expected tool failure stop");

const exhausted = await runAgentLoop(
  "Keep checking",
  1,
  scriptedDependencies([
    { kind: "tool", name: "lookup_order", input: { orderId: "A-104" } },
    { kind: "answer", text: "This proposal must not run." },
  ]),
);
assert(exhausted.stopReason === "max_steps", "Expected max_steps stop");

console.log("Agent loop tests OK");
