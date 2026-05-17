import { redirect } from "next/navigation";
import { deleteProductAction, upsertProductAction } from "@/app/actions";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminTestOrderForm } from "@/components/admin-test-order-form";
import { getCurrentUser, isCurrentUserAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/catalog-server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getWhatsAppConfigError } from "@/lib/whatsapp";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-6xl flex-col px-6 py-12 lg:px-10">
        <h1 className="font-[family-name:var(--font-oswald)] text-5xl uppercase">
          Interface admin
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          L&apos;interface admin est prete, mais elle depend d&apos;un projet Supabase
          avec les tables et policies fournis dans `supabase/schema.sql`.
        </p>
      </main>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-5xl flex-col px-6 py-12 lg:px-10">
        <span className="w-fit rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">
          Acces refuse
        </span>
        <h1 className="mt-4 font-[family-name:var(--font-oswald)] text-5xl uppercase">
          Cette page est reservee aux administrateurs.
        </h1>
      </main>
    );
  }

  const products = await getProducts({ includeInactive: true });
  const whatsappConfigError = getWhatsAppConfigError();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl flex-col px-6 py-12 lg:px-10">
      <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
        Back-office
      </span>
      <h1 className="mt-4 font-[family-name:var(--font-oswald)] text-5xl uppercase leading-none sm:text-6xl">
        Catalogue, prix et tests operatoires
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
        Cet espace n&apos;apparait que pour les comptes admin. Vous pouvez ajouter,
        modifier ou supprimer des produits, puis lancer une commande test sans
        Stripe pour verifier le message fournisseur.
      </p>

      <section className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase">
            Commande test WhatsApp
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
              whatsappConfigError
                ? "border border-amber-200 bg-amber-50 text-amber-700"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {whatsappConfigError ? "Configuration requise" : "Pret"}
          </span>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Cette commande test enregistre une commande interne et tente d&apos;envoyer
          un message WhatsApp via Twilio, sans passer par Stripe.
        </p>
        {whatsappConfigError ? (
          <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
            {whatsappConfigError}. Quand vous me donnerez le numero test, il faudra le
            renseigner dans `WHATSAPP_TEST_TO`.
          </div>
        ) : null}
        <div className="mt-4">
          <AdminTestOrderForm
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              sizes: product.sizes,
              price: product.price,
            }))}
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase">
          Ajouter un produit
        </h2>
        <div className="mt-4">
          <AdminProductForm action={upsertProductAction} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase">
          Produits existants
        </h2>
        <div className="mt-4 grid gap-5">
          {products.map((product) => (
            <AdminProductForm
              key={product.id}
              product={product}
              action={upsertProductAction}
              deleteAction={deleteProductAction}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
