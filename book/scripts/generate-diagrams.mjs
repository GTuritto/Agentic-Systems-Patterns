import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const diagramsRoot = path.join(bookRoot, 'diagrams');
const outputRoot = path.join(bookRoot, 'docs', 'public', 'diagrams');

function commandExists(command) {
  const result = spawnSync('sh', ['-c', `command -v ${command}`], { stdio: 'ignore' });
  return result.status === 0;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function listDrawioFiles() {
  let entries = [];
  try {
    entries = await fs.readdir(diagramsRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.drawio'))
    .map(entry => entry.name)
    .sort();
}

async function main() {
  const files = await listDrawioFiles();
  await fs.mkdir(outputRoot, { recursive: true });

  if (files.length === 0) {
    console.log('No draw.io diagrams found.');
    return;
  }

  const hasDrawio = commandExists('drawio');

  for (const file of files) {
    const input = path.join(diagramsRoot, file);
    const outputName = file.replace(/\.drawio$/, '.svg');
    const output = path.join(outputRoot, outputName);

    if (hasDrawio) {
      await run('drawio', ['-x', '-f', 'svg', '-t', '-o', output, input]);
      console.log(`Exported ${outputName}`);
      continue;
    }

    await fs.access(output);
    console.log(`Using committed SVG export for ${outputName}`);
  }

  if (!hasDrawio) {
    console.log('drawio CLI was not found; committed SVG exports were validated instead.');
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
