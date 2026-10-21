import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { applyPdfAMetadata, savePdf } from "./pdfa";

type ImageKind = "jpeg" | "png";

async function encodeImage(
  input: Buffer,
  kind: ImageKind,
  quality: number,
  maxEdge: number,
): Promise<{ bytes: Buffer; width: number; height: number; jpeg: boolean }> {
  let pipeline = sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    });

  if (kind === "png" && quality >= 90) {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    return { bytes: data, width: info.width, height: info.height, jpeg: false };
  }

  pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { bytes: data, width: info.width, height: info.height, jpeg: true };
}

export async function imageToPdf(
  input: Buffer,
  kind: ImageKind,
  title: string,
  maxBytes: number,
): Promise<Uint8Array> {
  const qualities = [82, 70, 58, 46, 36, 28];
  const maxEdges = [1600, 1400, 1200, 1000, 850, 700];
  let last: Uint8Array | null = null;

  for (let i = 0; i < qualities.length; i += 1) {
    const encoded = await encodeImage(input, kind, qualities[i], maxEdges[i]);
    const pdf = await PDFDocument.create();
    const embedded = encoded.jpeg
      ? await pdf.embedJpg(encoded.bytes)
      : await pdf.embedPng(encoded.bytes);

    const page = pdf.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    });

    await applyPdfAMetadata(pdf, title);
    last = await savePdf(pdf);
    if (last.byteLength <= maxBytes) return last;
  }

  if (!last) {
    throw new Error("Impossibile generare il PDF dall'immagine.");
  }
  return last;
}
