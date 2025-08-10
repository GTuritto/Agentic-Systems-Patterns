import axios from 'axios';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Lightweight embedding via sentence-transformers/all-MiniLM-L6-v2 is typically Python.
// For TS demo, we implement a tiny bag-of-words cosine as a placeholder (no network).
// This keeps repo policy (HF embeddings reference) while avoiding heavy deps in TS.

export type RouteLabel = 'billing'|'tech'|'sales';

export async function routerByLLM(messages: Array<{role:'system'|'user'; content: string}>, apiKey?: string): Promise<{route: RouteLabel; confidence: number; reason: string}> {
  if (!apiKey) {
    // fallback: simple keyword heuristic
    const text = messages.map(m=>m.content).join(' ').toLowerCase();
    const route: RouteLabel = text.includes('invoice')||text.includes('charge')? 'billing' : text.includes('error')||text.includes('bug')? 'tech' : 'sales';
    return { route, confidence: 0.6, reason: 'heuristic-fallback' };
  }
  const resp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
    model: 'mistral-small-latest',
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'You are an intent router. Return strict JSON only with keys route (billing|tech|sales), confidence (0..1), reason.' },
      ...messages,
    ]
  }, { headers: { Authorization: `Bearer ${apiKey}` } });
  const content = resp.data?.choices?.[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    if (parsed && (parsed.route==='billing'||parsed.route==='tech'||parsed.route==='sales')) {
      return { route: parsed.route, confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.5))), reason: String(parsed.reason ?? '') };
    }
  } catch {}
  return { route: 'sales', confidence: 0.5, reason: 'default' };
}

function bowVector(text: string, vocab: string[]): number[] {
  const tokens = text.toLowerCase().match(/[a-z]+/g) || [];
  const counts: Record<string, number> = {};
  tokens.forEach(t=>counts[t]=(counts[t]||0)+1);
  return vocab.map(v=>counts[v]||0);
}
function cosine(a: number[], b: number[]): number {
  let dot=0,na=0,nb=0; for (let i=0;i<a.length;i++){dot+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}
  return dot/((Math.sqrt(na)||1)*(Math.sqrt(nb)||1));
}

export async function routerByEmbedding(text: string): Promise<{route: RouteLabel; confidence: number; reason: string}> {
  const exemplars: Array<{label: RouteLabel; text: string}> = [
    { label: 'billing', text: 'invoice charge billing refund receipt' },
    { label: 'tech', text: 'bug error crash API not working' },
    { label: 'sales', text: 'pricing plan quote buy purchase' },
  ];
  const vocab = Array.from(new Set(exemplars.flatMap(e=>e.text.split(' '))));
  const qv = bowVector(text, vocab);
  let best: {label: RouteLabel; score: number} = { label: 'sales', score: -1 };
  for (const ex of exemplars) {
    const ev = bowVector(ex.text, vocab);
    const score = cosine(qv, ev);
    if (score>best.score) best = { label: ex.label, score };
  }
  return { route: best.label, confidence: Math.max(0, Math.min(1, best.score)), reason: 'bow-cosine' };
}

export function combineRouters(
  a: {route: RouteLabel; confidence: number},
  b: {route: RouteLabel; confidence: number},
  policy?: { fast?: boolean; budget?: 'low'|'std'|'high' }
): {route: RouteLabel; rationale: string} {
  // If both agree, take it.
  if (a.route === b.route) return { route: a.route, rationale: 'agree' };
  // Policy hints
  if (policy?.fast) return { route: 'billing', rationale: 'latency-aware' };
  if (policy?.budget === 'low') return { route: 'billing', rationale: 'budget-aware' };
  // Highest confidence wins; tie-break deterministic order
  if (a.confidence > b.confidence) return { route: a.route, rationale: 'higher-confidence-a' };
  if (b.confidence > a.confidence) return { route: b.route, rationale: 'higher-confidence-b' };
  const order: RouteLabel[] = ['billing','tech','sales'];
  const pick = order.includes(a.route) && order.includes(b.route) ? order.sort().find(x=>x===a.route||x===b.route)! : a.route;
  return { route: pick, rationale: 'tie-break' };
}
