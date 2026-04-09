import type { Countdown } from "../types";
import { pad2 } from "../utils/time";

type Props = {
  countdown: Countdown;
};

export function CountdownBanner({ countdown }: Props) {
  const { prayerLabel, hours, minutes, seconds } = countdown;

  return (
    <div
      className="flex items-center justify-center gap-8 py-3 px-10"
      style={{
        background: "rgba(52,211,153,0.06)",
        borderTop: "1px solid rgba(52,211,153,0.18)",
        borderBottom: "1px solid rgba(52,211,153,0.18)",
      }}
    >
      {/* Left label */}
      <div className="flex flex-col items-end">
        <span
          className="text-[0.85vw] font-medium uppercase tracking-[0.25em]"
          style={{ color: "#34d399" }}
        >
          Namazi i radhës
        </span>
        <span className="text-[1.5vw] font-bold text-white tracking-wide">
          {prayerLabel}
        </span>
      </div>

      {/* Vertical divider */}
      <div className="divider-v" />

      {/* Countdown digits */}
      <div className="flex items-center gap-0.5">
        {hours > 0 && (
          <>
            <DigitGroup value={hours} label="orë" />
            <Sep />
          </>
        )}
        <DigitGroup value={minutes} label="minuta" />
        <Sep />
        <DigitGroup value={seconds} label="sekonda" />
      </div>

      {/* Vertical divider */}
      <div className="divider-v" />

      {/* Right info */}
      <div className="flex flex-col items-start">
        <span
          className="text-[0.85vw] font-medium uppercase tracking-[0.25em]"
          style={{ color: "rgba(186,230,253,0.5)" }}
        >
          Koha vendore
        </span>
        <span
          className="text-[1.1vw] font-semibold"
          style={{ color: "rgba(186,230,253,0.75)" }}
        >
          Prishtinë, Kosovë
        </span>
      </div>
    </div>
  );
}

function DigitGroup({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[3.8vw]">
      <span
        className="text-[3.2vw] font-bold tabular-nums leading-none"
        style={{ color: "#34d399" }}
      >
        {pad2(value)}
      </span>
      <span
        className="text-[0.65vw] uppercase tracking-widest mt-0.5"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span
      className="text-[2.8vw] font-bold leading-none mx-0.5 -mt-2"
      style={{ color: "rgba(52,211,153,0.45)" }}
    >
      :
    </span>
  );
}
