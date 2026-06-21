import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdfChapters } from './book-manifest.mjs';
import {
  drawioBackedMermaidAssetFiles,
  generatedMermaidExpectedCount,
  sourceMermaidCount
} from './mermaid-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const epubPath = path.join(bookRoot, 'releases', 'Agentic-Systems-Patterns.epub');

function readStoredZipEntries(buffer) {
  const entries = new Map();
  let offset = 0;

  while (offset + 30 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature === 0x02014b50 || signature === 0x06054b50) break;
    if (signature !== 0x04034b50) {
      throw new Error(`Unexpected ZIP signature 0x${signature.toString(16)} at offset ${offset}`);
    }

    const compressionMethod = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    const contentStart = nameEnd + extraLength;
    const contentEnd = contentStart + compressedSize;
    const name = buffer.subarray(nameStart, nameEnd).toString('utf8');

    if (compressionMethod !== 0) {
      throw new Error(`EPUB entry ${name} uses unsupported compression method ${compressionMethod}`);
    }

    entries.set(name, buffer.subarray(contentStart, contentEnd));
    offset = contentEnd;
  }

  return entries;
}

async function main() {
  const expectedMermaid = await sourceMermaidCount(pdfChapters);
  const expectedGenerated = generatedMermaidExpectedCount(expectedMermaid);
  const entries = readStoredZipEntries(await fs.readFile(epubPath));
  const xhtml = [...entries.entries()]
    .filter(([name]) => name.endsWith('.xhtml'))
    .map(([name, content]) => [name, content.toString('utf8')]);
  const opf = entries.get('OEBPS/content.opf')?.toString('utf8') ?? '';
  const failures = [];

  for (const [name, content] of xhtml) {
    if (/```mermaid|language-mermaid|<pre><code>[^<]*(flowchart|sequenceDiagram|stateDiagram-v2)/.test(content)) {
      failures.push(`${name} still contains Mermaid source instead of SVG images`);
    }
  }

  const allXhtml = xhtml.map(([, content]) => content).join('\n');
  const backedAlternation = drawioBackedMermaidAssetFiles
    .map(file => file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const mermaidImageRefs = allXhtml.match(new RegExp(`\\.\\.\\/assets\\/diagrams\\/(?:generated-mermaid\\/[^"')]+\\.svg|${backedAlternation})`, 'g')) ?? [];
  const generatedAssets = [...entries.keys()].filter(name => name.startsWith('OEBPS/assets/diagrams/generated-mermaid/') && name.endsWith('.svg'));
  const generatedManifestItems = opf.match(/href="assets\/diagrams\/generated-mermaid\/[^"]+\.svg" media-type="image\/svg\+xml"/g) ?? [];

  if (mermaidImageRefs.length !== expectedMermaid) {
    failures.push(`EPUB Mermaid SVG reference mismatch: expected ${expectedMermaid}, found ${mermaidImageRefs.length}`);
  }

  if (generatedAssets.length !== expectedGenerated) {
    failures.push(`EPUB generated Mermaid asset mismatch: expected ${expectedGenerated}, found ${generatedAssets.length}`);
  }

  if (generatedManifestItems.length !== expectedGenerated) {
    failures.push(`EPUB generated Mermaid manifest mismatch: expected ${expectedGenerated}, found ${generatedManifestItems.length}`);
  }

  for (const file of drawioBackedMermaidAssetFiles) {
    if (!allXhtml.includes(`../assets/diagrams/${file}`)) {
      failures.push(`EPUB missing draw.io-backed Mermaid image reference ${file}`);
    }
    if (!opf.includes(`href="assets/diagrams/${file}"`)) {
      failures.push(`EPUB missing draw.io-backed Mermaid manifest item ${file}`);
    }
  }

  if (!entries.has('OEBPS/styles.css') || !entries.get('OEBPS/styles.css').toString('utf8').includes('img.diagram-asset')) {
    failures.push('EPUB stylesheet is missing diagram scaling rules');
  }

  if (failures.length > 0) {
    console.error(`EPUB diagram check failed: ${failures.length} issue(s).`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`EPUB Mermaid SVG coverage OK: ${expectedMermaid} diagram(s), ${expectedGenerated} generated SVG asset(s).`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
