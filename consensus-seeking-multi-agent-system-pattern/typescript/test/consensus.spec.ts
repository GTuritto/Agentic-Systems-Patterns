import {
  createRubricAgent,
  evaluateDebate,
  incidentSummaryAgents,
  runDebate,
  type DebateRun,
} from "../src/consensus.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const acceptedRun = runDebate({
  runId: "debate_accept",
  goal: "Approve incident summary",
  finalOwner: "incident-commander",
  evidence: {
    timeline: "incident timeline",
    customer_impact: "customer impact statement",
    mitigation: "mitigation record",
    owner: "follow-up owner",
  },
  agents: incidentSummaryAgents(),
});

assert(acceptedRun.decision.stopReason === "accepted", "Expected accepted decision");
assert(acceptedRun.decision.accepted, "Expected accepted flag");
assert(acceptedRun.proposals.length === 3, "Expected one proposal per agent");
assert(acceptedRun.transcript.some(event => event.type === "decision"), "Expected decision transcript event");
assert(evaluateDebate(acceptedRun).status === "pass", "Expected accepted run to pass evaluation");

const missingImpactRun = runDebate({
  runId: "debate_revision",
  goal: "Approve incident summary",
  finalOwner: "incident-commander",
  evidence: {
    timeline: "incident timeline",
    mitigation: "mitigation record",
    owner: "follow-up owner",
  },
  agents: incidentSummaryAgents(),
});

assert(missingImpactRun.decision.stopReason === "needs_revision", "Expected revision decision");
assert(missingImpactRun.decision.dissent.some(item => item.includes("customer_impact")), "Expected impact dissent");
assert(evaluateDebate(missingImpactRun).status === "pass", "Expected preserved dissent to pass evaluation");

const correlatedAgent = createRubricAgent({
  id: "same_1",
  role: "same reviewer",
  evidenceScope: "same scope",
  requiredEvidence: ["timeline"],
  acceptedAnswer: "same answer",
});
const correlatedRun = runDebate({
  runId: "debate_correlated",
  goal: "Approve incident summary",
  finalOwner: "incident-commander",
  evidence: { timeline: "incident timeline" },
  agents: [
    correlatedAgent,
    { ...correlatedAgent, id: "same_2" },
  ],
});
const correlatedEval = evaluateDebate(correlatedRun);
assert(correlatedEval.status === "fail", "Expected correlated agents to fail");
assert(correlatedEval.reasons.includes("agents are not independent"), "Expected independence reason");

const missingOwner: DebateRun = {
  ...acceptedRun,
  finalOwner: "",
  decision: {
    ...acceptedRun.decision,
    finalOwner: "",
  },
};
const missingOwnerEval = evaluateDebate(missingOwner);
assert(missingOwnerEval.status === "fail", "Expected missing final owner to fail");
assert(missingOwnerEval.reasons.includes("missing final owner"), "Expected final-owner reason");

console.log("Debate and consensus tests OK");
