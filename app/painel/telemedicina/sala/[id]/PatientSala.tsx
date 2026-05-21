"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Mic,
  Pill,
  Receipt,
  ShieldCheck,
  Stethoscope,
  Video,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cancelOwnConsultationAction } from "./actions";

function initials(name: string | null): string {
  if (!name) return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

function formatElapsed(s: number): string {
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m} min${r ? ` ${String(r).padStart(2, "0")}` : ""}`;
}

export default function PatientSala({
  consultationId,
  status,
  videoRoomUrl,
  doctorName,
  doctorSpecialty,
  doctorAvatarUrl,
  patientName,
}: {
  consultationId: string;
  status: string;
  videoRoomUrl: string | null;
  doctorName: string | null;
  doctorSpecialty: string | null;
  doctorAvatarUrl: string | null;
  patientName: string | null;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Realtime: react the instant the doctor claims (status → in_progress) or
  // the consultation ends. RLS only allows the patient to see their own row.
  useEffect(() => {
    if (status === "completed" || status === "cancelled") return;

    const supabase = createClient();
    const channel = supabase
      .channel(`consultation:${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "consultations",
          filter: `id=eq.${consultationId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    // Two tickers: 1s for the elapsed counter, 30s safety-net refresh in case
    // the realtime channel drops on a flaky mobile network.
    tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    refreshRef.current = setInterval(() => router.refresh(), 30000);

    return () => {
      supabase.removeChannel(channel);
      if (tickRef.current) clearInterval(tickRef.current);
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [status, consultationId, router]);

  /* ───────────────────────── COMPLETED ───────────────────────── */
  if (status === "completed") {
    return (
      <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-sky-50/70 p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
          <CheckCircle2 className="size-8" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          Consulta concluída
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Obrigado por usar a Lunga. As receitas e o registo clínico ficam
          no seu painel — pode aceder sempre que precisar.
        </p>

        <div className="mx-auto mt-7 grid max-w-md gap-2.5 sm:grid-cols-3">
          <ResultLink href="/painel/receitas" icon={Pill} label="Receitas" />
          <ResultLink href="/painel/faturas" icon={Receipt} label="Faturas" />
          <ResultLink href="/painel/consultas" icon={FileText} label="Histórico" />
        </div>
      </div>
    );
  }

  /* ───────────────────────── CANCELLED ───────────────────────── */
  if (status === "cancelled") {
    return (
      <div className="overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <XCircle className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          Pedido cancelado
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Pode iniciar um novo pedido de telemedicina sempre que precisar.
        </p>
        <Link
          href="/painel/telemedicina"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-4" />
          Voltar à telemedicina
        </Link>
      </div>
    );
  }

  /* ─────────────────────── IN PROGRESS (video) ─────────────────────── */
  if (status === "in_progress" && videoRoomUrl) {
    const params = new URLSearchParams({
      jwt: "",
      "config.prejoinPageEnabled": "false",
      "config.startWithAudioMuted": "false",
      "userInfo.displayName": patientName ?? "Paciente",
    });
    const embedUrl = `${videoRoomUrl}#${params.toString()}`;

    return (
      <div className="space-y-4">
        {/* Doctor strip */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 p-5 text-white shadow-md shadow-sky-500/30">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-white/20 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <div className="rounded-2xl bg-white/95 p-0.5 shadow-lg">
              <div className="grid size-14 place-items-center overflow-hidden rounded-[14px] bg-white text-base font-bold text-sky-700">
                {doctorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doctorAvatarUrl}
                    alt={doctorName ?? ""}
                    className="size-full object-cover"
                  />
                ) : (
                  initials(doctorName)
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-300" />
                  Em consulta
                </span>
              </div>
              <div className="mt-1 truncate text-lg font-bold tracking-tight">
                Dr(a). {doctorName ?? "—"}
              </div>
              {doctorSpecialty && (
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-white/85">
                  <Stethoscope className="size-3.5" />
                  {doctorSpecialty}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video frame */}
        <div className="overflow-hidden rounded-3xl border-2 border-slate-900 bg-slate-950 shadow-2xl shadow-black/40">
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="size-full"
            />
          </div>
        </div>

        {/* Privacy strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900/85">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="size-4 text-emerald-600" />
            Ligação encriptada · só você e o médico vêem isto
          </span>
          <span className="inline-flex items-center gap-3 text-[11px] text-emerald-700/85">
            <span className="inline-flex items-center gap-1">
              <Video className="size-3.5" />
              Câmara
            </span>
            <span className="inline-flex items-center gap-1">
              <Mic className="size-3.5" />
              Microfone
            </span>
          </span>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Se o vídeo não carregar, autorize a câmara e o microfone no
          navegador.
        </p>
      </div>
    );
  }

  /* ────────────────────────── WAITING ────────────────────────── */
  const claimed = !!doctorName; // doctor already chose this consult
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 p-8 text-center text-white shadow-xl shadow-sky-500/30 sm:p-10">
        {/* Orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-white/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 size-52 rounded-full bg-emerald-300/30 blur-3xl"
        />

        {/* Animated avatar */}
        <div className="relative mx-auto inline-flex">
          {/* Pulsing rings */}
          <span
            aria-hidden
            className="absolute inset-0 -m-3 animate-ping rounded-full bg-white/30"
          />
          <span
            aria-hidden
            className="absolute inset-0 -m-1.5 animate-pulse rounded-full bg-white/20"
          />
          <span className="relative grid size-20 place-items-center rounded-full bg-white/95 text-2xl font-bold text-sky-700 shadow-2xl shadow-black/10">
            {claimed ? (
              doctorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctorAvatarUrl}
                  alt={doctorName ?? ""}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                initials(doctorName)
              )
            ) : (
              <Loader2 className="size-8 animate-spin text-sky-600" />
            )}
          </span>
        </div>

        <h2 className="relative mt-7 text-2xl font-semibold tracking-tight sm:text-3xl">
          {claimed
            ? `Dr(a). ${doctorName} a entrar…`
            : "À espera de um médico"}
        </h2>
        <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/85">
          {claimed
            ? "Estamos a preparar a chamada. Vai começar em segundos."
            : "Vamos chamar o próximo médico disponível. Não feche esta página — atualiza-se automaticamente."}
        </p>

        <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <Clock className="size-3.5" />
          {formatElapsed(elapsed)} à espera
        </div>
      </div>

      {/* Stage list */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <ol className="space-y-3">
          <Stage done label="Pedido enviado" desc="O seu pedido chegou à equipa Lunga." />
          <Stage
            done={claimed}
            active={!claimed}
            label="A procurar médico disponível"
            desc={
              claimed
                ? `Dr(a). ${doctorName} aceitou o seu pedido.`
                : "Um médico vai aceitar nos próximos minutos."
            }
          />
          <Stage
            active={claimed}
            label="A iniciar vídeo"
            desc="A sala abre assim que o médico estiver pronto."
          />
        </ol>
      </div>

      {/* Cancel */}
      <form action={cancelOwnConsultationAction}>
        <input type="hidden" name="consultation_id" value={consultationId} />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <XCircle className="size-4" />
          Cancelar pedido
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function Stage({
  done,
  active,
  label,
  desc,
}: {
  done?: boolean;
  active?: boolean;
  label: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-white shadow-sm " +
          (done
            ? "bg-gradient-to-br from-emerald-500 to-teal-500"
            : active
              ? "bg-gradient-to-br from-sky-500 to-emerald-500"
              : "border border-border bg-muted text-muted-foreground")
        }
      >
        {done ? (
          <Check className="size-3.5" />
        ) : active ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <span className="text-[10px] font-bold">…</span>
        )}
      </span>
      <div className="min-w-0">
        <div
          className={
            "text-sm font-semibold " +
            (done || active ? "text-foreground" : "text-muted-foreground")
          }
        >
          {label}
        </div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}

function ResultLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        {label}
      </span>
      <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
