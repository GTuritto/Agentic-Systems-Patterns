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
  systemShape: ['System Shape'],
  coreProtocol: ['Core Protocol', 'Core Loop'],
  implementationNotes: ['Implementation Notes'],
  failureModes: ['Failure Modes'],
  evaluationStrategy: ['Evaluation Strategy', 'Evaluation'],
  productionChecklist: ['Production Checklist', 'Production Readiness Checklist'],
  relatedPatterns: ['Related Patterns']
};

const categoryProfiles = {
  foundations: {
    stateOwner: 'the caller or a small application service owns task state until a runtime pattern is introduced',
    boundary:
      'a narrow agent function, class, or service boundary accepts input plus context and returns a typed answer, action, or decision',
    protocol: [
      'Accept a bounded input, goal, or task request.',
      'Assemble the minimum useful instructions, context, state, and tool descriptions.',
      'Run the model or deterministic helper behind a typed boundary.',
      'Validate the result before returning it to users, tools, or durable state.',
      'Record enough evidence to explain the output later.'
    ],
    evaluation: [
      'Use golden tasks that cover normal requests, ambiguous requests, missing context, and invalid input.',
      'Check that outputs match the expected shape and that unsafe or unsupported requests are rejected.',
      'Track accuracy, schema validity, latency, token use, and refusal quality.'
    ],
    checklist: [
      'Define the input, context, output, and error contract.',
      'Keep prompts, schemas, and tool descriptions versioned.',
      'Add deterministic tests for the smallest useful behavior.',
      'Log model decisions without leaking secrets or private user data.'
    ]
  },
  'control-loops': {
    stateOwner: 'the loop controller owns progress, budgets, stop conditions, and recovery state',
    boundary:
      'a controller repeatedly chooses the next step, executes it, observes the result, and decides whether to continue',
    protocol: [
      'Initialize goal state, constraints, budgets, and stop conditions.',
      'Choose the next action from the current state instead of assuming the whole path upfront.',
      'Execute the action through a validated tool, worker, or local function.',
      'Observe the result and update state with evidence, errors, and remaining work.',
      'Stop, retry, re-plan, or escalate according to explicit policy.'
    ],
    evaluation: [
      'Test success cases, partial failure, repeated failure, budget exhaustion, and bad intermediate observations.',
      'Assert that the loop stops for the right reason and does not hide failed steps.',
      'Measure completion rate, number of iterations, recovery quality, cost, and latency.'
    ],
    checklist: [
      'Set hard iteration, cost, and time limits.',
      'Persist state after meaningful steps if the run can be interrupted.',
      'Make retries idempotent or add compensation.',
      'Expose trace events for each decision, action, observation, and stop reason.'
    ]
  },
  'memory-knowledge': {
    stateOwner: 'the memory or retrieval layer owns long-lived knowledge, while the agent owns task-local working state',
    boundary:
      'a retrieval or memory boundary decides what information enters context and what new information can be stored',
    protocol: [
      'Classify the information need: working state, episodic memory, semantic knowledge, policy, or source evidence.',
      'Retrieve only scoped, relevant, and permitted material.',
      'Inject retrieved material with source labels, freshness, and trust level.',
      'Generate or act while keeping retrieved evidence separate from instructions.',
      'Write back memory only after validation, consent, retention, and correction rules pass.'
    ],
    evaluation: [
      'Use questions with known source answers, stale sources, conflicting sources, and missing evidence.',
      'Measure recall, precision, citation faithfulness, freshness, and refusal when evidence is absent.',
      'Test deletion, correction, and privacy boundaries separately from answer quality.'
    ],
    checklist: [
      'Define retention, deletion, correction, and consent rules.',
      'Separate instructions from retrieved facts and user memories.',
      'Record source IDs and retrieval scores for audit and debugging.',
      'Add guards against prompt injection from retrieved documents.'
    ]
  },
  'tools-skills-protocols': {
    stateOwner: 'the protocol or capability boundary owns schemas, permissions, invocation records, and response validation',
    boundary:
      'the agent discovers or selects a capability, submits a typed request, and receives a typed result across a policy boundary',
    protocol: [
      'Discover the capability, schema, permissions, and operating constraints.',
      'Prepare a typed request from the current goal and state.',
      'Authorize the request before invocation.',
      'Invoke the tool, skill, or remote agent and validate the result.',
      'Return structured output, refusal, progress, or error without losing correlation IDs.'
    ],
    evaluation: [
      'Test valid calls, invalid arguments, unauthorized calls, timeouts, refusals, and malformed responses.',
      'Assert that dangerous actions require approval or are blocked before execution.',
      'Measure tool-selection accuracy, schema validity, authorization failures, and recovery behavior.'
    ],
    checklist: [
      'Use typed schemas for inputs and outputs.',
      'Separate model intent from actual execution permissions.',
      'Add timeouts, retries, idempotency keys, and audit records.',
      'Treat refusal and cancellation as first-class outcomes.'
    ]
  },
  'multi-agent-systems': {
    stateOwner: 'the coordinator owns the shared goal, decomposition, assignments, merge policy, and final acceptance',
    boundary:
      'a coordinator delegates bounded work to agents with narrow roles, then evaluates and merges their outputs',
    protocol: [
      'Define the shared goal, worker roles, expected outputs, and acceptance criteria.',
      'Split work only where independent or specialist execution adds value.',
      'Dispatch tasks with scoped context and permissions.',
      'Collect outputs, errors, refusals, and evidence from each worker.',
      'Merge results through an explicit judge, reducer, supervisor, or human review gate.'
    ],
    evaluation: [
      'Compare multi-agent output against a single-agent baseline on the same tasks.',
      'Test worker disagreement, worker failure, duplicated work, and bad merge decisions.',
      'Measure quality lift, latency cost, token cost, merge accuracy, and accountability.'
    ],
    checklist: [
      'Give every worker a narrow contract and permission set.',
      'Make the merge policy explicit before workers run.',
      'Log per-worker inputs, outputs, and decision evidence.',
      'Keep one owner for final acceptance and escalation.'
    ]
  },
  'production-runtime': {
    stateOwner: 'the runtime owns durable state, retries, traces, triggers, deployment configuration, and operational controls',
    boundary:
      'a production service or framework hosts the agent behind durable workflow, policy, observability, and deployment boundaries',
    protocol: [
      'Receive a user request, event, schedule, or workflow step with an idempotency key.',
      'Load durable state, policy context, memory, and runtime configuration.',
      'Execute one bounded step through the agent, tool, or workflow engine.',
      'Checkpoint result, trace data, cost, and error state.',
      'Retry, compensate, continue, or escalate according to operational policy.'
    ],
    evaluation: [
      'Replay production-like traces through regression evals before deployment.',
      'Test retries, duplicate events, partial outages, policy denial, and human approval waits.',
      'Measure reliability, recovery time, cost, latency, user impact, and eval regression rate.'
    ],
    checklist: [
      'Use durable checkpoints for long-running or externally visible work.',
      'Add structured traces, metrics, cost tracking, and replay data.',
      'Define deployment rollback and feature-flag strategy.',
      'Document operational ownership, alerts, and escalation paths.'
    ]
  }
};

const architectureDiagrams = {
  'agent-loop': {
    alt: 'Agent loop architecture',
    file: 'agent-loop.svg'
  },
  'goals-and-state': {
    alt: 'Goals, state, and working memory architecture',
    file: 'goals-state-working-memory.svg'
  },
  'tool-use': {
    alt: 'Tool use policy boundary',
    file: 'tool-use-policy-boundary.svg'
  },
  'working-memory': {
    alt: 'Goals, state, and working memory architecture',
    file: 'goals-state-working-memory.svg'
  },
  'structured-output': {
    alt: 'Structured output validation architecture',
    file: 'structured-output-validation.svg'
  },
  'context-engineering': {
    alt: 'Context assembly pipeline',
    file: 'context-assembly-pipeline.svg'
  },
  'semantic-recall-rag': {
    alt: 'RAG evidence pipeline',
    file: 'rag-evidence-pipeline.svg'
  },
  'evaluator-optimizer': {
    alt: 'Evaluator-optimizer loop architecture',
    file: 'evaluator-optimizer-loop.svg'
  },
  'a2a-agent-interoperability': {
    alt: 'A2A agent interoperability architecture',
    file: 'a2a-agent-interoperability.svg'
  },
  'human-approval-gates': {
    alt: 'Human approval gate',
    file: 'human-approval-gate.svg'
  },
  'mcp-first-tool-use': {
    alt: 'MCP-first tool use architecture',
    file: 'mcp-first-tool-use.svg'
  },
  skills: {
    alt: 'Skills packaging architecture',
    file: 'skills-packaging.svg'
  },
  'supervisor-worker': {
    alt: 'Supervisor worker architecture',
    file: 'supervisor-worker.svg'
  },
  'crewai-flows-and-crews': {
    alt: 'CrewAI flows and crews architecture',
    file: 'crewai-flows-crews.svg'
  },
  'durable-workflows': {
    alt: 'Durable workflow architecture',
    file: 'durable-workflow.svg'
  },
  'observability-and-evals': {
    alt: 'Observability and evals architecture',
    file: 'observability-evals.svg'
  },
  'mastra-runtime': {
    alt: 'Mastra runtime architecture',
    file: 'mastra-runtime.svg'
  }
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

function orderedListMarkdown(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

function sectionBlock(title, content) {
  if (!content) return '';
  return `## ${title}\n\n${content.trim()}\n`;
}

function categoryFor(pattern) {
  return pattern.chapterPath.split('/')[0];
}

function profileFor(pattern) {
  return categoryProfiles[categoryFor(pattern)] ?? categoryProfiles.foundations;
}

function pageLink(pattern) {
  return `/${pattern.chapterPath.replace(/\.md$/, '')}`;
}

function generatedSystemShape(pattern) {
  const profile = profileFor(pattern);
  const lines = [
    `**Pattern boundary:** ${profile.boundary}.`,
    `**State owner:** ${profile.stateOwner}.`,
    `**Primary artifact:** \`${pattern.sourceFolder}/\` contains the runnable reference implementation and examples.`,
    `**Operational promise:** ${pattern.summary}`
  ];

  if (pattern.commands?.length) {
    lines.push(`**Runnable path:** start with \`${pattern.commands[0]}\` before adapting the pattern to a larger system.`);
  }

  return listMarkdown(lines);
}

function diagramArchitecture(pattern) {
  const diagram = architectureDiagrams[pattern.bundleName];
  if (!diagram) return '';
  return `![${diagram.alt}](../public/diagrams/${diagram.file})`;
}

function generatedCoreProtocol(pattern) {
  return orderedListMarkdown(profileFor(pattern).protocol);
}

function generatedEvaluationStrategy(pattern) {
  const profile = profileFor(pattern);
  const items = [
    ...profile.evaluation,
    `Include cases that prove each "Use When" condition is true for this pattern.`,
    `Include negative cases from "Avoid When" so the system chooses a simpler or safer pattern when appropriate.`
  ];

  return listMarkdown(items);
}

function generatedProductionChecklist(pattern) {
  const profile = profileFor(pattern);
  const items = [
    ...profile.checklist,
    'Define human escalation for ambiguous, high-risk, or policy-blocked work.',
    'Keep the source bundle, generated chapter, tests, and deployment artifact in the same release.'
  ];

  return listMarkdown(items);
}

function generatedRelatedPatterns(pattern) {
  const category = categoryFor(pattern);
  const sameCategory = patterns
    .filter(candidate => candidate !== pattern && categoryFor(candidate) === category)
    .slice(0, 3)
    .map(candidate => `[${candidate.title}](${pageLink(candidate)})`);

  const crossCuts = [
    '[Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)',
    '[Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)',
    '[Observability and Evals](/production-runtime/observability-and-evals)'
  ];

  const links = [...sameCategory, ...crossCuts].slice(0, 5);
  return listMarkdown(links);
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
  const architecture = diagramArchitecture(pattern) || fromReadme(sectionAliases.architecture);
  const systemShape = fromReadme(sectionAliases.systemShape) || generatedSystemShape(pattern);
  const coreProtocol = fromReadme(sectionAliases.coreProtocol) || generatedCoreProtocol(pattern);
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
  const evaluationStrategy =
    fromReadme(sectionAliases.evaluationStrategy) || generatedEvaluationStrategy(pattern);
  const productionChecklist =
    fromReadme(sectionAliases.productionChecklist) || generatedProductionChecklist(pattern);
  const related = fromReadme(sectionAliases.relatedPatterns) || generatedRelatedPatterns(pattern);

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
    sectionBlock('System Shape', systemShape),
    sectionBlock('Core Protocol', coreProtocol),
    sectionBlock('Implementation Notes', implementationNotes),
    sectionBlock('Failure Modes', failureModes),
    sectionBlock('Evaluation Strategy', evaluationStrategy),
    sectionBlock('Production Checklist', productionChecklist),
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
