"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  await rememberLastUser();
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
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Nome completo, email e palavra-passe são obrigatórios." };
  }
  if (password.length < 8) {
    return { error: "A palavra-passe deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As palavras-passe não coincidem." };
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
      },
    },
  });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  await rememberLastUser();
  revalidatePath("/", "layout");
  redirect("/painel?bemvindo=1");
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
