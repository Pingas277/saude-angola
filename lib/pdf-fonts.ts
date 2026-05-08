// Shared font loader for PDF API routes.
// Roboto is bundled in lib/fonts/ and registered with pdf-lib via fontkit
// so the PDFs can use any Unicode glyph (arrows, scissors, check marks,
// Portuguese accented characters, …) — pdf-lib's StandardFonts only support
// WinAnsi which crashes on common UI glyphs.

import { PDFDocument, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFileSync } from "node:fs";
import path from "node:path";

const FONT_DIR = path.join(process.cwd(), "lib", "fonts");

let cached: { regular: Buffer; bold: Buffer; italic: Buffer } | null = null;

function loadFontBytes() {
  if (cached) return cached;
  cached = {
    regular: readFileSync(path.join(FONT_DIR, "Roboto-Regular.ttf")),
    bold: readFileSync(path.join(FONT_DIR, "Roboto-Bold.ttf")),
    italic: readFileSync(path.join(FONT_DIR, "Roboto-Italic.ttf")),
  };
  return cached;
}

export type PdfFonts = {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
};

export async function embedPdfFonts(pdf: PDFDocument): Promise<PdfFonts> {
  pdf.registerFontkit(fontkit);
  const bytes = loadFontBytes();
  return {
    regular: await pdf.embedFont(bytes.regular, { subset: true }),
    bold: await pdf.embedFont(bytes.bold, { subset: true }),
    italic: await pdf.embedFont(bytes.italic, { subset: true }),
  };
}
