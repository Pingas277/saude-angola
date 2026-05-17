import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarPlus,
  Video,
  FileText,
  CreditCard,
  FlaskConical,
  Users,
  User,
  Building2,
  Stethoscope,
  Pill,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type RoleKey =
  | "patient"
  | "doctor"
  | "admin"
  | "receptionist"
  | "nurse";

export type RoleNav = {
  homeHref: string;
  roleLabel: string;
  items: NavItem[];
};

export const ROLE_NAV: Record<RoleKey, RoleNav> = {
  patient: {
    homeHref: "/painel",
    roleLabel: "Paciente",
    items: [
      { href: "/painel", label: "Início", icon: LayoutDashboard },
      { href: "/painel/consultas", label: "Consultas", icon: CalendarDays },
      { href: "/painel/telemedicina", label: "Telemedicina", icon: Video },
      { href: "/painel/receitas", label: "Receitas", icon: FileText },
      { href: "/painel/faturas", label: "Faturas", icon: CreditCard },
      { href: "/painel/exames", label: "Exames", icon: FlaskConical },
      { href: "/perfil", label: "Perfil", icon: User },
    ],
  },
  doctor: {
    homeHref: "/medico",
    roleLabel: "Médico",
    items: [
      { href: "/medico", label: "Início", icon: LayoutDashboard },
      { href: "/medico/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/medico/telemedicina", label: "Telemedicina", icon: Video },
      { href: "/medico/pacientes", label: "Pacientes", icon: Users },
      { href: "/medico/perfil", label: "Perfil", icon: User },
    ],
  },
  admin: {
    homeHref: "/clinica",
    roleLabel: "Administração",
    items: [
      { href: "/clinica", label: "Início", icon: LayoutDashboard },
      { href: "/clinica/equipa", label: "Equipa", icon: Users },
      { href: "/clinica/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/clinica/faturas", label: "Faturas", icon: CreditCard },
      { href: "/clinica/perfil", label: "Clínica", icon: Building2 },
    ],
  },
  receptionist: {
    homeHref: "/recepcao",
    roleLabel: "Recepção",
    items: [
      { href: "/recepcao", label: "Fila de hoje", icon: LayoutDashboard },
      { href: "/recepcao/marcar", label: "Marcar", icon: CalendarPlus },
      { href: "/recepcao/pacientes", label: "Pacientes", icon: Users },
    ],
  },
  nurse: {
    homeHref: "/enfermeiro",
    roleLabel: "Enfermagem",
    items: [
      { href: "/enfermeiro", label: "Triagem", icon: Stethoscope },
      { href: "/enfermeiro/farmacia", label: "Farmácia", icon: Pill },
    ],
  },
};
