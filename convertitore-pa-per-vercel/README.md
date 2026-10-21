# Convertitore PA

Applicazione Next.js (App Router) + Tailwind CSS per convertire documenti in PDF/A ottimizzati per la pubblica amministrazione italiana.

## Avvio

1. Installa Node.js LTS se non è già presente.
2. Copia `.env.example` in `.env.local` e inserisci le chiavi Supabase.
3. `npm install`
4. `npm run dev`

## API

`POST /api/convert` accetta `multipart/form-data` con:

- `file`: `.docx`, `.pdf`, `.jpg`, `.png`
- `preset`: `inps` | `agenzia` | `generico`
