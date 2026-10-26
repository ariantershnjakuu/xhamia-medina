# Takvim — Xhamia Medina

A production-ready **fullscreen mosque prayer times dashboard** for a TV display in Prishtinë, Kosovë.

Built with **Vite + React 19 + TypeScript + Tailwind CSS v4**.

---

## Features

- **Live clock** — Europe/Belgrade timezone, second-precise
- **Prayer times** — official BIK timetable ([bislame.net/namazet/](https://bislame.net/namazet/)), bundled in the server with automatic summer/winter time
- **Next prayer highlight** — glowing gold card, auto-detected
- **Countdown banner** — HH:MM:SS until next prayer
- **Past prayer dimming** — completed prayers fade out
- **Live weather** — temperature, condition, wind via Open-Meteo (no API key)
- **Graceful fallback** — mock prayer times if the API is unreachable
- **TV-first UI** — 1920×1080, no scrolling, VW-scaled fonts, no user interaction needed

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Vite 8 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend | Express 4 (bundled BIK timetable) |
| Weather | [Open-Meteo](https://open-meteo.com/) (free, no key) |
| Fonts | Noto Sans via Google Fonts |

---

## Project Structure

```
xhamia-medina/
├── server/               # Express API (port 3001)
│   └── src/
│       ├── lib/          # BIK timetable + DST-aware lookup
│       └── routes/       # /api/prayers
└── src/                  # Vite React frontend
    ├── types/
    ├── hooks/            # useClock, usePrayerTimes, useWeather
    ├── utils/            # time.ts, prayer.ts
    └── components/       # ClockDisplay, PrayerCard, CountdownBanner, ...
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- pnpm (`npm i -g pnpm`)

### Install

```bash
# Install root (client) deps
pnpm install

# Install server deps
cd server && pnpm install && cd ..
```

### Development (client + server together)

```bash
pnpm dev
```

- Client: http://localhost:5173
- Server API: http://localhost:3001
- The Vite proxy forwards `/api/*` → server automatically

### Production build

```bash
# Build the frontend
pnpm build

# Build the server
pnpm build:server
```

Then run the server and serve `dist/` via nginx or any static file server.

### Netlify deployment

The frontend can stay on `/api/prayers` in production.

- Netlify serves the Vite app from `dist/`
- `netlify/functions/api.ts` handles `/api/prayers`
- `netlify.toml` points Netlify at the correct publish and functions directories

This means Netlify no longer depends on the local Vite proxy used in development.

---

## API

### `GET /api/prayers`

Returns today's prayer times from the bundled BIK timetable:

```json
{
  "success": true,
  "data": {
    "date": "09.04.2026",
    "source": "BIK official",
    "prayers": {
      "sabahu": "04:18",
      "lindja": "05:56",
      "dreka": "12:40",
      "ikindia": "16:21",
      "akshami": "19:18",
      "jacia": "20:39"
    },
    "updatedAt": "2026-04-09T07:00:00.000Z"
  },
  "error": null
}
```

Times are looked up per Belgrade calendar day from `server/src/lib/bik-timetable.ts`,
which stores them in standard time (UTC+1); one hour is added on summer-time days.
Nothing is fetched from bislame.net at runtime, because its own table gets the
DST switch wrong every spring and autumn.

### `GET /health`

Server health check.

---

## TV Deployment Tips

1. Set the browser to kiosk mode: `chromium-browser --kiosk http://localhost:5173`
2. Disable screen saver and sleep
3. Use a systemd service or PM2 to auto-start the server

---

## Design

- **Dark navy** background (`#060e1c` → `#0a1628`)
- **Gold** accents (`#c9a85c`) for active prayer and UI elements
- **Dark green** gradient layer for mosque ambiance
- **Islamic geometric SVG pattern** at 4% opacity as background texture
- VW-based font sizes for clean 1920px scaling
