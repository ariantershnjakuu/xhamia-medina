import type { ClockState } from "../types";

type Props = {
  clock: ClockState;
};

export function ClockDisplay({ clock }: Props) {
  const hhmm = clock.time.slice(0, 5);
  const ss = clock.time.slice(6);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-end gap-1.5 leading-none">
        <span className="text-foreground text-[4.8vw] font-black tabular-nums tracking-wide">
          {hhmm}
        </span>
        <span className="text-primary/90 text-[2vw] font-bold tabular-nums pb-1.5 countdown-pulse">
          {ss}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px w-6 bg-border/70" />
        <p className="text-foreground/75 text-[0.95vw] font-semibold tracking-[0.25em] uppercase">
          {clock.date}
        </p>
        <span className="h-px w-6 bg-border/70" />
      </div>
    </div>
  );
}
