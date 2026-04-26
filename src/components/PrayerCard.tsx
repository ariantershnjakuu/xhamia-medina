import { cn } from "@/lib/utils";
import type { PrayerKey } from "../types";
import {
  Moon,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Stars,
  type LucideIcon,
} from "lucide-react";

const PRAYER_ICONS: Record<PrayerKey, LucideIcon> = {
  sabahu: Moon,
  lindja: Sunrise,
  dreka: Sun,
  ikindia: CloudSun,
  akshami: Sunset,
  jacia: Stars,
};

type Props = {
  prayerKey: PrayerKey;
  label: string;
  time: string;
  iqamahTime: string | null;
  isCurrent: boolean;
};

export function PrayerCard({
  prayerKey,
  label,
  time,
  iqamahTime,
  isCurrent,
}: Props) {
  const Icon = PRAYER_ICONS[prayerKey];

  const getEzanText = () => {
    if (label === "E Xhuma") return "Ezani i Xhumasë";
    switch (prayerKey) {
      case "sabahu": return "Ezani i Sabahut";
      case "dreka": return "Ezani i Drekës";
      case "ikindia": return "Ezani i Ikindisë";
      case "akshami": return "Ezani i Akshamit";
      case "jacia": return "Ezani i Jacisë";
      default: return `Ezani i ${label}`;
    }
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl border transition-all duration-500",
        isCurrent
          ? "next-prayer-ring border-primary/70 bg-linear-to-br from-primary/25 via-primary/12 to-primary/5 scale-[1.02] shadow-2xl"
          : "border-border/50 bg-card/90 shadow-md",
      )}
    >
      {/* Prayer name header */}
      <div className="flex items-center justify-center gap-3 border-b border-border/40 px-5 py-3">
        <Icon
          className={cn(
            "size-[1.7vw]",
            isCurrent ? "text-primary" : "text-primary/70",
          )}
          strokeWidth={1.8}
        />
        <h2
          className={cn(
            "text-[1.3vw] font-extrabold uppercase tracking-[0.22em] leading-none",
            isCurrent ? "text-foreground" : "text-foreground/90",
          )}
        >
          {label}
        </h2>
      </div>

      {iqamahTime ? (
        <div className="grid flex-1 grid-cols-2 divide-x divide-border/40">
          <TimeColumn
            label="Ezani"
            value={time}
            isCurrent={isCurrent}
            emphasized={false}
          />
          <TimeColumn
            label="Ikameti"
            value={iqamahTime}
            isCurrent={isCurrent}
            emphasized
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5">
          <span
            className={cn(
              "text-[1.1vw] font-semibold uppercase tracking-[0.35em]",
              isCurrent ? "text-foreground/75" : "text-muted-foreground/80",
            )}
          >
            {prayerKey === "lindja" ? "Lindja e Diellit" : getEzanText()}
          </span>
          <p
            className={cn(
              "text-[4.2vw] font-black tabular-nums leading-none tracking-wide",
              isCurrent ? "text-foreground" : "text-foreground/90",
            )}
          >
            {time}
          </p>
        </div>
      )}
    </div>
  );
}

type TimeColumnProps = {
  label: string;
  value: string;
  isCurrent: boolean;
  emphasized: boolean;
};

function TimeColumn({ label, value, isCurrent, emphasized }: TimeColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-3 py-5",
        emphasized && (isCurrent ? "bg-primary/20" : "bg-primary/10"),
      )}
    >
      <span
        className={cn(
          "text-[1.35vw] font-extrabold uppercase tracking-[0.3em] leading-none",
          emphasized
            ? isCurrent
              ? "text-foreground"
              : "text-primary"
            : isCurrent
              ? "text-foreground/85"
              : "text-foreground/70",
        )}
      >
        {label}
      </span>
      <p
        className={cn(
          "text-[3.8vw] font-black tabular-nums leading-none tracking-wide",
          isCurrent ? "text-foreground" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
