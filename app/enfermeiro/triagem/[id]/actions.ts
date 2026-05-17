"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type VitalsState = { error?: string; ok?: boolean } | null;

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function saveVitalSignsAction(
  _prev: VitalsState,
  formData: FormData
): Promise<VitalsState> {
  const appointmentId = String(formData.get("appointment_id") ?? "").trim();
  if (!appointmentId) return { error: "Consulta inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: prof } = await supabase
    .from("profiles")
    .select("role, clinic_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!["nurse", "admin", "doctor"].includes(prof?.role ?? "")) {
    return { error: "Sem permissão." };
  }
  if (!prof?.clinic_id) return { error: "Sem clínica atribuída." };

  const { data: appt } = await supabase
    .from("appointments")
    .select("id, patient_id, clinic_id")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appt) return { error: "Consulta não encontrada." };
  if (appt.clinic_id !== prof.clinic_id) {
    return { error: "Esta consulta não pertence à sua clínica." };
  }

  const temperature_c = numOrNull(formData.get("temperature_c"));
  const blood_pressure = String(formData.get("blood_pressure") ?? "").trim() || null;
  const pulse_bpm = numOrNull(formData.get("pulse_bpm"));
  const respiratory_rate = numOrNull(formData.get("respiratory_rate"));
  const oxygen_saturation = numOrNull(formData.get("oxygen_saturation"));
  const weight_kg = numOrNull(formData.get("weight_kg"));
  const height_cm = numOrNull(formData.get("height_cm"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const hasAny =
    temperature_c !== null ||
    blood_pressure !== null ||
    pulse_bpm !== null ||
    respiratory_rate !== null ||
    oxygen_saturation !== null ||
    weight_kg !== null ||
    height_cm !== null ||
    notes !== null;

  if (!hasAny) {
    return { error: "Preencha pelo menos um sinal vital." };
  }

  const { error } = await supabase.from("vital_signs").insert({
    appointment_id: appt.id,
    patient_id: appt.patient_id,
    clinic_id: appt.clinic_id,
    recorded_by: user.id,
    temperature_c,
    blood_pressure,
    pulse_bpm,
    respiratory_rate,
    oxygen_saturation,
    weight_kg,
    height_cm,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath("/enfermeiro");
  revalidatePath(`/enfermeiro/triagem/${appointmentId}`);
  revalidatePath(`/medico/consulta/${appointmentId}`);
  return { ok: true };
}
