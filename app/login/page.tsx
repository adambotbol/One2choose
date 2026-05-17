import { redirect } from "next/navigation";
import { LoginForms } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/account");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-6xl flex-col px-6 py-12 lg:px-10">
      <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
        Espace client
      </span>
      <h1 className="mt-4 font-[family-name:var(--font-oswald)] text-5xl uppercase leading-none sm:text-6xl">
        Comptes Supabase pour vos clients
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
        Chaque client peut se connecter, consulter son espace personnel et suivre
        ses commandes. L&apos;authentification repose sur Supabase Auth.
      </p>

      {!isSupabaseConfigured() ? (
        <div className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
          Renseignez d&apos;abord les variables Supabase dans l&apos;environnement pour
          activer la creation de comptes et la connexion.
        </div>
      ) : null}

      <div className="mt-10">
        <LoginForms />
      </div>
    </main>
  );
}
