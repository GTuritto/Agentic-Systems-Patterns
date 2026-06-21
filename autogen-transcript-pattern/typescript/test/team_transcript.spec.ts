import { evaluateTranscript, runTeam, type TeamState } from "../src/team_transcript.ts";

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

const missingEvidence: TeamState = {
  ...state,
  transcript: state.transcript.filter(message => message.type !== "evidence"),
};
const missingEvidenceEval = evaluateTranscript(missingEvidence);
assert(missingEvidenceEval.status === "fail", "Expected missing evidence to fail");
assert(
  missingEvidenceEval.reasons.includes("missing role: researcher"),
  "Expected missing researcher reason",
);
assert(
  missingEvidenceEval.reasons.includes("missing message type: evidence"),
  "Expected missing evidence type reason",
);

const finalBeforeReview: TeamState = {
  ...state,
  transcript: [
    state.transcript[0],
    state.transcript[1],
    { ...state.transcript[3], turn: 3 },
    { ...state.transcript[2], turn: 4 },
  ],
};
const finalBeforeReviewEval = evaluateTranscript(finalBeforeReview);
assert(finalBeforeReviewEval.status === "fail", "Expected final before review to fail");
assert(
  finalBeforeReviewEval.reasons.includes("review must precede final"),
  "Expected review-before-final reason",
);

const wrongTaskId: TeamState = {
  ...state,
  transcript: [{ ...state.transcript[0], metadata: { taskId: "wrong_task" } }, ...state.transcript.slice(1)],
};
const wrongTaskIdEval = evaluateTranscript(wrongTaskId);
assert(wrongTaskIdEval.status === "fail", "Expected wrong task ID to fail");
assert(
  wrongTaskIdEval.reasons.includes("message task IDs do not match team task"),
  "Expected task ID mismatch reason",
);

console.log("AutoGen-style transcript tests OK");
