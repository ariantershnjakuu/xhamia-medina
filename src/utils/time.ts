const TZ = "Europe/Belgrade";

export function nowInBelgrade(): Date {
  // Construct a Date that reflects the current Belgrade wall-clock time
  const iso = new Date().toLocaleString("sv", { timeZone: TZ });
  return new Date(iso);
}

/** "HH:MM" → total minutes since midnight */
export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Returns 0-padded 2-digit string */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatClock(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

const ALBANIAN_DAYS = [
  "e Diel",
  "e Hënë",
  "e Martë",
  "e Mërkurë",
  "e Enjte",
  "e Premte",
  "e Shtunë",
] as const;

const ALBANIAN_MONTHS = [
  "Janar",
  "Shkurt",
  "Mars",
  "Prill",
  "Maj",
  "Qershor",
  "Korrik",
  "Gusht",
  "Shtator",
  "Tetor",
  "Nëntor",
  "Dhjetor",
] as const;

export function formatDate(d: Date): string {
  const dayName = ALBANIAN_DAYS[d.getDay()];
  const month = ALBANIAN_MONTHS[d.getMonth()];
  return `${dayName}, ${d.getDate()} ${month} ${d.getFullYear()}`;
}

/** Returns the current UTC offset for the Belgrade timezone (2 in summer, 1 in winter). */
export function getBelgradeUTCOffsetHours(): number {
  const now = new Date();
  const localHour = Number(
    new Intl.DateTimeFormat("en", {
      timeZone: TZ,
      hour: "numeric",
      hour12: false,
    })
      .formatToParts(now)
      .find((p) => p.type === "hour")?.value ?? 0,
  );
  return (localHour - now.getUTCHours() + 24) % 24;
}

export function formatDayName(d: Date): string {
  return new Intl.DateTimeFormat("sq-AL", {
    timeZone: TZ,
    weekday: "long",
  }).format(d);
}
