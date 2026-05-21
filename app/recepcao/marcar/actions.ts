"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";

export type SearchResult = {
  profile_id: string;
  patient_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export type SearchState = {
  query?: string;
  results?: SearchResult[];
  error?: string;
} | null;

export async function searchPatientsAction(
  _prev: SearchState,
  formData: FormData
): Promise<SearchState> {
  const q = String(formData.get("q") ?? "").trim();
  if (q.length < 2) return { query: q, error: "Digite pelo menos 2 caracteres." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, patients(id)")
    .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    .eq("role", "patient")
    .limit(15);

  if (error) return { query: q, error: error.message };

  const results: SearchResult[] = (data ?? []).map((p: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    patients: { id: string }[] | null;
  }) => ({
    profile_id: p.id,
    patient_id: p.patients?.[0]?.id ?? null,
    full_name: p.full_name,
    email: p.email,
    phone: p.phone,
  }));

  return { query: q, results };
}

export type WalkInState = {
  error?: string;
  ok?: boolean;
  patient_id?: string;
} | null;

export async function registerWalkInAction(
  _prev: WalkInState,
  formData: FormData
): Promise<WalkInState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const idNumber = String(formData.get("id_number") ?? "").trim();
  const dob = String(formData.get("date_of_birth") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();

  if (!fullName) return { error: "Nome obrigatório." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  // Phantom auth user — created via a separate Supabase client that doesn't
  // share the receptionist's session. Without this, signUp() would replace
  // the receptionist's auth cookies with the new walk-in user.
  const tempClient = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const placeholderEmail = `walkin.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 8)}@lunga.local`;
  const placeholderPassword = crypto.randomUUID() + "Aa9!";
  const { data: signup, error: signupErr } = await tempClient.auth.signUp({
    email: placeholderEmail,
    password: placeholderPassword,
    options: { data: { full_name: fullName } },
  });

  if (signupErr || !signup.user) {
    return { error: signupErr?.message ?? "Não foi possível criar o paciente." };
  }
  const newUserId = signup.user.id;

  // Update the auto-created profile with the entered details.
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", newUserId);
  if (profileErr) return { error: profileErr.message };

  // Insert the patient row.
  const { data: inserted, error: patientErr } = await supabase
    .from("patients")
    .insert({
      profile_id: newUserId,
      date_of_birth: dob || null,
      gender: gender || null,
      id_number: idNumber || null,
    })
    .select("id")
    .single();
  if (patientErr) return { error: patientErr.message };

  revalidatePath("/recepcao");
  revalidatePath("/recepcao/pacientes");
  return { ok: true, patient_id: inserted.id };
}

export type BookState = {
  error?: string;
  ok?: boolean;
  appointment_id?: string;
} | null;

export async function bookForPatientAction(
  _prev: BookState,
  formData: FormData
): Promise<BookState> {
  const patientId = String(formData.get("patient_id") ?? "").trim();
  const doctorId = String(formData.get("doctor_id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const type = String(formData.get("appointment_type") ?? "in_person").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!patientId) return { error: "Selecione ou registe um paciente." };
  if (!doctorId) return { error: "Escolha um médico." };
  if (!date || !time) return { error: "Escolha a data e hora." };
  if (type !== "in_person" && type !== "telemedicine") {
    return { error: "Tipo de consulta inválido." };
  }

  const scheduledAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(scheduledAt.getTime())) return { error: "Data ou hora inválidas." };
  if (scheduledAt.getTime() < Date.now() - 60_000) {
    return { error: "A data deve estar no futuro." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: prof } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!prof?.clinic_id) return { error: "Recepção sem clínica atribuída." };

  // Verify doctor belongs to the same clinic
  const { data: doc } = await supabase
    .from("profiles")
    .select("id, clinic_id")
    .eq("id", doctorId)
    .eq("role", "doctor")
    .maybeSingle();
  if (!doc) return { error: "Médico inválido." };

  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: doc.clinic_id ?? prof.clinic_id,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: 30,
      status: "scheduled",
      appointment_type: type,
      reason: reason || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/recepcao");
  return { ok: true, appointment_id: inserted.id };
}
