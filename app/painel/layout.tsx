import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "../_app/AppShell";
import FlashToast from "../_ui/FlashToast";
import RealtimeAppointments from "../_ui/RealtimeAppointments";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: profile }, { data: patient }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("patients")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <AppShell
      role="patient"
      userName={profile?.full_name ?? user.email ?? "Paciente"}
      avatarUrl={profile?.avatar_url}
    >
      {children}
      <FlashToast />
      {patient?.id && (
        <RealtimeAppointments role="patient" filterId={patient.id} />
      )}
    </AppShell>
  );
}
