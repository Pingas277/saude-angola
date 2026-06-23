import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  Hash,
  Receipt,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  PAYMENT_METHOD_LABELS,
  formatAOA,
  formatDateTimePT,
} from "@/lib/labels";
import AdminHeader from "../_components/AdminHeader";

export const metadata = { title: "Faturas da Clínica · Lunga" };

type Profile = { full_name: string | null; avatar_url: string | null };
type Patient = { profile: Profile | Profile[] | null };
type Doctor = { full_name: string | null; specialty: string | null };
type Appt = { doctor: Doctor | Doctor[] | null };

type InvRow = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  due_date: string | null;
  created_at: string;
  patient: Patient | Patient[] | null;
  appointment: Appt | Appt[] | null;
};

const STATUS_TONE: Record<
  string,
  { cls: string; dot: string; label: string }
> = {
  pending: {
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    label: "Por pagar",
  },
  overdue: {
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    label: "Em atraso",
  },
  paid: {
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Paga",
  },
  cancelled: {
    cls: "bg-slate-50 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
    label: "Cancelada",
  },
  refunded: {
    cls: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    label: "Reembolsada",
  },
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}
function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
function shortId(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export default async function ClinicaFaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro } = await searchParams;
  const status = filtro ?? "todas";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: admin } = await supabase
    .from("profiles")
    .select("clinic_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (admin?.role !== "admin" || !admin.clinic_id) redirect("/clinica");

  let query = supabase
    .from("invoices")
    .select(
      `id, amount, currency, status, payment_method, payment_reference,
       paid_at, due_date, created_at,
       patient:patients(profile:profiles!patients_profile_id_fkey(full_name, avatar_url)),
       appointment:appointments(doctor:profiles!appointments_doctor_id_fkey(full_name, specialty))`
    )
    .eq("clinic_id", admin.clinic_id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status === "pendentes")
    query = query.in("status", ["pending", "overdue"]);
  else if (status === "pagas") query = query.eq("status", "paid");
  else if (status === "atraso") query = query.eq("status", "overdue");

  const { data: rows } = await query;
  const list = (rows as InvRow[] | null) ?? [];

  const total = list.length;
  const totalPaid = list
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const totalPending = list
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const totalAll = list.reduce((s, i) => s + Number(i.amount ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <AdminHeader
        eyebrow="Financeiro"
        title="Faturas da clínica"
        subtitle="Todas as faturas emitidas pelos médicos da clínica."
        icon={<Receipt className="size-5" />}
      />

      {/* ─── KPIs ─── */}
      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          icon={Hash}
          label="Faturas"
          value={String(total)}
          color="from-sky-500 to-blue-600"
        />
        <Tile
          icon={Wallet}
          label="Recebido"
          value={formatAOA(totalPaid)}
          color="from-emerald-500 to-teal-600"
          hint="pagas"
        />
        <Tile
          icon={Clock3}
          label="Por receber"
          value={formatAOA(totalPending)}
          color="from-amber-500 to-orange-600"
          hint="pendentes"
        />
        <Tile
          icon={Receipt}
          label="Total emitido"
          value={formatAOA(totalAll)}
          color="from-indigo-500 to-purple-600"
        />
      </section>

      {/* ─── Filter pills ─── */}
      <nav className="mt-6 flex flex-wrap gap-2">
        <FilterPill current={status} value="todas" label="Todas" />
        <FilterPill current={status} value="pendentes" label="Por pagar" />
        <FilterPill current={status} value="atraso" label="Em atraso" />
        <FilterPill current={status} value="pagas" label="Pagas" />
      </nav>

      {/* ─── List ─── */}
      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
          Sem faturas neste filtro.
        </div>
      ) : (
        <ul className="mt-6 space-y-2.5">
          {list.map((inv) => (
            <li key={inv.id}>
              <InvoiceCard inv={inv} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
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
        <div className="truncate text-lg font-bold tracking-tight tabular-nums text-foreground sm:text-xl">
          {value}
        </div>
        {hint && (
          <div className="text-[10px] text-muted-foreground">{hint}</div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  current,
  value,
  label,
}: {
  current: string;
  value: string;
  label: string;
}) {
  const active = current === value;
  const href =
    value === "todas"
      ? "/clinica/faturas"
      : `/clinica/faturas?filtro=${value}`;
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all " +
        (active
          ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/30"
          : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-foreground")
      }
    >
      {label}
    </Link>
  );
}

function InvoiceCard({ inv }: { inv: InvRow }) {
  const patient = pickOne(inv.patient);
  const patientProfile = pickOne(patient?.profile ?? null);
  const appt = pickOne(inv.appointment);
  const doctor = pickOne(appt?.doctor ?? null);
  const tone = STATUS_TONE[inv.status] ?? STATUS_TONE.pending;
  const friendlyId = `LG-INV-${shortId(inv.id)}`;

  return (
    <article className="group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      {/* Patient avatar */}
      <div className="shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-sm">
        <div className="grid size-12 place-items-center overflow-hidden rounded-[10px] bg-card text-xs font-bold text-foreground">
          {patientProfile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={patientProfile.avatar_url}
              alt={patientProfile.full_name ?? ""}
              className="size-full object-cover"
            />
          ) : (
            initials(patientProfile?.full_name ?? null)
          )}
        </div>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold tracking-tight text-foreground">
            {patientProfile?.full_name ?? "Paciente"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {friendlyId}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {doctor?.full_name && (
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="size-3 text-primary" />
              Dr(a). {doctor.full_name}
              {doctor.specialty ? ` · ${doctor.specialty}` : ""}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3" />
            {formatDateTimePT(inv.created_at)}
          </span>
          {inv.paid_at && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="size-3" />
              Paga {formatDateTimePT(inv.paid_at)}
            </span>
          )}
          {inv.payment_method && (
            <span>
              · {PAYMENT_METHOD_LABELS[inv.payment_method] ?? inv.payment_method}
            </span>
          )}
        </div>
      </div>

      {/* Amount + status */}
      <div className="flex flex-col items-end gap-1">
        <span className="font-mono text-base font-bold tracking-tight tabular-nums text-foreground">
          {formatAOA(Number(inv.amount))}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${tone.cls}`}
        >
          <span className={`size-1.5 rounded-full ${tone.dot}`} />
          {tone.label}
        </span>
      </div>

      {/* PDF */}
      <a
        href={`/api/fatura/${inv.id}/pdf`}
        target="_blank"
        rel="noopener"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-accent"
        title={inv.status === "paid" ? "Descarregar comprovativo" : "Descarregar fatura"}
      >
        <Download className="size-3.5" />
        {inv.status === "paid" ? "Comprovativo" : "Fatura"}
      </a>
    </article>
  );
}
