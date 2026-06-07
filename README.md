# 🏎 The Pit Wall — 100% Free, No API Keys

Auto-updating F1 dashboard powered by **completely free, no-key APIs**.
Zero cost. Zero signup. Just run it.

---

## How data updates automatically

The React app calls these free public APIs directly from your browser:

| API | What it provides | Cost |
|---|---|---|
| **api.openf1.org** | Next race, session times, live timing | FREE, no key |
| **f1api.dev** | Championship standings | FREE, no key |
| **api.jolpi.ca/ergast** | Race results, calendar, fallback standings | FREE, no key |

Data refreshes every **5 minutes automatically**.
After a race ends, the standings and results update on their own within 5 minutes of the next page load.

---

## Quick Start

```bash
npm install
npm start
```

That's it. No `.env` file. No API keys. No server to run.

Visit **http://localhost:3000**

---

## What updates automatically

| Data | Source | Updates when |
|---|---|---|
| Championship standings | f1api.dev → Ergast | After every race |
| Race results / podium | Ergast | After every race |
| Season calendar | Ergast | Start of season |
| Next race + sessions | OpenF1 | Real-time |
| Live countdown | Calculated locally | Every second |

---
