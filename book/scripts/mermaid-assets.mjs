import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(bookRoot, 'docs');
const diagramsRoot = path.join(docsRoot, 'public', 'diagrams');
const generatedMermaidRoot = path.join(diagramsRoot, 'generated-mermaid');
const generatedDrawioRoot = path.join(bookRoot, 'diagrams', 'generated-mermaid');

const drawioBackedMermaidDiagrams = new Map([
  ['intro.md:0', {
    alt: 'Architecture argument flow',
    file: 'intro-architecture-argument.svg'
  }],
  ['publishing/how-to-read.md:0', {
    alt: 'Reading path decision flow',
    file: 'reading-path-decision-flow.svg'
  }],
  ['publishing/logical-groups.md:0', {
    alt: 'Logical group design pipeline',
    file: 'logical-group-design-pipeline.svg'
  }]
]);

export const drawioBackedMermaidAssetFiles = [...drawioBackedMermaidDiagrams.values()].map(diagram => diagram.file);

const generatedMermaidAltText = new Map([
  ['hands-on-labs/vertical-slice-examples.md:0', 'Support refund runtime flow'],
  ['hands-on-labs/vertical-slice-examples.md:1', 'Safe coding agent runtime flow'],
  ['hands-on-labs/vertical-slice-examples.md:2', 'Research to brief runtime flow'],
  ['capstone-projects/support-refund-agent.md:0', 'Support refund authority boundary'],
  ['capstone-projects/support-refund-agent.md:1', 'Support refund native framework mapping'],
  ['capstone-projects/research-rag-agent.md:0', 'Research RAG capstone flow'],
  ['capstone-projects/multi-agent-delivery-workflow.md:0', 'Multi-agent delivery capstone flow']
]);

export { diagramsRoot, generatedMermaidRoot, generatedDrawioRoot };

export function slugifyFileName(value) {
  return value
    .toLowerCase()
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'diagram';
}

function stableDiagramId(relativePath, diagramIndex) {
  return `pdf_mermaid_${slugifyFileName(relativePath)}_${diagramIndex + 1}`.replace(/-/g, '_');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function svgViewBoxSize(svg) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (viewBox) {
    const [, , width, height] = viewBox.split(/\s+/).map(Number);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return { width: Math.ceil(width), height: Math.ceil(height) };
    }
  }
  const width = Number(svg.match(/\bwidth="([0-9.]+)(?:px)?"/)?.[1]);
  const height = Number(svg.match(/\bheight="([0-9.]+)(?:px)?"/)?.[1]);
  return {
    width: Number.isFinite(width) && width > 0 ? Math.ceil(width) : 1200,
    height: Number.isFinite(height) && height > 0 ? Math.ceil(height) : 800
  };
}

async function writeDrawioWrapper(svg, relativePath, diagramIndex, fileName) {
  await fs.mkdir(generatedDrawioRoot, { recursive: true });
  const { width, height } = svgViewBoxSize(svg);
  const safeWidth = Math.max(640, Math.min(width, 1800));
  const safeHeight = Math.max(360, Math.min(height, 1800));
  const drawioName = fileName.replace(/\.svg$/, '.drawio');
  const image = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  const title = `${relativePath}:${diagramIndex}`;
  const xml = `<mxfile host="app.diagrams.net" type="device">
  <diagram id="${escapeXml(stableDiagramId(relativePath, diagramIndex))}" name="${escapeXml(title)}">
    <mxGraphModel dx="${safeWidth}" dy="${safeHeight}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${safeWidth}" pageHeight="${safeHeight}" math="0" shadow="0" defaultFontFamily="Inter">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="diagram" value="" style="shape=image;html=1;imageAspect=1;aspect=fixed;image=${escapeXml(image)};" vertex="1" parent="1">
          <mxGeometry x="0" y="0" width="${safeWidth}" height="${safeHeight}" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
  await fs.writeFile(path.join(generatedDrawioRoot, drawioName), xml, 'utf8');
}

export async function resetGeneratedMermaidArtifacts() {
  await fs.rm(generatedMermaidRoot, { recursive: true, force: true });
  await fs.rm(generatedDrawioRoot, { recursive: true, force: true });
  await fs.mkdir(generatedMermaidRoot, { recursive: true });
  await fs.mkdir(generatedDrawioRoot, { recursive: true });
}

export async function createMermaidSvgRenderer() {
  await fs.mkdir(generatedMermaidRoot, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('about:blank');
  await page.addScriptTag({ path: path.join(bookRoot, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js') });
  await page.evaluate(() => {
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: {
        primaryColor: '#f6efe2',
        primaryTextColor: '#173f4f',
        primaryBorderColor: '#c7a76a',
        lineColor: '#527887',
        secondaryColor: '#e8f0ed',
        tertiaryColor: '#fffaf0',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    });
  });

  return {
    async render(code, outputFileName, relativePath, diagramIndex) {
      const diagramId = stableDiagramId(relativePath, diagramIndex);
      const svg = await page.evaluate(async ({ code, diagramId }) => {
        const result = await window.mermaid.render(diagramId, code);
        return result.svg;
      }, { code, diagramId });
      const outputPath = path.join(generatedMermaidRoot, outputFileName);
      await fs.writeFile(outputPath, svg, 'utf8');
      await writeDrawioWrapper(svg, relativePath, diagramIndex, outputFileName);
    },
    async close() {
      await browser.close();
    }
  };
}

export async function replaceMermaidWithDiagramImages(markdown, relativePath, renderer, { linkPrefix }) {
  let diagramIndex = 0;
  let output = '';
  let cursor = 0;
  const assets = [];
  const mermaidFencePattern = /```mermaid\n([\s\S]*?)\n```/g;

  for (const match of markdown.matchAll(mermaidFencePattern)) {
    const diagramKey = `${relativePath}:${diagramIndex}`;
    const backedDiagram = drawioBackedMermaidDiagrams.get(diagramKey);
    const diagramCode = match[1].trim();
    output += markdown.slice(cursor, match.index);

    if (backedDiagram) {
      await fs.access(path.join(diagramsRoot, backedDiagram.file));
      output += `![${backedDiagram.alt}](${linkPrefix}/${backedDiagram.file})`;
      assets.push(backedDiagram.file);
    } else {
      const file = `${slugifyFileName(relativePath)}-${diagramIndex + 1}.svg`;
      const alt = generatedMermaidAltText.get(diagramKey) ?? 'Agentic system diagram';
      await renderer.render(diagramCode, file, relativePath, diagramIndex);
      output += `![${alt}](${linkPrefix}/generated-mermaid/${file})`;
      assets.push(`generated-mermaid/${file}`);
    }

    diagramIndex += 1;
    cursor = match.index + match[0].length;
  }

  return {
    markdown: output + markdown.slice(cursor),
    assets
  };
}

export async function sourceMermaidCount(chapters) {
  let count = 0;
  for (const chapter of chapters) {
    const markdown = await fs.readFile(path.join(docsRoot, chapter.path), 'utf8');
    count += markdown.match(/```mermaid\n/g)?.length ?? 0;
  }
  return count;
}

export function generatedMermaidExpectedCount(totalMermaidCount) {
  return totalMermaidCount - drawioBackedMermaidDiagrams.size;
}
