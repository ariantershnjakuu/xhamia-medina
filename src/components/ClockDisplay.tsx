import type { ClockState } from "../types";

type Props = {
  clock: ClockState;
};

export function ClockDisplay({ clock }: Props) {
  const hhmm = clock.time.slice(0, 5);
  const ss = clock.time.slice(6);

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      {/* Main time */}
      <div className="flex items-end gap-2 leading-none">
        <span className="text-[5.5vw] font-bold text-white tabular-nums tracking-tight">
          {hhmm}
        </span>
        <span
          className="text-[2.4vw] font-medium tabular-nums pb-1"
          style={{ color: "#7dd3fc" }}
        >
          {ss}
        </span>
      </div>

      {/* Date */}
      <p
        className="text-[1.1vw] font-normal tracking-widest uppercase"
        style={{ color: "rgba(186,230,253,0.60)" }}
      >
        {clock.date}
      </p>
    </div>
  );
}
