"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";

type Props = {
  fullName: string | null;
  bloodType: string | null;
  age: number | null;
  /** Stable opaque short code displayed under the name. */
  shortId: string;
  /** QR markup pre-rendered server-side as an SVG string. */
  qrSvg: string;
  /** Plain-text URL the QR encodes — shown under the QR for copy/manual. */
  qrUrl: string;
};

export default function EmergencyPassport({
  fullName,
  bloodType,
  age,
  shortId,
  qrSvg,
  qrUrl,
}: Props) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the modal is up.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* ───── Compact mockup-style passport card — clickable ───── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir Passaporte de Saúde com QR"
        className="relative block w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-950 p-4 text-left text-white shadow-md transition-transform duration-150 ease-out active:scale-[0.99]"
      >
        {/* dotted overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-amber-100/85">
            <span>Passaporte de Saúde</span>
            <span>· AO ·</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-mono text-sm font-bold uppercase tracking-wide">
                {fullName ?? "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-white/55">
                Tipo sang.{" "}
                <strong className="text-white">{bloodType ?? "—"}</strong>
                {age !== null ? ` · ${age} anos` : ""}
              </div>
              <div className="mt-1 font-mono text-[10px] text-white/45">
                ID · {shortId}
              </div>
            </div>
            <div className="shrink-0 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-slate-900">
              lunga
            </div>
          </div>
          {/* Hint that the card is interactive */}
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/85 ring-1 ring-white/15 backdrop-blur">
            <ShieldAlert className="size-3" />
            Toque para QR de emergência
          </div>
        </div>
      </button>

      {/* ───── Modal with the QR ───── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR de emergência"
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet */}
          <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-200 sm:rounded-3xl">
            <div className="overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
              {/* Header strip — same rose as the public /e page */}
              <div className="flex items-center justify-between bg-rose-600 px-5 py-3 text-white">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em]">
                  <ShieldAlert className="size-3.5" />
                  Cartão de Emergência
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
                  aria-label="Fechar"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="px-6 py-7">
                <div className="text-center">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Apresente este QR
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    Em emergência, qualquer médico ou paramédico pode
                    scanear este código para ver{" "}
                    <strong className="font-semibold">
                      nome, tipo sanguíneo, alergias, doenças crónicas e
                      contacto de emergência
                    </strong>{" "}
                    — sem ter de entrar em nenhuma conta.
                  </p>
                </div>

                {/* QR — server-rendered SVG, injected. */}
                <div className="mx-auto mt-5 grid size-[260px] place-items-center rounded-2xl border-2 border-slate-900 bg-white p-3 shadow-md">
                  <div
                    className="size-full"
                    // The qrcode library emits a self-contained, sanitised
                    // SVG that we trust because we generated it ourselves
                    // server-side.
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                </div>

                <div className="mt-4 break-all rounded-lg bg-slate-50 px-3 py-2 text-center font-mono text-[10px] text-muted-foreground">
                  {qrUrl}
                </div>

                <p className="mt-5 text-center text-[10px] leading-relaxed text-muted-foreground">
                  Esta página pública mostra apenas a informação
                  clinicamente relevante. Nunca expõe BI, morada,
                  telefone do próprio nem histórico clínico.
                </p>
              </div>
            </div>
            {/* Bottom safe-area spacer on iOS so the rounded edge clears
                the home indicator. */}
            <div className="pb-safe bg-white" />
          </div>
        </div>
      )}
    </>
  );
}
