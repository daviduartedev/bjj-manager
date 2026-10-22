import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { MensalidadesClient } from "@/components/billing/mensalidades-client";
import { PageFrame } from "@/components/prototype/page-frame";
import {
  parseMensalidadesFiltroQuery,
  parseMensalidadesPlanQuery,
} from "@/lib/billing/mensalidades-filtro-url";
import { getCurrentAccount } from "@/lib/auth";
import { loadMensalidadesRows } from "@/lib/data/mensalidades-page";

export const metadata: Metadata = {
  title: "Mensalidades",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MensalidadesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const mesRaw = sp.mes;
  const mes = typeof mesRaw === "string" ? mesRaw : null;
  const ctx = await getCurrentAccount();
  const modality = ctx?.account.modality ?? "jiu_jitsu";
  const initialFilter = parseMensalidadesFiltroQuery(sp.filtro);
  const requestedPlan = parseMensalidadesPlanQuery(sp.tipo);
  const initialPlanFilter =
    modality !== "jiu_jitsu" && requestedPlan !== "all" && requestedPlan !== "adult"
      ? "all"
      : requestedPlan;

  const data = await loadMensalidadesRows(mes);

  return (
    <PageFrame
      title="Mensalidades"
      emoji="💰"
      icon={Wallet}
      tone="emerald"
    >
      <MensalidadesClient
        initialRows={data.rows}
        referenceMonth={data.referenceMonth}
        initialFilter={initialFilter}
        initialPlanFilter={initialPlanFilter}
        monthFinance={data.monthFinance}
        modality={modality}
      />
    </PageFrame>
  );
}
