"use server";

import { revalidatePath } from "next/cache";

import { mapBillingActionError } from "@/lib/billing/action-errors";
import { ROUTES } from "@/lib/routes";
import {
  updateAccountSchema,
  updateProfileSchema,
  updateReceiverSchema,
} from "@/lib/validations/settings";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionResult = { ok: true } | { ok: false; error: string };

const SIGNATURE_BUCKET = process.env.SUPABASE_BRANDING_BUCKET ?? "branding-dev";
const SIGNATURE_MAX_BYTES = 256 * 1024;
const SIGNATURE_ALLOWED_MIME = ["image/png", "image/svg+xml"] as const;

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

export async function updateReceiver(input: unknown): Promise<SettingsActionResult> {
  try {
    const parsed = updateReceiverSchema.safeParse(input);
    if (!parsed.success) {
      const msg =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Verifique os dados do recebedor.";
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
        legal_name: parsed.data.legalName,
        cnpj: parsed.data.cnpj,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.account_id);

    if (error) throw error;

    revalidatePath(ROUTES.configuracoes);
    revalidatePath(ROUTES.painel);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function uploadAccountSignature(
  formData: FormData,
): Promise<SettingsActionResult> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "Selecione um ficheiro." };
    }
    if (file.size === 0) {
      return { ok: false, error: "Ficheiro vazio." };
    }
    if (file.size > SIGNATURE_MAX_BYTES) {
      return { ok: false, error: "Ficheiro maior que 256 KB." };
    }
    if (!SIGNATURE_ALLOWED_MIME.includes(file.type as (typeof SIGNATURE_ALLOWED_MIME)[number])) {
      return { ok: false, error: "Use PNG ou SVG." };
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

    const ext = file.type === "image/png" ? "png" : "svg";
    const path = `${profile.account_id}/signature.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from(SIGNATURE_BUCKET)
      .upload(path, new Uint8Array(arrayBuffer), {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });
    if (uploadErr) throw uploadErr;

    const { error: updErr } = await supabase
      .from("accounts")
      .update({
        signature_url: path,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.account_id);
    if (updErr) throw updErr;

    revalidatePath(ROUTES.configuracoes);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function removeAccountSignature(): Promise<SettingsActionResult> {
  try {
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

    const { data: account } = await supabase
      .from("accounts")
      .select("signature_url")
      .eq("id", profile.account_id)
      .maybeSingle();

    if (account?.signature_url) {
      await supabase.storage
        .from(SIGNATURE_BUCKET)
        .remove([account.signature_url]);
    }

    const { error } = await supabase
      .from("accounts")
      .update({ signature_url: null, updated_at: new Date().toISOString() })
      .eq("id", profile.account_id);
    if (error) throw error;

    revalidatePath(ROUTES.configuracoes);
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
