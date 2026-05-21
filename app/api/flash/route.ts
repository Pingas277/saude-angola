// Read-and-delete the one-shot flash cookie. Lives in a Route
// Handler because RSC layouts cannot mutate cookies in Next 15.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE = "lunga_flash";

export const dynamic = "force-dynamic";

export async function GET() {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ flash: null });
  }
  let flash: unknown = null;
  try {
    flash = JSON.parse(raw);
  } catch {
    /* ignore malformed */
  }
  c.delete(COOKIE);
  return NextResponse.json({ flash });
}
