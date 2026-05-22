"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RecordState = { error?: string; ok?: boolean } | null;
export type RxState = { error?: string; ok?: boolean; prescriptionId?: string } | null;
export type StatusState = { error?: string } | null;
export type InvoiceState = { error?: string; ok?: boolean; invoiceId?: string } | null;

const APPT_STATUSES = new Set([
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

type EncounterRef = {
  kind: "appointment" | "consultation";
  id: string;
  patient_id: string;
  doctor_id: string;
};

function readEncounter(formData: FormData): { kind: "appointment" | "consultation"; id: string } | null {
  const apptId = String(formData.get("appointment_id") ?? "").trim();
  if (apptId) return { kind: "appointment", id: apptId };
  const consultId = String(formData.get("consultation_id") ?? "").trim();
  if (consultId) return { kind: "consultation", id: consultId };
  return null;
}

async function loadEncounterForDoctor(
  ref: { kind: "appointment" | "consultation"; id: string }
): Promise<{ encounter: EncounterRef; userId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  if (ref.kind === "appointment") {
    const { data: appt } = await supabase
      .from("appointments")
      .select("id, doctor_id, patient_id")
      .eq("id", ref.id)
      .maybeSingle();
    if (!appt) return { error: "Consulta não encontrada." };
    if (appt.doctor_id !== user.id) {
      return { error: "Não tem permissão para esta consulta." };
    }
    return {
      encounter: { kind: "appointment", id: appt.id, doctor_id: appt.doctor_id, patient_id: appt.patient_id },
      userId: user.id,
    };
  }

  const { data: c } = await supabase
    .from("consultations")
    .select("id, doctor_id, patient_id")
    .eq("id", ref.id)
    .maybeSingle();
  if (!c) return { error: "Consulta não encontrada." };
  if (c.doctor_id !== user.id) {
    return { error: "Não tem permissão para esta consulta." };
  }
  return {
    encounter: { kind: "consultation", id: c.id, doctor_id: c.doctor_id, patient_id: c.patient_id },
    userId: user.id,
  };
}

function pathsForEncounter(enc: EncounterRef): string[] {
  if (enc.kind === "appointment") return [`/medico/consulta/${enc.id}`];
  return [
    `/medico/telemedicina/sala/${enc.id}`,
    `/painel/telemedicina/sala/${enc.id}`,
    "/medico/telemedicina",
  ];
}

export async function saveMedicalRecordAction(
  _prev: RecordState,
  formData: FormData
): Promise<RecordState> {
  const ref = readEncounter(formData);
  if (!ref) return { error: "Consulta inválida." };

  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  const symptoms = String(formData.get("symptoms") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const temp = String(formData.get("vital_temp") ?? "").trim();
  const bp = String(formData.get("vital_bp") ?? "").trim();
  const pulse = String(formData.get("vital_pulse") ?? "").trim();
  const weight = String(formData.get("vital_weight") ?? "").trim();

  if (!diagnosis && !symptoms && !notes) {
    return { error: "Preencha pelo menos diagnóstico, sintomas ou notas." };
  }

  const loaded = await loadEncounterForDoctor(ref);
  if ("error" in loaded) return { error: loaded.error };

  const vitals: Record<string, string> = {};
  if (temp) vitals.temperature_c = temp;
  if (bp) vitals.blood_pressure = bp;
  if (pulse) vitals.pulse_bpm = pulse;
  if (weight) vitals.weight_kg = weight;

  const supabase = await createClient();
  const insertRow: Record<string, unknown> = {
    patient_id: loaded.encounter.patient_id,
    doctor_id: loaded.userId,
    diagnosis: diagnosis || null,
    symptoms: symptoms || null,
    notes: notes || null,
    vitals: Object.keys(vitals).length > 0 ? vitals : null,
  };
  if (loaded.encounter.kind === "appointment") {
    insertRow.appointment_id = loaded.encounter.id;
  } else {
    insertRow.consultation_id = loaded.encounter.id;
  }

  const { error } = await supabase.from("medical_records").insert(insertRow);
  if (error) return { error: error.message };

  for (const p of pathsForEncounter(loaded.encounter)) revalidatePath(p);
  return { ok: true };
}

type MedicationInput = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export async function issuePrescriptionAction(
  _prev: RxState,
  formData: FormData
): Promise<RxState> {
  const notes = String(formData.get("notes") ?? "").trim();
  const expiresInDays = Number(formData.get("expires_in_days") ?? "30");

  const meds: MedicationInput[] = [];
  const names = formData.getAll("med_name");
  for (let i = 0; i < names.length; i++) {
    const name = String(names[i] ?? "").trim();
    if (!name) continue;
    meds.push({
      name,
      dosage: String(formData.get(`med_dosage_${i}`) ?? "").trim(),
      frequency: String(formData.get(`med_frequency_${i}`) ?? "").trim(),
      duration: String(formData.get(`med_duration_${i}`) ?? "").trim(),
      instructions: String(formData.get(`med_instructions_${i}`) ?? "").trim(),
    });
  }

  if (meds.length === 0) {
    return { error: "Adicione pelo menos um medicamento." };
  }

  // The prescription can be tied to an encounter (from a consultation page)
  // OR issued "quick" against a patient the doctor has already seen.
  const ref = readEncounter(formData);
  let patientId: string;
  let doctorId: string;
  let revalidate: string[];
  let encounterKind: "appointment" | "consultation" | null = null;
  let encounterId: string | null = null;

  if (ref) {
    const loaded = await loadEncounterForDoctor(ref);
    if ("error" in loaded) return { error: loaded.error };
    patientId = loaded.encounter.patient_id;
    doctorId = loaded.userId;
    encounterKind = loaded.encounter.kind;
    encounterId = loaded.encounter.id;
    revalidate = pathsForEncounter(loaded.encounter);
  } else {
    // Quick prescription — patient picked directly.
    const pid = String(formData.get("patient_id") ?? "").trim();
    if (!pid) return { error: "Escolha um paciente." };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/entrar");

    // Security: only allow prescribing to a patient this doctor has seen.
    const { data: link } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("patient_id", pid)
      .limit(1)
      .maybeSingle();
    if (!link) {
      return { error: "Só pode emitir receitas para os seus pacientes." };
    }

    patientId = pid;
    doctorId = user.id;
    revalidate = ["/medico/receita", "/painel/receitas"];
  }

  const supabase = await createClient();

  const today = new Date();
  const yyyymmdd =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  const qrCode = `RX-${yyyymmdd}-${random}`;

  const expiresAt =
    Number.isFinite(expiresInDays) && expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const insertRow: Record<string, unknown> = {
    patient_id: patientId,
    doctor_id: doctorId,
    medications: meds,
    qr_code: qrCode,
    notes: notes || null,
    expires_at: expiresAt,
  };
  if (encounterKind === "appointment") {
    insertRow.appointment_id = encounterId;
  } else if (encounterKind === "consultation") {
    insertRow.consultation_id = encounterId;
  }

  const { data: inserted, error } = await supabase
    .from("prescriptions")
    .insert(insertRow)
    .select("id")
    .single();

  if (error) return { error: error.message };

  for (const p of revalidate) revalidatePath(p);
  return { ok: true, prescriptionId: inserted.id };
}

export async function createInvoiceAction(
  _prev: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  const ref = readEncounter(formData);
  if (!ref) return { error: "Consulta inválida." };

  const amountStr = String(formData.get("amount") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDays = Number(formData.get("due_days") ?? "30");

  const amount = Number(amountStr.replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Valor inválido." };
  }

  const loaded = await loadEncounterForDoctor(ref);
  if ("error" in loaded) return { error: loaded.error };

  const supabase = await createClient();

  // Doctor's clinic (may be null for B2C telemedicine)
  const { data: docProfile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", loaded.userId)
    .maybeSingle();

  const dueDate =
    Number.isFinite(dueDays) && dueDays > 0
      ? new Date(Date.now() + dueDays * 86400000)
          .toISOString()
          .slice(0, 10)
      : null;

  const insertRow: Record<string, unknown> = {
    patient_id: loaded.encounter.patient_id,
    clinic_id: docProfile?.clinic_id ?? null,
    amount,
    currency: "AOA",
    status: "pending",
    due_date: dueDate,
    payment_reference: description || null,
  };
  if (loaded.encounter.kind === "appointment") {
    insertRow.appointment_id = loaded.encounter.id;
  } else {
    insertRow.consultation_id = loaded.encounter.id;
  }

  const { data: inserted, error } = await supabase
    .from("invoices")
    .insert(insertRow)
    .select("id")
    .single();

  if (error) return { error: error.message };

  for (const p of pathsForEncounter(loaded.encounter)) revalidatePath(p);
  revalidatePath("/painel/faturas");
  return { ok: true, invoiceId: inserted.id };
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const appointmentId = String(formData.get("appointment_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!appointmentId || !APPT_STATUSES.has(status)) return;

  const loaded = await loadEncounterForDoctor({ kind: "appointment", id: appointmentId });
  if ("error" in loaded) return;

  const supabase = await createClient();
  await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)
    .eq("doctor_id", loaded.userId);

  revalidatePath(`/medico/consulta/${appointmentId}`);
  revalidatePath("/medico");
  revalidatePath("/medico/agenda");
}
