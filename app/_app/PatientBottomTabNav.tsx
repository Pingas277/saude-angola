"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarCheck,
  Pill,
  Bell,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * Mobile-only bottom tab nav for the patient role — mirrors the 5-icon
 * bar shown in the landing PhoneMockup. Hidden on md+ since desktop uses
 * the sidebar. Sticky to viewport bottom, pb-safe to clear the iOS home
 * indicator.
 */

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match the tab as active when the current path starts with this. */
  matchPrefix: string;
  /** Match exactly (used for the Home tab so /painel/anything-else
   *  doesn't keep Home active). */
  exact?: boolean;
};

const TABS: Tab[] = [
  {
    href: "/painel",
    label: "Início",
    icon: Home,
    matchPrefix: "/painel",
    exact: true,
  },
  {
    href: "/painel/consultas",
    label: "Consultas",
    icon: CalendarCheck,
    matchPrefix: "/painel/consultas",
  },
  {
    href: "/painel/receitas",
    label: "Receitas",
    icon: Pill,
    matchPrefix: "/painel/receitas",
  },
  {
    href: "/painel/notificacoes",
    label: "Avisos",
    icon: Bell,
    matchPrefix: "/painel/notificacoes",
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: User,
    matchPrefix: "/perfil",
  },
];

export default function PatientBottomTabNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="pb-safe fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.matchPrefix
          : pathname === tab.matchPrefix ||
            pathname.startsWith(tab.matchPrefix + "/");
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors active:bg-accent/50"
          >
            <span
              className={
                "relative grid size-7 place-items-center transition-colors " +
                (isActive ? "text-sky-600" : "text-slate-400")
              }
            >
              <Icon className="size-[18px]" strokeWidth={isActive ? 2.4 : 2} />
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-sky-600"
                />
              )}
            </span>
            <span
              className={
                "text-[10px] font-medium leading-tight " +
                (isActive ? "text-sky-600" : "text-muted-foreground")
              }
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
