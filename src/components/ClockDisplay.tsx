import type { ClockState } from "../types";

type Props = {
  clock: ClockState;
};

export function ClockDisplay({ clock }: Props) {
  const hhmm = clock.time.slice(0, 5);
  const ss = clock.time.slice(6);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-1.5 leading-none">
        <span className="text-foreground text-[5vw] font-extrabold tabular-nums tracking-tighter">
          {hhmm}
        </span>
        <span className="text-foreground/75 text-[2.2vw] font-semibold tabular-nums pb-1">
          {ss}
        </span>
      </div>

      <p className="text-foreground/70 text-[0.95vw] font-medium tracking-widest uppercase">
        {clock.date}
      </p>
    </div>
  );
}
