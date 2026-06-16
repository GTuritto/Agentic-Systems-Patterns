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

```mermaid
flowchart TD
  Event[Event or User Request] --> Flow[CrewAI Flow]
  Flow --> State[Flow State]
  Flow --> Crew[Crew]
  Crew --> A1[Researcher Agent]
  Crew --> A2[Writer Agent]
  Crew --> A3[Reviewer Agent]
  Crew --> Result[Crew Result]
  Result --> State
  State --> Output[Final Output]
```

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

## Code Walkthrough

Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.

## Source Code

This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.

## Download

- [Download source bundle](/downloads/crewai-flows-and-crews.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/crewai-flows-and-crews-pattern)

The download bundle contains the current `crewai-flows-and-crews-pattern/` folder from this repository.

## Related Patterns

- [Task Delegation](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/task-delegation-pattern/README.md)
- [Consensus-Seeking Multi-Agent System](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/consensus-seeking-multi-agent-system-pattern/README.md)
- [Durable Workflow](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
