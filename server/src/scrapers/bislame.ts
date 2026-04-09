import * as cheerio from "cheerio";

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

const PRAYER_NAME_MAP: Record<string, keyof PrayerTimes["prayers"]> = {
  sabahu: "sabahu",
  "l. e diellit": "lindja",
  dreka: "dreka",
  ikindia: "ikindia",
  akshami: "akshami",
  jacia: "jacia",
};

// Converts "4:50 am" / "12:40 pm" → "04:50"
function to24Hour(time12: string): string {
  const cleaned = time12.trim().toLowerCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (!match) return "";

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3];

  if (period === "am" && hours === 12) hours = 0;
  if (period === "pm" && hours !== 12) hours += 12;

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function todayDate(): string {
  return new Intl.DateTimeFormat("sq", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function scrapePrayerTimes(): Promise<PrayerTimes> {
  const res = await fetch("https://bislame.net/namazet/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; XhamiaDardania/1.0; +https://xhamia-dardania.com)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`bislame.net returned ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const prayers: Partial<PrayerTimes["prayers"]> = {};

  // Each prayer is a <tr> containing <th class="prayerName"> + <td class="begins">
  $("tr").each((_, row) => {
    const nameEl = $(row).find("th.prayerName");
    const timeEl = $(row).find("td.begins");
    if (!nameEl.length || !timeEl.length) return;

    const rawName = nameEl.text().trim().toLowerCase();
    const rawTime = timeEl.text().trim();

    const key = PRAYER_NAME_MAP[rawName];
    if (key) {
      prayers[key] = to24Hour(rawTime);
    }
  });

  const required: (keyof PrayerTimes["prayers"])[] = [
    "sabahu",
    "lindja",
    "dreka",
    "ikindia",
    "akshami",
    "jacia",
  ];
  const missing = required.filter((k) => !prayers[k]);
  if (missing.length > 0) {
    throw new Error(`Scraper: missing prayers: ${missing.join(", ")}`);
  }

  return {
    date: todayDate(),
    source: "BIK official",
    prayers: prayers as PrayerTimes["prayers"],
    updatedAt: new Date().toISOString(),
  };
}
