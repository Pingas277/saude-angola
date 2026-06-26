import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase magic-link / password-reset callback.
 *
 * Email links from Supabase land here as
 *   /auth/callback?code=<one-time-pkce-code>&next=<path>
 * We swap the code for a session (sets the auth cookie), then bounce the
 * user to `next` — typically /redefinir for password recovery or
 * /painel after a fresh magic-link login.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/painel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Use the request origin so we stay on the same host the link landed
      // on (works on lunga.ao + www.lunga.ao + .vercel.app previews).
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Code missing or invalid (expired link, replayed link, etc.) — send
  // them back to login with a friendly hint.
  return NextResponse.redirect(
    `${origin}/entrar?error=link_invalido`
  );
}
