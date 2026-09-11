'use client';

import { useMemo, useRef, useState } from 'react';
import { CITIES, aqiBand, fetchAir, type AirReading, type City } from '../lib/meteo';
import { SMOKE_THRESHOLD, detectRegime, type SmokeRegime } from '../lib/signal';
import { runLoop, type LoopResult } from '../lib/agents';
import LoopDiagram from '../components/LoopDiagram';
import fallback from '../data/FALLBACK.json';

type Phase = 'idle' | 'air' | 'thinking' | 'done';

const INK = '#0d1512';
const PAPER = '#f2ede1';
const GOLD = '#c9a84c';
const CARD = '#15201b';
const LINE = '#3a4a42';

function pillColor(aqi: number | null): string {
  if (aqi === null) return '#8a8a8a';
  if (aqi <= 50) return '#7fd08c';
  if (aqi <= 100) return '#e8c84a';
  if (aqi <= 150) return '#ff9d6b';
  if (aqi <= 200) return '#ff6b6b';
  if (aqi <= 300) return '#c792ea';
  return '#8e2f32';
}

function Sparkline({ readings }: { readings: AirReading[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const draw = () => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const W = (cv.width = 640);
    const H = (cv.height = 180);
    ctx.clearRect(0, 0, W, H);
    const vals = readings.map((r) => r.pm25 ?? 0);
    const max = Math.max(SMOKE_THRESHOLD * 1.4, ...vals);
    const x = (i: number) => 8 + (i / Math.max(1, vals.length - 1)) * (W - 16);
    const y = (v: number) => H - 14 - (v / max) * (H - 28);
    // threshold line
    ctx.strokeStyle = GOLD;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y(SMOKE_THRESHOLD));
    ctx.lineTo(W, y(SMOKE_THRESHOLD));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = GOLD;
    ctx.font = '11px system-ui';
    ctx.fillText(`smoke line ${SMOKE_THRESHOLD}`, 10, y(SMOKE_THRESHOLD) - 5);
    // area
    ctx.beginPath();
    vals.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
    ctx.strokeStyle = '#7fd08c';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineTo(x(vals.length - 1), H - 14);
    ctx.lineTo(x(0), H - 14);
    ctx.closePath();
    ctx.fillStyle = 'rgba(127,208,140,0.15)';
    ctx.fill();
  };
  requestAnimationFrame(draw);
  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: 180, background: '#0a100d', borderRadius: 10, border: `1px solid ${LINE}` }}
    />
  );
}

export default function Page() {
  const [city, setCity] = useState<City>(CITIES[0]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [readings, setReadings] = useState<AirReading[]>([]);
  const [regime, setRegime] = useState<SmokeRegime | null>(null);
  const [loop, setLoop] = useState<LoopResult | null>(null);
  const [dataLive, setDataLive] = useState(true);
  const [usedCity, setUsedCity] = useState(CITIES[0].name);

  const status = useMemo(() => {
    if (!regime) return null;
    if (regime.active)
      return {
        title: `SMOKE REGIME ACTIVE — ${regime.sustainedHours}h over the line`,
        color: '#ff9d6b',
        detail: `Peak ${regime.peakPM25} µg/m³ at ${regime.peakTime}. Worst band: ${regime.worstBandToday}.`,
      };
    return {
      title: `Air clear for now — current ${regime.currentPM25 ?? '?'} µg/m³`,
      color: '#7fd08c',
      detail: `Worst band in window: ${regime.worstBandToday}. Still grab your plan below.`,
    };
  }, [regime]);

  async function check() {
    setPhase('air');
    setLoop(null);
    setRegime(null);
    let rs: AirReading[];
    let live = true;
    try {
      const r = await fetchAir(city);
      rs = r.readings;
      live = r.live;
    } catch {
      rs = (fallback.readings as AirReading[]).slice();
      live = false;
    }
    // Keep last 48 hours max for chart + detector speed.
    rs = rs.slice(-48);
    const reg = detectRegime(rs);
    setReadings(rs);
    setRegime(reg);
    setDataLive(live);
    setUsedCity(live ? city.name : `${fallback.city} (sample)`);
    setPhase('thinking');
    const res = await runLoop(reg, live ? city.name : String(fallback.city));
    setLoop(res);
    setPhase('done');
  }

  return (
    <main style={{ background: INK, color: PAPER, minHeight: '100vh', padding: '28px 18px 60px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{ color: GOLD, letterSpacing: 2, fontSize: 12, margin: '0 0 6px' }}>
          NEXTSTEP HACKS 2026 · EARTH FORWARD
        </p>
        <h1 className="font-display" style={{ margin: '0 0 4px', fontWeight: 800 }}>SmokeShelter</h1>
        <p style={{ opacity: 0.85, margin: '0 0 18px' }}>
          Know smoke days. Act early. Live air → teen action plan → honest uncertainty.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <select
            aria-label="City"
            value={city.name}
            onChange={(e) => setCity(CITIES.find((c) => c.name === e.target.value) ?? CITIES[0])}
            style={{ background: CARD, color: PAPER, border: `1px solid ${LINE}`, borderRadius: 8, padding: '10px 12px', fontSize: 15 }}
          >
            {CITIES.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={check}
            disabled={phase === 'air' || phase === 'thinking'}
            style={{
              background: GOLD,
              color: '#14100a',
              border: 0,
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 16,
              fontWeight: 800,
              cursor: phase === 'air' || phase === 'thinking' ? 'wait' : 'pointer',
            }}
          >
            {phase === 'air' ? 'Reading air…' : phase === 'thinking' ? 'Thinking…' : 'Check my air'}
          </button>
        </div>

        {readings.length > 0 && (
          <>
            <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: pillColor(regime?.currentAqi ?? null),
                  color: '#14100a',
                  fontWeight: 800,
                  borderRadius: 999,
                  padding: '2px 12px',
                  marginRight: 8,
                }}
              >
                AQI {regime?.currentAqi ?? '?'}
              </span>
              {usedCity} · {dataLive ? 'LIVE Open-Meteo data' : 'Demo cache (offline mode — sample event)'} ·{' '}
              {aqiBand(regime?.currentAqi ?? null)}
            </p>
            <Sparkline readings={readings} />
          </>
        )}

        {status && (
          <div style={{ border: `1px solid ${LINE}`, borderLeft: `6px solid ${status.color}`, borderRadius: 10, background: CARD, padding: '12px 16px', marginTop: 14 }}>
            <div style={{ fontWeight: 800, color: status.color }}>{status.title}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{status.detail}</div>
          </div>
        )}

        {phase === 'thinking' && <p style={{ opacity: 0.8 }}>Reading research → plan → critic…</p>}

        {loop && (
          <>
            <LoopDiagram live={loop.live} dataLive={dataLive} />
            <section style={{ border: `1px solid ${LINE}`, borderRadius: 10, background: CARD, padding: '12px 16px', marginTop: 10 }}>
              <h2 style={{ fontSize: 16, margin: '0 0 6px', color: GOLD }}>01 · What this air means</h2>
              <p style={{ whiteSpace: 'pre-line', fontSize: 14, margin: 0, lineHeight: 1.55 }}>{loop.research}</p>
            </section>
            <section style={{ border: `1px solid ${LINE}`, borderRadius: 10, background: CARD, padding: '12px 16px', marginTop: 10 }}>
              <h2 style={{ fontSize: 16, margin: '0 0 6px', color: GOLD }}>02 · Your action plan for tomorrow</h2>
              <p style={{ whiteSpace: 'pre-line', fontSize: 14, margin: 0, lineHeight: 1.55 }}>{loop.plan}</p>
            </section>
            <section style={{ border: `1px solid #6b4a2a`, borderRadius: 10, background: '#1d1712', padding: '12px 16px', marginTop: 10 }}>
              <h2 style={{ fontSize: 16, margin: '0 0 6px', color: '#ffb46b' }}>03 · Honest critic — read before trusting</h2>
              <p style={{ whiteSpace: 'pre-line', fontSize: 14, margin: 0, lineHeight: 1.55 }}>{loop.critic}</p>
            </section>
          </>
        )}

        <footer style={{ marginTop: 26, fontSize: 12, opacity: 0.65, lineHeight: 1.6 }}>
          Educational only — not medical advice. On orange days and worse, follow local officials, school
          closures, and AirNow guidance. Built Sep 10 2026 for NextStep Hacks Earth Forward by Preston, 16.
          Prior planning notes Sep 11 (different contest, never submitted); all code here written in-window.
        </footer>
      </div>
    </main>
  );
}
