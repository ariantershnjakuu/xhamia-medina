import { Router } from "express";
import {
  clearPrayerCache,
  getCachedPrayerData,
  getPrayerData,
} from "../lib/prayer-cache.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const data = await getPrayerData();
    res.json({ success: true, data, error: null });
  } catch (err) {
    console.error("[prayers] scrape failed:", err);

    // Return cached data if we have it (even stale), otherwise error
    const cachedData = getCachedPrayerData();
    if (cachedData) {
      res.json({ success: true, data: cachedData, error: "stale_cache" });
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
    clearPrayerCache();
    const data = await getPrayerData();
    res.json({ success: true, data, error: null });
  } catch (err) {
    res.status(503).json({ success: false, data: null, error: String(err) });
  }
});

export default router;
