import { evaluateDebate, incidentSummaryAgents, runDebate } from "./consensus.ts";

const run = runDebate({
  runId: "debate_incident_summary_001",
  goal: "Decide whether the incident summary is ready for executive review.",
  finalOwner: "incident-commander",
  evidence: {
    timeline: "14:02 alert, 14:05 mitigation started, 14:19 service recovered",
    customer_impact: "12 enterprise tenants saw elevated latency for 17 minutes",
    mitigation: "disabled failing cache warmup path",
    owner: "platform-oncall",
  },
  agents: incidentSummaryAgents(),
});

console.log(JSON.stringify({
  decision: run.decision,
  evaluation: evaluateDebate(run),
  transcript: run.transcript,
}, null, 2));
