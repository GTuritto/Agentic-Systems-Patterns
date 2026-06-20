---
title: Lab 13 - Evaluate Multi-Agent Transcripts
---

# Lab 13 - Evaluate Multi-Agent Transcripts

## Objective

Use an AutoGen-style team conversation to make agents, team turns, structured messages, transcript ownership, termination, and transcript evals explicit.

## What You Will Use

- Language: TypeScript
- Framework/runtime: AutoGen-style AgentChat team transcript
- Framework-agnostic lesson: multi-agent collaboration needs a reviewable transcript and evals that check who said what, in what order, and why the team stopped.
- Official terminology checked: AutoGen AgentChat agents, teams, messages, and observable team behavior.
- Pattern chapters: [Supervisor / Worker](/multi-agent-systems/supervisor-worker), [Task Delegation](/multi-agent-systems/task-delegation), [Observability and Evals](/production-runtime/observability-and-evals)
- Source files:
  - `autogen-transcript-pattern/typescript/src/team_transcript.ts`
  - `autogen-transcript-pattern/typescript/src/run_demo.ts`
  - `autogen-transcript-pattern/typescript/test/team_transcript.spec.ts`
- Download: [autogen-transcript.zip](/downloads/autogen-transcript.zip)

## Setup

From the repository root:

```sh
npm install
```

This lab is deterministic and does not require a model key. It models the team transcript contract without live model calls.

## Run It

```sh
npm run autogen-transcript
npm run autogen-transcript:test
```

Expected result:

```text
AutoGen-style transcript tests OK
```

## Inspect The Code

Open `autogen-transcript-pattern/typescript/src/team_transcript.ts` and find these boundaries:

- `TeamMessage`: structured transcript event.
- `Agent`: named participant with a response contract.
- `createTeam`: manager, researcher, and reviewer roles.
- `runTeam`: fixed team turn sequence and termination.
- `evaluateTranscript`: transcript-level acceptance criteria.

The transcript is the core artifact. It should show task assignment, evidence, review, final synthesis, and stop reason.

## Baseline Run

Expected transcript:

```text
manager -> researcher: task
researcher -> reviewer: evidence
reviewer -> manager: review
manager -> team: final
```

Expected final state:

```text
stopReason: completed
evaluation: pass
```

## Change One Thing

Remove the researcher turn or change its message type from `evidence` to `final`.

Expected result: the transcript eval should fail because the team can no longer prove that evidence preceded review and final synthesis.

Restore the researcher turn and rerun:

```sh
npm run autogen-transcript:test
```

## Verify

Check that:

- every message has a sender, recipient, type, task ID, and turn number;
- all required roles appear in the transcript;
- turn numbers are sequential;
- final output does not bypass human review;
- the stop reason is explicit;
- transcript evals fail on missing roles or malformed message flow.

## Production Extension

Before using a real AutoGen implementation in production, add:

- message schemas for every team event;
- termination conditions and max-turn budgets;
- tool-call and human-input records in the transcript;
- redaction before transcript storage;
- transcript replay and regression evals;
- per-agent role contracts and permission boundaries;
- migration notes if adopting Microsoft Agent Framework for new projects.

## Cross-Framework Mapping

- In LangGraph, the same collaboration can be represented as graph nodes or subgraphs with explicit state.
- In Mastra AI, a workflow can coordinate agents and tools while traces capture the path.
- In AutoGen-style systems, the team transcript is the reviewable execution artifact.
- In CrewAI, crews and role tasks produce similar collaborative outputs, while flows own acceptance.

## Related Chapters

- [Supervisor / Worker](/multi-agent-systems/supervisor-worker)
- [Task Delegation](/multi-agent-systems/task-delegation)
- [Choosing Multi-Agent Topology](/multi-agent-systems/choosing-multi-agent-topology)
- [Production Evaluation Feedback Loops](/production-runtime/production-evaluation-feedback-loops)
