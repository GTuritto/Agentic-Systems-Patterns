import fs from 'node:fs';

const releaseCommands = [
  'npm test',
  'npm run release:commands',
  'npm run typecheck',
  'npm run capstones:evidence',
  'npm run native-examples:validate',
  'npm run native-examples:smoke:langgraph',
  'npm run book:manifest:test',
  'npm run book:visuals:verify',
  'npm run book:build',
  'npm run site:build',
  'npm run site:parity',
  'npm run book:pdf',
  'npm run book:epub'
];

const workflowCommands = [
  'npm run release:commands',
  'npm run capstones:evidence',
  'npm run book:manifest:test',
  'npm run book:visuals:verify',
  'npm run book:pdf',
  'npm run book:epub',
  'npm run book:build',
  'npm run site:build',
  'npm run site:parity'
];

const publishingDocs = [
  'book/docs/publishing/publishing-and-releases.md',
  'book/docs/publishing/release-readiness-checklist.md',
  'book/docs/publishing/release-notes.md'
];

const releaseEvidenceRecord = 'book/docs/public/capstone-assets/templates/release-evidence-record.txt';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

const packageJson = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
for (const command of releaseCommands) {
  const scriptName = command === 'npm test' ? 'test' : command.replace('npm run ', '');
  assert(packageJson.scripts[scriptName], `package.json missing script for ${command}`);
}

for (const file of publishingDocs) {
  const text = read(file);
  for (const command of releaseCommands) {
    assert(text.includes(command), `${file} missing release command ${command}`);
  }
}

const releaseEvidence = read(releaseEvidenceRecord);
for (const command of releaseCommands) {
  assert(releaseEvidence.includes(`[ ] ${command}`), `${releaseEvidenceRecord} missing checkbox for ${command}`);
}

for (const heading of ['Command Evidence', 'GitHub Pages Evidence', 'Capstone Evidence', 'Content Evidence', 'Asset Evidence', 'Known Limitations', 'Release Decision']) {
  assert(releaseEvidence.includes(heading), `${releaseEvidenceRecord} missing section ${heading}`);
}

const workflow = read('.github/workflows/publish-book.yml');
for (const command of workflowCommands) {
  assert(workflow.includes(`run: ${command}`), `publish workflow missing ${command}`);
}

assert(workflow.indexOf('run: npm run capstones:evidence') < workflow.indexOf('run: npm run book:pdf'), 'publish workflow should check capstone evidence before PDF generation');
assert(workflow.indexOf('run: npm run release:commands') < workflow.indexOf('run: npm run capstones:evidence'), 'publish workflow should check release command parity before release gates');
assert(workflow.indexOf('run: npm run book:manifest:test') < workflow.indexOf('run: npm run book:build'), 'publish workflow should check manifest before book build');
assert(workflow.indexOf('run: npm run book:visuals:verify') < workflow.indexOf('run: npm run book:quality'), 'publish workflow should check visual coverage before book quality');
assert(workflow.indexOf('run: npm run book:pdf') < workflow.indexOf('run: npm run book:epub'), 'publish workflow should generate PDF before EPUB');
assert(workflow.indexOf('run: npm run book:epub') < workflow.indexOf('run: npm run book:build'), 'publish workflow should generate courtesy formats before site build');

console.log('Release command parity OK');
