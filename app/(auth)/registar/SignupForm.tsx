"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  IdCard,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { signupAction, type AuthState } from "../actions";
import AuthField from "../_components/AuthField";
import PasswordStrength from "../_components/PasswordStrength";

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signupAction,
    null
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const matchState =
    confirm.length === 0
      ? null
      : confirm === password
        ? "ok"
        : "mismatch";

  return (
    <form action={formAction} className="space-y-4">
      <AuthField
        id="full_name"
        name="full_name"
        label="Nome completo"
        icon={User}
        autoComplete="name"
        required
        placeholder="Ex.: Maria João"
      />

      <AuthField
        id="email"
        name="email"
        label="Email"
        icon={Mail}
        type="email"
        autoComplete="email"
        required
        placeholder="seu@email.com"
      />

      <AuthField
        id="phone"
        name="phone"
        label="Telemóvel"
        icon={Phone}
        type="tel"
        autoComplete="tel"
        optional
        placeholder="+244 9XX XXX XXX"
      />

      <AuthField
        id="id_number"
        name="id_number"
        label="Bilhete de Identidade"
        icon={IdCard}
        required
        placeholder="Ex.: 001234567LA040"
        hint="Aparece no Passaporte de Saúde e em receitas / faturas."
        autoCapitalize="characters"
        inputMode="text"
      />

      <div>
        <AuthField
          id="password"
          name="password"
          label="Palavra-passe"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="mt-2">
          <PasswordStrength value={password} />
        </div>
      </div>

      <div>
        <AuthField
          id="confirm"
          name="confirm"
          label="Confirmar palavra-passe"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Repita a palavra-passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {matchState === "ok" && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-primary">
            <Check className="size-3.5" /> As palavras-passe coincidem
          </p>
        )}
        {matchState === "mismatch" && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
            <X className="size-3.5" /> As palavras-passe não coincidem
          </p>
        )}
      </div>

      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            A criar conta…
          </>
        ) : (
          <>
            Criar conta grátis
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Ao criar conta, aceita os{" "}
        <Link
          href="/termos"
          className="font-medium text-primary hover:underline"
        >
          Termos de Serviço
        </Link>{" "}
        e a{" "}
        <Link
          href="/privacidade"
          className="font-medium text-primary hover:underline"
        >
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  );
}
