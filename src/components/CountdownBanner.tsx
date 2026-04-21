import { Timer } from "lucide-react";
import type { Countdown } from "../types";
import { pad2 } from "../utils/time";

type Props = {
  countdown: Countdown;
};

export function CountdownBanner({ countdown }: Props) {
  const { prayerLabel, hours, minutes, seconds } = countdown;

  return (
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-stretch border-y border-border/50 bg-linear-to-r from-card/60 via-card/90 to-card/60 backdrop-blur-sm">
      {/* Left: next prayer label */}
      <div className="flex flex-col items-end justify-center gap-1 px-10 py-4">
        <span className="flex items-center gap-2 text-muted-foreground/85 text-[0.85vw] font-semibold uppercase tracking-[0.28em]">
          <Timer className="size-[0.9vw] text-primary/80" strokeWidth={2.2} />
          Namazi i radhës
        </span>
        <span className="text-foreground text-[1.9vw] font-extrabold leading-none uppercase tracking-tight">
          {prayerLabel}
        </span>
      </div>

      {/* Center: countdown */}
      <div className="flex items-end justify-center gap-2 px-8 py-3">
        {hours > 0 && (
          <>
            <DigitBlock value={hours} label="orë" />
            <ColonSep />
          </>
        )}
        <DigitBlock value={minutes} label="minuta" />
        <ColonSep />
        <DigitBlock value={seconds} label="sekonda" pulse />
      </div>

      {/* Right: location */}
      <div className="flex flex-col items-start justify-center gap-1 px-10 py-4">
        <span className="text-muted-foreground/85 text-[0.85vw] font-semibold uppercase tracking-[0.28em]">
          Vendndodhja
        </span>
        <span className="text-foreground text-[1.9vw] font-extrabold leading-none tracking-tight">
          Prishtinë, Kosovë
        </span>
      </div>
    </div>
  );
}

function DigitBlock({
  value,
  label,
  pulse = false,
}: {
  value: number;
  label: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex min-w-[4.5vw] flex-col items-center">
      <span
        className={`text-primary text-[3.4vw] font-black tabular-nums leading-none ${
          pulse ? "countdown-pulse" : ""
        }`}
      >
        {pad2(value)}
      </span>
      <span className="mt-1.5 text-muted-foreground/75 text-[0.7vw] font-semibold uppercase tracking-[0.3em]">
        {label}
      </span>
    </div>
  );
}

function ColonSep() {
  return (
    <span className="mx-0.5 self-start pt-1 text-primary/45 text-[2.6vw] font-light leading-none">
      :
    </span>
  );
}
