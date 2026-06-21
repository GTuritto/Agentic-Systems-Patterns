import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const sourceDiagramsRoot = path.join(bookRoot, 'diagrams');
const publicDiagramsRoot = path.join(bookRoot, 'docs', 'public', 'diagrams');
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
    .replace(/\.svg$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function svgSize(svg) {
  const viewBox = svg.match(/\bviewBox="([^"]+)"/)?.[1];
  if (viewBox) {
    const [, , width, height] = viewBox.split(/\s+/).map(Number);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return { width: Math.ceil(width), height: Math.ceil(height) };
    }
  }
  const width = Number(svg.match(/\bwidth="([0-9.]+)(?:px)?"/)?.[1]);
  const height = Number(svg.match(/\bheight="([0-9.]+)(?:px)?"/)?.[1]);
  return {
    height: Number.isFinite(height) && height > 0 ? Math.ceil(height) : 720,
    width: Number.isFinite(width) && width > 0 ? Math.ceil(width) : 1120
  };
}

function drawioWrapper(fileName, svg) {
  const title = humanTitle(fileName);
  const { width, height } = svgSize(svg);
  const pageWidth = Math.max(720, Math.min(width, 2200));
  const pageHeight = Math.max(420, Math.min(height, 2200));
  const image = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  return `<mxfile host="app.diagrams.net" modified="${modified}" agent="Codex" version="24.7.17">
  <diagram id="${escapeXml(fileName.replace(/\.svg$/, ''))}" name="${escapeXml(title)}">
    <mxGraphModel dx="${pageWidth}" dy="${pageHeight}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${pageWidth}" pageHeight="${pageHeight}" math="0" shadow="0" defaultFontFamily="Inter">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="diagram" value="" style="shape=image;html=1;imageAspect=1;aspect=fixed;image=${escapeXml(image)};" vertex="1" parent="1">
          <mxGeometry x="0" y="0" width="${pageWidth}" height="${pageHeight}" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

async function main() {
  const entries = await fs.readdir(publicDiagramsRoot, { withFileTypes: true });
  const svgFiles = entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.svg'))
    .map(entry => entry.name)
    .sort();

  let created = 0;
  for (const file of svgFiles) {
    const drawioPath = path.join(sourceDiagramsRoot, file.replace(/\.svg$/, '.drawio'));
    try {
      await fs.access(drawioPath);
      continue;
    } catch {
      const svg = await fs.readFile(path.join(publicDiagramsRoot, file), 'utf8');
      await fs.writeFile(drawioPath, drawioWrapper(file, svg), 'utf8');
      created += 1;
      console.log(`Created ${path.basename(drawioPath)}`);
    }
  }

  console.log(`Created ${created} missing draw.io source file(s).`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
