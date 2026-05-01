"use server";

import { revalidatePath } from "next/cache";

import { mapBillingActionError } from "@/lib/billing/action-errors";
import { ROUTES } from "@/lib/routes";
import {
  updateAccountSchema,
  updateProfileSchema,
} from "@/lib/validations/settings";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionResult = { ok: true } | { ok: false; error: string };

export async function updateAccount(input: unknown): Promise<SettingsActionResult> {
  try {
    const parsed = updateAccountSchema.safeParse(input);
    if (!parsed.success) {
      const msg =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Verifique os dados da academia.";
      return { ok: false, error: msg };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sessão inválida." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.account_id) {
      return { ok: false, error: "Conta não encontrada." };
    }

    const { error } = await supabase
      .from("accounts")
      .update({
        name: parsed.data.name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.account_id);

    if (error) throw error;

    revalidatePath(ROUTES.configuracoes);
    revalidatePath(ROUTES.perfil);
    revalidatePath(ROUTES.painel);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function updateProfile(input: unknown): Promise<SettingsActionResult> {
  try {
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      const msg =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Verifique os dados do perfil.";
      return { ok: false, error: msg };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sessão inválida." };

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.displayName,
        phone: parsed.data.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath(ROUTES.perfil);
    revalidatePath(ROUTES.configuracoes);
    revalidatePath(ROUTES.painel);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}
