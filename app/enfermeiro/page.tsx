import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/labels";
import StatCard from "../_ui/StatCard";
import SectionHeading from "../_ui/SectionHeading";
import PageHeading from "../_ui/PageHeading";
import EmptyState from "../_ui/EmptyState";

export const metadata = { title: "Enfermagem · Saúde Angola" };

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-sky-100 text-sky-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-red-100 text-red-700",
};

type ApptRow = {
  id: string;
  scheduled_at: string;
  status: string;
  reason: string | null;
  patient:
    | { id: string; date_of_birth: string | null; allergies: string[] | null;
        profile: { full_name: string | null; phone: string | null } |
          { full_name: string | null; phone: string | null }[] | null }
    | { id: string; date_of_birth: string | null; allergies: string[] | null;
        profile: { full_name: string | null; phone: string | null } |
          { full_name: string | null; phone: string | null }[] | null }[]
    | null;
  doctor:
    | { full_name: string | null; specialty: string | null }
    | { full_name: string | null; specialty: string | null }[]
    | null;
};

function pickPatient(p: ApptRow["patient"]) {
  const r = Array.isArray(p) ? p[0] : p;
  if (!r) return { id: "", name: "Paciente", phone: null as string | null, age: null as number | null, allergies: [] as string[] };
  const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
  return {
    id: r.id,
    name: prof?.full_name ?? "Paciente",
    phone: prof?.phone ?? null,
    age: age(r.date_of_birth),
    allergies: (r.allergies as string[] | null) ?? [],
  };
}
function pickDoctor(d: ApptRow["doctor"]) {
  const r = Array.isArray(d) ? d[0] : d;
  return { name: r?.full_name ?? "—", specialty: r?.specialty ?? null };
}
function age(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}
function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function endOfTodayISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
function greetingPT(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

export default async function EnfermeiroHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const clinicId = profile?.clinic_id;
  if (!clinicId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <EmptyState
          icon="🏥"
          title="Sem clínica atribuída"
          desc="Peça ao administrador da clínica para o associar à equipa."
        />
      </main>
    );
  }

  const select =
    "id, scheduled_at, status, reason, patient:patients(id, date_of_birth, allergies, profile:profiles(full_name, phone)), doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)";

  const { data: rows } = await supabase
    .from("appointments")
    .select(select)
    .eq("clinic_id", clinicId)
    .gte("scheduled_at", startOfTodayISO())
    .lte("scheduled_at", endOfTodayISO())
    .order("scheduled_at", { ascending: true });

  const list = (rows as ApptRow[] | null) ?? [];
  const apptIds = list.map((a) => a.id);

  const [{ data: vitals }, { data: lowStock }] = await Promise.all([
    apptIds.length
      ? supabase
          .from("vital_signs")
          .select("appointment_id")
          .in("appointment_id", apptIds)
      : Promise.resolve({ data: [] as { appointment_id: string }[] }),
    supabase
      .from("pharmacy_stock")
      .select("id, medication_name, quantity, minimum_stock")
      .eq("clinic_id", clinicId)
      .order("quantity", { ascending: true }),
  ]);

  const triagedIds = new Set(
    (vitals as { appointment_id: string }[] | null)?.map((v) => v.appointment_id) ?? []
  );
  const lowStockItems =
    (lowStock as { id: string; medication_name: string; quantity: number; minimum_stock: number }[] | null)?.filter(
      (s) => s.quantity <= s.minimum_stock
    ) ?? [];

  const awaiting = list.filter(
    (a) => a.status === "confirmed" && !triagedIds.has(a.id)
  );
  const triaged = list.filter((a) => triagedIds.has(a.id));
  const upcoming = list.filter((a) => a.status === "scheduled");
  const inConsultation = list.filter((a) => a.status === "in_progress");

  const firstName = profile?.full_name?.split(" ")[0] ?? "enfermagem";

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <PageHeading
        eyebrow={`${greetingPT()}, ${firstName}`}
        title="Triagem de enfermagem"
        subtitle={`${awaiting.length} ${awaiting.length === 1 ? "paciente aguarda" : "pacientes aguardam"} sinais vitais antes da consulta.`}
        action={
          <Link
            href="/enfermeiro/farmacia"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Gerir farmácia
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard tone="red" icon="🩺" label="Aguardam triagem" value={awaiting.length} hint="Check-in feito" />
        <StatCard tone="emerald" icon="✅" label="Triagem feita" value={triaged.length} hint="Hoje" />
        <StatCard tone="sky" icon="🕐" label="Por chegar" value={upcoming.length} hint="Ainda não confirmados" />
        <StatCard tone="amber" icon="📦" label="Stock baixo" value={lowStockItems.length} hint="Itens a repor" />
      </section>

      {lowStockItems.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-amber-900">
              ⚠ {lowStockItems.length} {lowStockItems.length === 1 ? "medicamento" : "medicamentos"} com stock baixo
            </div>
            <Link
              href="/enfermeiro/farmacia"
              className="text-sm font-medium text-amber-800 hover:text-amber-900"
            >
              Repor stock →
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {lowStockItems.slice(0, 8).map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-xs font-medium text-amber-800"
              >
                {s.medication_name} · {s.quantity}
              </span>
            ))}
          </div>
        </div>
      )}

      <section className="mt-10">
        <SectionHeading
          title="Aguardam triagem"
          hint="Pacientes com check-in feito — registe os sinais vitais."
        />
        {awaiting.length === 0 ? (
          <EmptyState icon="🪑" title="Nenhum paciente aguarda triagem." />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {awaiting.map((a) => {
              const p = pickPatient(a.patient);
              const dr = pickDoctor(a.doctor);
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="w-16 shrink-0 text-sm font-bold text-slate-900">
                    {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900">
                      {p.name}
                      {p.age !== null && (
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          {p.age} anos
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-sm text-slate-600">
                      Dr(a). {dr.name}
                      {dr.specialty ? ` · ${dr.specialty}` : ""}
                      {a.reason ? ` · ${a.reason}` : ""}
                    </div>
                    {p.allergies.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.allergies.slice(0, 4).map((al) => (
                          <span
                            key={al}
                            className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700"
                          >
                            ⚠ {al}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/enfermeiro/triagem/${a.id}`}
                    className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                  >
                    Registar sinais vitais
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <SectionHeading title="Triagem concluída hoje" />
        {triaged.length === 0 ? (
          <EmptyState icon="✅" title="Ainda sem triagens concluídas." />
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {triaged.map((a) => {
              const p = pickPatient(a.patient);
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="w-16 shrink-0 text-sm font-bold text-slate-900">
                    {new Date(a.scheduled_at).toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="mt-0.5 text-sm text-slate-600">
                      {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_BADGE[a.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                  </span>
                  <Link
                    href={`/enfermeiro/triagem/${a.id}`}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Ver / actualizar
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {inConsultation.length > 0 && (
        <p className="mt-6 text-sm text-slate-500">
          {inConsultation.length} {inConsultation.length === 1 ? "paciente" : "pacientes"} em consulta neste momento.
        </p>
      )}
    </main>
  );
}
