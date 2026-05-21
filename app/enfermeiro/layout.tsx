import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "../_app/AppShell";
import FlashToast from "../_ui/FlashToast";
import RealtimeAppointments from "../_ui/RealtimeAppointments";

export default async function EnfermeiroLayout({
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
    .select("full_name, role, avatar_url, clinic_id, clinic:clinics(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "nurse") redirect("/painel");

  const clinic = Array.isArray(profile?.clinic)
    ? profile?.clinic[0]
    : profile?.clinic;

  return (
    <AppShell
      role="nurse"
      userName={profile?.full_name ?? user.email ?? "Enfermagem"}
      userMeta={clinic?.name ?? undefined}
      avatarUrl={profile?.avatar_url}
    >
      {children}
      <FlashToast />
      {profile?.clinic_id && (
        <RealtimeAppointments role="clinic" filterId={profile.clinic_id} />
      )}
    </AppShell>
  );
}
