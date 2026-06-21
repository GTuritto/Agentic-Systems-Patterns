import {
  defaultAuthorize,
  demoTools,
  evaluateTrajectory,
  runAgent,
  type Decision,
  type PolicyDecision,
  type ToolDefinition,
} from "../src/runtime.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function scripted(decisions: Decision[]) {
  return async () => decisions.shift() ?? { kind: "stop", reason: "blocked" as const };
}

const immediate = await runAgent({
  goal: "Answer immediately",
  maxSteps: 3,
  tools: demoTools,
  decide: scripted([{ kind: "answer", text: "done" }]),
  authorize: defaultAuthorize,
});
assert(immediate.state.stopReason === "success", "Immediate answer should succeed");
assert(immediate.state.steps === 1, "Immediate answer should use one step");
assert(immediate.trace.some(event => event.type === "context_built"), "Trace should include context");

const exhausted = await runAgent({
  goal: "Never stop",
  maxSteps: 2,
  tools: demoTools,
  decide: scripted([
    { kind: "tool", name: "lookup_policy", input: { query: "again" } },
    { kind: "tool", name: "lookup_policy", input: { query: "again" } },
    { kind: "answer", text: "too late" },
  ]),
  authorize: defaultAuthorize,
});
assert(exhausted.state.stopReason === "budget_exhausted", "Repeated tool calls should hit the budget");
assert(exhausted.state.toolsCalled.length === 2, "Allowed read tool should execute until budget");

const unknown = await runAgent({
  goal: "Call unknown tool",
  maxSteps: 3,
  tools: demoTools,
  decide: scripted([{ kind: "tool", name: "delete_customer", input: { id: "c_1" } }]),
  authorize: defaultAuthorize,
});
assert(unknown.state.stopReason === "refused", "Unknown tools should be refused");
assert(!unknown.state.toolsCalled.includes("delete_customer"), "Unknown tool must not execute");

const approvalRequired = await runAgent({
  goal: "Send a message",
  maxSteps: 3,
  tools: demoTools,
  decide: scripted([{ kind: "tool", name: "send_message", input: { body: "hello" } }]),
  authorize: defaultAuthorize,
});
assert(approvalRequired.state.stopReason === "blocked", "Write tools should require approval");
assert(!approvalRequired.state.toolsCalled.includes("send_message"), "Approval-required tool must not execute");

const errorTools = {
  ...demoTools,
  flaky_lookup: {
    name: "flaky_lookup",
    description: "A read tool that fails deterministically.",
    sideEffect: "read" as const,
    execute: async () => ({ status: "error" as const, reason: "upstream_timeout" }),
  },
};
const toolError = await runAgent({
  goal: "Handle tool failure",
  maxSteps: 3,
  tools: errorTools,
  decide: scripted([{ kind: "tool", name: "flaky_lookup", input: { query: "policy" } }]),
  authorize: defaultAuthorize,
});
assert(toolError.state.stopReason === "tool_failure", "Tool error should stop as tool_failure");
assert(toolError.state.toolsCalled.includes("flaky_lookup"), "Failing tool call should be recorded");
assert(
  toolError.trace.some(event => event.type === "stop" && JSON.stringify(event.data).includes("upstream_timeout")),
  "Trace should include tool failure reason",
);

const readThenAnswer = await runAgent({
  goal: "Read policy then answer",
  maxSteps: 4,
  tools: demoTools,
  memory: [
    { id: "mem_1", scope: "project", text: "Write tools require approval." },
    { id: "mem_2", scope: "task", text: "Read tools are allowed." },
    { id: "mem_3", scope: "user", text: "Out-of-scope preference." },
  ],
  decide: scripted([
    { kind: "tool", name: "lookup_policy", input: { task: "draft" } },
    { kind: "answer", text: "policy checked" },
  ]),
  authorize: defaultAuthorize,
});
assert(readThenAnswer.state.stopReason === "success", "Read then answer should succeed");
assert(readThenAnswer.state.toolsCalled.includes("lookup_policy"), "Expected lookup_policy call");
assert(readThenAnswer.trace.some(event => event.type === "policy_decision"), "Trace should include policy");
assert(readThenAnswer.trace.some(event => event.type === "tool_result"), "Trace should include tool result");
const firstContext = readThenAnswer.trace.find(event => event.type === "context_built");
assert(firstContext, "Trace should include context packet");
assert(JSON.stringify(firstContext.data).includes('"memoryRefs":["mem_1","mem_2"]'), "Context should include scoped memory refs");
assert(JSON.stringify(firstContext.data).includes('"ref":"mem_3","reason":"out_of_scope"'), "Context should record omitted memory");

const permissiveAuthorize = (_tool: ToolDefinition): PolicyDecision => ({ status: "allow" });
const unsafe = await runAgent({
  goal: "Unsafe final answer",
  maxSteps: 3,
  tools: demoTools,
  decide: scripted([
    { kind: "tool", name: "send_message", input: { body: "sent without approval" } },
    { kind: "answer", text: "done" },
  ]),
  authorize: permissiveAuthorize,
});
const unsafeEval = evaluateTrajectory(unsafe, {
  caseId: "forbidden-write",
  input: "Unsafe final answer",
  expected: {
    stopReason: "success",
    toolsNotCalled: ["send_message"],
  },
});
assert(unsafe.state.stopReason === "success", "Unsafe run should look successful by final answer");
assert(unsafeEval.status === "fail", "Trajectory eval should catch forbidden write tool");
assert(
  unsafeEval.reasons.includes("forbidden tool was called: send_message"),
  "Trajectory eval should explain forbidden write tool",
);

console.log("Minimal agent runtime tests OK");
