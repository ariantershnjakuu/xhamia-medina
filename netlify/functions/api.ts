import type { Config } from "@netlify/functions";
import {
  clearPrayerCache,
  getCachedPrayerData,
  getPrayerData,
} from "../../server/src/lib/prayer-cache.ts";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const isRefresh = url.pathname.endsWith("/refresh");

  if (isRefresh) {
    if (req.method !== "POST") {
      return json(405, { success: false, data: null, error: "Method not allowed" });
    }

    try {
      clearPrayerCache();
      const data = await getPrayerData();
      return json(200, { success: true, data, error: null });
    } catch (error) {
      return json(503, { success: false, data: null, error: String(error) });
    }
  }

  if (req.method !== "GET") {
    return json(405, { success: false, data: null, error: "Method not allowed" });
  }

  try {
    const data = await getPrayerData();
    return json(200, { success: true, data, error: null });
  } catch (error) {
    console.error("[netlify/api] scrape failed:", error);

    const cachedData = getCachedPrayerData();
    if (cachedData) {
      return json(200, { success: true, data: cachedData, error: "stale_cache" });
    }

    return json(503, { success: false, data: null, error: "Could not fetch prayer times" });
  }
}

export const config: Config = {
  path: ["/api/prayers", "/api/prayers/refresh"],
};
