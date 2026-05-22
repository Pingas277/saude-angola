"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const LEAD_STATUSES = new Set(["new", "contacted", "converted", "lost"]);

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_lunga_staff")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_lunga_staff) redirect("/");
  return supabase;
}

/** Toggle a contact message read/unread. */
export async function toggleMessageReadAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const markRead = String(formData.get("mark_read") ?? "") === "1";
  if (!id) return;

  const supabase = await requireStaff();
  await supabase
    .from("contact_messages")
    .update({ read_at: markRead ? new Date().toISOString() : null })
    .eq("id", id);

  revalidatePath("/admin");
}

/** Move a clinic lead through the pipeline. */
export async function setLeadStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !LEAD_STATUSES.has(status)) return;

  const supabase = await requireStaff();
  await supabase
    .from("clinic_leads")
    .update({
      status,
      contacted_at:
        status === "contacted" ? new Date().toISOString() : undefined,
    })
    .eq("id", id);

  revalidatePath("/admin");
}
