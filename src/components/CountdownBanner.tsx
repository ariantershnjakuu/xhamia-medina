import type { Countdown } from "../types";
import { pad2 } from "../utils/time";

type Props = {
  countdown: Countdown;
};

export function CountdownBanner({ countdown }: Props) {
  const { prayerLabel, hours, minutes, seconds } = countdown;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch divide-x divide-border/40 border-t-2 border-t-primary/20 border-b border-b-border/50 bg-card/75 backdrop-blur-sm">
      <div className="flex flex-col items-end justify-center gap-1 px-10 py-3">
        <span className="text-muted-foreground/80 text-[0.72vw] font-semibold uppercase tracking-[0.25em]">
          Namazi i radhës
        </span>
        <span className="text-foreground text-xl font-bold leading-tight uppercase">
          {prayerLabel}
        </span>
      </div>

      <div className="flex items-center justify-center gap-0 px-10 py-3">
        {hours > 0 && (
          <>
            <DigitBlock value={hours} label="orë" />
            <ColonSep />
          </>
        )}
        <DigitBlock value={minutes} label="minuta" />
        <ColonSep />
        <DigitBlock value={seconds} label="sekonda" />
      </div>

      <div className="flex flex-col items-start justify-center gap-1 px-10 py-3">
        <span className="text-muted-foreground/80 text-[0.72vw] font-semibold uppercase tracking-[0.25em]">
          Vendndodhja
        </span>
        <span className="text-foreground/90 text-[1.1vw] font-semibold leading-tight">
          Prishtinë, Kosovë
        </span>
      </div>
    </div>
  );
}

function DigitBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[3.8vw] flex-col items-center">
      <span className="text-primary text-[3.2vw] font-extrabold tabular-nums leading-none">
        {pad2(value)}
      </span>
      <span className="mt-1 text-muted-foreground/70 text-[0.55vw] uppercase tracking-[0.3em]">
        {label}
      </span>
    </div>
  );
}

function ColonSep() {
  return (
    <span className="mx-1.5 -mt-2 text-primary/50 text-[2.8vw] font-light leading-none">
      :
    </span>
  );
}
