export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  price: number;
  image: string;
  sizes: string[];
  isActive: boolean;
};

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

export const seedProducts: Product[] = [
  {
    id: "urban-echo",
    slug: "urban-echo",
    name: "Urban Echo",
    shortDescription:
      "Sneaker premium a silhouette retro, semelle souple et finition cuir sable.",
    price: 12900,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    sizes: ["40", "41", "42", "43", "44"],
    isActive: true,
  },
  {
    id: "run-club",
    slug: "run-club",
    name: "Run Club",
    shortDescription:
      "Modele sport lifestyle respirant, pense pour la marche et les longues journees.",
    price: 9900,
    image:
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80",
    sizes: ["39", "40", "41", "42", "43"],
    isActive: true,
  },
  {
    id: "desert-line",
    slug: "desert-line",
    name: "Desert Line",
    shortDescription:
      "Boot casual a empeigne structuree, ideal pour une gamme urbaine plus premium.",
    price: 14900,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
    sizes: ["41", "42", "43", "44", "45"],
    isActive: true,
  },
];

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    price: row.price_cents,
    image: row.image_url,
    sizes: row.sizes,
    isActive: row.is_active,
  };
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 100);
}
