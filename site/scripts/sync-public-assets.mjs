import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(siteRoot, '..');
const source = path.join(repoRoot, 'book', 'docs', 'public');
const target = path.join(siteRoot, 'public');

await fs.rm(target, { recursive: true, force: true });
await fs.cp(source, target, { recursive: true });

console.log(`Synced book public assets to ${path.relative(repoRoot, target)}.`);
