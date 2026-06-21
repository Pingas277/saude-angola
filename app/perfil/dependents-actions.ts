"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// =============================================================================
// Add / remove dependents (family-account members without their own login).
//
// RLS — migration 031 — already authorises:
//   * INSERT when guardian_profile_id = auth.uid()
//   * DELETE when profile_id IS NULL and guardian_profile_id = auth.uid()
// so these actions don't repeat the auth check; they just shape + persist.
// =============================================================================

export type DependentMutationState =
  | { error?: string; ok?: boolean }
  | null;

const ALLOWED_RELATIONSHIPS = new Set([
  "filho",
  "filha",
  "mae",
  "pai",
  "irmao",
  "irma",
  "conjuge",
  "tutelado",
  "outro",
]);

const BLOOD_TYPES = new Set([
  "a_positive",
  "a_negative",
  "b_positive",
  "b_negative",
  "ab_positive",
  "ab_negative",
  "o_positive",
  "o_negative",
  "unknown",
]);

export async function addDependentAction(
  _prev: DependentMutationState,
  formData: FormData
): Promise<DependentMutationState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "").trim().toLowerCase();
  const dob = String(formData.get("date_of_birth") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const bloodType = String(formData.get("blood_type") ?? "unknown").trim();
  const idNumber = String(formData.get("id_number") ?? "")
    .replace(/\s+/g, "")
    .toUpperCase();

  if (!fullName) return { error: "Nome do dependente é obrigatório." };
  if (!ALLOWED_RELATIONSHIPS.has(relationship)) {
    return { error: "Escolha a relação (filho, filha, tutelado, …)." };
  }
  if (idNumber && !/^[A-Z0-9]{8,16}$/.test(idNumber)) {
    return {
      error:
        "BI inválido. Deixe em branco se o dependente não tem BI, ou use 8–16 caracteres alfanuméricos.",
    };
  }
  if (bloodType && !BLOOD_TYPES.has(bloodType)) {
    return { error: "Tipo sanguíneo inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { error } = await supabase.from("patients").insert({
    profile_id: null,
    guardian_profile_id: user.id,
    full_name: fullName,
    relationship,
    date_of_birth: dob || null,
    gender: gender || null,
    blood_type: bloodType || "unknown",
    id_number: idNumber || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/perfil");
  revalidatePath("/painel/marcar");
  revalidatePath("/painel");
  return { ok: true };
}

export async function removeDependentAction(
  _prev: DependentMutationState,
  formData: FormData
): Promise<DependentMutationState> {
  const dependentId = String(formData.get("dependent_id") ?? "").trim();
  if (!dependentId) return { error: "Dependente inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  // RLS check: profile_id IS NULL AND guardian_profile_id = auth.uid().
  // We still defend in code: only delete rows that look like dependents.
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", dependentId)
    .eq("guardian_profile_id", user.id)
    .is("profile_id", null);

  if (error) return { error: error.message };

  revalidatePath("/perfil");
  revalidatePath("/painel/marcar");
  revalidatePath("/painel");
  return { ok: true };
}
