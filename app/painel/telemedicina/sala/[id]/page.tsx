import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CONSULTATION_STATUS_LABELS,
  URGENCY_BADGE_CLASS,
  URGENCY_LABEL_PT,
  type Urgency,
} from "@/lib/triage";
import PatientSala from "./PatientSala";

export const metadata = { title: "Sala de espera · Saúde Angola" };

type Row = {
  id: string;
  status: string;
  ai_urgency: Urgency | null;
  ai_triage_summary: string | null;
  video_room_url: string | null;
  patient: { profile: { full_name: string | null } | { full_name: string | null }[] | null } |
    { profile: { full_name: string | null } | { full_name: string | null }[] | null }[] | null;
  doctor: { full_name: string | null } | { full_name: string | null }[] | null;
};

function pickName<T extends { full_name?: string | null }>(
  v: T | T[] | null | undefined
): string | null {
  if (!v) return null;
  const r = Array.isArray(v) ? v[0] : v;
  return r?.full_name ?? null;
}

export default async function SalaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aceito?: string }>;
}) {
  const { id } = await params;
  const { aceito } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: row } = await supabase
    .from("consultations")
    .select(
      `id, status, ai_urgency, ai_triage_summary, video_room_url,
       patient:patients(profile:profiles(full_name)),
       doctor:profiles!consultations_doctor_id_fkey(full_name)`
    )
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();
  const c = row as Row;

  // Emergency-tier triage routes through the 112 interstitial first, unless
  // the patient has explicitly chosen to continue (?aceito=1) or the doctor
  // is already attending.
  if (
    c.ai_urgency === "emergency" &&
    c.status === "waiting" &&
    aceito !== "1"
  ) {
    redirect(`/painel/telemedicina/emergencia/${c.id}`);
  }

  const patientRel = Array.isArray(c.patient) ? c.patient[0] : c.patient;
  const patientName = pickName(patientRel?.profile);
  const doctorName = pickName(c.doctor);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sala de telemedicina
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {CONSULTATION_STATUS_LABELS[c.status] ?? c.status}
            {c.ai_urgency ? ` · Urgência ${URGENCY_LABEL_PT[c.ai_urgency]}` : ""}
          </p>
        </div>
        {c.ai_urgency && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${URGENCY_BADGE_CLASS[c.ai_urgency]}`}
          >
            {URGENCY_LABEL_PT[c.ai_urgency]}
          </span>
        )}
      </div>

      {c.ai_triage_summary && (
        <p className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {c.ai_triage_summary}
        </p>
      )}

      <div className="mt-6">
        <PatientSala
          consultationId={c.id}
          status={c.status}
          videoRoomUrl={c.video_room_url}
          doctorName={doctorName}
          patientName={patientName}
        />
      </div>
    </main>
  );
}
