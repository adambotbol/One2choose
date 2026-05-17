type AdminProductFormProps = {
  product?: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    price: number;
    image: string;
    sizes: string[];
    isActive: boolean;
  };
  action: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
};

export function AdminProductForm({
  product,
  action,
  deleteAction,
}: AdminProductFormProps) {
  return (
    <form
      action={action}
      className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]"
    >
      <input type="hidden" name="id" defaultValue={product?.id ?? ""} />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="slug"
          defaultValue={product?.slug ?? ""}
          placeholder="slug-produit"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          required
        />
        <input
          name="name"
          defaultValue={product?.name ?? ""}
          placeholder="Nom du produit"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          required
        />
      </div>
      <textarea
        name="shortDescription"
        defaultValue={product?.shortDescription ?? ""}
        placeholder="Description courte"
        className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        required
      />
      <div className="grid gap-3 md:grid-cols-3">
        <input
          name="priceEuros"
          defaultValue={product ? (product.price / 100).toFixed(2) : ""}
          placeholder="129.00"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          required
        />
        <input
          name="imageUrl"
          defaultValue={product?.image ?? ""}
          placeholder="https://..."
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          required
        />
        <input
          name="sizes"
          defaultValue={product?.sizes.join(",") ?? ""}
          placeholder="40,41,42,43"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={product?.isActive ?? true}
          className="h-4 w-4"
        />
        Produit actif
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="w-fit rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white"
        >
          {product ? "Mettre a jour" : "Ajouter le produit"}
        </button>
        {product && deleteAction ? (
          <button
            type="submit"
            formAction={deleteAction}
            className="w-fit rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-rose-700"
          >
            Supprimer
          </button>
        ) : null}
      </div>
    </form>
  );
}
