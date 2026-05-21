// Server-only "flash" messages: one-shot toasts that survive a
// redirect. Server actions call setFlash() before redirect();
// the destination is responsible for reading the cookie via the
// /api/flash route handler (the handler also deletes it, since
// Next.js 15 forbids cookie mutation from Server Components).

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
    maxAge: 60, // 60s is plenty — /api/flash consumes it on next load
  });
}
