import { Router } from "express";
import { scrapePrayerTimes } from "../scrapers/bislame.js";
import type { PrayerTimes } from "../scrapers/bislame.js";

const router = Router();

// Simple in-memory cache — refreshed once per day
type Cache = {
  data: PrayerTimes;
  cachedDate: string; // "YYYY-MM-DD"
};

let cache: Cache | null = null;

function todayKey(): string {
  return new Date().toLocaleDateString("sv", { timeZone: "Europe/Belgrade" });
}

async function getFreshData(): Promise<PrayerTimes> {
  const today = todayKey();

  if (cache && cache.cachedDate === today) {
    return cache.data;
  }

  const data = await scrapePrayerTimes();
  cache = { data, cachedDate: today };
  return data;
}

router.get("/", async (_req, res) => {
  try {
    const data = await getFreshData();
    res.json({ success: true, data, error: null });
  } catch (err) {
    console.error("[prayers] scrape failed:", err);

    // Return cached data if we have it (even stale), otherwise error
    if (cache) {
      res.json({ success: true, data: cache.data, error: "stale_cache" });
    } else {
      res.status(503).json({
        success: false,
        data: null,
        error: "Could not fetch prayer times",
      });
    }
  }
});

// Force-refresh endpoint for manual cache busting
router.post("/refresh", async (_req, res) => {
  try {
    cache = null;
    const data = await getFreshData();
    res.json({ success: true, data, error: null });
  } catch (err) {
    res.status(503).json({ success: false, data: null, error: String(err) });
  }
});

export default router;
