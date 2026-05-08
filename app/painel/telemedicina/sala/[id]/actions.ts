"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function cancelOwnConsultationAction(formData: FormData) {
  const consultationId = String(formData.get("consultation_id") ?? "").trim();
  if (!consultationId) return;

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
  if (!patient) return;

  await supabase
    .from("consultations")
    .update({ status: "cancelled", ended_at: new Date().toISOString() })
    .eq("id", consultationId)
    .eq("patient_id", patient.id)
    .in("status", ["waiting", "scheduled"]);

  revalidatePath("/painel/telemedicina");
  redirect("/painel/telemedicina");
}
