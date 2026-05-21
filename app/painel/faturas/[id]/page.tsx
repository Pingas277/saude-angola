import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Hash,
  Receipt,
  Share2,
  Stethoscope,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatAOA,
  formatDateTimePT,
  formatDatePT,
} from "@/lib/labels";

export const metadata = { title: "Fatura · Lunga" };

type Doctor = {
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
};
type Clinic = {
  name: string | null;
  address: string | null;
  phone: string | null;
};

type Row = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  due_date: string | null;
  created_at: string;
  appointment_id: string | null;
  consultation_id: string | null;
  doctor_appt:
    | { doctor: Doctor | Doctor[] | null; scheduled_at: string | null }
    | {
        doctor: Doctor | Doctor[] | null;
        scheduled_at: string | null;
      }[]
    | null;
  doctor_consult:
    | { doctor: Doctor | Doctor[] | null }
    | { doctor: Doctor | Doctor[] | null }[]
    | null;
  clinic: Clinic | Clinic[] | null;
};

const STATUS_TONE: Record<
  string,
  { ring: string; bg: string; dot: string; text: string; tag: string }
> = {
  pending: {
    ring: "ring-amber-200",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    text: "text-amber-700",
    tag: "Por pagar",
  },
  overdue: {
    ring: "ring-rose-200",
    bg: "bg-rose-50",
    dot: "bg-rose-500",
    text: "text-rose-700",
    tag: "Em atraso",
  },
  paid: {
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    tag: "Paga",
  },
  cancelled: {
    ring: "ring-slate-200",
    bg: "bg-slate-50",
    dot: "bg-slate-400",
    text: "text-slate-700",
    tag: "Cancelada",
  },
  refunded: {
    ring: "ring-sky-200",
    bg: "bg-sky-50",
    dot: "bg-sky-500",
    text: "text-sky-700",
    tag: "Reembolsada",
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
  return (
    (p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

function shortId(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export default async function FaturaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pago?: string }>;
}) {
  const { id } = await params;
  const { pago } = await searchParams;

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

  const { data: row } = await supabase
    .from("invoices")
    .select(
      `id, amount, currency, status, payment_method, payment_reference,
       paid_at, due_date, created_at, appointment_id, consultation_id,
       doctor_appt:appointments(scheduled_at, doctor:profiles!appointments_doctor_id_fkey(full_name, specialty, avatar_url)),
       doctor_consult:consultations(doctor:profiles!consultations_doctor_id_fkey(full_name, specialty, avatar_url)),
       clinic:clinics(name, address, phone)`
    )
    .eq("id", id)
    .eq("patient_id", patient.id)
    .maybeSingle();

  if (!row) notFound();
  const inv = row as Row;

  const apptRel = pickOne(inv.doctor_appt);
  const consRel = pickOne(inv.doctor_consult);
  const doctor =
    pickOne(apptRel?.doctor ?? null) ?? pickOne(consRel?.doctor ?? null);
  const clinic = pickOne(inv.clinic);
  const apptDate = apptRel?.scheduled_at ?? null;

  const tone = STATUS_TONE[inv.status] ?? STATUS_TONE.pending;
  const isPayable = inv.status === "pending" || inv.status === "overdue";
  const isPaid = inv.status === "paid";

  const friendlyAmount = formatAOA(Number(inv.amount));
  const friendlyId = `LG-INV-${shortId(inv.id)}`;

  // WhatsApp pre-filled message
  const waText = encodeURIComponent(
    isPaid
      ? `Comprovativo Lunga · ${friendlyId}\n${friendlyAmount} pagos${
          inv.paid_at ? ` em ${formatDatePT(inv.paid_at)}` : ""
        }${doctor?.full_name ? `\nDr(a). ${doctor.full_name}` : ""}${
          clinic?.name ? `\n${clinic.name}` : ""
        }`
      : `Fatura Lunga · ${friendlyId}\n${friendlyAmount} por pagar${
          inv.due_date ? ` (vence a ${formatDatePT(inv.due_date)})` : ""
        }${doctor?.full_name ? `\nDr(a). ${doctor.full_name}` : ""}${
          clinic?.name ? `\n${clinic.name}` : ""
        }`
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* ─── Back link ─── */}
      <Link
        href="/painel/faturas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar às faturas
      </Link>

      {/* ─── Success banner after paying ─── */}
      {pago === "1" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div>
            <div className="font-semibold">Pagamento confirmado.</div>
            <div className="text-emerald-700/90">
              O comprovativo está disponível em PDF.
            </div>
          </div>
        </div>
      )}

      {/* ─── Receipt hero ─── */}
      <section
        className={`relative mt-6 overflow-hidden rounded-3xl border ${tone.ring} bg-gradient-to-br from-white to-white p-7 shadow-sm sm:p-9`}
      >
        {/* Decorative gradient accent in the corner */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -right-16 -top-16 size-48 rounded-full ${tone.bg} blur-3xl opacity-70`}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
              <Receipt className="size-3.5" />
              Fatura · {inv.currency}
            </div>
            <div className="mt-3 font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {friendlyAmount}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Hash className="size-3" />
              {friendlyId}
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${tone.ring} ${tone.bg} ${tone.text}`}
          >
            <span className={`size-1.5 rounded-full ${tone.dot}`} />
            {tone.tag}
          </span>
        </div>

        {/* ─── Pay CTA (if pending) ─── */}
        {isPayable && (
          <div className="relative mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 p-4 text-white shadow-md shadow-sky-500/30">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/85">
                Pagar com Multicaixa Express
              </div>
              <div className="mt-0.5 text-sm text-white/90">
                Receba a notificação no telemóvel para autorizar.
              </div>
            </div>
            <Link
              href={`/painel/faturas/${inv.id}/multicaixa`}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-sky-700 shadow-sm transition-all hover:shadow-md"
            >
              Pagar agora
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}

        {/* ─── Paid confirmation ─── */}
        {isPaid && (
          <div className="relative mt-7 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
              <CheckCircle2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-emerald-800">
                Pagamento recebido
              </div>
              <div className="mt-0.5 text-xs text-emerald-700/90">
                {inv.paid_at ? formatDateTimePT(inv.paid_at) : "Data não registada"}
                {inv.payment_method
                  ? ` · ${PAYMENT_METHOD_LABELS[inv.payment_method] ?? inv.payment_method}`
                  : ""}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Detalhes ─── */}
      <section className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Detalhes
        </h2>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {/* Doctor */}
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 p-0.5 shadow-sm">
              <div className="grid size-11 place-items-center overflow-hidden rounded-[10px] bg-white text-sm font-bold text-sky-700">
                {doctor?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doctor.avatar_url}
                    alt={doctor.full_name ?? ""}
                    className="size-full object-cover"
                  />
                ) : (
                  initials(doctor?.full_name ?? null)
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Médico
              </div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">
                Dr(a). {doctor?.full_name ?? "—"}
              </div>
              {doctor?.specialty && (
                <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Stethoscope className="size-3 text-primary" />
                  {doctor.specialty}
                </div>
              )}
            </div>
          </div>

          {/* Clinic */}
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Building2 className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Clínica
              </div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">
                {clinic?.name ?? "Telemedicina"}
              </div>
              {clinic?.address && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {clinic.address}
                </div>
              )}
            </div>
          </div>

          {/* Issued */}
          <DetailRow
            icon={Calendar}
            label="Emitida em"
            value={formatDateTimePT(inv.created_at)}
          />

          {/* Due / Paid */}
          {isPaid ? (
            <DetailRow
              icon={CheckCircle2}
              label="Paga em"
              value={inv.paid_at ? formatDateTimePT(inv.paid_at) : "—"}
              tone="emerald"
            />
          ) : inv.due_date ? (
            <DetailRow
              icon={Calendar}
              label="Vence em"
              value={formatDatePT(inv.due_date)}
              tone={inv.status === "overdue" ? "rose" : "default"}
            />
          ) : null}

          {/* Appointment date */}
          {apptDate && (
            <DetailRow
              icon={Calendar}
              label="Consulta"
              value={formatDateTimePT(apptDate)}
            />
          )}

          {/* Status label as a row too, for clarity */}
          <DetailRow
            icon={Receipt}
            label="Estado"
            value={INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
          />

          {/* Payment ref (only if paid) */}
          {inv.payment_reference && (
            <DetailRow
              icon={Hash}
              label="Referência"
              value={inv.payment_reference}
              mono
            />
          )}
        </div>
      </section>

      {/* ─── Actions ─── */}
      <section className="mt-5 flex flex-wrap items-center gap-2.5">
        {isPaid && (
          <a
            href={`/api/fatura/${inv.id}/pdf`}
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-accent"
          >
            <Download className="size-4" />
            Comprovativo PDF
          </a>
        )}
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener"
          className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-emerald-500/40 hover:bg-emerald-50"
        >
          <Share2 className="size-4 text-emerald-600" />
          Partilhar via WhatsApp
        </a>
        {clinic?.phone && (
          <a
            href={`tel:${clinic.phone}`}
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-accent"
          >
            <FileText className="size-4" />
            Contactar clínica
          </a>
        )}
      </section>

      {/* ─── Help footer ─── */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Problemas com esta fatura?{" "}
        <a
          href={`mailto:suporte@lunga.ao?subject=Fatura%20${friendlyId}`}
          className="font-semibold text-primary hover:underline"
        >
          Falar com o suporte
        </a>
      </p>
    </main>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  mono?: boolean;
  tone?: "default" | "emerald" | "rose";
}) {
  const iconBg =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "rose"
        ? "bg-rose-100 text-rose-700"
        : "bg-muted text-foreground";

  return (
    <div className="flex items-start gap-3">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconBg}`}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div
          className={`mt-0.5 text-sm font-semibold text-foreground ${
            mono ? "font-mono" : ""
          }`}
        >
          {value ?? "—"}
        </div>
      </div>
    </div>
  );
}
