import type { PrayerKey, PrayerTimes, Countdown } from "../types";
import { timeToMinutes, nowInBelgrade, pad2 } from "./time";

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  sabahu: "Sabahu",
  lindja: "Lindja e Diellit",
  dreka: "Dreka",
  ikindia: "Ikindia",
  akshami: "Akshami",
  jacia: "Jacia",
};

export const PRAYER_ORDER: PrayerKey[] = [
  "sabahu",
  "lindja",
  "dreka",
  "ikindia",
  "akshami",
  "jacia",
];

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
