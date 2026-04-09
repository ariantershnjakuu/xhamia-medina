import { useMemo } from "react";
import { useClock } from "./hooks/useClock";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import { useWeather } from "./hooks/useWeather";
import { useAutoReload } from "./hooks/useAutoReload";
import {
  PRAYER_ORDER,
  PRAYER_LABELS,
  PRAYER_MODAL_TITLES,
  ADHAN_PRAYER_KEYS,
  getNextPrayer,
  getCurrentPrayer,
  computeCountdown,
  getIqamahTime,
} from "./utils/prayer";
import { timeToMinutes, nowInBelgrade, isFridayInBelgrade } from "./utils/time";
import { ClockDisplay } from "./components/ClockDisplay";
import { PrayerCard } from "./components/PrayerCard";
import { CountdownBanner } from "./components/CountdownBanner";
import { WeatherWidget } from "./components/WeatherWidget";
import { PrayerModal } from "./components/PrayerModal";
import { ADHAN_DUA, IQAMAH_AYAH } from "./utils/dua";

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

  const currentPrayer = useMemo(
    () => (prayers ? getCurrentPrayer(prayers) : null),
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

  // Recompute once per clock tick so it flips at midnight automatically
  const isFriday = useMemo(
    () => isFridayInBelgrade(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clock.time],
  );

  const activePrayerKey = useMemo(() => {
    if (!prayers) return null;
    for (const key of PRAYER_ORDER) {
      if (!ADHAN_PRAYER_KEYS.has(key)) continue;
      const prayerMinutes = timeToMinutes(prayers[key]);
      const iqamahMinutes = timeToMinutes(getIqamahTime(key, prayers[key]));
      if (currentMinutes >= prayerMinutes && currentMinutes < iqamahMinutes) return key;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayers, currentMinutes]);

  const iqamahActivePrayerKey = useMemo(() => {
    if (!prayers) return null;
    for (const key of PRAYER_ORDER) {
      if (!ADHAN_PRAYER_KEYS.has(key)) continue;
      const iqamahMinutes = timeToMinutes(getIqamahTime(key, prayers[key]));
      if (currentMinutes >= iqamahMinutes && currentMinutes < iqamahMinutes + 5) return key;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayers, currentMinutes]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="grid grid-cols-3 shrink-0 items-center border-b border-border/60 bg-card/80 px-10 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <img src="https://bislame.net/wp-content/uploads/2017/01/logore.png" alt="Xhamia Dardania" className="w-10" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-tight text-foreground uppercase">
              Xhamia Dardania
            </h1>
            <p className="text-[0.8vw] font-medium text-muted-foreground/90 tracking-[0.2em] uppercase">
              Prishtinë · Kosovë
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <ClockDisplay clock={clock} />
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-muted-foreground/85 text-[0.72vw] font-medium uppercase tracking-widest">
            Bashkësia Islame e Kosovës
          </span>
          <span className="text-primary text-[0.8vw] font-medium">
            bislame.net/namazet
          </span>
          {isStale && (
            <span className="animate-pulse inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[0.65vw] font-semibold text-amber-500/80 uppercase tracking-widest">
              ⚠ pa lidhje
            </span>
          )}
        </div>
      </header>

      {/* ── Countdown banner ──────────────────────────────── */}
      <div className="shrink-0">
        {countdown ? (
          <CountdownBanner countdown={countdown} />
        ) : (
          <div className="py-4 text-center text-[1vw] font-medium text-muted-foreground/80">
            Duke ngarkuar kohët e namazit…
          </div>
        )}
      </div>

      {/* ── Prayer cards grid ─────────────────────────────── */}
      <main className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 px-8 py-5 bg-teal-900/10">
        {PRAYER_ORDER.map((key) => {
          const time = prayers?.[key] ?? "--:--";
          const prayerMinutes = prayers ? timeToMinutes(prayers[key]) : -1;
          const isCurrent = currentPrayer?.key === key;
          const iqamahTime =
            time !== "--:--" ? getIqamahTime(key, time) : "--:--";

          const isFridayDreka = isFriday && key === "dreka";
          const label = isFridayDreka ? "E Xhuma" : PRAYER_LABELS[key];

          // "Tani" badge only shows during the Adhan → Iqamah window
          const isAdhanActive =
            isCurrent &&
            prayerMinutes >= 0 &&
            currentMinutes >= prayerMinutes &&
            currentMinutes < timeToMinutes(iqamahTime);

          return (
            <PrayerCard
              key={key}
              prayerKey={key}
              label={label}
              time={time}
              iqamahTime={iqamahTime}
              isCurrent={isCurrent}
              isAdhanActive={isAdhanActive}
              hideIqamah={isFridayDreka}
            />
          );
        })}
      </main>

      {/* ── Adhan modal (adhan → iqamah window) ──────────── */}
      <PrayerModal
        activePrayerKey={activePrayerKey}
        title={
          isFriday && activePrayerKey === "dreka"
            ? "Koha e Namazit të Xhumasë"
            : PRAYER_MODAL_TITLES[activePrayerKey ?? "sabahu"]
        }
      >
        <h3
          className="text-center text-2xl font-bold leading-tight tracking-tight text-white/80 uppercase"
          style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.3s ease forwards" }}
        >
          Duaja e Ezanit
        </h3>
        <p
          className="text-center text-[2.2vw] font-medium leading-relaxed text-white/90"
          dir="rtl"
          lang="ar"
          style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', serif", opacity: 0, animation: "adhan-text-in 0.5s 0.4s ease forwards" }}
        >
          {ADHAN_DUA.arabic}
        </p>
        <div className="w-16 border-t border-primary/15" />
        <p
          className="text-center text-[1.1vw] leading-relaxed text-white/70"
          style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.55s ease forwards" }}
        >
          {ADHAN_DUA.albanian}
        </p>
        <p
          className="text-center text-[0.95vw] italic leading-relaxed text-white/45"
          style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.7s ease forwards" }}
        >
          {ADHAN_DUA.english}
        </p>
      </PrayerModal>

      {/* ── Iqamah modal (iqamah → iqamah + 5 min window) ── */}
      <PrayerModal activePrayerKey={iqamahActivePrayerKey} title="Namazi po fillon">
        <p
          className="text-center text-[2.4vw] font-medium leading-relaxed text-white/90"
          dir="rtl"
          lang="ar"
          style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', serif", opacity: 0, animation: "adhan-text-in 0.5s 0.3s ease forwards" }}
        >
          {IQAMAH_AYAH.arabic}
        </p>
        <div className="w-16 border-t border-primary/15" />
        <p
          className="text-center text-[1.15vw] leading-relaxed text-white/75"
          style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.5s ease forwards" }}
        >
          {IQAMAH_AYAH.albanian}
        </p>
        <p
          className="text-center text-[0.9vw] font-semibold tracking-widest text-white/50 uppercase"
          style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.65s ease forwards" }}
        >
          — {IQAMAH_AYAH.source}
        </p>
      </PrayerModal>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="flex shrink-0 items-center justify-between border-t border-border/60 bg-card/80 px-10 py-3 backdrop-blur-sm">
        <WeatherWidget weather={weather} loading={weatherLoading} />

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground/80 text-[0.75vw] font-medium uppercase tracking-[0.2em]">
              Zona kohore
            </p>
            <p className="text-foreground/90 text-[0.9vw] font-semibold">
              Europe / Prishtinë
            </p>
          </div>

          <div className="h-8 w-px bg-border/50" />

          <div className="flex flex-col items-center">
            <p className="text-muted-foreground/80 text-[0.75vw] font-medium uppercase tracking-[0.2em]">
              Data e sotme
            </p>
            <p className="text-foreground/90 text-[0.9vw] font-semibold">
              {prayerData?.date ?? "—"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
