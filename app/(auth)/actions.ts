"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string } | null;

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/painel") || "/painel";

  if (!email || !password) {
    return { error: "Por favor, preencha o email e a palavra-passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
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

  revalidatePath("/", "layout");
  redirect("/painel?bemvindo=1");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entrar");
}

function traduzirErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email ou palavra-passe incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este email já está registado. Tente entrar.";
  if (m.includes("password should be at least"))
    return "A palavra-passe é demasiado curta.";
  if (m.includes("rate limit")) return "Demasiadas tentativas. Tente novamente mais tarde.";
  if (m.includes("email not confirmed")) return "Confirme o seu email antes de entrar.";
  return msg;
}
