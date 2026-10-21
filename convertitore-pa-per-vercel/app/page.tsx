import { Converter } from "@/components/Converter";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--pa-blue)]">
          Burocrazia italiana
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Converti i documenti in PDF/A pronti per la PA
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Ottimizza dimensioni e formato per INPS, concorsi pubblici, Agenzia delle Entrate e invii generici alla
          pubblica amministrazione.
        </p>
      </section>
      <Converter />
    </div>
  );
}
