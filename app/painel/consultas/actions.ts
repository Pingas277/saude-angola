"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// =============================================================================
// Cancel + reschedule for the patient's own appointments.
//
// RLS already lets the patient UPDATE their own appointment rows (migration
// 001's "appointments: update by doctor or staff" includes
// `patient_id = public.current_patient_id()`), so we don't need a new policy.
// =============================================================================

export type AppointmentMutationState =
  | { error?: string; ok?: boolean }
  | null;

const ACTIVE_STATUSES = new Set(["scheduled", "confirmed"]);

async function loadOwnAppointment(
  appointmentId: string
): Promise<
  | {
      error: string;
    }
  | {
      patientId: string;
      doctorId: string;
      scheduledAt: string;
      status: string;
    }
> {
  if (!appointmentId) return { error: "Consulta inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!patient) return { error: "Perfil incompleto." };

  const { data: appt } = await supabase
    .from("appointments")
    .select("patient_id, doctor_id, scheduled_at, status")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt) return { error: "Consulta não encontrada." };
  if (appt.patient_id !== patient.id) {
    return { error: "Sem permissão para alterar esta consulta." };
  }
  if (!ACTIVE_STATUSES.has(appt.status)) {
    return {
      error:
        "Esta consulta já não pode ser alterada (está em curso, concluída ou cancelada).",
    };
  }
  if (new Date(appt.scheduled_at).getTime() <= Date.now()) {
    return { error: "Não é possível alterar uma consulta já passada." };
  }

  return {
    patientId: appt.patient_id,
    doctorId: appt.doctor_id,
    scheduledAt: appt.scheduled_at,
    status: appt.status,
  };
}

export async function cancelAppointmentAction(
  _prev: AppointmentMutationState,
  formData: FormData
): Promise<AppointmentMutationState> {
  const appointmentId = String(formData.get("appointment_id") ?? "").trim();
  const loaded = await loadOwnAppointment(appointmentId);
  if ("error" in loaded) return { error: loaded.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId);

  if (error) return { error: error.message };

  revalidatePath("/painel/consultas");
  revalidatePath("/painel");
  return { ok: true };
}

export async function rescheduleAppointmentAction(
  _prev: AppointmentMutationState,
  formData: FormData
): Promise<AppointmentMutationState> {
  const appointmentId = String(formData.get("appointment_id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  if (!date || !time) {
    return { error: "Escolha a nova data e hora." };
  }

  const loaded = await loadOwnAppointment(appointmentId);
  if ("error" in loaded) return { error: loaded.error };

  const newScheduledAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(newScheduledAt.getTime())) {
    return { error: "Data ou hora inválidas." };
  }
  if (newScheduledAt.getTime() <= Date.now()) {
    return { error: "A nova data e hora têm de estar no futuro." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({
      scheduled_at: newScheduledAt.toISOString(),
      // Re-set to "scheduled" so a re-arranged confirmed appointment goes
      // back to pending confirmation. Doctor/reception confirms again.
      status: "scheduled",
    })
    .eq("id", appointmentId);

  if (error) return { error: error.message };

  revalidatePath("/painel/consultas");
  revalidatePath("/painel");
  return { ok: true };
}
