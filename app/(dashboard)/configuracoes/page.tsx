import type { Metadata } from "next";
import Link from "next/link";
import { Settings } from "lucide-react";

import { ConfiguracoesClient } from "@/components/settings/configuracoes-client";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PageFrame } from "@/components/prototype/page-frame";
import { resolvePublicAppOrigin } from "@/lib/app-url";
import { loadSettingsPageData } from "@/lib/data/settings-page";
import { ROUTES } from "@/lib/routes";
import { storefrontPath } from "@/lib/storefront/storefront";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function ConfiguracoesPage() {
  const data = await loadSettingsPageData();

  if (!data.ctx) {
    return (
      <PageFrame
        title="Configurações"
        emoji="⚙️"
        icon={Settings}
        tone="violet"
      >
        <div data-tour="page-configuracoes">
          <DashboardPanel icon={Settings} title="Conta incompleta" subtitle="Provisionamento pendente">
            <p className="type-lead" role="status">
              Quando o perfil estiver disponível, poderá editar o nome da academia e os planos.
            </p>
          </DashboardPanel>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Configurações"
      emoji="⚙️"
      icon={Settings}
      tone="violet"
    >
      <div className="space-y-8" data-tour="page-configuracoes">
        <p className="type-lead">
          <Link
            href={ROUTES.perfil}
            className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
          >
            Ir para Perfil
          </Link>
        </p>

        <ConfiguracoesClient
          initialAccountName={data.ctx.account.name}
          initialSlug={data.ctx.account.slug}
          initialStorefrontWhatsapp={data.ctx.account.storefront_whatsapp}
          initialStorefrontPublished={data.ctx.account.storefront_published}
          storefrontUrl={`${resolvePublicAppOrigin()}${storefrontPath(data.ctx.account.slug)}`}
          modality={data.ctx.account.modality}
          plans={data.plans}
          receiver={data.receiver}
        />
      </div>
    </PageFrame>
  );
}
