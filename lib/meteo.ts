// Open-Meteo air-quality ingest. No API key, CORS-enabled, free.
// Docs: https://open-meteo.com/en/docs/air-quality-api
// Pivot note (learning story): started on OpenAQ plan, found v3 needs a key
// with signup; switched to Open-Meteo for zero-setup live demo + cached fallback.

export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export const CITIES: City[] = [
  { name: 'Seattle, WA', latitude: 47.6062, longitude: -122.3321 },
  { name: 'Spokane, WA', latitude: 47.6588, longitude: -117.426 },
  { name: 'Portland, OR', latitude: 45.5152, longitude: -122.6784 },
  { name: 'Sacramento, CA', latitude: 38.5816, longitude: -121.4944 },
  { name: 'Los Angeles, CA', latitude: 34.0522, longitude: -118.2437 },
];

export interface AirReading {
  time: string; // ISO local
  pm25: number | null;
  usAqi: number | null;
}

interface MeteoResponse {
  hourly?: {
    time?: string[];
    pm2_5?: Array<number | null>;
    us_aqi?: Array<number | null>;
  };
}

const FETCH_TIMEOUT_MS = 8000;

export async function fetchAir(city: City): Promise<{ readings: AirReading[]; live: boolean }> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&hourly=pm2_5,us_aqi&timezone=auto&forecast_days=3`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as MeteoResponse;
    const times = json.hourly?.time ?? [];
    const pm = json.hourly?.pm2_5 ?? [];
    const aqi = json.hourly?.us_aqi ?? [];
    const readings: AirReading[] = times.map((t, i) => ({
      time: t,
      pm25: pm[i] ?? null,
      usAqi: aqi[i] ?? null,
    }));
    if (readings.length === 0) throw new Error('empty series');
    return { readings, live: true };
  } finally {
    clearTimeout(timer);
  }
}

export function aqiBand(aqi: number | null): string {
  if (aqi === null) return 'unknown';
  if (aqi <= 50) return 'Good (green)';
  if (aqi <= 100) return 'Moderate (yellow)';
  if (aqi <= 150) return 'Unhealthy for sensitive groups (orange)';
  if (aqi <= 200) return 'Unhealthy (red)';
  if (aqi <= 300) return 'Very unhealthy (purple)';
  return 'Hazardous (maroon)';
}
