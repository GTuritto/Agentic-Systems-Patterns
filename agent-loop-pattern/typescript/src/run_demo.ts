import { runAgentLoop, type LoopState, type Proposal } from "./agent_loop.ts";

function scriptedProposer(proposals: Proposal[]) {
  return async (_state: LoopState) =>
    proposals.shift() ?? { kind: "escalate", reason: "script_exhausted" };
}

const result = await runAgentLoop("Find the status of order A-104", 3, {
  propose: scriptedProposer([
    { kind: "tool", name: "lookup_order", input: { orderId: "A-104" } },
    { kind: "answer", text: "Order A-104 has shipped." },
  ]),
  execute: async (proposal, idempotencyKey) => ({
    tool: proposal.name,
    status: "ok",
    output: {
      orderId: proposal.input.orderId,
      shippingStatus: "shipped",
      idempotencyKey,
    },
  }),
});

console.log(JSON.stringify(result, null, 2));
