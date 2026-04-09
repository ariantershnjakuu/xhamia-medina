import { Separator } from "@/components/ui/separator";
import type { Countdown } from "../types";
import { pad2 } from "../utils/time";

type Props = {
  countdown: Countdown;
};

export function CountdownBanner({ countdown }: Props) {
  const { prayerLabel, hours, minutes, seconds } = countdown;

  return (
    <div className="flex items-center justify-center gap-8 border-b border-border/50 bg-card/75 px-10 py-3 backdrop-blur-sm">
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-muted-foreground/90 text-[0.78vw] font-semibold uppercase tracking-[0.2em]">
          Namazi i radhës
        </span>
        <span className="text-foreground text-[1.4vw] font-bold leading-tight">
          {prayerLabel}
        </span>
      </div>

      <Separator orientation="vertical" className="h-9" />

      <div className="flex items-center">
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

      <Separator orientation="vertical" className="h-9" />

      <div className="flex flex-col items-start gap-0.5">
        <span className="text-muted-foreground/90 text-[0.78vw] font-semibold uppercase tracking-[0.2em]">
          Vendndodhja
        </span>
        <span className="text-foreground/90 text-[1.05vw] font-semibold leading-tight">
          Prishtinë, Kosovë
        </span>
      </div>
    </div>
  );
}

function DigitBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[3.5vw] flex-col items-center">
      <span className="text-primary text-[2.8vw] font-extrabold tabular-nums leading-none">
        {pad2(value)}
      </span>
      <span className="mt-0.5 text-muted-foreground/80 text-[0.58vw] uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function ColonSep() {
  return (
    <span className="mx-1 -mt-2 text-primary/55 text-[2.4vw] font-medium leading-none">
      :
    </span>
  );
}
