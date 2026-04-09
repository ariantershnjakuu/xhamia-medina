import { useState, useEffect, useCallback } from "react";
import type { PrayerData, ApiResponse } from "../types";
import { MOCK_PRAYER_TIMES, applyMosqueRules } from "../utils/prayer";

type State = {
  data: PrayerData | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
};

// Poll every 15 minutes — fast enough to catch a midnight date change quickly
const POLL_INTERVAL_MS = 15 * 60 * 1000;

function makeFallback(): PrayerData {
  return {
    date: new Date().toLocaleDateString("sq"),
    source: "mock fallback",
    prayers: applyMosqueRules(MOCK_PRAYER_TIMES),
    updatedAt: new Date().toISOString(),
  };
}

export function usePrayerTimes(): State {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
    isStale: false,
  });

  // fetchPrayers is stable (empty dep array) so safe to use in event listeners
  const fetchPrayers = useCallback(async () => {
    try {
      const res = await fetch("/api/prayers", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: ApiResponse<PrayerData> = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error ?? "Unknown error");
      }

      setState({
        data: {
          ...json.data,
          prayers: applyMosqueRules(json.data.prayers),
        },
        loading: false,
        error: null,
        isStale: json.error === "stale_cache",
      });
    } catch (err) {
      console.warn("[usePrayerTimes] fetch failed, keeping existing data:", err);
      setState((prev) => ({
        // Keep live data if we have it; only degrade to mock on first failure
        data: prev.data ?? makeFallback(),
        loading: false,
        error: String(err),
        isStale: true,
      }));
    }
  }, []);

  useEffect(() => {
    fetchPrayers();

    // Regular 15-minute poll
    const pollId = setInterval(fetchPrayers, POLL_INTERVAL_MS);

    // Re-fetch immediately when the tab becomes visible (TV wakes from sleep, etc.)
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchPrayers();
    };

    // Re-fetch the moment the network comes back online
    const onOnline = () => {
      console.info("[usePrayerTimes] network restored — re-fetching");
      fetchPrayers();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(pollId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [fetchPrayers]);

  return state;
}
