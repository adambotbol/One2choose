import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getProductById } from "@/lib/products";

type CheckoutItem = {
  productId: string;
  quantity: number;
  size: string;
};

type CheckoutPayload = {
  items?: CheckoutItem[];
};

function getBaseUrl(request: Request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 500 },
    );
  }

  const { items } = (await request.json()) as CheckoutPayload;

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: "Your cart is empty." },
      { status: 400 },
    );
  }

  const validatedItems = items
    .map((item) => {
      const product = getProductById(item.productId);

      if (!product || !product.sizes.includes(item.size) || item.quantity < 1) {
        return null;
      }

      return {
        item,
        product,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (validatedItems.length !== items.length) {
    return NextResponse.json(
      { error: "Some cart items are invalid." },
      { status: 400 },
    );
  }

  const baseUrl = getBaseUrl(request);

  const shippingRates: Stripe.Checkout.SessionCreateParams["shipping_options"] = [
    {
      shipping_rate_data: {
        display_name: "Livraison standard",
        type: "fixed_amount",
        fixed_amount: {
          amount: 0,
          currency: "eur",
        },
        delivery_estimate: {
          minimum: { unit: "business_day", value: 3 },
          maximum: { unit: "business_day", value: 6 },
        },
      },
    },
  ];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["FR", "BE", "DE", "LU", "NL", "ES", "IT"],
    },
    phone_number_collection: {
      enabled: true,
    },
    shipping_options: shippingRates,
    line_items: validatedItems.map(({ item, product }) => ({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: product.price,
        product_data: {
          name: `${product.name} - Pointure ${item.size}`,
          description: product.shortDescription,
          images: [product.image],
          metadata: {
            productId: product.id,
            size: item.size,
          },
        },
      },
    })),
    metadata: {
      source: "one2choose-storefront",
    },
  });

  return NextResponse.json({ url: session.url });
}
