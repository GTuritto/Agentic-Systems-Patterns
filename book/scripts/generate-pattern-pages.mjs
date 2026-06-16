import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { patterns } from './pattern-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(bookRoot, '..');
const docsRoot = path.join(bookRoot, 'docs');
const downloadsRoot = path.join(docsRoot, 'public', 'downloads');
const githubRoot = 'https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main';
const rawGithubRoot = 'https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main';
const excerptLineLimit = 90;
const excerptCharLimit = 9000;

const sectionAliases = {
  intent: ['Intent'],
  useWhen: ['Use When'],
  avoidWhen: ['Avoid When'],
  architecture: ['Architecture', 'Core Flow', 'What A2A Adds'],
  implementationNotes: ['Implementation Notes'],
  failureModes: ['Failure Modes'],
  relatedPatterns: ['Related Patterns']
};

function normalizeHeading(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function stripFirstTitle(markdown) {
  return markdown.replace(/^# .+\n+/, '').trim();
}

async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return '';
    throw error;
  }
}

function parseSections(markdown) {
  const sections = new Map();
  const lines = markdown.split('\n');
  let current = null;
  let buffer = [];

  function flush() {
    if (!current) return;
    const text = buffer.join('\n').trim();
    if (text) sections.set(normalizeHeading(current), text);
  }

  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*$/);
    if (match) {
      flush();
      current = match[1];
      buffer = [];
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();

  return sections;
}

function sectionFromReadme(sections, aliases) {
  for (const alias of aliases) {
    const value = sections.get(normalizeHeading(alias));
    if (value) return value;
  }
  return '';
}

function rewriteSourceLinks(markdown, sourceFolder) {
  return markdown.replace(/\]\(([^)]+)\)/g, (match, target) => {
    if (/^(https?:\/\/|mailto:|#|\/)/.test(target)) return match;

    const [targetPath, hash = ''] = target.split('#');
    const normalized = path.posix
      .normalize(path.posix.join(sourceFolder, targetPath))
      .replace(/^\.\//, '');
    const suffix = hash ? `#${hash}` : '';
    return `](${rawGithubRoot}/${normalized}${suffix})`;
  });
}

function listMarkdown(items) {
  return items.map(item => `- ${item}`).join('\n');
}

function sectionBlock(title, content) {
  if (!content) return '';
  return `## ${title}\n\n${content.trim()}\n`;
}

function languageFor(filePath) {
  if (filePath.endsWith('.ts')) return 'ts';
  if (filePath.endsWith('.py')) return 'py';
  if (filePath.endsWith('.json')) return 'json';
  if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) return 'js';
  if (filePath.endsWith('.md')) return 'md';
  return 'text';
}

function escapeFence(text) {
  return text.replaceAll('```', '``\u200b`');
}

async function discoverCodeFiles(sourceFolder) {
  const root = path.join(repoRoot, sourceFolder);
  const candidates = [];

  async function walk(dir) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (/\.(ts|py|js|mjs|json)$/.test(entry.name)) {
        candidates.push(path.relative(repoRoot, fullPath));
      }
    }
  }

  await walk(root);
  return candidates.slice(0, 3);
}

async function codeExcerpt(relativeFile) {
  const fullPath = path.join(repoRoot, relativeFile);
  const raw = await readTextIfExists(fullPath);
  if (!raw) return '';

  const lines = raw.split('\n');
  let excerpt = lines.slice(0, excerptLineLimit).join('\n');
  let truncated = lines.length > excerptLineLimit;

  if (excerpt.length > excerptCharLimit) {
    excerpt = excerpt.slice(0, excerptCharLimit);
    truncated = true;
  }

  const sourceUrl = `${rawGithubRoot}/${relativeFile}`;
  const note = truncated
    ? '\n\n_Excerpt truncated for readability. Download the bundle or open the source file for the complete implementation._'
    : '';

  return [
    `### \`${relativeFile}\``,
    '',
    `[Open full source](${sourceUrl})`,
    '',
    `\`\`\`${languageFor(relativeFile)}`,
    escapeFence(excerpt.trimEnd()),
    '```',
    note
  ].join('\n');
}

async function sourceCodeBlock(pattern) {
  const configured = pattern.codeFiles ?? [];
  const files = configured.length > 0 ? configured : await discoverCodeFiles(pattern.sourceFolder);
  const existing = [];

  for (const file of files) {
    const fullPath = path.join(repoRoot, file);
    try {
      const stat = await fs.stat(fullPath);
      if (stat.isFile()) existing.push(file);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  if (existing.length === 0) {
    return [
      '## Source Code',
      '',
      'This pattern currently has no dedicated code excerpt. Use the source and download links below for the full pattern folder.',
      ''
    ].join('\n');
  }

  const excerpts = [];
  for (const file of existing.slice(0, 3)) {
    excerpts.push(await codeExcerpt(file));
  }

  return [
    '## Source Code',
    '',
    'These excerpts show the implementation shape. The complete code is available in the download bundle and repository source.',
    '',
    excerpts.join('\n\n')
  ].join('\n');
}

function commandBlock(commands) {
  if (!commands?.length) return '';
  return [
    '## Run the Example',
    '',
    '```sh',
    commands.join('\n'),
    '```',
    ''
  ].join('\n');
}

function downloadBlock(pattern) {
  const bundlePath = `/downloads/${pattern.bundleName}.zip`;
  return [
    '## Download',
    '',
    `- [Download source bundle](${bundlePath})`,
    `- [Open source folder](${githubRoot}/${pattern.sourceFolder})`,
    '',
    `The download bundle contains the current \`${pattern.sourceFolder}/\` folder from this repository.`,
    ''
  ].join('\n');
}

function quickLinks(pattern) {
  return [
    '> Source and downloads',
    '>',
    `> - [Repository source](${githubRoot}/${pattern.sourceFolder})`,
    `> - [Download code bundle](/downloads/${pattern.bundleName}.zip)`
  ].join('\n');
}

async function renderPattern(pattern) {
  const readmePath = path.join(repoRoot, pattern.sourceFolder, 'README.md');
  const rawReadme = stripFirstTitle(stripFrontmatter(await readTextIfExists(readmePath)));
  const sections = parseSections(rawReadme);

  const fromReadme = aliases => {
    const value = sectionFromReadme(sections, aliases);
    return value ? rewriteSourceLinks(value, pattern.sourceFolder) : '';
  };

  const intent = fromReadme(sectionAliases.intent) || pattern.summary;
  const useWhen = fromReadme(sectionAliases.useWhen) || listMarkdown(pattern.useWhen ?? []);
  const avoidWhen = fromReadme(sectionAliases.avoidWhen) || listMarkdown(pattern.avoidWhen ?? []);
  const architecture = fromReadme(sectionAliases.architecture);
  const implementationNotes =
    fromReadme(sectionAliases.implementationNotes) ||
    listMarkdown([
      'Keep the pattern boundary explicit: inputs, state, side effects, and outputs should be visible.',
      'Validate model-produced decisions before they affect tools, users, or durable state.',
      'Emit enough trace data to debug failures after the run.'
    ]);
  const failureModes =
    fromReadme(sectionAliases.failureModes) ||
    listMarkdown([
      'The pattern is applied where a simpler deterministic workflow would be better.',
      'State, tool calls, or model decisions are not observable enough to debug.',
      'The system lacks clear stop, retry, or escalation behavior.'
    ]);
  const related = fromReadme(sectionAliases.relatedPatterns);

  const blocks = [
    `# ${pattern.title}`,
    '',
    pattern.summary,
    '',
    quickLinks(pattern),
    '',
    sectionBlock('Intent', intent),
    sectionBlock('Use When', useWhen),
    sectionBlock('Avoid When', avoidWhen),
    sectionBlock('Architecture', architecture),
    sectionBlock('Implementation Notes', implementationNotes),
    sectionBlock('Failure Modes', failureModes),
    commandBlock(pattern.commands),
    '## Code Walkthrough',
    '',
    'Read the excerpt as the smallest executable expression of the pattern. The surrounding chapter explains the design constraints; the code shows where those constraints become concrete interfaces, state, validation, or control flow.',
    '',
    await sourceCodeBlock(pattern),
    '',
    downloadBlock(pattern),
    sectionBlock('Related Patterns', related)
  ];

  const frontmatter = `---\ntitle: ${pattern.title}\n---`;
  const body = blocks.filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n').trimEnd();
  return `${frontmatter}\n\n${body}\n`;
}

function runZip(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn('zip', args, { cwd, stdio: 'ignore' });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`zip exited with code ${code}`));
    });
  });
}

async function createBundle(pattern) {
  const sourcePath = path.join(repoRoot, pattern.sourceFolder);
  const stat = await fs.stat(sourcePath).catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (!stat?.isDirectory()) return false;

  const outputPath = path.join(downloadsRoot, `${pattern.bundleName}.zip`);
  await fs.rm(outputPath, { force: true });
  await runZip(
    [
      '-qr',
      outputPath,
      pattern.sourceFolder,
      '-x',
      '*/node_modules/*',
      '*/.DS_Store',
      '*/.git/*',
      '*/dist/*',
      '*/build/*'
    ],
    repoRoot
  );
  return true;
}

async function main() {
  await fs.mkdir(downloadsRoot, { recursive: true });

  for (const pattern of patterns) {
    const chapter = await renderPattern(pattern);
    const chapterPath = path.join(docsRoot, pattern.chapterPath);
    await fs.mkdir(path.dirname(chapterPath), { recursive: true });
    await fs.writeFile(chapterPath, chapter, 'utf8');
    await createBundle(pattern);
  }

  console.log(`Generated ${patterns.length} expanded pattern chapters.`);
  console.log(`Generated source bundles in ${downloadsRoot}.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
