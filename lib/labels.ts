export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  doctor: "Médico",
  nurse: "Enfermeiro",
  receptionist: "Recepcionista",
  patient: "Paciente",
};

export const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown",
] as const;

export const BLOOD_TYPE_LABELS: Record<string, string> = {
  "A+": "A+", "A-": "A-",
  "B+": "B+", "B-": "B-",
  "AB+": "AB+", "AB-": "AB-",
  "O+": "O+", "O-": "O-",
  "unknown": "Desconhecido",
};

export const GENDERS = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
  { value: "other", label: "Outro" },
  { value: "prefer_not_to_say", label: "Prefiro não dizer" },
] as const;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Marcada",
  confirmed: "Confirmada",
  in_progress: "Em curso",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não compareceu",
};

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  in_person: "Presencial",
  telemedicine: "Telemedicina",
};

export function formatDateTimePT(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDatePT(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Paga",
  overdue: "Em atraso",
  cancelled: "Cancelada",
  refunded: "Reembolsada",
};

export const INVOICE_STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-700",
  refunded: "bg-sky-100 text-sky-800",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  multicaixa_express: "Multicaixa Express",
  cash: "Dinheiro",
  bank_transfer: "Transferência bancária",
  card: "Cartão",
};

export function formatAOA(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  }).format(n);
}
