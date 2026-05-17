import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20 text-slate-950">
      <span className="mb-4 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
        Paiement confirme
      </span>
      <h1 className="max-w-2xl font-[family-name:var(--font-oswald)] text-5xl uppercase leading-none sm:text-6xl">
        Commande recue, traitement automatique en cours.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
        Le paiement est valide. Le commerçant reçoit immédiatement un recapitulatif
        de commande et le fournisseur reçoit l&apos;instruction de livraison avec
        l&apos;adresse du client via le webhook Stripe.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Revenir a la boutique
        </Link>
      </div>
    </main>
  );
}
