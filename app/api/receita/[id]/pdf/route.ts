import { NextResponse } from "next/server";
import {
  PDFDocument,
  PDFImage,
  PDFPage,
  degrees,
  rgb,
} from "pdf-lib";
import QRCode from "qrcode";
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

// =====================================================================
// Receita Médica · Medical Prescription
// A4 PDF generator. Uses Roboto (bundled TTF) so we can render any Unicode
// glyph the design wants — arrows, scissors, check marks, accented
// Portuguese characters — without WinAnsi encoding crashes.
// =====================================================================

type Medication = {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

type DoctorProfile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  medical_license: string | null;
  specialty: string | null;
  clinic:
    | { name: string | null; address: string | null; phone: string | null; logo_url: string | null }
    | { name: string | null; address: string | null; phone: string | null; logo_url: string | null }[]
    | null;
};

type PatientPayload = {
  date_of_birth: string | null;
  gender: string | null;
  id_number: string | null;
  profile:
    | { full_name: string | null; phone: string | null }
    | { full_name: string | null; phone: string | null }[]
    | null;
};

type RxRow = {
  id: string;
  qr_code: string;
  notes: string | null;
  issued_at: string;
  expires_at: string | null;
  medications: unknown;
  doctor: DoctorProfile | DoctorProfile[] | null;
  patient: PatientPayload | PatientPayload[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}
function asMeds(v: unknown): Medication[] {
  return Array.isArray(v) ? (v as Medication[]) : [];
}
function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
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
    month: "long",
    year: "numeric",
  });
}
function genderLabelPT(g: string | null): string {
  if (!g) return "—";
  switch (g) {
    case "female": return "Feminino";
    case "male": return "Masculino";
    case "other": return "Outro";
    case "prefer_not_to_say": return "—";
    default: return g;
  }
}

// === Page geometry ===
const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 42;
const HEADER_BAND_H = 96;
const FOOTER_PHARMACY_H = 188;

// === Palette === (Lunga logo blue)
const EMERALD = rgb(0.184, 0.455, 0.769); // brand blue ≈ #2F74C4
const EMERALD_DARK = rgb(0.13, 0.33, 0.58);
const EMERALD_50 = rgb(0.945, 0.965, 0.99);
const EMERALD_100 = rgb(0.85, 0.91, 0.98);
const SLATE_900 = rgb(0.06, 0.09, 0.16);
const SLATE_800 = rgb(0.12, 0.16, 0.23);
const SLATE_700 = rgb(0.2, 0.25, 0.33);
const SLATE_500 = rgb(0.39, 0.45, 0.55);
const SLATE_400 = rgb(0.58, 0.64, 0.72);
const SLATE_300 = rgb(0.74, 0.78, 0.82);
const SLATE_200 = rgb(0.86, 0.88, 0.91);
const SLATE_100 = rgb(0.94, 0.95, 0.96);
const SLATE_50 = rgb(0.97, 0.98, 0.99);
const RED_700 = rgb(0.7, 0.13, 0.13);
const WHITE = rgb(1, 1, 1);

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
  const font = fonts[weight];
  page.drawText(text, { x, y, font, size, color });
}

function drawWrapped(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fonts: PdfFonts,
  weight: "regular" | "bold" | "italic",
  size: number,
  color = SLATE_900,
  lineHeight = 14
): number {
  const font = fonts[weight];
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;
  for (const w of words) {
    const trial = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, font, size, color });
      cursorY -= lineHeight;
      line = w;
    } else {
      line = trial;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cursorY, font, size, color });
    cursorY -= lineHeight;
  }
  return cursorY;
}

function drawHeaderBand(
  page: PDFPage,
  fonts: PdfFonts,
  qrImage: PDFImage,
  logo: PDFImage,
  qrCode: string,
  pageNumber: number,
  totalPages: number
) {
  // Thin brand accent bar across the very top.
  page.drawRectangle({ x: 0, y: A4.h - 6, width: A4.w, height: 6, color: EMERALD });

  // Full Lunga logo (transparent PNG) — drawn directly on white, no plate.
  const logoRatio = logo.width / logo.height;
  const logoH = 30;
  const logoW = logoH * logoRatio;
  page.drawImage(logo, {
    x: MARGIN,
    y: A4.h - 48 - logoH,
    width: logoW,
    height: logoH,
  });
  drawText(
    page,
    "Receita médica · documento clínico",
    MARGIN,
    A4.h - 48 - logoH - 13,
    fonts,
    "regular",
    8,
    SLATE_500
  );

  // QR code top-right — on a bordered white plate so it always scans.
  const qrSize = 56;
  const qrX = A4.w - MARGIN - qrSize;
  const qrY = A4.h - 42 - qrSize;
  page.drawRectangle({
    x: qrX - 6,
    y: qrY - 6,
    width: qrSize + 12,
    height: qrSize + 12,
    color: WHITE,
    borderColor: SLATE_200,
    borderWidth: 0.8,
  });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  {
    const cap = "Ler na farmácia";
    const cw = fonts.regular.widthOfTextAtSize(cap, 6.5);
    drawText(
      page,
      cap,
      qrX + qrSize / 2 - cw / 2,
      qrY - 14,
      fonts,
      "regular",
      6.5,
      SLATE_500
    );
  }

  if (totalPages > 1) {
    const pg = `Página ${pageNumber} de ${totalPages}`;
    const pw = fonts.regular.widthOfTextAtSize(pg, 7.5);
    drawText(
      page,
      pg,
      qrX + qrSize / 2 - pw / 2,
      qrY - 24,
      fonts,
      "regular",
      7.5,
      SLATE_500
    );
  }

  // Hairline under the header.
  page.drawLine({
    start: { x: MARGIN, y: A4.h - 104 },
    end: { x: A4.w - MARGIN, y: A4.h - 104 },
    thickness: 0.8,
    color: SLATE_200,
  });
}

function drawIdentityBlock(
  page: PDFPage,
  fonts: PdfFonts,
  doctor: DoctorProfile | null,
  clinic: { name: string | null; address: string | null; phone: string | null; logo_url: string | null } | null,
  patient: PatientPayload | null,
  patientProfile: { full_name: string | null; phone: string | null } | null,
  startY: number
): number {
  const colW = (A4.w - MARGIN * 2 - 16) / 2;
  const cardH = 116;
  const yTop = startY - cardH;

  // === Doctor card === (emerald-tinted, the "issued by" side)
  page.drawRectangle({
    x: MARGIN,
    y: yTop,
    width: colW,
    height: cardH,
    color: EMERALD_50,
    borderColor: EMERALD_100,
    borderWidth: 0.8,
  });
  // Left accent bar
  page.drawRectangle({
    x: MARGIN,
    y: yTop,
    width: 3,
    height: cardH,
    color: EMERALD,
  });

  drawText(page, "MÉDICO PRESCRITOR", MARGIN + 14, startY - 18, fonts, "bold", 8, EMERALD_DARK);
  drawText(
    page,
    doctor?.full_name ? `Dr(a). ${doctor.full_name}` : "Médico não identificado",
    MARGIN + 14,
    startY - 36,
    fonts,
    "bold",
    12,
    SLATE_900
  );
  let dy = startY - 52;
  if (doctor?.specialty) {
    drawText(page, doctor.specialty, MARGIN + 14, dy, fonts, "regular", 9.5, SLATE_700);
    dy -= 13;
  }
  if (doctor?.medical_license) {
    drawText(
      page,
      `Cédula profissional: ${doctor.medical_license}`,
      MARGIN + 14,
      dy,
      fonts,
      "regular",
      9.5,
      SLATE_700
    );
    dy -= 13;
  } else {
    drawText(page, "Cédula profissional: —", MARGIN + 14, dy, fonts, "italic", 9, SLATE_500);
    dy -= 13;
  }
  if (clinic?.name) {
    drawText(page, clinic.name, MARGIN + 14, dy, fonts, "regular", 9.5, SLATE_800);
    dy -= 12;
  }
  if (clinic?.address) {
    drawText(page, clinic.address, MARGIN + 14, dy, fonts, "regular", 8.5, SLATE_500);
    dy -= 11;
  }
  const docContact = [doctor?.phone, doctor?.email, clinic?.phone]
    .filter(Boolean)
    .join("  ·  ");
  if (docContact && dy > yTop + 8) {
    drawText(page, docContact, MARGIN + 14, dy, fonts, "regular", 8, SLATE_500);
  }

  // === Patient card === (white, "billed/treated for")
  const px = MARGIN + colW + 16;
  page.drawRectangle({
    x: px,
    y: yTop,
    width: colW,
    height: cardH,
    color: rgb(1, 1, 1),
    borderColor: SLATE_200,
    borderWidth: 0.8,
  });
  page.drawRectangle({ x: px, y: yTop, width: 3, height: cardH, color: SLATE_400 });

  drawText(page, "PACIENTE", px + 14, startY - 18, fonts, "bold", 8, SLATE_500);
  drawText(
    page,
    patientProfile?.full_name ?? "Paciente",
    px + 14,
    startY - 36,
    fonts,
    "bold",
    12,
    SLATE_900
  );

  let py = startY - 52;
  const ageBits: string[] = [];
  const ag = ageFromDob(patient?.date_of_birth ?? null);
  if (ag !== null) ageBits.push(`${ag} anos`);
  if (patient?.gender) ageBits.push(genderLabelPT(patient.gender));
  if (ageBits.length) {
    drawText(page, ageBits.join("  ·  "), px + 14, py, fonts, "regular", 9.5, SLATE_700);
    py -= 13;
  }
  if (patient?.id_number) {
    drawText(page, `BI / NIF: ${patient.id_number}`, px + 14, py, fonts, "regular", 9.5, SLATE_700);
    py -= 13;
  } else {
    drawText(page, "BI / NIF: não registado", px + 14, py, fonts, "italic", 9, RED_700);
    py -= 13;
  }
  if (patientProfile?.phone) {
    drawText(page, patientProfile.phone, px + 14, py, fonts, "regular", 9.5, SLATE_700);
  }

  return yTop - 18;
}

function drawSectionHeader(
  page: PDFPage,
  fonts: PdfFonts,
  label: string,
  y: number
): number {
  drawText(page, label, MARGIN, y, fonts, "bold", 9, EMERALD_DARK);
  page.drawLine({
    start: { x: MARGIN, y: y - 5 },
    end: { x: A4.w - MARGIN, y: y - 5 },
    thickness: 1.2,
    color: EMERALD,
  });
  page.drawLine({
    start: { x: MARGIN, y: y - 7 },
    end: { x: MARGIN + 60, y: y - 7 },
    thickness: 1.2,
    color: EMERALD_DARK,
  });
  return y - 22;
}

function measureMedication(m: Medication, fonts: PdfFonts, innerWidth: number): number {
  let h = 18; // name line
  const detailLines: string[] = [];
  if (m.dosage) detailLines.push(`Dose: ${m.dosage}`);
  if (m.frequency) detailLines.push(`Frequência: ${m.frequency}`);
  if (m.duration) detailLines.push(`Duração: ${m.duration}`);
  if (detailLines.length) h += 14;
  if (m.instructions) {
    const text = `Instruções: ${m.instructions}`;
    const words = text.split(/\s+/);
    let line = "";
    let lines = 0;
    for (const w of words) {
      const trial = line ? line + " " + w : w;
      if (fonts.italic.widthOfTextAtSize(trial, 10) > innerWidth && line) {
        lines++;
        line = w;
      } else {
        line = trial;
      }
    }
    if (line) lines++;
    h += lines * 13;
  }
  h += 14; // bottom padding
  return h;
}

function drawMedication(
  page: PDFPage,
  fonts: PdfFonts,
  m: Medication,
  index: number,
  startY: number,
  innerWidth: number
): number {
  const cardX = MARGIN;
  const cardW = A4.w - MARGIN * 2;
  const cardTop = startY + 4;
  const cardH = measureMedication(m, fonts, innerWidth) + 4;

  // Subtle alternating background
  if (index % 2 === 0) {
    page.drawRectangle({
      x: cardX,
      y: cardTop - cardH,
      width: cardW,
      height: cardH,
      color: SLATE_50,
    });
  }

  // Numbered badge — emerald circle
  page.drawCircle({
    x: cardX + 16,
    y: startY - 4,
    size: 11,
    color: EMERALD,
  });
  const numStr = String(index + 1);
  const numWidth = fonts.bold.widthOfTextAtSize(numStr, 10);
  page.drawText(numStr, {
    x: cardX + 16 - numWidth / 2,
    y: startY - 8,
    font: fonts.bold,
    size: 10,
    color: rgb(1, 1, 1),
  });

  // Medication name
  drawText(
    page,
    m.name ?? "—",
    cardX + 36,
    startY - 8,
    fonts,
    "bold",
    12,
    SLATE_900
  );

  let cursorY = startY - 24;
  const detailLines: string[] = [];
  if (m.dosage) detailLines.push(`Dose: ${m.dosage}`);
  if (m.frequency) detailLines.push(`Frequência: ${m.frequency}`);
  if (m.duration) detailLines.push(`Duração: ${m.duration}`);
  if (detailLines.length) {
    drawText(
      page,
      detailLines.join("   ·   "),
      cardX + 36,
      cursorY,
      fonts,
      "regular",
      10,
      SLATE_700
    );
    cursorY -= 14;
  }
  if (m.instructions) {
    cursorY = drawWrapped(
      page,
      `Instruções: ${m.instructions}`,
      cardX + 36,
      cursorY,
      innerWidth,
      fonts,
      "italic",
      10,
      SLATE_700,
      13
    );
  }
  return cursorY - 10;
}

function drawPharmacyFooter(
  page: PDFPage,
  fonts: PdfFonts,
  qrImage: PDFImage,
  qrCode: string,
  expiresAt: string | null
) {
  const yTop = MARGIN + FOOTER_PHARMACY_H;

  // Perforated dashed line
  for (let x = MARGIN; x < A4.w - MARGIN; x += 7) {
    page.drawLine({
      start: { x, y: yTop },
      end: { x: x + 4, y: yTop },
      thickness: 0.7,
      color: SLATE_400,
    });
  }
  // Scissors + text on the perforation line
  const scissorsLabel = "✂   destacar para a farmácia   ·   detach for pharmacy";
  const labelWidth = fonts.italic.widthOfTextAtSize(scissorsLabel, 8);
  page.drawRectangle({
    x: A4.w / 2 - labelWidth / 2 - 6,
    y: yTop - 6,
    width: labelWidth + 12,
    height: 12,
    color: rgb(1, 1, 1),
  });
  drawText(
    page,
    scissorsLabel,
    A4.w / 2 - labelWidth / 2,
    yTop - 3,
    fonts,
    "italic",
    8,
    SLATE_500
  );

  // Footer card background
  page.drawRectangle({
    x: MARGIN,
    y: MARGIN,
    width: A4.w - MARGIN * 2,
    height: FOOTER_PHARMACY_H - 18,
    color: SLATE_100,
    borderColor: SLATE_200,
    borderWidth: 0.6,
  });

  // Left: QR
  const qrSize = 80;
  const qrCX = MARGIN + 16;
  const qrCY = MARGIN + (FOOTER_PHARMACY_H - 18 - qrSize) / 2;
  page.drawRectangle({
    x: qrCX - 4,
    y: qrCY - 4,
    width: qrSize + 8,
    height: qrSize + 8,
    color: rgb(1, 1, 1),
    borderColor: SLATE_200,
    borderWidth: 0.4,
  });
  page.drawImage(qrImage, { x: qrCX, y: qrCY, width: qrSize, height: qrSize });

  // Center: identity + validity
  const colX = qrCX + qrSize + 18;
  const innerY = yTop - 24;
  drawText(page, "TALÃO PARA A FARMÁCIA", colX, innerY, fonts, "bold", 9, EMERALD_DARK);
  drawText(page, "Pharmacy dispensing slip", colX, innerY - 11, fonts, "italic", 7.5, SLATE_500);

  drawText(page, "Código:", colX, innerY - 30, fonts, "regular", 8, SLATE_500);
  drawText(page, qrCode, colX + 38, innerY - 30, fonts, "bold", 9, SLATE_900);

  drawText(page, "Validade:", colX, innerY - 46, fonts, "regular", 8, SLATE_500);
  drawText(
    page,
    expiresAt ? fmtDatePT(expiresAt) : "—",
    colX + 46,
    innerY - 46,
    fonts,
    "bold",
    9,
    expiresAt && new Date(expiresAt).getTime() < Date.now() ? RED_700 : SLATE_900
  );

  drawText(
    page,
    "Apresente esta receita junto com o seu",
    colX,
    innerY - 66,
    fonts,
    "italic",
    7.5,
    SLATE_500
  );
  drawText(
    page,
    "documento de identificação na farmácia.",
    colX,
    innerY - 76,
    fonts,
    "italic",
    7.5,
    SLATE_500
  );

  // Right: dispensing fields
  const fieldsX = A4.w - MARGIN - 220;
  const fieldsW = 200;
  const fieldStart = innerY - 4;
  const fieldStep = 26;
  const labels = [
    "Data de levantamento",
    "Quantidade dispensada",
    "Farmácia / Carimbo",
    "Assinatura do farmacêutico",
  ];
  labels.forEach((label, i) => {
    const y = fieldStart - i * fieldStep;
    drawText(page, label, fieldsX, y, fonts, "regular", 7.5, SLATE_500);
    page.drawLine({
      start: { x: fieldsX, y: y - 14 },
      end: { x: fieldsX + fieldsW, y: y - 14 },
      thickness: 0.6,
      color: SLATE_300,
    });
  });
}

function drawSignatureBlock(
  page: PDFPage,
  fonts: PdfFonts,
  rx: { issued_at: string; expires_at: string | null },
  doctor: DoctorProfile | null,
  yBaseline: number
) {
  const y = yBaseline;
  page.drawLine({
    start: { x: MARGIN, y: y + 12 },
    end: { x: A4.w - MARGIN, y: y + 12 },
    thickness: 0.6,
    color: SLATE_200,
  });

  drawText(page, "Emitida em", MARGIN, y - 4, fonts, "regular", 8, SLATE_500);
  drawText(page, fmtDateTimePT(rx.issued_at), MARGIN, y - 18, fonts, "bold", 10, SLATE_900);

  if (rx.expires_at) {
    drawText(page, "Válida até", MARGIN + 200, y - 4, fonts, "regular", 8, SLATE_500);
    drawText(
      page,
      fmtDateTimePT(rx.expires_at),
      MARGIN + 200,
      y - 18,
      fonts,
      "bold",
      10,
      SLATE_900
    );
  }

  // Signature line on the right
  const sigX = A4.w - MARGIN - 220;
  page.drawLine({
    start: { x: sigX, y: y - 14 },
    end: { x: A4.w - MARGIN, y: y - 14 },
    thickness: 0.6,
    color: SLATE_500,
  });
  drawText(page, "Assinatura e carimbo do médico", sigX, y - 26, fonts, "regular", 8, SLATE_500);
  if (doctor?.full_name) {
    drawText(
      page,
      `Dr(a). ${doctor.full_name}${doctor.medical_license ? `  ·  ${doctor.medical_license}` : ""}`,
      sigX,
      y - 38,
      fonts,
      "regular",
      8,
      SLATE_700
    );
  }
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

  const { data: rxRaw, error } = await supabase
    .from("prescriptions")
    .select(
      `id, qr_code, notes, issued_at, expires_at, medications,
       doctor:profiles!prescriptions_doctor_id_fkey(
         full_name, email, phone, medical_license, specialty,
         clinic:clinics(name, address, phone, logo_url)
       ),
       patient:patients(
         date_of_birth, gender, id_number,
         profile:profiles!patients_profile_id_fkey(full_name, phone)
       )`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !rxRaw) {
    return new NextResponse("Receita não encontrada", { status: 404 });
  }

  const rx = rxRaw as RxRow;
  const doctor = pickOne(rx.doctor);
  const clinic = pickOne(doctor?.clinic ?? null);
  const patient = pickOne(rx.patient);
  const patientProfile = pickOne(patient?.profile ?? null);
  const meds = asMeds(rx.medications);
  const expired = rx.expires_at
    ? new Date(rx.expires_at).getTime() < Date.now()
    : false;

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Receita médica ${rx.qr_code}`);
  pdf.setAuthor(doctor?.full_name ?? "Lunga");
  pdf.setSubject("Receita médica · Medical Prescription");
  pdf.setCreator("Lunga");

  const fonts = await embedPdfFonts(pdf);

  const qrPngBytes = await QRCode.toBuffer(rx.qr_code, {
    type: "png",
    width: 320,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const qrImage = await pdf.embedPng(qrPngBytes);
  const logoImage = await pdf.embedPng(loadLogoBytes());

  // --------------------------------------------------------------------
  // Layout pass — write content first, decorate (header band, watermark)
  // after we know how many pages we ended up with.
  // --------------------------------------------------------------------
  const pages: PDFPage[] = [];
  let currentPage = pdf.addPage([A4.w, A4.h]);
  pages.push(currentPage);

  const contentTop = A4.h - HEADER_BAND_H - 32;
  let cursorY = contentTop;
  const innerWidth = A4.w - MARGIN * 2 - 40;

  // Identity block (first page only)
  cursorY = drawIdentityBlock(
    currentPage,
    fonts,
    doctor,
    clinic,
    patient,
    patientProfile,
    cursorY
  );

  cursorY = drawSectionHeader(
    currentPage,
    fonts,
    "MEDICAÇÃO PRESCRITA  ·  PRESCRIBED MEDICATIONS",
    cursorY
  );

  if (meds.length === 0) {
    drawText(currentPage, "—", MARGIN, cursorY, fonts, "regular", 10, SLATE_500);
    cursorY -= 18;
  } else {
    for (let i = 0; i < meds.length; i++) {
      const m = meds[i];
      const h = measureMedication(m, fonts, innerWidth);
      const minBottom = MARGIN + FOOTER_PHARMACY_H + 70;
      if (cursorY - h < minBottom) {
        currentPage = pdf.addPage([A4.w, A4.h]);
        pages.push(currentPage);
        cursorY = contentTop;
        cursorY = drawSectionHeader(
          currentPage,
          fonts,
          "MEDICAÇÃO (continuação)  ·  CONTINUED",
          cursorY
        );
      }
      cursorY = drawMedication(currentPage, fonts, m, i, cursorY, innerWidth);
    }
  }

  if (rx.notes) {
    const reserved = MARGIN + FOOTER_PHARMACY_H + 70;
    if (cursorY - 60 < reserved) {
      currentPage = pdf.addPage([A4.w, A4.h]);
      pages.push(currentPage);
      cursorY = contentTop;
    }
    cursorY -= 6;
    cursorY = drawSectionHeader(currentPage, fonts, "OBSERVAÇÕES  ·  NOTES", cursorY);
    cursorY = drawWrapped(
      currentPage,
      rx.notes,
      MARGIN,
      cursorY,
      A4.w - MARGIN * 2,
      fonts,
      "regular",
      10,
      SLATE_700,
      14
    );
  }

  const lastPage = currentPage;

  // Decorate every page — header band only (no full-page watermark, so
  // nothing is ever painted over the prescription text).
  pages.forEach((p, idx) => {
    drawHeaderBand(p, fonts, qrImage, logoImage, rx.qr_code, idx + 1, pages.length);
  });

  // Last-page extras: signature meta + pharmacy talão
  drawSignatureBlock(
    lastPage,
    fonts,
    { issued_at: rx.issued_at, expires_at: rx.expires_at },
    doctor,
    MARGIN + FOOTER_PHARMACY_H + 60
  );
  drawPharmacyFooter(lastPage, fonts, qrImage, rx.qr_code, rx.expires_at);

  // Expired stamp
  if (expired) {
    pages.forEach((p) => {
      p.drawText("RECEITA EXPIRADA", {
        x: A4.w / 2 - 130,
        y: A4.h / 2 - 12,
        font: fonts.bold,
        size: 32,
        color: RED_700,
        rotate: degrees(-18),
        opacity: 0.55,
      });
    });
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receita-${rx.qr_code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
