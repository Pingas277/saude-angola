"use server";

import { createClient } from "@/lib/supabase/server";

export type ClinicLeadState = { error?: string; ok?: boolean } | null;

const MAX = {
  name: 160,
  nif: 32,
  province: 60,
  email: 254,
  phone: 32,
  message: 4000,
};

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function submitClinicLeadAction(
  _prev: ClinicLeadState,
  formData: FormData
): Promise<ClinicLeadState> {
  const clinicName = String(formData.get("clinic_name") ?? "")
    .trim()
    .slice(0, MAX.name);
  const nif =
    String(formData.get("nif") ?? "").trim().slice(0, MAX.nif) || null;
  const province =
    String(formData.get("province") ?? "").trim().slice(0, MAX.province) ||
    null;
  const numDoctorsRaw = String(formData.get("num_doctors") ?? "").trim();
  const contactName = String(formData.get("contact_name") ?? "")
    .trim()
    .slice(0, MAX.name);
  const contactEmail = String(formData.get("contact_email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, MAX.email);
  const contactPhone =
    String(formData.get("contact_phone") ?? "").trim().slice(0, MAX.phone) ||
    null;
  const message =
    String(formData.get("message") ?? "").trim().slice(0, MAX.message) || null;

  if (!clinicName) return { error: "Diga-nos o nome da clínica." };
  if (!contactName) return { error: "Diga-nos o nome do responsável." };
  if (!contactEmail || !isEmail(contactEmail)) {
    return { error: "Email inválido — verifique e tente de novo." };
  }

  let numDoctors: number | null = null;
  if (numDoctorsRaw) {
    const n = Number(numDoctorsRaw);
    if (Number.isFinite(n) && n >= 0 && n < 100000) {
      numDoctors = Math.round(n);
    }
  }

  // Honeypot — bots fill it, humans never see it.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase.from("clinic_leads").insert({
    clinic_name: clinicName,
    nif,
    province,
    num_doctors: numDoctors,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    message,
  });

  if (error) {
    return { error: "Não conseguimos enviar agora. Tente em alguns minutos." };
  }

  return { ok: true };
}
