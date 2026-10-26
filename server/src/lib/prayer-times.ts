import { BIK_TIMETABLE } from "./bik-timetable.js";

export type PrayerTimes = {
  date: string;
  source: string;
  prayers: {
    sabahu: string;
    lindja: string;
    dreka: string;
    ikindia: string;
    akshami: string;
    jacia: string;
  };
  updatedAt: string;
};

const TZ = "Europe/Belgrade";

// The bundled timetable is stored in standard time (UTC+1).
const TIMETABLE_UTC_OFFSET_MINUTES = 60;

const pad2 = (n: number) => String(n).padStart(2, "0");

function belgradeParts(at: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

// Europe/Belgrade's UTC offset (60 or 120) in effect on the given calendar
// day. EU clocks change at 01:00 UTC, so probing at 12:00 UTC always lands
// on the side of the switch that applies to every prayer of that day.
function belgradeOffsetMinutes(year: number, month: number, day: number): number {
  const probe = Date.UTC(year, month - 1, day, 12);
  const p = belgradeParts(new Date(probe));
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return (wall - probe) / 60_000;
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${pad2(Math.floor(total / 60) % 24)}:${pad2(total % 60)}`;
}

export function getPrayerData(now: Date = new Date()): PrayerTimes {
  const { year, month, day } = belgradeParts(now);
  const row = BIK_TIMETABLE[`${pad2(month)}-${pad2(day)}`];
  if (!row) {
    throw new Error(`No timetable entry for ${year}-${pad2(month)}-${pad2(day)}`);
  }

  const shift = belgradeOffsetMinutes(year, month, day) - TIMETABLE_UTC_OFFSET_MINUTES;
  const [sabahu, lindja, dreka, ikindia, akshami, jacia] = row.map((t) =>
    addMinutes(t, shift),
  );

  return {
    date: `${pad2(day)}.${pad2(month)}.${year}`,
    source: "BIK official",
    prayers: { sabahu, lindja, dreka, ikindia, akshami, jacia },
    updatedAt: now.toISOString(),
  };
}
