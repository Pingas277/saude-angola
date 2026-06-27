// Server-side helper: turn a raw error (Supabase, Anthropic, fetch, …) into
// a safe string we can send to the client.
//
// In dev we surface the actual message so we can debug. In production we
// log the full error to console (captured by Sentry) and return a generic
// "Algo correu mal" message so we don't leak DB column names, internal
// IPs, stack traces, etc.
//
// Callers that already translate a specific subset (auth/loginAction's
// traduzirErro, payment flows, etc) should keep their domain-specific
// branches and only fall through here for the unknown case.

import "server-only";

const IS_PROD = process.env.VERCEL_ENV === "production";

const FRIENDLY_BY_PATTERN: Array<{ re: RegExp; msg: string }> = [
  // PostgREST / Supabase
  { re: /duplicate key/i, msg: "Esse registo já existe." },
  { re: /violates foreign key/i, msg: "Não foi possível guardar — referência inválida." },
  { re: /violates not-null/i, msg: "Faltam campos obrigatórios." },
  { re: /violates check constraint/i, msg: "Valor inválido para um dos campos." },
  { re: /permission denied|insufficient privilege|new row violates row-level/i, msg: "Não tem permissão para esta ação." },
  { re: /relation .* does not exist/i, msg: "Algo correu mal." },
  // Anthropic
  { re: /anthropic|claude/i, msg: "O assistente está indisponível. Tente novamente." },
  // Generic network
  { re: /fetch failed|network/i, msg: "Rede indisponível. Tente novamente." },
];

export function safeError(
  err: unknown,
  fallback = "Algo correu mal. Tente novamente."
): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";

  // Always log the full thing server-side so we can debug from Sentry.
  if (IS_PROD) {
    console.error("[safeError]", err);
  }

  for (const { re, msg } of FRIENDLY_BY_PATTERN) {
    if (re.test(raw)) return msg;
  }

  // In dev expose the real message; in prod hide it behind the fallback.
  return IS_PROD ? fallback : raw || fallback;
}
