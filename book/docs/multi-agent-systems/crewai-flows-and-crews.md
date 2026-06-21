---
title: CrewAI Flows and Crews
---

# CrewAI Flows and Crews

CrewAI Flows own state and execution order. Crews group specialized agents that collaborate on delegated work inside the flow.

> Source and downloads
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/crewai-flows-and-crews-pattern)
> - [Download code bundle](/downloads/crewai-flows-and-crews.zip)

## Intent

The CrewAI Flows and Crews Pattern separates production workflow control from collaborative agent work. Flows own state and execution order; crews group specialized agents that perform delegated tasks inside the flow.

## Use When

- You are building Python-first agent automations.
- The system needs explicit state and event-driven control flow.
- Multiple specialist agents need to collaborate on bounded tasks.

## Avoid When

- A single deterministic workflow step is enough.
- Agents have unclear roles or overlapping responsibilities.
- You cannot define where flow state begins and crew-local context ends.

## Architecture

Use this diagram to read CrewAI Flows and Crews as a system boundary, not only a code shape. The key ownership question is: the coordinator owns the shared goal, decomposition, assignments, merge policy, and final acceptance.

![CrewAI flows and crews architecture](../public/diagrams/crewai-flows-crews.svg)

## System Shape

- **Flow boundary:** the Flow owns durable state, ordering, branching, checkpoints, acceptance, and final output.
- **Crew boundary:** a Crew performs bounded specialist work inside a Flow step and returns structured outputs.
- **Agent boundary:** each agent has a role, goal, tools, permissions, and expected output shape that differ from the other roles.
- **Policy boundary:** the Flow checks authority before crew kickoff, tool use, memory writes, and final acceptance.
- **Evaluation boundary:** flow state transitions and crew outputs are tested separately, then tested together as one trajectory.
- **Operational boundary:** traces record flow events, crew kickoff, role outputs, validation, acceptance, rejection, and escalation.

## Core Protocol

1. Accept an event or request with actor, tenant, goal, release version, and idempotency key.
2. Initialize Flow state and decide whether the work needs a Crew or a deterministic function.
3. Create tasks with scoped inputs, expected outputs, allowed tools, and acceptance criteria.
4. Run the Crew and collect role outputs, errors, refusals, and evidence.
5. Validate each role output before it can mutate Flow state.
6. Let the Flow accept, reject, retry, escalate, or request human review.
7. Emit trace events for flow steps, crew kickoff, role outputs, policy decisions, and final acceptance.
8. Convert rejected outputs, role disagreements, and incidents into eval fixtures.

## Implementation Notes

- Let flows manage state, branching, persistence, and execution order.
- Give each crew a bounded task with clear expected output.
- Give each agent a role that changes behavior, not just a different name.
- Test flow state transitions separately from crew output quality.
- Prefer deterministic Flow logic for ordering, retry, checkpointing, approval, and rollback.
- Keep Crew-local conversation from becoming the only source of truth for workflow state.
- Validate role outputs with schemas or explicit acceptance functions before using them.
- Record why the Flow accepted or rejected the Crew result.

## Failure Modes

- Crews used as a substitute for workflow design.
- Too many agents with vague roles.
- Flow state mutated implicitly through chat history.
- No evaluator for whether the crew result satisfies the flow step.
- Role outputs accepted without schema, evidence, or policy checks.
- Crew failure hidden as a weak final answer instead of a typed failed state.
- Human escalation missing for ambiguous, high-risk, or conflicting outputs.

## Evaluation Strategy

- Test Flow transitions with deterministic fixtures before involving Crew behavior.
- Test each role's expected output shape, tool permissions, and refusal behavior.
- Test worker disagreement, missing evidence, tool timeout, and rejected Crew output.
- Compare Crew output against a single-agent or deterministic baseline to prove the Crew adds value.
- Gate releases on final answer quality and trajectory quality: role behavior, policy decisions, and Flow acceptance.

## Production Checklist

- Document install, local run, test, eval, and cleanup commands.
- Define Flow state, checkpoint strategy, role permissions, and task schemas.
- Validate Crew outputs before they modify Flow state or produce user-visible output.
- Export redacted flow, task, role, policy, and evaluator traces.
- Add evals for accepted output, rejected output, role disagreement, tool failure, and escalation.
- Define rollback for disabling one role, one tool, one Flow path, or the whole Crew route.

## Run the Example

```sh
npm run crewai-flow
npm run crewai-flow:test
```

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

These excerpts show the implementation shape. The complete code is available in the download bundle and repository source.

### `crewai-flows-and-crews-pattern/python/flow_crew.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/crewai-flows-and-crews-pattern/python/flow_crew.py)

```py
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
```

_Excerpt truncated for readability. Download the bundle or open the source file for the complete implementation._

### `crewai-flows-and-crews-pattern/python/test_flow_crew.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/crewai-flows-and-crews-pattern/python/test_flow_crew.py)

```py
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
```

## Download

- [Download source bundle](/downloads/crewai-flows-and-crews.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/crewai-flows-and-crews-pattern)

The download bundle contains the current `crewai-flows-and-crews-pattern/` folder from this repository.

## Related Patterns

- [Task Delegation](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/task-delegation-pattern/README.md)
- [Consensus-Seeking Multi-Agent System](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/consensus-seeking-multi-agent-system-pattern/README.md)
- [Durable Workflow](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
