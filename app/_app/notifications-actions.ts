"use server";

import { createClient } from "@/lib/supabase/server";

// Marks specific notifications as read. RLS guarantees we only touch our own.
export async function markNotificationsReadAction(
  ids: string[]
): Promise<{ ok: boolean }> {
  if (ids.length === 0) return { ok: true };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", user.id)
    .in("id", ids)
    .is("read_at", null);
  return { ok: true };
}

// Marks every unread notification for the current user as read.
export async function markAllNotificationsReadAction(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", user.id)
    .is("read_at", null);
  return { ok: true };
}
