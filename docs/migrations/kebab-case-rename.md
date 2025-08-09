# Kebab-case migration for pattern directories

This migration standardizes all pattern directory names to kebab-case for portability, predictable imports, and URL-friendly links.

## Why kebab-case

- Cross-platform friendly (no spaces or special characters)
- Cleaner Markdown links and import paths
- Easier shell and npm script usage (no quoting required)

## How to run

```bash
# Dry-run: show planned renames and file edits, write .migration-report.json
npx ts-node --esm tools/rename_patterns.ts --dry-run

# Perform rename + rewrite references + write report
npx ts-node --esm tools/rename_patterns.ts --commit

# Optional: override if a conflicting target already exists
npx ts-node --esm tools/rename_patterns.ts --commit --force
```

## What it does

- Discovers pattern directories at the repo root (names containing "Pattern").
- Converts each name to kebab-case.
- Renames with `git mv` when available (preserves history), falls back to fs rename otherwise.
- Rewrites references across the repo in: `.md`, `.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`, `.py`, `.json` (scripts only).
- Creates a `.migration-report.json` with a summary of renames and file edits.

## Undo / rollback

- If changes are uncommitted: restore the working tree.

```bash
# Undo unstaged edits and renames
git restore -SW :/

# Or reset everything since last commit
git reset --hard
```

- If already committed: view `.migration-report.json` for the list of moved paths, and revert the commit normally (e.g., `git revert` or `git reset --hard <prev>`).
