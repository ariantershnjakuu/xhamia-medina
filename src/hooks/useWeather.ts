import { useState, useEffect } from "react";
import type { WeatherData } from "../types";

// Prishtina coordinates
const LAT = 42.6629;
const LON = 21.1655;
const REFRESH_MS = 30 * 60 * 1000; // 30 minutes

// WMO weather interpretation codes → Albanian label
const WEATHER_LABELS: Record<number, string> = {
  0: "Kthjellët",
  1: "Kryesisht kthjellët",
  2: "Pjesërisht vranët",
  3: "Vranët",
  45: "Mjegullë",
  48: "Mjegullë me akull",
  51: "Shi i lehtë",
  53: "Shi",
  55: "Shi i dendur",
  61: "Shi i lehtë",
  63: "Shi",
  65: "Shi i dendur",
  71: "Borë e lehtë",
  73: "Borë",
  75: "Borë e dendur",
  80: "Shi i lehtë",
  81: "Shi",
  82: "Shi i dendur",
  95: "Stuhi",
  96: "Stuhi me breshër",
  99: "Stuhi me breshër",
};

export const WEATHER_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌧️",
  55: "🌧️",
  61: "🌦️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "❄️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

export function getWeatherLabel(code: number): string {
  return WEATHER_LABELS[code] ?? "E panjohur";
}

type State = {
  data: WeatherData | null;
  loading: boolean;
};

export function useWeather(): State {
  const [state, setState] = useState<State>({ data: null, loading: true });

  const fetchWeather = async () => {
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(LAT));
      url.searchParams.set("longitude", String(LON));
      url.searchParams.set(
        "current",
        "temperature_2m,weather_code,wind_speed_10m"
      );
      url.searchParams.set("timezone", "Europe/Belgrade");

      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const current = json.current;

      setState({
        data: {
          temperature: Math.round(current.temperature_2m),
          weatherCode: current.weather_code,
          windSpeed: Math.round(current.wind_speed_10m),
        },
        loading: false,
      });
    } catch (err) {
      console.warn("[useWeather] failed:", err);
      setState({ data: null, loading: false });
    }
  };

  useEffect(() => {
    fetchWeather();
    const id = setInterval(fetchWeather, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return state;
}
