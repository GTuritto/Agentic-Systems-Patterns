import { evaluateTranscript, runTeam } from "./team_transcript.ts";

const state = runTeam("Prepare a policy-safe refund response");
const evaluation = evaluateTranscript(state);

console.log(JSON.stringify({ state, evaluation }, null, 2));
