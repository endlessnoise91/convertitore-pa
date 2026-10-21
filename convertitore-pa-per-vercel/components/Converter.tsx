"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ACCEPTED_EXTENSIONS, PRESET_LIST, formatBytes, type PresetId } from "@/lib/presets";

type ConvertResponse = {
  originalSize: number;
  optimizedSize: number;
  compliant: boolean;
  filename: string;
  preset: PresetId;
  pdfBase64?: string;
  error?: string;
};

function isAcceptedFile(file: File) {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function Converter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<PresetId>("inps");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResponse | null>(null);

  const accept = useMemo(() => ACCEPTED_EXTENSIONS.join(","), []);

  const onFiles = useCallback((list: FileList | null) => {
    const next = list?.[0];
    setError(null);
    setResult(null);
    if (!next) return;
    if (!isAcceptedFile(next)) {
      setFile(null);
      setError("Formato non supportato. Usa .docx, .pdf, .jpg o .png.");
      return;
    }
    setFile(next);
  }, []);

  async function convert() {
    if (!file) {
      setError("Carica un documento prima di convertire.");
      return;
    }

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const body = new FormData();
      body.set("file", file);
      body.set("preset", preset);

      const response = await fetch("/api/convert", { method: "POST", body });
      const data = (await response.json()) as ConvertResponse;

      if (!response.ok || !data.pdfBase64) {
        throw new Error(data.error ?? "Conversione non riuscita.");
      }

      setResult(data);

      const bytes = Uint8Array.from(atob(data.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
          dragging
            ? "border-[var(--pa-blue)] bg-sky-50"
            : "border-slate-300 bg-white hover:border-[var(--pa-blue)] hover:bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onFiles(event.target.files)}
        />
        <p className="text-base font-medium text-slate-900">Trascina qui il documento</p>
        <p className="mt-2 text-sm text-slate-500">oppure clicca per selezionare un file</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
          .docx · .pdf · .jpg · .png
        </p>
        {file ? (
          <p className="mt-5 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {file.name} · {formatBytes(file.size)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Preset amministrazione</span>
          <select
            value={preset}
            onChange={(event) => setPreset(event.target.value as PresetId)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none ring-[var(--pa-blue)] transition focus:ring-2"
          >
            {PRESET_LIST.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={convert}
          disabled={busy}
          className="rounded-xl bg-[var(--pa-blue)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--pa-blue-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Elaborazione…" : "Ottimizza e Converti per PA"}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {result ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Esito conversione</h2>
              <p className="mt-1 text-sm text-slate-500">{result.filename}</p>
            </div>
            {result.compliant ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Conforme PA
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                Non conforme
              </span>
            )}
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">File originale</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">{formatBytes(result.originalSize)}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">PDF ottimizzato</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">{formatBytes(result.optimizedSize)}</dd>
            </div>
          </dl>
        </article>
      ) : null}
    </div>
  );
}
