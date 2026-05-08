import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  BLOOD_TYPE_LABELS,
  formatDatePT,
  formatDateTimePT,
} from "@/lib/labels";
import MedicalRecordForm from "./MedicalRecordForm";
import PrescriptionForm from "./PrescriptionForm";
import InvoiceForm from "./InvoiceForm";
import { updateAppointmentStatusAction } from "./actions";

export const metadata = { title: "Consulta · Saúde Angola" };

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-sky-100 text-sky-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-red-100 text-red-700",
};

type Medication = {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

type Vitals = Record<string, string | number | null | undefined>;

function asMeds(v: unknown): Medication[] {
  return Array.isArray(v) ? (v as Medication[]) : [];
}

function asVitals(v: unknown): Vitals | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Vitals;
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

export default async function ConsultaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: appt } = await supabase
    .from("appointments")
    .select(
      `id, scheduled_at, duration_minutes, status, appointment_type, reason, notes, doctor_id,
       patient:patients(
         id,
         date_of_birth, blood_type, gender, allergies, chronic_conditions,
         emergency_contact_name, emergency_contact_phone,
         profile:profiles(full_name, email, phone)
       ),
       clinic:clinics(name)`
    )
    .eq("id", id)
    .maybeSingle();

  if (!appt) notFound();
  if (appt.doctor_id !== user.id) redirect("/medico/agenda");

  const patientRel = Array.isArray(appt.patient) ? appt.patient[0] : appt.patient;
  if (!patientRel) notFound();

  const profileRel = Array.isArray(patientRel.profile)
    ? patientRel.profile[0]
    : patientRel.profile;
  const clinicRel = Array.isArray(appt.clinic) ? appt.clinic[0] : appt.clinic;

  const [{ data: records }, { data: rxs }] = await Promise.all([
    supabase
      .from("medical_records")
      .select(
        "id, diagnosis, symptoms, notes, vitals, record_date, doctor:profiles!medical_records_doctor_id_fkey(full_name)"
      )
      .eq("patient_id", patientRel.id)
      .order("record_date", { ascending: false })
      .limit(20),
    supabase
      .from("prescriptions")
      .select(
        "id, medications, qr_code, notes, issued_at, expires_at, doctor:profiles!prescriptions_doctor_id_fkey(full_name)"
      )
      .eq("patient_id", patientRel.id)
      .order("issued_at", { ascending: false })
      .limit(10),
  ]);

  const patientName = profileRel?.full_name ?? "Paciente";
  const patientAge = age(patientRel.date_of_birth);
  const allergies = (patientRel.allergies as string[] | null) ?? [];
  const conditions = (patientRel.chronic_conditions as string[] | null) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-4">
        <Link
          href="/medico/agenda"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Voltar à agenda
        </Link>
      </div>

      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Consulta
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {patientName}
            </h1>
            <div className="mt-2 text-sm text-slate-600">
              {formatDateTimePT(appt.scheduled_at)} · {appt.duration_minutes} min
              {clinicRel?.name ? ` · ${clinicRel.name}` : ""}
            </div>
            {appt.reason && (
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Motivo:</span>{" "}
                {appt.reason}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              className={
                STATUS_BADGE[appt.status] ?? "bg-slate-100 text-slate-700"
              }
            >
              {APPOINTMENT_STATUS_LABELS[appt.status] ?? appt.status}
            </Badge>
            <span className="text-xs text-slate-500">
              {APPOINTMENT_TYPE_LABELS[appt.appointment_type] ?? appt.appointment_type}
            </span>
          </div>
        </div>

        <StatusActions currentStatus={appt.status} appointmentId={appt.id} />
      </header>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ficha do paciente
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row
                label="Idade"
                value={
                  patientAge !== null
                    ? `${patientAge} anos${
                        patientRel.date_of_birth
                          ? ` · ${formatDatePT(patientRel.date_of_birth)}`
                          : ""
                      }`
                    : "—"
                }
              />
              <Row
                label="Género"
                value={patientRel.gender ?? "—"}
              />
              <Row
                label="Tipo sanguíneo"
                value={
                  BLOOD_TYPE_LABELS[patientRel.blood_type ?? "unknown"] ?? "—"
                }
              />
              <Row label="Telefone" value={profileRel?.phone ?? "—"} />
              <Row label="Email" value={profileRel?.email ?? "—"} />
              <Row
                label="Contacto de emergência"
                value={
                  patientRel.emergency_contact_name
                    ? `${patientRel.emergency_contact_name}${
                        patientRel.emergency_contact_phone
                          ? ` · ${patientRel.emergency_contact_phone}`
                          : ""
                      }`
                    : "—"
                }
              />
            </dl>

            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Alergias
              </div>
              {allergies.length === 0 ? (
                <div className="mt-1 text-sm text-slate-500">—</div>
              ) : (
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {allergies.map((a) => (
                    <li
                      key={a}
                      className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Doenças crónicas
              </div>
              {conditions.length === 0 ? (
                <div className="mt-1 text-sm text-slate-500">—</div>
              ) : (
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {conditions.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <HistorySection
            title="Registos clínicos"
            empty="Sem registos clínicos anteriores."
            count={records?.length ?? 0}
          >
            {(records ?? []).map((r) => {
              const v = asVitals(r.vitals);
              const dr = Array.isArray(r.doctor) ? r.doctor[0] : r.doctor;
              return (
                <li key={r.id} className="px-4 py-3 text-sm">
                  <div className="text-xs text-slate-500">
                    {formatDateTimePT(r.record_date)}
                    {dr?.full_name ? ` · ${dr.full_name}` : ""}
                  </div>
                  {r.diagnosis && (
                    <div className="mt-1 font-medium text-slate-900">
                      {r.diagnosis}
                    </div>
                  )}
                  {r.symptoms && (
                    <div className="mt-1 text-slate-700">
                      <span className="text-slate-500">Sintomas:</span>{" "}
                      {r.symptoms}
                    </div>
                  )}
                  {r.notes && <div className="mt-1 text-slate-700">{r.notes}</div>}
                  {v && Object.keys(v).length > 0 && (
                    <div className="mt-1 text-xs text-slate-500">
                      {Object.entries(v)
                        .filter(([, val]) => val !== null && val !== undefined && val !== "")
                        .map(([k, val]) => `${k.replace(/_/g, " ")}: ${val}`)
                        .join(" · ")}
                    </div>
                  )}
                </li>
              );
            })}
          </HistorySection>

          <HistorySection
            title="Receitas anteriores"
            empty="Sem receitas anteriores."
            count={rxs?.length ?? 0}
          >
            {(rxs ?? []).map((rx) => {
              const meds = asMeds(rx.medications);
              const dr = Array.isArray(rx.doctor) ? rx.doctor[0] : rx.doctor;
              return (
                <li key={rx.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">
                      {formatDateTimePT(rx.issued_at)}
                      {dr?.full_name ? ` · ${dr.full_name}` : ""}
                    </div>
                    <a
                      href={`/api/receita/${rx.id}/pdf`}
                      target="_blank"
                      rel="noopener"
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      PDF →
                    </a>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {meds.map((m, i) => (
                      <li key={i} className="text-slate-700">
                        • {m.name ?? "—"}
                        {m.dosage ? ` · ${m.dosage}` : ""}
                        {m.frequency ? ` · ${m.frequency}` : ""}
                      </li>
                    ))}
                  </ul>
                  <code className="mt-1 block text-[10px] text-slate-400">
                    {rx.qr_code}
                  </code>
                </li>
              );
            })}
          </HistorySection>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Novo registo clínico
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Diagnóstico, sintomas, notas e sinais vitais desta consulta.
            </p>
            <div className="mt-4">
              <MedicalRecordForm encounter={{ kind: "appointment", id: appt.id }} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Emitir receita
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              A receita fica disponível para o paciente com um código QR único.
            </p>
            <div className="mt-4">
              <PrescriptionForm encounter={{ kind: "appointment", id: appt.id }} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Emitir fatura
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              O paciente pode pagar via Multicaixa Express através do painel.
            </p>
            <div className="mt-4">
              <InvoiceForm encounter={{ kind: "appointment", id: appt.id }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{value ?? "—"}</dd>
    </div>
  );
}

function HistorySection({
  title,
  empty,
  count,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
      </div>
      {count === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-slate-500">{empty}</div>
      ) : (
        <ul className="divide-y divide-slate-100">{children}</ul>
      )}
    </div>
  );
}

function Badge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function StatusActions({
  currentStatus,
  appointmentId,
}: {
  currentStatus: string;
  appointmentId: string;
}) {
  const transitions: Array<{ to: string; label: string; primary?: boolean }> = [];
  if (currentStatus === "scheduled" || currentStatus === "confirmed") {
    transitions.push({ to: "in_progress", label: "Iniciar consulta", primary: true });
    transitions.push({ to: "no_show", label: "Não compareceu" });
    transitions.push({ to: "cancelled", label: "Cancelar" });
  } else if (currentStatus === "in_progress") {
    transitions.push({ to: "completed", label: "Concluir consulta", primary: true });
  }

  if (transitions.length === 0) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
      {transitions.map((t) => (
        <form key={t.to} action={updateAppointmentStatusAction}>
          <input type="hidden" name="appointment_id" value={appointmentId} />
          <input type="hidden" name="status" value={t.to} />
          <button
            type="submit"
            className={
              t.primary
                ? "rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                : "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            {t.label}
          </button>
        </form>
      ))}
    </div>
  );
}
