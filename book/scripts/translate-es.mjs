import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bookChapters } from './book-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bookRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(bookRoot, 'docs');
const spanishRoot = path.join(bookRoot, 'docs-es');
const policyPath = path.join(bookRoot, 'translation', 'es-policy.md');
const model = process.env.OPENAI_TRANSLATION_MODEL ?? 'gpt-4.1';
const maxChunkChars = Number.parseInt(process.env.TRANSLATION_CHUNK_CHARS ?? '9000', 10);

const args = new Set(process.argv.slice(2));
const force = args.has('--force');
const dryRun = args.has('--dry-run');
const onlyArg = process.argv.find(arg => arg.startsWith('--only='));
const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const onlyPath = onlyArg?.slice('--only='.length);
const limit = limitArg ? Number.parseInt(limitArg.slice('--limit='.length), 10) : undefined;

function selectedChapters() {
  const selected = onlyPath
    ? bookChapters.filter(chapter => chapter.path === onlyPath)
    : bookChapters;

  if (onlyPath && selected.length === 0) {
    throw new Error(`No chapter found for --only=${onlyPath}`);
  }

  return Number.isFinite(limit) ? selected.slice(0, limit) : selected;
}

function maskMarkdown(markdown) {
  const tokens = [];

  function addToken(kind, value) {
    const token = `__ASP_${kind}_${tokens.length}__`;
    tokens.push({ token, value });
    return token;
  }

  let masked = markdown
    .replace(/```[\s\S]*?```/g, value => addToken('FENCE', value))
    .replace(/`[^`\n]+`/g, value => addToken('CODE', value))
    .replace(/!\[([^\]]*)]\(([^)]+)\)/g, (_match, alt, target) => `![${alt}](${addToken('TARGET', target)})`)
    .replace(/(?<!!)\[([^\]]+)]\(([^)]+)\)/g, (_match, label, target) => `[${label}](${addToken('TARGET', target)})`)
    .replace(/https?:\/\/[^\s)]+/g, value => addToken('URL', value));

  return { masked, tokens };
}

function unmaskMarkdown(markdown, tokens) {
  let unmasked = markdown;
  for (const { token, value } of tokens) {
    unmasked = unmasked.replaceAll(token, value);
  }
  return unmasked;
}

function splitMarkdown(markdown) {
  if (markdown.length <= maxChunkChars) return [markdown];

  const blocks = markdown.split(/(?=\n#{1,3}\s+)/g);
  const chunks = [];
  let current = '';

  for (const block of blocks) {
    if ((current + block).length > maxChunkChars && current.trim()) {
      chunks.push(current);
      current = block;
      continue;
    }
    current += block;
  }

  if (current.trim()) chunks.push(current);
  return chunks.flatMap(chunk => {
    if (chunk.length <= maxChunkChars) return [chunk];
    const paragraphs = chunk.split(/(?=\n\n)/g);
    const smaller = [];
    let currentParagraphs = '';
    for (const paragraph of paragraphs) {
      if ((currentParagraphs + paragraph).length > maxChunkChars && currentParagraphs.trim()) {
        smaller.push(currentParagraphs);
        currentParagraphs = paragraph;
        continue;
      }
      currentParagraphs += paragraph;
    }
    if (currentParagraphs.trim()) smaller.push(currentParagraphs);
    return smaller;
  });
}

async function translateChunk({ chunk, policy, chapterPath, chunkIndex, chunkCount, requiredTokens = [] }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required to generate the Spanish translation.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: [
                'You are translating a technical book from English to Latin American Spanish.',
                'Follow the policy exactly.',
                'Preserve all Markdown syntax, frontmatter keys, placeholders, paths, slugs, URLs, code, and technical terms listed in the policy.',
                'Return only the translated Markdown chunk. Do not add commentary.'
              ].join('\n')
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                policy,
                '',
                `Chapter path: ${chapterPath}`,
                `Chunk: ${chunkIndex + 1} of ${chunkCount}`,
                requiredTokens.length > 0 ? `Required placeholders to preserve exactly: ${requiredTokens.join(', ')}` : '',
                '',
                'Translate this Markdown chunk:',
                '',
                chunk
              ].join('\n')
            }
          ]
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI translation failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data.output_text ?? data.output
    ?.flatMap(item => item.content ?? [])
    ?.map(content => content.text ?? '')
    ?.join('')
    ?.trim();
  if (!text || typeof text !== 'string') {
    throw new Error(`OpenAI response did not include output_text for ${chapterPath}`);
  }
  return text.trim();
}

function missingPreservedTokens(sourceTokens, translated) {
  return sourceTokens
    .map(({ token }) => token)
    .filter(token => !translated.includes(token));
}

function validatePreservedTokens(sourceTokens, translated) {
  const missing = sourceTokens
    .map(({ token }) => token)
    .filter(token => !translated.includes(token));
  if (missing.length > 0) {
    throw new Error(`Translation lost ${missing.length} masked token(s): ${missing.slice(0, 10).join(', ')}`);
  }
}

async function translateChapter(chapter, policy) {
  const sourcePath = path.join(docsRoot, chapter.path);
  const targetPath = path.join(spanishRoot, chapter.path);
  const raw = await fs.readFile(sourcePath, 'utf8');

  try {
    await fs.access(targetPath);
    if (!force) {
      console.log(`skip ${chapter.path}`);
      return;
    }
  } catch {
    // File does not exist yet.
  }

  const chunks = splitMarkdown(raw);
  const translatedChunks = [];
  for (const [index, chunk] of chunks.entries()) {
    const { masked, tokens } = maskMarkdown(chunk);
    let translatedMasked = '';
    let missing = [];
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      translatedMasked = await translateChunk({
        chunk: masked,
        policy,
        chapterPath: chapter.path,
        chunkIndex: index,
        chunkCount: chunks.length,
        requiredTokens: tokens.map(({ token }) => token)
      });
      missing = missingPreservedTokens(tokens, translatedMasked);
      if (missing.length === 0) break;
      console.log(`retry ${chapter.path} chunk ${index + 1}/${chunks.length}: missing ${missing.join(', ')}`);
    }
    validatePreservedTokens(tokens, translatedMasked);
    translatedChunks.push(unmaskMarkdown(translatedMasked, tokens));
    console.log(`translated ${chapter.path} chunk ${index + 1}/${chunks.length}`);
  }

  const translated = translatedChunks.join('\n\n').replace(/\n{3,}/g, '\n\n');
  if (dryRun) return;

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${translated.trim()}\n`, 'utf8');
}

async function main() {
  const policy = await fs.readFile(policyPath, 'utf8');
  const chapters = selectedChapters();
  for (const chapter of chapters) {
    await translateChapter(chapter, policy);
  }
  console.log(`Spanish translation run complete: ${chapters.length} chapter(s) selected.`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
