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

![CrewAI flows and crews architecture](../public/diagrams/crewai-flows-crews.svg)

## System Shape

- **Pattern boundary:** a coordinator delegates bounded work to agents with narrow roles, then evaluates and merges their outputs.
- **State owner:** the coordinator owns the shared goal, decomposition, assignments, merge policy, and final acceptance.
- **Primary artifact:** `crewai-flows-and-crews-pattern/` contains the runnable reference implementation and examples.
- **Operational promise:** CrewAI Flows own state and execution order. Crews group specialized agents that collaborate on delegated work inside the flow.
- **Runnable path:** start with `npm run crewai-flow` before adapting the pattern to a larger system.

## Core Protocol

1. Define the shared goal, worker roles, expected outputs, and acceptance criteria.
2. Split work only where independent or specialist execution adds value.
3. Dispatch tasks with scoped context and permissions.
4. Collect outputs, errors, refusals, and evidence from each worker.
5. Merge results through an explicit judge, reducer, supervisor, or human review gate.

## Implementation Notes

- Let flows manage state, branching, persistence, and execution order.
- Give each crew a bounded task with clear expected output.
- Give each agent a role that changes behavior, not just a different name.
- Test flow state transitions separately from crew output quality.

## Failure Modes

- Crews used as a substitute for workflow design.
- Too many agents with vague roles.
- Flow state mutated implicitly through chat history.
- No evaluator for whether the crew result satisfies the flow step.

## Evaluation Strategy

- Compare multi-agent output against a single-agent baseline on the same tasks.
- Test worker disagreement, worker failure, duplicated work, and bad merge decisions.
- Measure quality lift, latency cost, token cost, merge accuracy, and accountability.
- Include cases that prove each "Use When" condition is true for this pattern.
- Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.

## Production Checklist

- Give every worker a narrow contract and permission set.
- Make the merge policy explicit before workers run.
- Log per-worker inputs, outputs, and decision evidence.
- Keep one owner for final acceptance and escalation.
- Define human escalation for ambiguous, high-risk, or policy-blocked work.
- Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.

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

def run_support_flow(goal: str) -> FlowState:
    state = FlowState(goal=goal)
    crew = build_research_crew()

    state.trace.append("flow:start")
    tasks = [
        Task(name="evidence", agent_role="researcher", input=goal),
        Task(name="draft", agent_role="writer", input="policy evidence"),
    ]
    state.trace.append("flow:crew_kickoff")
    state.crew_outputs = crew.kickoff(tasks)

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
from flow_crew import evaluate_flow, run_support_flow

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
