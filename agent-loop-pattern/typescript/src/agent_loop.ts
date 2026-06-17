export type StopReason =
  | "completed"
  | "refused"
  | "needs_human"
  | "max_steps"
  | "tool_failure";

export type ToolProposal = {
  kind: "tool";
  name: "lookup_order";
  input: { orderId: string };
};

export type Proposal =
  | { kind: "answer"; text: string }
  | ToolProposal
  | { kind: "tool"; name: string; input: unknown }
  | { kind: "escalate"; reason: string };

export type Observation = {
  tool: string;
  status: "ok" | "error";
  output: unknown;
};

export type LoopState = {
  goal: string;
  step: number;
  observations: Observation[];
};

export type LoopResult = {
  stopReason: StopReason;
  answer?: string;
  state: LoopState;
  trace: string[];
};

export type LoopDependencies = {
  propose(state: LoopState): Promise<Proposal>;
  execute(
    proposal: ToolProposal,
    idempotencyKey: string,
  ): Promise<Observation>;
};

type ValidatedDecision =
  | { status: "final"; answer: string }
  | { status: "execute"; proposal: ToolProposal }
  | { status: "escalate"; reason: string }
  | { status: "deny"; reason: string };

export function validateProposal(proposal: Proposal): ValidatedDecision {
  if (proposal.kind === "answer") {
    return proposal.text.trim()
      ? { status: "final", answer: proposal.text }
      : { status: "deny", reason: "empty_answer" };
  }

  if (proposal.kind === "escalate") {
    return { status: "escalate", reason: proposal.reason };
  }

  if (proposal.name !== "lookup_order") {
    return { status: "deny", reason: "tool_not_allowed" };
  }

  const input = proposal.input as { orderId?: unknown };
  if (typeof input.orderId !== "string" || !input.orderId.trim()) {
    return { status: "deny", reason: "invalid_tool_input" };
  }

  return {
    status: "execute",
    proposal: {
      kind: "tool",
      name: "lookup_order",
      input: { orderId: input.orderId },
    },
  };
}

export async function runAgentLoop(
  goal: string,
  maxSteps: number,
  dependencies: LoopDependencies,
): Promise<LoopResult> {
  const state: LoopState = { goal, step: 0, observations: [] };
  const trace: string[] = [];

  while (state.step < maxSteps) {
    trace.push(`step:${state.step}:observe`);
    const proposal = await dependencies.propose(state);
    trace.push(`step:${state.step}:proposal:${proposal.kind}`);

    const decision = validateProposal(proposal);
    trace.push(`step:${state.step}:validation:${decision.status}`);

    if (decision.status === "deny") {
      return { stopReason: "refused", state, trace };
    }

    if (decision.status === "escalate") {
      return { stopReason: "needs_human", state, trace };
    }

    if (decision.status === "final") {
      return {
        stopReason: "completed",
        answer: decision.answer,
        state,
        trace,
      };
    }

    const observation = await dependencies.execute(
      decision.proposal,
      `step:${state.step}`,
    );
    state.observations.push(observation);
    trace.push(`step:${state.step}:tool:${observation.status}`);
    state.step += 1;

    if (observation.status === "error") {
      return { stopReason: "tool_failure", state, trace };
    }
  }

  return { stopReason: "max_steps", state, trace };
}
