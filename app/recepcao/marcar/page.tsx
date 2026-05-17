import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarPlus, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RecepHeader from "../_components/RecepHeader";
import MarcarRecepcaoFlow from "./MarcarRecepcaoFlow";

export const metadata = { title: "Nova marcação · ANGOLASAUDE" };

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

type DoctorRow = {
  id: string;
  full_name: string | null;
  specialty: string | null;
};

export default async function MarcarRecepcaoPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>;
}) {
  const { modo } = await searchParams;
  const initialMode = modo === "walkin" ? "walkin" : "search";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "receptionist" || !profile.clinic_id)
    redirect("/painel");

  const { data: doctorsRaw } = await supabase
    .from("profiles")
    .select("id, full_name, specialty")
    .eq("role", "doctor")
    .eq("clinic_id", profile.clinic_id)
    .order("full_name", { ascending: true });

  const doctors = ((doctorsRaw as DoctorRow[] | null) ?? []).map((d) => ({
    id: d.id,
    full_name: d.full_name ?? "—",
    specialty: d.specialty,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/recepcao"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar à fila
      </Link>

      <RecepHeader
        eyebrow="Recepção"
        title="Nova marcação"
        subtitle="Procure um paciente já registado ou registe um novo walk-in."
        icon={<CalendarPlus className="size-5" />}
      />

      {doctors.length === 0 ? (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            A clínica ainda não tem médicos. Peça ao administrador para os
            adicionar em <strong>/clinica/equipa</strong> antes de marcar
            consultas.
          </span>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <MarcarRecepcaoFlow
            doctors={doctors}
            defaultDate={todayISODate()}
            initialMode={initialMode}
          />
        </div>
      )}
    </main>
  );
}
