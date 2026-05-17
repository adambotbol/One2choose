type WhatsAppLine = {
  productName: string;
  size: string;
  quantity: number;
};

type SendWhatsAppTestMessageInput = {
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  lines: WhatsAppLine[];
};

const DEFAULT_WHATSAPP_TEST_TO = "0607459722";

function normalizePhoneNumber(value: string) {
  const digits = value.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    return digits;
  }

  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }

  if (digits.startsWith("0")) {
    return `+33${digits.slice(1)}`;
  }

  return `+${digits}`;
}

function normalizeWhatsAppAddress(value: string) {
  const raw = value.startsWith("whatsapp:") ? value.slice("whatsapp:".length) : value;
  return `whatsapp:${normalizePhoneNumber(raw)}`;
}

function toWaNumber(value: string) {
  return normalizePhoneNumber(value.replace(/^whatsapp:/, "")).replace(/[^\d]/g, "");
}

function buildMessage(input: SendWhatsAppTestMessageInput) {
  const products = input.lines
    .map(
      (line) =>
        `- ${line.productName} | pointure ${line.size} | quantite ${line.quantity}`,
    )
    .join("\n");

  return [
    "Commande test One2Choose",
    `Reference: ${input.orderReference}`,
    `Client: ${input.customerName}`,
    `Email: ${input.customerEmail}`,
    `Telephone: ${input.customerPhone}`,
    `Adresse: ${input.shippingAddress}`,
    "Produits:",
    products,
  ].join("\n");
}

export function getWhatsAppConfigError() {
  const missingVars = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_WHATSAPP_FROM",
  ].filter((key) => !process.env[key]);

  if (missingVars.length === 0) {
    return null;
  }

  return `Configuration WhatsApp manquante: ${missingVars.join(", ")}`;
}

export async function sendWhatsAppTestMessage(
  input: SendWhatsAppTestMessageInput,
) {
  const configError = getWhatsAppConfigError();
  const recipient = process.env.WHATSAPP_TEST_TO ?? DEFAULT_WHATSAPP_TEST_TO;
  const message = buildMessage(input);
  const previewUrl = recipient
    ? `https://wa.me/${toWaNumber(recipient)}?text=${encodeURIComponent(message)}`
    : null;

  if (configError) {
    return {
      delivered: false,
      error: configError,
      previewUrl,
    };
  }

  const body = new URLSearchParams({
    From: normalizeWhatsAppAddress(process.env.TWILIO_WHATSAPP_FROM!),
    To: normalizeWhatsAppAddress(recipient),
    Body: message,
  });

  const authorization = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID!}:${process.env.TWILIO_AUTH_TOKEN!}`,
  ).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const details = await response.text();

    return {
      delivered: false,
      error: `Twilio a refuse l'envoi WhatsApp: ${details}`,
      previewUrl,
    };
  }

  return {
    delivered: true,
    error: null,
    previewUrl,
  };
}

export function getWhatsAppTestRecipient() {
  return normalizePhoneNumber(process.env.WHATSAPP_TEST_TO ?? DEFAULT_WHATSAPP_TEST_TO);
}
