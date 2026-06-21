# Release Notes Policy

Release notes must be evidence-backed. A release note may say that a feature shipped only when the evidence record includes a version, owner, shipped changes, verification commands, and artifact links.

## Required Evidence

- `version`: release version or dated release label.
- `owner`: person, role, or team accountable for the release.
- `changes`: shipped reader-facing changes.
- `verification`: commands or checks that passed.
- `artifacts`: links or paths to published artifacts.

## Style Rules

- Use direct, technical language.
- Name known limits instead of hiding them.
- Keep each bullet tied to evidence.
- Do not say "production-ready" unless release gates passed.

## Refusal Rules

Return `needs_evidence` when required evidence is missing. Return `blocked` when evidence says release gates failed.
