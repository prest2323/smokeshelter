// POST /api/reason — optional live AI step. Any OpenAI-style chat endpoint.
// Env: SMOKESHELTER_LLM_URL (…/chat/completions), SMOKESHELTER_LLM_KEY,
// optional SMOKESHELTER_LLM_MODEL (default: gpt-4o-mini class name passthrough).
// No keys → 501 and the client runs fully on cached demo reasoning.

import { NextResponse } from 'next/server';

const TIMEOUT_MS = 8000;

const SYSTEMS: Record<string, string> = {
  research:
    'You are a teen-health communicator explaining wildfire-smoke days. 80 words max, 3 bullets. Educational only, never medical advice. End with: Follow local officials, not apps.',
  plan: 'You write concrete next-day action plans for a 16-year-old on a smoke day. 4 numbered steps max, 80 words. Practical: indoor swaps, masks, DIY air cleaning, checking on people. Educational only.',
  critic:
    'You are a skeptical scientist. 80 words max. Give 3 short reasons this smoke plan or data could be wrong or incomplete. End with a 1-line lesson for a teen.',
};

export async function POST(req: Request) {
  const url = process.env.SMOKESHELTER_LLM_URL;
  const key = process.env.SMOKESHELTER_LLM_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'demo mode' }, { status: 501 });
  }
  let body: { step?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  const system = SYSTEMS[body.step ?? ''];
  if (!system || !body.context) {
    return NextResponse.json({ error: 'bad step' }, { status: 400 });
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.SMOKESHELTER_LLM_MODEL ?? 'default',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: body.context },
        ],
        max_tokens: 220,
        temperature: 0.4,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const text: string | undefined = json?.choices?.[0]?.message?.content;
    if (!text) throw new Error('empty completion');
    return NextResponse.json({ text: text.trim(), live: true });
  } catch {
    return NextResponse.json({ error: 'llm failed' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
