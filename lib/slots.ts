// Slot helpers for the booking flow.
// Clinic working hours are 08:00–18:00 with 30-minute slots. Last available
// start time is 17:30 (so the consultation runs to 18:00).

export const SLOT_MINUTES = 30;
export const FIRST_SLOT_HOUR = 8;
export const LAST_SLOT_HOUR = 18; // exclusive — last START is 17:30

export function generateSlots(): string[] {
  const slots: string[] = [];
  for (let h = FIRST_SLOT_HOUR; h < LAST_SLOT_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return slots;
}

/** "08:00" → 480 (minutes-since-midnight). */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
