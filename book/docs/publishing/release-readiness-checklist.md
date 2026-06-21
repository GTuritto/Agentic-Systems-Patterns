---
title: Release Readiness Checklist
---

# Release Readiness Checklist

Use this checklist before publishing a new version of the book. The standard is not "the site builds." The standard is that a reader can move from concept, to pattern choice, to lab, to capstone, to release evidence without finding missing context.

## Reader Journey

| Gate | Release Evidence |
| --- | --- |
| Start path is coherent | [How To Read This Book](./how-to-read.md) gives first-time, builder, lab, capstone, and reference paths. |
| Pattern selection is usable | Selection chapters explain when to use a pattern, when to avoid it, and how patterns compose. |
| Labs prove architecture, not only APIs | Labs identify language, framework, source files, baseline command, production gap, and expected output. |
| Mini-framework track explains the primitives | The from-scratch track shows loop, decision, tool registry, policy, memory, trace, and eval responsibilities. |
| Capstones feel product-shaped | Capstones include state, policy, memory, approvals, traces, evals, ADRs, runbooks, rollback, and framework mappings. |

## Content Quality

| Gate | Release Evidence |
| --- | --- |
| No unfinished markers | Search for common draft markers outside generated assets. |
| Diagrams have context | Architecture diagrams are introduced by the ownership boundary or decision they explain. |
| Tables are not orphaned | Tables have enough context before and after them to explain how the reader should use the rows. |
| Examples name their limits | Demo code states what production still needs: state, policy, tracing, evals, approval, deployment, or framework integration. |
| Terminology is stable | State, policy, memory, tools, traces, evals, workflows, and approvals mean the same thing across chapters. |

## Verification Commands

Run these from the repository root:

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

Expected evidence:

| Command | What It Proves |
| --- | --- |
| `npm test` | Deterministic pattern examples, labs, capstones, and protocol examples still run. |
| `npm run typecheck` | TypeScript examples and shared contracts still compile. |
| `npm run native-examples:validate` | Native framework example files are syntactically valid and required assets exist. |
| `npm run native-examples:smoke:langgraph` | LangGraph native slices install optional dependencies and execute without provider keys. |
| `npm run book:manifest:test` | Sidebar, PDF manifest, chapter ownership, and generated chapter registration are valid. |
| `npm run book:build` | VitePress authoring build, diagrams, generated pages, and downloads are valid. |
| `npm run site:build` | Astro reader site builds with synced public assets and search index. |
| `npm run site:parity` | Published routes and internal links match the book manifest. |
| `npm run book:pdf` | The downloadable PDF and deploy copy can be regenerated. |

## Visual QA

Inspect these pages in the built site before release:

1. `/book/intro/`
2. `/book/publishing/how-to-read/`
3. `/book/pattern-selection/choosing-the-right-pattern/`
4. `/book/agent-engineering-practice/cross-framework-decision-matrix/`
5. `/book/hands-on-labs/`
6. `/book/hands-on-labs/from-scratch-mini-framework/`
7. `/book/capstone-projects/`
8. `/book/systems-architecture/reference-architecture/`
9. `/book/publishing/release-notes/`

Check that diagrams render, headings fit, code blocks are readable, tables do not feel unexplained, and navigation keeps the reader oriented.

## Release Decision

Do not publish if any of these are true:

- A required command fails.
- A core reader path contains a broken link or missing image.
- A lab points to source code that no longer exists.
- A capstone claims native framework coverage that has no matching example or clear scope.
- The PDF is stale relative to the site content.
- Release notes do not say what changed and how it was verified.

Publish only when the release evidence is stronger than the claim made to readers.
