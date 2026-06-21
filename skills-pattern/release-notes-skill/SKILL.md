# Release Notes Skill

Use this skill when the task is to prepare release notes from verified engineering evidence.

## Activation

Use this skill for release notes, changelog entries, launch summaries, or publish-ready update notes. Do not use it for product marketing copy, speculative roadmap notes, or incident reports.

## Procedure

1. Read `references/release-policy.md` before drafting.
2. Load the evidence record from the caller or from `fixtures/release-evidence.json` for the demo.
3. Render the notes with `templates/release-notes.md`.
4. Include only shipped changes, verification evidence, known limits, and artifact links.
5. Refuse or return `needs_evidence` when verification, owner, version, or artifact data is missing.

## Do Not

- Invent test results, artifact links, owners, dates, or version numbers.
- Convert unresolved risks into shipped features.
- Use promotional language.
- Hide failed or skipped verification.

## Expected Output

Return concise release notes with these sections: summary, shipped changes, verification, artifacts, known limits, and owner.
