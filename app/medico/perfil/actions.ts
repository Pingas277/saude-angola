"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DoctorProfileState = { error?: string; ok?: boolean } | null;

export async function saveDoctorProfileAction(
  _prev: DoctorProfileState,
  formData: FormData
): Promise<DoctorProfileState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const license = String(formData.get("medical_license") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();

  if (!fullName) return { error: "O nome completo é obrigatório." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      medical_license: license || null,
      specialty: specialty || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/medico?perfil=ok");
}
