import { createSupportRuntime, evaluateRuntime } from "./runtime_packaging.ts";

const runtime = createSupportRuntime();
const state = await runtime.run("Prepare a policy-safe refund response");
const evaluation = evaluateRuntime(state);

console.log(JSON.stringify({ state, evaluation }, null, 2));
