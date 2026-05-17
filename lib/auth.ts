import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "customer";
};

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user || !isSupabaseConfigured()) {
    return null satisfies Profile | null;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null satisfies Profile | null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      email: user.email ?? null,
      full_name: user.user_metadata.full_name ?? null,
      role: "customer",
    } satisfies Profile;
  }

  return data as Profile;
}

export async function isCurrentUserAdmin() {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
