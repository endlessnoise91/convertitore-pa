"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!configured) return;
    setBusy(true);
    setMessage(null);

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage("Controlla la casella email per confermare l'account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Accesso non riuscito.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
      <p className="mt-2 text-sm text-slate-600">
        Accedi con Supabase Auth per associare le conversioni al tuo account.
      </p>

      {!configured ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Copia <code>.env.example</code> in <code>.env.local</code> e inserisci URL e anon key del progetto
          Supabase.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-[var(--pa-blue)] focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-[var(--pa-blue)] focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !configured}
          className="w-full rounded-xl bg-[var(--pa-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--pa-blue-dark)] disabled:opacity-60"
        >
          {busy ? "Attendere…" : mode === "signin" ? "Accedi" : "Registrati"}
        </button>
      </form>

      <button
        type="button"
        className="mt-4 text-sm text-[var(--pa-blue)] underline-offset-2 hover:underline"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
      </button>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
