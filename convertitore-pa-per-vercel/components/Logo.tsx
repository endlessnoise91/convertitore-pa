export function Logo() {
  return (
    <a href="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--pa-blue)] text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M7 3.5h7.2L19 8.2V20a.5.5 0 0 1-.5.5H7.5A.5.5 0 0 1 7 20V3.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M14.2 3.5V8H19" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.5 12.5h5M9.5 15.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight text-slate-900">Convertitore PA</span>
        <span className="block text-xs text-slate-500">PDF/A per la burocrazia italiana</span>
      </span>
    </a>
  );
}
