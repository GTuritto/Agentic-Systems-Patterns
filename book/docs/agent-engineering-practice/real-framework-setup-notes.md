---
title: Real Framework Setup Notes
---

# Real Framework Setup Notes

The labs teach architecture through small local implementations. This chapter shows how to translate those patterns into real framework projects without making the book depend on one language or one vendor.

Use these notes after the framework-neutral labs. Keep the same architectural contracts: state schema, tool manifest, policy gate, trace schema, eval fixtures, and rollback plan. The framework should host those contracts, not replace them.

## How To Use This Chapter

Start with one vertical slice:

1. one user request;
2. one state object;
3. one read tool;
4. one side-effect tool behind policy or approval;
5. one trace;
6. one eval case;
7. one local run command;
8. one rollback or disable path.

Do not begin by porting every lab. Port the smallest behavior that proves the framework can own the responsibility you need it to own.

## Shared Setup Rules

Every framework variant should define these files before the first demo:

| Artifact | Purpose |
| --- | --- |
| `.env.example` | Names required keys without storing secrets. |
| `state.schema.*` | Defines resumable state and migration fields. |
| `tools.*` | Declares tool names, inputs, outputs, side effects, and permissions. |
| `policy.*` | Enforces action rules before retrieval, memory writes, tool calls, or final answers. |
| `trace.*` | Emits run, model, tool, policy, approval, and evaluator events. |
| `evals/*` | Stores happy path, negative path, and trajectory checks. |
| `README.md` | Shows install, local run, test, eval, and cleanup commands. |

Keep secrets out of examples. Use `.env.example` for names and local environment variables for values.

## LangGraph Variant

Use LangGraph when the main risk is stateful control flow: branching, checkpoints, interrupts, replay, or human approval waits.

Repository native example: `native-framework-examples/langgraph-refund/`.

Official setup references:

- [LangGraph install](https://docs.langchain.com/oss/python/langgraph/install)
- [LangGraph graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [LangGraph local server](https://docs.langchain.com/oss/python/langgraph/local-server)
- [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)

Typical local setup:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -U langgraph
```

For a local LangGraph server, the official docs use the LangGraph CLI:

```sh
pip install -U "langgraph-cli[inmem]"
langgraph dev
```

Use the in-memory server only for local development. Production needs persistent storage for checkpoints and any long-term stores.

Porting path from the labs:

| Lab Asset | LangGraph Mapping |
| --- | --- |
| state object | `StateGraph` state schema |
| loop step | node function |
| route decision | conditional edge |
| approval wait | interrupt plus checkpoint |
| trace event | node, model, tool, policy, and interrupt spans |
| eval case | graph input, expected state diff, expected route, expected stop reason |

Production questions:

- Which checkpointer stores thread-scoped graph state?
- How are thread IDs assigned and protected from cross-tenant access?
- Which nodes can cause side effects?
- Are side-effect nodes idempotent under retry or resume?
- Which state fields need migrations?
- Which interrupts require human approval records?

Native example acceptance check: the example must pause at an approval interrupt, resume by thread ID, preserve prior state, and pass evals without issuing money.

## AutoGen Variant

Use AutoGen when the main risk is collaborative behavior: role contracts, message history, team termination, and transcript review.

Official setup references:

- [AutoGen documentation](https://microsoft.github.io/autogen/stable//index.html)
- [AgentChat user guide](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/index.html)
- [AgentChat installation](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/installation.html)
- [AgentChat teams](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/teams.html)

Typical local setup:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -U "autogen-agentchat" "autogen-ext[openai]"
```

AutoGen AgentChat currently requires Python 3.10 or later. Keep provider packages explicit so model dependencies do not hide inside the framework.

Porting path from the labs:

| Lab Asset | AutoGen Mapping |
| --- | --- |
| supervisor | team manager or coordinator |
| worker contract | agent role, tools, and expected output |
| transcript | durable message record |
| termination rule | team stop condition |
| tool policy | execution wrapper outside the message text |
| eval case | transcript replay with role, tool, and termination assertions |

Production questions:

- Who owns the transcript as durable state?
- Which messages are persisted, redacted, and replayable?
- What stops the team?
- Which agent may call which tool?
- Can a retry duplicate a tool side effect?
- Which transcript failures become eval fixtures?

## Mastra Variant

Use Mastra when the main risk is packaging a TypeScript product runtime around agents, workflows, tools, memory, observability, and evals.

Repository native example: `native-framework-examples/mastra-refund/`.

Official setup references:

- [Mastra docs](https://mastra.ai/docs)
- [Mastra quickstart](https://mastra.ai/guides/getting-started/quickstart)
- [Mastra manual install](https://mastra.ai/docs/getting-started/manual-install)
- [Mastra agents](https://mastra.ai/docs/agents/overview)
- [Mastra tools](https://mastra.ai/docs/agents/using-tools)
- [Mastra workflows](https://mastra.ai/docs/workflows/overview)
- [Mastra evals](https://mastra.ai/docs/evals/overview)

Typical local setup starts from the framework CLI:

```sh
npm create mastra@latest
```

Use the scaffold to inspect project structure, then map the book's contracts into framework-owned modules. Do not leave product policy only inside generated example code.

Porting path from the labs:

| Lab Asset | Mastra Mapping |
| --- | --- |
| agent decision | Mastra agent |
| deterministic control flow | workflow |
| tool registry | typed tool declarations |
| memory contract | framework memory plus retention policy |
| trace schema | runtime observability export |
| eval case | framework eval plus repository fixture |

Production questions:

- Which parts are Mastra-owned and which remain application-owned?
- Where do tools declare side effects and permissions?
- How are workflows deployed, retried, and rolled back?
- How are traces and eval results exported to the team's operational system?
- Which framework upgrades require regression evals?

Native example acceptance check: the example must define a refund draft agent, typed policy and draft tools, a workflow that enforces policy-before-draft order, and an eval that fails on money movement or customer messaging.

## CrewAI Variant

Use CrewAI when the main risk is Python workflow automation with flow-owned state and bounded specialist crews.

Repository native example: `native-framework-examples/crewai-delivery/`.

Official setup references:

- [CrewAI docs](https://docs.crewai.com/)
- [CrewAI installation](https://docs.crewai.com/en/installation)
- [CrewAI quickstart](https://docs.crewai.com/en/quickstart)
- [CrewAI introduction](https://docs.crewai.com/en/introduction)

CrewAI's current docs emphasize Python 3.10 through 3.13, `uv`-based installation, and a quickstart that scaffolds a Flow plus an agent crew. Keep the generated flow small enough that state transitions remain visible.

Porting path from the labs:

| Lab Asset | CrewAI Mapping |
| --- | --- |
| flow state | CrewAI Flow state |
| task delegation | crew tasks |
| worker contract | agent role, goal, tools, and output shape |
| merge policy | flow acceptance step |
| trace event | flow, task, and crew output records |
| eval case | flow output plus role-output assertions |

Production questions:

- What does the Flow own that the Crew must not mutate implicitly?
- What does each role add that a deterministic function could not?
- How are crew outputs validated before the flow accepts them?
- What happens when one role fails or disagrees?
- Which flow checkpoints are needed before external side effects?

Native example acceptance check: the example must keep planner, reviewer, and tester outputs separate, then let the Flow decide final acceptance.

## Mini-Runtime Variant

Use the custom mini-runtime when the main risk is understanding and owning the architecture. It is not a framework replacement for every production need. It is a teaching and design tool.

Map the same contracts directly:

| Contract | Mini-Runtime Location |
| --- | --- |
| state | explicit application object or table |
| tools | registry with schemas and side-effect labels |
| policy | function called before authority |
| memory | context packet plus governed storage |
| trace | append-only event list |
| evals | deterministic tests over state, trace, and output |

The mini-runtime is valuable because it makes the hidden framework responsibilities visible. After building it, readers can judge whether LangGraph, AutoGen, Mastra, or CrewAI adds enough operational value to justify the abstraction.

## Framework-Agnostic Acceptance Checklist

Before calling a framework port complete, verify:

- install command is documented and reproducible;
- local run command works from a clean checkout;
- secrets live in environment variables, not source;
- state owner is named;
- tool side effects are declared;
- policy runs before authority;
- traces include model, tool, policy, and evaluator events;
- evals cover happy path, negative path, and trajectory;
- rollback or kill switch is documented;
- framework-specific code does not hide product contracts.

If the port passes only the happy path, it is still a demo.
