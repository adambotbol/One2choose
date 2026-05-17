import { Storefront } from "@/components/storefront";
import { getProducts } from "@/lib/catalog-server";

export default async function HomePage() {
  const products = await getProducts();
  const checkoutReady = Boolean(process.env.STRIPE_SECRET_KEY);
  const emailReady = Boolean(
    process.env.RESEND_API_KEY &&
      process.env.MERCHANT_NOTIFICATION_EMAIL &&
      process.env.SUPPLIER_NOTIFICATION_EMAIL,
  );
  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return (
    <Storefront
      checkoutReady={checkoutReady}
      emailReady={emailReady}
      products={products}
      supabaseReady={supabaseReady}
    />
  );
}
