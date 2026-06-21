export type Vote = "accept" | "revise" | "escalate";

export type StopReason = "accepted" | "needs_revision" | "escalated" | "blocked";

export type DebateEvidence = Record<string, string | undefined>;

export type DebateInput = {
  runId: string;
  goal: string;
  evidence: DebateEvidence;
  finalOwner: string;
  agents: DebateAgent[];
};

export type Proposal = {
  agentId: string;
  role: string;
  evidenceScope: string;
  answer: string;
  evidenceRefs: string[];
  vote: Vote;
  confidence: number;
  risks: string[];
};

export type Critique = {
  fromAgentId: string;
  targetAgentId: string;
  concerns: string[];
  material: boolean;
};

export type DebateAgent = {
  id: string;
  role: string;
  evidenceScope: string;
  weight: number;
  propose: (input: Omit<DebateInput, "agents">) => Omit<Proposal, "agentId" | "role" | "evidenceScope">;
};

export type DebateDecision = {
  stopReason: StopReason;
  finalOwner: string;
  accepted: boolean;
  summary: string;
  dissent: string[];
};

export type TranscriptEvent = {
  type: "proposal" | "critique" | "decision";
  agentId?: string;
  targetAgentId?: string;
  message: string;
  vote?: Vote;
  evidenceRefs?: string[];
};

export type DebateRun = {
  runId: string;
  goal: string;
  finalOwner: string;
  agents: Array<Pick<DebateAgent, "id" | "role" | "evidenceScope" | "weight">>;
  proposals: Proposal[];
  critiques: Critique[];
  decision: DebateDecision;
  transcript: TranscriptEvent[];
};

export type DebateEvaluation = {
  status: "pass" | "fail";
  reasons: string[];
};

export function createRubricAgent(config: {
  id: string;
  role: string;
  evidenceScope: string;
  requiredEvidence: string[];
  acceptedAnswer: string;
  weight?: number;
}): DebateAgent {
  return {
    id: config.id,
    role: config.role,
    evidenceScope: config.evidenceScope,
    weight: config.weight ?? 1,
    propose(input) {
      const missing = config.requiredEvidence.filter(key => !input.evidence[key]);
      const evidenceRefs = config.requiredEvidence.filter(key => Boolean(input.evidence[key]));

      if (missing.length > 0) {
        return {
          answer: `${config.role} cannot accept the answer until evidence is added: ${missing.join(", ")}.`,
          evidenceRefs,
          vote: "revise",
          confidence: 0.45,
          risks: missing.map(key => `missing evidence: ${key}`),
        };
      }

      return {
        answer: config.acceptedAnswer,
        evidenceRefs,
        vote: "accept",
        confidence: 0.9,
        risks: [],
      };
    },
  };
}

export function incidentSummaryAgents(): DebateAgent[] {
  return [
    createRubricAgent({
      id: "chronology",
      role: "Chronology reviewer",
      evidenceScope: "incident_timeline",
      requiredEvidence: ["timeline"],
      acceptedAnswer: "Timeline is supported by the incident trace.",
    }),
    createRubricAgent({
      id: "impact",
      role: "Impact reviewer",
      evidenceScope: "customer_impact",
      requiredEvidence: ["customer_impact"],
      acceptedAnswer: "Customer impact is explicit and bounded.",
    }),
    createRubricAgent({
      id: "safety",
      role: "Safety reviewer",
      evidenceScope: "mitigation_and_followup",
      requiredEvidence: ["mitigation", "owner"],
      acceptedAnswer: "Mitigation, owner, and follow-up are recorded.",
    }),
  ];
}

export function runDebate(input: DebateInput): DebateRun {
  const proposals = input.agents.map(agent => ({
    agentId: agent.id,
    role: agent.role,
    evidenceScope: agent.evidenceScope,
    ...agent.propose({
      runId: input.runId,
      goal: input.goal,
      evidence: input.evidence,
      finalOwner: input.finalOwner,
    }),
  }));

  const critiques = buildCritiques(input.agents, proposals);
  const dissent = proposals
    .filter(proposal => proposal.vote !== "accept")
    .map(proposal => `${proposal.role}: ${proposal.risks.join("; ") || proposal.answer}`);

  const hasEscalation = proposals.some(proposal => proposal.vote === "escalate");
  const hasRevision = proposals.some(proposal => proposal.vote === "revise");
  const stopReason: StopReason = !input.finalOwner
    ? "blocked"
    : hasEscalation
      ? "escalated"
      : hasRevision
        ? "needs_revision"
        : "accepted";

  const decision: DebateDecision = {
    stopReason,
    finalOwner: input.finalOwner,
    accepted: stopReason === "accepted",
    summary: summarizeDecision(stopReason, proposals),
    dissent,
  };

  return {
    runId: input.runId,
    goal: input.goal,
    finalOwner: input.finalOwner,
    agents: input.agents.map(({ id, role, evidenceScope, weight }) => ({ id, role, evidenceScope, weight })),
    proposals,
    critiques,
    decision,
    transcript: buildTranscript(proposals, critiques, decision),
  };
}

export function evaluateDebate(run: DebateRun): DebateEvaluation {
  const reasons: string[] = [];
  const agentIds = new Set(run.agents.map(agent => agent.id));
  const evidenceScopes = new Set(run.agents.map(agent => agent.evidenceScope));
  const roles = new Set(run.agents.map(agent => agent.role));

  if (run.agents.length < 2) reasons.push("debate requires at least two agents");
  if (agentIds.size !== run.agents.length) reasons.push("agent IDs must be unique");
  if (evidenceScopes.size < 2 && roles.size < 2) reasons.push("agents are not independent");
  if (!run.finalOwner) reasons.push("missing final owner");
  if (run.proposals.length !== run.agents.length) reasons.push("each agent must produce one proposal");
  if (!run.decision.stopReason) reasons.push("missing stop reason");

  const materialDissent = run.proposals.some(proposal => proposal.vote !== "accept");
  if (materialDissent && run.decision.dissent.length === 0) reasons.push("material dissent was not preserved");
  if (materialDissent && run.decision.accepted) reasons.push("accepted despite unresolved dissent");

  const hasDecisionEvent = run.transcript.some(event => event.type === "decision");
  if (!hasDecisionEvent) reasons.push("transcript missing decision event");

  return {
    status: reasons.length === 0 ? "pass" : "fail",
    reasons,
  };
}

function buildCritiques(agents: DebateAgent[], proposals: Proposal[]): Critique[] {
  return proposals.flatMap(proposal =>
    agents
      .filter(agent => agent.id !== proposal.agentId)
      .map(agent => {
        const concerns = [
          ...proposal.risks,
          ...(proposal.evidenceRefs.length === 0 ? ["proposal has no evidence references"] : []),
        ];

        return {
          fromAgentId: agent.id,
          targetAgentId: proposal.agentId,
          concerns,
          material: concerns.length > 0,
        };
      })
  );
}

function summarizeDecision(stopReason: StopReason, proposals: Proposal[]) {
  if (stopReason === "accepted") {
    return `Accepted after ${proposals.length} independent proposal(s); no material dissent remained.`;
  }

  if (stopReason === "needs_revision") {
    return "Revision required because at least one reviewer found missing evidence.";
  }

  if (stopReason === "escalated") {
    return "Escalated because at least one reviewer found a high-risk unresolved issue.";
  }

  return "Blocked because the debate has no accountable final owner.";
}

function buildTranscript(proposals: Proposal[], critiques: Critique[], decision: DebateDecision): TranscriptEvent[] {
  return [
    ...proposals.map(proposal => ({
      type: "proposal" as const,
      agentId: proposal.agentId,
      message: proposal.answer,
      vote: proposal.vote,
      evidenceRefs: proposal.evidenceRefs,
    })),
    ...critiques.map(critique => ({
      type: "critique" as const,
      agentId: critique.fromAgentId,
      targetAgentId: critique.targetAgentId,
      message: critique.concerns.length > 0 ? critique.concerns.join("; ") : "no material concern",
    })),
    {
      type: "decision",
      message: decision.summary,
    },
  ];
}
