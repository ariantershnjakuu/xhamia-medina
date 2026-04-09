import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
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

export default function App() {
  useAutoReload();

  const clock = useClock();
  const { data: prayerData, isStale } = usePrayerTimes();
  const { data: weather, loading: weatherLoading } = useWeather();

  const prayers = prayerData?.prayers ?? null;

  const nextPrayer = useMemo(
    () => (prayers ? getNextPrayer(prayers) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prayers, clock.time],
  );

  const countdown = useMemo(
    () =>
      prayers && nextPrayer ? computeCountdown(nextPrayer.key, prayers) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prayers, nextPrayer, clock.time],
  );

  const currentMinutes = useMemo(() => {
    const now = nowInBelgrade();
    return now.getHours() * 60 + now.getMinutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock.time]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card/80 px-10 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-[2.4vw] leading-none">🕌</span>
          <div>
            <h1 className="text-[1.8vw] font-semibold tracking-tight leading-tight text-foreground">
              Xhamia Dardania
            </h1>
            <p className="text-[0.8vw] text-muted-foreground tracking-[0.2em] uppercase">
              Prishtinë · Kosovë
            </p>
          </div>
        </div>

        <Separator orientation="vertical" className="h-10" />

        <ClockDisplay clock={clock} />

        <Separator orientation="vertical" className="h-10" />

        <div className="flex flex-col items-end gap-1 min-w-[9vw]">
          <span className="text-muted-foreground/60 text-[0.72vw] uppercase tracking-widest">
            Bashkësia Islame e Kosovës
          </span>
          <span className="text-primary text-[0.8vw] font-medium">
            bislame.net/namazet
          </span>
          {isStale && (
            <span className="animate-pulse text-[0.68vw] text-amber-400/70">
              ⚠ pa lidhje — cache
            </span>
          )}
        </div>
      </header>

      {/* ── Countdown banner ──────────────────────────────── */}
      <div className="shrink-0">
        {countdown ? (
          <CountdownBanner countdown={countdown} />
        ) : (
          <div className="py-4 text-center text-[1vw] text-muted-foreground/50">
            Duke ngarkuar kohët e namazit…
          </div>
        )}
      </div>

      {/* ── Prayer cards grid ─────────────────────────────── */}
      <main className="flex-1 grid grid-cols-3 grid-rows-2 gap-5 px-8 py-5">
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

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="flex shrink-0 items-center justify-between border-t border-border/60 bg-card/80 px-10 py-3 backdrop-blur-sm">
        <WeatherWidget weather={weather} loading={weatherLoading} />

        <div className="flex flex-col items-center">
          <p className="text-muted-foreground/50 text-[0.75vw] uppercase tracking-[0.2em]">
            Zona kohore
          </p>
          <p className="text-foreground/80 text-[0.9vw] font-medium">
            Europe / Belgrade
          </p>
        </div>

        <div className="text-right">
          <p className="text-muted-foreground/50 text-[0.75vw] uppercase tracking-widest">
            Data e sotme
          </p>
          <p className="text-foreground/80 text-[0.9vw] font-medium">
            {prayerData?.date ?? "—"}
          </p>
        </div>
      </footer>
    </div>
  );
}
