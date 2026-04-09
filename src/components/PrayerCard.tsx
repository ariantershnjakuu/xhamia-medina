import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  isNext: boolean;
  isPast: boolean;
};

export function PrayerCard({ prayerKey, label, time, isNext, isPast }: Props) {
  const Icon = PRAYER_ICONS[prayerKey];

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl border transition-all duration-500",
        isNext &&
          "next-prayer-ring bg-primary/8 border-primary/30 scale-[1.02]",
        isPast && "opacity-40",
        !isNext && !isPast && "border-border/50 bg-card",
      )}
    >
      {isNext && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge className="px-3 py-0.5 text-[0.65vw] uppercase tracking-widest rounded-full font-semibold shadow-sm">
            Namazi i radhës
          </Badge>
        </div>
      )}

      <CardContent className="flex flex-col items-center gap-3 px-4 py-0">
        <Icon
          className={cn(
            "size-[3vw]",
            isNext
              ? "text-primary"
              : isPast
                ? "text-muted-foreground/40"
                : "text-muted-foreground/60",
          )}
          strokeWidth={1.5}
        />

        <p
          className={cn(
            "text-[0.95vw] font-medium uppercase tracking-[0.15em] leading-none",
            isNext
              ? "text-primary"
              : isPast
                ? "text-muted-foreground/40"
                : "text-muted-foreground",
          )}
        >
          {label}
        </p>

        <p
          className={cn(
            "text-[2.8vw] font-bold tabular-nums leading-none",
            isNext
              ? "text-primary"
              : isPast
                ? "text-foreground/25"
                : "text-foreground",
          )}
        >
          {time}
        </p>

        {isNext && (
          <div className="h-0.5 w-2/5 rounded-full bg-primary/30" />
        )}
      </CardContent>
    </Card>
  );
}
