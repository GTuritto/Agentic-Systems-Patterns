import {
  defaultAuthorize,
  demoTools,
  evaluateTrajectory,
  runAgent,
  type Decision,
} from "./runtime.ts";

const decisions: Decision[] = [
  { kind: "tool", name: "lookup_policy", input: { task: "draft a reply" } },
  { kind: "answer", text: "Policy was checked and the draft can be prepared safely." },
];

const result = await runAgent({
  runId: "demo_001",
  goal: "Check policy before drafting a customer reply",
  maxSteps: 4,
  tools: demoTools,
  memory: [
    { id: "mem_1", scope: "project", text: "Write tools require approval." },
    { id: "mem_2", scope: "task", text: "Read tools are allowed for this lab." },
    { id: "mem_3", scope: "user", text: "Do not include unrelated user memory." },
  ],
  decide: async () => decisions.shift() ?? { kind: "stop", reason: "blocked" },
  authorize: defaultAuthorize,
});

const evaluation = evaluateTrajectory(result, {
  caseId: "demo-policy-read",
  input: "Check policy before drafting a customer reply",
  expected: {
    toolsCalled: ["lookup_policy"],
    toolsNotCalled: ["send_message"],
    stopReason: "success",
  },
});

console.log(JSON.stringify({ result, evaluation }, null, 2));
