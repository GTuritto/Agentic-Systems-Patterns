from dataclasses import dataclass, field
from typing import Callable


@dataclass
class Agent:
    role: str
    goal: str
    run: Callable[[str], str]


@dataclass
class Task:
    name: str
    agent_role: str
    input: str


@dataclass
class Crew:
    name: str
    agents: dict[str, Agent]

    def kickoff(self, tasks: list[Task]) -> dict[str, str]:
        outputs: dict[str, str] = {}
        for task in tasks:
            agent = self.agents[task.agent_role]
            outputs[task.name] = agent.run(task.input)
        return outputs


@dataclass
class FlowState:
    goal: str
    accepted: bool = False
    crew_outputs: dict[str, str] = field(default_factory=dict)
    trace: list[str] = field(default_factory=list)
    final: str | None = None


def build_research_crew() -> Crew:
    return Crew(
        name="support_research_crew",
        agents={
            "researcher": Agent(
                role="researcher",
                goal="Find policy facts relevant to the task.",
                run=lambda task_input: f"policy evidence for {task_input}: refund window is 30 days",
            ),
            "writer": Agent(
                role="writer",
                goal="Turn evidence into a concise draft.",
                run=lambda task_input: f"draft based on {task_input}: offer review, do not promise payment",
            ),
        },
    )


def run_support_flow(goal: str, crew: Crew | None = None) -> FlowState:
    state = FlowState(goal=goal)
    active_crew = crew or build_research_crew()

    state.trace.append("flow:start")
    tasks = [
        Task(name="evidence", agent_role="researcher", input=goal),
        Task(name="draft", agent_role="writer", input="policy evidence"),
    ]
    state.trace.append("flow:crew_kickoff")
    state.crew_outputs = active_crew.kickoff(tasks)

    evidence = state.crew_outputs["evidence"]
    draft = state.crew_outputs["draft"]
    state.trace.append("flow:evaluate")

    state.accepted = "30 days" in evidence and "do not promise payment" in draft
    if state.accepted:
        state.final = "Crew output accepted by the flow."
        state.trace.append("flow:accepted")
    else:
        state.final = "Crew output rejected by the flow."
        state.trace.append("flow:rejected")

    return state


def evaluate_flow(state: FlowState) -> dict[str, object]:
    reasons: list[str] = []
    if not state.accepted:
        reasons.append("flow did not accept crew output")
    if "evidence" not in state.crew_outputs:
        reasons.append("missing researcher output")
    if "draft" not in state.crew_outputs:
        reasons.append("missing writer output")
    if "flow:evaluate" not in state.trace:
        reasons.append("flow did not evaluate crew output")

    if reasons:
        return {"status": "fail", "reasons": reasons}
    return {"status": "pass"}


if __name__ == "__main__":
    result = run_support_flow("Prepare a refund response")
    print(result)
    print(evaluate_flow(result))
