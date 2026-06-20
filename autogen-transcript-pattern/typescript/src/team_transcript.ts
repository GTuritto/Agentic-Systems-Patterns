export type Role = "manager" | "researcher" | "reviewer";

export type TeamMessage = {
  turn: number;
  sender: Role;
  recipient: Role | "team";
  type: "task" | "evidence" | "review" | "final";
  content: string;
  metadata: {
    taskId: string;
    accepted?: boolean;
    reason?: string;
  };
};

export type TeamState = {
  taskId: string;
  goal: string;
  transcript: TeamMessage[];
  final?: string;
  stopReason?: "completed" | "rejected" | "max_turns";
};

export type Agent = {
  name: Role;
  respond(state: TeamState): TeamMessage;
};

function append(state: TeamState, message: TeamMessage) {
  state.transcript.push(message);
}

function nextTurn(state: TeamState) {
  return state.transcript.length + 1;
}

export function createTeam() {
  const manager: Agent = {
    name: "manager",
    respond: state => ({
      turn: nextTurn(state),
      sender: "manager",
      recipient: "researcher",
      type: "task",
      content: `Find policy evidence for: ${state.goal}`,
      metadata: { taskId: state.taskId },
    }),
  };

  const researcher: Agent = {
    name: "researcher",
    respond: state => ({
      turn: nextTurn(state),
      sender: "researcher",
      recipient: "reviewer",
      type: "evidence",
      content: "Evidence: refunds under 30 days can be drafted for review.",
      metadata: { taskId: state.taskId },
    }),
  };

  const reviewer: Agent = {
    name: "reviewer",
    respond: state => {
      const hasEvidence = state.transcript.some(
        message => message.type === "evidence" && message.content.includes("30 days"),
      );
      return {
        turn: nextTurn(state),
        sender: "reviewer",
        recipient: "manager",
        type: "review",
        content: hasEvidence ? "Accepted: evidence supports a draft-only response." : "Rejected: missing evidence.",
        metadata: {
          taskId: state.taskId,
          accepted: hasEvidence,
          reason: hasEvidence ? "evidence_supports_response" : "missing_evidence",
        },
      };
    },
  };

  return { manager, researcher, reviewer };
}

export function runTeam(goal: string): TeamState {
  const state: TeamState = {
    taskId: "autogen_style_001",
    goal,
    transcript: [],
  };
  const team = createTeam();

  append(state, team.manager.respond(state));
  append(state, team.researcher.respond(state));
  append(state, team.reviewer.respond(state));

  const review = state.transcript.at(-1);
  if (review?.metadata.accepted) {
    const final: TeamMessage = {
      turn: nextTurn(state),
      sender: "manager",
      recipient: "team",
      type: "final",
      content: "Final: draft a refund response for human review; do not send directly.",
      metadata: { taskId: state.taskId, accepted: true },
    };
    append(state, final);
    state.final = final.content;
    state.stopReason = "completed";
  } else {
    state.stopReason = "rejected";
  }

  return state;
}

export function evaluateTranscript(state: TeamState) {
  const reasons: string[] = [];
  const senders = new Set(state.transcript.map(message => message.sender));
  const types = new Set(state.transcript.map(message => message.type));

  for (const role of ["manager", "researcher", "reviewer"] as Role[]) {
    if (!senders.has(role)) reasons.push(`missing role: ${role}`);
  }
  for (const type of ["task", "evidence", "review", "final"]) {
    if (!types.has(type as TeamMessage["type"])) reasons.push(`missing message type: ${type}`);
  }
  if (state.stopReason !== "completed") reasons.push(`unexpected stop reason: ${state.stopReason}`);
  if (!state.transcript.every((message, index) => message.turn === index + 1)) {
    reasons.push("turn numbers are not sequential");
  }
  if (
    state.transcript.some(
      message =>
        message.type === "final" &&
        message.content.includes("send directly") &&
        !message.content.includes("do not send directly"),
    )
  ) {
    reasons.push("final response allowed direct send");
  }

  return reasons.length === 0
    ? { status: "pass" as const }
    : { status: "fail" as const, reasons };
}
