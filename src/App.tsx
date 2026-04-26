import { useMemo } from "react";
import { useClock } from "./hooks/useClock";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import { useWeather } from "./hooks/useWeather";
import { useAutoReload } from "./hooks/useAutoReload";
import { useThemeMode } from "./hooks/useThemeMode";
import { useFullscreenKiosk } from "./hooks/useFullscreenKiosk";
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
import { timeToMinutes, nowInBelgrade, isFridayInBelgrade, pad2 } from "./utils/time";
import { ClockDisplay } from "./components/ClockDisplay";
import { PrayerCard } from "./components/PrayerCard";
import { CountdownBanner } from "./components/CountdownBanner";
import { WeatherWidget } from "./components/WeatherWidget";
import { PrayerModal, type PrayerModalSpec } from "./components/PrayerModal";
import { ADHAN_DUA, IQAMAH_AYAH } from "./utils/dua";
import { WifiOff } from "lucide-react";

/** Max time either the adhan or iqamah modal stays on screen. */
const MODAL_DURATION_MINUTES = 4;

/**
 * The "next prayer reminder" modal pops up for the first N minutes of every
 * 10-minute window (X:00–X:02, X:10–X:12, …) so worshippers passing by can
 * see a live countdown to the next prayer.
 */
const REMINDER_WINDOW_MINUTES = 2;

export default function App() {
  useAutoReload();
  const { hasInteracted } = useFullscreenKiosk();

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

  const isFriday = useMemo(
    () => isFridayInBelgrade(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clock.time],
  );

  // Light: Lindja e Diellit → Akshami.  Dark: Akshami → Lindja e Diellit.
  useThemeMode(currentMinutes, prayers);

  const activePrayerKey = useMemo(() => {
    if (!prayers) return null;
    for (const key of PRAYER_ORDER) {
      if (!ADHAN_PRAYER_KEYS.has(key)) continue;
      const prayerMinutes = timeToMinutes(prayers[key]);
      const iqamahTime = getIqamahTime(key, prayers[key]);
      const iqamahMinutes = iqamahTime ? timeToMinutes(iqamahTime) : prayerMinutes + MODAL_DURATION_MINUTES;
      const adhanEnd = Math.min(prayerMinutes + MODAL_DURATION_MINUTES, iqamahMinutes);
      if (currentMinutes >= prayerMinutes && currentMinutes < adhanEnd) return key;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayers, currentMinutes]);

  const iqamahActivePrayerKey = useMemo(() => {
    if (!prayers) return null;
    for (const key of PRAYER_ORDER) {
      if (!ADHAN_PRAYER_KEYS.has(key)) continue;
      const iqamahTime = getIqamahTime(key, prayers[key]);
      if (!iqamahTime) continue;
      const iqamahMinutes = timeToMinutes(iqamahTime);
      if (
        currentMinutes >= iqamahMinutes &&
        currentMinutes < iqamahMinutes + MODAL_DURATION_MINUTES
      )
        return key;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayers, currentMinutes]);

  // Minutes until the next scheduled adhan or iqamah event. Used to keep the
  // reminder from opening if it would be interrupted mid-window by another
  // modal (which would otherwise visually overlap during the exit animation).
  const minutesToNextScheduledModal = useMemo(() => {
    if (!prayers) return Infinity;
    let min = Infinity;
    for (const key of PRAYER_ORDER) {
      if (!ADHAN_PRAYER_KEYS.has(key)) continue;
      const adhanMin = timeToMinutes(prayers[key]);
      const iqamahTime = getIqamahTime(key, prayers[key]);
      const modes = iqamahTime ? [adhanMin, timeToMinutes(iqamahTime)] : [adhanMin];
      for (const m of modes) {
        const delta = m - currentMinutes;
        if (delta >= 0 && delta < min) min = delta;
      }
    }
    return min;
  }, [prayers, currentMinutes]);

  // True while we're inside the adhan → iqamah gap for any prayer.
  const isBetweenAdhanAndIqamah = useMemo(() => {
    if (!prayers) return false;
    for (const key of PRAYER_ORDER) {
      if (!ADHAN_PRAYER_KEYS.has(key)) continue;
      const adhanMin = timeToMinutes(prayers[key]);
      const iqamahTime = getIqamahTime(key, prayers[key]);
      if (!iqamahTime) continue;
      const iqamahMin = timeToMinutes(iqamahTime);
      if (currentMinutes >= adhanMin && currentMinutes < iqamahMin) return true;
    }
    return false;
  }, [prayers, currentMinutes]);

  // Reminder modal: show at every 10-min boundary for REMINDER_WINDOW_MINUTES,
  // but never while — or just before — the adhan or iqamah modal is visible,
  // nor anywhere inside the adhan → iqamah gap.
  const reminderPrayerKey = useMemo(() => {
    if (!prayers || !nextPrayer) return null;
    if (activePrayerKey || iqamahActivePrayerKey) return null;
    if (isBetweenAdhanAndIqamah) return null;
    if (currentMinutes % 10 >= REMINDER_WINDOW_MINUTES) return null;
    // Skip entirely if another modal will fire during this window.
    if (minutesToNextScheduledModal < REMINDER_WINDOW_MINUTES) return null;
    return nextPrayer.key;
  }, [
    prayers,
    nextPrayer,
    activePrayerKey,
    iqamahActivePrayerKey,
    isBetweenAdhanAndIqamah,
    currentMinutes,
    minutesToNextScheduledModal,
  ]);

  const reminderLabel = reminderPrayerKey
    ? isFriday && reminderPrayerKey === "dreka"
      ? "E Xhuma"
      : PRAYER_LABELS[reminderPrayerKey]
    : "";
  const reminderTime =
    reminderPrayerKey && prayers ? prayers[reminderPrayerKey] : "--:--";

  // Single priority-ordered modal slot.
  const modalSpec = useMemo<PrayerModalSpec | null>(() => {
    if (activePrayerKey) {
      return {
        id: `adhan:${activePrayerKey}`,
        prayerKey: activePrayerKey,
        title:
          isFriday && activePrayerKey === "dreka"
            ? "Koha e Namazit të Xhumasë"
            : PRAYER_MODAL_TITLES[activePrayerKey],
        content: <AdhanModalContent />,
      };
    }
    if (iqamahActivePrayerKey) {
      return {
        id: `iqamah:${iqamahActivePrayerKey}`,
        prayerKey: iqamahActivePrayerKey,
        title: "Namazi po fillon",
        content: <IqamahModalContent />,
      };
    }
    if (reminderPrayerKey) {
      return {
        id: `reminder:${reminderPrayerKey}`,
        prayerKey: reminderPrayerKey,
        title: "Namazi i ardhshëm",
        content: (
          <ReminderModalContent
            label={reminderLabel}
            time={reminderTime}
            countdown={countdown}
          />
        ),
      };
    }
    return null;
  }, [
    activePrayerKey,
    iqamahActivePrayerKey,
    reminderPrayerKey,
    isFriday,
    reminderLabel,
    reminderTime,
    countdown,
  ]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="grid grid-cols-3 shrink-0 items-center border-b border-border/60 bg-card/80 px-10 py-4 backdrop-blur-sm">
        <div className="flex items-end gap-4">
          <div className="flex size-[3.5vw] items-center justify-center">
            <img
              src="https://bislame.net/wp-content/uploads/2017/01/logore.png"
              alt="Xhamia Medina"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[1.5vw] font-black leading-none text-foreground uppercase">
              Xhamia Medina
            </h1>
            <p className="text-[0.78vw] font-semibold text-primary/85 tracking-[0.28em] uppercase">
              Prishtinë · Kosovë
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <ClockDisplay clock={clock} />
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="text-muted-foreground/85 text-[0.72vw] font-semibold uppercase tracking-[0.28em]">
            Bashkësia Islame e Kosovës
          </span>
          <span className="text-primary/85 text-[0.8vw] font-semibold tracking-wide">
            bislame.net/namazet
          </span>
          {isStale && (
            <span className="animate-pulse inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[0.65vw] font-bold text-amber-400 uppercase tracking-widest">
              <WifiOff className="size-[0.7vw]" strokeWidth={2.5} />
              Pa lidhje
            </span>
          )}
        </div>
      </header>

      {/* ── Countdown banner ──────────────────────────────── */}
      <div className="shrink-0">
        {countdown ? (
          <CountdownBanner countdown={countdown} />
        ) : (
          <div className="py-5 text-center text-[1vw] font-medium text-muted-foreground/80">
            Duke ngarkuar kohët e namazit…
          </div>
        )}
      </div>

      {/* ── Prayer cards grid ─────────────────────────────── */}
      <main className="flex-1 grid grid-cols-3 grid-rows-2 gap-5 px-8 py-6">
        {PRAYER_ORDER.map((key) => {
          const time = prayers?.[key] ?? "--:--";
          const isCurrent = currentPrayer?.key === key;
          const iqamahTime = time !== "--:--" ? getIqamahTime(key, time) : null;

          const isFridayDreka = isFriday && key === "dreka";
          const label = isFridayDreka ? "E Xhuma" : PRAYER_LABELS[key];

          return (
            <PrayerCard
              key={key}
              prayerKey={key}
              label={label}
              time={time}
              iqamahTime={iqamahTime}
              isCurrent={isCurrent}
            />
          );
        })}
      </main>

      {/* ── Single modal slot (adhan > iqamah > reminder priority) ─ */}
      <PrayerModal spec={modalSpec} />

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="flex shrink-0 items-center justify-between border-t border-border/60 bg-card/80 px-10 py-3 backdrop-blur-sm">
        <WeatherWidget weather={weather} loading={weatherLoading} />

        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end">
            <p className="text-muted-foreground/80 text-[0.72vw] font-semibold uppercase tracking-[0.28em]">
              Data e sotme
            </p>
            <p className="text-foreground/90 text-[1vw] font-bold tracking-wide">
              {prayerData?.date ?? "—"}
            </p>
          </div>
        </div>
      </footer>

      {/* ── Kiosk Entry Overlay ───────────────────────────── */}
      {!hasInteracted && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-lg text-white">
          <div className="flex flex-col items-center animate-pulse">
            <svg className="size-[8vw] mb-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <h2 className="text-[3vw] font-black tracking-widest uppercase text-center">
              Kiosk Mode
            </h2>
            <p className="text-[1.3vw] font-medium text-white/70 mt-3 tracking-widest uppercase">
              Prek ekranin ose shtyp një buton për të filluar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AdhanModalContent() {
  return (
    <>
      <h3
        className="text-center text-[1.5vw] font-bold leading-none tracking-[0.4em] text-white/70 uppercase"
        style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.4s ease forwards" }}
      >
        Duaja e Ezanit
      </h3>
      <p
        className="text-center text-[3.6vw] font-medium leading-[1.85] text-white max-w-[82vw]"
        dir="rtl"
        lang="ar"
        style={{
          fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
          opacity: 0,
          animation: "adhan-text-in 0.5s 0.5s ease forwards",
        }}
      >
        {ADHAN_DUA.arabic}
      </p>
      <div className="h-px w-[8vw] bg-white/25" />
      <p
        className="text-center text-[2.1vw] font-medium leading-[1.55] text-white/95 max-w-[78vw]"
        style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.6s ease forwards" }}
      >
        {ADHAN_DUA.albanian}
      </p>
      <p
        className="text-center text-[1.35vw] italic leading-relaxed text-white/55 max-w-[72vw]"
        style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.75s ease forwards" }}
      >
        {ADHAN_DUA.english}
      </p>
    </>
  );
}

function IqamahModalContent() {
  return (
    <>
      <h3
        className="text-center text-[1.5vw] font-bold leading-none tracking-[0.4em] text-white/70 uppercase"
        style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.4s ease forwards" }}
      >
        Ajet Kur&apos;anor
      </h3>
      <p
        className="text-center text-[4.2vw] font-medium leading-[1.7] text-white max-w-[82vw]"
        dir="rtl"
        lang="ar"
        style={{
          fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
          opacity: 0,
          animation: "adhan-text-in 0.5s 0.5s ease forwards",
        }}
      >
        {IQAMAH_AYAH.arabic}
      </p>
      <div className="h-px w-[8vw] bg-white/25" />
      <p
        className="text-center text-[2.2vw] font-medium leading-[1.55] text-white/95 max-w-[78vw]"
        style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.6s ease forwards" }}
      >
        {IQAMAH_AYAH.albanian}
      </p>
      <p
        className="text-center text-[1.4vw] font-semibold tracking-[0.32em] text-white/55 uppercase"
        style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.75s ease forwards" }}
      >
        — {IQAMAH_AYAH.source}
      </p>
    </>
  );
}

function ReminderModalContent({
  label,
  time,
  countdown,
}: {
  label: string;
  time: string;
  countdown: ReturnType<typeof computeCountdown> | null;
}) {
  return (
    <>
      <h3
        className="text-center uppercase text-[5.2vw] font-black leading-none tracking-tight text-white"
        style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.4s ease forwards" }}
      >
        {label}
      </h3>
      {countdown && (
        <div
          className="flex items-end justify-center gap-4 tabular-nums"
          style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.55s ease forwards" }}
        >
          {countdown.hours > 0 && (
            <>
              <ReminderDigit value={countdown.hours} label="orë" />
              <ReminderColon />
            </>
          )}
          <ReminderDigit value={countdown.minutes} label="minuta" />
          <ReminderColon />
          <ReminderDigit value={countdown.seconds} label="sekonda" pulse />
        </div>
      )}
      <div
        className="flex items-baseline justify-center gap-6"
        style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.7s ease forwards" }}
      >
        <span className="text-[1.45vw] font-semibold tracking-[0.4em] text-white/65 uppercase">
          Në orën
        </span>
        <span className="text-[3.2vw] font-black tabular-nums leading-none text-white">
          {time}
        </span>
      </div>
    </>
  );
}

function ReminderDigit({
  value,
  label,
  pulse = false,
}: {
  value: number;
  label: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex min-w-[9.5vw] flex-col items-center">
      <span
        className={`text-white text-[8.5vw] font-black tabular-nums leading-none ${pulse ? "countdown-pulse" : ""
          }`}
      >
        {pad2(value)}
      </span>
      <span className="mt-4 text-white/70 text-[1.3vw] font-semibold uppercase tracking-[0.32em]">
        {label}
      </span>
    </div>
  );
}

function ReminderColon() {
  return (
    <span className="self-start pt-3 text-white/40 text-[6vw] font-light leading-none">
      :
    </span>
  );
}
