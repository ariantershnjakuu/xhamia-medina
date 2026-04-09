import { scrapePrayerTimes } from "../scrapers/bislame.js";
import type { PrayerTimes } from "../scrapers/bislame.js";

type Cache = {
  data: PrayerTimes;
  cachedDate: string;
};

let cache: Cache | null = null;

function todayKey(): string {
  return new Date().toLocaleDateString("sv", { timeZone: "Europe/Belgrade" });
}

export async function getPrayerData(): Promise<PrayerTimes> {
  const today = todayKey();

  if (cache && cache.cachedDate === today) {
    return cache.data;
  }

  const data = await scrapePrayerTimes();
  cache = { data, cachedDate: today };
  return data;
}

export function getCachedPrayerData(): PrayerTimes | null {
  return cache?.data ?? null;
}

export function clearPrayerCache(): void {
  cache = null;
}
