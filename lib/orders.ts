import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PersistOrderItemInput = {
  productId: string | null;
  productName: string;
  size: string | null;
  quantity: number;
  unitPriceCents: number;
  currency: string;
};

export type PersistOrderInput = {
  externalId: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  status: string;
  currency?: string;
  items: PersistOrderItemInput[];
};

export async function persistOrder(input: PersistOrderInput) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin n'est pas configure.");
  }

  const totalAmountCents = input.items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const currency = input.currency ?? "EUR";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        user_id: input.userId ?? null,
        stripe_session_id: input.externalId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone ?? null,
        shipping_address: input.shippingAddress,
        total_amount_cents: totalAmountCents,
        currency,
        status: input.status,
      },
      {
        onConflict: "stripe_session_id",
      },
    )
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Impossible d'enregistrer la commande.");
  }

  const { error: deleteItemsError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", order.id);

  if (deleteItemsError) {
    throw new Error(deleteItemsError.message);
  }

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.productName,
    size: item.size,
    quantity: item.quantity,
    unit_price_cents: item.unitPriceCents,
    total_price_cents: item.unitPriceCents * item.quantity,
    currency: item.currency,
  }));

  const { error: insertItemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (insertItemsError) {
    throw new Error(insertItemsError.message);
  }

  return {
    orderId: order.id,
    totalAmountCents,
    currency,
  };
}
