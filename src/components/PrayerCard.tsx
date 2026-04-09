import type { PrayerKey } from "../types";
import { PRAYER_ICONS } from "../utils/prayer";

type Props = {
  prayerKey: PrayerKey;
  label: string;
  time: string;
  isNext: boolean;
  isPast: boolean;
};

export function PrayerCard({ prayerKey, label, time, isNext, isPast }: Props) {
  const cardClass = isNext ? "card-next" : isPast ? "card-past" : "card-base";

  return (
    <div
      className={`${cardClass} relative flex flex-col items-center justify-center gap-2 px-6 py-6 h-full`}
      style={isNext ? { transform: "scale(1.04)" } : undefined}
    >
      {/* "Radhës" badge — only on next */}
      {isNext && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[0.75vw] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg"
          style={{ background: "#34d399", color: "#070d1a" }}
        >
          Namazi i radhës
        </span>
      )}

      {/* Icon */}
      <span className="text-[3.2vw] leading-none">{PRAYER_ICONS[prayerKey]}</span>

      {/* Prayer name */}
      <p
        className="text-[1.05vw] font-semibold uppercase tracking-[0.2em] leading-none"
        style={{
          color: isNext
            ? "#6ee7b7"
            : isPast
            ? "rgba(255,255,255,0.35)"
            : "rgba(186,230,253,0.75)",
        }}
      >
        {label}
      </p>

      {/* Time */}
      <p
        className="text-[3vw] font-bold tabular-nums leading-none"
        style={{
          color: isNext
            ? "#ffffff"
            : isPast
            ? "rgba(255,255,255,0.30)"
            : "#ffffff",
        }}
      >
        {time}
      </p>

      {/* Thin bottom accent line for next prayer */}
      {isNext && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-2/3 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #34d399, transparent)" }}
        />
      )}
    </div>
  );
}
