import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { coerceWorkingHours, formatWeekSchedule } from "@/lib/slots";
import PageHeading from "@/app/_ui/PageHeading";
import EmptyState from "@/app/_ui/EmptyState";
import BookingSheet from "./BookingSheet";
import { loadPatientFamily } from "@/app/_app/family";

export const metadata = { title: "Marcar consulta · Lunga" };

/* ─────────────────────────── types ─────────────────────────── */

type ClinicCard = {
  id: string;
  name: string;
  province: string | null;
  address: string | null;
  working_hours: unknown;
  doctors_count: number;
  specialties: string[];
};

type DoctorRow = {
  id: string;
  full_name: string | null;
  specialty: string | null;
  medical_license: string | null;
  avatar_url: string | null;
};

type ClinicRow = {
  id: string;
  name: string;
  province: string | null;
  address: string | null;
  working_hours: unknown;
};

/* ─────────────────────────── helpers ─────────────────────────── */

function todayISODate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function initials(name: string | null): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

/* ─────────────────────────── page ─────────────────────────── */

export default async function MarcarPage({
  searchParams,
}: {
  searchParams: Promise<{
    clinica?: string;
    q?: string;
    especialidade?: string;
  }>;
}) {
  const params = await searchParams;
  const clinicaId = (params.clinica ?? "").trim();
  const q = (params.q ?? "").trim();
  const specialty = (params.especialidade ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const family = await loadPatientFamily(supabase, user.id);
  if (!family.ownPatientId) redirect("/perfil?onboarding=1");

  // ── View A: a specific clinic was picked → show doctors inside it ──
  if (clinicaId) {
    return (
      <DoctorsInsideClinicView
        clinicId={clinicaId}
        specialty={specialty}
        family={family}
      />
    );
  }

  // ── View B (default): pick a clinic first ──
  return <ClinicListView q={q} />;
}

/* ─────────────────────── VIEW B — clinic list ─────────────────────── */

async function ClinicListView({ q }: { q: string }) {
  const supabase = await createClient();
  const { data: rawClinics } = await supabase.rpc("search_clinics", { q });
  const clinics = (rawClinics as ClinicCard[] | null) ?? [];

  const baseHref = "/painel/marcar";
  const hasFilters = Boolean(q);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeading
        eyebrow="Marcar consulta"
        title="Comece pela clínica"
        subtitle="Escolha a clínica e a seguir o médico. Marque em 30 segundos, sem telefonemas."
      />

      {/* Search */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <form
          method="GET"
          action={baseHref}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-muted/40 px-4 py-2.5 transition-colors focus-within:border-ring focus-within:bg-card">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Nome da clínica, província, endereço ou especialidade…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
          >
            Pesquisar
          </button>
          {hasFilters && (
            <Link
              href={baseHref}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Limpar
            </Link>
          )}
        </form>
      </section>

      {/* Result count */}
      <div className="mt-7">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{clinics.length}</strong>{" "}
          {clinics.length === 1 ? "clínica" : "clínicas"}
          {q ? (
            <>
              {" para "}
              <strong className="text-foreground">&ldquo;{q}&rdquo;</strong>
            </>
          ) : null}
        </p>
      </div>

      {/* Clinic list */}
      {clinics.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="🏥"
            title="Nenhuma clínica encontrada"
            desc={
              q
                ? "Tente outra pesquisa — nome, província ou especialidade."
                : "Ainda não há clínicas no sistema."
            }
            action={q ? { href: baseHref, label: "Limpar" } : undefined}
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {clinics.map((c) => (
            <li key={c.id}>
              <Link
                href={`/painel/marcar?clinica=${c.id}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20">
                    <Building2 className="size-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold tracking-tight text-foreground">
                      {c.name}
                    </h3>
                    {c.province && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {c.province}
                        {c.address && (
                          <span className="truncate">· {c.address}</span>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5 text-primary" />
                        {c.doctors_count}{" "}
                        {c.doctors_count === 1 ? "médico" : "médicos"}
                      </span>
                      <span aria-hidden className="text-border">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-primary" />
                        {formatWeekSchedule(
                          coerceWorkingHours(c.working_hours)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specialties offered — chip row */}
                {c.specialties.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {c.specialties.slice(0, 6).map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                      >
                        <Stethoscope className="size-2.5" />
                        {s}
                      </span>
                    ))}
                    {c.specialties.length > 6 && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        +{c.specialties.length - 6}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/* ─────────────────── VIEW A — doctors inside a clinic ─────────────────── */

type FamilyArg = Awaited<ReturnType<typeof loadPatientFamily>>;

async function DoctorsInsideClinicView({
  clinicId,
  specialty,
  family,
}: {
  clinicId: string;
  specialty: string;
  family: FamilyArg;
}) {
  const supabase = await createClient();

  // 1. Hydrate the clinic itself for the header.
  const { data: clinicRaw } = await supabase
    .from("clinics")
    .select("id, name, province, address, working_hours")
    .eq("id", clinicId)
    .maybeSingle();

  if (!clinicRaw) {
    // Bad clinic id — bounce back to the list.
    redirect("/painel/marcar");
  }
  const clinic = clinicRaw as ClinicRow;

  // 2. All doctors in this clinic.
  const { data: doctorsRaw } = await supabase
    .from("profiles")
    .select("id, full_name, specialty, medical_license, avatar_url")
    .eq("role", "doctor")
    .eq("clinic_id", clinicId)
    .order("full_name", { ascending: true });

  const doctors = (doctorsRaw as DoctorRow[] | null) ?? [];

  const allSpecialties = Array.from(
    new Set(doctors.map((d) => d.specialty).filter((s): s is string => !!s))
  ).sort();

  const filtered = specialty
    ? doctors.filter((d) => d.specialty === specialty)
    : doctors;

  const today = todayISODate();
  const baseHref = `/painel/marcar?clinica=${clinicId}`;
  const facetUrl = (sValue: string | null) => {
    if (!sValue) return baseHref;
    return `${baseHref}&especialidade=${encodeURIComponent(sValue)}`;
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Back to clinic list */}
      <Link
        href="/painel/marcar"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Outras clínicas
      </Link>

      {/* Clinic header */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20">
            <Building2 className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Clínica escolhida
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {clinic.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {clinic.province && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {clinic.province}
                </span>
              )}
              {clinic.address && (
                <span className="truncate">{clinic.address}</span>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5 text-primary" />
              {formatWeekSchedule(coerceWorkingHours(clinic.working_hours))}
            </div>
          </div>
        </div>
      </section>

      {/* Specialty facet */}
      {allSpecialties.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Especialidade
            </span>
            <div className="flex flex-wrap gap-1.5">
              <FacetPill href={baseHref} active={!specialty}>
                Todos
              </FacetPill>
              {allSpecialties.map((s) => (
                <FacetPill
                  key={s}
                  href={facetUrl(s === specialty ? null : s)}
                  active={s === specialty}
                >
                  {s}
                </FacetPill>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result count */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "médico" : "médicos"} nesta clínica
          {specialty ? ` · ${specialty}` : ""}
        </p>
      </div>

      {/* Doctor list */}
      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="🩺"
            title="Nenhum médico nesta especialidade"
            desc={
              specialty
                ? "Esta clínica ainda não tem médicos desta especialidade."
                : "Ainda não há médicos nesta clínica."
            }
            action={
              specialty ? { href: baseHref, label: "Ver todos" } : undefined
            }
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {filtered.map((d) => (
            <li
              key={d.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative shrink-0">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-md shadow-sky-500/20">
                    <div className="grid size-16 place-items-center overflow-hidden rounded-[14px] bg-card text-base font-bold text-foreground">
                      {d.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.avatar_url}
                          alt={d.full_name ?? "Médico"}
                          className="size-full object-cover"
                        />
                      ) : (
                        initials(d.full_name)
                      )}
                    </div>
                  </div>
                  {d.medical_license && (
                    <span
                      title="Médico verificado"
                      className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-card"
                    >
                      <CheckCircle2 className="size-3" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-base font-bold tracking-tight text-foreground">
                      Dr(a). {d.full_name ?? "—"}
                    </span>
                    {d.medical_license && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                        <CheckCircle2 className="size-2.5" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {d.specialty ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Stethoscope className="size-3.5 text-primary" />
                        {d.specialty}
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground">
                        Especialidade não indicada
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <ConsultTypePill icon={Building2}>
                      Presencial
                    </ConsultTypePill>
                    <ConsultTypePill icon={Video}>Vídeo</ConsultTypePill>
                  </div>
                </div>

                <BookingSheet
                  doctorId={d.id}
                  doctorName={d.full_name ?? "Médico"}
                  doctorSpecialty={d.specialty}
                  doctorAvatarUrl={d.avatar_url}
                  clinicName={clinic.name}
                  clinicHours={clinic.working_hours}
                  defaultDate={today}
                  bookingPersons={family.persons}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function FacetPill({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition " +
        (active
          ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-sm"
          : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5")
      }
    >
      {children}
    </Link>
  );
}

function ConsultTypePill({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="size-3" />
      {children}
    </span>
  );
}
