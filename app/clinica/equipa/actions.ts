"use server";
import { safeError } from "@/lib/safe-error";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddStaffState = {
  error?: string;
  ok?: boolean;
  added?: { name: string; role: string };
} | null;

const ALLOWED_ROLES = new Set(["doctor", "nurse", "receptionist", "admin"]);

export async function addStaffAction(
  _prev: AddStaffState,
  formData: FormData
): Promise<AddStaffState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Email inválido." };
  }
  if (!ALLOWED_ROLES.has(role)) {
    return { error: "Função inválida." };
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
    return { error: "Não tem permissão para gerir esta equipa." };
  }

  // Find target by email — RLS allows admin to read globally.
  const { data: target } = await supabase
    .from("profiles")
    .select("id, full_name, role, clinic_id, email")
    .ilike("email", email)
    .maybeSingle();

  if (!target) {
    return {
      error:
        "Não existe nenhum utilizador com esse email. O utilizador deve registar-se primeiro em /registar.",
    };
  }
  if (target.clinic_id && target.clinic_id !== admin.clinic_id) {
    return {
      error: "Este utilizador já pertence a outra clínica.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role, clinic_id: admin.clinic_id })
    .eq("id", target.id);

  if (error) return { error: safeError(error) };

  revalidatePath("/clinica/equipa");
  revalidatePath("/clinica");
  return {
    ok: true,
    added: { name: target.full_name ?? target.email ?? email, role },
  };
}

export async function removeStaffAction(formData: FormData) {
  const targetId = String(formData.get("target_id") ?? "").trim();
  if (!targetId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  // Don't let admins remove themselves accidentally
  if (targetId === user.id) return;

  const { data: admin } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (admin?.role !== "admin" || !admin.clinic_id) return;

  await supabase
    .from("profiles")
    .update({ role: "patient", clinic_id: null })
    .eq("id", targetId)
    .eq("clinic_id", admin.clinic_id);

  revalidatePath("/clinica/equipa");
  revalidatePath("/clinica");
}

export async function changeStaffRoleAction(formData: FormData) {
  const targetId = String(formData.get("target_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  if (!targetId || !ALLOWED_ROLES.has(role)) return;

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
  if (admin?.role !== "admin" || !admin.clinic_id) return;

  await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetId)
    .eq("clinic_id", admin.clinic_id);

  revalidatePath("/clinica/equipa");
}
