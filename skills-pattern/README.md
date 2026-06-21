# Skills Pattern

## Intent

The Skills Pattern packages procedural knowledge as discoverable folders: concise instructions, references, scripts, templates, and tests that an agent loads only when relevant.

This folder includes a small release-notes skill package. It shows the shape a production skill should have: `SKILL.md` for activation and procedure, references for policy, templates for stable output, fixtures for repeatable examples, and a TypeScript runner/test that a human or agent can execute.

## Use When

- A capability requires repeatable domain procedure rather than only a tool API.
- You want reusable know-how across agents, teams, or projects.
- The agent benefits from progressive disclosure: short instructions first, deeper references only when needed.

## Avoid When

- A simple tool schema fully describes the capability.
- The skill would embed secrets, credentials, or unsafe scripts.
- The instructions are too vague to test with real tasks.

## Scenario

A platform team wants coding agents to prepare release notes, update a changelog, and collect verification evidence. A tool schema can describe "write release notes", but it cannot carry the team's release rubric, examples, required commands, source-link policy, and final checklist.

A skill is the better boundary. `SKILL.md` gives the activation rule and the short procedure. Reference files hold release policy and examples. Scripts collect version, diff, and test evidence. Templates keep the output shape stable. The agent loads deeper files only when the release task appears, so normal coding work does not pay the context cost.

The important question is whether the folder contains a repeatable procedure another engineer can review, run, version, and test.

## Architecture

```mermaid
flowchart LR
  T[Task] --> D[Skill Discovery]
  D --> S[SKILL.md]
  S --> R[References and Assets]
  S --> C[Scripts or Templates]
  R --> A[Agent Action]
  C --> A
```

## Decision Rules

Use a skill when the model needs procedural judgment around a capability. Use a tool when the model only needs to call a typed operation.

| Need | Prefer | Reason |
| --- | --- | --- |
| Call a stable API with typed input and output. | Tool | The schema and authorization rule carry the whole contract. |
| Follow a multi-step team procedure. | Skill | The agent needs instructions, examples, templates, and checks. |
| Produce a repeated artifact such as a PR note, ADR, report, or release packet. | Skill | Templates and examples reduce drift. |
| Execute a dangerous action. | Tool behind policy, not skill alone. | Skills may explain the procedure, but permissions must live outside prose. |
| Share capability across agents or teams. | Skill plus tested scripts. | Humans and agents need the same runnable contract. |

```mermaid
flowchart TD
  I[Identify repeatable task] --> B{Tool schema enough?}
  B -->|yes| T[Build typed tool]
  B -->|no| S[Draft SKILL.md]
  S --> R[Add references and examples]
  R --> A[Add templates, scripts, or assets]
  A --> V[Validate package]
  V --> E{Tests pass?}
  E -->|no| S
  E -->|yes| P[Publish versioned skill]
  P --> O[Observe use and failures]
  O --> U{Procedure changed?}
  U -->|yes| S
  U -->|no| P
```

## Contract

A production skill should have a small, reviewable anatomy.

| Part | Owns | A++ Test |
| --- | --- | --- |
| `SKILL.md` | Activation rule, short procedure, and routing to deeper material. | A new agent can decide when to use the skill without loading every reference. |
| `references/` | Domain policy, examples, rubrics, and edge cases. | References are scoped, current, and cited by the skill. |
| `scripts/` | Repeatable collection, validation, generation, or formatting. | A human can run the scripts outside the agent loop. |
| `templates/` | Stable output shape for common artifacts. | Outputs stay consistent across runs and agents. |
| `tests/` or fixtures | Positive and negative cases. | Bad activation, missing inputs, unsafe outputs, and malformed artifacts fail. |
| Manifest or metadata | Version, owner, dependencies, permissions, and environment. | Reviewers can audit supply-chain and permission risk. |

### Bad Skill vs Production Skill

| Weak Skill | Production Skill |
| --- | --- |
| "Use this for writing." | "Use this for release notes from verified engineering evidence." |
| One long instruction file. | Short `SKILL.md` plus routed references. |
| Vague advice and examples copied into context. | Templates, fixtures, and scripts with deterministic output. |
| Hidden shell assumptions. | Explicit commands, dependencies, inputs, outputs, and failure modes. |
| No negative cases. | Wrong-task activation, missing evidence, unsafe request, and malformed output tests. |
| Skill text implies permission. | Policy and execution authority live outside prose. |

## Implementation Notes

- Keep `SKILL.md` short and route to deeper files only when needed.
- Bundle scripts and templates instead of asking the model to recreate fragile artifacts.
- Treat skills as supply-chain inputs: review, version, test, and restrict execution.
- Include examples of successful and unsuccessful use.
- Record owner, version, dependencies, and rollback path before distributing a skill.
- Prefer runnable scripts for fragile formatting, evidence collection, or validation.
- Keep credentials in platform stores or environment bindings, never inside skill files.

### CLI-First Skills

A useful skill should be callable by both a human and an agent. A command-line interface is often the simplest shared contract:

- one command per capability;
- predictable subcommands such as `list`, `get`, `create`, and `run`;
- structured output for agents and readable output for humans;
- non-interactive defaults with explicit `--yes` or `--force` flags;
- credentials from environment or platform stores, not prompts hidden inside the command.

This keeps the skill testable outside the agent loop. If a human cannot run the skill directly and inspect the output, the agent will be harder to debug when the skill fails.

## Review Checklist

Before adding a skill to an agent environment, check:

- The description is narrow enough that the skill activates only for the right tasks.
- The first screen of instructions tells the agent what to do, what not to do, and which files to load next.
- Any script is deterministic, non-interactive by default, and safe to run with least privilege.
- Secrets come from platform stores or environment bindings, never from copied prose.
- The skill has at least one success example and one refusal or misuse example.
- The skill records enough evidence that a reviewer can reproduce the result.
- The skill can be disabled, versioned, or rolled back independently of the agent prompt.

## Evaluation Strategy

- Test happy-path use, wrong-task activation, missing inputs, malformed artifacts, unsafe requests, and missing dependencies.
- Assert that the skill loads only the references required for the task.
- Verify generated artifacts against templates instead of only checking prose quality.
- Run scripts outside the agent loop so humans can reproduce failures.
- Track activation accuracy, evidence completeness, script failure rate, artifact validity, and rollback success.

## Production Checklist

- Name the owner, version, dependency set, and supported runtime.
- Keep `SKILL.md` short enough for first-load use.
- Gate dangerous scripts behind external policy and approval.
- Validate inputs, outputs, template placeholders, and required evidence.
- Log skill name, version, loaded references, scripts run, artifacts written, and final status.
- Pin or roll back the skill independently of the agent prompt.

Use the online book's downloadable skill review checklist when reviewing a production skill package.

## Run The Example

```bash
npm run skills:demo
npm run skills:test
```

The demo reads `release-notes-skill/`, loads the evidence fixture, validates the skill package, and renders release notes from the template.

## Failure Modes

- Skill descriptions that are too broad, causing irrelevant activation.
- Long instruction files that consume context before the task is understood.
- Hidden dependencies that only work on one machine.
- Malicious or outdated bundled scripts.
- Prompt text that silently expands tool or filesystem authority.
- References that conflict with `SKILL.md` or with each other.
- Templates that drift because no fixture proves the final artifact.
- Missing rollback path after a bad skill version ships.

## Related Patterns

- [MCP-first Tool Use](../modern-tool-use-pattern/README.md)
- [Context Engineering](../context-engineering-pattern/README.md)
- [Human-in-the-Loop Approval](../human-in-the-loop-approval-agent/README.md)
