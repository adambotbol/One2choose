import { Resend } from "resend";

type OrderLine = {
  description: string;
  quantity: number;
  amountTotal: number;
  currency: string;
};

type MerchantNotificationInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  currency: string;
  orderLines: OrderLine[];
};

type SupplierNotificationInput = Omit<MerchantNotificationInput, "customerEmail">;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

function renderLines(lines: OrderLine[]) {
  return lines
    .map(
      (line) =>
        `<li style="margin-bottom:8px;">${line.description} x${line.quantity} - ${formatAmount(
          line.amountTotal,
          line.currency,
        )}</li>`,
    )
    .join("");
}

export async function sendMerchantNotification(
  input: MerchantNotificationInput,
) {
  if (!resend || !process.env.MERCHANT_NOTIFICATION_EMAIL) {
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "One2Choose <onboarding@resend.dev>",
    to: process.env.MERCHANT_NOTIFICATION_EMAIL,
    subject: `Nouvelle commande payee ${input.orderId}`,
    html: `
      <h1>Nouvelle commande payee</h1>
      <p><strong>Commande:</strong> ${input.orderId}</p>
      <p><strong>Client:</strong> ${input.customerName}</p>
      <p><strong>Email:</strong> ${input.customerEmail}</p>
      <p><strong>Telephone:</strong> ${input.customerPhone}</p>
      <p><strong>Livraison:</strong> ${input.shippingAddress}</p>
      <p><strong>Total:</strong> ${formatAmount(input.totalAmount, input.currency)}</p>
      <h2>Articles</h2>
      <ul>${renderLines(input.orderLines)}</ul>
      <p>Ce message peut servir de recapitulatif marchand. Pour une facture legale client, utilisez le module facture de votre PSP ou ERP.</p>
    `,
  });
}

export async function sendSupplierNotification(
  input: SupplierNotificationInput,
) {
  if (!resend || !process.env.SUPPLIER_NOTIFICATION_EMAIL) {
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "One2Choose <onboarding@resend.dev>",
    to: process.env.SUPPLIER_NOTIFICATION_EMAIL,
    subject: `Commande fournisseur a expedier ${input.orderId}`,
    html: `
      <h1>Nouvelle commande a expedier</h1>
      <p><strong>Commande:</strong> ${input.orderId}</p>
      <p><strong>Destinataire:</strong> ${input.customerName}</p>
      <p><strong>Telephone:</strong> ${input.customerPhone}</p>
      <p><strong>Adresse de livraison:</strong> ${input.shippingAddress}</p>
      <p><strong>Total encaisse:</strong> ${formatAmount(input.totalAmount, input.currency)}</p>
      <h2>Articles a preparer</h2>
      <ul>${renderLines(input.orderLines)}</ul>
    `,
  });
}
