"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { setFlash } from "@/lib/flash";

export type ProfileState = { error?: string; ok?: boolean } | null;

const ALLOWED_BLOOD = new Set([
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown",
]);

function parseList(raw: string): string[] {
  return raw
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function savePatientProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dob = String(formData.get("date_of_birth") ?? "").trim();
  const blood = String(formData.get("blood_type") ?? "unknown").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const idNumber = String(formData.get("id_number") ?? "").trim();
  const allergies = parseList(String(formData.get("allergies") ?? ""));
  const conditions = parseList(String(formData.get("chronic_conditions") ?? ""));
  const ecName = String(formData.get("emergency_contact_name") ?? "").trim();
  const ecPhone = String(formData.get("emergency_contact_phone") ?? "").trim();

  if (!fullName) return { error: "O nome completo é obrigatório." };
  if (!ALLOWED_BLOOD.has(blood)) return { error: "Tipo sanguíneo inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (profileErr) return { error: profileErr.message };

  const { error: patientErr } = await supabase.from("patients").upsert(
    {
      profile_id: user.id,
      date_of_birth: dob || null,
      blood_type: blood as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "unknown",
      gender: gender || null,
      id_number: idNumber || null,
      allergies,
      chronic_conditions: conditions,
      emergency_contact_name: ecName || null,
      emergency_contact_phone: ecPhone || null,
    },
    { onConflict: "profile_id" }
  );

  if (patientErr) return { error: patientErr.message };

  await setFlash({
    kind: "success",
    title: "Perfil atualizado!",
    desc: "As suas alterações foram guardadas.",
  });
  revalidatePath("/", "layout");
  redirect("/painel");
}
