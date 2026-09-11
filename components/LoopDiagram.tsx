// Static pipeline diagram. No animation libs — renders everywhere, screenshots clean.

const STEPS = [
  { label: 'Live air', sub: 'Open-Meteo' },
  { label: 'Signal', sub: 'hand-written' },
  { label: 'Research', sub: 'AI / cache' },
  { label: 'Action plan', sub: 'AI / cache' },
  { label: 'Honest critic', sub: 'AI / cache' },
];

export default function LoopDiagram({ live, dataLive }: { live: boolean; dataLive: boolean }) {
  return (
    <figure style={{ margin: '20px 0 8px' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                border: '1px solid #3a4a42',
                borderRadius: 10,
                padding: '8px 12px',
                background: i === 0 && !dataLive ? '#2a2417' : '#15201b',
                minWidth: 96,
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>{s.sub}</div>
            </div>
            {i < STEPS.length - 1 && <span style={{ opacity: 0.6 }}>→</span>}
          </div>
        ))}
      </div>
      <figcaption style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
        Air data: {dataLive ? 'LIVE from Open-Meteo' : 'Demo cache (offline mode)'} · Reasoning:{' '}
        {live ? 'LIVE model' : 'Demo cache'} — demo never breaks.
      </figcaption>
    </figure>
  );
}
