from dataclasses import dataclass
from typing import Literal

Vote = Literal["accept", "revise", "escalate"]
StopReason = Literal["accepted", "needs_revision", "escalated", "blocked"]


@dataclass(frozen=True)
class Proposal:
    agent_id: str
    role: str
    evidence_scope: str
    answer: str
    evidence_refs: list[str]
    vote: Vote
    confidence: float
    risks: list[str]


@dataclass(frozen=True)
class Critique:
    from_agent_id: str
    target_agent_id: str
    concerns: list[str]
    material: bool


@dataclass(frozen=True)
class DebateAgent:
    id: str
    role: str
    evidence_scope: str
    required_evidence: list[str]
    accepted_answer: str
    weight: float = 1.0

    def propose(self, evidence: dict[str, str]) -> Proposal:
        missing = [key for key in self.required_evidence if not evidence.get(key)]
        evidence_refs = [key for key in self.required_evidence if evidence.get(key)]

        if missing:
            return Proposal(
                agent_id=self.id,
                role=self.role,
                evidence_scope=self.evidence_scope,
                answer=f"{self.role} cannot accept until evidence is added: {', '.join(missing)}.",
                evidence_refs=evidence_refs,
                vote="revise",
                confidence=0.45,
                risks=[f"missing evidence: {key}" for key in missing],
            )

        return Proposal(
            agent_id=self.id,
            role=self.role,
            evidence_scope=self.evidence_scope,
            answer=self.accepted_answer,
            evidence_refs=evidence_refs,
            vote="accept",
            confidence=0.9,
            risks=[],
        )


def incident_summary_agents() -> list[DebateAgent]:
    return [
        DebateAgent(
            id="chronology",
            role="Chronology reviewer",
            evidence_scope="incident_timeline",
            required_evidence=["timeline"],
            accepted_answer="Timeline is supported by the incident trace.",
        ),
        DebateAgent(
            id="impact",
            role="Impact reviewer",
            evidence_scope="customer_impact",
            required_evidence=["customer_impact"],
            accepted_answer="Customer impact is explicit and bounded.",
        ),
        DebateAgent(
            id="safety",
            role="Safety reviewer",
            evidence_scope="mitigation_and_followup",
            required_evidence=["mitigation", "owner"],
            accepted_answer="Mitigation, owner, and follow-up are recorded.",
        ),
    ]


def run_debate(
    run_id: str,
    goal: str,
    final_owner: str,
    evidence: dict[str, str],
    agents: list[DebateAgent],
) -> dict:
    proposals = [agent.propose(evidence) for agent in agents]
    critiques = _build_critiques(agents, proposals)
    dissent = [
        f"{proposal.role}: {'; '.join(proposal.risks) or proposal.answer}"
        for proposal in proposals
        if proposal.vote != "accept"
    ]

    if not final_owner:
        stop_reason: StopReason = "blocked"
    elif any(proposal.vote == "escalate" for proposal in proposals):
        stop_reason = "escalated"
    elif any(proposal.vote == "revise" for proposal in proposals):
        stop_reason = "needs_revision"
    else:
        stop_reason = "accepted"

    decision = {
        "stop_reason": stop_reason,
        "final_owner": final_owner,
        "accepted": stop_reason == "accepted",
        "summary": _summarize_decision(stop_reason, proposals),
        "dissent": dissent,
    }

    return {
        "run_id": run_id,
        "goal": goal,
        "final_owner": final_owner,
        "agents": [
            {
                "id": agent.id,
                "role": agent.role,
                "evidence_scope": agent.evidence_scope,
                "weight": agent.weight,
            }
            for agent in agents
        ],
        "proposals": [proposal.__dict__ for proposal in proposals],
        "critiques": [critique.__dict__ for critique in critiques],
        "decision": decision,
        "transcript": _build_transcript(proposals, critiques, decision),
    }


def evaluate_debate(run: dict) -> dict:
    reasons: list[str] = []
    agents = run["agents"]
    agent_ids = {agent["id"] for agent in agents}
    evidence_scopes = {agent["evidence_scope"] for agent in agents}
    roles = {agent["role"] for agent in agents}

    if len(agents) < 2:
        reasons.append("debate requires at least two agents")
    if len(agent_ids) != len(agents):
        reasons.append("agent IDs must be unique")
    if len(evidence_scopes) < 2 and len(roles) < 2:
        reasons.append("agents are not independent")
    if not run["final_owner"]:
        reasons.append("missing final owner")
    if len(run["proposals"]) != len(agents):
        reasons.append("each agent must produce one proposal")

    material_dissent = any(proposal["vote"] != "accept" for proposal in run["proposals"])
    if material_dissent and not run["decision"]["dissent"]:
        reasons.append("material dissent was not preserved")
    if material_dissent and run["decision"]["accepted"]:
        reasons.append("accepted despite unresolved dissent")
    if not any(event["type"] == "decision" for event in run["transcript"]):
        reasons.append("transcript missing decision event")

    return {"status": "pass" if not reasons else "fail", "reasons": reasons}


def _build_critiques(agents: list[DebateAgent], proposals: list[Proposal]) -> list[Critique]:
    critiques: list[Critique] = []
    for proposal in proposals:
        for agent in agents:
            if agent.id == proposal.agent_id:
                continue
            concerns = list(proposal.risks)
            if not proposal.evidence_refs:
                concerns.append("proposal has no evidence references")
            critiques.append(
                Critique(
                    from_agent_id=agent.id,
                    target_agent_id=proposal.agent_id,
                    concerns=concerns,
                    material=bool(concerns),
                )
            )
    return critiques


def _summarize_decision(stop_reason: StopReason, proposals: list[Proposal]) -> str:
    if stop_reason == "accepted":
        return f"Accepted after {len(proposals)} independent proposal(s); no material dissent remained."
    if stop_reason == "needs_revision":
        return "Revision required because at least one reviewer found missing evidence."
    if stop_reason == "escalated":
        return "Escalated because at least one reviewer found a high-risk unresolved issue."
    return "Blocked because the debate has no accountable final owner."


def _build_transcript(proposals: list[Proposal], critiques: list[Critique], decision: dict) -> list[dict]:
    return [
        *[
            {
                "type": "proposal",
                "agent_id": proposal.agent_id,
                "message": proposal.answer,
                "vote": proposal.vote,
                "evidence_refs": proposal.evidence_refs,
            }
            for proposal in proposals
        ],
        *[
            {
                "type": "critique",
                "agent_id": critique.from_agent_id,
                "target_agent_id": critique.target_agent_id,
                "message": "; ".join(critique.concerns) if critique.concerns else "no material concern",
            }
            for critique in critiques
        ],
        {"type": "decision", "message": decision["summary"]},
    ]


if __name__ == "__main__":
    result = run_debate(
        run_id="debate_incident_summary_001",
        goal="Decide whether the incident summary is ready for executive review.",
        final_owner="incident-commander",
        evidence={
            "timeline": "14:02 alert, 14:05 mitigation started, 14:19 service recovered",
            "customer_impact": "12 enterprise tenants saw elevated latency for 17 minutes",
            "mitigation": "disabled failing cache warmup path",
            "owner": "platform-oncall",
        },
        agents=incident_summary_agents(),
    )
    print(result["decision"])
