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
const edition = '2026-06-16';
const siteUrl = 'https://gturitto.github.io/Agentic-Systems-Patterns/';
const pdfUrl = `${siteUrl}releases/${pdfName}`;
const repoUrl = 'https://github.com/GTuritto/Agentic-Systems-Patterns';

const chapters = [
  ['Introduction', 'intro.md'],
  ['Publishing / How To Read This Book', 'publishing/how-to-read.md'],
  ['Publishing / Publishing and Releases', 'publishing/publishing-and-releases.md'],
  ['Foundations / Single Agent', 'foundations/single-agent.md'],
  ['Foundations / Agent Loop', 'foundations/agent-loop.md'],
  ['Foundations / Goals and State', 'foundations/goals-and-state.md'],
  ['Foundations / Tool Use', 'foundations/tool-use.md'],
  ['Foundations / Structured Output', 'foundations/structured-output.md'],
  ['Foundations / Context Engineering', 'foundations/context-engineering.md'],
  ['Pattern Selection / Choosing the Right Pattern', 'pattern-selection/choosing-the-right-pattern.md'],
  ['Pattern Selection / Prompt Chaining and Gates', 'pattern-selection/prompt-chaining-and-gates.md'],
  ['Pattern Selection / Routing and Handoffs', 'pattern-selection/routing-and-handoffs.md'],
  ['Pattern Selection / Resource-Aware Agent Design', 'pattern-selection/resource-aware-agent-design.md'],
  ['Pattern Selection / Circuit Breakers, Fallbacks, and Replay', 'pattern-selection/circuit-breakers-fallbacks-replay.md'],
  ['Pattern Selection / Source Map', 'pattern-selection/source-map.md'],
  ['Agent Engineering Practice / Agent Development Lifecycle', 'agent-engineering-practice/agent-development-lifecycle.md'],
  ['Agent Engineering Practice / Agent Engineer Toolkit', 'agent-engineering-practice/agent-engineer-toolkit.md'],
  ['Agent Engineering Practice / Framework Selection', 'agent-engineering-practice/framework-selection.md'],
  ['Agent Engineering Practice / Evaluation-Driven Agent Development', 'agent-engineering-practice/evaluation-driven-agent-development.md'],
  ['Agent Engineering Practice / Agent Security and Sandboxing', 'agent-engineering-practice/agent-security-and-sandboxing.md'],
  ['Agent Engineering Practice / Agent UX and Human Trust', 'agent-engineering-practice/agent-ux-and-human-trust.md'],
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
  ['Systems Architecture / Computer-Use Agents', 'systems-architecture/computer-use-agents.md'],
  ['Systems Architecture / Domain Agent Architectures', 'systems-architecture/domain-agent-architectures.md'],
  ['Systems Architecture / Architecture Decision Records', 'systems-architecture/architecture-decision-records.md'],
  ['Systems Architecture / Reference Architecture', 'systems-architecture/reference-architecture.md'],
  ['Production Runtime / Durable Workflows', 'production-runtime/durable-workflows.md'],
  ['Production Runtime / Observability and Evals', 'production-runtime/observability-and-evals.md'],
  ['Production Runtime / Production Evaluation Feedback Loops', 'production-runtime/production-evaluation-feedback-loops.md'],
  ['Production Runtime / Cost Controls and Runtime Budgets', 'production-runtime/cost-controls-runtime-budgets.md'],
  ['Production Runtime / Policy Enforcement', 'production-runtime/policy-enforcement.md'],
  ['Production Runtime / Event-Triggered Agents', 'production-runtime/event-triggered-agents.md'],
  ['Production Runtime / Mastra Runtime', 'production-runtime/mastra-runtime.md'],
  ['Deprecated / Historical Patterns', 'deprecated/historical-patterns.md'],
  ['Hands-On Labs / Lab Guide', 'hands-on-labs/index.md'],
  ['Hands-On Labs / Lab 01 - Tool-Using Agent', 'hands-on-labs/lab-01-tool-using-agent.md'],
  ['Hands-On Labs / Lab 02 - Agent Loop and Planning', 'hands-on-labs/lab-02-agent-loop-and-planning.md'],
  ['Hands-On Labs / Lab 03 - Agentic RAG', 'hands-on-labs/lab-03-agentic-rag.md'],
  ['Hands-On Labs / Lab 04 - A2A Communication', 'hands-on-labs/lab-04-a2a-communication.md'],
  ['Hands-On Labs / Lab 05 - Multi-Agent Supervisor', 'hands-on-labs/lab-05-multi-agent-supervisor.md'],
  ['Hands-On Labs / Lab 06 - Observability and Evals', 'hands-on-labs/lab-06-observability-and-evals.md']
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

function chapterId(index) {
  return `chapter-${index + 1}`;
}

async function renderChapters() {
  const rendered = [];
  for (const [index, [fallbackTitle, relativePath]] of chapters.entries()) {
    const fullPath = path.join(docsRoot, relativePath);
    const raw = await fs.readFile(fullPath, 'utf8');
    const markdown = rewriteLinks(stripFrontmatter(raw).trim());
    const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? fallbackTitle;
    rendered.push(`
      <section class="chapter" id="${chapterId(index)}">
        <div class="chapter-label">${fallbackTitle}</div>
        ${md.render(markdown || `# ${title}`)}
      </section>
    `);
  }
  return rendered.join('\n');
}

function renderTableOfContents() {
  const pageSize = 46;
  const pages = [];

  for (let offset = 0; offset < chapters.length; offset += pageSize) {
    const items = chapters
      .slice(offset, offset + pageSize)
      .map(([title], index) => `<li><a href="#${chapterId(offset + index)}">${title}</a></li>`)
      .join('\n');
    const title = offset === 0 ? 'Table of Contents' : 'Table of Contents, Continued';
    pages.push(`
      <section class="toc">
        <div class="chapter-label">Front Matter</div>
        <h1>${title}</h1>
        <ol start="${offset + 1}">
          ${items}
        </ol>
      </section>
    `);
  }

  return pages.join('\n');
}

function htmlDocument(body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Agentic Systems Patterns</title>
  <style>
    :root {
      --asp-navy: #173f4f;
      --asp-blue: #245f73;
      --asp-teal: #1f8a8a;
      --asp-amber: #b7791f;
      --asp-panel: #f7fafb;
      --asp-panel-strong: #eef5f6;
      --asp-border: #d9e2e6;
      --asp-muted: #4f5b62;
      --asp-code-bg: #f3f6f7;
    }

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

    .cover-logo {
      height: auto;
      margin: 0 0 28px;
      max-width: 380px;
      width: 58%;
    }

    .cover h1 {
      color: var(--asp-navy);
      font-size: 38pt;
      line-height: 1.05;
      margin: 0 0 16px;
    }

    .cover p {
      color: var(--asp-blue);
      font-size: 14pt;
      max-width: 620px;
    }

    .cover-meta {
      color: var(--asp-muted);
      font-size: 10pt;
      line-height: 1.7;
      margin-top: 30px;
    }

    .license {
      color: var(--asp-amber);
      font-size: 9pt;
      margin-top: 42px;
    }

    .toc {
      break-before: page;
      page-break-after: always;
    }

    .toc ol {
      columns: 2;
      column-gap: 28px;
      font-size: 10.5pt;
      line-height: 1.55;
      margin-top: 18px;
      padding-left: 22px;
    }

    .toc li {
      break-inside: avoid;
      margin-bottom: 5px;
    }

    .toc h1 {
      border-bottom: 3px solid var(--asp-teal);
      padding-bottom: 8px;
    }

    .chapter {
      break-before: page;
    }

    .chapter-label {
      color: var(--asp-amber);
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    h1 {
      color: var(--asp-navy);
      font-size: 24pt;
      line-height: 1.15;
      margin: 0 0 18px;
    }

    h2 {
      color: var(--asp-blue);
      font-size: 15pt;
      margin: 24px 0 8px;
    }

    h3 {
      color: var(--asp-amber);
      font-size: 12.5pt;
      margin: 18px 0 6px;
    }

    p, li {
      orphans: 3;
      widows: 3;
    }

    a {
      color: var(--asp-teal);
      text-decoration: none;
    }

    code {
      background: var(--asp-code-bg);
      border: 1px solid var(--asp-border);
      border-radius: 3px;
      color: var(--asp-blue);
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 9.5pt;
      padding: 1px 3px;
    }

    pre {
      background: var(--asp-code-bg);
      border: 1px solid var(--asp-border);
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
      background: var(--asp-panel);
      border-left: 4px solid var(--asp-amber);
      border-radius: 0 6px 6px 0;
      color: var(--asp-muted);
      margin-left: 0;
      padding: 8px 12px;
    }

    table {
      border-collapse: collapse;
      margin: 14px 0;
      width: 100%;
    }

    th {
      background: var(--asp-panel-strong);
      color: var(--asp-navy);
      font-weight: 700;
    }

    td,
    th {
      border: 1px solid var(--asp-border);
      padding: 6px 8px;
      vertical-align: top;
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
    <img class="cover-logo" src="../docs/public/brand/agent-graph-cover.svg" alt="Agentic systems graph mark">
    <h1>Agentic Systems Patterns</h1>
    <p>A practical reference for modern agent architecture: goals, loops, tools, skills, memory, protocols, multi-agent systems, and production runtimes.</p>
    <div class="cover-meta">
      <div>Edition: ${edition}</div>
      <div>Site: ${siteUrl}</div>
      <div>PDF: ${pdfUrl}</div>
      <div>Repository: ${repoUrl}</div>
    </div>
    <div class="license">Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).</div>
  </section>
  ${renderTableOfContents()}
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
