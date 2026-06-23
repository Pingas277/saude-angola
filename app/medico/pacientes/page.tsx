import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Droplet,
  History,
  Phone,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BLOOD_TYPE_LABELS, formatDatePT } from "@/lib/labels";
import MedicoHeader from "../_components/MedicoHeader";
import { waContactUrl } from "@/lib/whatsapp";

export const metadata = { title: "Pacientes · Lunga" };

type Profile = {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};
type Patient = {
  id: string;
  date_of_birth: string | null;
  blood_type: string | null;
  gender: string | null;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  profile: Profile | Profile[] | null;
};
type ApptRow = {
  id: string;
  scheduled_at: string;
  status: string;
  patient: Patient | Patient[] | null;
};

type PatientCard = {
  id: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  dob: string | null;
  gender: string | null;
  blood: string | null;
  allergies: string[];
  chronic: string[];
  visits: number;
  lastVisit: string;
  nextAppointmentId: string | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}
function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "—";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
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

const GENDER_SHORT: Record<string, string> = {
  female: "F",
  male: "M",
  other: "—",
  prefer_not_to_say: "—",
};

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const nowIso = new Date().toISOString();

  const { data: rows } = await supabase
    .from("appointments")
    .select(
      `id, scheduled_at, status,
       patient:patients(id, date_of_birth, blood_type, gender, allergies, chronic_conditions,
         profile:profiles!patients_profile_id_fkey(full_name, phone, avatar_url))`
    )
    .eq("doctor_id", user.id)
    .order("scheduled_at", { ascending: false });

  const all = (rows as ApptRow[] | null) ?? [];

  // Aggregate one row per unique patient
  const byPatient = new Map<string, PatientCard>();
  for (const a of all) {
    const p = pickOne(a.patient);
    if (!p) continue;
    const prof = pickOne(p.profile);
    const existing = byPatient.get(p.id);
    if (existing) {
      existing.visits += 1;
      if (
        a.scheduled_at >= nowIso &&
        !["cancelled", "no_show", "completed"].includes(a.status)
      ) {
        // Keep the earliest upcoming appointment id
        if (
          !existing.nextAppointmentId ||
          a.scheduled_at < (all.find((x) => x.id === existing.nextAppointmentId)?.scheduled_at ?? "")
        ) {
          existing.nextAppointmentId = a.id;
        }
      }
    } else {
      byPatient.set(p.id, {
        id: p.id,
        name: prof?.full_name ?? "Paciente",
        phone: prof?.phone ?? null,
        avatarUrl: prof?.avatar_url ?? null,
        dob: p.date_of_birth,
        gender: p.gender,
        blood: p.blood_type,
        allergies: p.allergies ?? [],
        chronic: p.chronic_conditions ?? [],
        visits: 1,
        lastVisit: a.scheduled_at,
        nextAppointmentId:
          a.scheduled_at >= nowIso &&
          !["cancelled", "no_show", "completed"].includes(a.status)
            ? a.id
            : null,
      });
    }
  }

  let patients = Array.from(byPatient.values()).sort((a, b) =>
    b.lastVisit.localeCompare(a.lastVisit)
  );

  // Client-side filter
  const qLower = query.toLowerCase();
  if (qLower) {
    patients = patients.filter((p) =>
      p.name.toLowerCase().includes(qLower) ||
      (p.phone ?? "").includes(qLower)
    );
  }

  const withUpcoming = patients.filter((p) => p.nextAppointmentId).length;
  const withAllergies = patients.filter((p) => p.allergies.length > 0).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <MedicoHeader
        eyebrow="Acompanhamento"
        title="Os meus pacientes"
        subtitle="Pacientes com quem teve, ou tem, consultas marcadas."
        icon={<Users className="size-5" />}
      />

      {/* ─── Search ─── */}
      <section className="mt-7 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <form
          method="GET"
          action="/medico/pacientes"
          className="flex items-center gap-2"
        >
          <div className="flex flex-1 items-center gap-2.5 rounded-full border border-border bg-muted/40 px-4 py-2 transition-colors focus-within:border-primary focus-within:bg-card">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Procurar paciente por nome ou telefone…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:shadow-md"
          >
            Procurar
          </button>
          {query && (
            <Link
              href="/medico/pacientes"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Link>
          )}
        </form>
      </section>

      {/* ─── Stats ─── */}
      <section className="mt-5 grid gap-3 sm:grid-cols-4">
        <StatTile
          icon={Users}
          label="Pacientes"
          value={String(patients.length)}
          color="from-sky-500 to-blue-600"
        />
        <StatTile
          icon={Stethoscope}
          label="Consultas"
          value={String(all.length)}
          color="from-emerald-500 to-teal-600"
        />
        <StatTile
          icon={CalendarClock}
          label="Com agenda"
          value={String(withUpcoming)}
          color="from-amber-500 to-orange-600"
        />
        <StatTile
          icon={AlertTriangle}
          label="Com alergias"
          value={String(withAllergies)}
          color="from-rose-500 to-pink-600"
        />
      </section>

      {/* ─── List ─── */}
      {patients.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20">
            <Users className="size-6" />
          </span>
          <h2 className="mt-5 text-base font-semibold text-foreground">
            {query ? "Nenhum paciente encontrado" : "Ainda sem pacientes"}
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            {query
              ? `Não há pacientes que correspondam a "${query}".`
              : "Quando tiver consultas marcadas, os pacientes aparecem aqui."}
          </p>
          {query && (
            <Link
              href="/medico/pacientes"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              Ver todos os pacientes
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {patients.map((p) => (
            <li key={p.id}>
              <PatientCardComponent p={p} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function StatTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span
        className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function PatientCardComponent({ p }: { p: PatientCard }) {
  const age = ageFromDob(p.dob);
  const genderShort = p.gender ? GENDER_SHORT[p.gender] : null;
  const bloodLabel = p.blood && p.blood !== "unknown" ? BLOOD_TYPE_LABELS[p.blood] : null;

  return (
    <article className="group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      {/* Avatar */}
      <div className="shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-sm">
        <div className="grid size-14 place-items-center overflow-hidden rounded-[10px] bg-card text-sm font-bold text-foreground">
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.avatarUrl}
              alt={p.name}
              className="size-full object-cover"
            />
          ) : (
            initials(p.name)
          )}
        </div>
      </div>

      {/* Identity + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-semibold tracking-tight text-foreground">
            {p.name}
          </span>
          {(age !== null || genderShort) && (
            <span className="text-xs text-muted-foreground">
              {[age !== null ? `${age} anos` : null, genderShort]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
          {bloodLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 ring-1 ring-rose-200">
              <Droplet className="size-2.5" />
              {bloodLabel}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Stethoscope className="size-3" />
            {p.visits} {p.visits === 1 ? "consulta" : "consultas"}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <History className="size-3" />
            última {formatDatePT(p.lastVisit)}
          </span>
          {p.phone && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" />
                {p.phone}
              </span>
            </>
          )}
        </div>

        {/* Medical chips */}
        {(p.allergies.length > 0 || p.chronic.length > 0) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {p.allergies.slice(0, 3).map((a) => (
              <span
                key={`a-${a}`}
                className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 ring-1 ring-rose-200"
              >
                <AlertTriangle className="size-2.5" />
                {a}
              </span>
            ))}
            {p.allergies.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700/70 ring-1 ring-rose-200">
                +{p.allergies.length - 3}
              </span>
            )}
            {p.chronic.slice(0, 2).map((c) => (
              <span
                key={`c-${c}`}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200"
              >
                <Activity className="size-2.5" />
                {c}
              </span>
            ))}
            {p.chronic.length > 2 && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700/70 ring-1 ring-amber-200">
                +{p.chronic.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      {p.nextAppointmentId ? (
        <Link
          href={`/medico/consulta/${p.nextAppointmentId}`}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
        >
          Próxima consulta
          <ArrowRight className="size-3.5" />
        </Link>
      ) : (
        waContactUrl(p.phone, `Olá ${p.name.split(" ")[0]}, sou o seu médico na Lunga.`) && (
          <a
            href={waContactUrl(p.phone, `Olá ${p.name.split(" ")[0]}, sou o seu médico na Lunga.`)!}
            target="_blank"
            rel="noopener"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-sm transition-all hover:border-emerald-500/40 hover:bg-emerald-50"
          >
            <Phone className="size-3.5 text-emerald-600" />
            Contactar
          </a>
        )
      )}
    </article>
  );
}
