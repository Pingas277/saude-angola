import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  CONSULTATION_STATUS_LABELS,
  URGENCY_BADGE_CLASS,
  URGENCY_LABEL_PT,
  type Urgency,
} from "@/lib/triage";
import PatientSala from "./PatientSala";

export const metadata = { title: "Sala de espera · Lunga" };

type Profile = {
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
};
type PatientRel = {
  profile: Profile | Profile[] | null;
};

type Row = {
  id: string;
  status: string;
  ai_urgency: Urgency | null;
  ai_triage_summary: string | null;
  video_room_url: string | null;
  patient: PatientRel | PatientRel[] | null;
  doctor: Profile | Profile[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
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
       patient:patients(profile:profiles!patients_profile_id_fkey(full_name, specialty, avatar_url)),
       doctor:profiles!consultations_doctor_id_fkey(full_name, specialty, avatar_url)`
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

  const patientProfile = pickOne(pickOne(c.patient)?.profile ?? null);
  const doctor = pickOne(c.doctor);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Back link */}
      <Link
        href="/painel/telemedicina"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Telemedicina
      </Link>

      {/* Header */}
      <header className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Telemedicina
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Sala de espera
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {CONSULTATION_STATUS_LABELS[c.status] ?? c.status}
            {c.ai_urgency
              ? ` · Urgência ${URGENCY_LABEL_PT[c.ai_urgency]}`
              : ""}
          </p>
        </div>
        {c.ai_urgency && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ring-1 ring-current/20 ${URGENCY_BADGE_CLASS[c.ai_urgency]}`}
          >
            {URGENCY_LABEL_PT[c.ai_urgency]}
          </span>
        )}
      </header>

      {/* AI triage summary */}
      {c.ai_triage_summary && (
        <p className="mt-5 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Triagem · </span>
          {c.ai_triage_summary}
        </p>
      )}

      {/* Main */}
      <div className="mt-6">
        <PatientSala
          consultationId={c.id}
          status={c.status}
          videoRoomUrl={c.video_room_url}
          doctorName={doctor?.full_name ?? null}
          doctorSpecialty={doctor?.specialty ?? null}
          doctorAvatarUrl={doctor?.avatar_url ?? null}
          patientName={patientProfile?.full_name ?? null}
        />
      </div>
    </main>
  );
}
