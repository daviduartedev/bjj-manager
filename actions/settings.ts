"use server";

import { revalidatePath } from "next/cache";

import { mapBillingActionError } from "@/lib/billing/action-errors";
import { getCurrentAccount } from "@/lib/auth";
import { isAcademyModality } from "@/lib/modalities/catalog";
import { ROUTES } from "@/lib/routes";
import {
  BRANDING_BUCKET,
  persistBrandingUpload,
  removeBrandingAsset,
  type BrandingAccountColumn,
  type BrandingKind,
} from "@/lib/settings/branding-upload";
import {
  canPublishStorefront,
  parseStorefrontTheme,
  storefrontPath,
  validateSlugChange,
} from "@/lib/storefront/storefront";
import {
  updateAccountSchema,
  updateAccountSlugSchema,
  updateProfileSchema,
  updateReceiverSchema,
  updateStorefrontPublicationSchema,
} from "@/lib/validations/settings";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionResult = { ok: true } | { ok: false; error: string };

async function requireSettingsAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Sessão inválida." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.account_id) {
    return { ok: false as const, error: "Conta não encontrada." };
  }

  return {
    ok: true as const,
    supabase,
    accountId: profile.account_id as string,
  };
}

function brandingStorageDeps(supabase: Awaited<ReturnType<typeof createClient>>) {
  return {
    upload: async (path: string, body: Uint8Array, contentType: string) => {
      const { error } = await supabase.storage.from(BRANDING_BUCKET).upload(path, body, {
        cacheControl: "3600",
        upsert: true,
        contentType,
      });
      if (error) throw error;
    },
    remove: async (paths: string[]) => {
      await supabase.storage.from(BRANDING_BUCKET).remove(paths);
    },
    readPath: async (accountId: string, column: BrandingAccountColumn) => {
      const { data, error } = await supabase
        .from("accounts")
        .select("signature_url, logo_url")
        .eq("id", accountId)
        .maybeSingle();
      if (error) throw error;
      const value = data?.[column];
      return typeof value === "string" ? value : null;
    },
    writePath: async (
      accountId: string,
      column: BrandingAccountColumn,
      value: string | null,
    ) => {
      const { error } = await supabase
        .from("accounts")
        .update({
          [column]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", accountId);
      if (error) throw error;
    },
  };
}

async function uploadAccountBranding(
  formData: FormData,
  kind: BrandingKind,
): Promise<SettingsActionResult> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "Selecione um ficheiro." };
    }

    const ctx = await requireSettingsAccount();
    if (!ctx.ok) return ctx;

    const deps = brandingStorageDeps(ctx.supabase);
    const result = await persistBrandingUpload({
      accountId: ctx.accountId,
      kind,
      file,
      upload: deps.upload,
      writePath: deps.writePath,
    });
    if (!result.ok) return result;

    revalidatePath(ROUTES.configuracoes);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

async function removeAccountBranding(kind: BrandingKind): Promise<SettingsActionResult> {
  try {
    const ctx = await requireSettingsAccount();
    if (!ctx.ok) return ctx;

    const deps = brandingStorageDeps(ctx.supabase);
    await removeBrandingAsset({
      accountId: ctx.accountId,
      kind,
      readPath: deps.readPath,
      remove: deps.remove,
      writePath: deps.writePath,
    });

    revalidatePath(ROUTES.configuracoes);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

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

export async function updateAccountSlug(input: unknown): Promise<SettingsActionResult> {
  try {
    const parsed = updateAccountSlugSchema.safeParse(input);
    if (!parsed.success) {
      const msg =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Verifique o endereço da loja.";
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

    const { data: account, error: readError } = await supabase
      .from("accounts")
      .select("slug")
      .eq("id", profile.account_id)
      .maybeSingle();

    if (readError) throw readError;
    const currentSlug = account && typeof account.slug === "string" ? account.slug : null;
    if (!currentSlug) return { ok: false, error: "Conta não encontrada." };

    const decision = validateSlugChange({
      next: parsed.data.next,
      current: currentSlug,
      takenByOthers: [],
      confirmed: parsed.data.confirmed,
    });
    if (!decision.ok) return decision;

    if (decision.slug === currentSlug) {
      revalidatePath(ROUTES.configuracoes);
      return { ok: true };
    }

    const { error } = await supabase
      .from("accounts")
      .update({
        slug: decision.slug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.account_id);

    if (error) {
      if (error.code === "23505") {
        const taken = validateSlugChange({
          next: decision.slug,
          current: currentSlug,
          takenByOthers: [decision.slug],
          confirmed: true,
        });
        if (!taken.ok) return taken;
      }
      throw error;
    }

    revalidatePath(ROUTES.configuracoes);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function updateStorefrontPublication(input: unknown): Promise<SettingsActionResult> {
  try {
    const parsed = updateStorefrontPublicationSchema.safeParse(input);
    if (!parsed.success) {
      const msg =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Verifique o WhatsApp da loja.";
      return { ok: false, error: msg };
    }

    const context = await getCurrentAccount();
    if (!context || context.profile.role !== "professor") {
      return { ok: false, error: "Só o professor da academia pode publicar a loja." };
    }

    const supabase = await createClient();
    const { data: account, error: readError } = await supabase
      .from("accounts")
      .select("slug, storefront_published")
      .eq("id", context.account.id)
      .maybeSingle();

    if (readError) throw readError;
    const currentSlug = account && typeof account.slug === "string" ? account.slug : null;
    if (!currentSlug) return { ok: false, error: "Conta não encontrada." };

    const decision = canPublishStorefront({
      published: parsed.data.published,
      whatsappRaw: parsed.data.whatsapp,
      currentlyPublished: account?.storefront_published === true,
    });
    if (!decision.ok) return decision;

    const { error } = await supabase
      .from("accounts")
      .update({
        storefront_whatsapp: decision.whatsappE164,
        storefront_published: decision.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.account.id);

    if (error) throw error;

    revalidatePath(ROUTES.configuracoes);
    revalidatePath(storefrontPath(currentSlug));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function updateStorefrontTheme(input: unknown): Promise<SettingsActionResult> {
  try {
    const parsed = parseStorefrontTheme(input);
    if (!parsed.ok) return parsed;

    const context = await getCurrentAccount();
    if (!context || context.profile.role !== "professor") {
      return { ok: false, error: "Só o professor da academia pode personalizar a loja." };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("accounts")
      .update({
        storefront_theme: parsed.theme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.account.id);

    if (error) throw error;

    revalidatePath(ROUTES.configuracoes);
    revalidatePath(storefrontPath(context.account.slug));
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
  return uploadAccountBranding(formData, "signature");
}

export async function removeAccountSignature(): Promise<SettingsActionResult> {
  return removeAccountBranding("signature");
}

export async function uploadAccountLogo(
  formData: FormData,
): Promise<SettingsActionResult> {
  return uploadAccountBranding(formData, "logo");
}

export async function removeAccountLogo(): Promise<SettingsActionResult> {
  return removeAccountBranding("logo");
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

export async function switchAcademyModality(target: unknown): Promise<SettingsActionResult> {
  const context = await getCurrentAccount();
  if (context?.profile.role !== "professor") {
    return { ok: false, error: "Só o professor da academia pode trocar a modalidade." };
  }
  if (!isAcademyModality(target) || target === context.account.modality) {
    return { ok: false, error: "Escolha outra modalidade da academia." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("switch_academy_modality", { p_target: target });
  if (error) {
    if (error.message.includes("academy is not empty")) {
      return {
        ok: false,
        error: "A academia já tem aluno, turma, aula, pagamento ou documento. A modalidade não foi alterada.",
      };
    }
    return { ok: false, error: "Não foi possível trocar a modalidade. Atualize a página e tente novamente." };
  }

  revalidatePath(ROUTES.configuracoes);
  revalidatePath(ROUTES.painel);
  revalidatePath(ROUTES.alunos);
  revalidatePath(ROUTES.aulasTurmas);
  return { ok: true };
}
