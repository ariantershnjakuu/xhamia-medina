import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Wind } from "lucide-react";
import type { WeatherData } from "../types";
import { WEATHER_ICONS, getWeatherLabel } from "../hooks/useWeather";

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

  const icon = WEATHER_ICONS[weather.weatherCode] ?? "🌡️";
  const label = getWeatherLabel(weather.weatherCode);

  return (
    <div className="flex items-center gap-4">
      <span className="text-[2.2vw] leading-none">{icon}</span>

      <div className="flex flex-col">
        <span className="text-foreground text-[1.9vw] font-extrabold tabular-nums leading-none">
          {weather.temperature}°C
        </span>
        <span className="text-muted-foreground/80 text-[0.78vw] font-medium leading-tight tracking-wide">
          {label}
        </span>
      </div>

      <Separator orientation="vertical" className="h-7 mx-1" />

      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-foreground/80 text-[0.9vw] font-semibold tabular-nums">
          <Wind className="size-[0.85vw] text-muted-foreground/70" strokeWidth={2} />
          {weather.windSpeed} km/h
        </span>
        <span className="text-muted-foreground/70 text-[0.7vw] uppercase tracking-[0.2em]">erë</span>
      </div>
    </div>
  );
}
