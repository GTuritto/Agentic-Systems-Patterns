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

const unsafeEvaluation = evaluateRuntime({
  ...state,
  toolCalls: [...state.toolCalls, { name: "refunds.issue_refund", input: { amount: 42 } }],
});

assert(unsafeEvaluation.status === "fail", "Expected forbidden refund tool to fail evaluation");
assert(
  unsafeEvaluation.reasons.includes("forbidden tool was called: refunds.issue_refund"),
  "Expected forbidden tool reason"
);

console.log("Mastra-style runtime packaging tests OK");
