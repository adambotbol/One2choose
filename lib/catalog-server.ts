import { mapProduct, seedProducts } from "@/lib/catalog";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  price_cents: number;
  image_url: string;
  sizes: string[];
  is_active: boolean;
};

export async function getProducts(options?: { includeInactive?: boolean }) {
  const includeInactive = options?.includeInactive ?? false;

  if (!isSupabaseConfigured()) {
    return includeInactive ? seedProducts : seedProducts.filter((product) => product.isActive);
  }

  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return includeInactive ? seedProducts : seedProducts.filter((product) => product.isActive);
    }

    let query = supabase
      .from("products")
      .select("id, slug, name, short_description, price_cents, image_url, sizes, is_active")
      .order("created_at", { ascending: false });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error || !data) {
      return includeInactive ? seedProducts : seedProducts.filter((product) => product.isActive);
    }

    return data.map((row) => mapProduct(row as ProductRow));
  } catch {
    return includeInactive ? seedProducts : seedProducts.filter((product) => product.isActive);
  }
}

export async function getProductById(productId: string) {
  const products = await getProducts({ includeInactive: true });
  return products.find((product) => product.id === productId);
}
