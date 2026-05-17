import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth-forms";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-5xl flex-col px-6 py-12 lg:px-10">
        <h1 className="font-[family-name:var(--font-oswald)] text-5xl uppercase">
          Espace client
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Cet espace sera alimente par Supabase des que le projet et ses cles
          seront configures.
        </p>
      </main>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();
  const supabase = await createServerSupabaseClient();

  const { data: orders } = supabase
    ? await supabase
        .from("orders")
        .select("id, customer_name, status, total_amount_cents, currency, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-6xl flex-col px-6 py-12 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Connecte
          </span>
          <h1 className="mt-4 font-[family-name:var(--font-oswald)] text-5xl uppercase leading-none sm:text-6xl">
            Bonjour {profile?.full_name ?? user.email}
          </h1>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase">
            Mon profil
          </h2>
          <dl className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
            <div>
              <dt className="font-semibold text-slate-950">Email</dt>
              <dd>{profile?.email ?? user.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Role</dt>
              <dd>{profile?.role ?? "customer"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Identifiant client</dt>
              <dd className="break-all">{user.id}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase">
            Mes commandes
          </h2>
          <div className="mt-6 space-y-4">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{order.customer_name}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-950">
                        {formatPrice(order.total_amount_cents)}
                      </p>
                      <p className="text-sm uppercase tracking-[0.15em] text-slate-500">
                        {order.status}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                Aucune commande rattachee a ce compte pour le moment.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
