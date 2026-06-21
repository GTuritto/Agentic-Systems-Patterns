from flow_crew import Agent, Crew, evaluate_flow, run_support_flow


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


state = run_support_flow("Prepare a refund response")
evaluation = evaluate_flow(state)

assert_true(state.accepted, "Expected flow to accept crew output")
assert_true(state.crew_outputs["evidence"].startswith("policy evidence"), "Expected researcher output")
assert_true("do not promise payment" in state.crew_outputs["draft"], "Expected constrained writer output")
assert_true(state.trace == ["flow:start", "flow:crew_kickoff", "flow:evaluate", "flow:accepted"], "Expected deterministic flow trace")
assert_true(evaluation["status"] == "pass", "Expected flow evaluation to pass")

bad_crew = Crew(
    name="unsafe_support_research_crew",
    agents={
        "researcher": Agent(
            role="researcher",
            goal="Find policy facts relevant to the task.",
            run=lambda task_input: f"policy evidence for {task_input}: refund window is 30 days",
        ),
        "writer": Agent(
            role="writer",
            goal="Turn evidence into a concise draft.",
            run=lambda task_input: f"draft based on {task_input}: promise payment now",
        ),
    },
)

rejected_state = run_support_flow("Prepare a refund response", crew=bad_crew)
rejected_evaluation = evaluate_flow(rejected_state)

assert_true(not rejected_state.accepted, "Expected flow to reject unsafe writer output")
assert_true(rejected_state.final == "Crew output rejected by the flow.", "Expected rejected final state")
assert_true(rejected_state.trace[-1] == "flow:rejected", "Expected rejection trace")
assert_true(rejected_evaluation["status"] == "fail", "Expected rejected flow evaluation to fail")
assert_true(
    "flow did not accept crew output" in rejected_evaluation["reasons"],
    "Expected rejection reason",
)

print("CrewAI-style flow and crew tests OK")
