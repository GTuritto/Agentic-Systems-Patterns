import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(bookRoot, 'docs');
const releasesRoot = path.join(bookRoot, 'releases');
const publicReleasesRoot = path.join(docsRoot, 'public', 'releases');
const pdfName = 'Agentic-Systems-Patterns.pdf';

const chapters = [
  ['Introduction', 'intro.md'],
  ['Foundations / Single Agent', 'foundations/single-agent.md'],
  ['Foundations / Agent Loop', 'foundations/agent-loop.md'],
  ['Foundations / Goals and State', 'foundations/goals-and-state.md'],
  ['Foundations / Tool Use', 'foundations/tool-use.md'],
  ['Foundations / Structured Output', 'foundations/structured-output.md'],
  ['Foundations / Context Engineering', 'foundations/context-engineering.md'],
  ['Pattern Selection / Choosing the Right Pattern', 'pattern-selection/choosing-the-right-pattern.md'],
  ['Pattern Selection / Prompt Chaining and Gates', 'pattern-selection/prompt-chaining-and-gates.md'],
  ['Pattern Selection / Routing and Handoffs', 'pattern-selection/routing-and-handoffs.md'],
  ['Pattern Selection / Circuit Breakers, Fallbacks, and Replay', 'pattern-selection/circuit-breakers-fallbacks-replay.md'],
  ['Pattern Selection / Source Map', 'pattern-selection/source-map.md'],
  ['Control Loops / Planning and Execution', 'control-loops/planning-and-execution.md'],
  ['Control Loops / ReAct', 'control-loops/react.md'],
  ['Control Loops / Reflection', 'control-loops/reflection.md'],
  ['Control Loops / Evaluator-Optimizer', 'control-loops/evaluator-optimizer.md'],
  ['Control Loops / Self-Improvement', 'control-loops/self-improvement.md'],
  ['Control Loops / Self-Healing Workflows', 'control-loops/self-healing-workflows.md'],
  ['Memory and Knowledge / Memory-Augmented Agent', 'memory-knowledge/memory-augmented-agent.md'],
  ['Memory and Knowledge / Long-Term Episodic Memory', 'memory-knowledge/long-term-episodic-memory.md'],
  ['Memory and Knowledge / Semantic Recall and RAG', 'memory-knowledge/semantic-recall-rag.md'],
  ['Memory and Knowledge / Working Memory', 'memory-knowledge/working-memory.md'],
  ['Memory and Knowledge / Knowledge-Bound Agents', 'memory-knowledge/knowledge-bound-agents.md'],
  ['Tools, Skills, and Protocols / Skills', 'tools-skills-protocols/skills.md'],
  ['Tools, Skills, and Protocols / MCP-first Tool Use', 'tools-skills-protocols/mcp-first-tool-use.md'],
  ['Tools, Skills, and Protocols / A2A Agent Interoperability', 'tools-skills-protocols/a2a-agent-interoperability.md'],
  ['Tools, Skills, and Protocols / Secure Agent Communication', 'tools-skills-protocols/secure-agent-communication.md'],
  ['Tools, Skills, and Protocols / Human Approval Gates', 'tools-skills-protocols/human-approval-gates.md'],
  ['Multi-Agent Systems / Task Delegation', 'multi-agent-systems/task-delegation.md'],
  ['Multi-Agent Systems / Supervisor / Worker', 'multi-agent-systems/supervisor-worker.md'],
  ['Multi-Agent Systems / Debate and Consensus', 'multi-agent-systems/debate-and-consensus.md'],
  ['Multi-Agent Systems / Parallel Agents', 'multi-agent-systems/parallel-agents.md'],
  ['Multi-Agent Systems / CrewAI Flows and Crews', 'multi-agent-systems/crewai-flows-and-crews.md'],
  ['Systems Architecture / Agentic System Architecture', 'systems-architecture/agentic-system-architecture.md'],
  ['Systems Architecture / Agentic RAG Systems', 'systems-architecture/agentic-rag-systems.md'],
  ['Systems Architecture / Open Personal Agent Architectures', 'systems-architecture/open-personal-agent-architectures.md'],
  ['Systems Architecture / Coding Agents', 'systems-architecture/coding-agents.md'],
  ['Systems Architecture / Architecture Decision Records', 'systems-architecture/architecture-decision-records.md'],
  ['Systems Architecture / Reference Architecture', 'systems-architecture/reference-architecture.md'],
  ['Production Runtime / Durable Workflows', 'production-runtime/durable-workflows.md'],
  ['Production Runtime / Observability and Evals', 'production-runtime/observability-and-evals.md'],
  ['Production Runtime / Policy Enforcement', 'production-runtime/policy-enforcement.md'],
  ['Production Runtime / Event-Triggered Agents', 'production-runtime/event-triggered-agents.md'],
  ['Production Runtime / Mastra Runtime', 'production-runtime/mastra-runtime.md'],
  ['Deprecated / Historical Patterns', 'deprecated/historical-patterns.md']
];

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function rewriteLinks(markdown) {
  return markdown.replace(/\]\((?!https?:\/\/|mailto:|#)([^)]+)\)/g, (_match, target) => {
    if (target.startsWith('../public/diagrams/')) {
      return `](../docs/public/diagrams/${target.replace('../public/diagrams/', '')})`;
    }
    const cleaned = target.replace(/\.md(#.*)?$/, '$1');
    return `](${cleaned})`;
  });
}

async function renderChapters() {
  const rendered = [];
  for (const [fallbackTitle, relativePath] of chapters) {
    const fullPath = path.join(docsRoot, relativePath);
    const raw = await fs.readFile(fullPath, 'utf8');
    const markdown = rewriteLinks(stripFrontmatter(raw).trim());
    const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? fallbackTitle;
    rendered.push(`
      <section class="chapter">
        <div class="chapter-label">${fallbackTitle}</div>
        ${md.render(markdown || `# ${title}`)}
      </section>
    `);
  }
  return rendered.join('\n');
}

function htmlDocument(body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Agentic Systems Patterns</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }

    body {
      color: #202124;
      font: 11.5pt/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
    }

    .cover {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: 92vh;
      justify-content: center;
      page-break-after: always;
      text-align: center;
    }

    .cover h1 {
      font-size: 38pt;
      line-height: 1.05;
      margin: 0 0 16px;
    }

    .cover p {
      color: #4f5b62;
      font-size: 14pt;
      max-width: 620px;
    }

    .license {
      color: #66737a;
      font-size: 9pt;
      margin-top: 42px;
    }

    .chapter {
      break-before: page;
    }

    .chapter-label {
      color: #607d8b;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    h1 {
      color: #173f4f;
      font-size: 24pt;
      line-height: 1.15;
      margin: 0 0 18px;
    }

    h2 {
      color: #245f73;
      font-size: 15pt;
      margin: 24px 0 8px;
    }

    h3 {
      font-size: 12.5pt;
      margin: 18px 0 6px;
    }

    p, li {
      orphans: 3;
      widows: 3;
    }

    a {
      color: #245f73;
      text-decoration: none;
    }

    code {
      background: #f3f6f7;
      border-radius: 3px;
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 9.5pt;
      padding: 1px 3px;
    }

    pre {
      background: #f5f7f8;
      border: 1px solid #d9e2e6;
      border-radius: 6px;
      overflow-wrap: anywhere;
      padding: 10px 12px;
      white-space: pre-wrap;
    }

    pre code {
      background: transparent;
      padding: 0;
    }

    blockquote {
      border-left: 4px solid #c7d5dc;
      color: #4f5b62;
      margin-left: 0;
      padding-left: 12px;
    }

    img {
      display: block;
      height: auto;
      margin: 16px auto;
      max-width: 100%;
    }
  </style>
</head>
<body>
  <section class="cover">
    <h1>Agentic Systems Patterns</h1>
    <p>A practical reference for modern agent architecture: goals, loops, tools, skills, memory, protocols, multi-agent systems, and production runtimes.</p>
    <div class="license">Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).</div>
  </section>
  ${body}
</body>
</html>`;
}

async function main() {
  const body = await renderChapters();
  const html = htmlDocument(body);
  const htmlPath = path.join(releasesRoot, 'Agentic-Systems-Patterns.html');
  const pdfPath = path.join(releasesRoot, pdfName);
  const publicPdfPath = path.join(publicReleasesRoot, pdfName);

  await fs.mkdir(releasesRoot, { recursive: true });
  await fs.mkdir(publicReleasesRoot, { recursive: true });
  await fs.writeFile(htmlPath, html, 'utf8');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="font-size:8px;color:#78909c;width:100%;padding:0 16mm;text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' }
  });
  await browser.close();

  await fs.copyFile(pdfPath, publicPdfPath);
  console.log(`PDF written to ${pdfPath}`);
  console.log(`Deploy copy written to ${publicPdfPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
