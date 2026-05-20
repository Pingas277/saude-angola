import Link from "next/link";
import Image from "next/image";
import Logo from "../_brand/Logo";

const NAV = [
  { href: "/sobre", label: "Sobre nós" },
  { href: "/#caracteristicas", label: "Características" },
  { href: "/#precos", label: "Preços" },
];

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/registar"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Image
              src="/brand/angola-flag.png"
              alt="Bandeira de Angola"
              width={18}
              height={12}
              className="rounded-[2px] ring-1 ring-border"
            />
            <span>
              © {new Date().getFullYear()} Lunga · Feito em Angola
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <Link href="/sobre" className="transition-colors hover:text-foreground">
              Sobre nós
            </Link>
            <Link
              href="/privacidade"
              className="transition-colors hover:text-foreground"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="transition-colors hover:text-foreground"
            >
              Termos
            </Link>
            <a
              href="mailto:suporte@saudeangola.ao"
              className="transition-colors hover:text-foreground"
            >
              Contacto
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
