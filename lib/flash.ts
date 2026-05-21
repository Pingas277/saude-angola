// Server-only "flash" messages: one-shot toasts that survive a
// redirect. A server action calls setFlash() before redirect();
// the destination layout/page calls consumeFlash() to read +
// delete the cookie, then passes the result to a client toast.

import "server-only";
import { cookies } from "next/headers";

const COOKIE = "lunga_flash";

export type FlashKind = "success" | "error" | "info";

export type Flash = {
  kind: FlashKind;
  title: string;
  desc?: string;
};

export async function setFlash(flash: Flash): Promise<void> {
  const c = await cookies();
  c.set(COOKIE, JSON.stringify(flash), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60, // 60s is plenty — the very next request consumes it
  });
}

/** Read and clear the flash cookie. Safe to call from any RSC. */
export async function consumeFlash(): Promise<Flash | null> {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Flash;
    if (parsed && typeof parsed.title === "string") {
      c.delete(COOKIE);
      return parsed;
    }
  } catch {
    /* malformed — fall through */
  }
  c.delete(COOKIE);
  return null;
}
