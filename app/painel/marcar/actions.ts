"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { setFlash } from "@/lib/flash";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type BookingState = { error?: string } | null;

export async function bookAppointmentAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const doctorId = String(formData.get("doctor_id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const type = String(formData.get("appointment_type") ?? "in_person").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!doctorId) return { error: "Escolha um médico." };
  if (!date || !time) return { error: "Escolha a data e a hora da consulta." };
  if (type !== "in_person" && type !== "telemedicine") {
    return { error: "Tipo de consulta inválido." };
  }

  // Throttle booking spam: 15 bookings per 10 min per IP.
  const ip = await clientIp();
  if (!(await rateLimit(`book:${ip}`, 15, 600))) {
    return {
      error: "Demasiados pedidos seguidos. Aguarde alguns minutos.",
    };
  }

  const scheduledAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "Data ou hora inválidas." };
  }
  if (scheduledAt.getTime() < Date.now()) {
    return { error: "A data e hora devem estar no futuro." };
  }

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

  const { data: doctor } = await supabase
    .from("profiles")
    .select("id, clinic_id")
    .eq("id", doctorId)
    .eq("role", "doctor")
    .maybeSingle();
  if (!doctor) return { error: "Médico não encontrado." };

  const { error } = await supabase.from("appointments").insert({
    patient_id: patient.id,
    doctor_id: doctor.id,
    clinic_id: doctor.clinic_id,
    scheduled_at: scheduledAt.toISOString(),
    duration_minutes: 30,
    status: "scheduled",
    appointment_type: type,
    reason: reason || null,
  });

  if (error) return { error: error.message };

  const friendlyDate = scheduledAt.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const friendlyTime = scheduledAt.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await setFlash({
    kind: "success",
    title: "Consulta marcada!",
    desc: `${friendlyDate} às ${friendlyTime} — vai aparecer no seu painel.`,
  });

  revalidatePath("/painel", "layout");
  redirect("/painel/consultas");
}
