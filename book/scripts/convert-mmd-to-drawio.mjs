import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const diagramsRoot = path.join(bookRoot, 'diagrams');
const modified = '2026-06-21T00:00:00.000Z';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function humanTitle(fileName) {
  return fileName
    .replace(/\.mmd$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseNodeToken(token, nodes, order) {
  const trimmed = token.trim();
  const match = trimmed.match(/^([A-Za-z][A-Za-z0-9_]*)\s*(?:\["([^"]+)"\]|\[([^\]]+)\]|\{"([^"]+)"\}|\{([^}]+)\})?$/);
  if (!match) {
    throw new Error(`Unsupported Mermaid node token: ${token}`);
  }

  const [, id, quotedBox, box, quotedDecision, decision] = match;
  const label = quotedBox ?? box ?? quotedDecision ?? decision ?? id;
  const shape = quotedDecision || decision ? 'decision' : 'process';
  const existing = nodes.get(id);
  if (!existing) {
    nodes.set(id, { id, label, shape });
    order.push(id);
  } else {
    existing.label = existing.label === existing.id ? label : existing.label;
    if (shape === 'decision') existing.shape = shape;
  }
  return id;
}

function parseFlowchart(source) {
  const lines = source
    .split(/\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const header = lines.shift();
  const direction = header?.match(/^flowchart\s+(LR|RL|TB|TD)$/)?.[1];
  if (!direction) throw new Error(`Only flowchart LR/RL/TB/TD diagrams are supported, got: ${header}`);

  const nodes = new Map();
  const order = [];
  const edges = [];

  for (const line of lines) {
    const edge = line.match(/^(.+?)\s*-->\s*(?:\|"?([^|"]+)"?\|\s*)?(.+)$/);
    if (!edge) throw new Error(`Unsupported Mermaid edge line: ${line}`);
    const sourceId = parseNodeToken(edge[1], nodes, order);
    const targetId = parseNodeToken(edge[3], nodes, order);
    edges.push({ sourceId, targetId, label: edge[2] ?? '' });
  }

  return { direction, nodes: [...nodes.values()], order, edges };
}

function layoutFlowchart(diagram) {
  const incoming = new Map(diagram.nodes.map(node => [node.id, 0]));
  const outgoing = new Map(diagram.nodes.map(node => [node.id, []]));
  for (const edge of diagram.edges) {
    incoming.set(edge.targetId, (incoming.get(edge.targetId) ?? 0) + 1);
    outgoing.get(edge.sourceId)?.push(edge.targetId);
  }

  const layer = new Map();
  const queue = [];
  for (const id of diagram.order) {
    if ((incoming.get(id) ?? 0) === 0) {
      layer.set(id, 0);
      queue.push(id);
    }
  }
  if (queue.length === 0 && diagram.order.length > 0) {
    layer.set(diagram.order[0], 0);
    queue.push(diagram.order[0]);
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const id = queue[cursor];
    for (const next of outgoing.get(id) ?? []) {
      if (layer.has(next)) continue;
      layer.set(next, (layer.get(id) ?? 0) + 1);
      queue.push(next);
    }
  }

  for (const id of diagram.order) {
    if (!layer.has(id)) layer.set(id, Math.max(0, ...layer.values()) + 1);
  }

  const byLayer = new Map();
  for (const id of diagram.order) {
    const key = layer.get(id) ?? 0;
    if (!byLayer.has(key)) byLayer.set(key, []);
    byLayer.get(key).push(id);
  }

  const horizontal = diagram.direction === 'LR' || diagram.direction === 'RL';
  const positions = new Map();
  const nodeSize = new Map();
  const layerGap = 280;
  const rowGap = 124;
  const top = 110;
  const left = 40;

  for (const [layerIndex, ids] of [...byLayer.entries()].sort((a, b) => a[0] - b[0])) {
    ids.forEach((id, rowIndex) => {
      const node = diagram.nodes.find(candidate => candidate.id === id);
      const width = Math.min(260, Math.max(170, Math.ceil((node?.label.length ?? 8) * 5.5 + 90)));
      const height = node?.shape === 'decision' ? 92 : Math.min(96, Math.max(64, Math.ceil((node?.label.length ?? 8) / 22) * 24 + 38));
      const x = horizontal ? left + layerIndex * layerGap : left + rowIndex * layerGap;
      const y = horizontal ? top + rowIndex * rowGap : top + layerIndex * rowGap;
      positions.set(id, { x, y });
      nodeSize.set(id, { width, height });
    });
  }

  let pageWidth = 0;
  let pageHeight = 0;
  for (const id of diagram.order) {
    const point = positions.get(id);
    const size = nodeSize.get(id);
    pageWidth = Math.max(pageWidth, point.x + size.width + 60);
    pageHeight = Math.max(pageHeight, point.y + size.height + 70);
  }

  return {
    nodeSize,
    pageHeight: Math.max(560, Math.ceil(pageHeight)),
    pageWidth: Math.max(1120, Math.ceil(pageWidth)),
    positions
  };
}

function nodeStyle(shape) {
  const base = 'whiteSpace=wrap;html=1;fontSize=18;fontFamily=Inter;fontColor=#173F4F;strokeWidth=2;';
  if (shape === 'decision') {
    return `rhombus;${base}fillColor=#FFF4E5;strokeColor=#B7791F;`;
  }
  return `rounded=1;${base}fillColor=#F6EFE2;strokeColor=#527887;`;
}

function flowchartToDrawio(source, fileName) {
  const title = humanTitle(fileName);
  const diagram = parseFlowchart(source);
  const layout = layoutFlowchart(diagram);
  const titleWidth = Math.min(680, Math.max(280, title.length * 14));
  const titleX = Math.max(40, Math.round((layout.pageWidth - titleWidth) / 2));

  const edgeCells = diagram.edges.map((edge, index) => `
        <mxCell id="edge-${index + 1}" value="${escapeXml(edge.label)}" style="endArrow=block;html=1;rounded=0;strokeWidth=2;strokeColor=#5F6368;fontFamily=Inter;fontSize=13;fontColor=#202124;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="${escapeXml(edge.sourceId)}" target="${escapeXml(edge.targetId)}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>`).join('');

  const nodeCells = diagram.nodes.map(node => {
    const point = layout.positions.get(node.id);
    const size = layout.nodeSize.get(node.id);
    return `
        <mxCell id="${escapeXml(node.id)}" value="${escapeXml(node.label)}" style="${nodeStyle(node.shape)}" vertex="1" parent="1">
          <mxGeometry x="${point.x}" y="${point.y}" width="${size.width}" height="${size.height}" as="geometry"/>
        </mxCell>`;
  }).join('');

  return `<mxfile host="app.diagrams.net" modified="${modified}" agent="Codex" version="24.7.17">
  <diagram id="${escapeXml(fileName.replace(/\.mmd$/, ''))}" name="${escapeXml(title)}">
    <mxGraphModel dx="${layout.pageWidth}" dy="${layout.pageHeight}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${layout.pageWidth}" pageHeight="${layout.pageHeight}" math="0" shadow="0" defaultFontFamily="Inter">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="title" value="${escapeXml(title)}" style="text;html=1;fontSize=28;fontStyle=1;fontFamily=Inter;fontColor=#173F4F;strokeColor=none;fillColor=none;align=center;" vertex="1" parent="1">
          <mxGeometry x="${titleX}" y="26" width="${titleWidth}" height="42" as="geometry"/>
        </mxCell>${edgeCells}${nodeCells}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

async function main() {
  const entries = await fs.readdir(diagramsRoot, { withFileTypes: true });
  const files = entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.mmd'))
    .map(entry => entry.name)
    .sort();

  for (const file of files) {
    const inputPath = path.join(diagramsRoot, file);
    const outputPath = path.join(diagramsRoot, file.replace(/\.mmd$/, '.drawio'));
    const source = await fs.readFile(inputPath, 'utf8');
    const drawio = flowchartToDrawio(source, file);
    await fs.writeFile(outputPath, drawio, 'utf8');
    await fs.rm(inputPath);
    console.log(`Converted ${file} -> ${path.basename(outputPath)}`);
  }

  console.log(`Converted ${files.length} Mermaid diagram source file(s).`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
