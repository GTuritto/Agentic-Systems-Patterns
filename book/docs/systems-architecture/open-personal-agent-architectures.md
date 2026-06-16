---
title: Open Personal Agent Architectures
---

# Open Personal Agent Architectures

Open personal agents are self-hosted or user-controlled assistants that connect to chat apps, calendars, inboxes, browsers, files, memory, and automations. OpenClaw and Hermes Agent are useful examples because they emphasize different sides of the architecture: broad personal action versus long-term learning.

This chapter is not a product ranking. It uses these projects to explain the architecture of persistent personal agents.

## Examples

- [OpenClaw](https://openclaw.ai/) and its [GitHub repository](https://github.com/openclaw/openclaw): a personal assistant that runs on user-controlled infrastructure and acts through channels such as chat apps, device surfaces, and connected tools.
- [Hermes Agent](https://hermes-agent.nousresearch.com/docs/) and its [GitHub repository](https://github.com/nousresearch/hermes-agent): a persistent agent focused on memory, skill creation, and learning from repeated use.
- [AutoGPT](https://github.com/significant-gravitas/autogpt): a platform for creating and running continuous agents.
- [OpenHands](https://github.com/OpenHands/openhands): an open-source platform for software-development agents.

## Core Architecture

![Open personal agent architecture](../public/diagrams/open-personal-agent-architecture.svg)

## What Makes Them Different

A normal assistant answers in the current session. A personal agent keeps context and can act over time. That creates value and risk.

Useful capabilities:

- Persistent user preferences
- Project and relationship memory
- Scheduled work
- App integrations
- Reusable skills
- Multi-channel access
- Long-running tasks

New risks:

- Over-broad OAuth scopes
- Mistaken identity in email or chat
- Memory storing private or incorrect facts
- Automation without enough review
- Prompt injection through inboxes, calendars, pages, and documents
- Operational burden when self-hosted

## OpenClaw-Style Pattern

OpenClaw-style systems optimize for reach: one assistant connected to many channels and tools.

Architecture emphasis:

- Gateway-first design
- Chat-native interaction
- Tool and app connectors
- User-owned deployment
- Broad task automation

Use this style when the main problem is giving a user one assistant across daily applications.

## Hermes-Style Pattern

Hermes-style systems optimize for learning over time.

Architecture emphasis:

- Persistent memory
- Skill extraction from repeated workflows
- Self-improvement loops
- Long-running agent presence
- User model that deepens over sessions

Use this style when the main problem is making the assistant better at one user's recurring workflows.

## Safety Architecture

Personal agents need stronger safety boundaries than chat-only assistants because they can touch private systems.

Minimum controls:

- Identity verification for requests from email, chat, and shared channels
- Tool scopes narrowed by task type
- Human approval before sending messages, spending money, changing access, or deleting data
- Separate memory types for preferences, facts, credentials, and task state
- Audit logs for every external action
- Prompt-injection filters for retrieved documents, emails, and webpages
- Secrets stored outside model-visible context

## Failure Modes

- The agent trusts a spoofed sender and acts on private data.
- A chat instruction overrides the user's standing policy.
- The agent stores a temporary fact as durable memory.
- A connector exposes more data than the task needs.
- The user cannot inspect why an action happened.
- The system has no emergency stop or approval mode.

## Design Rule

Treat the personal agent like an employee with keys. It needs identity, permissions, training, supervision, logs, and a way to revoke access.

## Related Chapters

- [Skills](../tools-skills-protocols/skills)
- [Memory-Augmented Agent](../memory-knowledge/memory-augmented-agent)
- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Agentic System Architecture](./agentic-system-architecture)
