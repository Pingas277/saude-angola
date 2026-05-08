import { NextResponse, type NextRequest } from "next/server";

// Temporary stub: do nothing. Lets us isolate whether the crash is in the
// middleware itself or somewhere else in the app. Server components on
// protected pages still call supabase.auth.getUser() and redirect if needed,
// so auth still works — we just lose the silent session-refresh hop.
export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
