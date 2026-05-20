import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, MapPin, Stethoscope, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PageHeading from "@/app/_ui/PageHeading";
import EmptyState from "@/app/_ui/EmptyState";
import BookingSheet from "./BookingSheet";

export const metadata = { title: "Marcar consulta · Lunga" };

type DoctorRow = {
  id: string;
  full_name: string | null;
  specialty: string | null;
  medical_license: string | null;
  clinic:
    | { name: string | null; province: string | null; address: string | null }
    | { name: string | null; province: string | null; address: string | null }[]
    | null;
};

function pickClinic(c: DoctorRow["clinic"]) {
  if (!c) return null;
  return Array.isArray(c) ? c[0] : c;
}

function tomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function initials(name: string | null): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
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

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!patient) redirect("/perfil?onboarding=1");

  const { data: rawDoctors } = await supabase
    .from("profiles")
    .select(
      "id, full_name, specialty, medical_license, clinic:clinics(name, province, address)"
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

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeading
        eyebrow="Médicos e clínicas"
        title="Encontre o seu médico"
        subtitle="Procure por especialidade, clínica ou nome. Marque online, sem telefonemas."
      />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <form
          method="GET"
          action={baseHref}
          className="flex flex-wrap items-center gap-3"
        >
          {specialty && (
            <input type="hidden" name="especialidade" value={specialty} />
          )}
          {province && <input type="hidden" name="provincia" value={province} />}

          <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-muted/40 px-4 py-2.5 focus-within:border-ring focus-within:bg-card">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
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
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Pesquisar
          </button>
          {(q || specialty || province) && (
            <Link
              href={baseHref}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
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

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "médico" : "médicos"}
          {q ? ` para "${q}"` : ""}
          {specialty ? ` · ${specialty}` : ""}
          {province ? ` · ${province}` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="🩺"
            title="Nenhum médico encontrado"
            desc={
              q || specialty || province
                ? "Tente ajustar os filtros ou limpar a pesquisa."
                : "Ainda não há médicos no sistema. Volte mais tarde."
            }
            action={
              q || specialty || province
                ? { href: baseHref, label: "Limpar filtros" }
                : undefined
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtered.map((d) => {
            const c = pickClinic(d.clinic);
            return (
              <li
                key={d.id}
                className="group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-base font-bold text-white shadow-sm">
                  {initials(d.full_name)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-foreground">
                      Dr(a). {d.full_name ?? "—"}
                    </span>
                    {d.medical_license && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/20">
                        Verificado
                      </span>
                    )}
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/100/10 px-1.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                      Novo
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {d.specialty ? (
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5 text-primary" />
                        {d.specialty}
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground">
                        Especialidade não indicada
                      </span>
                    )}
                    {c?.name && (
                      <>
                        <span aria-hidden className="text-border">·</span>
                        <span>{c.name}</span>
                      </>
                    )}
                    {c?.province && (
                      <>
                        <span aria-hidden className="text-border">·</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {c.province}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <BookingSheet
                  doctorId={d.id}
                  doctorName={d.full_name ?? "Médico"}
                  doctorSpecialty={d.specialty}
                  clinicName={c?.name ?? null}
                  defaultDate={tomorrowISODate()}
                />
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
          ? "bg-primary text-white shadow-sm"
          : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/10/40")
      }
    >
      {children}
    </Link>
  );
}
