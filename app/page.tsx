import { Storefront } from "@/components/storefront";
import { products } from "@/lib/products";

export default function Home() {
  const checkoutReady = Boolean(process.env.STRIPE_SECRET_KEY);
  const emailReady = Boolean(
    process.env.RESEND_API_KEY &&
      process.env.MERCHANT_NOTIFICATION_EMAIL &&
      process.env.SUPPLIER_NOTIFICATION_EMAIL,
  );

  return (
    <Storefront
      checkoutReady={checkoutReady}
      emailReady={emailReady}
      products={products}
    />
  );
}
