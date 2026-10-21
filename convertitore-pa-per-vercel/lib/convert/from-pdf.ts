import { PDFDocument } from "pdf-lib";
import { applyPdfAMetadata, savePdf } from "./pdfa";

export async function normalizePdf(input: Buffer, title: string): Promise<Uint8Array> {
  const source = await PDFDocument.load(input, { ignoreEncryption: true });
  const pdf = await PDFDocument.create();
  const pages = await pdf.copyPages(source, source.getPageIndices());
  pages.forEach((page) => pdf.addPage(page));
  await applyPdfAMetadata(pdf, title);
  return savePdf(pdf);
}
