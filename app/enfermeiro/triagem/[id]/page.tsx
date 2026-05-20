import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  BLOOD_TYPE_LABELS,
  formatDatePT,
  formatDateTimePT,
} from "@/lib/labels";
import VitalSignsForm from "./VitalSignsForm";

export const metadata = { title: "Triagem · Lunga" };

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
function str(v: number | string | null | undefined): string | undefined {
  return v === null || v === undefined ? undefined : String(v);
}

export default async function TriagemPage({
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

  const { data: prof } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (prof?.role !== "nurse") redirect("/painel");

  const { data: appt } = await supabase
    .from("appointments")
    .select(
      `id, scheduled_at, status, reason, clinic_id,
       patient:patients(
         id, date_of_birth, blood_type, gender, allergies, chronic_conditions,
         profile:profiles(full_name, phone)
       ),
       doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)`
    )
    .eq("id", id)
    .maybeSingle();

  if (!appt) notFound();
  if (appt.clinic_id !== prof?.clinic_id) redirect("/enfermeiro");

  const patient = Array.isArray(appt.patient) ? appt.patient[0] : appt.patient;
  if (!patient) notFound();
  const pProfile = Array.isArray(patient.profile)
    ? patient.profile[0]
    : patient.profile;
  const doctor = Array.isArray(appt.doctor) ? appt.doctor[0] : appt.doctor;

  const { data: history } = await supabase
    .from("vital_signs")
    .select(
      "id, temperature_c, blood_pressure, pulse_bpm, respiratory_rate, oxygen_saturation, weight_kg, height_cm, notes, recorded_at"
    )
    .eq("appointment_id", id)
    .order("recorded_at", { ascending: false });

  const records =
    (history as Array<{
      id: string;
      temperature_c: number | null;
      blood_pressure: string | null;
      pulse_bpm: number | null;
      respiratory_rate: number | null;
      oxygen_saturation: number | null;
      weight_kg: number | null;
      height_cm: number | null;
      notes: string | null;
      recorded_at: string;
    }> | null) ?? [];
  const latest = records[0];

  const allergies = (patient.allergies as string[] | null) ?? [];
  const conditions = (patient.chronic_conditions as string[] | null) ?? [];
  const patientAge = age(patient.date_of_birth);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-4">
        <Link
          href="/enfermeiro"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Voltar à triagem
        </Link>
      </div>

      <header className="rounded-xl border border-border bg-card p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Triagem de enfermagem
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          {pProfile?.full_name ?? "Paciente"}
        </h1>
        <div className="mt-2 text-sm text-muted-foreground">
          {formatDateTimePT(appt.scheduled_at)}
          {doctor?.full_name ? ` · Dr(a). ${doctor.full_name}` : ""}
          {doctor?.specialty ? ` · ${doctor.specialty}` : ""}
        </div>
        {appt.reason && (
          <p className="mt-3 text-sm text-foreground">
            <span className="font-medium text-foreground">Motivo:</span>{" "}
            {appt.reason}
          </p>
        )}
      </header>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1 space-y-6">
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
                        patient.date_of_birth
                          ? ` · ${formatDatePT(patient.date_of_birth)}`
                          : ""
                      }`
                    : "—"
                }
              />
              <Row label="Género" value={patient.gender ?? "—"} />
              <Row
                label="Tipo sanguíneo"
                value={BLOOD_TYPE_LABELS[patient.blood_type ?? "unknown"] ?? "—"}
              />
              <Row label="Telefone" value={pProfile?.phone ?? "—"} />
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
                      ⚠ {a}
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

          {records.length > 0 && (
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Triagens desta consulta
                </h3>
              </div>
              <ul className="divide-y divide-border">
                {records.map((r) => (
                  <li key={r.id} className="px-4 py-3 text-sm">
                    <div className="text-xs text-muted-foreground">
                      {formatDateTimePT(r.recorded_at)}
                    </div>
                    <div className="mt-1 text-foreground">
                      {[
                        r.temperature_c != null && `T ${r.temperature_c}°C`,
                        r.blood_pressure && `PA ${r.blood_pressure}`,
                        r.pulse_bpm != null && `P ${r.pulse_bpm}`,
                        r.respiratory_rate != null && `FR ${r.respiratory_rate}`,
                        r.oxygen_saturation != null && `SpO₂ ${r.oxygen_saturation}%`,
                        r.weight_kg != null && `${r.weight_kg}kg`,
                        r.height_cm != null && `${r.height_cm}cm`,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </div>
                    {r.notes && (
                      <div className="mt-1 text-muted-foreground">{r.notes}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {latest ? "Nova medição" : "Sinais vitais"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {latest
                ? "Os campos vêm pré-preenchidos com a última medição. Ajuste e guarde uma nova."
                : "Registe os sinais vitais. O médico verá esta triagem ao abrir a consulta."}
            </p>
            <div className="mt-4">
              <VitalSignsForm
                appointmentId={appt.id}
                defaults={
                  latest
                    ? {
                        temperature_c: str(latest.temperature_c),
                        blood_pressure: str(latest.blood_pressure),
                        pulse_bpm: str(latest.pulse_bpm),
                        respiratory_rate: str(latest.respiratory_rate),
                        oxygen_saturation: str(latest.oxygen_saturation),
                        weight_kg: str(latest.weight_kg),
                        height_cm: str(latest.height_cm),
                        notes: str(latest.notes),
                      }
                    : undefined
                }
              />
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
