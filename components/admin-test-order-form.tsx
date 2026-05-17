"use client";

import { useActionState, useState } from "react";
import {
  createAdminTestOrderAction,
  type AdminTestOrderState,
} from "@/app/actions";

type AdminTestOrderFormProps = {
  products: Array<{
    id: string;
    name: string;
    sizes: string[];
    price: number;
  }>;
};

const initialState: AdminTestOrderState = {
  error: null,
  success: null,
  previewUrl: null,
};

export function AdminTestOrderForm({ products }: AdminTestOrderFormProps) {
  const [state, formAction, pending] = useActionState(
    createAdminTestOrderAction,
    initialState,
  );
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [size, setSize] = useState(products[0]?.sizes[0] ?? "");

  const selectedProduct =
    products.find((product) => product.id === productId) ?? products[0] ?? null;

  if (!selectedProduct) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Aucun produit disponible pour lancer un test.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Produit test
          <select
            name="productId"
            value={productId}
            onChange={(event) => {
              const nextProduct =
                products.find((product) => product.id === event.target.value) ?? null;

              setProductId(event.target.value);
              setSize(nextProduct?.sizes[0] ?? "");
            }}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Pointure
          <select
            name="size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          >
            {selectedProduct.sizes.map((productSize) => (
              <option key={productSize} value={productSize}>
                {productSize}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="customerName"
          placeholder="Nom du client test"
          required
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
        <input
          name="customerEmail"
          type="email"
          placeholder="client@test.com"
          required
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <input
          name="customerPhone"
          type="tel"
          placeholder="+33600000000"
          required
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
        <input
          name="quantity"
          type="number"
          min="1"
          defaultValue="1"
          required
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
      </div>

      <textarea
        name="shippingAddress"
        placeholder="Adresse de livraison de test"
        required
        className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none"
      />

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}
      {state.previewUrl ? (
        <a
          href={state.previewUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-slate-700 underline underline-offset-4"
        >
          Ouvrir le message WhatsApp de test
        </a>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 disabled:opacity-50"
      >
        {pending ? "Envoi..." : "Lancer une commande test"}
      </button>
    </form>
  );
}
