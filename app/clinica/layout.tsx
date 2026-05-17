import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "../_app/AppShell";

export default async function ClinicaLayout({
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
    .select("full_name, role, clinic:clinics(name, subscription_plan)")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/painel");

  const clinic = Array.isArray(profile?.clinic)
    ? profile?.clinic[0]
    : profile?.clinic;
  const meta = clinic?.name
    ? `${clinic.name}${clinic.subscription_plan ? ` · plano ${clinic.subscription_plan}` : ""}`
    : undefined;

  return (
    <AppShell
      role="admin"
      userName={profile?.full_name ?? user.email ?? "Administração"}
      userMeta={meta}
    >
      {children}
    </AppShell>
  );
}
