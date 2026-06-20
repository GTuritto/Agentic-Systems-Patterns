from state_graph import evaluate_graph, run_graph


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


first = run_graph("Prepare a refund response")
assert_true(first.state["stop_reason"] == "human_interrupt", "Expected approval interrupt")
assert_true(first.state["interrupted"], "Expected interrupted state")
assert_true("checkpoint:review" in first.trace, "Expected review checkpoint")
assert_true(evaluate_graph(first)["status"] == "pass", "Expected interrupted graph eval to pass")

resumed = run_graph("Prepare a refund response", approved=True, resume_from=first.state)
assert_true(resumed.state["stop_reason"] == "success", "Expected resumed graph success")
assert_true(resumed.state["approved"], "Expected approval state on resume")
assert_true(resumed.state["draft"].startswith("Draft a refund response"), "Expected preserved draft")
assert_true(resumed.trace == ["checkpoint:review", "node:review", "checkpoint:done", "graph:done"], "Expected resume from review node")
assert_true(evaluate_graph(resumed)["status"] == "pass", "Expected resumed graph eval to pass")

print("LangGraph-style state graph tests OK")
