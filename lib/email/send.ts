// Transactional email — Resend client + small fire-and-forget helper.
//
// Why a helper instead of calling `new Resend(...)` everywhere:
//   - the API key is cached and the client is reused (one network resolver
//     instead of one per request);
//   - failures are logged but never throw, so an appointment booking
//     never fails because the smtp side has a hiccup;
//   - the FROM and BCC defaults live in one place.

import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Lunga <no-reply@lunga.ao>";
const BCC = process.env.EMAIL_BCC ?? undefined; // e.g. "ops@lunga.ao" for QA

let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

export type SendOptions = {
  to: string | string[];
  subject: string;
  /** Pre-rendered HTML body. Use renderEmail() from ./templates. */
  html: string;
  /** Plain-text fallback for clients that block HTML. */
  text?: string;
  replyTo?: string;
};

/** Send an email. Never throws — failure is logged. */
export async function sendEmail(opts: SendOptions): Promise<void> {
  const c = client();
  if (!c) {
    if (process.env.VERCEL_ENV === "production") {
      console.error(
        "[email] RESEND_API_KEY missing — email skipped:",
        opts.subject
      );
    } else {
      console.log("[email] (dev, no key) would send:", opts.subject, "→", opts.to);
    }
    return;
  }

  try {
    await c.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
      bcc: BCC,
    });
  } catch (err) {
    console.error("[email] send failed:", opts.subject, err);
  }
}
