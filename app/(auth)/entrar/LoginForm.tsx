"use client";

import { useActionState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  UserRoundX,
} from "lucide-react";
import {
  clearLastUserAction,
  loginAction,
  type AuthState,
} from "../actions";
import AuthField from "../_components/AuthField";

export type LastUser = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

function initials(name: string | null, email: string): string {
  if (name) {
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function obfuscateEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

export default function LoginForm({
  redirectTo,
  lastUser,
}: {
  redirectTo: string;
  lastUser?: LastUser | null;
}) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    null
  );

  if (lastUser) {
    return (
      <div className="space-y-5">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirect" value={redirectTo} />
          <input type="hidden" name="email" value={lastUser.email} />

        {/* Identity card */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <span className="grid size-24 place-items-center overflow-hidden rounded-full border-4 border-background bg-gradient-to-br from-sky-500 to-emerald-500 text-2xl font-bold text-white shadow-xl shadow-sky-500/20">
              {lastUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lastUser.avatarUrl}
                  alt={lastUser.name ?? lastUser.email}
                  className="size-full object-cover"
                />
              ) : (
                initials(lastUser.name, lastUser.email)
              )}
            </span>
          </div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Bem-vindo de volta
          </div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {lastUser.name ?? lastUser.email}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {obfuscateEmail(lastUser.email)}
          </div>
        </div>

        <AuthField
          id="password"
          name="password"
          label="Palavra-passe"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />

        <div className="text-right">
          <a
            href="mailto:suporte@saudeangola.ao?subject=Recuperar%20palavra-passe"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Esqueceu a palavra-passe?
          </a>
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
          className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              A entrar…
            </>
          ) : (
            <>
              Entrar como {lastUser.name?.split(" ")[0] ?? "tu"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        </form>

        <SwitchAccountButton />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

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

      <div>
        <AuthField
          id="password"
          name="password"
          label="Palavra-passe"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
        <div className="mt-1.5 text-right">
          <a
            href="mailto:suporte@saudeangola.ao?subject=Recuperar%20palavra-passe"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Esqueceu a palavra-passe?
          </a>
        </div>
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
        className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            A entrar…
          </>
        ) : (
          <>
            Entrar
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}

// Tiny sub-form so the switch-account action stays its own POST.
function SwitchAccountButton() {
  return (
    <form action={clearLastUserAction}>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <UserRoundX className="size-3.5" />
        Entrar com outra conta
      </button>
    </form>
  );
}
