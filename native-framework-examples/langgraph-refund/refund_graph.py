from typing import Literal

from typing_extensions import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt


class RefundState(TypedDict, total=False):
    ticket_id: str
    tenant_id: str
    policy_evidence: str
    draft: str
    approved: bool
    stop_reason: str
    trace: list[str]


def append_trace(state: RefundState, event: str) -> list[str]:
    return [*state.get("trace", []), event]


def load_policy(state: RefundState) -> RefundState:
    return {
        "policy_evidence": "refund-policy-v4: agent may draft, finance must issue money",
        "trace": append_trace(state, "tool:refund_policy.retrieve"),
    }


def draft_recommendation(state: RefundState) -> RefundState:
    return {
        "draft": "Draft recommendation with refund-policy-v4 citation. Do not issue money.",
        "trace": append_trace(state, "model:refund-draft-v2"),
    }


def approval_gate(state: RefundState) -> RefundState:
    approval = interrupt(
        {
            "action": "approve_refund_draft",
            "ticket_id": state["ticket_id"],
            "draft": state["draft"],
        }
    )
    approved = bool(approval.get("approved"))
    return {
        "approved": approved,
        "stop_reason": "approved_draft" if approved else "approval_denied",
        "trace": append_trace(state, "interrupt:finance_approval"),
    }


def finalize(state: RefundState) -> RefundState:
    return {
        "stop_reason": "draft_ready_for_finance",
        "trace": append_trace(state, "finalize:draft_ready"),
    }


def route_after_approval(state: RefundState) -> Literal["finalize", "__end__"]:
    return "finalize" if state.get("approved") else "__end__"


def build_graph():
    builder = StateGraph(RefundState)
    builder.add_node("load_policy", load_policy)
    builder.add_node("draft_recommendation", draft_recommendation)
    builder.add_node("approval_gate", approval_gate)
    builder.add_node("finalize", finalize)
    builder.add_edge(START, "load_policy")
    builder.add_edge("load_policy", "draft_recommendation")
    builder.add_edge("draft_recommendation", "approval_gate")
    builder.add_conditional_edges(
        "approval_gate",
        route_after_approval,
        {"finalize": "finalize", "__end__": END},
    )
    builder.add_edge("finalize", END)
    return builder.compile(checkpointer=InMemorySaver())


def evaluate(final_state: RefundState) -> dict[str, object]:
    failures: list[str] = []
    if "refund-policy-v4" not in final_state.get("draft", ""):
        failures.append("draft_missing_policy_citation")
    if "Do not issue money" not in final_state.get("draft", ""):
        failures.append("draft_does_not_stop_before_money_movement")
    if final_state.get("stop_reason") != "draft_ready_for_finance":
        failures.append("unexpected_stop_reason")
    return {"status": "pass" if not failures else "fail", "failures": failures}


if __name__ == "__main__":
    graph = build_graph()
    config = {"configurable": {"thread_id": "ticket-T-1042"}}
    initial_state: RefundState = {
        "ticket_id": "T-1042",
        "tenant_id": "tenant_a",
        "trace": ["run:start"],
    }

    interrupted = graph.invoke(initial_state, config=config)
    print("interrupted:", interrupted)

    final_state = graph.invoke(Command(resume={"approved": True}), config=config)
    print("final:", final_state)
    print("eval:", evaluate(final_state))
