import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

// Node runtime, NOT Edge — sidesteps the @supabase/ssr bundle restrictions
// that hit the Edge runtime on Vercel. Slightly higher cold-start cost than
// Edge, negligible in practice.
export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
