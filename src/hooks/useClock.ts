import { useState, useEffect } from "react";
import type { ClockState } from "../types";
import { nowInBelgrade, formatClock, formatDate } from "../utils/time";

export function useClock(): ClockState {
  const [state, setState] = useState<ClockState>(() => {
    const now = nowInBelgrade();
    return { time: formatClock(now), date: formatDate(now), dayName: "" };
  });

  useEffect(() => {
    const tick = () => {
      const now = nowInBelgrade();
      setState({ time: formatClock(now), date: formatDate(now), dayName: "" });
    };

    // Align first tick to the next whole second, then run every 1000ms
    let intervalId: ReturnType<typeof setInterval>;
    const msToNextSecond = 1000 - (Date.now() % 1000);

    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 1000);
    }, msToNextSecond);

    // Both the initial timeout AND the subsequent interval must be cleaned up
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return state;
}
