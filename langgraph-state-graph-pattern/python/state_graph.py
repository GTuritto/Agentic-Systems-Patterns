from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Literal, TypedDict


NodeName = Literal["classify", "retrieve", "draft", "review", "done"]


class GraphState(TypedDict):
    run_id: str
    user_request: str
    intent: str
    evidence: list[str]
    draft: str
    approved: bool
    interrupted: bool
    stop_reason: str


@dataclass
class Checkpoint:
    node: str
    state: GraphState


@dataclass
class GraphRun:
    state: GraphState
    trace: list[str] = field(default_factory=list)
    checkpoints: list[Checkpoint] = field(default_factory=list)


Node = Callable[[GraphRun], None]


def copy_state(state: GraphState) -> GraphState:
    return {
        "run_id": state["run_id"],
        "user_request": state["user_request"],
        "intent": state["intent"],
        "evidence": list(state["evidence"]),
        "draft": state["draft"],
        "approved": state["approved"],
        "interrupted": state["interrupted"],
        "stop_reason": state["stop_reason"],
    }


def checkpoint(run: GraphRun, node: str) -> None:
    run.checkpoints.append(Checkpoint(node=node, state=copy_state(run.state)))
    run.trace.append(f"checkpoint:{node}")


def classify(run: GraphRun) -> None:
    run.state["intent"] = "refund_request"
    run.trace.append("node:classify")


def retrieve(run: GraphRun) -> None:
    run.state["evidence"].append("refunds under 30 days can be drafted for review")
    run.trace.append("node:retrieve")


def draft(run: GraphRun) -> None:
    run.state["draft"] = "Draft a refund response for human review; do not promise payment."
    run.trace.append("node:draft")


def review(run: GraphRun) -> None:
    run.trace.append("node:review")
    if not run.state["approved"]:
        run.state["interrupted"] = True
        run.state["stop_reason"] = "human_interrupt"
        run.trace.append("interrupt:approval_required")
        return
    run.state["stop_reason"] = "success"


NODES: dict[NodeName, Node] = {
    "classify": classify,
    "retrieve": retrieve,
    "draft": draft,
    "review": review,
}

EDGES: dict[NodeName, NodeName] = {
    "classify": "retrieve",
    "retrieve": "draft",
    "draft": "review",
    "review": "done",
}


def initial_state(user_request: str) -> GraphState:
    return {
        "run_id": "langgraph_style_001",
        "user_request": user_request,
        "intent": "",
        "evidence": [],
        "draft": "",
        "approved": False,
        "interrupted": False,
        "stop_reason": "",
    }


def run_graph(user_request: str, approved: bool = False, resume_from: GraphState | None = None) -> GraphRun:
    run = GraphRun(state=copy_state(resume_from) if resume_from else initial_state(user_request))
    run.state["approved"] = approved
    run.state["interrupted"] = False
    run.state["stop_reason"] = ""

    node: NodeName = "review" if resume_from else "classify"
    while node != "done":
        checkpoint(run, node)
        NODES[node](run)
        if run.state["interrupted"]:
            return run
        node = EDGES[node]

    checkpoint(run, "done")
    run.trace.append("graph:done")
    return run


def evaluate_graph(run: GraphRun) -> dict[str, object]:
    reasons: list[str] = []
    if not run.checkpoints:
        reasons.append("missing checkpoints")
    if (
        "node:retrieve" not in run.trace
        and run.state["stop_reason"] == "success"
        and not run.state["evidence"]
    ):
        reasons.append("success without retrieval evidence")
    if run.state["stop_reason"] == "success" and not run.state["draft"]:
        reasons.append("success without draft")
    if run.state["stop_reason"] == "human_interrupt" and not run.state["interrupted"]:
        reasons.append("interrupt stop reason without interrupted state")

    if reasons:
        return {"status": "fail", "reasons": reasons}
    return {"status": "pass"}


if __name__ == "__main__":
    first = run_graph("Prepare a refund response")
    print(first)
    print(evaluate_graph(first))
    resumed = run_graph("Prepare a refund response", approved=True, resume_from=first.state)
    print(resumed)
    print(evaluate_graph(resumed))
