// Email templates — pure server-side HTML strings (no React renderer).
//
// Each template:
//   - takes a typed payload,
//   - returns {subject, html, text} so callers can fan them straight into
//     sendEmail() without composing anything;
//   - uses the shared layout() for header/footer brand + safe defaults so
//     they look identical across Gmail / Outlook / mobile clients.

import "server-only";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lunga.ao";

const BRAND_PRIMARY = "#0EA5E9"; // sky-500
const BRAND_ACCENT = "#10B981"; // emerald-500

function layout(opts: {
  preview: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
}): string {
  return `<!doctype html>
<html lang="pt-AO">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(opts.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
    <!-- Preview (hidden) -->
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;">${escapeHtml(opts.preview)}</span>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 1px 3px rgba(15,23,42,0.06),0 8px 24px rgba(15,23,42,0.04);overflow:hidden;">

            <!-- Brand band -->
            <tr>
              <td style="padding:18px 24px;background:linear-gradient(90deg,${BRAND_PRIMARY} 0%,${BRAND_ACCENT} 100%);color:#ffffff;font-weight:800;letter-spacing:1.5px;font-size:14px;text-transform:uppercase;">
                Lunga
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding:28px 28px 12px;font-size:22px;font-weight:700;line-height:1.25;color:#0f172a;">
                ${escapeHtml(opts.title)}
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:0 28px 24px;font-size:15px;line-height:1.6;color:#334155;">
                ${opts.bodyHtml}
              </td>
            </tr>

            ${
              opts.ctaHref && opts.ctaLabel
                ? `<tr>
                    <td style="padding:0 28px 32px;">
                      <a href="${escapeHtml(opts.ctaHref)}" style="display:inline-block;background:${BRAND_PRIMARY};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;font-size:15px;">${escapeHtml(opts.ctaLabel)}</a>
                    </td>
                  </tr>`
                : ""
            }

            <!-- Footer -->
            <tr>
              <td style="padding:18px 28px 24px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.6;color:#94a3b8;">
                ${opts.footerNote ?? "Este email foi enviado pela Lunga porque tem uma conta em lunga.ao."}<br>
                <a href="${SITE_URL}" style="color:${BRAND_PRIMARY};text-decoration:none;">lunga.ao</a>
              </td>
            </tr>
          </table>

          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
            <tr>
              <td align="center" style="padding-top:14px;font-size:11px;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                © Lunga ${new Date().getFullYear()} · Saúde no telemóvel · Angola
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateTimePT(iso: string): string {
  return new Date(iso).toLocaleString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─────────────────────────── #1 appointment booked ─────────────────────────── */

export function appointmentConfirmation(p: {
  patientName: string;
  doctorName: string;
  doctorSpecialty: string | null;
  clinicName: string | null;
  clinicAddress: string | null;
  scheduledAt: string;
  appointmentType: "in_person" | "video" | string;
  appointmentId: string;
}): { subject: string; html: string; text: string } {
  const when = formatDateTimePT(p.scheduledAt);
  const modality = p.appointmentType === "video" ? "Consulta por vídeo" : "Consulta presencial";
  const ctaHref = `${SITE_URL}/painel/consultas`;

  const html = layout({
    preview: `Marcação confirmada — Dr(a). ${p.doctorName}, ${when}.`,
    title: "Marcação confirmada ✅",
    bodyHtml: `
      <p>Olá <strong>${escapeHtml(p.patientName)}</strong>, a sua consulta está marcada:</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:12px 0 20px;border-collapse:collapse;width:100%;">
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;width:140px;">Médico</td>
          <td style="padding:6px 0;font-weight:600;color:#0f172a;">Dr(a). ${escapeHtml(p.doctorName)}${p.doctorSpecialty ? ` · ${escapeHtml(p.doctorSpecialty)}` : ""}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;">Quando</td>
          <td style="padding:6px 0;font-weight:600;color:#0f172a;">${escapeHtml(when)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;">Modalidade</td>
          <td style="padding:6px 0;font-weight:600;color:#0f172a;">${escapeHtml(modality)}</td>
        </tr>
        ${
          p.clinicName
            ? `<tr>
                <td style="padding:6px 0;color:#64748b;font-size:13px;">Clínica</td>
                <td style="padding:6px 0;color:#0f172a;">${escapeHtml(p.clinicName)}${p.clinicAddress ? `<br><span style="font-size:13px;color:#64748b;">${escapeHtml(p.clinicAddress)}</span>` : ""}</td>
              </tr>`
            : ""
        }
      </table>
      <p style="font-size:13px;color:#64748b;">Vai precisar de cancelar ou alterar? Pode fazê-lo na app até 24h antes.</p>
    `,
    ctaLabel: "Ver no painel",
    ctaHref,
    footerNote: "Recebeu este email porque marcou esta consulta na Lunga. ID: " + p.appointmentId.slice(0, 8),
  });

  return {
    subject: `Marcação confirmada — Dr(a). ${p.doctorName}, ${when}`,
    html,
    text: `Marcação confirmada\n\nMédico: Dr(a). ${p.doctorName}${p.doctorSpecialty ? ` (${p.doctorSpecialty})` : ""}\nQuando: ${when}\n${modality}${p.clinicName ? `\nClínica: ${p.clinicName}${p.clinicAddress ? ` · ${p.clinicAddress}` : ""}` : ""}\n\nVer no painel: ${ctaHref}`,
  };
}

/* ─────────────────────────── #2 prescription ready ─────────────────────────── */

export function prescriptionReady(p: {
  patientName: string;
  doctorName: string;
  prescriptionId: string;
}): { subject: string; html: string; text: string } {
  const ctaHref = `${SITE_URL}/painel/receitas/${p.prescriptionId}`;
  const html = layout({
    preview: `Dr(a). ${p.doctorName} emitiu uma receita.`,
    title: "Receita pronta 💊",
    bodyHtml: `
      <p>Olá <strong>${escapeHtml(p.patientName)}</strong>,</p>
      <p>O(a) Dr(a). <strong>${escapeHtml(p.doctorName)}</strong> acabou de emitir uma receita para si.</p>
      <p>Abra a receita na app e mostre o código <strong>QR</strong> à farmácia. Sem papel, sem rasura, válida no momento.</p>
    `,
    ctaLabel: "Abrir receita",
    ctaHref,
  });
  return {
    subject: "Receita pronta — abra a app",
    html,
    text: `Receita pronta\n\nO(a) Dr(a). ${p.doctorName} emitiu uma receita para si.\nMostre o QR à farmácia.\n\nAbrir: ${ctaHref}`,
  };
}

/* ─────────────────────────── #3 lab result available ─────────────────────────── */

export function labResultAvailable(p: {
  patientName: string;
  testName: string | null;
  labName: string | null;
}): { subject: string; html: string; text: string } {
  const test = p.testName ?? "Resultado de exame";
  const ctaHref = `${SITE_URL}/painel/exames`;
  const html = layout({
    preview: `${test} disponível na app.`,
    title: "Resultado de exame disponível 🧪",
    bodyHtml: `
      <p>Olá <strong>${escapeHtml(p.patientName)}</strong>,</p>
      <p>O resultado do exame <strong>${escapeHtml(test)}</strong>${p.labName ? ` (${escapeHtml(p.labName)})` : ""} já está disponível na sua conta.</p>
    `,
    ctaLabel: "Ver resultado",
    ctaHref,
  });
  return {
    subject: `Resultado disponível — ${test}`,
    html,
    text: `Resultado de exame disponível\n\n${test}${p.labName ? ` (${p.labName})` : ""}\n\nVer: ${ctaHref}`,
  };
}

/* ─────────────────────────── #4 invoice issued ─────────────────────────── */

export function invoiceIssued(p: {
  patientName: string;
  amountKzFormatted: string;
  invoiceId: string;
}): { subject: string; html: string; text: string } {
  const ctaHref = `${SITE_URL}/painel/faturas/${p.invoiceId}`;
  const html = layout({
    preview: `Fatura de ${p.amountKzFormatted} emitida.`,
    title: "Fatura emitida 📄",
    bodyHtml: `
      <p>Olá <strong>${escapeHtml(p.patientName)}</strong>,</p>
      <p>Foi emitida uma fatura no valor de <strong>${escapeHtml(p.amountKzFormatted)}</strong>.</p>
      <p>Pode visualizar e descarregar o PDF na sua conta.</p>
    `,
    ctaLabel: "Ver fatura",
    ctaHref,
  });
  return {
    subject: `Fatura Lunga — ${p.amountKzFormatted}`,
    html,
    text: `Fatura emitida — ${p.amountKzFormatted}\n\nVer: ${ctaHref}`,
  };
}
