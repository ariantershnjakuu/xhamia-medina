import { Router } from "express";
import { getPrayerData } from "../lib/prayer-times.js";

const router = Router();

router.get("/", (_req, res) => {
  try {
    const data = getPrayerData();
    res.json({ success: true, data, error: null });
  } catch (err) {
    console.error("[prayers] timetable lookup failed:", err);
    res.status(503).json({
      success: false,
      data: null,
      error: "Could not compute prayer times",
    });
  }
});

export default router;
