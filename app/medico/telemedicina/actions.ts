"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { videoRoomUrl } from "@/lib/triage";

export type ClaimResult = { ok?: boolean; error?: string };

export async function claimConsultationAction(
  consultationId: string
): Promise<ClaimResult> {
  if (!consultationId) return { error: "Consulta inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: existing, error: readErr } = await supabase
    .from("consultations")
    .select("id, status, doctor_id, video_room_url")
    .eq("id", consultationId)
    .maybeSingle();
  if (readErr || !existing) {
    return { error: "Consulta não encontrada." };
  }
  if (existing.status !== "waiting" || existing.doctor_id) {
    return { error: "Esta consulta já foi atendida." };
  }

  const { error } = await supabase
    .from("consultations")
    .update({
      doctor_id: user.id,
      status: "in_progress",
      started_at: new Date().toISOString(),
      video_room_url: existing.video_room_url ?? videoRoomUrl(consultationId),
    })
    .eq("id", consultationId)
    .eq("status", "waiting")
    .is("doctor_id", null);

  if (error) return { error: error.message };

  revalidatePath("/medico/telemedicina");
  revalidatePath(`/medico/telemedicina/sala/${consultationId}`);
  revalidatePath(`/painel/telemedicina/sala/${consultationId}`);
  return { ok: true };
}

export async function endConsultationAction(formData: FormData) {
  const consultationId = String(formData.get("consultation_id") ?? "").trim();
  if (!consultationId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("consultations")
    .update({ status: "completed", ended_at: new Date().toISOString() })
    .eq("id", consultationId)
    .eq("doctor_id", user.id);

  revalidatePath("/medico/telemedicina");
  revalidatePath(`/medico/telemedicina/sala/${consultationId}`);
  revalidatePath(`/painel/telemedicina/sala/${consultationId}`);
}
