import { scrapePrayerTimes } from "../scrapers/bislame.js";
import type { PrayerTimes } from "../scrapers/bislame.js";

type Cache = {
  data: PrayerTimes;
  cachedDate: string; // YYYY-MM-DD in Europe/Belgrade
  scrapedAt: number; // epoch ms
};

const TZ = "Europe/Belgrade";

// bislame.net doesn't always flip its published times at exactly 00:00.
// To avoid caching yesterday's times all day long, we re-scrape once we
// cross (Sabahu - REFRESH_LEAD_MINUTES) — by then the source is reliably
// showing today's times, and the mosque kiosk picks up the update well
// before the fajr adhan.
const REFRESH_LEAD_MINUTES = 60;

// Bootstrap floor used when the cached sabahu is missing/invalid.
// Sabahu in Kosovo is never earlier than ~03:00, even at summer solstice,
// so 04:00 is always before today's real threshold.
const BOOTSTRAP_THRESHOLD_MINUTES = 4 * 60;

let cache: Cache | null = null;

function belgradeParts(ts: number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ts));

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function todayKey(): string {
  return belgradeParts(Date.now()).date;
}

function hhmmToMinutes(hhmm: string): number {
  const match = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

function refreshThresholdMinutes(sabahu: string): number {
  const mins = hhmmToMinutes(sabahu);
  if (!Number.isFinite(mins) || mins <= 0) {
    return BOOTSTRAP_THRESHOLD_MINUTES;
  }
  return Math.max(0, mins - REFRESH_LEAD_MINUTES);
}

function shouldInvalidate(c: Cache): boolean {
  const now = belgradeParts(Date.now());
  if (c.cachedDate !== now.date) return true;

  const scraped = belgradeParts(c.scrapedAt);
  const threshold = refreshThresholdMinutes(c.data.prayers.sabahu);

  // Re-scrape exactly once per day: when we cross the threshold for a cache
  // that was created before it (typically: a 00:05 cold-start fetched while
  // bislame.net was still publishing yesterday's times).
  return (
    scraped.date === c.cachedDate &&
    scraped.minutes < threshold &&
    now.minutes >= threshold
  );
}

export async function getPrayerData(): Promise<PrayerTimes> {
  if (cache && !shouldInvalidate(cache)) {
    return cache.data;
  }

  const data = await scrapePrayerTimes();
  cache = { data, cachedDate: todayKey(), scrapedAt: Date.now() };
  return data;
}

export function getCachedPrayerData(): PrayerTimes | null {
  return cache?.data ?? null;
}

export function clearPrayerCache(): void {
  cache = null;
}
