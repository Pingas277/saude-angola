// Database-backed rate limiting. Wraps the check_rate_limit() Postgres
// function (migration 022). Used to throttle login, signup and booking.

import "server-only";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** Best-effort client IP from the proxy headers Vercel sets. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Returns true if the action is allowed, false if the caller is over the
 * limit for `key` within the window. Fail-open: if the check itself errors
 * we never block a real user over an infrastructure hiccup.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}
