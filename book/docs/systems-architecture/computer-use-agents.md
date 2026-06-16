---
title: Computer-Use Agents
---

# Computer-Use Agents

Computer-use agents operate software through a user interface when APIs, databases, or workflow tools are unavailable or insufficient. They read screens, choose UI actions, click, type, scroll, upload, download, and inspect results.

Use this pattern only when direct integration is not practical. A UI is the least stable interface an agent can operate.

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

## Production Checklist

- Is there truly no better API or tool integration?
- Are actions restricted to a known set?
- Can every action be traced and replayed?
- Does the agent run in an isolated environment?
- Are credentials scoped to the task?
- Can the user approve high-risk actions?
- Does the run stop when the UI diverges?
- Are UI changes covered by regression tests?

## Related Chapters

- [Tool Use](../foundations/tool-use)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Agent Security and Sandboxing](../agent-engineering-practice/agent-security-and-sandboxing)
- [Circuit Breakers, Fallbacks, and Replay](../pattern-selection/circuit-breakers-fallbacks-replay)
- [Coding Agents](./coding-agents)
