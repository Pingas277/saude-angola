"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { triage, videoRoomUrl } from "@/lib/triage";

export type TriageState = { error?: string } | null;

export async function startConsultationAction(
  _prev: TriageState,
  formData: FormData
): Promise<TriageState> {
  const chiefComplaint = String(formData.get("chief_complaint") ?? "").trim();
  const durationStr = String(formData.get("duration_days") ?? "").trim();
  const severityStr = String(formData.get("severity") ?? "").trim();
  const additional = String(formData.get("additional_symptoms") ?? "").trim();
  const hasFever = formData.get("has_fever") === "on";
  const hasBreathing = formData.get("has_breathing") === "on";
  const hasChestPain = formData.get("has_chest_pain") === "on";
  const hasBleeding = formData.get("has_bleeding") === "on";
  const hasFainting = formData.get("has_fainting") === "on";
  const pregnancy = formData.get("pregnancy") === "on";

  if (!chiefComplaint) return { error: "Descreva o motivo da consulta." };

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
  if (!patient) redirect("/perfil?onboarding=1");

  // Refuse if patient already has an active consultation — avoid duplicates.
  const { data: existing } = await supabase
    .from("consultations")
    .select("id")
    .eq("patient_id", patient.id)
    .in("status", ["waiting", "in_progress"])
    .limit(1)
    .maybeSingle();
  if (existing) {
    redirect(`/painel/telemedicina/sala/${existing.id}`);
  }

  const result = await triage({
    chiefComplaint,
    durationDays: durationStr ? Number(durationStr) : null,
    severity: severityStr ? Number(severityStr) : null,
    hasFever,
    hasBreathingDifficulty: hasBreathing,
    hasChestPain,
    hasBleeding,
    hasFainting,
    pregnancy,
    additionalSymptoms: additional,
  });

  const { data: inserted, error } = await supabase
    .from("consultations")
    .insert({
      patient_id: patient.id,
      consultation_type: "video",
      status: "waiting",
      ai_triage_summary: result.summary,
      ai_urgency: result.urgency,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: error?.message ?? "Não foi possível iniciar a consulta." };
  }

  await supabase
    .from("consultations")
    .update({ video_room_url: videoRoomUrl(inserted.id) })
    .eq("id", inserted.id);

  revalidatePath("/painel/telemedicina");
  // For emergency-tier triage, route through a 112 interstitial first.
  if (result.urgency === "emergency") {
    redirect(`/painel/telemedicina/emergencia/${inserted.id}`);
  }
  redirect(`/painel/telemedicina/sala/${inserted.id}`);
}
