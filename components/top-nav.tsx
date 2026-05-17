import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";

export async function TopNav() {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-[0.2em] text-slate-950"
        >
          One2Choose
        </Link>

        <nav className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <Link href="/" className="rounded-full px-4 py-2 transition hover:bg-slate-100">
            Boutique
          </Link>
          {profile ? (
            <Link
              href="/account"
              className="rounded-full px-4 py-2 transition hover:bg-slate-100"
            >
              Mon espace
            </Link>
          ) : null}
          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-full px-4 py-2 transition hover:bg-slate-100"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href={profile ? "/account" : "/login"}
            className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800"
          >
            {profile ? profile.full_name ?? "Compte" : "Connexion"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
