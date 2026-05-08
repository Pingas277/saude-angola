import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  formatDateTimePT,
} from "@/lib/labels";

export const metadata = { title: "Painel · Saúde Angola" };

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ bemvindo?: string; perfil?: string }>;
}) {
  const { bemvindo, perfil: perfilOk } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "doctor") redirect("/medico");
  if (profile?.role === "admin") redirect("/clinica");
  if (profile?.role === "receptionist") redirect("/recepcao");

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!patient && profile?.role === "patient") {
    redirect("/perfil?onboarding=1");
  }

  const nowIso = new Date().toISOString();

  const [{ data: nextAppt }, { count: pastApptCount }, { data: lastRx }, { data: lastLab }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id, scheduled_at, status, appointment_type, reason")
        .eq("patient_id", patient?.id ?? "00000000-0000-0000-0000-000000000000")
        .gte("scheduled_at", nowIso)
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", patient?.id ?? "00000000-0000-0000-0000-000000000000")
        .lt("scheduled_at", nowIso),
      supabase
        .from("prescriptions")
        .select("id, issued_at, notes")
        .eq("patient_id", patient?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("issued_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("lab_results")
        .select("id, test_name, lab_name, result_date")
        .eq("patient_id", patient?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("result_date", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
    ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {bemvindo === "1" && (
        <Banner kind="success">
          Conta criada com sucesso. Bem-vindo à Saúde Angola!
        </Banner>
      )}
      {perfilOk === "ok" && (
        <Banner kind="success">Perfil atualizado com sucesso.</Banner>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Olá, {profile?.full_name?.split(" ")[0] ?? user.email}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Aqui está um resumo da sua saúde.
          </p>
        </div>
        <Link
          href="/painel/marcar"
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          + Marcar consulta
        </Link>
      </div>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Próxima consulta"
          value={nextAppt ? formatDateTimePT(nextAppt.scheduled_at) : "—"}
          hint={
            nextAppt
              ? `${APPOINTMENT_TYPE_LABELS[nextAppt.appointment_type]} · ${APPOINTMENT_STATUS_LABELS[nextAppt.status]}`
              : "Nenhuma consulta marcada"
          }
        />
        <StatCard
          label="Consultas anteriores"
          value={(pastApptCount ?? 0).toString()}
          hint="Histórico de consultas"
        />
        <StatCard
          label="Última receita"
          value={lastRx ? formatDateTimePT(lastRx.issued_at) : "—"}
          hint={lastRx ? "Disponível em receitas" : "Sem receitas"}
        />
        <StatCard
          label="Último exame"
          value={lastLab?.test_name ?? "—"}
          hint={lastLab?.lab_name ?? "Sem exames carregados"}
        />
      </section>

      <section className="mt-8 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Telemedicina
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Falar agora com um médico por vídeo
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Triagem rápida e atendimento por vídeo sem sair de casa.
            </p>
          </div>
          <Link
            href="/painel/telemedicina"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Iniciar consulta →
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActionCard
          href="/painel/marcar"
          title="Marcar uma consulta"
          desc="Presencial numa clínica ou por telemedicina."
        />
        <ActionCard
          href="/painel/consultas"
          title="Ver as minhas consultas"
          desc="Próximas e anteriores."
        />
        <ActionCard
          href="/painel/receitas"
          title="Ver receitas médicas"
          desc="Acesso rápido com código QR."
        />
        <ActionCard
          href="/perfil"
          title="Atualizar perfil clínico"
          desc="Alergias, doenças crónicas e contacto de emergência."
        />
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function ActionCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:bg-emerald-50/40"
    >
      <div>
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 text-sm text-slate-600">{desc}</div>
      </div>
      <span
        aria-hidden
        className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
      >
        →
      </span>
    </Link>
  );
}

function Banner({
  kind,
  children,
}: {
  kind: "success" | "info";
  children: React.ReactNode;
}) {
  const cls =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-sky-200 bg-sky-50 text-sky-800";
  return (
    <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${cls}`}>
      {children}
    </div>
  );
}
