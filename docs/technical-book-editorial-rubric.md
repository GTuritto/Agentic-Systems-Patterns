# Technical Book Editorial Rubric

Purpose: define the editorial standard for turning `Agentic Systems Patterns` into a technical book software engineers read, finish, use at work, and recommend.

## Reader Promise

The book should help a working software engineer make better architecture decisions for agentic systems. A good chapter should leave the reader with one or more usable artifacts: a mental model, decision rule, typed contract, checklist, test case, implementation sketch, or production warning they can apply immediately.

The book should not read like a glossary of agent terms. It should read like an experienced engineer explaining how to avoid expensive mistakes.

## Editorial Voice

Use direct, practical, technical prose.

- Prefer concrete nouns and verbs.
- Explain tradeoffs, not just definitions.
- Start from a real engineering problem.
- Make risk visible.
- Use examples before abstractions when the concept is new.
- Keep the model subordinate to the system boundary.
- Cut generic claims that do not change reader behavior.

Avoid:

- Hype language.
- Repeated "agentic" framing without concrete mechanism.
- Pattern names without implementation consequences.
- Long lists with no decision rule.
- Code snippets that are not tied to a design point.
- Safety advice that is only prompt-level.

## Chapter Quality Bar

Every core chapter should answer these questions:

1. What problem does this solve?
2. When should an engineer use it?
3. When should they avoid it?
4. What owns state, policy, tools, memory, and stop conditions?
5. What can go wrong?
6. How would the team test it?
7. What changes in production?
8. What artifact can the reader reuse?

## A++ Chapter Shape

For important chapters, use this structure unless the chapter has a better local reason not to:

1. Opening claim: the chapter's useful engineering point.
2. Scenario: a concrete problem that makes the pattern necessary.
3. Architecture: diagram or clear system boundary.
4. Contract: schema, interface, checklist, or decision table.
5. Implementation: minimal code or pseudo-code.
6. Production hardening: state, policy, budget, observability, retries, approvals.
7. Failure modes: specific failures, not vague warnings.
8. Evaluation: test cases, fixtures, metrics, release gates.
9. Related chapters: where the reader should go next.
10. Takeaway: one memorable design rule.

## Online Book Standard

Because the book is published on GitHub Pages, each chapter should be easy to scan and navigate.

Required online affordances:

- Short title and clear opening.
- Stable headings.
- Links to related chapters.
- Links to runnable source when applicable.
- Diagrams where architecture is the main value.
- Copyable code, schemas, and checklists.
- Reader path metadata where useful: beginner, builder, architect, production, security.

High-value additions:

- Estimated reading time.
- Estimated lab time.
- Difficulty level.
- Chapter type: concept, pattern, lab, capstone, reference.
- Downloadable templates.
- Search-friendly summary.

## Scoring Rubric

Score each chapter from 1 to 10 on these dimensions:

| Dimension | A++ Standard |
| --- | --- |
| Clarity | The reader can state the main idea after one pass. |
| Practical value | The chapter changes design, implementation, testing, or operations behavior. |
| Technical depth | It explains ownership, contracts, failure modes, and production implications. |
| Evidence | Claims are supported by examples, code, diagrams, tests, or references. |
| Specificity | Advice is concrete enough to apply or reject. |
| Flow | The chapter moves from problem to solution to production reality. |
| Reuse | The reader leaves with a checklist, contract, fixture, or implementation pattern. |
| Online UX | The chapter is scannable, linked, searchable, and easy to resume. |

Interpretation:

- 10: Engineers would bookmark, reuse, and recommend the chapter.
- 8-9: Strong and useful, but missing one major artifact or deeper example.
- 6-7: Good reference material, but not yet memorable or complete.
- 4-5: Fragmentary; needs scenario, structure, and concrete guidance.
- 1-3: Placeholder or glossary-level material.

## Revision Priorities

When improving a chapter, prefer changes in this order:

1. Add a concrete scenario.
2. Clarify the ownership boundary.
3. Add a contract, schema, or checklist.
4. Add failure modes and production risks.
5. Add evaluation cases.
6. Add diagram or trace where architecture matters.
7. Tighten prose and remove generic repetition.
8. Improve links and online navigation.

## Editor's Definition Of Value

A valuable chapter saves the reader from a real mistake or helps them build a better system faster.

The best chapters in this book should make engineers say:

- "This is the decision I need to make."
- "This is the boundary I need to enforce."
- "This is the test I forgot to write."
- "This is why my current design is risky."
- "This gives me a reusable artifact for my team."
