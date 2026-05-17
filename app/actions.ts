"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProductById } from "@/lib/catalog-server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { persistOrder } from "@/lib/orders";
import { getBaseUrl } from "@/lib/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { sendWhatsAppTestMessage } from "@/lib/whatsapp";

export type AuthActionState = {
  error: string | null;
  success: string | null;
};

export type AdminTestOrderState = {
  error: string | null;
  success: string | null;
  previewUrl: string | null;
};

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function assertAdminAccess() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase n'est pas configure.");
  }

  const allowed = await isCurrentUserAdmin();

  if (!allowed) {
    throw new Error("Acces admin requis.");
  }
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Supabase n'est pas encore configure.",
      success: null,
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      error: "Client Supabase indisponible.",
      success: null,
    };
  }

  const email = getText(formData, "email");
  const password = getText(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  redirect("/account");
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Supabase n'est pas encore configure.",
      success: null,
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      error: "Client Supabase indisponible.",
      success: null,
    };
  }

  const fullName = getText(formData, "fullName");
  const email = getText(formData, "email");
  const password = getText(formData, "password");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${getBaseUrl()}/auth/confirm?next=/account`,
    },
  });

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  return {
    error: null,
    success:
      "Compte cree. Verifiez votre email pour confirmer l'inscription si Supabase exige la validation.",
  };
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function upsertProductAction(formData: FormData) {
  await assertAdminAccess();

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Client Supabase admin indisponible.");
  }

  const id = getText(formData, "id");
  const slug = getText(formData, "slug");
  const name = getText(formData, "name");
  const shortDescription = getText(formData, "shortDescription");
  const imageUrl = getText(formData, "imageUrl");
  const sizes = getText(formData, "sizes")
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
  const isActive = formData.get("isActive") === "on";
  const priceEuros = Number.parseFloat(getText(formData, "priceEuros"));

  if (!slug || !name || !shortDescription || !imageUrl || sizes.length === 0) {
    throw new Error("Tous les champs produit sont requis.");
  }

  if (Number.isNaN(priceEuros) || priceEuros <= 0) {
    throw new Error("Le prix doit etre positif.");
  }

  const payload = {
    slug,
    name,
    short_description: shortDescription,
    image_url: imageUrl,
    sizes,
    is_active: isActive,
    price_cents: Math.round(priceEuros * 100),
  };

  const query = id
    ? supabase.from("products").update(payload).eq("id", id)
    : supabase.from("products").insert(payload);

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProductAction(formData: FormData) {
  await assertAdminAccess();

  const supabase = createSupabaseAdminClient();
  const id = getText(formData, "id");

  if (!supabase) {
    throw new Error("Client Supabase admin indisponible.");
  }

  if (!id) {
    throw new Error("Produit introuvable.");
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createAdminTestOrderAction(
  _prevState: AdminTestOrderState,
  formData: FormData,
): Promise<AdminTestOrderState> {
  try {
    await assertAdminAccess();

    const productId = getText(formData, "productId");
    const customerName = getText(formData, "customerName");
    const customerEmail = getText(formData, "customerEmail");
    const customerPhone = getText(formData, "customerPhone");
    const shippingAddress = getText(formData, "shippingAddress");
    const size = getText(formData, "size");
    const quantity = Number.parseInt(getText(formData, "quantity"), 10);

    if (
      !productId ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !shippingAddress ||
      !size
    ) {
      return {
        error: "Tous les champs de la commande test sont requis.",
        success: null,
        previewUrl: null,
      };
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      return {
        error: "La quantite doit etre superieure ou egale a 1.",
        success: null,
        previewUrl: null,
      };
    }

    const product = await getProductById(productId);

    if (!product || !product.sizes.includes(size)) {
      return {
        error: "Le produit ou la pointure selectionnes sont invalides.",
        success: null,
        previewUrl: null,
      };
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    const externalId = `admin-test-${crypto.randomUUID()}`;

    await persistOrder({
      externalId,
      userId: user?.id ?? null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      status: "test_created",
      currency: "EUR",
      items: [
        {
          productId: product.id,
          productName: product.name,
          size,
          quantity,
          unitPriceCents: product.price,
          currency: "EUR",
        },
      ],
    });

    const whatsappResult = await sendWhatsAppTestMessage({
      orderReference: externalId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      lines: [
        {
          productName: product.name,
          size,
          quantity,
        },
      ],
    });

    const adminSupabase = createSupabaseAdminClient();

    if (adminSupabase) {
      await adminSupabase
        .from("orders")
        .update({
          status: whatsappResult.delivered
            ? "test_whatsapp_sent"
            : "test_whatsapp_pending",
        })
        .eq("stripe_session_id", externalId);
    }

    if (!whatsappResult.delivered) {
      return {
        error: whatsappResult.error,
        success:
          "Commande test enregistree. Le message WhatsApp n'a pas encore ete envoye.",
        previewUrl: whatsappResult.previewUrl,
      };
    }

    revalidatePath("/account");
    revalidatePath("/admin");

    return {
      error: null,
      success: "Commande test creee et message WhatsApp envoye.",
      previewUrl: whatsappResult.previewUrl,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Erreur inconnue.",
      success: null,
      previewUrl: null,
    };
  }
}
