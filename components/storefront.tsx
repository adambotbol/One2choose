"use client";

import { useState, useTransition } from "react";
import { formatPrice, type Product } from "@/lib/catalog";

type CartItem = {
  productId: string;
  size: string;
  quantity: number;
};

type StorefrontProps = {
  checkoutReady: boolean;
  emailReady: boolean;
  products: Product[];
  supabaseReady: boolean;
};

export function Storefront({
  checkoutReady,
  emailReady,
  products,
  supabaseReady,
}: StorefrontProps) {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    Object.fromEntries(products.map((product) => [product.id, product.sizes[0] ?? ""])),
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const detailedCart = cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) {
        return null;
      }

      return {
        ...item,
        product,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const total = detailedCart.reduce((sum, item) => sum + item.lineTotal, 0);

  function addToCart(productId: string) {
    const size = selectedSizes[productId];

    if (!size) {
      return;
    }

    setCart((current) => {
      const existingItem = current.find(
        (item) => item.productId === productId && item.size === size,
      );

      if (existingItem) {
        return current.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { productId, size, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, size: string, quantity: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function handleCheckout() {
    setCheckoutError(null);

    startTransition(async () => {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart }),
      });

      const payload = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !payload.url) {
        setCheckoutError(
          payload.error ?? "Impossible de lancer le paiement pour le moment.",
        );
        return;
      }

      window.location.href = payload.url;
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.28),_transparent_28%),linear-gradient(135deg,_#fefce8,_#fff7ed_45%,_#ecfeff_100%)] text-slate-950">
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
        <div>
          <div className="rounded-[2rem] border border-white/60 bg-white/75 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">
                  One2Choose
                </p>
                <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-oswald)] text-5xl uppercase leading-none sm:text-7xl">
                  Boutique de chaussures avec logistique automatisee.
                </h1>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
                  Workflow
                </p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
                  1. Le client paie. 2. Vous recevez le recapitulatif. 3. Le
                  fournisseur recoit la commande avec l&apos;adresse.
                </p>
              </div>
            </div>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
              Cette version est concue pour un modele type dropshipping:
              encaissement en ligne via Stripe, notification marchand, puis
              instruction fournisseur automatique apres paiement confirme.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <StatusPill
                active={checkoutReady}
                label={checkoutReady ? "Stripe pret" : "Configurer Stripe"}
              />
              <StatusPill
                active={supabaseReady}
                label={supabaseReady ? "Supabase pret" : "Configurer Supabase"}
              />
              <StatusPill
                active={emailReady}
                label={emailReady ? "Emails prets" : "Configurer Resend"}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
              >
                <div
                  className="h-80 bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <div className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase leading-none">
                        {product.name}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {product.shortDescription}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      Pointure
                    </label>
                    <select
                      value={selectedSizes[product.id] ?? ""}
                      onChange={(event) =>
                        setSelectedSizes((current) => ({
                          ...current,
                          [product.id]: event.target.value,
                        }))
                      }
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-500"
                    >
                      {product.sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-800"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
              Panier
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-oswald)] text-4xl uppercase leading-none">
              Commande client
            </h2>

            <div className="mt-8 space-y-4">
              {detailedCart.length === 0 ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  Ajoutez une paire au panier pour tester le flux complet de
                  commande.
                </div>
              ) : (
                detailedCart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-slate-400">Pointure {item.size}</p>
                      </div>
                      <p className="text-sm font-semibold text-amber-300">
                        {formatPrice(item.lineTotal)}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity - 1)
                        }
                        className="h-9 w-9 rounded-full border border-white/10 text-lg"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity + 1)
                        }
                        className="h-9 w-9 rounded-full border border-white/10 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-white p-5 text-slate-950">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Total</span>
                <span>TVA incluse</span>
              </div>
              <p className="mt-3 font-[family-name:var(--font-oswald)] text-5xl uppercase leading-none">
                {formatPrice(total)}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Stripe recueille le paiement, l&apos;adresse de livraison et le
                telephone. Le webhook transmet ensuite la commande au fournisseur.
              </p>

              {checkoutError ? (
                <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {checkoutError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!checkoutReady || cart.length === 0 || isPending}
                className="mt-6 w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Redirection..." : "Payer maintenant"}
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
              <p>
                Auth + base: <code>SUPABASE</code>
              </p>
              <p>
                Email commercant: <code>MERCHANT_NOTIFICATION_EMAIL</code>
              </p>
              <p>
                Email fournisseur: <code>SUPPLIER_NOTIFICATION_EMAIL</code>
              </p>
              <p>
                Signature webhook: <code>STRIPE_WEBHOOK_SECRET</code>
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-white text-slate-500 ring-1 ring-slate-200"
      }`}
    >
      {label}
    </span>
  );
}
