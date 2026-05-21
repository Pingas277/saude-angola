"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactState = { error?: string; ok?: boolean } | null;

const NAME_MAX = 120;
const EMAIL_MAX = 254;
const PHONE_MAX = 32;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4000;
const ALLOWED_SOURCES = new Set([
  "privacidade",
  "termos",
  "sobre",
  "outro",
]);

function isEmail(v: string): boolean {
  // Pragmatic check — server only enforces shape, the user's mail
  // client will tell us if it actually delivers.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function sendContactMessageAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, NAME_MAX);
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, EMAIL_MAX);
  const phone =
    String(formData.get("phone") ?? "").trim().slice(0, PHONE_MAX) || null;
  const message = String(formData.get("message") ?? "")
    .trim()
    .slice(0, MESSAGE_MAX);
  const rawSource = String(formData.get("source") ?? "outro");
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : "outro";

  if (!name) return { error: "Diga-nos o seu nome, por favor." };
  if (!email || !isEmail(email)) {
    return { error: "Email inválido — verifique e tente de novo." };
  }
  if (!message || message.length < MESSAGE_MIN) {
    return { error: "Escreva uma mensagem com pelo menos 10 caracteres." };
  }

  // Honeypot: any value submitted in this hidden field means a bot.
  // We pretend success but skip the insert.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { ok: true };
  }

  const supabase = await createClient();

  // If the user is logged in, attach their profile id so we can group
  // messages by user later.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone,
    message,
    source,
    user_id: user?.id ?? null,
  });

  if (error) {
    return { error: "Não conseguimos enviar agora. Tente em alguns minutos." };
  }

  return { ok: true };
}
