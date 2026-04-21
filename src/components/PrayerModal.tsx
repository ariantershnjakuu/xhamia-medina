import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Moon,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Stars,
  type LucideIcon,
} from "lucide-react";
import type { PrayerKey } from "../types";

const PRAYER_ICONS: Record<PrayerKey, LucideIcon> = {
  sabahu: Moon,
  lindja: Sunrise,
  dreka: Sun,
  ikindia: CloudSun,
  akshami: Sunset,
  jacia: Stars,
};

export type PrayerModalSpec = {
  /** Stable identifier per modal type + prayer key (e.g. "adhan:dreka"). */
  id: string;
  prayerKey: PrayerKey;
  title: string;
  content: ReactNode;
};

type Props = {
  spec: PrayerModalSpec | null;
};

const EXIT_MS = 420;

/**
 * Single modal slot shared by every event (adhan, iqamah, reminder). The
 * parent is responsible for picking which event "owns" the slot at any given
 * moment — we only ever render one card to the DOM, which makes it impossible
 * for a lower-priority modal (e.g. the reminder) to visually stack on top of
 * a higher-priority one during transition animations.
 */
export function PrayerModal({ spec }: Props) {
  const [cached, setCached] = useState<PrayerModalSpec | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (spec) {
      // Fresh enter, live update, or instant swap to a new spec id. The inner
      // card is keyed by spec.id, so a different id remounts with a new
      // entrance animation instead of overlaying the previous card.
      setCached(spec);
      setIsExiting(false);
    } else if (cached) {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setCached(null);
        setIsExiting(false);
      }, EXIT_MS);
    }

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  if (!cached) return null;

  const backdropClass = isExiting ? "adhan-backdrop-out" : "adhan-backdrop-in";
  const cardClass = isExiting ? "adhan-card-out" : "adhan-card-in";
  const Icon = PRAYER_ICONS[cached.prayerKey];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xl ${backdropClass}`}
    >
      <div
        key={cached.id}
        className={`adhan-glow-pulse relative mx-auto flex w-[92vw] max-w-none flex-col items-center gap-10 rounded-[2.5rem] border border-primary/30 bg-primary/85 px-20 py-14 shadow-2xl ${cardClass}`}
      >
        <Icon
          className="size-[4.5vw] text-white/85"
          strokeWidth={1.6}
          style={{ opacity: 0, animation: "adhan-title-in 0.55s 0.1s ease forwards" }}
        />

        <h2
          className="text-center text-[4.4vw] font-bold leading-[1.05] tracking-tight text-white"
          style={{ opacity: 0, animation: "adhan-title-in 0.55s 0.2s ease forwards" }}
        >
          {cached.title}
        </h2>

        <div
          className="flex items-center gap-4"
          style={{ opacity: 0, animation: "adhan-text-in 0.5s 0.3s ease forwards" }}
        >
          <span className="block h-px w-[10vw] bg-linear-to-r from-transparent to-white/40" />
          <span className="size-[0.6vw] rounded-full bg-white/70" />
          <span className="block h-px w-[10vw] bg-linear-to-l from-transparent to-white/40" />
        </div>

        {cached.content}
      </div>
    </div>
  );
}
