import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getProductById } from "@/lib/catalog-server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CheckoutItem = {
  productId: string;
  quantity: number;
  size: string;
};

type CheckoutPayload = {
  items?: CheckoutItem[];
};

function getBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY n'est pas configure." },
      { status: 500 },
    );
  }

  const { items } = (await request.json()) as CheckoutPayload;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Votre panier est vide." }, { status: 400 });
  }

  const validatedItems = (
    await Promise.all(
      items.map(async (item) => {
        const product = await getProductById(item.productId);

        if (!product || !product.sizes.includes(item.size) || item.quantity < 1) {
          return null;
        }

        return {
          item,
          product,
        };
      }),
    )
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (validatedItems.length !== items.length) {
    return NextResponse.json(
      { error: "Certains articles du panier sont invalides." },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

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
    success_url: `${getBaseUrl(request)}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl(request)}/cancel`,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["FR", "BE", "DE", "LU", "NL", "ES", "IT"],
    },
    phone_number_collection: {
      enabled: true,
    },
    shipping_options: shippingRates,
    customer_email: user?.email,
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
      userId: user?.id ?? "",
    },
  });

  return NextResponse.json({ url: session.url });
}
