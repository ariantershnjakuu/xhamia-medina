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
  isCurrent: boolean;
};

export function PrayerCard({
  prayerKey,
  label,
  time,
  isCurrent,
}: Props) {
  const Icon = PRAYER_ICONS[prayerKey];

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

      {/* Single centered time for all prayers */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5">
        <span
          className={cn(
            "text-[0.85vw] font-semibold uppercase tracking-[0.35em]",
            isCurrent ? "text-foreground/75" : "text-muted-foreground/80",
          )}
        >
          {prayerKey === "lindja" ? "Lindja" : (label === "E Xhuma" ? "Xhumaja" : "Koha e Namazit")}
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
    </div>
  );
}
