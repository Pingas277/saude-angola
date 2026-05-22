"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  User,
} from "lucide-react";
import {
  submitClinicLeadAction,
  type ClinicLeadState,
} from "./clinicLeadActions";

export default function ClinicSignupForm() {
  const [state, formAction, isPending] = useActionState<
    ClinicLeadState,
    FormData
  >(submitClinicLeadAction, null);

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-sky-50/70 p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
          Pedido recebido!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Obrigado pelo interesse. A equipa da Lunga vai contactá-lo no email
          indicado para combinar uma demonstração e o setup da clínica.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7"
    >
      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label>
          Não preencha:
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-3.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          A clínica
        </div>
        <Field
          id="cl_name"
          name="clinic_name"
          label="Nome da clínica"
          icon={Building2}
          required
          placeholder="Ex.: Clínica Sagrada Esperança"
        />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field
            id="cl_nif"
            name="nif"
            label="NIF"
            icon={Hash}
            optional
            placeholder="Número de identificação fiscal"
          />
          <Field
            id="cl_province"
            name="province"
            label="Província"
            icon={MapPin}
            optional
            placeholder="Ex.: Luanda"
          />
        </div>
        <Field
          id="cl_doctors"
          name="num_doctors"
          label="Número de médicos"
          icon={Stethoscope}
          optional
          type="number"
          placeholder="Ex.: 8"
        />

        <div className="pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          O responsável
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field
            id="cl_contact"
            name="contact_name"
            label="Nome"
            icon={User}
            required
            placeholder="Quem podemos contactar"
            autoComplete="name"
          />
          <Field
            id="cl_email"
            name="contact_email"
            label="Email"
            icon={Mail}
            required
            type="email"
            placeholder="email@clinica.ao"
            autoComplete="email"
          />
        </div>
        <Field
          id="cl_phone"
          name="contact_phone"
          label="Telemóvel"
          icon={Phone}
          optional
          type="tel"
          placeholder="+244 9XX XXX XXX"
          autoComplete="tel"
        />

        <div>
          <label
            htmlFor="cl_message"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Mensagem{" "}
            <span className="font-medium normal-case tracking-normal text-muted-foreground/70">
              (opcional)
            </span>
          </label>
          <textarea
            id="cl_message"
            name="message"
            rows={3}
            maxLength={4000}
            placeholder="Conte-nos um pouco sobre a clínica e o que procura."
            className="block w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="group mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            A enviar…
          </>
        ) : (
          <>
            Pedir adesão
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Sem compromisso. A equipa contacta-o para uma demonstração.
      </p>
    </form>
  );
}

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
          inputMode={type === "number" ? "numeric" : undefined}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
