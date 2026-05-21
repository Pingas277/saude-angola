import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "../_app/AppShell";
import FlashToast from "../_ui/FlashToast";
import RealtimeAppointments from "../_ui/RealtimeAppointments";
import { consumeFlash } from "@/lib/flash";

export default async function MedicoLayout({
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
    .select("full_name, role, specialty, avatar_url, clinic:clinics(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "doctor") redirect("/painel");

  const clinic = Array.isArray(profile?.clinic)
    ? profile?.clinic[0]
    : profile?.clinic;
  const meta = [profile?.specialty, clinic?.name].filter(Boolean).join(" · ");

  const flash = await consumeFlash();

  return (
    <AppShell
      role="doctor"
      userName={`Dr. ${profile?.full_name ?? user.email}`}
      userMeta={meta || undefined}
      avatarUrl={profile?.avatar_url}
    >
      {children}
      <FlashToast flash={flash} />
      <RealtimeAppointments role="doctor" filterId={user.id} />
    </AppShell>
  );
}
