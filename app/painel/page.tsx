import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarPlus,
  CalendarClock,
  History,
  Pill,
  FlaskConical,
  Video,
  Stethoscope,
  ArrowRight,
  MapPin,
  CheckCircle2,
  HeartPulse,
  Thermometer,
  Activity as ActivityIcon,
  Wind,
  Scale,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  formatDateTimePT,
  formatDatePT,
} from "@/lib/labels";
import GradientStatCard from "../_ui/GradientStatCard";
import HealthPassport from "../_ui/HealthPassport";
import QuickShortcut from "./QuickShortcut";

export const metadata = { title: "Painel · Lunga" };

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  confirmed: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-muted text-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  no_show: "bg-destructive/10 text-destructive",
};

function greetingPT(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

type ApptJoin = {
  id: string;
  scheduled_at: string;
  status: string;
  appointment_type: string;
  reason: string | null;
  doctor:
    | { full_name: string | null; specialty: string | null }
    | { full_name: string | null; specialty: string | null }[]
    | null;
  clinic: { name: string | null } | { name: string | null }[] | null;
};

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function PainelPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "doctor") redirect("/medico");
  if (profile?.role === "admin") redirect("/clinica");
  if (profile?.role === "receptionist") redirect("/recepcao");
  if (profile?.role === "nurse") redirect("/enfermeiro");

  const { data: patient } = await supabase
    .from("patients")
    .select(
      "id, id_number, date_of_birth, blood_type, gender, allergies"
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!patient && profile?.role === "patient") {
    redirect("/perfil?onboarding=1");
  }

  const nowIso = new Date().toISOString();
  const fallbackId = "00000000-0000-0000-0000-000000000000";
  const pid = patient?.id ?? fallbackId;
  const apptSelect =
    "id, scheduled_at, status, appointment_type, reason, doctor:profiles!appointments_doctor_id_fkey(full_name, specialty), clinic:clinics(name)";

  const [
    { data: nextAppt },
    { count: pastApptCount },
    { count: upcomingCount },
    { data: recent },
    { data: lastRx },
    { data: lastLab },
    { data: lastVitals },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select(apptSelect)
      .eq("patient_id", pid)
      .gte("scheduled_at", nowIso)
      .not("status", "in", "(cancelled,no_show)")
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", pid)
      .lt("scheduled_at", nowIso),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", pid)
      .gte("scheduled_at", nowIso)
      .not("status", "in", "(cancelled,no_show)"),
    supabase
      .from("appointments")
      .select(apptSelect)
      .eq("patient_id", pid)
      .order("scheduled_at", { ascending: false })
      .limit(4),
    supabase
      .from("prescriptions")
      .select("id, issued_at")
      .eq("patient_id", pid)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("lab_results")
      .select("id, test_name, lab_name, result_date")
      .eq("patient_id", pid)
      .order("result_date", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("vital_signs")
      .select(
        "temperature_c, blood_pressure, pulse_bpm, oxygen_saturation, weight_kg, recorded_at"
      )
      .eq("patient_id", pid)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const v = lastVitals as
    | {
        temperature_c: number | null;
        blood_pressure: string | null;
        pulse_bpm: number | null;
        oxygen_saturation: number | null;
        weight_kg: number | null;
        recorded_at: string;
      }
    | null;

  const firstName = profile?.full_name?.split(" ")[0] ?? "paciente";
  const na = nextAppt as ApptJoin | null;
  const naDoctor = na ? one(na.doctor) : null;
  const naClinic = na ? one(na.clinic) : null;
  const recentList = ((recent as ApptJoin[] | null) ?? []).filter(
    (r) => r.id !== na?.id
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-primary">
            {greetingPT()}, {firstName}
          </div>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            O seu painel de saúde
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("pt-PT", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Link
          href="/painel/marcar"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <CalendarPlus className="size-4" />
          Marcar consulta
        </Link>
      </header>

      {/* Health passport */}
      <section className="mt-8">
        <HealthPassport
          userId={user.id}
          profile={{
            full_name: profile?.full_name ?? null,
            avatar_url: profile?.avatar_url ?? null,
          }}
          patient={
            patient
              ? {
                  id_number: patient.id_number ?? null,
                  date_of_birth: patient.date_of_birth ?? null,
                  blood_type: patient.blood_type ?? null,
                  gender: patient.gender ?? null,
                  allergies: (patient.allergies as string[] | null) ?? null,
                }
              : null
          }
        />
      </section>

      {/* Spotlight + telemedicina */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {na ? (
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  Próxima consulta
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_BADGE[na.status] ?? "bg-muted text-foreground"
                  }`}
                >
                  {APPOINTMENT_STATUS_LABELS[na.status] ?? na.status}
                </span>
              </div>

              <div className="mt-4 flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Stethoscope className="size-6" />
                </span>
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-foreground">
                    {naDoctor?.full_name
                      ? `Dr(a). ${naDoctor.full_name}`
                      : "Médico a confirmar"}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {naDoctor?.specialty ?? "Consulta"}
                    {naClinic?.name ? (
                      <>
                        {" · "}
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {naClinic.name}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {na.reason && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {na.reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  {formatDateTimePT(na.scheduled_at)}
                </span>
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  {na.appointment_type === "telemedicine" ? (
                    <Video className="size-4" />
                  ) : (
                    <MapPin className="size-4" />
                  )}
                  {APPOINTMENT_TYPE_LABELS[na.appointment_type] ??
                    na.appointment_type}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/painel/consultas"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Ver detalhes
                  <ArrowRight className="size-4" />
                </Link>
                {na.appointment_type === "telemedicine" && (
                  <Link
                    href="/painel/telemedicina"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Video className="size-4" />
                    Sala de espera
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-start justify-center rounded-2xl border border-dashed border-border bg-card p-8">
              <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <CalendarPlus className="size-6" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                Não tem consultas marcadas
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Procure um médico por especialidade ou clínica e marque a sua
                primeira consulta — presencial ou por vídeo.
              </p>
              <Link
                href="/painel/marcar"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Marcar primeira consulta
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Telemedicina card */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
            <Video className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Falar com um médico agora
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Triagem rápida e consulta por vídeo em minutos. Sem deslocações.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Metric label="Triagem" value="< 1 min" />
            <Metric label="Espera" value="≈ 3 min" />
            <Metric label="Receita" value="QR + PDF" />
            <Metric label="Pagamento" value="MCX" />
          </dl>
          <Link
            href="/painel/telemedicina"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Iniciar consulta
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GradientStatCard
          tone="sky"
          icon={<CalendarClock className="size-5" />}
          label="Consultas futuras"
          value={upcomingCount ?? 0}
          hint={(upcomingCount ?? 0) === 1 ? "marcação" : "marcações"}
        />
        <GradientStatCard
          tone="indigo"
          icon={<History className="size-5" />}
          label="Histórico"
          value={pastApptCount ?? 0}
          hint={
            (pastApptCount ?? 0) === 1
              ? "consulta anterior"
              : "consultas anteriores"
          }
        />
        <GradientStatCard
          tone="emerald"
          icon={<Pill className="size-5" />}
          label="Última receita"
          value={lastRx ? "Disponível" : "—"}
          hint={lastRx ? formatDatePT(lastRx.issued_at) : "Sem receitas"}
        />
        <GradientStatCard
          tone="rose"
          icon={<FlaskConical className="size-5" />}
          label="Último exame"
          value={lastLab?.test_name ?? "—"}
          hint={lastLab?.lab_name ?? "Sem exames"}
        />
      </section>

      {/* Vitals (latest triagem) */}
      {v && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-sm">
                <HeartPulse className="size-5" />
              </span>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-primary">
                  Saúde
                </div>
                <h2 className="mt-0.5 text-lg font-semibold text-foreground">
                  Sinais vitais recentes
                </h2>
                <p className="text-xs text-muted-foreground">
                  Última medição em {formatDatePT(v.recorded_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {v.temperature_c != null && (
              <VitalChip
                icon={<Thermometer className="size-4" />}
                label="Temperatura"
                value={`${v.temperature_c} °C`}
                tone="rose"
              />
            )}
            {v.blood_pressure && (
              <VitalChip
                icon={<ActivityIcon className="size-4" />}
                label="Pressão"
                value={v.blood_pressure}
                tone="sky"
              />
            )}
            {v.pulse_bpm != null && (
              <VitalChip
                icon={<HeartPulse className="size-4" />}
                label="Pulso"
                value={`${v.pulse_bpm} bpm`}
                tone="amber"
              />
            )}
            {v.oxygen_saturation != null && (
              <VitalChip
                icon={<Wind className="size-4" />}
                label="SpO₂"
                value={`${v.oxygen_saturation}%`}
                tone="indigo"
              />
            )}
            {v.weight_kg != null && (
              <VitalChip
                icon={<Scale className="size-4" />}
                label="Peso"
                value={`${v.weight_kg} kg`}
                tone="emerald"
              />
            )}
          </div>
        </section>
      )}

      {/* Activity + quick actions */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              Atividade recente
            </h2>
            <Link
              href="/painel/consultas"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          {recentList.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Ainda sem atividade. As suas consultas aparecerão aqui.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentList.map((r) => {
                const dr = one(r.doctor);
                const past = r.scheduled_at < nowIso;
                return (
                  <li
                    key={r.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                      {past ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <CalendarClock className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {dr?.full_name
                          ? `Dr(a). ${dr.full_name}`
                          : "Consulta"}
                        {dr?.specialty ? (
                          <span className="font-normal text-muted-foreground">
                            {" · "}
                            {dr.specialty}
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {formatDateTimePT(r.scheduled_at)}
                      </div>
                    </div>
                    <span
                      className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-flex ${
                        STATUS_BADGE[r.status] ?? "bg-muted text-foreground"
                      }`}
                    >
                      {APPOINTMENT_STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h2 className="px-1 text-sm font-semibold text-foreground">
            Atalhos
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <QuickShortcut
              href="/painel/marcar"
              iconName="calendar-check"
              label="Marcar"
            />
            <QuickShortcut
              href="/painel/consultas"
              iconName="stethoscope"
              label="Consultas"
            />
            <QuickShortcut
              href="/painel/receitas"
              iconName="file-text"
              label="Receitas"
            />
            <QuickShortcut
              href="/painel/faturas"
              iconName="receipt"
              label="Faturas"
            />
            <QuickShortcut
              href="/painel/exames"
              iconName="flask-conical"
              label="Exames"
            />
            <QuickShortcut href="/perfil" iconName="user" label="Perfil" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-background px-3 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-primary">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

const VITAL_TONE: Record<string, string> = {
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function VitalChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "rose" | "sky" | "amber" | "indigo" | "emerald";
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <span
          className={`grid size-8 place-items-center rounded-lg ${VITAL_TONE[tone]}`}
        >
          {icon}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}
