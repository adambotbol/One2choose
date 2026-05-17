import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20 text-slate-950">
      <span className="mb-4 w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
        Paiement annule
      </span>
      <h1 className="max-w-2xl font-[family-name:var(--font-oswald)] text-5xl uppercase leading-none sm:text-6xl">
        Le panier est conserve, aucune commande n&apos;a ete envoyee.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
        Le fournisseur n&apos;est contacte qu&apos;apres confirmation du paiement par
        Stripe. Vous pouvez relancer le checkout quand vous voulez.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Retour au catalogue
        </Link>
      </div>
    </main>
  );
}
