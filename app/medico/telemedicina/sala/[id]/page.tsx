import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  BLOOD_TYPE_LABELS,
  formatDateTimePT,
  formatDatePT,
} from "@/lib/labels";
import {
  CONSULTATION_STATUS_LABELS,
  URGENCY_BADGE_CLASS,
  URGENCY_LABEL_PT,
  type Urgency,
} from "@/lib/triage";
import MedicalRecordForm from "@/app/medico/consulta/[id]/MedicalRecordForm";
import PrescriptionForm from "@/app/medico/consulta/[id]/PrescriptionForm";
import InvoiceForm from "@/app/medico/consulta/[id]/InvoiceForm";
import DoctorVideoFrame from "./DoctorVideoFrame";
import { endConsultationAction } from "../../actions";

export const metadata = { title: "Atendimento por vídeo · Lunga" };

type Vitals = Record<string, string | number | null | undefined>;
type Medication = {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

function asMeds(v: unknown): Medication[] {
  return Array.isArray(v) ? (v as Medication[]) : [];
}
function asVitals(v: unknown): Vitals | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Vitals;
}
function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

export default async function DoctorSalaPage({
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

  const { data: c } = await supabase
    .from("consultations")
    .select(
      `id, status, ai_urgency, ai_triage_summary, video_room_url, doctor_id,
       started_at, ended_at,
       patient:patients(
         id,
         date_of_birth, blood_type, gender, allergies, chronic_conditions,
         emergency_contact_name, emergency_contact_phone,
         profile:profiles!patients_profile_id_fkey(full_name, phone, email)
       )`
    )
    .eq("id", id)
    .maybeSingle();

  if (!c) notFound();
  if (c.doctor_id !== user.id) redirect("/medico/telemedicina");

  const patientRel = Array.isArray(c.patient) ? c.patient[0] : c.patient;
  if (!patientRel) notFound();
  const profileRel = Array.isArray(patientRel.profile)
    ? patientRel.profile[0]
    : patientRel.profile;

  const [{ data: records }, { data: rxs }] = await Promise.all([
    supabase
      .from("medical_records")
      .select(
        "id, diagnosis, symptoms, notes, vitals, record_date, doctor:profiles!medical_records_doctor_id_fkey(full_name)"
      )
      .eq("patient_id", patientRel.id)
      .order("record_date", { ascending: false })
      .limit(10),
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
  const patientAge = ageFromDob(patientRel.date_of_birth);
  const allergies = (patientRel.allergies as string[] | null) ?? [];
  const conditions = (patientRel.chronic_conditions as string[] | null) ?? [];
  const urgency = c.ai_urgency as Urgency | null;

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/medico/telemedicina"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Voltar à lista
        </Link>
        {c.status === "in_progress" && (
          <form action={endConsultationAction}>
            <input type="hidden" name="consultation_id" value={c.id} />
            <button
              type="submit"
              className="rounded-md bg-destructive px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-destructive/90"
            >
              Concluir consulta
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* === Video + forms (main) === */}
        <div className="space-y-6">
          <header className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Telemedicina
                </div>
                <h1 className="mt-1 text-xl font-bold text-foreground">
                  {patientName}
                </h1>
                <div className="mt-1 text-sm text-muted-foreground">
                  {CONSULTATION_STATUS_LABELS[c.status] ?? c.status}
                  {c.started_at ? ` · iniciada às ${formatDateTimePT(c.started_at)}` : ""}
                </div>
              </div>
              {urgency && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${URGENCY_BADGE_CLASS[urgency]}`}
                >
                  Urgência {URGENCY_LABEL_PT[urgency]}
                </span>
              )}
            </div>
            {c.ai_triage_summary && (
              <p className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-sm text-foreground">
                {c.ai_triage_summary}
              </p>
            )}
          </header>

          {c.status === "in_progress" && c.video_room_url ? (
            <DoctorVideoFrame
              videoUrl={c.video_room_url}
              doctorName={"Médico"}
            />
          ) : c.status === "completed" ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Consulta concluída.
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {CONSULTATION_STATUS_LABELS[c.status] ?? c.status}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Novo registo clínico
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Diagnóstico, sintomas, notas e sinais vitais desta videoconsulta.
            </p>
            <div className="mt-4">
              <MedicalRecordForm encounter={{ kind: "consultation", id: c.id }} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Emitir receita
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A receita fica disponível para o paciente com um código QR único
              e pode ser descarregada em PDF.
            </p>
            <div className="mt-4">
              <PrescriptionForm encounter={{ kind: "consultation", id: c.id }} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Emitir fatura
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              O paciente paga por Multicaixa Express e a fatura fica visível no
              seu painel.
            </p>
            <div className="mt-4">
              <InvoiceForm encounter={{ kind: "consultation", id: c.id }} />
            </div>
          </div>
        </div>

        {/* === Patient sidebar === */}
        <aside className="space-y-6">
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
              <Row label="Género" value={patientRel.gender ?? "—"} />
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
                  {conditions.map((cn) => (
                    <li
                      key={cn}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                    >
                      {cn}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <HistorySection
            title="Registos clínicos"
            empty="Sem registos anteriores."
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
      </div>
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
    <div className="rounded-xl border border-border bg-card">
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
