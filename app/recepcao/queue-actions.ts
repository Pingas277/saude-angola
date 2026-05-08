"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const RECEPCAO_STATUS_TRANSITIONS = new Set([
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

export async function setAppointmentStatusAction(formData: FormData) {
  const apptId = String(formData.get("appointment_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!apptId || !RECEPCAO_STATUS_TRANSITIONS.has(status)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: prof } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!["admin", "receptionist", "doctor"].includes(prof?.role ?? "")) return;
  if (!prof?.clinic_id) return;

  await supabase
    .from("appointments")
    .update({ status })
    .eq("id", apptId)
    .eq("clinic_id", prof.clinic_id);

  revalidatePath("/recepcao");
  revalidatePath("/clinica");
}
