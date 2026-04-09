import type { WeatherData } from "../types";
import { WEATHER_ICONS, getWeatherLabel } from "../hooks/useWeather";

type Props = {
  weather: WeatherData | null;
  loading: boolean;
};

export function WeatherWidget({ weather, loading }: Props) {
  if (loading) {
    return (
      <div
        className="flex items-center gap-2 text-[1.1vw] animate-pulse"
        style={{ color: "rgba(186,230,253,0.35)" }}
      >
        <span>◌</span>
        <span>Duke ngarkuar motin…</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="text-[1.1vw]" style={{ color: "rgba(255,255,255,0.25)" }}>
        Moti i padisponueshëm
      </div>
    );
  }

  const icon = WEATHER_ICONS[weather.weatherCode] ?? "🌡️";
  const label = getWeatherLabel(weather.weatherCode);

  return (
    <div className="flex items-center gap-5">
      {/* Weather icon */}
      <span className="text-[2.8vw] leading-none">{icon}</span>

      {/* Temperature block */}
      <div className="flex flex-col">
        <span className="text-[2.4vw] font-bold text-white tabular-nums leading-none">
          {weather.temperature}°C
        </span>
        <span
          className="text-[0.9vw] leading-tight"
          style={{ color: "rgba(186,230,253,0.55)" }}
        >
          {label}
        </span>
      </div>

      {/* Divider */}
      <div className="divider-v mx-1" />

      {/* Wind */}
      <div className="flex flex-col">
        <span
          className="text-[1.1vw] font-medium"
          style={{ color: "rgba(186,230,253,0.70)" }}
        >
          💨 {weather.windSpeed} km/h
        </span>
        <span
          className="text-[0.8vw]"
          style={{ color: "rgba(186,230,253,0.35)" }}
        >
          erë
        </span>
      </div>
    </div>
  );
}
