"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Props = {
  email: string | null;
};

export function LoginButton({ email }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (!isSupabaseConfigured()) return;
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (email) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden max-w-48 truncate text-sm text-slate-600 sm:inline">{email}</span>
        <button
          type="button"
          onClick={logout}
          disabled={busy}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          Esci
        </button>
      </div>
    );
  }

  return (
    <a
      href="/login"
      className="rounded-full bg-[var(--pa-blue)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--pa-blue-dark)]"
    >
      Login
    </a>
  );
}
