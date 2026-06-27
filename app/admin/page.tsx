import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock,
  Hash,
  Inbox,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Sparkles,
  Stethoscope,
  Undo2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Logo from "../_brand/Logo";
import { setLeadStatusAction, toggleMessageReadAction } from "./actions";

export const metadata = { title: "Administração · Lunga" };

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string | null;
  created_at: string;
  read_at: string | null;
};

type ClinicLead = {
  id: string;
  clinic_name: string;
  nif: string | null;
  province: string | null;
  num_doctors: number | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const LEAD_TONE: Record<string, { cls: string; dot: string; label: string }> = {
  new: { cls: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500", label: "Novo" },
  contacted: {
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    label: "Contactado",
  },
  converted: {
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Convertido",
  },
  lost: {
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    label: "Perdido",
  },
};

const LEAD_FLOW = [
  { value: "contacted", label: "Contactado" },
  { value: "converted", label: "Convertido" },
  { value: "lost", label: "Perdido" },
  { value: "new", label: "Novo" },
];

function fmt(d: string): string {
  return new Date(d).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "Hoje" = today, "Esta semana" = within last 7 days but not today,
// "Mais antigas" = everything older. Drives the time-section headers.
type AgeBucket = "today" | "week" | "older";
function bucketByAge(iso: string, now = new Date()): AgeBucket {
  const d = new Date(iso);
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  if (d.getTime() >= startToday) return "today";
  if (d.getTime() >= startToday - 6 * 24 * 60 * 60 * 1000) return "week";
  return "older";
}

const BUCKET_LABEL: Record<AgeBucket, string> = {
  today: "Hoje",
  week: "Esta semana",
  older: "Mais antigas",
};

function groupByAge<T extends { created_at: string }>(rows: T[]) {
  const groups: Record<AgeBucket, T[]> = { today: [], week: [], older: [] };
  for (const r of rows) groups[bucketByAge(r.created_at)].push(r);
  return groups;
}

// Strip "+", spaces, dashes and parens for a wa.me/<digits> URL.
function waLink(phone: string, text: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default async function AdminInboxPage() {
  const supabase = await createClient();

  // Hard gate. Middleware already requires a session for /admin (now in
  // PROTECTED_PREFIXES), but only Lunga staff should ever see this page.
  // Anyone else gets a 404 — not a 403 — so we don't leak the route's
  // existence to a logged-in patient or doctor.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?redirect=/admin");

  const { data: isStaff } = await supabase.rpc("is_lunga_staff");
  if (!isStaff) notFound();

  const [{ data: messagesRaw }, { data: leadsRaw }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id, name, email, phone, message, source, created_at, read_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("clinic_leads")
      .select(
        "id, clinic_name, nif, province, num_doctors, contact_name, contact_email, contact_phone, message, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const messages = (messagesRaw as ContactMessage[] | null) ?? [];
  const leads = (leadsRaw as ClinicLead[] | null) ?? [];

  const unread = messages.filter((m) => !m.read_at).length;
  const openLeads = leads.filter(
    (l) => l.status === "new" || l.status === "contacted"
  ).length;

  const newLeads = leads.filter((l) => l.status === "new").length;
  const contactedLeads = leads.filter((l) => l.status === "contacted").length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;

  const groupedLeads = groupByAge(leads);
  const groupedMessages = groupByAge(messages);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient background — matches /sobre + features sections */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/40 via-background to-emerald-50/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 size-[460px] rounded-full bg-gradient-to-br from-sky-200/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/2 size-[420px] -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-200/20 to-transparent blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Lunga · Administração
          </div>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20">
              <Inbox className="size-5" />
            </span>
            Inbox
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Mensagens de contacto e clínicas interessadas.
          </p>
        </div>
        <Logo href="/" size="sm" />
      </div>

      {/* Stats */}
      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Sparkles}
          label="Clínicas novas"
          value={`${newLeads}`}
          color="from-sky-500 to-blue-600"
        />
        <Stat
          icon={Building2}
          label="Em contacto"
          value={`${contactedLeads}`}
          color="from-amber-500 to-orange-600"
        />
        <Stat
          icon={CheckCircle2}
          label="Convertidas"
          value={`${convertedLeads}`}
          color="from-emerald-500 to-teal-600"
        />
        <Stat
          icon={MessageSquare}
          label="Mensagens por ler"
          value={`${unread}`}
          color="from-rose-500 to-pink-600"
        />
      </section>

      {/* ─── Clinic leads ─── */}
      <section className="mt-9">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <Building2 className="size-3.5" />
          Clínicas interessadas
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {leads.length}
          </span>
        </h2>

        {leads.length === 0 ? (
          <Empty
            icon={Building2}
            title="Sem pedidos de clínicas"
            desc="Quando uma clínica preencher o formulário em /parceria aparece aqui."
          />
        ) : (
          <div className="space-y-6">
            {(["today", "week", "older"] as AgeBucket[]).map((bucket) => {
              const items = groupedLeads[bucket];
              if (items.length === 0) return null;
              return (
                <div key={bucket}>
                  <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    <Clock className="size-3" />
                    {BUCKET_LABEL[bucket]}
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                      {items.length}
                    </span>
                  </h3>
                  <ul className="space-y-2.5">
            {items.map((l) => {
              const tone = LEAD_TONE[l.status] ?? LEAD_TONE.new;
              return (
                <li
                  key={l.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-base font-semibold tracking-tight text-foreground">
                          {l.clinic_name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${tone.cls}`}
                        >
                          <span className={`size-1.5 rounded-full ${tone.dot}`} />
                          {tone.label}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {l.province && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            {l.province}
                          </span>
                        )}
                        {l.num_doctors != null && (
                          <span className="inline-flex items-center gap-1">
                            <Stethoscope className="size-3" />
                            {l.num_doctors} médicos
                          </span>
                        )}
                        {l.nif && (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Hash className="size-3" />
                            {l.nif}
                          </span>
                        )}
                        <span>· {fmt(l.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact + message */}
                  <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3.5 text-sm">
                    <div className="font-semibold text-foreground">
                      {l.contact_name}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <a
                        href={`mailto:${l.contact_email}`}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <Mail className="size-3" />
                        {l.contact_email}
                      </a>
                      {l.contact_phone && (
                        <a
                          href={`tel:${l.contact_phone}`}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          <Phone className="size-3" />
                          {l.contact_phone}
                        </a>
                      )}
                      {l.contact_phone && (
                        <a
                          href={waLink(
                            l.contact_phone,
                            `Olá ${l.contact_name}, sou da equipa Lunga.`
                          )}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30"
                        >
                          <MessageCircle className="size-3" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                    {l.message && (
                      <p className="mt-2 leading-relaxed text-foreground">
                        {l.message}
                      </p>
                    )}
                  </div>

                  {/* Status pipeline buttons */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {LEAD_FLOW.filter((s) => s.value !== l.status).map((s) => (
                      <form key={s.value} action={setLeadStatusAction}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="status" value={s.value} />
                        <button
                          type="submit"
                          className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
                        >
                          → {s.label}
                        </button>
                      </form>
                    ))}
                  </div>
                </li>
              );
            })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Contact messages ─── */}
      <section className="mt-10">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <MessageSquare className="size-3.5" />
          Mensagens de contacto
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {messages.length}
          </span>
        </h2>

        {messages.length === 0 ? (
          <Empty
            icon={MessageSquare}
            title="Sem mensagens"
            desc="As mensagens do formulário de contacto chegam aqui."
          />
        ) : (
          <div className="space-y-6">
            {(["today", "week", "older"] as AgeBucket[]).map((bucket) => {
              const items = groupedMessages[bucket];
              if (items.length === 0) return null;
              return (
                <div key={bucket}>
                  <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    <Clock className="size-3" />
                    {BUCKET_LABEL[bucket]}
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                      {items.length}
                    </span>
                  </h3>
                  <ul className="space-y-2.5">
            {items.map((m) => (
              <li
                key={m.id}
                className={
                  "rounded-2xl border bg-card p-5 shadow-sm " +
                  (m.read_at ? "border-border opacity-90" : "border-primary/30")
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-foreground">
                        {m.name}
                      </span>
                      {!m.read_at && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                          Nova
                        </span>
                      )}
                      {m.source && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          {m.source}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <a
                        href={`mailto:${m.email}`}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <Mail className="size-3" />
                        {m.email}
                      </a>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          <Phone className="size-3" />
                          {m.phone}
                        </a>
                      )}
                      <span>· {fmt(m.created_at)}</span>
                    </div>
                  </div>

                  <form action={toggleMessageReadAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input
                      type="hidden"
                      name="mark_read"
                      value={m.read_at ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {m.read_at ? (
                        <>
                          <Undo2 className="size-3" />
                          Marcar não lida
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3" />
                          Marcar lida
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <p className="mt-3 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                  {m.message}
                </p>
              </li>
            ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-10 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Users className="size-3.5" />
        Área restrita à equipa Lunga.
      </p>

      <div className="mt-3 text-center">
        <Link
          href="/"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          ← Voltar ao site
        </Link>
      </div>
      </div>
    </main>
  );
}

function Stat({
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
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-lg font-bold tracking-tight text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function Empty({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-5 py-12 text-center backdrop-blur-sm">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      {desc && (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          {desc}
        </p>
      )}
    </div>
  );
}
