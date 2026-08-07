import { useEffect, useRef } from "react";
import { nowInBelgrade, pad2 } from "../utils/time";

// Pull the new day's times from 00:05 onwards. 00:05 is safe: Sabahu in Kosovo
// is never before 03:00 AM even in midsummer, and it gives bislame.net a few
// minutes to flip its published schedule over to the new date.
const REFRESH_AFTER_MINUTE = 5;

// How often we compare the Belgrade wall clock against the last refreshed day.
// A short poll (rather than one ~24h setTimeout) survives a TV that suspends,
// a throttled background tab, and DST shifts — all of which make a long timer
// fire late or not at all.
const CHECK_INTERVAL_MS = 30_000;

/** "YYYY-MM-DD" for a Date whose fields already hold Belgrade wall-clock time. */
export function belgradeDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Is a new-day refetch due? Pure so the rollover edge cases (00:00–00:04,
 * 00:05, waking up late on a new day) can be reasoned about and tested
 * without a clock.
 */
export function isNewDayRefreshDue(lastRefreshedDay: string, now: Date): boolean {
  if (belgradeDayKey(now) === lastRefreshedDay) return false;

  // New calendar day, but hold off until 00:05. Anything past 00:xx means we
  // woke up late (TV resumed from sleep, timer throttled) — refetch now.
  if (now.getHours() === 0 && now.getMinutes() < REFRESH_AFTER_MINUTE) return false;

  return true;
}

/**
 * Runs `onNewDay` once per calendar day, from 00:05 Belgrade time onwards, so
 * the board immediately shows the new day's prayer times.
 *
 * This deliberately does NOT call window.location.reload(). A reload unloads
 * the document, which drops the browser out of fullscreen — and the Fullscreen
 * API can only be re-entered from a real user gesture, so after a nightly
 * reload the kiosk would sit un-fullscreened until someone walked up and tapped
 * it. Refetching the data in place leaves the kiosk fullscreen untouched.
 *
 * The clock/date roll over on their own (useClock ticks every second) and the
 * 15-minute poll in usePrayerTimes is a backstop, so an in-place refetch is all
 * the new day actually needs.
 */
export function useDailyRefresh(onNewDay: () => void) {
  // Keep the latest callback in a ref so re-renders don't reset the timer.
  const callbackRef = useRef(onNewDay);
  useEffect(() => {
    callbackRef.current = onNewDay;
  }, [onNewDay]);

  useEffect(() => {
    // Seed with today so mounting is never treated as a rollover —
    // usePrayerTimes already fetches once on mount.
    let lastRefreshedDay = belgradeDayKey(nowInBelgrade());
    console.info(`[dailyRefresh] armed — current Belgrade day ${lastRefreshedDay}`);

    const check = () => {
      const now = nowInBelgrade();
      if (!isNewDayRefreshDue(lastRefreshedDay, now)) return;

      lastRefreshedDay = belgradeDayKey(now);
      console.info(
        `[dailyRefresh] new day ${lastRefreshedDay} — refetching prayer times in place`,
      );
      callbackRef.current();
    };

    const intervalId = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);
}
