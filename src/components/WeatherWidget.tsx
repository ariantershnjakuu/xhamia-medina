import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wind,
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type { WeatherData } from "../types";
import { getWeatherLabel } from "../hooks/useWeather";

const WEATHER_LUCIDE: Record<number, LucideIcon> = {
  0: Sun,
  1: Sun,
  2: CloudSun,
  3: Cloud,
  45: CloudFog,
  48: CloudFog,
  51: CloudDrizzle,
  53: CloudDrizzle,
  55: CloudDrizzle,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  80: CloudRain,
  81: CloudRain,
  82: CloudLightning,
  95: CloudLightning,
  96: CloudLightning,
  99: CloudLightning,
};

type Props = {
  weather: WeatherData | null;
  loading: boolean;
};

export function WeatherWidget({ weather, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-20 rounded" />
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <p className="text-muted-foreground/80 text-[0.9vw]">
        Moti i padisponueshëm
      </p>
    );
  }

  const Icon = WEATHER_LUCIDE[weather.weatherCode] ?? Thermometer;
  const label = getWeatherLabel(weather.weatherCode);

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-[2.8vw] items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
        <Icon
          className="size-[1.6vw] text-primary"
          strokeWidth={1.8}
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-foreground text-[1.9vw] font-extrabold tabular-nums leading-none">
          {weather.temperature}°C
        </span>
        <span className="text-muted-foreground/85 text-[0.78vw] font-medium leading-tight tracking-wide">
          {label}
        </span>
      </div>

      <Separator orientation="vertical" className="h-8 mx-1" />

      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-foreground/85 text-[0.95vw] font-semibold tabular-nums leading-none">
          <Wind className="size-[0.9vw] text-muted-foreground/70" strokeWidth={2} />
          {weather.windSpeed} km/h
        </span>
        <span className="text-muted-foreground/75 text-[0.7vw] font-semibold uppercase tracking-[0.25em]">
          Erë
        </span>
      </div>
    </div>
  );
}
