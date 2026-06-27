"use server";
import { safeError } from "@/lib/safe-error";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StockState = { error?: string; ok?: boolean } | null;

async function nurseClinic(): Promise<
  { clinicId: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: prof } = await supabase
    .from("profiles")
    .select("role, clinic_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!["nurse", "admin", "doctor", "receptionist"].includes(prof?.role ?? "")) {
    return { error: "Sem permissão." };
  }
  if (!prof?.clinic_id) return { error: "Sem clínica atribuída." };
  return { clinicId: prof.clinic_id };
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function addStockItemAction(
  _prev: StockState,
  formData: FormData
): Promise<StockState> {
  const ctx = await nurseClinic();
  if ("error" in ctx) return { error: ctx.error };

  const name = String(formData.get("medication_name") ?? "").trim();
  if (!name) return { error: "Indique o nome do medicamento." };

  const quantity = numOrNull(formData.get("quantity")) ?? 0;
  const minimum = numOrNull(formData.get("minimum_stock")) ?? 10;
  const unitPrice = numOrNull(formData.get("unit_price"));
  const generic = String(formData.get("generic_name") ?? "").trim() || null;
  const batch = String(formData.get("batch_number") ?? "").trim() || null;
  const expiry = String(formData.get("expiry_date") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("pharmacy_stock").insert({
    clinic_id: ctx.clinicId,
    medication_name: name,
    generic_name: generic,
    quantity: Math.max(0, Math.round(quantity)),
    minimum_stock: Math.max(0, Math.round(minimum)),
    unit_price: unitPrice,
    batch_number: batch,
    expiry_date: expiry,
  });

  if (error) return { error: safeError(error) };
  revalidatePath("/enfermeiro/farmacia");
  revalidatePath("/enfermeiro");
  return { ok: true };
}

export async function adjustStockAction(formData: FormData) {
  const ctx = await nurseClinic();
  if ("error" in ctx) return;

  const itemId = String(formData.get("item_id") ?? "").trim();
  const delta = numOrNull(formData.get("delta"));
  if (!itemId || delta === null || delta === 0) return;

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("pharmacy_stock")
    .select("id, quantity, clinic_id")
    .eq("id", itemId)
    .maybeSingle();

  if (!item || item.clinic_id !== ctx.clinicId) return;

  const next = Math.max(0, item.quantity + Math.round(delta));
  await supabase
    .from("pharmacy_stock")
    .update({ quantity: next })
    .eq("id", itemId)
    .eq("clinic_id", ctx.clinicId);

  revalidatePath("/enfermeiro/farmacia");
  revalidatePath("/enfermeiro");
}
