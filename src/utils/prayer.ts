import type { PrayerKey, PrayerTimes, Countdown } from "../types";
import { timeToMinutes, nowInBelgrade, pad2, getBelgradeUTCOffsetHours } from "./time";

const IQAMAH_OFFSET_MINUTES: Partial<Record<PrayerKey, number>> = {
  sabahu: 15,
};

/**
 * Sabahu Adhan at this mosque is 45 minutes before Lindja e Diellit.

 * Apply this rule once after fetching so all downstream consumers are consistent.
 */
export function applyMosqueRules(prayers: PrayerTimes): PrayerTimes {
  const [lh, lm] = prayers.lindja.split(":").map(Number);
  const sabahuMinutes = lh * 60 + lm - 45;
  const sabahuH = Math.floor(sabahuMinutes / 60) % 24;
  const sabahuM = sabahuMinutes % 60;

  // Dreka is fixed: 13:00 in summer (UTC+2) and 12:00 in winter (UTC+1)
  const dreka = getBelgradeUTCOffsetHours() === 2 ? "13:00" : "12:00";

  return {
    ...prayers,
    sabahu: `${pad2(sabahuH)}:${pad2(sabahuM)}`,
    dreka,
  };
}

export function getIqamahTime(prayerKey: PrayerKey, adhanTime: string): string | null {
  const offset = IQAMAH_OFFSET_MINUTES[prayerKey];
  if (offset === undefined) return null;
  const [h, m] = adhanTime.split(":").map(Number);
  const totalMinutes = h * 60 + m + offset;
  const iqamahH = Math.floor(totalMinutes / 60) % 24;
  const iqamahM = totalMinutes % 60;
  return `${pad2(iqamahH)}:${pad2(iqamahM)}`;
}

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  sabahu: "Sabahu",
  lindja: "Lindja e Diellit",
  dreka: "Dreka",
  ikindia: "Ikindia",
  akshami: "Akshami",
  jacia: "Jacia",
};

export const PRAYER_MODAL_TITLES: Record<PrayerKey, string> = {
  sabahu: "Koha e Namazit të Sabahut",
  lindja: "",
  dreka: "Koha e Namazit të Drekës",
  ikindia: "Koha e Namazit të Ikindisë",
  akshami: "Koha e Namazit të Akshamit",
  jacia: "Koha e Namazit të Jacisë",
};

export const ADHAN_PRAYER_KEYS = new Set<PrayerKey>([
  "sabahu",
  "dreka",
  "ikindia",
  "akshami",
  "jacia",
]);

export const PRAYER_ORDER: PrayerKey[] = [
  "sabahu",
  "lindja",
  "dreka",
  "ikindia",
  "akshami",
  "jacia",
];

export function getCurrentPrayer(
  prayers: PrayerTimes
): { key: PrayerKey; label: string } | null {
  const now = nowInBelgrade();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let lastPassed: PrayerKey | null = null;
  for (const key of PRAYER_ORDER) {
    if (timeToMinutes(prayers[key]) <= currentMinutes) {
      lastPassed = key;
    }
  }

  return lastPassed ? { key: lastPassed, label: PRAYER_LABELS[lastPassed] } : null;
}

export function getNextPrayer(
  prayers: PrayerTimes
): { key: PrayerKey; label: string } {
  const now = nowInBelgrade();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const key of PRAYER_ORDER) {
    const prayerMinutes = timeToMinutes(prayers[key]);
    if (prayerMinutes > currentMinutes) {
      return { key, label: PRAYER_LABELS[key] };
    }
  }

  // Past Jacia — next is Sabahu tomorrow
  return { key: "sabahu", label: PRAYER_LABELS.sabahu };
}

export function computeCountdown(
  nextPrayerKey: PrayerKey,
  prayers: PrayerTimes
): Countdown {
  const now = nowInBelgrade();
  const currentSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const [ph, pm] = prayers[nextPrayerKey].split(":").map(Number);
  let prayerSeconds = ph * 3600 + pm * 60;

  // If next prayer is Sabahu (tomorrow), add 24h
  if (prayerSeconds <= currentSeconds) {
    prayerSeconds += 24 * 3600;
  }

  let diff = prayerSeconds - currentSeconds;
  const isJustPrayed = diff < 0 && diff > -300; // within 5 min after

  if (diff < 0) diff = 0;

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return {
    prayerKey: nextPrayerKey,
    prayerLabel: PRAYER_LABELS[nextPrayerKey],
    hours,
    minutes,
    seconds,
    isJustPrayed,
  };
}

export function formatCountdown(c: Countdown): string {
  if (c.hours > 0) {
    return `${pad2(c.hours)}:${pad2(c.minutes)}:${pad2(c.seconds)}`;
  }
  return `${pad2(c.minutes)}:${pad2(c.seconds)}`;
}

/** Fallback mock prayer times for testing when server is unavailable */
export const MOCK_PRAYER_TIMES: PrayerTimes = {
  sabahu: "04:18",
  lindja: "05:56",
  dreka: "12:40",
  ikindia: "16:21",
  akshami: "19:18",
  jacia: "20:39",
};
