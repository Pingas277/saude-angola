"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import {
  sendContactMessageAction,
  type ContactState,
} from "./contactActions";

/**
 * Public "fala connosco" form. Lives at the bottom of /privacidade,
 * /termos, and anywhere else we want people to write to us without
 * needing to open their mail client.
 *
 * Submission persists into the `contact_messages` table (server-side).
 * The optimistic success state stays on the page so the visitor knows
 * the message went through.
 */
export default function ContactForm({
  source,
  title = "Fale connosco",
  description = "Tem uma dúvida, comentário ou pedido? Escreva-nos — respondemos ao email indicado.",
}: {
  source: "privacidade" | "termos" | "sobre" | "outro";
  title?: string;
  description?: string;
}) {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(
    sendContactMessageAction,
    null
  );

  // After a successful submit, swap the form for a confirmation card.
  if (state?.ok) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-sky-50/70 p-7 text-center shadow-sm sm:p-9">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
          Mensagem enviada!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Recebemos a sua mensagem. Vamos responder ao email indicado nos
          próximos dias úteis.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-sm">
          <MessageSquare className="size-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {title}
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-3.5">
        <input type="hidden" name="source" value={source} />

        {/* Honeypot — bots happily fill it; humans never see it */}
        <div className="hidden" aria-hidden>
          <label>
            Não preencha:
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field
            id="contact_name"
            name="name"
            label="Nome"
            icon={User}
            required
            placeholder="Ex.: Maria João"
            autoComplete="name"
          />
          <Field
            id="contact_email"
            name="email"
            label="Email"
            icon={Mail}
            required
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
          />
        </div>

        <Field
          id="contact_phone"
          name="phone"
          label="Telemóvel"
          icon={Phone}
          type="tel"
          placeholder="+244 9XX XXX XXX"
          autoComplete="tel"
          optional
        />

        <div>
          <label
            htmlFor="contact_message"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Mensagem
          </label>
          <textarea
            id="contact_message"
            name="message"
            required
            minLength={10}
            maxLength={4000}
            rows={4}
            placeholder="Escreva a sua dúvida, comentário ou pedido…"
            className="block w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Não inclua informação médica sensível — para isso, use o painel da
            sua conta.
          </p>
        </div>

        {state?.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              A enviar…
            </>
          ) : (
            <>
              Enviar mensagem
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </section>
  );
}

/* ─────────────────────────── pieces ─────────────────────────── */

function Field({
  id,
  name,
  label,
  icon: Icon,
  type = "text",
  required,
  optional,
  placeholder,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"
      >
        {label}
        {optional && (
          <span className="font-medium normal-case tracking-normal text-muted-foreground/70">
            (opcional)
          </span>
        )}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
