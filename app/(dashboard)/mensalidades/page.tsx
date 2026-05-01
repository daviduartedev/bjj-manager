import type { Metadata } from "next";

import { MensalidadesClient } from "@/components/billing/mensalidades-client";
import {
  parseMensalidadesFiltroQuery,
  parseMensalidadesKindQuery,
} from "@/lib/billing/mensalidades-filtro-url";
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
  const initialFilter = parseMensalidadesFiltroQuery(sp.filtro);
  const initialKindFilter = parseMensalidadesKindQuery(sp.tipo);

  const data = await loadMensalidadesRows(mes);

  return (
    <MensalidadesClient
      initialRows={data.rows}
      referenceMonth={data.referenceMonth}
      initialFilter={initialFilter}
      initialKindFilter={initialKindFilter}
      monthFinance={data.monthFinance}
    />
  );
}
