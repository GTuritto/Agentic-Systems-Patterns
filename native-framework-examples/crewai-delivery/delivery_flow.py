from typing import Any

from pydantic import BaseModel, Field

from crewai import Agent, Crew, Process, Task
from crewai.flow.flow import Flow, listen, start


class DeliveryState(BaseModel):
    request: str = "Prepare a delivery package for a policy-safe refund agent"
    plan: str = ""
    risk_review: str = ""
    test_plan: str = ""
    accepted: bool = False
    stop_reason: str = ""
    trace: list[str] = Field(default_factory=list)


def task_raw(output: Any, index: int) -> str:
    tasks_output = getattr(output, "tasks_output", None) or []
    if len(tasks_output) <= index:
        return ""
    return str(getattr(tasks_output[index], "raw", tasks_output[index])).strip()


def build_delivery_crew() -> Crew:
    planner = Agent(
        role="Planner",
        goal="Create a scoped implementation plan",
        backstory="You turn requests into bounded implementation plans with clear ownership.",
        allow_delegation=False,
    )
    risk_reviewer = Agent(
        role="Risk reviewer",
        goal="Find release-blocking risks",
        backstory="You identify policy, state, security, and rollback gaps.",
        allow_delegation=False,
    )
    test_planner = Agent(
        role="Test planner",
        goal="Define release-blocking tests and evals",
        backstory="You convert acceptance criteria into tests, traces, and eval gates.",
        allow_delegation=False,
    )
    return Crew(
        agents=[planner, risk_reviewer, test_planner],
        tasks=[
            Task(
                description="Create a short implementation plan for: {request}",
                expected_output="A scoped plan with owner, state, tools, evals, and rollback.",
                agent=planner,
            ),
            Task(
                description="Review the plan for policy, approval, trace, and rollback risks.",
                expected_output="A risk review with blockers and mitigations.",
                agent=risk_reviewer,
            ),
            Task(
                description="Create release-blocking tests and evals for the plan.",
                expected_output="A test plan with unit tests, trajectory evals, and release gates.",
                agent=test_planner,
            ),
        ],
        process=Process.sequential,
    )


class DeliveryFlow(Flow[DeliveryState]):
    @start()
    def run_crew(self):
        self.state.trace.append("flow:start")
        result = build_delivery_crew().kickoff(inputs={"request": self.state.request})
        self.state.plan = task_raw(result, 0)
        self.state.risk_review = task_raw(result, 1)
        self.state.test_plan = task_raw(result, 2)
        self.state.trace.append("flow:crew_kickoff")
        return result

    @listen(run_crew)
    def accept_or_reject(self, _crew_output):
        self.state.accepted = all(
            [
                bool(self.state.plan),
                bool(self.state.risk_review),
                bool(self.state.test_plan),
            ]
        )
        self.state.stop_reason = "accepted_after_review" if self.state.accepted else "rejected_missing_output"
        self.state.trace.append("flow:accepted" if self.state.accepted else "flow:rejected")
        return self.state.model_dump()


def evaluate(state: DeliveryState) -> dict[str, object]:
    failures: list[str] = []
    if not state.plan:
        failures.append("missing_plan")
    if not state.risk_review:
        failures.append("missing_risk_review")
    if not state.test_plan:
        failures.append("missing_test_plan")
    if state.stop_reason != "accepted_after_review":
        failures.append("unexpected_stop_reason")
    return {"status": "pass" if not failures else "fail", "failures": failures}


if __name__ == "__main__":
    flow = DeliveryFlow()
    final_output = flow.kickoff()
    print(final_output)
    print(evaluate(flow.state))
