"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/painel", label: "Início" },
  { href: "/painel/consultas", label: "Consultas" },
  { href: "/painel/telemedicina", label: "Telemedicina" },
  { href: "/painel/receitas", label: "Receitas" },
  { href: "/painel/faturas", label: "Faturas" },
  { href: "/painel/exames", label: "Exames" },
  { href: "/perfil", label: "Perfil" },
];

export default function PainelNav() {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto">
      {links.map((l) => {
        const active =
          l.href === "/painel" ? pathname === "/painel" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              "border-b-2 px-3 py-3 text-sm font-medium transition " +
              (active
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-600 hover:text-slate-900")
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
