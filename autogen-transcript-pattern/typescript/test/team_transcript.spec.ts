import { evaluateTranscript, runTeam } from "../src/team_transcript.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const state = runTeam("Prepare a policy-safe refund response");
const evaluation = evaluateTranscript(state);

assert(state.stopReason === "completed", "Expected completed team run");
assert(state.transcript.length === 4, "Expected four transcript messages");
assert(state.transcript[0].sender === "manager", "Manager should assign the task");
assert(state.transcript[1].sender === "researcher", "Researcher should provide evidence");
assert(state.transcript[2].sender === "reviewer", "Reviewer should evaluate evidence");
assert(state.final?.includes("human review"), "Expected final human-review constraint");
assert(evaluation.status === "pass", "Expected transcript eval to pass");

console.log("AutoGen-style transcript tests OK");
