"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/recepcao", label: "Início" },
  { href: "/recepcao/marcar", label: "Marcar" },
  { href: "/recepcao/pacientes", label: "Pacientes" },
];

export default function RecepcaoNav() {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto">
      {links.map((l) => {
        const active =
          l.href === "/recepcao" ? pathname === "/recepcao" : pathname.startsWith(l.href);
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
