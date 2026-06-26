import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * On production we serve under both `lunga.ao` and `www.lunga.ao`. Setting
 * the cookie domain to `.lunga.ao` (leading dot) makes the same auth
 * cookie visible on both — so a session created on www.lunga.ao stays
 * logged in if the user later types lunga.ao, and vice versa. Vercel
 * preview deployments and local dev keep the default (host-only) cookie.
 */
function withDomain(options: CookieOptions | undefined): CookieOptions {
  const isProd = process.env.VERCEL_ENV === "production";
  if (!isProd) return options ?? {};
  return { ...(options ?? {}), domain: ".lunga.ao" };
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, withDomain(options))
            );
          } catch {
            // Called from a Server Component — middleware will refresh the session.
          }
        },
      },
    }
  );
}
