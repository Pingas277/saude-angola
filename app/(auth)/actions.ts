"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { setFlash } from "@/lib/flash";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type AuthState = { error?: string } | null;

const LAST_USER_COOKIE = "lunga_last_user";

async function rememberLastUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const c = await cookies();
  c.set(
    LAST_USER_COOKIE,
    JSON.stringify({
      email: user.email,
      name: prof?.full_name ?? null,
      avatarUrl: prof?.avatar_url ?? null,
    }),
    {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    }
  );
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo =
    String(formData.get("redirect") ?? "/painel") || "/painel";

  if (!email || !password) {
    return { error: "Por favor, preencha o email e a palavra-passe." };
  }

  // Throttle brute-force attempts: 8 tries per 10 min per IP.
  const ip = await clientIp();
  if (!(await rateLimit(`login:${ip}`, 8, 600))) {
    return {
      error:
        "Demasiadas tentativas. Aguarde alguns minutos antes de tentar de novo.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  await rememberLastUser();
  await setFlash({
    kind: "success",
    title: "Bem-vindo de volta!",
  });
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  // Bilhete de Identidade — required for patient signups so the Passaporte
  // de Saúde, prescriptions and invoices carry a real identity, not a
  // placeholder. Normalised: spaces stripped, uppercased.
  const idNumber = String(formData.get("id_number") ?? "")
    .replace(/\s+/g, "")
    .toUpperCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Nome completo, email e palavra-passe são obrigatórios." };
  }
  if (!idNumber) {
    return { error: "Indique o seu Bilhete de Identidade." };
  }
  // Pragmatic format check: 8–16 alphanumeric chars. Covers Angolan BI
  // patterns (e.g. 001234567LA040) and old/regional variants without being
  // overly strict. Real identity verification is a separate concern.
  if (!/^[A-Z0-9]{8,16}$/.test(idNumber)) {
    return {
      error:
        "BI inválido. Use 8–16 caracteres (letras e dígitos), sem espaços.",
    };
  }
  if (password.length < 8) {
    return { error: "A palavra-passe deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As palavras-passe não coincidem." };
  }

  // Throttle mass account creation: 5 signups per hour per IP.
  const ip = await clientIp();
  if (!(await rateLimit(`signup:${ip}`, 5, 3600))) {
    return {
      error:
        "Demasiados registos a partir deste dispositivo. Tente mais tarde.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        role: "patient",
        // Picked up by handle_new_user (migration 029) to stamp the
        // patients row at the same moment it's created.
        id_number: idNumber,
      },
    },
  });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  await rememberLastUser();
  await setFlash({
    kind: "success",
    title: "Bem-vindo à Lunga 🎉",
    desc: "A sua conta foi criada. Pode marcar a primeira consulta.",
  });
  revalidatePath("/", "layout");
  redirect("/painel");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Intentionally KEEP the last_user cookie so /entrar can greet the
  // user by photo + name next time. They can clear it from the UI.
  revalidatePath("/", "layout");
  redirect("/entrar");
}

export async function clearLastUserAction() {
  const c = await cookies();
  c.delete(LAST_USER_COOKIE);
  revalidatePath("/entrar");
}

/* ─────────────────────────── Password reset ─────────────────────────── */

export type ResetState = { error?: string; sent?: boolean } | null;

/** Step 1 — user types their email and we ask Supabase to send a reset
 *  link. We always return success even when the email doesn't exist —
 *  attackers can't enumerate accounts. */
export async function requestPasswordResetAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Por favor, escreva um email válido." };
  }

  const ip = await clientIp();
  if (!(await rateLimit(`reset:${ip}`, 4, 600))) {
    return {
      error:
        "Demasiados pedidos. Tente novamente daqui a uns minutos.",
    };
  }

  const supabase = await createClient();
  // redirectTo wraps /auth/callback so Supabase's email link lands on a
  // route that swaps the recovery code for a session, then bounces to
  // /redefinir where the user actually picks a new password.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lunga.ao";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/redefinir`,
  });

  // Don't leak whether the email existed. Only surface infrastructure
  // errors (Supabase down, etc) which shouldn't happen often.
  if (error && !error.message.toLowerCase().includes("not found")) {
    console.error("[reset] resetPasswordForEmail failed:", error);
  }

  return { sent: true };
}

export type UpdatePasswordState = { error?: string } | null;

/** Step 2 — user is on /redefinir after clicking the email link. The
 *  callback route already exchanged the code, so we have a recovery
 *  session in cookies. Set the new password and redirect to /painel. */
export async function updatePasswordAction(
  _prev: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  if (password.length < 8) {
    return { error: "A nova palavra-passe deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As duas palavras-passe não coincidem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Recovery session expired or the link was never opened — push back
    // to the forgot-password page so they can re-request.
    redirect("/esqueci-palavra-passe?expirou=1");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: traduzirErro(error.message) };
  }

  await setFlash({
    kind: "success",
    title: "Palavra-passe atualizada",
    desc: "Está pronto.",
  });
  redirect("/painel");
}

/* ───────────────────────── Error translation ────────────────────────── */

function traduzirErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login"))
    return "Email ou palavra-passe incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este email já está registado. Tente entrar.";
  if (m.includes("password should be at least"))
    return "A palavra-passe é demasiado curta.";
  if (m.includes("rate limit"))
    return "Demasiadas tentativas. Tente novamente mais tarde.";
  if (m.includes("email not confirmed"))
    return "Confirme o seu email antes de entrar.";
  return msg;
}
