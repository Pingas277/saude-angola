import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  INVOICE_STATUS_BADGE,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatAOA,
  formatDateTimePT,
  formatDatePT,
} from "@/lib/labels";

export const metadata = { title: "Fatura · Saúde Angola" };

type Doctor = { full_name: string | null; specialty: string | null };
type Clinic = { name: string | null; address: string | null };

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
    | { doctor: Doctor | Doctor[] | null }
    | { doctor: Doctor | Doctor[] | null }[]
    | null;
  doctor_consult:
    | { doctor: Doctor | Doctor[] | null }
    | { doctor: Doctor | Doctor[] | null }[]
    | null;
  clinic: Clinic | Clinic[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
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
       doctor_appt:appointments(doctor:profiles!appointments_doctor_id_fkey(full_name, specialty)),
       doctor_consult:consultations(doctor:profiles!consultations_doctor_id_fkey(full_name, specialty)),
       clinic:clinics(name, address)`
    )
    .eq("id", id)
    .eq("patient_id", patient.id)
    .maybeSingle();

  if (!row) notFound();
  const inv = row as Row;

  const apptRel = pickOne(inv.doctor_appt);
  const consRel = pickOne(inv.doctor_consult);
  const doctor = pickOne(apptRel?.doctor ?? null) ?? pickOne(consRel?.doctor ?? null);
  const clinic = pickOne(inv.clinic);
  const isPayable = inv.status === "pending" || inv.status === "overdue";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4">
        <Link
          href="/painel/faturas"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Voltar às faturas
        </Link>
      </div>

      {pago === "1" && (
        <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Pagamento confirmado. O comprovativo está disponível em PDF.
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fatura
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {formatAOA(Number(inv.amount))}
            </h1>
            <div className="mt-1 text-sm text-slate-600">
              Emitida em {formatDateTimePT(inv.created_at)}
              {inv.due_date
                ? ` · Vence a ${formatDatePT(inv.due_date)}`
                : ""}
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              INVOICE_STATUS_BADGE[inv.status] ?? "bg-slate-100 text-slate-700"
            }`}
          >
            {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2">
          <Row
            label="Médico"
            value={
              doctor?.full_name
                ? `Dr(a). ${doctor.full_name}${doctor.specialty ? ` · ${doctor.specialty}` : ""}`
                : "—"
            }
          />
          <Row label="Clínica" value={clinic?.name ?? "Telemedicina"} />
          {inv.paid_at && (
            <Row label="Paga em" value={formatDateTimePT(inv.paid_at)} />
          )}
          {inv.payment_method && (
            <Row
              label="Método"
              value={
                PAYMENT_METHOD_LABELS[inv.payment_method] ?? inv.payment_method
              }
            />
          )}
          {inv.payment_reference && (
            <Row label="Referência" value={inv.payment_reference} />
          )}
        </dl>

        {isPayable && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Pagar com Multicaixa Express
              </div>
              <div className="text-xs text-slate-600">
                Receberá uma notificação no telemóvel para autorizar.
              </div>
            </div>
            <Link
              href={`/painel/faturas/${inv.id}/multicaixa`}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Pagar agora →
            </Link>
          </div>
        )}

        {inv.paid_at && (
          <div className="mt-6 flex justify-end">
            <a
              href={`/api/fatura/${inv.id}/pdf`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Descarregar comprovativo PDF →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{value ?? "—"}</dd>
    </div>
  );
}
