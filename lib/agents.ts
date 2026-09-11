// Client-side loop: Signal (done) → Research → Plan → Critic.
// Tries live /api/reason per step (10s budget each); any failure falls back
// to cached demo reasoning so the demo NEVER breaks on stage.

'use client';

import type { SmokeRegime } from './signal';
import cached from '../data/CACHED-EXAMPLE.json';

export interface LoopResult {
  research: string;
  plan: string;
  critic: string;
  live: boolean; // true only if ALL THREE steps were live
}

async function liveStep(step: string, context: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch('/api/reason', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, context }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.text === 'string' && json.text.length > 0 ? json.text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function runLoop(regime: SmokeRegime, cityName: string): Promise<LoopResult> {
  // Static hosts (GitHub Pages) have no /api routes — skip live attempts so
  // the demo makes zero failed requests (clean console, instant reasoning).
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return {
      research: cached.research as string,
      plan: cached.plan as string,
      critic: cached.critic as string,
      live: false,
    };
  }
  const ctx =
    `${cityName} smoke check: current PM2.5 ${regime.currentPM25 ?? 'unknown'} ` +
    `(AQI ${regime.currentAqi ?? 'unknown'}), peak ${regime.peakPM25 ?? 'unknown'} ` +
    `at ${regime.peakTime ?? 'unknown'}, regime ${regime.active ? 'ACTIVE' : 'clear'} ` +
    `(${regime.sustainedHours} sustained hours), worst band ${regime.worstBandToday}.`;

  const [research, plan, critic] = await Promise.all([
    liveStep('research', ctx),
    liveStep('plan', ctx),
    liveStep('critic', ctx),
  ]);

  const live = research !== null && plan !== null && critic !== null;
  return {
    research: research ?? (cached.research as string),
    plan: plan ?? (cached.plan as string),
    critic: critic ?? (cached.critic as string),
    live,
  };
}
