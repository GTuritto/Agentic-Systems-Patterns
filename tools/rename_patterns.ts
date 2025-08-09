#!/usr/bin/env ts-node
/**
 * Kebab-case migration tool for pattern directories.
 *
 * CLI:
 *   npx ts-node --esm tools/rename_patterns.ts [--dry-run] [--commit] [--force]
 *
 * Features:
 * - Discover root-level pattern directories (name contains "Pattern").
 * - Compute kebab-case names.
 * - Rename via `git mv` when possible, else fs.rename.
 * - Rewrite references in .md/.ts/.tsx/.js/.mjs/.cjs/.py/.json (scripts only) files.
 * - Idempotent: second run is a no-op.
 * - Writes a .migration-report.json with actions taken.
 */

import { exec as execCb } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const exec = (cmd: string, cwd?: string) => new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
  execCb(cmd, { cwd }, (error, stdout, stderr) => {
    resolve({ stdout, stderr, code: error ? (error as any).code ?? 1 : 0 });
  });
});

type Report = {
  timestamp: string;
  root: string;
  dryRun: boolean;
  force: boolean;
  renames: Array<{ from: string; to: string; method: 'git' | 'fs' | 'skip' | 'conflict' | 'noop' }>;
  fileEdits: Array<{ file: string; changes: number }>;
};

const ROOT = path.resolve(process.cwd());
const REPORT_PATH = path.join(ROOT, '.migration-report.json');

const IGNORE_DIRS = new Set(['.git', 'node_modules', '.venv', '.history', 'dist', 'build']);
const TEXT_EXTS = new Set(['.md', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.py', '.json']);

function isBinaryExtension(p: string) {
  const ext = path.extname(p).toLowerCase();
  return ext && !TEXT_EXTS.has(ext);
}

export function toKebabCaseDir(name: string): string {
  const trimmed = name.trim();
  const replaced = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return replaced;
}

export async function findPatternDirs(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const dirs: string[] = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      if (/pattern/i.test(e.name)) dirs.push(path.join(root, e.name));
    }
  }
  return dirs.sort();
}

async function dirExists(p: string) {
  try { const s = await fs.stat(p); return s.isDirectory(); } catch { return false; }
}

export async function gitMv(from: string, to: string): Promise<boolean> {
  const { code: gitOk } = await exec('git rev-parse --is-inside-work-tree');
  if (gitOk !== 0) return false;
  const { code } = await exec(`git mv ${JSON.stringify(from)} ${JSON.stringify(to)}`);
  return code === 0;
}

function urlEncodeName(name: string) {
  return encodeURIComponent(name).replace(/%2F/g, '/');
}

function folderNameVariants(name: string): string[] {
  const raw = name;
  const fully = urlEncodeName(name);
  const spacesOnly = name.replace(/ /g, '%20');
  const set = new Set([raw, fully, spacesOnly]);
  return Array.from(set);
}

function replaceAll(hay: string, needle: string, repl: string): { out: string; count: number } {
  if (!needle) return { out: hay, count: 0 };
  let count = 0;
  let out = hay;
  if (needle === repl) return { out, count: 0 };
  const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  out = out.replace(new RegExp(esc, 'g'), () => { count++; return repl; });
  return { out, count };
}

function rewriteMarkdown(content: string, renames: Record<string, string>): { content: string; changes: number } {
  let changes = 0;
  let newContent = content;
  for (const [absOld, absNew] of Object.entries(renames)) {
    const oldName = path.basename(absOld);
    const newName = path.basename(absNew);
    for (const variant of folderNameVariants(oldName)) {
      let res = replaceAll(newContent, `/${variant}/`, `/${newName}/`);
      newContent = res.out; changes += res.count;
      res = replaceAll(newContent, `./${variant}/`, `./${newName}/`);
      newContent = res.out; changes += res.count;
      res = replaceAll(newContent, `../${variant}/`, `../${newName}/`);
      newContent = res.out; changes += res.count;
    }
  }
  return { content: newContent, changes };
}

function rewriteScriptValue(cmd: string, renames: Record<string, string>): { out: string; changes: number } {
  let out = cmd;
  let changes = 0;
  for (const [absOld, absNew] of Object.entries(renames)) {
    const oldName = path.basename(absOld);
    const newName = path.basename(absNew);
    for (const variant of folderNameVariants(oldName)) {
      let res = replaceAll(out, `/${variant}/`, `/${newName}/`);
      out = res.out; changes += res.count;
      res = replaceAll(out, `./${variant}/`, `./${newName}/`);
      out = res.out; changes += res.count;
      res = replaceAll(out, `../${variant}/`, `../${newName}/`);
      out = res.out; changes += res.count;
    }
  }
  const before = out;
  out = out.replace(/"((?:\.?\.\/)?[A-Za-z0-9._\/-]+)"/g, (_m, p1: string) => {
    if (/\s/.test(p1)) return `"${p1}"`;
    return p1;
  });
  if (out !== before) changes++;
  return { out, changes };
}

function rewriteCodeStrings(content: string, renames: Record<string, string>): { content: string; changes: number } {
  let changes = 0;
  let newContent = content;
  newContent = newContent.replace(/(["'`])((?:\.\.?\/)[^"'`]+)\1/g, (m, quote: string, rel: string) => {
    let replaced = rel;
    let localChanges = 0;
    for (const [absOld, absNew] of Object.entries(renames)) {
      const oldName = path.basename(absOld);
      const newName = path.basename(absNew);
  for (const v of folderNameVariants(oldName)) {
        const r1 = replaceAll(replaced, `/${v}/`, `/${newName}/`);
        replaced = r1.out; localChanges += r1.count;
        const r2 = replaceAll(replaced, `./${v}/`, `./${newName}/`);
        replaced = r2.out; localChanges += r2.count;
        const r3 = replaceAll(replaced, `../${v}/`, `../${newName}/`);
        replaced = r3.out; localChanges += r3.count;
      }
    }
    if (localChanges > 0) {
      changes += localChanges;
      return `${quote}${replaced}${quote}`;
    }
    return m;
  });
  return { content: newContent, changes };
}

export function rewriteFileRefs(filePath: string, content: string, renames: Record<string, string>): { changed: boolean; newContent: string; changes: number } {
  const ext = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTS.has(ext)) return { changed: false, newContent: content, changes: 0 };
  if (ext === '.md') {
    const { content: c, changes } = rewriteMarkdown(content, renames);
    return { changed: changes > 0, newContent: c, changes };
  }
  if (ext === '.json' && path.basename(filePath) === 'package.json') {
    try {
      const pkg = JSON.parse(content);
      if (pkg && pkg.scripts && typeof pkg.scripts === 'object') {
        let edited = 0;
        for (const k of Object.keys(pkg.scripts)) {
          const val = String(pkg.scripts[k]);
          const { out, changes } = rewriteScriptValue(val, renames);
          if (changes > 0) {
            pkg.scripts[k] = out;
            edited += changes;
          }
        }
        if (edited > 0) {
          const newContent = JSON.stringify(pkg, null, 2) + '\n';
          return { changed: true, newContent, changes: edited };
        }
      }
    } catch {
      // leave as-is
    }
  }
  const { content: c2, changes } = rewriteCodeStrings(content, renames);
  return { changed: changes > 0, newContent: c2, changes };
}

async function readTextFile(p: string): Promise<string> { return fs.readFile(p, 'utf8'); }
async function writeTextFile(p: string, content: string) { await fs.writeFile(p, content, 'utf8'); }

async function walkFiles(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walkFiles(full, acc);
    } else if (e.isFile()) {
      acc.push(full);
    }
  }
  return acc;
}

async function dirsIdentical(a: string, b: string): Promise<boolean> {
  try {
    const aEntries = await fs.readdir(a);
    const bEntries = await fs.readdir(b);
    if (aEntries.length !== bEntries.length) return false;
    aEntries.sort(); bEntries.sort();
    for (let i = 0; i < aEntries.length; i++) if (aEntries[i] !== bEntries[i]) return false;
    return true;
  } catch { return false; }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const doCommit = args.has('--commit');
  const force = args.has('--force');
  if (!dryRun && !doCommit) {
    console.log('Usage: npx ts-node --esm tools/rename_patterns.ts [--dry-run] [--commit] [--force]');
    process.exit(0);
  }

  const report: Report = { timestamp: new Date().toISOString(), root: ROOT, dryRun, force, renames: [], fileEdits: [] };

  const patternDirs = await findPatternDirs(ROOT);
  if (patternDirs.length === 0) {
    console.log('No pattern directories found. Nothing to do.');
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
    return;
  }

  const renameMapAbs: Record<string, string> = {};
  for (const absPath of patternDirs) {
    const base = path.basename(absPath);
    const kebab = toKebabCaseDir(base);
    const target = path.join(ROOT, kebab);
    if (kebab === base) {
      report.renames.push({ from: absPath, to: target, method: 'noop' });
      continue;
    }
    renameMapAbs[absPath] = target;
  }

  const plannedRenames = Object.entries(renameMapAbs);
  console.log(`Planned directory renames: ${plannedRenames.length}`);
  plannedRenames.forEach(([from, to]) => console.log(` - ${path.basename(from)} -> ${path.basename(to)}`));

  const allFiles = await walkFiles(ROOT);
  let totalEdits = 0;
  for (const file of allFiles) {
    if (isBinaryExtension(file)) continue;
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXTS.has(ext)) continue;
    const content = await readTextFile(file);
    const { changed, newContent, changes } = rewriteFileRefs(file, content, renameMapAbs);
    if (changed) {
      totalEdits += 1;
      report.fileEdits.push({ file: path.relative(ROOT, file), changes });
      if (!dryRun) await writeTextFile(file, newContent);
    }
  }
  console.log(`Planned/Applied file edits: ${totalEdits}`);

  let renameCount = 0;
  for (const [from, to] of plannedRenames) {
    const toExists = await dirExists(to);
    if (toExists) {
      const same = await dirsIdentical(from, to).catch(() => false);
      if (same) { report.renames.push({ from, to, method: 'skip' }); continue; }
      if (!force) { console.error(`Conflict: target exists: ${to}. Use --force to override.`); report.renames.push({ from, to, method: 'conflict' }); continue; }
    }
    if (!dryRun) {
      const ok = await gitMv(from, to);
      if (ok) report.renames.push({ from, to, method: 'git' });
      else { await fs.rename(from, to); report.renames.push({ from, to, method: 'fs' }); }
      renameCount++;
    } else {
      report.renames.push({ from, to, method: 'git' });
    }
  }
  console.log(`${dryRun ? 'Would rename' : 'Renamed'} ${renameCount} directories.`);

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`Report written to ${REPORT_PATH}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href || process.argv[1].endsWith('rename_patterns.ts')) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
