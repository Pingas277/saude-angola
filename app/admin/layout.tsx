import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Lunga-staff-only area. Gated on profiles.is_lunga_staff, which can only
 * be set via a direct DB change (Supabase Studio) — never through the app.
 * Anyone who is not staff is bounced home.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return <>{children}</>;
}
