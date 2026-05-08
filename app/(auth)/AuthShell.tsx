import Link from "next/link";
import Logo from "../_brand/Logo";

const TRUST = [
  "Triagem assistida por IA",
  "Receitas com QR válidas em farmácias",
  "Pagamentos via Multicaixa Express",
  "Histórico clínico sempre disponível",
];

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-[calc(100vh-6px)] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* === Brand panel (left) — hidden on mobile === */}
      <aside className="relative hidden overflow-hidden bg-slate-900 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-20 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
        />
        {/* Angolan flag stripe at top of the panel */}
        <div aria-hidden className="absolute inset-x-0 top-0 flex h-1.5">
          <div style={{ background: "#CD1126" }} className="h-full flex-1" />
          <div style={{ background: "#FCD116" }} className="h-full flex-1" />
        </div>

        <div className="flex flex-1 flex-col justify-between px-12 py-14">
          <Logo
            href="/"
            variant="dark"
            size="lg"
            subtitle="Saúde digital · Angola"
            subtitleColor="text-emerald-300"
          />

          <div>
            <h2 className="text-3xl font-bold leading-tight">
              A plataforma de saúde feita{" "}
              <span className="text-emerald-300">para Angola</span>.
            </h2>
            <p className="mt-3 max-w-md text-base text-slate-300">
              Telemedicina, gestão clínica e receitas digitais numa só app —
              acessível de Luanda ao Cunene.
            </p>

            <ul className="mt-8 space-y-3">
              {TRUST.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                    ✓
                  </span>
                  <span className="text-slate-200">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span aria-hidden className="flex overflow-hidden rounded">
              <span style={{ background: "#CD1126" }} className="block h-3 w-2" />
              <span style={{ background: "#000000" }} className="block h-3 w-2 border-l border-slate-700" />
              <span style={{ background: "#FCD116" }} className="block h-3 w-2" />
            </span>
            <span>Feito em Angola · com orgulho</span>
          </div>
        </div>
      </aside>

      {/* === Form panel (right) === */}
      <section className="flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo href="/" size="md" />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:shadow-none">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ← Voltar à página inicial
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
