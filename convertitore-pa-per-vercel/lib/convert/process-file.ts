import { PRESETS, type PresetId } from "@/lib/presets";
import { docxToPdf } from "./from-docx";
import { imageToPdf } from "./from-image";
import { normalizePdf } from "./from-pdf";

export type ConvertResult = {
  pdf: Uint8Array;
  originalSize: number;
  optimizedSize: number;
  compliant: boolean;
  filename: string;
  preset: PresetId;
};

function detectKind(file: File): "pdf" | "docx" | "jpeg" | "png" {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }
  if (type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpeg";
  if (type === "image/png" || name.endsWith(".png")) return "png";

  throw new Error("Formato non supportato. Carica un file .docx, .pdf, .jpg o .png.");
}

function outputName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "documento";
  return `${base}-PA.pdf`;
}

export async function processFile(file: File, presetId: PresetId): Promise<ConvertResult> {
  const preset = PRESETS[presetId];
  const originalSize = file.size;
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detectKind(file);
  const title = `${file.name} — ${preset.label}`;

  let pdf: Uint8Array;
  switch (kind) {
    case "jpeg":
      pdf = await imageToPdf(buffer, "jpeg", title, preset.maxBytes);
      break;
    case "png":
      pdf = await imageToPdf(buffer, "png", title, preset.maxBytes);
      break;
    case "docx":
      pdf = await docxToPdf(buffer, title);
      break;
    case "pdf":
      pdf = await normalizePdf(buffer, title);
      break;
    default:
      throw new Error("Formato non gestito.");
  }

  const optimizedSize = pdf.byteLength;
  const compliant = optimizedSize <= preset.maxBytes;

  if (!compliant && (kind === "docx" || kind === "pdf")) {
    throw new Error(
      `Il PDF risultante pesa ${(optimizedSize / (1024 * 1024)).toFixed(2)} MB e supera il limite del preset (${(preset.maxBytes / (1024 * 1024)).toFixed(0)} MB). Riduci il documento o scegli un preset con tetto più alto.`,
    );
  }

  if (!compliant) {
    throw new Error(
      `Impossibile scendere sotto il limite di ${(preset.maxBytes / (1024 * 1024)).toFixed(0)} MB mantenendo un PDF/A leggibile.`,
    );
  }

  return {
    pdf,
    originalSize,
    optimizedSize,
    compliant,
    filename: outputName(file.name),
    preset: presetId,
  };
}
