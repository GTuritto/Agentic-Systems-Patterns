import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(bookRoot, 'docs');
const sourceDiagramsRoot = path.join(bookRoot, 'diagrams');
const diagramsRoot = path.join(docsRoot, 'public', 'diagrams');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.vitepress') continue;
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function diagramTargetPath(markdownFile, target) {
  const cleanTarget = target.split('#')[0].split('?')[0];
  if (cleanTarget.startsWith('../public/diagrams/')) {
    return path.resolve(path.dirname(markdownFile), cleanTarget);
  }
  if (cleanTarget.startsWith('/diagrams/')) {
    return path.join(diagramsRoot, cleanTarget.replace('/diagrams/', ''));
  }
  return null;
}

function isWeakAltText(altText) {
  const normalized = altText.trim().toLowerCase();
  return (
    normalized.length < 8 ||
    ['image', 'diagram', 'chart', 'graph', 'flow', 'mermaid diagram'].includes(normalized)
  );
}

async function main() {
  const markdownFiles = (await walk(docsRoot)).filter(file => file.endsWith('.md'));
  const failures = [];
  let referencedDiagrams = 0;

  const diagramSourceFiles = await walk(sourceDiagramsRoot);
  const mermaidSourceFiles = diagramSourceFiles.filter(file => file.endsWith('.mmd'));
  for (const file of mermaidSourceFiles) {
    failures.push(`Mermaid diagram source remains; convert to draw.io: ${path.relative(bookRoot, file)}`);
  }

  for (const markdownFile of markdownFiles) {
    const markdown = await fs.readFile(markdownFile, 'utf8');
    for (const match of markdown.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g)) {
      const altText = match[1];
      const target = match[2];
      const targetPath = diagramTargetPath(markdownFile, target);
      if (!targetPath) continue;
      referencedDiagrams += 1;

      if (isWeakAltText(altText)) {
        failures.push(`${path.relative(docsRoot, markdownFile)} -> ${target} has weak alt text "${altText}"`);
      }

      try {
        const svg = await fs.readFile(targetPath, 'utf8');
        if (!svg.includes('<svg')) {
          failures.push(`${path.relative(docsRoot, markdownFile)} -> ${path.relative(docsRoot, targetPath)} is not an SVG`);
        }
        const diagramRelativePath = path.relative(diagramsRoot, targetPath);
        if (!diagramRelativePath.startsWith('generated-mermaid/') && diagramRelativePath.endsWith('.svg')) {
          const drawioPath = path.join(sourceDiagramsRoot, diagramRelativePath.replace(/\.svg$/, '.drawio'));
          try {
            await fs.access(drawioPath);
          } catch {
            failures.push(`${path.relative(docsRoot, markdownFile)} -> ${target} is missing draw.io source ${path.relative(bookRoot, drawioPath)}`);
          }
        }
      } catch {
        failures.push(`${path.relative(docsRoot, markdownFile)} -> ${target} missing`);
      }
    }
  }

  const generatedMermaidRoot = path.join(diagramsRoot, 'generated-mermaid');
  const generatedMermaidDrawioRoot = path.join(sourceDiagramsRoot, 'generated-mermaid');
  let generatedMermaidCount = 0;
  try {
    const generatedFiles = (await fs.readdir(generatedMermaidRoot)).filter(file => file.endsWith('.svg'));
    generatedMermaidCount = generatedFiles.length;
    for (const file of generatedFiles) {
      const svg = await fs.readFile(path.join(generatedMermaidRoot, file), 'utf8');
      if (!svg.includes('<svg')) failures.push(`generated-mermaid/${file} is not an SVG`);
      const drawioPath = path.join(generatedMermaidDrawioRoot, file.replace(/\.svg$/, '.drawio'));
      try {
        await fs.access(drawioPath);
      } catch {
        failures.push(`generated-mermaid/${file} is missing draw.io source ${path.relative(bookRoot, drawioPath)}`);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (failures.length > 0) {
    console.error(`Diagram asset check failed: ${failures.length} issue(s).`);
    for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
    if (failures.length > 50) console.error(`...and ${failures.length - 50} more`);
    process.exit(1);
  }

  console.log(`Diagram asset check OK: ${referencedDiagrams} referenced diagram(s), ${generatedMermaidCount} generated Mermaid SVG(s).`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
