import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Pill,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateTimePT } from "@/lib/labels";
import { familyLookup, loadPatientFamily } from "@/app/_app/family";

export const metadata = { title: "Receitas · Lunga" };

type Medication = {
  name?: string;
  dosage?: string;
};

type Doctor = {
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
};

type RxRow = {
  id: string;
  patient_id: string;
  medications: Medication[] | unknown;
  qr_code: string;
  issued_at: string;
  expires_at: string | null;
  doctor: Doctor | Doctor[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function asMeds(v: unknown): Medication[] {
  return Array.isArray(v) ? (v as Medication[]) : [];
}

function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (
    (p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

function shortId(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export default async function ReceitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const family = await loadPatientFamily(supabase, user.id);
  if (!family.ownPatientId) redirect("/perfil?onboarding=1");
  const personByPatient = familyLookup(family.persons);

  const { data: rows } = await supabase
    .from("prescriptions")
    .select(
      "id, patient_id, medications, qr_code, issued_at, expires_at, doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty, avatar_url)"
    )
    .in("patient_id", family.patientIds)
    .order("issued_at", { ascending: false });

  const list = (rows as RxRow[] | null) ?? [];
  const now = Date.now();
  const activeCount = list.filter(
    (r) => !r.expires_at || new Date(r.expires_at).getTime() >= now
  ).length;
  const expiredCount = list.length - activeCount;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* ─── Header ─── */}
      <header>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          A minha saúde
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          As minhas receitas
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Cada receita tem um QR para apresentar na farmácia. Sem papel.
        </p>
      </header>

      {/* ─── Quick stats ─── */}
      {list.length > 0 && (
        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <StatChip
            label="Total"
            value={String(list.length)}
            color="from-sky-500 to-blue-600"
          />
          <StatChip
            label="Válidas"
            value={String(activeCount)}
            color="from-emerald-500 to-teal-600"
          />
          <StatChip
            label="Expiradas"
            value={String(expiredCount)}
            color="from-slate-500 to-slate-700"
          />
        </section>
      )}

      {/* ─── Empty ─── */}
      {list.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20">
            <Pill className="size-6" />
          </span>
          <h2 className="mt-5 text-base font-semibold text-foreground">
            Ainda não tem receitas
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Quando o médico emitir uma receita, ela aparece aqui — com o QR
            para mostrar na farmácia.
          </p>
          <Link
            href="/painel/marcar"
            className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg"
          >
            Marcar uma consulta
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="mt-7 space-y-3">
          {list.map((rx) => {
            const meds = asMeds(rx.medications);
            const dr = pickOne(rx.doctor);
            const expired = rx.expires_at
              ? new Date(rx.expires_at).getTime() < now
              : false;

            return (
              <li key={rx.id}>
                <Link
                  href={`/painel/receitas/${rx.id}`}
                  className="group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  {/* Avatar */}
                  <div className="shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-sm">
                    <div className="grid size-12 place-items-center overflow-hidden rounded-[10px] bg-card text-sm font-bold text-foreground">
                      {dr?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={dr.avatar_url}
                          alt={dr.full_name ?? ""}
                          className="size-full object-cover"
                        />
                      ) : (
                        initials(dr?.full_name ?? null)
                      )}
                    </div>
                  </div>

                  {/* Identity + meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-foreground">
                        Dr(a). {dr?.full_name ?? "—"}
                      </span>
                      {dr?.specialty && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Stethoscope className="size-3 text-primary" />
                          {dr.specialty}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3" />
                        {formatDateTimePT(rx.issued_at)}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Pill className="size-3" />
                        {meds.length}{" "}
                        {meds.length === 1 ? "medicamento" : "medicamentos"}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider">
                        LG-RX-{shortId(rx.id)}
                      </span>
                    </div>
                    {meds.length > 0 && (
                      <div className="mt-2 truncate text-xs text-muted-foreground">
                        {meds
                          .slice(0, 3)
                          .map((m) => m.name ?? "—")
                          .join(" · ")}
                        {meds.length > 3 ? "…" : ""}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <span
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 " +
                      (expired
                        ? "bg-rose-50 text-rose-700 ring-rose-200"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-200")
                    }
                  >
                    {expired ? (
                      <>
                        <XCircle className="size-3" /> Expirada
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3" /> Válida
                      </>
                    )}
                  </span>

                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span
        className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <Pill className="size-4" />
      </span>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-bold tracking-tight text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
