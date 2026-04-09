import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PrayerKey } from "../types";

type Props = {
  activePrayerKey: PrayerKey | null;
  title: string;
  children: ReactNode;
};

export function PrayerModal({ activePrayerKey, title, children }: Props) {
  const [visibleKey, setVisibleKey] = useState<PrayerKey | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

    if (activePrayerKey) {
      setIsExiting(false);
      setVisibleKey(activePrayerKey);
    } else if (visibleKey) {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setVisibleKey(null);
        setIsExiting(false);
      }, 420);
    }

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePrayerKey]);

  if (!visibleKey) return null;

  const backdropClass = isExiting ? "adhan-backdrop-out" : "adhan-backdrop-in";
  const cardClass = isExiting ? "adhan-card-out" : "adhan-card-in";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-lg ${backdropClass}`}
    >
      <div
        className={`adhan-glow-pulse relative mx-auto flex w-[72vw] max-w-5xl flex-col items-center gap-6 rounded-3xl border border-primary/30 bg-primary/80 px-16 py-12 shadow-2xl ${cardClass}`}
      >
        <h2
          className="text-center text-[3.5vw] font-bold leading-tight tracking-tight text-white"
          style={{ opacity: 0, animation: "adhan-title-in 0.55s 0.15s ease forwards" }}
        >
          🕌 {title} 🕌
        </h2>

        <div className="w-24 border-t border-primary/30" />

        {children}
      </div>
    </div>
  );
}
