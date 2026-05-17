import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  formatDateTimePT,
} from "@/lib/labels";
import StatCard from "../_ui/StatCard";
import ActionCard from "../_ui/ActionCard";
import SectionHeading from "../_ui/SectionHeading";
import PageHeading from "../_ui/PageHeading";

export const metadata = { title: "Painel · ANGOLASAUDE" };

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
  if (profile?.role === "nurse") redirect("/enfermeiro");

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!patient && profile?.role === "patient") {
    redirect("/perfil?onboarding=1");
  }

  const nowIso = new Date().toISOString();
  const fallbackId = "00000000-0000-0000-0000-000000000000";

  const [{ data: nextAppt }, { count: pastApptCount }, { data: lastRx }, { data: lastLab }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id, scheduled_at, status, appointment_type, reason")
        .eq("patient_id", patient?.id ?? fallbackId)
        .gte("scheduled_at", nowIso)
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", patient?.id ?? fallbackId)
        .lt("scheduled_at", nowIso),
      supabase
        .from("prescriptions")
        .select("id, issued_at, notes")
        .eq("patient_id", patient?.id ?? fallbackId)
        .order("issued_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("lab_results")
        .select("id, test_name, lab_name, result_date")
        .eq("patient_id", patient?.id ?? fallbackId)
        .order("result_date", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "paciente";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {bemvindo === "1" && (
        <Banner kind="success">
          Conta criada com sucesso. Bem-vindo à ANGOLASAUDE!
        </Banner>
      )}
      {perfilOk === "ok" && (
        <Banner kind="success">Perfil atualizado com sucesso.</Banner>
      )}

      <PageHeading
        eyebrow={`Olá, ${firstName}`}
        title="O seu painel de saúde"
        subtitle="Aqui está um resumo da sua atividade clínica e atalhos para o que precisa."
        action={
          <Link
            href="/painel/marcar"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            + Marcar consulta
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          tone="emerald"
          icon="🗓️"
          label="Próxima consulta"
          value={nextAppt ? formatDateTimePT(nextAppt.scheduled_at) : "—"}
          hint={
            nextAppt
              ? `${APPOINTMENT_TYPE_LABELS[nextAppt.appointment_type]} · ${APPOINTMENT_STATUS_LABELS[nextAppt.status]}`
              : "Nenhuma consulta marcada"
          }
        />
        <StatCard
          tone="slate"
          icon="📋"
          label="Histórico"
          value={pastApptCount ?? 0}
          hint={(pastApptCount ?? 0) === 1 ? "consulta anterior" : "consultas anteriores"}
        />
        <StatCard
          tone="amber"
          icon="💊"
          label="Última receita"
          value={lastRx ? "Disponível" : "—"}
          hint={lastRx ? formatDateTimePT(lastRx.issued_at) : "Sem receitas"}
        />
        <StatCard
          tone="sky"
          icon="🔬"
          label="Último exame"
          value={lastLab?.test_name ?? "—"}
          hint={lastLab?.lab_name ?? "Sem exames carregados"}
        />
      </section>

      {/* === Telemedicina hero card === */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-primary/30 bg-primary/5">
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              Telemedicina · disponível agora
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Falar agora com um médico por vídeo
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Triagem rápida, atendimento por vídeo e receita digital em
              minutos. Sem deslocações, sem filas.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/painel/telemedicina"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sm transition hover:bg-primary/90"
              >
                Iniciar consulta →
              </Link>
              <Link
                href="/painel/marcar"
                className="inline-flex items-center justify-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/40"
              >
                Marcar para mais tarde
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-2 text-center">
              <Mini label="Triagem" value="< 1 min" />
              <Mini label="Espera" value="≈ 3 min" />
              <Mini label="Receita" value="QR + PDF" />
              <Mini label="Pagamento" value="MCX" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading title="O que pode fazer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActionCard
            href="/painel/marcar"
            icon="📅"
            title="Marcar uma consulta"
            desc="Presencial numa clínica ou por telemedicina."
          />
          <ActionCard
            href="/painel/consultas"
            icon="🩺"
            title="As minhas consultas"
            desc="Próximas marcações e histórico recente."
          />
          <ActionCard
            href="/painel/receitas"
            icon="💊"
            title="Receitas médicas"
            desc="Acesso rápido com código QR e PDF."
          />
          <ActionCard
            href="/painel/faturas"
            icon="🧾"
            title="As minhas faturas"
            desc="Pagar com Multicaixa Express e ver comprovativos."
          />
        </div>
      </section>
    </main>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-card px-3 py-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-primary">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-foreground">{value}</div>
    </div>
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
      ? "border-primary/30 bg-primary/10 text-primary"
      : "border-sky-500/30 bg-sky-500/100/10 text-sky-600 dark:text-sky-400";
  return (
    <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${cls}`}>
      {children}
    </div>
  );
}
