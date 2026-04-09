import { useMemo } from "react";
import { useClock } from "./hooks/useClock";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import { useWeather } from "./hooks/useWeather";
import { useAutoReload } from "./hooks/useAutoReload";
import {
  PRAYER_ORDER,
  PRAYER_LABELS,
  getNextPrayer,
  computeCountdown,
} from "./utils/prayer";
import { timeToMinutes, nowInBelgrade } from "./utils/time";
import { ClockDisplay } from "./components/ClockDisplay";
import { PrayerCard } from "./components/PrayerCard";
import { CountdownBanner } from "./components/CountdownBanner";
import { WeatherWidget } from "./components/WeatherWidget";
import { IslamicPattern } from "./components/IslamicPattern";

export default function App() {
  useAutoReload(); // schedules daily hard reload at 00:05 for memory & fresh data

  const clock = useClock();
  const { data: prayerData, isStale } = usePrayerTimes();
  const { data: weather, loading: weatherLoading } = useWeather();

  const prayers = prayerData?.prayers ?? null;

  const nextPrayer = useMemo(
    () => (prayers ? getNextPrayer(prayers) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prayers, clock.time]
  );

  const countdown = useMemo(
    () =>
      prayers && nextPrayer ? computeCountdown(nextPrayer.key, prayers) : null,
    [prayers, nextPrayer, clock.time]
  );

  const currentMinutes = useMemo(() => {
    const now = nowInBelgrade();
    return now.getHours() * 60 + now.getMinutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock.time]);

  return (
    <div className="takvim-bg relative w-screen h-screen overflow-hidden flex flex-col">
      <IslamicPattern />

      {/* ── Header ────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-center justify-between px-10 py-4 flex-shrink-0"
        style={{
          background: "rgba(7,13,26,0.75)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Mosque name + location */}
        <div className="flex items-center gap-4">
          <span className="text-[2.8vw] leading-none">🕌</span>
          <div>
            <h1 className="text-[1.9vw] font-bold text-white tracking-wider leading-tight">
              Xhamia Dardania
            </h1>
            <p
              className="text-[0.85vw] tracking-[0.3em] uppercase"
              style={{ color: "rgba(186,230,253,0.45)" }}
            >
              Prishtinë · Kosovë
            </p>
          </div>
        </div>

        {/* Live clock — center piece */}
        <ClockDisplay clock={clock} />

        {/* Right side — source + stale warning */}
        <div className="flex flex-col items-end gap-1 min-w-[10vw]">
          <span
            className="text-[0.8vw] uppercase tracking-widest"
            style={{ color: "rgba(186,230,253,0.35)" }}
          >
            Bashkësia Islame e Kosovës
          </span>
          <span
            className="text-[0.85vw] font-medium"
            style={{ color: "rgba(52,211,153,0.65)" }}
          >
            bislame.net/namazet
          </span>
          {isStale && (
            <span
              className="text-[0.72vw] animate-pulse"
              style={{ color: "rgba(251,191,36,0.70)" }}
            >
              ⚠ cache — pa lidhje
            </span>
          )}
        </div>
      </header>

      {/* ── Countdown banner ──────────────────────────────── */}
      <div className="relative z-10 flex-shrink-0">
        {countdown ? (
          <CountdownBanner countdown={countdown} />
        ) : (
          <div
            className="py-4 text-center text-[1vw]"
            style={{ color: "rgba(186,230,253,0.30)" }}
          >
            Duke ngarkuar kohët e namazit…
          </div>
        )}
      </div>

      {/* ── Prayer cards ──────────────────────────────────── */}
      <main className="relative z-10 flex-1 grid grid-cols-3 grid-rows-2 gap-4 px-8 py-4">
        {PRAYER_ORDER.map((key) => {
          const time = prayers?.[key] ?? "--:--";
          const prayerMinutes = prayers ? timeToMinutes(prayers[key]) : -1;
          const isNext = nextPrayer?.key === key;
          const isPast =
            !isNext && prayerMinutes < currentMinutes && prayerMinutes >= 0;

          return (
            <PrayerCard
              key={key}
              prayerKey={key}
              label={PRAYER_LABELS[key]}
              time={time}
              isNext={isNext}
              isPast={isPast}
            />
          );
        })}
      </main>

      {/* ── Footer / Weather ──────────────────────────────── */}
      <footer
        className="relative z-10 flex items-center justify-between px-10 py-3 flex-shrink-0"
        style={{
          background: "rgba(7,13,26,0.75)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <WeatherWidget weather={weather} loading={weatherLoading} />

        <div className="flex flex-col items-center">
          <p
            className="text-[0.8vw] uppercase tracking-[0.25em]"
            style={{ color: "rgba(186,230,253,0.30)" }}
          >
            Zona kohore
          </p>
          <p
            className="text-[0.95vw] font-medium"
            style={{ color: "rgba(186,230,253,0.55)" }}
          >
            Europe / Belgrade
          </p>
        </div>

        <div className="text-right">
          <p
            className="text-[0.8vw] uppercase tracking-widest"
            style={{ color: "rgba(186,230,253,0.30)" }}
          >
            Data e sotme
          </p>
          <p
            className="text-[0.95vw] font-medium"
            style={{ color: "rgba(186,230,253,0.60)" }}
          >
            {prayerData?.date ?? "—"}
          </p>
        </div>
      </footer>
    </div>
  );
}
