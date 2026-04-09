import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
  iqamahTime: string;
  isCurrent: boolean;
  isAdhanActive: boolean;
  isPast: boolean;
};

export function PrayerCard({
  prayerKey,
  label,
  time,
  iqamahTime,
  isCurrent,
  isAdhanActive,
  isPast,
}: Props) {
  const Icon = PRAYER_ICONS[prayerKey];

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col items-center justify-center gap-3 overflow-visible rounded-2xl border transition-all duration-500",
        isCurrent
          ? "next-prayer-ring bg-primary/35 border-primary/60 scale-[1.025] shadow-lg"
          : isPast
            ? "border-border/40 bg-card/70 shadow-sm opacity-55"
            : "border-border/50 bg-card shadow-sm",
      )}
    >
      {isAdhanActive && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="tani-badge inline-flex items-center rounded-full border border-primary/60 bg-primary px-3.5 py-1 text-[0.7vw] font-bold uppercase tracking-[0.25em] text-primary-foreground shadow-md">
            TANI
          </span>
        </div>
      )}

      <CardContent className="flex flex-col items-center gap-3 px-4 py-0">
        <Icon
          className={cn(
            "size-[3vw]",
            isCurrent
              ? "text-foreground"
              : isPast
                ? "text-muted-foreground/55"
                : "text-muted-foreground/80",
          )}
          strokeWidth={1.5}
        />

        <p
          className={cn(
            "text-[0.9vw] font-semibold uppercase tracking-[0.18em] leading-none",
            isCurrent
              ? "text-foreground/80"
              : isPast
                ? "text-muted-foreground/70"
                : "text-muted-foreground/90",
          )}
        >
          {label}
        </p>

        <p
          className={cn(
            "text-[2.8vw] font-extrabold tabular-nums leading-none",
            isCurrent
              ? "text-foreground"
              : isPast
                ? "text-foreground/55"
                : "text-foreground",
          )}
        >
          {time}
        </p>

        {prayerKey !== "lindja" && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1",
              isCurrent
                ? "bg-foreground/10"
                : "bg-muted/60",
            )}
          >
            <span
              className={cn(
                "text-[0.62vw] font-semibold uppercase tracking-widest",
                isCurrent ? "text-foreground/55" : "text-muted-foreground/55",
              )}
            >
              Ikameti
            </span>
            <span
              className={cn(
                "text-[0.88vw] font-bold tabular-nums",
                isCurrent
                  ? "text-foreground/85"
                  : isPast
                    ? "text-foreground/40"
                    : "text-foreground/65",
              )}
            >
              {iqamahTime}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
