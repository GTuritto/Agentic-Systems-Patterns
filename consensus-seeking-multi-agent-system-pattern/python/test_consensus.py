from consensus import DebateAgent, evaluate_debate, incident_summary_agents, run_debate


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


accepted = run_debate(
    run_id="debate_accept",
    goal="Approve incident summary",
    final_owner="incident-commander",
    evidence={
        "timeline": "incident timeline",
        "customer_impact": "customer impact statement",
        "mitigation": "mitigation record",
        "owner": "follow-up owner",
    },
    agents=incident_summary_agents(),
)

assert_true(accepted["decision"]["stop_reason"] == "accepted", "Expected accepted decision")
assert_true(accepted["decision"]["accepted"], "Expected accepted flag")
assert_true(len(accepted["proposals"]) == 3, "Expected one proposal per agent")
assert_true(evaluate_debate(accepted)["status"] == "pass", "Expected accepted run to pass")

missing_impact = run_debate(
    run_id="debate_revision",
    goal="Approve incident summary",
    final_owner="incident-commander",
    evidence={
        "timeline": "incident timeline",
        "mitigation": "mitigation record",
        "owner": "follow-up owner",
    },
    agents=incident_summary_agents(),
)

assert_true(missing_impact["decision"]["stop_reason"] == "needs_revision", "Expected revision decision")
assert_true(
    any("customer_impact" in item for item in missing_impact["decision"]["dissent"]),
    "Expected impact dissent",
)
assert_true(evaluate_debate(missing_impact)["status"] == "pass", "Expected preserved dissent to pass")

same_1 = DebateAgent(
    id="same_1",
    role="same reviewer",
    evidence_scope="same scope",
    required_evidence=["timeline"],
    accepted_answer="same answer",
)
same_2 = DebateAgent(
    id="same_2",
    role="same reviewer",
    evidence_scope="same scope",
    required_evidence=["timeline"],
    accepted_answer="same answer",
)
correlated = run_debate(
    run_id="debate_correlated",
    goal="Approve incident summary",
    final_owner="incident-commander",
    evidence={"timeline": "incident timeline"},
    agents=[same_1, same_2],
)

correlated_eval = evaluate_debate(correlated)
assert_true(correlated_eval["status"] == "fail", "Expected correlated agents to fail")
assert_true("agents are not independent" in correlated_eval["reasons"], "Expected independence reason")

print("Debate and consensus Python tests OK")
