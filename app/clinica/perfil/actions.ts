"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ClinicProfileState = { error?: string; ok?: boolean } | null;

const PROVINCES = new Set([
  "Bengo","Benguela","Bie","Cabinda","Cuando Cubango","Cuanza Norte","Cuanza Sul",
  "Cunene","Huambo","Huila","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico",
  "Namibe","Uige","Zaire",
]);

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
    })
    .eq("id", admin.clinic_id);

  if (error) return { error: error.message };

  revalidatePath("/clinica");
  revalidatePath("/clinica/perfil");
  return { ok: true };
}
