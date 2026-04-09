import type { Config, Handler } from "@netlify/functions";
import {
  clearPrayerCache,
  getCachedPrayerData,
  getPrayerData,
} from "../../server/src/lib/prayer-cache.ts";

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

const handler: Handler = async (event) => {
  const path = event.path.replace(/\/+$/, "") || "/";

  if (path.endsWith("/refresh")) {
    if (event.httpMethod !== "POST") {
      return json(405, {
        success: false,
        data: null,
        error: "Method not allowed",
      });
    }

    try {
      clearPrayerCache();
      const data = await getPrayerData();
      return json(200, { success: true, data, error: null });
    } catch (error) {
      return json(503, {
        success: false,
        data: null,
        error: String(error),
      });
    }
  }

  if (event.httpMethod !== "GET") {
    return json(405, {
      success: false,
      data: null,
      error: "Method not allowed",
    });
  }

  try {
    const data = await getPrayerData();
    return json(200, { success: true, data, error: null });
  } catch (error) {
    console.error("[netlify/api] scrape failed:", error);

    const cachedData = getCachedPrayerData();
    if (cachedData) {
      return json(200, {
        success: true,
        data: cachedData,
        error: "stale_cache",
      });
    }

    return json(503, {
      success: false,
      data: null,
      error: "Could not fetch prayer times",
    });
  }
};

export const config: Config = {
  path: ["/api/prayers", "/api/prayers/refresh"],
};

export { handler as default };
