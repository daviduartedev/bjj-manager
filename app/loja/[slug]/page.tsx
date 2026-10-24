import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";

import { getCurrentAccount } from "@/lib/auth";
import { normalizePhoneE164 } from "@/lib/documents/whatsapp";
import { BRANDING_BUCKET } from "@/lib/settings/branding-upload";
import { resolveStorefrontAccess, type StorefrontAccess } from "@/lib/storefront/storefront";
import { createClient } from "@/lib/supabase/server";

const LOGO_SIGN_TTL_SECONDS = 60 * 60;

type StorefrontAccountRow = {
  id: string;
  name: string;
  logo_url: string | null;
  slug: string;
  storefront_published: boolean;
  storefront_whatsapp: string | null;
};

function readStorefrontAccount(data: unknown): StorefrontAccountRow | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  const record = row as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") return null;
  return {
    id: record.id,
    name: record.name,
    logo_url: typeof record.logo_url === "string" ? record.logo_url : null,
    slug: typeof record.slug === "string" ? record.slug : "",
    storefront_published: record.storefront_published === true,
    storefront_whatsapp:
      typeof record.storefront_whatsapp === "string" ? record.storefront_whatsapp : null,
  };
}

async function storefrontLogoSrc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  logoUrl: string | null,
): Promise<string | null> {
  if (!logoUrl) return null;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  const { data } = await supabase.storage
    .from(BRANDING_BUCKET)
    .createSignedUrl(logoUrl, LOGO_SIGN_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

const loadStorefrontPage = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("storefront_account", { p_slug: slug });
  if (error) throw error;

  const account = readStorefrontAccount(data);
  const session = account ? await getCurrentAccount() : null;
  const preview = Boolean(account && session && session.profile.account_id === account.id);
  const access: StorefrontAccess = resolveStorefrontAccess({
    slugFound: account !== null,
    published: account?.storefront_published ?? false,
    whatsappE164: normalizePhoneE164(account?.storefront_whatsapp ?? null),
    // A marcação "mostrar na vitrine" ainda não existe; nenhum produto é elegível.
    eligibleProductCount: 0,
    preview,
  });
  const logoSrc =
    access === "not_found" ? null : await storefrontLogoSrc(supabase, account?.logo_url ?? null);

  return { access, account, logoSrc };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { access, account } = await loadStorefrontPage(slug);
  return {
    title: access === "not_found" || !account ? "Loja não encontrada" : account.name,
    robots: { index: false, follow: false },
  };
}

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { access, account, logoSrc } = await loadStorefrontPage(slug);

  if (access === "not_found" || !account) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Loja não encontrada</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10">
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt=""
          width={192}
          height={64}
          unoptimized
          className="mb-4 h-16 w-auto max-w-full object-contain"
        />
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight">{account.name}</h1>
      {access === "empty" ? (
        <p className="mt-6 text-base">Nenhum produto no momento</p>
      ) : null}
    </main>
  );
}
