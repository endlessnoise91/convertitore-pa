import { Logo } from "@/components/Logo";
import { LoginButton } from "@/components/LoginButton";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="h-1 w-full bg-[linear-gradient(90deg,#009246_0_33%,#f1f2f1_33%_66%,#ce2b37_66%_100%)]" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <LoginButton email={user?.email ?? null} />
      </div>
    </header>
  );
}
