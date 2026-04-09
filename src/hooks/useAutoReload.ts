import { useEffect } from "react";

// Reload at 00:05 every night — fresh prayer times, fresh memory, fresh state.
// 00:05 is safe: Sabahu in Kosovo is never before 03:00 AM even in midsummer.
const RELOAD_HOUR = 0;
const RELOAD_MINUTE = 5;

function msUntilNextReload(): number {
  const now = new Date();

  // Next reload target: today at 00:05, or tomorrow at 00:05 if already past
  const target = new Date(now);
  target.setHours(RELOAD_HOUR, RELOAD_MINUTE, 0, 0);

  if (target.getTime() <= now.getTime()) {
    // Already past today's 00:05 — aim for tomorrow
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

/**
 * Schedules a hard window.location.reload() at 00:05 every night.
 * This prevents memory accumulation on a TV that never gets turned off,
 * and ensures fresh prayer times for the new day load immediately.
 */
export function useAutoReload() {
  useEffect(() => {
    const scheduleReload = () => {
      const delay = msUntilNextReload();
      const hours = Math.floor(delay / 3_600_000);
      const mins = Math.floor((delay % 3_600_000) / 60_000);
      console.info(
        `[autoReload] next reload scheduled in ${hours}h ${mins}m (at 00:05)`
      );

      const id = setTimeout(() => {
        console.info("[autoReload] reloading page for new day");
        window.location.reload();
      }, delay);

      return id;
    };

    const id = scheduleReload();
    return () => clearTimeout(id);
  }, []);
}
