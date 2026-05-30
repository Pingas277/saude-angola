// Slot helpers for the booking flow.
//
// Clinics define per-weekday working hours (migration 023, clinics.working_hours
// JSONB keyed by JS getDay() 0=Sun..6=Sat). Booking slots are generated inside
// the selected day's window in 30-minute steps; the last start is one slot
// before close (so a 30-min consultation finishes by closing time).

export const SLOT_MINUTES = 30;

// Legacy defaults — kept for any caller that still wants a plain 08:00–18:00
// grid (and as the fallback when a clinic has no hours configured).
export const FIRST_SLOT_HOUR = 8;
export const LAST_SLOT_HOUR = 18; // exclusive — last START is 17:30

export type DayHours = { open: string; close: string } | null;
// Keys are JS getDay() as strings: "0"=Sun .. "6"=Sat.
export type WorkingHours = Record<string, DayHours>;

// Sensible fallback when a clinic predates migration 023 or has null hours.
export const DEFAULT_WORKING_HOURS: WorkingHours = {
  "0": null,
  "1": { open: "08:00", close: "18:00" },
  "2": { open: "08:00", close: "18:00" },
  "3": { open: "08:00", close: "18:00" },
  "4": { open: "08:00", close: "18:00" },
  "5": { open: "08:00", close: "18:00" },
  "6": { open: "08:00", close: "13:00" },
};

/** "08:00" → 480 (minutes-since-midnight). */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** 480 → "08:00". */
export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Slot start times inside [open, close), one slot before close excluded so the
 * consultation finishes by closing time. e.g. ("08:00","13:00") →
 * 08:00 … 12:30.
 */
export function generateSlotsBetween(open: string, close: string): string[] {
  const start = timeToMinutes(open);
  const end = timeToMinutes(close);
  const slots: string[] = [];
  for (let t = start; t + SLOT_MINUTES <= end; t += SLOT_MINUTES) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

/** Legacy plain 08:00–17:30 grid. Prefer generateSlotsBetween with clinic hours. */
export function generateSlots(): string[] {
  return generateSlotsBetween(
    `${String(FIRST_SLOT_HOUR).padStart(2, "0")}:00`,
    `${String(LAST_SLOT_HOUR).padStart(2, "0")}:00`
  );
}

/** Coerce an unknown DB value into a usable WorkingHours, falling back to default. */
export function coerceWorkingHours(value: unknown): WorkingHours {
  if (!value || typeof value !== "object") return DEFAULT_WORKING_HOURS;
  const v = value as Record<string, unknown>;
  const out: WorkingHours = {};
  for (let d = 0; d <= 6; d++) {
    const key = String(d);
    const day = v[key];
    if (
      day &&
      typeof day === "object" &&
      "open" in day &&
      "close" in day &&
      typeof (day as DayHours)!.open === "string" &&
      typeof (day as DayHours)!.close === "string"
    ) {
      out[key] = {
        open: (day as { open: string }).open,
        close: (day as { close: string }).close,
      };
    } else {
      out[key] = null;
    }
  }
  return out;
}

/** The {open,close} for a given Date's weekday, or null when closed. */
export function hoursForDate(hours: WorkingHours, date: Date): DayHours {
  return hours[String(date.getDay())] ?? null;
}

/** Booking slots for a specific date based on the clinic's hours that weekday. */
export function slotsForDate(hours: WorkingHours, date: Date): string[] {
  const day = hoursForDate(hours, date);
  if (!day) return [];
  return generateSlotsBetween(day.open, day.close);
}

// ── Display helpers ──────────────────────────────────────────────────────

// PT short weekday labels, Monday-first for display.
export const WEEKDAY_SHORT_PT: Record<string, string> = {
  "1": "Seg",
  "2": "Ter",
  "3": "Qua",
  "4": "Qui",
  "5": "Sex",
  "6": "Sáb",
  "0": "Dom",
};

// Monday-first ordering for editors and schedule rendering.
export const WEEKDAY_ORDER = ["1", "2", "3", "4", "5", "6", "0"] as const;

// "08:00" → "8h" / "08:30" → "8h30" for compact display.
function hShort(time: string): string {
  const [h, m] = time.split(":");
  const hh = String(Number(h));
  return m === "00" ? `${hh}h` : `${hh}h${m}`;
}

/**
 * Compact weekly schedule, grouping consecutive same-hours days.
 * e.g. "Seg–Sex 8h–18h · Sáb 8h–13h · Dom fechado"
 */
export function formatWeekSchedule(hours: WorkingHours): string {
  const parts: string[] = [];
  let i = 0;
  while (i < WEEKDAY_ORDER.length) {
    const key = WEEKDAY_ORDER[i];
    const day = hours[key] ?? null;
    const sig = day ? `${day.open}-${day.close}` : "closed";
    let j = i;
    while (
      j + 1 < WEEKDAY_ORDER.length &&
      (() => {
        const nk = WEEKDAY_ORDER[j + 1];
        const nd = hours[nk] ?? null;
        const nsig = nd ? `${nd.open}-${nd.close}` : "closed";
        return nsig === sig;
      })()
    ) {
      j++;
    }
    const label =
      i === j
        ? WEEKDAY_SHORT_PT[key]
        : `${WEEKDAY_SHORT_PT[key]}–${WEEKDAY_SHORT_PT[WEEKDAY_ORDER[j]]}`;
    parts.push(
      day ? `${label} ${hShort(day.open)}–${hShort(day.close)}` : `${label} fechado`
    );
    i = j + 1;
  }
  return parts.join(" · ");
}

/** Open/closed status for "now", for search result chips. */
export function openStatus(
  hours: WorkingHours,
  now = new Date()
): { open: boolean; label: string } {
  const today = hoursForDate(hours, now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (today) {
    const openMin = timeToMinutes(today.open);
    const closeMin = timeToMinutes(today.close);
    if (nowMin >= openMin && nowMin < closeMin) {
      return { open: true, label: `Aberto · fecha ${hShort(today.close)}` };
    }
    if (nowMin < openMin) {
      return { open: false, label: `Abre hoje ${hShort(today.open)}` };
    }
  }
  // Closed now — find the next open day within the week.
  for (let step = 1; step <= 7; step++) {
    const d = new Date(now);
    d.setDate(now.getDate() + step);
    const next = hoursForDate(hours, d);
    if (next) {
      const label =
        step === 1
          ? `Abre amanhã ${hShort(next.open)}`
          : `Abre ${WEEKDAY_SHORT_PT[String(d.getDay())]} ${hShort(next.open)}`;
      return { open: false, label };
    }
  }
  return { open: false, label: "Fechado" };
}
