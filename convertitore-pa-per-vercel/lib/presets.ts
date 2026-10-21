export const PRESETS = {
  inps: {
    id: "inps",
    label: "INPS e Concorsi Pubblici (PDF/A, max 2MB)",
    maxBytes: 2 * 1024 * 1024,
    pdfa: true,
  },
  agenzia: {
    id: "agenzia",
    label: "Agenzia delle Entrate (PDF/A, max 5MB)",
    maxBytes: 5 * 1024 * 1024,
    pdfa: true,
  },
  generico: {
    id: "generico",
    label: "Generico PA (PDF/A)",
    maxBytes: 25 * 1024 * 1024,
    pdfa: true,
  },
} as const;

export type PresetId = keyof typeof PRESETS;

export const PRESET_LIST = Object.values(PRESETS);

export const ACCEPTED_EXTENSIONS = [".docx", ".pdf", ".jpg", ".jpeg", ".png"] as const;

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
] as const;

export function isPresetId(value: string): value is PresetId {
  return value in PRESETS;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
