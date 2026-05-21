// Lightweight helpers for wa.me deep-links. Angola defaults to +244;
// we strip every non-digit character so '+244 923 100 001' becomes
// '244923100001', which is the format wa.me expects.

export function normalizeWhatsappNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/[^\d]/g, "");
  // If it looks like a local AO number missing the country code (9 digits
  // starting with 9), prepend 244 so the deep link still works.
  if (digits.length === 9 && digits.startsWith("9")) return `244${digits}`;
  return digits;
}

/** Open WhatsApp letting the user pick the recipient from their address book.
 *  Used for share flows (receita, fatura, exame, consulta). */
export function waShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Open a chat with a specific contact (clinic, patient, doctor).
 *  Returns null if there's no usable number, so callers can hide the button. */
export function waContactUrl(
  phone: string | null | undefined,
  text?: string
): string | null {
  const n = normalizeWhatsappNumber(phone);
  if (!n) return null;
  const base = `https://wa.me/${n}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
