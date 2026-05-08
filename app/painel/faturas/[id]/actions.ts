"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PayState = { error?: string } | null;

// Mock Multicaixa Express callback. In production this would be hit by the
// EMIS payment gateway after the user authorizes on their phone. For dev we
// flip the invoice straight to paid and record a fake reference.
export async function mockPayMulticaixaAction(
  _prev: PayState,
  formData: FormData
): Promise<PayState> {
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!invoiceId) return { error: "Fatura inválida." };
  if (!/^\+?244?\s?9\d{8}$/.test(phone.replace(/\s/g, ""))) {
    return { error: "Número Multicaixa Express inválido (ex.: +244 9XX XXX XXX)." };
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
  if (!patient) return { error: "Perfil incompleto." };

  // Verify the invoice belongs to this patient and is payable.
  const { data: inv } = await supabase
    .from("invoices")
    .select("id, status, patient_id, amount")
    .eq("id", invoiceId)
    .maybeSingle();

  if (!inv || inv.patient_id !== patient.id) {
    return { error: "Fatura não encontrada." };
  }
  if (inv.status !== "pending" && inv.status !== "overdue") {
    return { error: "Esta fatura já não pode ser paga." };
  }

  const reference = `MCX-${Date.now().toString(36).toUpperCase()}`;
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      payment_method: "multicaixa_express",
      payment_reference: reference,
      paid_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)
    .eq("patient_id", patient.id);

  if (error) return { error: error.message };

  revalidatePath("/painel/faturas");
  revalidatePath(`/painel/faturas/${invoiceId}`);
  redirect(`/painel/faturas/${invoiceId}?pago=1`);
}

export async function cancelOwnInvoiceAction(formData: FormData) {
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  if (!invoiceId) return;

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
  if (!patient) return;

  // Patients shouldn't really cancel — only used as an escape hatch in dev.
  await supabase
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", invoiceId)
    .eq("patient_id", patient.id)
    .in("status", ["pending", "overdue"]);

  revalidatePath("/painel/faturas");
  redirect("/painel/faturas");
}
