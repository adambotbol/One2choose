import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sendMerchantNotification, sendSupplierNotification } from "@/lib/notifications";
import { persistOrder } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

function formatStripeAddress(
  address: Stripe.Address | null | undefined,
  name?: string | null,
) {
  const lines = [
    name ?? null,
    address?.line1 ?? null,
    address?.line2 ?? null,
    [address?.postal_code, address?.city].filter(Boolean).join(" ") || null,
    address?.country ?? null,
  ].filter(Boolean);

  return lines.join(", ");
}

function isStripeProduct(
  product: string | Stripe.Product | Stripe.DeletedProduct | null | undefined,
): product is Stripe.Product {
  return Boolean(product && typeof product !== "string" && !("deleted" in product));
}

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook non configure." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Signature Stripe invalide.",
      },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });
  const shippingDetails = session.collected_information?.shipping_details;

  const currency = (session.currency ?? "eur").toUpperCase();
  const customerName =
    session.customer_details?.name ??
    shippingDetails?.name ??
    "Client One2Choose";
  const customerEmail = session.customer_details?.email ?? "";
  const customerPhone = session.customer_details?.phone ?? "";
  const shippingAddress = formatStripeAddress(
    shippingDetails?.address ?? session.customer_details?.address,
    shippingDetails?.name ?? session.customer_details?.name,
  );

  const items = lineItems.data.map((lineItem) => {
    const product = lineItem.price?.product;
    const stripeProduct = isStripeProduct(product) ? product : null;
    const size = stripeProduct?.metadata.size ?? null;

    return {
      productId: stripeProduct?.metadata.productId ?? null,
      productName:
        stripeProduct?.name ?? lineItem.description ?? "Produit One2Choose",
      size,
      quantity: lineItem.quantity ?? 1,
      unitPriceCents: lineItem.price?.unit_amount ?? 0,
      currency,
    };
  });

  await persistOrder({
    externalId: session.id,
    userId: session.metadata?.userId || null,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    status: "paid",
    currency,
    items,
  });

  const notificationLines = items.map((item) => ({
    description: `${item.productName}${item.size ? ` - Pointure ${item.size}` : ""}`,
    quantity: item.quantity,
    amountTotal: (item.unitPriceCents * item.quantity) / 100,
    currency,
  }));
  const totalAmount = (session.amount_total ?? 0) / 100;

  await Promise.all([
    sendMerchantNotification({
      orderId: session.id,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      totalAmount,
      currency,
      orderLines: notificationLines,
    }),
    sendSupplierNotification({
      orderId: session.id,
      customerName,
      customerPhone,
      shippingAddress,
      totalAmount,
      currency,
      orderLines: notificationLines,
    }),
  ]);

  return NextResponse.json({ received: true });
}
