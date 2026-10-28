import type { Metadata } from "next";
import { Store } from "lucide-react";

import { CatalogoClient } from "@/components/settings/configuracoes-client";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PageFrame } from "@/components/prototype/page-frame";
import { resolvePublicAppOrigin } from "@/lib/app-url";
import { loadSettingsPageData } from "@/lib/data/settings-page";
import { storefrontPath } from "@/lib/storefront/storefront";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Catálogo de produtos",
};

export default async function CatalogoPage() {
  const data = await loadSettingsPageData();

  if (!data.ctx) {
    return (
      <PageFrame title="Catálogo de produtos" emoji="🛍️" icon={Store} tone="orange">
        <div data-tour="page-catalogo">
          <DashboardPanel icon={Store} title="Conta incompleta" subtitle="Provisionamento pendente">
            <p className="type-lead" role="status">
              Quando o perfil estiver disponível, poderá publicar o catálogo de produtos.
            </p>
          </DashboardPanel>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame title="Catálogo de produtos" emoji="🛍️" icon={Store} tone="orange">
      <div className="space-y-8" data-tour="page-catalogo">
        <CatalogoClient
          initialAccountName={data.ctx.account.name}
          initialSlug={data.ctx.account.slug}
          initialStorefrontWhatsapp={data.ctx.account.storefront_whatsapp}
          initialStorefrontPublished={data.ctx.account.storefront_published}
          initialStorefrontTheme={await loadStorefrontTheme(data.ctx.account.id)}
          storefrontUrl={`${resolvePublicAppOrigin()}${storefrontPath(data.ctx.account.slug)}`}
        />
      </div>
    </PageFrame>
  );
}

async function loadStorefrontTheme(accountId: string): Promise<unknown> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("storefront_theme")
    .eq("id", accountId)
    .maybeSingle();
  if (error || !data) return {};
  return data.storefront_theme ?? {};
}
