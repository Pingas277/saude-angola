"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cancelOwnConsultationAction } from "./actions";

export default function PatientSala({
  consultationId,
  status,
  videoRoomUrl,
  doctorName,
  patientName,
}: {
  consultationId: string;
  status: string;
  videoRoomUrl: string | null;
  doctorName: string | null;
  patientName: string | null;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Realtime: react the instant the doctor claims (status → in_progress) or
  // the consultation ends. RLS still gates events, so the patient only sees
  // their own row's changes.
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

    // Heartbeat poll every 30s as a safety net in case the realtime channel
    // drops (mobile networks). Cheap, much less aggressive than the old 5s.
    tickRef.current = setInterval(() => {
      setElapsed((s) => s + 30);
      router.refresh();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status, consultationId, router]);

  if (status === "completed") {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Consulta concluída
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Obrigado por usar a Lunga. As receitas e o registo clínico
          ficam no seu painel.
        </p>
      </div>
    );
  }
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Consulta cancelada
        </h2>
      </div>
    );
  }

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
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {doctorName
            ? `Dr. ${doctorName} entrou na sala. A chamada começou.`
            : "O médico entrou na sala. A chamada começou."}
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-foreground">
          <iframe
            src={embedUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="h-full w-full"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Se o vídeo não carregar, autorize o acesso à câmara e ao microfone no
          seu navegador.
        </p>
      </div>
    );
  }

  // waiting / scheduled
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-primary/10" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          À espera de um médico…
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O próximo médico disponível vai atender. Não feche esta página.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          A página atualiza-se automaticamente quando o médico atender.
          {elapsed > 0 ? ` (${elapsed}s à espera)` : ""}
        </p>
      </div>

      <form action={cancelOwnConsultationAction}>
        <input type="hidden" name="consultation_id" value={consultationId} />
        <button
          type="submit"
          className="w-full rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40"
        >
          Cancelar pedido
        </button>
      </form>
    </div>
  );
}
