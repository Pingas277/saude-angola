import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "../_app/AppShell";

export default async function RecepcaoLayout({
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
    .select("full_name, role, clinic:clinics(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "receptionist") redirect("/painel");

  const clinic = Array.isArray(profile?.clinic)
    ? profile?.clinic[0]
    : profile?.clinic;

  return (
    <AppShell
      role="receptionist"
      userName={profile?.full_name ?? user.email ?? "Recepção"}
      userMeta={clinic?.name ?? undefined}
    >
      {children}
    </AppShell>
  );
}
