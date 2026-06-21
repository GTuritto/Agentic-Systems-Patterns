---
title: Release Notes
---

# Release Notes

These notes summarize the current release shape of *Agentic Systems Patterns*. Use them with the [Release Readiness Checklist](./release-readiness-checklist.md) before publishing.

## Current Release

Version: `1.0.0`

Review date: 2026-06-21

Release theme: turn the repository from a pattern catalog into a complete guide for designing, implementing, evaluating, and operating agentic systems across frameworks.

## Reader Value Added

- Clear reader paths for first-time readers, builders, lab users, capstone users, and reference users.
- Pattern chapters with consistent intent, use/avoid guidance, architecture, system shape, protocol, failure modes, eval strategy, production checklist, source links, and downloads.
- Framework-agnostic labs across Python and TypeScript.
- Coverage of LangChain/LangGraph-style retrieval, LangGraph-style state graphs, Mastra-style runtime packaging, AutoGen-style transcript evaluation, CrewAI-style flows, A2A, MCP, and deterministic custom runtimes.
- A from-scratch mini-framework track that explains what agent frameworks package under the hood.
- Product-shaped capstones for refund support, research RAG, and multi-agent delivery workflows.
- Native framework slices for selected LangGraph, Mastra, CrewAI, and AutoGen examples.
- Release-ready publishing flow for site, PDF, generated source bundles, diagrams, search, parity checks, and native example validation.

## Verification Evidence

The release is expected to pass:

```sh
npm test
npm run typecheck
npm run native-examples:validate
npm run native-examples:smoke:langgraph
npm run book:manifest:test
npm run book:build
npm run site:build
npm run site:parity
npm run book:pdf
```

The release is not ready if any command fails or if the generated PDF is not refreshed after content changes.

## Known Scope Boundaries

- Examples are educational and deterministic by default; live model-provider integrations require local configuration.
- Native framework slices are comparison points for important boundaries, not exhaustive tutorials for every framework feature.
- The book favors architecture, production evidence, and design review discipline over API-by-API framework coverage.
- Historical pattern names remain in the deprecated section so older terminology can be mapped to the current taxonomy.

## Publishing Artifacts

- Site output: `site/dist`
- PDF source artifact: `book/releases/Agentic-Systems-Patterns.pdf`
- PDF deploy copy: `book/docs/public/releases/Agentic-Systems-Patterns.pdf`
- Generated downloads: `book/docs/public/downloads/`

## Release Summary

This release is ready when the reader can answer five questions after finishing the guide:

1. Which agentic pattern should I use, and why?
2. What owns state, policy, tools, memory, approvals, traces, and evals?
3. How do I run a small example and identify what is missing for production?
4. How does the same architecture map across frameworks and languages?
5. What evidence proves the system is safe enough to release?
