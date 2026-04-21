import { useEffect } from "react";
import type { PrayerTimes } from "../types";
import { timeToMinutes } from "../utils/time";

export type ThemeMode = "light" | "dark";

/**
 * Daytime heuristic used before prayer data loads — roughly matches Kosovo
 * sunrise/sunset across the year. Prevents a dark→light flash on page load.
 */
const FALLBACK_DAY_START_MIN = 6 * 60;
const FALLBACK_DAY_END_MIN = 20 * 60;

/**
 * Light mode runs from Lindja e Diellit (sunrise) until Akshami (sunset).
 * Dark mode covers the rest of the day. Before prayer data is available,
 * we fall back to a coarse daytime window so the UI never flashes.
 */
export function computeThemeMode(
  currentMinutes: number,
  prayers: PrayerTimes | null,
): ThemeMode {
  if (!prayers) {
    return currentMinutes >= FALLBACK_DAY_START_MIN &&
      currentMinutes < FALLBACK_DAY_END_MIN
      ? "light"
      : "dark";
  }
  const sunrise = timeToMinutes(prayers.lindja);
  const sunset = timeToMinutes(prayers.akshami);
  return currentMinutes >= sunrise && currentMinutes < sunset
    ? "light"
    : "dark";
}

export function useThemeMode(
  currentMinutes: number,
  prayers: PrayerTimes | null,
): ThemeMode {
  const mode = computeThemeMode(currentMinutes, prayers);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return mode;
}
