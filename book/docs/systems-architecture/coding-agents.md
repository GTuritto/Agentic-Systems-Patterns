---
title: Coding Agents
---

# Coding Agents

Coding agents operate inside software repositories. They read code, edit files, run commands, inspect failures, produce diffs, and often create commits or pull requests. Codex, Cursor Agent and Cloud Agent, Claude Code, OpenHands, and similar tools are examples of this architecture class.

The pattern is not "AI autocomplete." It is a controlled development worker with repository context and execution privileges.

## Examples

- [Codex CLI](https://developers.openai.com/codex/cli) and [Codex IDE extension](https://developers.openai.com/codex/ide)
- [Cursor Agent](https://cursor.com/docs/agent/overview), [Plan Mode](https://cursor.com/docs/agent/plan-mode), and [Cloud Agents](https://cursor.com/docs/cloud-agent)
- [Claude Code](https://code.claude.com/docs/en/overview)
- [OpenHands](https://openhands.dev/) and [OpenHands GitHub](https://github.com/OpenHands/openhands)

## Core Loop

![Coding agent loop](../public/diagrams/coding-agent-loop.svg)

## Surfaces

- **Local CLI:** runs near the repository and can use local tools.
- **IDE agent:** shares editor context, selected files, inline diffs, and local commands.
- **Cloud or background agent:** clones or mounts the repository in an isolated environment and returns a branch, diff, or PR.
- **CI/review agent:** reviews pull requests, comments on diffs, or proposes patches.
- **Multi-agent workspace:** runs several agents on separate branches or worktrees.

## Architecture Concerns

Coding agents need unusually clear boundaries because they can change source code and run commands.

Design for:

- Repository instructions: coding standards, commands, architecture constraints, and review expectations.
- Workspace isolation: branch, worktree, container, or cloud environment per task.
- Approval policy: which commands and file edits need human approval.
- Test signal: fast checks first, then broader regression checks.
- Diff review: humans inspect changed behavior, not just final prose.
- Secret handling: no credentials in prompts, logs, or generated code.
- Dependency policy: explicit approval before adding packages or changing lockfiles.

## Coding Agent As A Service

A mature coding agent behaves like a bounded engineering service.

It should have:

- a task contract;
- a repository working set;
- a writable workspace;
- a tool permission profile;
- a test strategy;
- a state record;
- a handoff artifact;
- a review gate.

For example, a PR review agent may own only review comments. A migration agent may own one branch and one dependency upgrade. A security-fix agent may own one validated finding and one patch. These boundaries matter because coding agents can otherwise become broad agents with shell access and vague goals.

Treat the agent as a service with a contract:

| Contract Field | Example |
| --- | --- |
| Input | issue, PR, failing test, migration request, security finding. |
| Allowed files | target package, test files, docs, config. |
| Disallowed files | secrets, generated assets, unrelated modules, deployment config. |
| Tools | read files, search, edit, test, typecheck, inspect CI. |
| Approval required | dependency install, lockfile change, broad refactor, deployment action. |
| Output | diff, test result, summary, risks, review notes. |
| Stop condition | tests pass, blocked reason, retry budget exhausted, human approval needed. |

This is where coding agents connect to [Agents As Services](./agents-as-services).

## Workspace Isolation

The workspace is the blast-radius boundary.

Use one isolated workspace per task:

- branch;
- git worktree;
- container;
- virtual machine;
- cloud workspace;
- forked repository;
- disposable checkout.

The agent should not edit directly on a developer's dirty working tree unless the user explicitly asks for that mode. Parallel agents should not share a writable workspace. If two agents need to touch the same area, coordinate through branches, PRs, or an explicit merge step.

Good isolation gives you:

- easy diff review;
- rollback;
- reproducible test runs;
- safer command execution;
- simpler conflict handling;
- clean handoff to humans.

## Repository Context

Coding agents fail when they see either too little code or too much code.

Use a curated working set:

1. identify primary files;
2. search for symbols, imports, references, tests, and docs;
3. rank secondary files;
4. load small relevant files;
5. summarize or excerpt large files;
6. keep unrelated files out of context.

The agent should also load repository instructions:

- coding style;
- architecture rules;
- test commands;
- package manager;
- branch and commit rules;
- security constraints;
- generated-file rules;
- review expectations.

Repository instructions should be durable. Do not rely on a human repeating the same guidance in every task.

## Shell Command Discipline

Shell access is powerful and risky.

Commands should be treated like tools:

- validate before execution;
- capture stdout, stderr, exit code, and duration;
- record the working directory;
- limit output size;
- redact secrets;
- distinguish read-only commands from mutating commands;
- require approval for dangerous operations;
- prefer project scripts over ad hoc commands.

Good command output is structured enough for the agent to act on. A failing test should become a diagnostic: file, line, test name, expected value, actual value, and likely owning module.

Avoid commands that hide too much:

- broad cleanup commands;
- global installs;
- destructive git operations;
- shell scripts with unclear side effects;
- commands that require interactive input;
- commands that mutate external systems.

The agent should explain why it is running a command when the command has side effects.

## CI Feedback Loop

CI is one of the best evaluators for coding agents.

A coding agent should treat CI as an external evaluator, not as an afterthought. It should reduce each failure to a reproducible local command or an explicit environmental blocker before continuing.

A useful loop is:

1. agent creates a branch or worktree;
2. agent makes the smallest coherent change;
3. agent runs fast local checks;
4. agent opens or updates a draft PR;
5. CI runs broader tests;
6. CI failures are parsed into structured diagnostics;
7. agent patches targeted failures within a retry budget;
8. agent stops when green, blocked, or approval is needed.

Do not let the agent chase CI forever. Define:

- maximum attempts;
- maximum runtime;
- allowed files;
- allowed test commands;
- when to ask a human;
- when to revert its own last change;
- when to mark the task blocked.

CI feedback should improve the patch, not produce an endless loop of speculative edits.

The retry budget should be explicit:

```ts
interface CiFailure {
  file?: string;
  test?: string;
  message: string;
}

async function repairWithCi(task: CodingTask, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await applySmallPatch(task);
    const result = await runCiChecks(task.branch);

    if (result.status === 'green') {
      return { status: 'ready_for_review', attempts: attempt };
    }

    const failures: CiFailure[] = parseCiFailures(result.logs);
    if (failures.length === 0 || result.status === 'flaky') {
      return { status: 'needs_human', reason: 'unclear_ci_failure' };
    }

    task.feedback = failures.slice(0, 5);
  }

  return { status: 'blocked', reason: 'retry_budget_exhausted' };
}
```

The agent is allowed to repair, but not forever.

## Background Agents

Background coding agents are useful when work is long-running or naturally asynchronous.

Use them for:

- dependency upgrades;
- lint migrations;
- test failure triage;
- mechanical refactors;
- documentation updates;
- low-risk bug fixes with good tests.

Avoid background autonomy for:

- ambiguous product changes;
- architecture changes without review;
- security-sensitive code without a validated finding;
- production deployment;
- secrets, credentials, or access control changes.

Background agents should notify humans only at meaningful states:

- needs clarification;
- needs approval;
- CI failed beyond retry budget;
- PR ready for review;
- blocked by missing permission;
- conflict with main branch.

The point is not to remove humans. The point is to stop requiring humans to babysit waiting time.

## Resumable State

Long-running coding agents need durable state outside the model context.

Useful state artifacts:

- task goal;
- acceptance criteria;
- files inspected;
- files changed;
- commands run;
- test results;
- decisions made;
- known risks;
- open questions;
- retry count;
- current blocker.

This can live in a task record, PR description, branch notes, agent state file, issue comment, or durable workflow state. The important part is that a human or a later agent can resume without reconstructing the whole conversation.

## PR Review Agents

PR review is one of the best production shapes for coding agents because the boundary is clear.

A review agent can:

- inspect changed files;
- compare against repository rules;
- run targeted checks;
- identify missing tests;
- flag security risks;
- suggest smaller diffs;
- write review comments.

It should not automatically merge its own approval. It should not block on style preferences unless those preferences are codified. It should cite files, lines, tests, and evidence.

Good review comments are specific:

- what is wrong;
- why it matters;
- where it occurs;
- how to verify;
- whether it is blocking or advisory.

The review agent is a second set of eyes, not the final authority.

## Use When

- The task can be verified with tests, builds, type checks, screenshots, or review.
- The desired change can be described in concrete acceptance criteria.
- The agent can inspect enough repository context to follow local patterns.
- You can isolate work and review the resulting diff.

## Avoid When

- The repository lacks tests or runnable checks and the change is high risk.
- The task is vague, political, or primarily product discovery.
- The agent needs broad production credentials.
- Multiple agents would edit the same files without coordination.

## Evaluation Strategy

Evaluate coding agents through artifacts and trajectories.

Check:

- diff correctness;
- test behavior;
- build and typecheck status;
- changed-files scope;
- architectural fit;
- dependency changes;
- generated code quality;
- command trajectory;
- secret exposure;
- review usefulness;
- handoff quality.

Use baselines:

- no-agent baseline for simple tasks;
- single-agent baseline before multi-agent coding workflows;
- human review outcomes;
- CI pass rate;
- revert or follow-up fix rate.

Coding-agent evals should include negative cases:

- task is too vague;
- tests are missing;
- requested change touches forbidden files;
- CI failure is flaky;
- dependency upgrade requires approval;
- security finding is not reproducible;
- generated code would solve the symptom but violate architecture.

The correct behavior is sometimes to stop and ask for a human decision.

## Operating Patterns

- Ask for a plan before large edits.
- Make the agent cite files and commands it used.
- Prefer small tasks with clear completion criteria.
- Use worktrees or branches for parallel agents.
- Require tests or type checks before commit.
- Review generated code like human code.
- Keep durable repo guidance in a project instruction file.
- Use isolated workspaces for parallel or background work.
- Treat shell commands as auditable tool calls.
- Keep retry budgets for CI-driven repair loops.
- Require explicit handoff artifacts for long-running work.

## Failure Modes

- Plausible code that compiles but violates architecture.
- Broad refactors that mix behavior changes with formatting.
- Tests updated to match broken behavior.
- Hidden dependency changes.
- Shell commands that mutate local state unexpectedly.
- Agents fighting over the same files.
- Review fatigue when diffs are too large.
- CI loops that patch symptoms without understanding failures.
- Background agents that continue after the task definition changes.
- Context windows filled with unrelated files.
- PR comments that sound plausible but cite no evidence.
- Human handoff that omits what was tried and why it failed.

## Production Checklist

- Branch or worktree per task.
- Clear allowed and forbidden files.
- Tool permission profile for read, edit, shell, network, and git operations.
- Repository instruction file loaded by default.
- Curated file context, not whole-repo context.
- Fast local checks before broad CI.
- CI diagnostics parsed into structured feedback.
- Retry budget and stop rules.
- Draft PR or review artifact for human inspection.
- Secret redaction in prompts, command output, traces, and summaries.
- Handoff summary with changed files, commands, results, risks, and open questions.

## Design Rule

The coding agent should never be the only reviewer of its own code. It can propose, edit, test, and explain. A separate check, reviewer, or policy gate should decide whether the change lands.

## Related Chapters

- [Goals and State](../foundations/goals-and-state)
- [Context Budgets and Working Sets](../foundations/context-budgets-and-working-sets)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Skills](../tools-skills-protocols/skills)
- [Agents As Services](./agents-as-services)
- [Choosing Multi-Agent Topology](../multi-agent-systems/choosing-multi-agent-topology)
- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Production Evaluation Feedback Loops](../production-runtime/production-evaluation-feedback-loops)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Architecture Decision Records for Agents](./architecture-decision-records)
