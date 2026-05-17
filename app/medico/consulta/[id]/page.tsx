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

export const metadata = { title: "Consulta · ANGOLASAUDE" };

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  confirmed: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-muted text-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  no_show: "bg-destructive/10 text-destructive",
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

  const [{ data: records }, { data: rxs }, { data: triageVitals }] =
    await Promise.all([
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
      supabase
        .from("vital_signs")
        .select(
          "temperature_c, blood_pressure, pulse_bpm, respiratory_rate, oxygen_saturation, weight_kg, height_cm, notes, recorded_at, recorded_by:profiles!vital_signs_recorded_by_fkey(full_name)"
        )
        .eq("appointment_id", appt.id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const nurseVitals = triageVitals as {
    temperature_c: number | null;
    blood_pressure: string | null;
    pulse_bpm: number | null;
    respiratory_rate: number | null;
    oxygen_saturation: number | null;
    weight_kg: number | null;
    height_cm: number | null;
    notes: string | null;
    recorded_at: string;
    recorded_by:
      | { full_name: string | null }
      | { full_name: string | null }[]
      | null;
  } | null;
  const nurseName = nurseVitals
    ? Array.isArray(nurseVitals.recorded_by)
      ? nurseVitals.recorded_by[0]?.full_name
      : nurseVitals.recorded_by?.full_name
    : null;
  const initialVitals = nurseVitals
    ? {
        temp:
          nurseVitals.temperature_c != null
            ? String(nurseVitals.temperature_c)
            : undefined,
        bp: nurseVitals.blood_pressure ?? undefined,
        pulse:
          nurseVitals.pulse_bpm != null
            ? String(nurseVitals.pulse_bpm)
            : undefined,
        weight:
          nurseVitals.weight_kg != null
            ? String(nurseVitals.weight_kg)
            : undefined,
      }
    : undefined;

  const patientName = profileRel?.full_name ?? "Paciente";
  const patientAge = age(patientRel.date_of_birth);
  const allergies = (patientRel.allergies as string[] | null) ?? [];
  const conditions = (patientRel.chronic_conditions as string[] | null) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-4">
        <Link
          href="/medico/agenda"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Voltar à agenda
        </Link>
      </div>

      <header className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Consulta
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {patientName}
            </h1>
            <div className="mt-2 text-sm text-muted-foreground">
              {formatDateTimePT(appt.scheduled_at)} · {appt.duration_minutes} min
              {clinicRel?.name ? ` · ${clinicRel.name}` : ""}
            </div>
            {appt.reason && (
              <p className="mt-3 text-sm text-foreground">
                <span className="font-medium text-foreground">Motivo:</span>{" "}
                {appt.reason}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              className={
                STATUS_BADGE[appt.status] ?? "bg-muted text-foreground"
              }
            >
              {APPOINTMENT_STATUS_LABELS[appt.status] ?? appt.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {APPOINTMENT_TYPE_LABELS[appt.appointment_type] ?? appt.appointment_type}
            </span>
          </div>
        </div>

        <StatusActions currentStatus={appt.status} appointmentId={appt.id} />
      </header>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Alergias
              </div>
              {allergies.length === 0 ? (
                <div className="mt-1 text-sm text-muted-foreground">—</div>
              ) : (
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {allergies.map((a) => (
                    <li
                      key={a}
                      className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Doenças crónicas
              </div>
              {conditions.length === 0 ? (
                <div className="mt-1 text-sm text-muted-foreground">—</div>
              ) : (
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {conditions.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {nurseVitals && (
            <div className="mt-6 rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                Triagem de enfermagem
              </h2>
              <p className="mt-0.5 text-xs text-sky-600 dark:text-sky-400">
                {formatDateTimePT(nurseVitals.recorded_at)}
                {nurseName ? ` · ${nurseName}` : ""}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {nurseVitals.temperature_c != null && (
                  <VitalRow label="Temperatura" value={`${nurseVitals.temperature_c} °C`} />
                )}
                {nurseVitals.blood_pressure && (
                  <VitalRow label="Pressão art." value={nurseVitals.blood_pressure} />
                )}
                {nurseVitals.pulse_bpm != null && (
                  <VitalRow label="Pulso" value={`${nurseVitals.pulse_bpm} bpm`} />
                )}
                {nurseVitals.respiratory_rate != null && (
                  <VitalRow label="Freq. resp." value={String(nurseVitals.respiratory_rate)} />
                )}
                {nurseVitals.oxygen_saturation != null && (
                  <VitalRow label="SpO₂" value={`${nurseVitals.oxygen_saturation} %`} />
                )}
                {nurseVitals.weight_kg != null && (
                  <VitalRow label="Peso" value={`${nurseVitals.weight_kg} kg`} />
                )}
                {nurseVitals.height_cm != null && (
                  <VitalRow label="Altura" value={`${nurseVitals.height_cm} cm`} />
                )}
              </dl>
              {nurseVitals.notes && (
                <p className="mt-3 border-t border-sky-500/30 pt-3 text-sm text-foreground">
                  {nurseVitals.notes}
                </p>
              )}
            </div>
          )}

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
                  <div className="text-xs text-muted-foreground">
                    {formatDateTimePT(r.record_date)}
                    {dr?.full_name ? ` · ${dr.full_name}` : ""}
                  </div>
                  {r.diagnosis && (
                    <div className="mt-1 font-medium text-foreground">
                      {r.diagnosis}
                    </div>
                  )}
                  {r.symptoms && (
                    <div className="mt-1 text-foreground">
                      <span className="text-muted-foreground">Sintomas:</span>{" "}
                      {r.symptoms}
                    </div>
                  )}
                  {r.notes && <div className="mt-1 text-foreground">{r.notes}</div>}
                  {v && Object.keys(v).length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
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
                    <div className="text-xs text-muted-foreground">
                      {formatDateTimePT(rx.issued_at)}
                      {dr?.full_name ? ` · ${dr.full_name}` : ""}
                    </div>
                    <a
                      href={`/api/receita/${rx.id}/pdf`}
                      target="_blank"
                      rel="noopener"
                      className="text-xs font-medium text-primary hover:text-primary"
                    >
                      PDF →
                    </a>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {meds.map((m, i) => (
                      <li key={i} className="text-foreground">
                        • {m.name ?? "—"}
                        {m.dosage ? ` · ${m.dosage}` : ""}
                        {m.frequency ? ` · ${m.frequency}` : ""}
                      </li>
                    ))}
                  </ul>
                  <code className="mt-1 block text-[10px] text-muted-foreground">
                    {rx.qr_code}
                  </code>
                </li>
              );
            })}
          </HistorySection>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Novo registo clínico
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Diagnóstico, sintomas, notas e sinais vitais desta consulta.
            </p>
            <div className="mt-4">
              <MedicalRecordForm
                encounter={{ kind: "appointment", id: appt.id }}
                initialVitals={initialVitals}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Emitir receita
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A receita fica disponível para o paciente com um código QR único.
            </p>
            <div className="mt-4">
              <PrescriptionForm encounter={{ kind: "appointment", id: appt.id }} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Emitir fatura
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
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
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

function VitalRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-sky-600 dark:text-sky-400">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
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
    <div className="mt-6 rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      {count === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">{empty}</div>
      ) : (
        <ul className="divide-y divide-border">{children}</ul>
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
    <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
      {transitions.map((t) => (
        <form key={t.to} action={updateAppointmentStatusAction}>
          <input type="hidden" name="appointment_id" value={appointmentId} />
          <input type="hidden" name="status" value={t.to} />
          <button
            type="submit"
            className={
              t.primary
                ? "rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                : "rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/40"
            }
          >
            {t.label}
          </button>
        </form>
      ))}
    </div>
  );
}
