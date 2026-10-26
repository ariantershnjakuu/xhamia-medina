import type { Config } from "@netlify/functions";
import { getPrayerData } from "../../server/src/lib/prayer-times.ts";

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
  if (req.method !== "GET") {
    return json(405, { success: false, data: null, error: "Method not allowed" });
  }

  try {
    const data = getPrayerData();
    return json(200, { success: true, data, error: null });
  } catch (error) {
    console.error("[netlify/api] timetable lookup failed:", error);
    return json(503, { success: false, data: null, error: "Could not compute prayer times" });
  }
}

export const config: Config = {
  path: "/api/prayers",
};
