import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
};

export function PrayerCard({
  prayerKey,
  label,
  time,
  iqamahTime,
  isCurrent,
  isAdhanActive,
}: Props) {
  const Icon = PRAYER_ICONS[prayerKey];

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-visible rounded-2xl border transition-all duration-500",
        isCurrent
          ? "next-prayer-ring bg-primary/35 border-primary/60 scale-[1.025] shadow-lg"
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

      {/* Main section: icon + name + time */}
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-0">
        <Icon
          className={cn(
            "size-[2vw]",
            isCurrent ? "text-primary" : "text-foreground",
          )}
          strokeWidth={1.5}
        />
        <p
          className={cn(
            "text-[1.3vw] font-extrabold uppercase tracking-widest leading-none",
            isCurrent ? "text-foreground" : "text-foreground/80",
          )}
        >
          {label}
        </p>
        <p className="text-[4vw] font-black tabular-nums leading-none text-foreground">
          {time}
        </p>
      </CardContent>

      {/* Iqamah strip — built-in border-t + bg-muted/50 from CardFooter */}
      {prayerKey !== "lindja" && (
        <CardFooter
          className={cn(
            "justify-center gap-3 py-2.5",
            isCurrent && "bg-foreground/10",
          )}
        >
          <span
            className={cn(
              "text-[1.7vw] font-bold uppercase tracking-widest leading-none",
              isCurrent ? "text-foreground/90" : "text-foreground",
            )}
          >
            Ikameti
          </span>
          <span
            className={cn(
              "text-[1.8vw] font-black tabular-nums leading-none",
              isCurrent ? "text-foreground/90" : "text-foreground/85",
            )}
          >
            {iqamahTime}
          </span>
        </CardFooter>
      )}
    </Card>
  );
}
