// Smoke-regime detector. Hand-written rule logic, no LLM.
// Rule: regime = PM2.5 > 100 sustained for 2+ consecutive hourly readings.
// Why 100: EPA 24-hr breakpoint where sensitive groups feel it; sustained
// (not a 1-hr spike) avoids false alarms from sensor noise or traffic puffs.

import type { AirReading } from './meteo';

export const SMOKE_THRESHOLD = 100;
export const MIN_SUSTAINED_HOURS = 2;

export interface SmokeRegime {
  active: boolean;
  spikeStart: string | null;
  spikeEnd: string | null;
  peakPM25: number | null;
  peakTime: string | null;
  currentPM25: number | null;
  currentAqi: number | null;
  sustainedHours: number;
  worstBandToday: string;
}

export function detectRegime(readings: AirReading[]): SmokeRegime {
  const empty: SmokeRegime = {
    active: false,
    spikeStart: null,
    spikeEnd: null,
    peakPM25: null,
    peakTime: null,
    currentPM25: null,
    currentAqi: null,
    sustainedHours: 0,
    worstBandToday: 'unknown',
  };
  if (readings.length === 0) return empty;

  // Most recent reading with data = "now" (forecast series may lead real time).
  const withData = readings.filter((r) => r.pm25 !== null);
  if (withData.length === 0) return empty;
  const now = withData[withData.length - 1];
  empty.currentPM25 = now.pm25;
  empty.currentAqi = now.usAqi;

  // Peak across series.
  let peak = withData[0];
  for (const r of withData) {
    if ((r.pm25 as number) > (peak.pm25 as number)) peak = r;
  }
  empty.peakPM25 = peak.pm25;
  empty.peakTime = peak.time;

  // Longest sustained run above threshold (the smoke event).
  let bestStart = -1;
  let bestLen = 0;
  let runStart = -1;
  let runLen = 0;
  withData.forEach((r, i) => {
    if ((r.pm25 as number) > SMOKE_THRESHOLD) {
      if (runStart === -1) runStart = i;
      runLen++;
      if (runLen > bestLen) {
        bestLen = runLen;
        bestStart = runStart;
      }
    } else {
      runStart = -1;
      runLen = 0;
    }
  });

  if (bestLen >= MIN_SUSTAINED_HOURS) {
    empty.active = true;
    empty.sustainedHours = bestLen;
    empty.spikeStart = withData[bestStart].time;
    empty.spikeEnd = withData[bestStart + bestLen - 1].time;
  } else {
    // Report current run even if below threshold-count (early warning).
    empty.sustainedHours = runLen;
  }

  empty.worstBandToday = band(Math.max(...withData.map((r) => r.pm25 as number)));
  return empty;
}

function band(pm25: number): string {
  if (pm25 <= 12) return 'Good (green)';
  if (pm25 <= 35.4) return 'Moderate (yellow)';
  if (pm25 <= 55.4) return 'Unhealthy for sensitive groups (orange)';
  if (pm25 <= 150.4) return 'Unhealthy (red)';
  if (pm25 <= 250.4) return 'Very unhealthy (purple)';
  return 'Hazardous (maroon)';
}
