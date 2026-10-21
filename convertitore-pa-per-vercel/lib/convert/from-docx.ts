import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { applyPdfAMetadata, savePdf } from "./pdfa";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, FONT_SIZE) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export async function docxToPdf(input: Buffer, title: string): Promise<Uint8Array> {
  const { value } = await mammoth.extractRawText({ buffer: input });
  const paragraphs = value
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = () => {
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  if (paragraphs.length === 0) {
    page.drawText("Documento senza testo estraibile.", {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  } else {
    for (const paragraph of paragraphs) {
      const lines = wrapText(paragraph, font, maxWidth);
      for (const line of lines) {
        ensureSpace();
        page.drawText(line, {
          x: MARGIN,
          y,
          size: FONT_SIZE,
          font,
          color: rgb(0.12, 0.14, 0.18),
        });
        y -= LINE_HEIGHT;
      }
      y -= 8;
    }
  }

  await applyPdfAMetadata(pdf, title);
  return savePdf(pdf);
}
