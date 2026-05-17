import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sendMerchantNotification, sendSupplierNotification } from "@/lib/notifications";
import { stripe } from "@/lib/stripe";

function formatAddress(address?: Stripe.Address | null) {
  if (!address) {
    return "Adresse non fournie";
  }

  return [
    address.line1,
    address.line2,
    `${address.postal_code ?? ""} ${address.city ?? ""}`.trim(),
    address.state,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

async function buildOrderLines(sessionId: string) {
  if (!stripe) {
    return [];
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    expand: ["data.price.product"],
  });

  return lineItems.data.map((line) => ({
    description: line.description ?? "Produit",
    quantity: line.quantity ?? 0,
    amountTotal: (line.amount_total ?? 0) / 100,
    currency: (line.currency ?? "eur").toUpperCase(),
  }));
}

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature." },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderLines = await buildOrderLines(session.id);
    const shippingAddress = formatAddress(session.customer_details?.address);
    const customerName = session.customer_details?.name ?? "Client";
    const customerEmail = session.customer_details?.email ?? "Email non fourni";
    const customerPhone = session.customer_details?.phone ?? "Telephone non fourni";
    const totalAmount = (session.amount_total ?? 0) / 100;
    const currency = (session.currency ?? "eur").toUpperCase();

    await Promise.all([
      sendMerchantNotification({
        currency,
        customerEmail,
        customerName,
        customerPhone,
        orderId: session.id,
        orderLines,
        shippingAddress,
        totalAmount,
      }),
      sendSupplierNotification({
        currency,
        customerName,
        customerPhone,
        orderId: session.id,
        orderLines,
        shippingAddress,
        totalAmount,
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
