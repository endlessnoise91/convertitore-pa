import { NextResponse } from "next/server";
import { isPresetId } from "@/lib/presets";
import { processFile } from "@/lib/convert/process-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const preset = formData.get("preset");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Carica un file valido." }, { status: 400 });
    }

    if (typeof preset !== "string" || !isPresetId(preset)) {
      return NextResponse.json({ error: "Seleziona un preset PA valido." }, { status: 400 });
    }

    const result = await processFile(file, preset);

    return NextResponse.json({
      originalSize: result.originalSize,
      optimizedSize: result.optimizedSize,
      compliant: result.compliant,
      filename: result.filename,
      preset: result.preset,
      pdfBase64: Buffer.from(result.pdf).toString("base64"),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore durante la conversione del documento.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
