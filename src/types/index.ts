export type PrayerKey =
  | "sabahu"
  | "lindja"
  | "dreka"
  | "ikindia"
  | "akshami"
  | "jacia";

export type PrayerTimes = {
  sabahu: string;
  lindja: string;
  dreka: string;
  ikindia: string;
  akshami: string;
  jacia: string;
};

export type PrayerData = {
  date: string;
  source: string;
  prayers: PrayerTimes;
  updatedAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export type WeatherData = {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
};

export type ClockState = {
  time: string;   // "HH:MM:SS"
  date: string;   // full locale date string
  dayName: string;
};

export type Countdown = {
  prayerKey: PrayerKey;
  prayerLabel: string;
  hours: number;
  minutes: number;
  seconds: number;
  isJustPrayed: boolean; // within 5 min after prayer
};
