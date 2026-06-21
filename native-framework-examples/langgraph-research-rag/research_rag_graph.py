from typing import Literal

from typing_extensions import TypedDict

from langgraph.graph import END, START, StateGraph


class Source(TypedDict):
    id: str
    title: str
    content: str
    status: Literal["current", "stale"]
    allowed: bool
    citation: str


class Evidence(TypedDict):
    source_id: str
    citation: str
    excerpt: str


class ResearchState(TypedDict, total=False):
    question: str
    actor_role: str
    access_scope: str
    retrieved_sources: list[Source]
    evidence: list[Evidence]
    omitted_sources: list[str]
    answer: str
    stop_reason: str
    trace: list[str]
    eval_failures: list[str]


SOURCES: list[Source] = [
    {
        "id": "refund-policy-v4",
        "title": "Current refund authority policy",
        "content": "Support agents may draft refund recommendations. Finance must issue money.",
        "status": "current",
        "allowed": True,
        "citation": "refund-policy-v4#p3",
    },
    {
        "id": "refund-policy-v2",
        "title": "Old refund process",
        "content": "Support agents could issue refunds directly under the old process.",
        "status": "stale",
        "allowed": True,
        "citation": "refund-policy-v2#p1",
    },
    {
        "id": "finance-private-notes",
        "title": "Finance private notes",
        "content": "Internal finance exception notes for refund payment operations.",
        "status": "current",
        "allowed": False,
        "citation": "finance-private-notes#p2",
    },
]


def append_trace(state: ResearchState, event: str) -> list[str]:
    return [*state.get("trace", []), event]


def check_access(state: ResearchState) -> ResearchState:
    allowed = state.get("actor_role") == "support_researcher"
    return {
        "stop_reason": "access_allowed" if allowed else "access_denied",
        "trace": append_trace(state, "policy:source_access_allowed" if allowed else "policy:source_access_denied"),
    }


def route_after_access(state: ResearchState) -> Literal["retrieve_sources", "__end__"]:
    return "retrieve_sources" if state.get("stop_reason") == "access_allowed" else "__end__"


def retrieve_sources(state: ResearchState) -> ResearchState:
    query = state["question"].lower()
    matches = [source for source in SOURCES if "refund" in query and "refund" in source["content"].lower()]
    return {
        "retrieved_sources": matches,
        "trace": append_trace(state, "retrieval:semantic_search"),
    }


def filter_sources(state: ResearchState) -> ResearchState:
    evidence: list[Evidence] = []
    omitted: list[str] = []

    for source in state.get("retrieved_sources", []):
        if not source["allowed"]:
            omitted.append(f"{source['id']}:forbidden")
            continue
        if source["status"] != "current":
            omitted.append(f"{source['id']}:stale")
            continue
        evidence.append(
            {
                "source_id": source["id"],
                "citation": source["citation"],
                "excerpt": source["content"],
            }
        )

    return {
        "evidence": evidence,
        "omitted_sources": omitted,
        "stop_reason": "evidence_ready" if evidence else "missing_approved_evidence",
        "trace": append_trace(state, "source_filter:acl_freshness_citation"),
    }


def route_after_filter(state: ResearchState) -> Literal["answer_with_citations", "escalate"]:
    return "answer_with_citations" if state.get("stop_reason") == "evidence_ready" else "escalate"


def answer_with_citations(state: ResearchState) -> ResearchState:
    citations = ", ".join(item["citation"] for item in state.get("evidence", []))
    return {
        "answer": (
            "The support refund agent may draft refund recommendations, but finance must issue money. "
            f"Citations: {citations}."
        ),
        "stop_reason": "answered_with_citation",
        "trace": append_trace(state, "model:research-answer-v1"),
    }


def escalate(state: ResearchState) -> ResearchState:
    return {
        "answer": "I do not have approved current evidence for this answer. Escalate to a human reviewer.",
        "stop_reason": "escalated_missing_evidence",
        "trace": append_trace(state, "escalation:missing_approved_evidence"),
    }


def evaluate_answer(state: ResearchState) -> ResearchState:
    failures: list[str] = []
    evidence_ids = {item["source_id"] for item in state.get("evidence", [])}
    answer = state.get("answer", "")

    if state.get("stop_reason") == "answered_with_citation":
        if "refund-policy-v4" not in evidence_ids:
            failures.append("current_source_missing")
        if "refund-policy-v2" in evidence_ids:
            failures.append("stale_source_in_evidence")
        if "finance-private-notes" in evidence_ids:
            failures.append("forbidden_source_in_evidence")
        if "refund-policy-v4#p3" not in answer:
            failures.append("answer_missing_current_citation")
        if "refund-policy-v2" in answer:
            failures.append("stale_source_cited")
        if "finance-private-notes" in answer:
            failures.append("forbidden_source_cited")
    else:
        if state.get("evidence"):
            failures.append("escalated_despite_available_evidence")

    return {
        "eval_failures": failures,
        "trace": append_trace(state, "eval:citation_faithfulness"),
    }


def build_graph():
    builder = StateGraph(ResearchState)
    builder.add_node("check_access", check_access)
    builder.add_node("retrieve_sources", retrieve_sources)
    builder.add_node("filter_sources", filter_sources)
    builder.add_node("answer_with_citations", answer_with_citations)
    builder.add_node("escalate", escalate)
    builder.add_node("evaluate_answer", evaluate_answer)
    builder.add_edge(START, "check_access")
    builder.add_conditional_edges(
        "check_access",
        route_after_access,
        {"retrieve_sources": "retrieve_sources", "__end__": END},
    )
    builder.add_edge("retrieve_sources", "filter_sources")
    builder.add_conditional_edges(
        "filter_sources",
        route_after_filter,
        {"answer_with_citations": "answer_with_citations", "escalate": "escalate"},
    )
    builder.add_edge("answer_with_citations", "evaluate_answer")
    builder.add_edge("escalate", "evaluate_answer")
    builder.add_edge("evaluate_answer", END)
    return builder.compile()


def evaluate(final_state: ResearchState) -> dict[str, object]:
    failures = final_state.get("eval_failures", [])
    return {"status": "pass" if not failures else "fail", "failures": failures}


if __name__ == "__main__":
    graph = build_graph()
    final_state = graph.invoke(
        {
            "question": "Can the support refund agent issue money?",
            "actor_role": "support_researcher",
            "access_scope": "support_docs",
            "trace": ["run:start"],
        }
    )
    print("final:", final_state)
    print("eval:", evaluate(final_state))
