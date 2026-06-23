import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Pill } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import MedicoHeader from "../_components/MedicoHeader";
import PrescriptionForm, {
  type PatientOption,
} from "../consulta/[id]/PrescriptionForm";

export const metadata = { title: "Receita rápida · Lunga" };

type Profile = { full_name: string | null };
type Patient = { id: string; profile: Profile | Profile[] | null };
type ApptRow = { patient: Patient | Patient[] | null };

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default async function ReceitaRapidaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  // Unique patients this doctor has seen — those are the only ones a
  // quick prescription can target (the action enforces this too).
  const { data: rows } = await supabase
    .from("appointments")
    .select("patient:patients(id, profile:profiles!patients_profile_id_fkey(full_name))")
    .eq("doctor_id", user.id)
    .order("scheduled_at", { ascending: false });

  const seen = new Map<string, PatientOption>();
  for (const r of (rows as ApptRow[] | null) ?? []) {
    const p = pickOne(r.patient);
    if (!p?.id || seen.has(p.id)) continue;
    const prof = pickOne(p.profile);
    seen.set(p.id, { id: p.id, name: prof?.full_name ?? "Paciente" });
  }
  const patients = [...seen.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/medico"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Painel
      </Link>

      <div className="mt-5">
        <MedicoHeader
          eyebrow="Ação rápida"
          title="Receita rápida"
          subtitle="Emita uma receita para um paciente já consultado, sem abrir a consulta."
          icon={<Pill className="size-5" />}
        />
      </div>

      <div className="mt-7 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <PrescriptionForm patients={patients} />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Para receitas ligadas a uma consulta específica, abra a consulta na
        sua agenda.
      </p>
    </main>
  );
}
