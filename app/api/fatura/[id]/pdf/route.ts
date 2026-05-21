import { NextResponse } from "next/server";
import { PDFImage, PDFPage, PDFDocument, degrees, rgb } from "pdf-lib";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { embedPdfFonts, type PdfFonts } from "@/lib/pdf-fonts";

let logoBytesCache: Buffer | null = null;
function loadLogoBytes(): Buffer {
  if (!logoBytesCache) {
    logoBytesCache = readFileSync(
      path.join(process.cwd(), "public", "brand", "logo-mark.png")
    );
  }
  return logoBytesCache;
}

type Doctor = {
  full_name: string | null;
  specialty: string | null;
  medical_license: string | null;
};
type Clinic = {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
};

type InvoiceRow = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  due_date: string | null;
  created_at: string;
  appointment_id: string | null;
  consultation_id: string | null;
  patient:
    | {
        id_number: string | null;
        profile: { full_name: string | null; phone: string | null; email: string | null } |
          { full_name: string | null; phone: string | null; email: string | null }[] | null;
      }
    | {
        id_number: string | null;
        profile: { full_name: string | null; phone: string | null; email: string | null } |
          { full_name: string | null; phone: string | null; email: string | null }[] | null;
      }[]
    | null;
  doctor_appt:
    | { doctor: Doctor | Doctor[] | null }
    | { doctor: Doctor | Doctor[] | null }[]
    | null;
  doctor_consult:
    | { doctor: Doctor | Doctor[] | null }
    | { doctor: Doctor | Doctor[] | null }[]
    | null;
  clinic: Clinic | Clinic[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}
function fmtDateTimePT(d: string): string {
  return new Date(d).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtDatePT(d: string): string {
  return new Date(d).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
function fmtAOA(amount: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  }).format(amount);
}

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 48;
const HEADER_BAND_H = 96;

const EMERALD = rgb(0.184, 0.455, 0.769); // Lunga brand blue ≈ #2F74C4
const EMERALD_DARK = rgb(0.13, 0.33, 0.58);
const EMERALD_50 = rgb(0.945, 0.965, 0.99);
const WHITE = rgb(1, 1, 1);
const BAND_SUB = rgb(0.86, 0.92, 0.99); // light text on the blue band
const SLATE_900 = rgb(0.06, 0.09, 0.16);
const SLATE_800 = rgb(0.12, 0.16, 0.23);
const SLATE_700 = rgb(0.2, 0.25, 0.33);
const SLATE_500 = rgb(0.39, 0.45, 0.55);
const SLATE_300 = rgb(0.74, 0.78, 0.82);
const SLATE_200 = rgb(0.86, 0.88, 0.91);
const SLATE_100 = rgb(0.94, 0.95, 0.96);
const SLATE_50 = rgb(0.97, 0.98, 0.99);

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  multicaixa_express: "Multicaixa Express",
  cash: "Dinheiro",
  bank_transfer: "Transferência bancária",
  card: "Cartão",
};

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  fonts: PdfFonts,
  weight: "regular" | "bold" | "italic",
  size: number,
  color = SLATE_900
) {
  page.drawText(text, { x, y, font: fonts[weight], size, color });
}

// Official-looking rubber stamp: two rings + angled label + sub line.
function drawStamp(
  page: PDFPage,
  fonts: PdfFonts,
  opts: {
    label: string;
    sub: string;
    cx: number;
    cy: number;
    color: ReturnType<typeof rgb>;
  }
) {
  const { label, sub, cx, cy, color } = opts;
  const op = 0.85;
  page.drawEllipse({
    x: cx,
    y: cy,
    xScale: 60,
    yScale: 40,
    borderColor: color,
    borderWidth: 3,
    borderOpacity: op,
  });
  page.drawEllipse({
    x: cx,
    y: cy,
    xScale: 52,
    yScale: 33,
    borderColor: color,
    borderWidth: 1,
    borderOpacity: op,
  });
  const size = label.length > 6 ? 17 : 22;
  const lw = fonts.bold.widthOfTextAtSize(label, size);
  page.drawText(label, {
    x: cx - lw / 2,
    y: cy - size / 2 + 5,
    font: fonts.bold,
    size,
    color,
    opacity: op,
    rotate: degrees(-12),
  });
  const sw = fonts.regular.widthOfTextAtSize(sub, 7);
  page.drawText(sub, {
    x: cx - sw / 2,
    y: cy - 17,
    font: fonts.regular,
    size: 7,
    color,
    opacity: op,
    rotate: degrees(-12),
  });
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: rowRaw, error } = await supabase
    .from("invoices")
    .select(
      `id, amount, currency, status, payment_method, payment_reference,
       paid_at, due_date, created_at, appointment_id, consultation_id,
       patient:patients(
         id_number,
         profile:profiles(full_name, phone, email)
       ),
       doctor_appt:appointments(doctor:profiles!appointments_doctor_id_fkey(full_name, specialty, medical_license)),
       doctor_consult:consultations(doctor:profiles!consultations_doctor_id_fkey(full_name, specialty, medical_license)),
       clinic:clinics(name, address, phone, email)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !rowRaw) {
    return new NextResponse("Fatura não encontrada", { status: 404 });
  }

  const inv = rowRaw as InvoiceRow;
  const patient = pickOne(inv.patient);
  const patientProfile = pickOne(patient?.profile ?? null);
  const apptRel = pickOne(inv.doctor_appt);
  const consRel = pickOne(inv.doctor_consult);
  const doctor = pickOne(apptRel?.doctor ?? null) ?? pickOne(consRel?.doctor ?? null);
  const clinic = pickOne(inv.clinic);
  const isPaid = inv.status === "paid";

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Fatura ${inv.id}`);
  pdf.setAuthor("Lunga");
  pdf.setSubject(isPaid ? "Comprovativo de pagamento" : "Fatura");
  pdf.setCreator("Lunga");

  const fonts = await embedPdfFonts(pdf);
  const logoImage = await pdf.embedPng(loadLogoBytes());
  const page = pdf.addPage([A4.w, A4.h]);

  // ===== Brand header band =====
  page.drawRectangle({ x: 0, y: A4.h - 4, width: A4.w, height: 4, color: EMERALD_DARK });
  page.drawRectangle({
    x: 0,
    y: A4.h - 4 - HEADER_BAND_H,
    width: A4.w,
    height: HEADER_BAND_H,
    color: EMERALD,
  });

  const cy = A4.h - 4 - HEADER_BAND_H / 2; // vertical centre of the band

  // Brand mark — logo on a white plate, vertically centred
  const plate = 56;
  const logoRatio = logoImage.width / logoImage.height;
  const logoH = 30;
  const logoW = logoH * logoRatio;
  page.drawRectangle({
    x: MARGIN,
    y: cy - plate / 2,
    width: plate,
    height: plate,
    color: WHITE,
  });
  page.drawImage(logoImage, {
    x: MARGIN + (plate - logoW) / 2,
    y: cy - logoH / 2,
    width: logoW,
    height: logoH,
  });

  const tx = MARGIN + plate + 16;
  drawText(page, "Lunga", tx, cy + 8, fonts, "bold", 17, WHITE);
  drawText(
    page,
    isPaid
      ? "Comprovativo de Pagamento  ·  Receipt"
      : "Fatura  ·  Invoice",
    tx,
    cy - 9,
    fonts,
    "regular",
    10,
    BAND_SUB
  );
  drawText(
    page,
    "Documento contabilístico oficial",
    tx,
    cy - 23,
    fonts,
    "italic",
    8.5,
    BAND_SUB
  );

  // Reference block top-right, vertically centred against the plate
  const refX = A4.w - MARGIN - 170;
  drawText(page, "REFERÊNCIA", refX, cy + 8, fonts, "bold", 8, BAND_SUB);
  drawText(
    page,
    inv.payment_reference ?? inv.id.slice(0, 8).toUpperCase(),
    refX,
    cy - 9,
    fonts,
    "bold",
    11,
    WHITE
  );
  drawText(
    page,
    `Emitida ${fmtDateTimePT(inv.created_at)}`,
    refX,
    cy - 23,
    fonts,
    "regular",
    8,
    BAND_SUB
  );

  // ===== Two-column identity =====
  let cursorY = A4.h - HEADER_BAND_H - 50;
  const colW = (A4.w - MARGIN * 2 - 16) / 2;

  // EMITIDO POR
  page.drawRectangle({
    x: MARGIN,
    y: cursorY - 110,
    width: colW,
    height: 110,
    color: EMERALD_50,
    borderColor: SLATE_200,
    borderWidth: 0.6,
  });
  page.drawRectangle({ x: MARGIN, y: cursorY - 110, width: 3, height: 110, color: EMERALD });

  drawText(page, "EMITIDO POR", MARGIN + 14, cursorY - 16, fonts, "bold", 8, EMERALD_DARK);
  drawText(
    page,
    clinic?.name ?? "Lunga — Telemedicina",
    MARGIN + 14,
    cursorY - 32,
    fonts,
    "bold",
    11,
    SLATE_900
  );
  let dy = cursorY - 46;
  if (clinic?.address) {
    drawText(page, clinic.address, MARGIN + 14, dy, fonts, "regular", 9, SLATE_700);
    dy -= 12;
  }
  if (doctor?.full_name) {
    drawText(
      page,
      `Dr(a). ${doctor.full_name}${doctor.specialty ? `  ·  ${doctor.specialty}` : ""}`,
      MARGIN + 14,
      dy,
      fonts,
      "regular",
      9,
      SLATE_700
    );
    dy -= 12;
  }
  if (doctor?.medical_license) {
    drawText(page, `Cédula: ${doctor.medical_license}`, MARGIN + 14, dy, fonts, "regular", 9, SLATE_700);
    dy -= 12;
  }
  const clinicContact = [clinic?.phone, clinic?.email].filter(Boolean).join("  ·  ");
  if (clinicContact) drawText(page, clinicContact, MARGIN + 14, dy, fonts, "regular", 8, SLATE_500);

  // FATURADO A
  const px = MARGIN + colW + 16;
  page.drawRectangle({
    x: px,
    y: cursorY - 110,
    width: colW,
    height: 110,
    color: rgb(1, 1, 1),
    borderColor: SLATE_200,
    borderWidth: 0.6,
  });
  page.drawRectangle({ x: px, y: cursorY - 110, width: 3, height: 110, color: SLATE_300 });

  drawText(page, "FATURADO A", px + 14, cursorY - 16, fonts, "bold", 8, SLATE_500);
  drawText(
    page,
    patientProfile?.full_name ?? "—",
    px + 14,
    cursorY - 32,
    fonts,
    "bold",
    11,
    SLATE_900
  );
  let py = cursorY - 46;
  if (patient?.id_number) {
    drawText(page, `BI / NIF: ${patient.id_number}`, px + 14, py, fonts, "regular", 9, SLATE_700);
    py -= 12;
  }
  if (patientProfile?.phone) {
    drawText(page, patientProfile.phone, px + 14, py, fonts, "regular", 9, SLATE_700);
    py -= 12;
  }
  if (patientProfile?.email) {
    drawText(page, patientProfile.email, px + 14, py, fonts, "regular", 9, SLATE_700);
  }

  cursorY -= 130;

  // ===== Line item table =====
  page.drawRectangle({
    x: MARGIN,
    y: cursorY - 8,
    width: A4.w - MARGIN * 2,
    height: 24,
    color: SLATE_100,
    borderColor: SLATE_200,
    borderWidth: 0.6,
  });
  drawText(page, "DESCRIÇÃO", MARGIN + 12, cursorY + 2, fonts, "bold", 8, SLATE_500);
  drawText(page, "VALOR", A4.w - MARGIN - 100, cursorY + 2, fonts, "bold", 8, SLATE_500);

  let rowY = cursorY - 28;
  const description = inv.consultation_id
    ? "Consulta de telemedicina"
    : inv.appointment_id
    ? "Consulta médica"
    : "Serviço clínico";

  drawText(page, description, MARGIN + 12, rowY, fonts, "regular", 11, SLATE_900);
  if (doctor?.full_name) {
    drawText(
      page,
      `Prestada por Dr(a). ${doctor.full_name}`,
      MARGIN + 12,
      rowY - 14,
      fonts,
      "regular",
      9,
      SLATE_500
    );
  }
  drawText(
    page,
    fmtAOA(Number(inv.amount)),
    A4.w - MARGIN - 100,
    rowY,
    fonts,
    "bold",
    11,
    SLATE_900
  );

  rowY -= 38;
  page.drawLine({
    start: { x: MARGIN, y: rowY + 8 },
    end: { x: A4.w - MARGIN, y: rowY + 8 },
    thickness: 0.5,
    color: SLATE_200,
  });

  drawText(page, "TOTAL", A4.w - MARGIN - 200, rowY - 4, fonts, "bold", 9, SLATE_500);
  drawText(
    page,
    fmtAOA(Number(inv.amount)),
    A4.w - MARGIN - 100,
    rowY - 4,
    fonts,
    "bold",
    16,
    EMERALD_DARK
  );

  // ===== Payment block =====
  const payY = rowY - 60;
  page.drawRectangle({
    x: MARGIN,
    y: payY - 92,
    width: A4.w - MARGIN * 2,
    height: 92,
    color: SLATE_50,
    borderColor: SLATE_200,
    borderWidth: 0.6,
  });

  drawText(page, "PAGAMENTO", MARGIN + 14, payY - 16, fonts, "bold", 9, EMERALD_DARK);
  page.drawLine({
    start: { x: MARGIN + 14, y: payY - 21 },
    end: { x: MARGIN + 80, y: payY - 21 },
    thickness: 1,
    color: EMERALD,
  });

  const payCol1Y = payY - 38;
  drawText(page, "Estado", MARGIN + 14, payCol1Y, fonts, "regular", 8, SLATE_500);
  drawText(
    page,
    isPaid ? "✓ Pagamento confirmado" : "Pendente",
    MARGIN + 14,
    payCol1Y - 12,
    fonts,
    "bold",
    10,
    isPaid ? EMERALD_DARK : SLATE_900
  );

  if (inv.payment_method) {
    drawText(page, "Método", MARGIN + 14 + 180, payCol1Y, fonts, "regular", 8, SLATE_500);
    drawText(
      page,
      PAYMENT_METHOD_LABELS[inv.payment_method] ?? inv.payment_method,
      MARGIN + 14 + 180,
      payCol1Y - 12,
      fonts,
      "bold",
      10,
      SLATE_900
    );
  }

  if (inv.paid_at) {
    drawText(page, "Pago em", MARGIN + 14, payCol1Y - 32, fonts, "regular", 8, SLATE_500);
    drawText(page, fmtDateTimePT(inv.paid_at), MARGIN + 14, payCol1Y - 44, fonts, "bold", 10, SLATE_900);
  }

  if (inv.payment_reference) {
    drawText(page, "Referência", MARGIN + 14 + 240, payCol1Y - 32, fonts, "regular", 8, SLATE_500);
    drawText(page, inv.payment_reference, MARGIN + 14 + 240, payCol1Y - 44, fonts, "bold", 10, SLATE_900);
  }

  // Footer
  drawText(
    page,
    "Documento gerado automaticamente pela plataforma Lunga.",
    MARGIN,
    MARGIN + 24,
    fonts,
    "italic",
    8,
    SLATE_500
  );
  drawText(
    page,
    "Para mais informações, contacte a clínica ou suporte@lunga.ao",
    MARGIN,
    MARGIN + 12,
    fonts,
    "italic",
    8,
    SLATE_500
  );

  // Official rubber stamp on the right of the payment block (whitespace —
  // never over the line items / text).
  drawStamp(page, fonts, {
    label: isPaid ? "PAGO" : "PENDENTE",
    sub: isPaid && inv.paid_at ? fmtDatePT(inv.paid_at) : "Lunga",
    cx: A4.w - MARGIN - 72,
    cy: payY - 46,
    color: isPaid ? EMERALD : SLATE_500,
  });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="fatura-${inv.id.slice(0, 8)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
