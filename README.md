# SmokeShelter — know smoke days, act early

Live wildfire-smoke action planner for teens. NextStep Hacks 2026, Earth Forward theme
(helping communities adapt to climate change + monitoring ecosystems).

Live demo: https://prest2323.github.io/smokeshelter/ ·
Demo video: https://files.catbox.moe/jks2eq.webm ·
Devpost draft: ../DEVPOST-DRAFT-nextstep.md

## What it does
1. Pulls live PM2.5 for your city (Open-Meteo air-quality API, no key).
2. Hand-written detector flags smoke regimes (PM2.5 > 100 sustained).
3. 4-step loop explains health stress, drafts a teen action plan
   (indoor practice? mask? DIY purifier? check on neighbors?),
   then an Honest Critic states uncertainty and when to trust officials.
4. Works offline: cached demo mode if APIs fail.

## Run
```bash
npm install
npm run dev   # http://localhost:3000
```
Optional live AI: set `SMOKESHELTER_LLM_URL` + `SMOKESHELTER_LLM_KEY` (any OpenAI-style
chat-completions endpoint). Without keys the app runs fully on cached demo reasoning
and still detects live smoke regimes from Open-Meteo.

## Prior work disclosure (NextStep rules)
Planning notes scaffolded Sep 11 for a different contest (never submitted, no logic).
All code in this repo written Sep 10 2026 inside the NextStep window.

## Safety
Educational only. Not medical advice. On red/purple AQI days follow local officials,
school closures, and AirNow guidance. If you have asthma, talk to a doctor early.
