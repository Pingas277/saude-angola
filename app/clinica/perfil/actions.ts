"use server";
import { safeError } from "@/lib/safe-error";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ClinicProfileState = { error?: string; ok?: boolean } | null;

const PROVINCES = new Set([
  "Bengo","Benguela","Bie","Cabinda","Cuando Cubango","Cuanza Norte","Cuanza Sul",
  "Cunene","Huambo","Huila","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico",
  "Namibe","Uige","Zaire",
]);

type DayHours = { open: string; close: string } | null;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Validate the working_hours JSON from the form. Returns the normalised
// object, or null if anything is malformed (open >= close, bad time, etc.).
function validateWorkingHours(raw: string): Record<string, DayHours> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const out: Record<string, DayHours> = {};
  for (let d = 0; d <= 6; d++) {
    const key = String(d);
    const day = obj[key];
    if (day == null) {
      out[key] = null;
      continue;
    }
    if (typeof day !== "object") return null;
    const dd = day as Record<string, unknown>;
    if (typeof dd.open !== "string" || typeof dd.close !== "string") return null;
    if (!TIME_RE.test(dd.open) || !TIME_RE.test(dd.close)) return null;
    if (dd.open >= dd.close) return null; // zero-padded HH:MM compares lexically
    out[key] = { open: dd.open, close: dd.close };
  }
  return out;
}

export async function saveClinicProfileAction(
  _prev: ClinicProfileState,
  formData: FormData
): Promise<ClinicProfileState> {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim();

  if (!name) return { error: "O nome da clínica é obrigatório." };
  if (province && !PROVINCES.has(province)) {
    return { error: "Província inválida." };
  }

  const rawHours = String(formData.get("working_hours") ?? "").trim();
  let workingHours: Record<string, DayHours> | undefined;
  if (rawHours) {
    const valid = validateWorkingHours(rawHours);
    if (!valid) {
      return {
        error:
          "Horários inválidos — verifique que a hora de abertura é antes da de fecho.",
      };
    }
    workingHours = valid;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: admin } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (admin?.role !== "admin" || !admin.clinic_id) {
    return { error: "Sem permissão para editar a clínica." };
  }

  const { error } = await supabase
    .from("clinics")
    .update({
      name,
      address: address || null,
      province: province || null,
      phone: phone || null,
      email: email || null,
      logo_url: logoUrl || null,
      ...(workingHours !== undefined ? { working_hours: workingHours } : {}),
    })
    .eq("id", admin.clinic_id);

  if (error) return { error: safeError(error) };

  revalidatePath("/clinica");
  revalidatePath("/clinica/perfil");
  return { ok: true };
}
