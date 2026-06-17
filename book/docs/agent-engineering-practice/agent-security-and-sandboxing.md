---
title: Agent Security and Sandboxing
---

# Agent Security and Sandboxing

Agent security is different from chatbot safety because agents can act. They can read private data, call APIs, write files, run code, trigger workflows, and communicate with other systems.

Use this chapter when an agent has tools, memory, external data, or side effects.

Start with the [Agent Threat Model](./agent-threat-model) if you need to classify the system's risk. Use this chapter when you are ready to design the containment controls.

## Security Model

Secure agents by separating four concerns: what the user asks for, what the model proposes, what policy allows, and what the tool actually executes. The model should not be the policy engine. It can classify intent or explain a decision, but deterministic software should enforce permissions.

## The High-Risk Combination

The most dangerous agent shape combines access to private or trusted data, exposure to untrusted content, and the ability to perform external actions. When those three meet, a malicious document, web page, email, or tool result can try to steer the agent into leaking data or taking an unsafe action.

Mitigate this with least privilege, content isolation, approval gates, egress controls, and explicit policy checks.

## Sandboxing

Sandbox any agent that can execute code, operate a browser, manipulate files, or call write APIs.

Sandbox controls:

- isolated process, container, VM, or browser profile;
- read-only filesystem by default;
- scoped workspace directory;
- no ambient credentials;
- explicit secret injection only for approved tools;
- outbound network restrictions;
- time and CPU limits;
- file size limits;
- audit logs for every side effect;
- cleanup after run completion.

Coding and computer-use agents need stronger sandboxes than read-only research agents.

## Access Control

Grant access by role, task, and route. A support-answer agent can read public docs but cannot issue refunds. A billing workflow can read invoice state but needs approval to apply credit. A coding agent can edit files in a branch but cannot deploy to production. A research agent can browse the web but cannot touch customer data. Avoid global tool lists. Each route or agent should receive only the tools needed for the task.

## Guardrails

Guardrails should run before and after model calls and before tools.

| Guardrail Point | Checks |
| --- | --- |
| Input | prompt injection, sensitive data, unsupported request, user authorization. |
| Retrieval | untrusted source, stale source, tenant boundary, citation quality. |
| Tool intent | permission, side effect level, policy, approval requirement. |
| Tool input | schema, allowed fields, data minimization, idempotency key. |
| Output | data leakage, unsupported claims, unsafe instructions, missing caveats. |
| Memory write | privacy, source, expiry, correction path. |

No single guardrail is enough. Use layers.

## Secrets

Agents should not see raw secrets unless the tool contract requires them. Prefer server-side tool execution, scoped tokens, and short-lived credentials, with secret access granted per tool, no secrets in prompts or memory, and redacted traces. If a model can read a secret, assume it can accidentally expose it.

## Approval Gates

Require approval for:

- money movement;
- account changes;
- customer communication at scale;
- production infrastructure changes;
- legal, medical, or compliance decisions;
- deletion or irreversible writes;
- broad data export;
- privilege escalation.

Approval records should include the proposed action, evidence, policy result, approver, timestamp, and final tool call.

## Incident Response

Plan for agent incidents before launch. The team should already know how to disable a tool or a route, roll back a prompt or policy, revoke credentials, quarantine memory, inspect traces, notify affected users, and turn the incident into evals. If the response requires code archaeology in the middle of an incident, the system is not operationally ready.

## Related Chapters

- [Agent Threat Model](./agent-threat-model)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Secure Agent Communication](../tools-skills-protocols/secure-agent-communication)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Circuit Breakers, Fallbacks, and Replay](../pattern-selection/circuit-breakers-fallbacks-replay)
- [Coding Agents](../systems-architecture/coding-agents)
