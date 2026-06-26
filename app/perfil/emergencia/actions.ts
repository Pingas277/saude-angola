"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Toggle a patient's emergency card on/off. Caller must be the patient
 *  themselves or their guardian — enforced inside the SECURITY DEFINER
 *  function. */
export async function setEmergencyCardEnabledAction(formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const enabled = formData.get("enabled") === "true";
  if (!patientId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  await supabase.rpc("set_emergency_card_enabled", {
    p_patient_id: patientId,
    p_enabled: enabled,
  });

  revalidatePath("/perfil/emergencia");
  revalidatePath("/painel");
}

/** Regenerate the emergency_token — old QR codes immediately stop
 *  resolving. */
export async function regenerateEmergencyTokenAction(formData: FormData) {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  if (!patientId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  await supabase.rpc("regenerate_emergency_token", {
    p_patient_id: patientId,
  });

  revalidatePath("/perfil/emergencia");
  revalidatePath("/painel");
}
