import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Stethoscope,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { coerceWorkingHours, formatWeekSchedule } from "@/lib/slots";
import PageHeading from "@/app/_ui/PageHeading";
import EmptyState from "@/app/_ui/EmptyState";
import BookingSheet from "./BookingSheet";
import { loadPatientFamily } from "@/app/_app/family";

export const metadata = { title: "Marcar consulta · Lunga" };

type DoctorRow = {
  id: string;
  full_name: string | null;
  specialty: string | null;
  medical_license: string | null;
  avatar_url: string | null;
  clinic:
    | {
        name: string | null;
        province: string | null;
        address: string | null;
        working_hours: unknown;
      }
    | {
        name: string | null;
        province: string | null;
        address: string | null;
        working_hours: unknown;
      }[]
    | null;
};

function pickClinic(c: DoctorRow["clinic"]) {
  if (!c) return null;
  return Array.isArray(c) ? c[0] : c;
}

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

export default async function MarcarPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    especialidade?: string;
    provincia?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const specialty = (params.especialidade ?? "").trim();
  const province = (params.provincia ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const family = await loadPatientFamily(supabase, user.id);
  if (!family.ownPatientId) redirect("/perfil?onboarding=1");

  const { data: rawDoctors } = await supabase
    .from("profiles")
    .select(
      "id, full_name, specialty, medical_license, avatar_url, clinic:clinics(name, province, address, working_hours)"
    )
    .eq("role", "doctor")
    .order("full_name", { ascending: true });

  const allDoctors = (rawDoctors as DoctorRow[] | null) ?? [];

  const allSpecialties = Array.from(
    new Set(allDoctors.map((d) => d.specialty).filter((s): s is string => !!s))
  ).sort();
  const allProvinces = Array.from(
    new Set(
      allDoctors
        .map((d) => pickClinic(d.clinic)?.province)
        .filter((p): p is string => !!p)
    )
  ).sort();

  const qLower = q.toLowerCase();
  const filtered = allDoctors.filter((d) => {
    if (specialty && d.specialty !== specialty) return false;
    if (province) {
      const c = pickClinic(d.clinic);
      if (c?.province !== province) return false;
    }
    if (q) {
      const name = (d.full_name ?? "").toLowerCase();
      const spec = (d.specialty ?? "").toLowerCase();
      const c = pickClinic(d.clinic);
      const clinicName = (c?.name ?? "").toLowerCase();
      if (
        !name.includes(qLower) &&
        !spec.includes(qLower) &&
        !clinicName.includes(qLower)
      )
        return false;
    }
    return true;
  });

  const baseHref = "/painel/marcar";
  const filterUrl = (key: string, value: string | null) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (specialty && key !== "especialidade") u.set("especialidade", specialty);
    if (province && key !== "provincia") u.set("provincia", province);
    if (value) u.set(key, value);
    const s = u.toString();
    return s ? `${baseHref}?${s}` : baseHref;
  };

  const today = todayISODate();
  const hasFilters = Boolean(q || specialty || province);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeading
        eyebrow="Marcar consulta"
        title="Encontre o seu médico"
        subtitle="Procure por especialidade, clínica ou nome. Marque em 30 segundos, sem telefonemas."
      />

      {/* ─── Search + facets ─── */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <form
          method="GET"
          action={baseHref}
          className="flex flex-wrap items-center gap-3"
        >
          {specialty && (
            <input type="hidden" name="especialidade" value={specialty} />
          )}
          {province && (
            <input type="hidden" name="provincia" value={province} />
          )}

          <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-muted/40 px-4 py-2.5 transition-colors focus-within:border-ring focus-within:bg-card">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Especialidade, clínica ou nome do médico…"
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
              Limpar filtros
            </Link>
          )}
        </form>

        {(allSpecialties.length > 0 || allProvinces.length > 0) && (
          <div className="mt-4 space-y-3">
            {allSpecialties.length > 0 && (
              <FacetRow label="Especialidade">
                {allSpecialties.map((s) => (
                  <FacetPill
                    key={s}
                    href={filterUrl("especialidade", s === specialty ? null : s)}
                    active={s === specialty}
                  >
                    {s}
                  </FacetPill>
                ))}
              </FacetRow>
            )}
            {allProvinces.length > 0 && (
              <FacetRow label="Província">
                {allProvinces.map((p) => (
                  <FacetPill
                    key={p}
                    href={filterUrl("provincia", p === province ? null : p)}
                    active={p === province}
                  >
                    {p}
                  </FacetPill>
                ))}
              </FacetRow>
            )}
          </div>
        )}
      </section>

      {/* ─── Result count + active filter chips ─── */}
      <div className="mt-7 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "médico" : "médicos"}
          {q ? (
            <>
              {" para "}
              <strong className="text-foreground">&ldquo;{q}&rdquo;</strong>
            </>
          ) : null}
          {specialty ? ` · ${specialty}` : ""}
          {province ? ` · ${province}` : ""}
        </p>
      </div>

      {/* ─── Doctor list ─── */}
      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="🩺"
            title="Nenhum médico encontrado"
            desc={
              hasFilters
                ? "Tente ajustar os filtros ou limpar a pesquisa."
                : "Ainda não há médicos no sistema. Volte mais tarde."
            }
            action={
              hasFilters
                ? { href: baseHref, label: "Limpar filtros" }
                : undefined
            }
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {filtered.map((d) => {
            const c = pickClinic(d.clinic);
            return (
              <li
                key={d.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* Gradient-ringed avatar */}
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
                      {c?.name && (
                        <>
                          <span aria-hidden className="text-border">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="size-3.5" />
                            {c.name}
                          </span>
                        </>
                      )}
                      {c?.province && (
                        <>
                          <span aria-hidden className="text-border">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {c.province}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Working hours */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5 shrink-0 text-primary" />
                      {formatWeekSchedule(coerceWorkingHours(c?.working_hours))}
                    </div>

                    {/* Type chips */}
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
                    clinicName={c?.name ?? null}
                    clinicHours={c?.working_hours ?? null}
                    defaultDate={today}
                    bookingPersons={family.persons}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function FacetRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

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
