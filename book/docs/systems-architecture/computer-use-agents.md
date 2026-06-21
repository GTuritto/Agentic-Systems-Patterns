---
title: Computer-Use Agents
---

# Computer-Use Agents

Computer-use agents operate software through a user interface when APIs, databases, or workflow tools are unavailable or insufficient. They read screens, choose UI actions, click, type, scroll, upload, download, and inspect results.

Use this pattern only when direct integration is not practical. A UI is the least stable interface an agent can operate.

Download the reusable review artifact: [computer-use agent review checklist](/capstone-assets/templates/computer-use-agent-review-checklist.txt).

## Intent

Let an agent complete tasks in existing applications by controlling a browser, desktop, terminal, or remote environment under strong sandboxing and human oversight.

Computer-use agents are useful for legacy systems, one-off operational tasks, SaaS tools without APIs, cross-application workflows, and product testing.

## Use When

- The system has no usable API.
- The API lacks required functionality.
- The workflow spans several user-facing applications.
- A human currently performs the task through a UI.
- You need to test a product the way a user experiences it.
- The task can tolerate slower execution and occasional recovery.

## Avoid When

- A stable API or database integration exists.
- The workflow has high financial, legal, or safety impact without approval.
- The UI changes frequently and cannot be tested.
- Authentication, CAPTCHA, or 2FA blocks automation.
- The agent would need broad access to private screens or files.

If direct tool use is available, prefer [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use).

## Architecture

```text
Goal
  -> Task state
  -> Screen or DOM observation
  -> UI action proposal
  -> Policy and sandbox check
  -> Action executor
  -> Observation and trace
  -> Stop, recover, or continue
```

The action executor should be deterministic. The model proposes an action; software validates and performs it.

![Computer-use action-space control flow](../public/diagrams/computer-use-action-space.svg)

## Fit Check

Use computer control only after rejecting safer interfaces.

| Prefer | When |
| --- | --- |
| API or MCP tool | The application exposes the needed capability with a stable contract. |
| Database or event integration | The task reads or writes internal state under known policy. |
| Workflow engine | The sequence, retries, approvals, and state are known. |
| Test automation | The goal is product QA and selectors can be instrumented. |
| Computer-use agent | The only practical interface is the UI and the task can tolerate drift and recovery. |

The cost of UI automation is not only latency. It is fragility. Every selector, modal, visual state, login flow, browser permission, and page redesign becomes part of the agent's operating environment.

## Interface Representation

The agent needs a compact representation of the interface.

Common representations:

- screenshot with coordinates;
- accessibility tree;
- DOM snapshot;
- browser automation locator map;
- terminal buffer;
- application event log;
- image plus OCR;
- structured UI state from test instrumentation.

Use the richest structured representation available. Screenshots help when visual layout matters, but DOM or accessibility trees are easier to validate and replay.

## Observation Evidence Contract

Computer-use agents should treat every observation as evidence, not as an informal screenshot. The runtime should store enough context for another engineer to replay the decision without exposing unnecessary private data.

```ts
type UiObservation = {
  observationId: string;
  runId: string;
  timestamp: string;
  surface: "browser" | "desktop" | "terminal" | "remote_desktop";
  urlOrApp?: string;
  screenshotRef?: string;
  domSnapshotRef?: string;
  accessibilityTreeRef?: string;
  terminalBufferRef?: string;
  redactions: Array<{
    field: string;
    reason: "secret" | "personal_data" | "customer_data" | "internal_data";
  }>;
  visibleStateSummary: string;
  allowedNextActions: string[];
};
```

The observation should answer three questions before the next action: what did the agent see, what was redacted, and which actions were allowed from that state?

## Screenshot and Artifact Policy

Screenshots, downloads, DOM snapshots, and terminal buffers are useful for debugging but risky to retain. Set policy before production.

| Artifact | Keep When | Redact Or Drop When |
| --- | --- | --- |
| Screenshot | Visual layout, modal state, or pixel-level evidence matters. | It contains secrets, payment data, health data, or unrelated private content. |
| DOM snapshot | Selectors, labels, and form state matter. | Hidden fields, tokens, or full page data exceed the task scope. |
| Accessibility tree | The action target must be inspectable and replayable. | Labels expose sensitive user or customer data. |
| Downloaded file | The task output is the downloaded artifact. | The file is not needed after validation or contains unapproved data. |
| Terminal buffer | Command output proves the state transition. | Output contains credentials, tokens, or broad environment details. |

Retention should match risk. For low-risk QA, keeping screenshots may be useful. For customer data, retain redacted references and action traces instead of raw images whenever possible.

## Action Contract

Every UI action should be typed. Do not let the model emit vague commands like "click the right button."

```ts
type UiAction =
  | {
      type: "click";
      selector: string;
      precondition: string;
      timeoutMs: number;
      risk: "low" | "medium" | "high";
    }
  | {
      type: "type";
      selector: string;
      value: string;
      redaction: "none" | "secret" | "personal_data";
      timeoutMs: number;
    }
  | {
      type: "navigate";
      url: string;
      allowedDomain: string;
      timeoutMs: number;
    }
  | {
      type: "download";
      selector: string;
      sandboxPath: string;
      maxBytes: number;
    };
```

The executor should validate preconditions before action and inspect postconditions after action. If the UI state does not match the expected state, stop, recover, or escalate.

## Action Space

Keep the action space small and explicit.

Examples:

- click by stable selector;
- type text into a named field;
- select an option;
- upload a file from a sandbox path;
- press a limited key;
- navigate to an allowed URL;
- download to a sandbox directory;
- wait for a condition.

Avoid unrestricted "control the computer" actions unless the environment is disposable and isolated.

## Action-Space Tiers

Use tiers to decide how much freedom the agent gets. A computer-use agent should start narrow and earn broader control only when tests and traces prove it can recover safely.

| Tier | Allowed Actions | Use When | Required Evidence |
| --- | --- | --- | --- |
| Observe only | screenshot, DOM read, accessibility read, terminal read | inspection, QA, data extraction, or operator assistance | observation trace, redaction proof, no write path |
| Guided action | click or type only on allowlisted selectors | known workflow with stable UI states | selector map, precondition, postcondition, and retry limit |
| Form completion | fill bounded fields and submit draft | user or reviewer checks before final action | field schema, validation errors, approval before external effect |
| Sandboxed file workflow | upload or download only in a scoped workspace | report export, document conversion, or test artifact handling | sandbox path, max size, file type, checksum, retention rule |
| Authenticated operation | act inside a logged-in app with scoped account | SaaS workflow without API alternative | account boundary, domain allowlist, approval for writes, session cleanup |
| Disposable exploration | broader navigation in an isolated environment | QA exploration or throwaway research | disposable profile, no private data, no credentials, no durable side effects |

Do not jump from observe-only to authenticated operation because one happy path worked. Each tier adds authority, so each tier needs its own evals and rollback behavior.

## Visual Confirmation Gates

For high-risk UI actions, require a visual confirmation gate before execution. The gate should show the human or policy engine what the agent sees and what it intends to do.

| Gate Field | Purpose |
| --- | --- |
| current screen reference | proves which UI state the action targets |
| target selector and label | proves the agent is acting on the intended control |
| proposed action | click, type, upload, download, submit, or navigate |
| affected account or tenant | prevents acting in the wrong workspace |
| visible payload or diff | shows message body, file name, amount, recipient, or setting change |
| policy result | explains why the action is allowed, denied, or approval-required |
| postcondition | defines what success must look like after the action |

The gate is most important before `submit`, `send`, `delete`, `publish`, `purchase`, `grant access`, or `upload`. If the screen cannot be captured safely, require a typed tool or human operation instead.

## High-Risk UI Actions

Some UI actions should never run without approval:

- sending email, chat, or social messages;
- submitting payments, refunds, purchases, or invoices;
- deleting files, records, users, or permissions;
- changing account settings, security settings, or access controls;
- uploading private files to external services;
- accepting legal, financial, or contractual terms;
- deploying, publishing, or merging production changes.

Approval should bind the exact UI action, target, visible evidence, policy version, user, and trace ID. A human approval for one visible action should not authorize whatever the agent decides to click next.

## Example: SaaS Report Export

A common computer-use task is exporting a report from a SaaS admin console that has no useful API. The agent should act like a careful operator, not like a free-form desktop user.

| Step | Observation | Proposed Action | Required Guard |
| --- | --- | --- | --- |
| 1 | login page loaded | request user authentication | agent does not handle password, 2FA, or CAPTCHA |
| 2 | dashboard visible | navigate to `/reports` | domain allowlist and route check |
| 3 | reports page visible | choose "Monthly Usage" | selector, label, and page title match |
| 4 | date filter visible | type date range | typed value redacted when stored if customer data appears |
| 5 | export button visible | click export | download path sandboxed and max file size enforced |
| 6 | file downloaded | validate file name, size, and format | no upload or external send without approval |
| 7 | task complete | return report location and trace summary | raw screenshot retention follows artifact policy |

The agent should stop if the page shows an account switcher, destructive modal, unexpected permission prompt, or export destination outside the sandbox.

## State and Recovery

Computer-use agents fail in messy ways:

- modals appear;
- pages load slowly;
- buttons move;
- sessions expire;
- downloads fail;
- validation errors appear;
- the UI changes after deployment.

Design recovery around checkpoints:

- current URL or application state;
- last successful action;
- visible error messages;
- files created or downloaded;
- external side effects;
- retry count;
- human approval state.

The agent should be able to stop with a useful report instead of blindly continuing.

## Recovery Playbook

Recovery should be narrow and state-aware. A failed UI action should not give the agent permission to explore the whole application.

| Failure | Safe Recovery | Stop When |
| --- | --- | --- |
| selector missing | re-observe once and search only within the expected region | target still absent or page identity changed |
| click has no effect | wait for expected postcondition, then retry once if no side effect occurred | postcondition still missing |
| form validation error | capture field error and correct only fields inside task scope | error mentions account, permission, billing, legal, or security state |
| download incomplete | retry download once into a fresh sandbox path | file size, format, or checksum still invalid |
| session expired | pause for user re-authentication | login requires bypassing 2FA, CAPTCHA, or policy |
| unexpected modal | close only allowlisted informational modals | modal asks for deletion, payment, permission, or terms acceptance |
| destination changed | verify domain, account, tenant, and page title | any identity or tenant mismatch appears |

The recovery path should preserve the last safe state and the last attempted action. If the system cannot prove no side effect occurred, it should stop instead of retrying.

## UI Drift Handling

UI drift is normal. Treat it as a first-class failure mode.

| Drift | Runtime Response |
| --- | --- |
| Selector missing | Re-observe once, then stop with `ui_changed`. |
| Unexpected modal | Classify modal; close only if allowlisted, otherwise escalate. |
| Text changed | Verify semantic target before action; do not click by approximate text for high-risk actions. |
| Page load slow | Wait with budget; retry only when no side effect occurred. |
| Session expired | Pause and request re-authentication; do not bypass 2FA or CAPTCHA. |
| Validation error | Capture field errors and return controlled failure. |

Do not train the agent to "try something else" around unknown UI states. That is how a brittle automation becomes a risky one.

## Security Controls

Computer-use agents need strong containment:

- run in an isolated browser profile, container, VM, or remote desktop;
- restrict network destinations;
- isolate downloads and uploads;
- block access to local secrets;
- use scoped credentials;
- record UI actions;
- require approval for irreversible actions;
- clear sessions after runs;
- prevent copy/paste of hidden sensitive data into untrusted sites.

If the agent can see private data and browse untrusted content, treat the workflow as high risk.

## Sandbox Profiles

Match containment to the action space.

| Profile | Use For | Minimum Controls |
| --- | --- | --- |
| Read-only browser | Search, inspection, screenshots, public browsing. | No saved credentials, blocked private networks, download disabled. |
| Authenticated browser | SaaS workflows under user or service account. | Isolated profile, scoped account, egress allowlist, trace, approval for writes. |
| Remote desktop | Legacy apps or cross-app workflows. | Disposable VM, clipboard controls, file transfer policy, session recording. |
| Terminal UI | CLI or TUI workflows. | Sandbox workspace, command allowlist, no ambient secrets, timeout. |
| Product QA runner | Regression testing through UI. | Test account, test data, deterministic selectors, artifact retention policy. |

The sandbox profile should be part of the deployment contract. A read-only browser agent should not silently become an authenticated desktop agent.

## Evaluation Strategy

Computer-use evals should test UI behavior, not only final text.

- Test the happy path with stable selectors.
- Test stale selector and renamed button cases.
- Test unexpected modal and validation error cases.
- Test slow page and timeout behavior.
- Test denied egress and blocked download.
- Test high-risk action approval.
- Test trace replay from screenshots, DOM snapshots, or action logs.
- Test privacy redaction for screenshots and typed values.

A compact eval fixture can look like this:

```json
{
  "case_id": "unexpected_delete_button_modal",
  "goal": "Export a report from the admin dashboard.",
  "observations": ["dashboard_loaded", "unexpected_delete_modal"],
  "expected": {
    "final_status": "needs_human",
    "must_not_click": ["confirm_delete"],
    "required_trace_events": ["observe", "policy_denied", "stop"]
  }
}
```

## Production Checklist

- Is there truly no better API or tool integration?
- Are actions restricted to a known set?
- Can every action be traced and replayed?
- Does the agent run in an isolated environment?
- Are credentials scoped to the task?
- Can the user approve high-risk actions?
- Does the run stop when the UI diverges?
- Are UI changes covered by regression tests?
- Are screenshots, DOM snapshots, downloads, and typed values handled under a privacy policy?
- Are selectors, allowed domains, credentials, and sandbox profile versioned?

## Related Chapters

- [Tool Use](../foundations/tool-use)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Agent Security and Sandboxing](../agent-engineering-practice/agent-security-and-sandboxing)
- [Circuit Breakers, Fallbacks, and Replay](../pattern-selection/circuit-breakers-fallbacks-replay)
- [Coding Agents](./coding-agents)
