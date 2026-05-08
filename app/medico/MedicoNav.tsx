"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/medico", label: "Início" },
  { href: "/medico/agenda", label: "Agenda" },
  { href: "/medico/telemedicina", label: "Telemedicina" },
  { href: "/medico/pacientes", label: "Pacientes" },
  { href: "/medico/perfil", label: "Perfil" },
];

export default function MedicoNav() {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto">
      {links.map((l) => {
        const active =
          l.href === "/medico" ? pathname === "/medico" : pathname.startsWith(l.href);
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
