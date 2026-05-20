import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Stethoscope,
  Phone,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDatePT } from "@/lib/labels";
import StatCard from "../../_ui/StatCard";
import MedicoHeader from "../_components/MedicoHeader";

export const metadata = { title: "Pacientes · Lunga" };

type ApptRow = {
  id: string;
  scheduled_at: string;
  patient:
    | { id: string; profile: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null }
    | { id: string; profile: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null }[]
    | null;
};

type PatientCard = {
  id: string;
  name: string;
  phone: string | null;
  visits: number;
  lastVisit: string;
  nextAppointmentId: string | null;
};

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "—";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default async function PacientesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const nowIso = new Date().toISOString();

  const { data: rows } = await supabase
    .from("appointments")
    .select(
      "id, scheduled_at, patient:patients(id, profile:profiles(full_name, phone))"
    )
    .eq("doctor_id", user.id)
    .order("scheduled_at", { ascending: false });

  const all = (rows as ApptRow[] | null) ?? [];
  const byPatient = new Map<string, PatientCard>();
  for (const a of all) {
    const p = Array.isArray(a.patient) ? a.patient[0] : a.patient;
    if (!p) continue;
    const prof = Array.isArray(p.profile) ? p.profile[0] : p.profile;
    const existing = byPatient.get(p.id);
    if (existing) {
      existing.visits += 1;
      if (a.scheduled_at >= nowIso) existing.nextAppointmentId = a.id;
    } else {
      byPatient.set(p.id, {
        id: p.id,
        name: prof?.full_name ?? "Paciente",
        phone: prof?.phone ?? null,
        visits: 1,
        lastVisit: a.scheduled_at,
        nextAppointmentId: a.scheduled_at >= nowIso ? a.id : null,
      });
    }
  }

  const patients = Array.from(byPatient.values()).sort((a, b) =>
    b.lastVisit.localeCompare(a.lastVisit)
  );
  const withUpcoming = patients.filter((p) => p.nextAppointmentId).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <MedicoHeader
        eyebrow="Acompanhamento"
        title="Os meus pacientes"
        subtitle="Pacientes com quem teve consultas marcadas."
        icon={<Users className="size-5" />}
      />

      <section className="mt-8 grid grid-cols-3 gap-4">
        <StatCard tone="emerald" icon={<Users className="size-5" />} label="Pacientes" value={patients.length} hint="únicos" />
        <StatCard tone="slate" icon={<Stethoscope className="size-5" />} label="Consultas" value={all.length} hint="no total" />
        <StatCard tone="sky" icon={<CalendarClock className="size-5" />} label="Com consulta" value={withUpcoming} hint="agendada" />
      </section>

      {patients.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Users className="size-6" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Ainda sem pacientes
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Quando tiver consultas marcadas, os pacientes aparecem aqui.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {patients.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 px-5 py-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(p.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground">{p.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {p.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3" />
                      {p.phone}
                    </span>
                  )}
                  <span>
                    {p.visits} {p.visits === 1 ? "consulta" : "consultas"}
                  </span>
                  <span>· última {formatDatePT(p.lastVisit)}</span>
                </div>
              </div>
              {p.nextAppointmentId && (
                <Link
                  href={`/medico/consulta/${p.nextAppointmentId}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Próxima consulta
                  <ArrowRight className="size-3.5" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
