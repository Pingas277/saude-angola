import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/painel", "/perfil", "/medico", "/clinica", "/recepcao"];
const AUTH_ROUTES = ["/entrar", "/registar"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Defensive shell: middleware must never throw. Any failure (missing env,
  // unreachable Supabase, malformed cookies, …) should let the request pass
  // through so the landing page still renders. Protected pages do their own
  // auth check via createClient() on the server, so the only thing lost is
  // the silent session refresh.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[middleware] Missing Supabase env vars — skipping auth refresh."
    );
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
          ) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    const isAuthRoute = AUTH_ROUTES.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/painel";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    console.error("[middleware] Auth check failed, passing through:", err);
    return response;
  }
}
