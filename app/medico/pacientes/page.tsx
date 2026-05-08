import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTimePT } from "@/lib/labels";

export const metadata = { title: "Pacientes · Saúde Angola" };

type ApptRow = {
  id: string;
  scheduled_at: string;
  patient: {
    id: string;
    profile: { full_name: string | null; phone: string | null } |
      { full_name: string | null; phone: string | null }[] | null;
  } | { id: string; profile: { full_name: string | null; phone: string | null } |
      { full_name: string | null; phone: string | null }[] | null }[] | null;
};

type PatientCard = {
  id: string;
  name: string;
  phone: string | null;
  visits: number;
  lastVisit: string;
  nextAppointmentId: string | null;
};

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

  const byPatient = new Map<string, PatientCard>();
  for (const a of (rows as ApptRow[] | null) ?? []) {
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

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Os meus pacientes
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pacientes com quem teve consultas marcadas.
        </p>
      </div>

      {patients.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Ainda não tem pacientes registados. Quando tiver consultas marcadas, os
          pacientes aparecem aqui.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {patients.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900">{p.name}</div>
                <div className="mt-0.5 text-sm text-slate-600">
                  {p.phone ? `${p.phone} · ` : ""}
                  {p.visits} {p.visits === 1 ? "consulta" : "consultas"} · última em{" "}
                  {formatDateTimePT(p.lastVisit)}
                </div>
              </div>
              {p.nextAppointmentId && (
                <Link
                  href={`/medico/consulta/${p.nextAppointmentId}`}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Próxima consulta →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
