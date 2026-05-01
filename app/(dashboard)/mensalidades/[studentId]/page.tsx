import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MensalidadesDetailClient } from "@/components/billing/mensalidades-detail-client";
import { loadMensalidadesDetail } from "@/lib/data/mensalidades-detail";

export const metadata: Metadata = {
  title: "Mensalidades, Aluno",
};

type PageProps = {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MensalidadesDetailPage({ params, searchParams }: PageProps) {
  const { studentId } = await params;
  const sp = await searchParams;
  const mesRaw = sp.mes;
  const mes = typeof mesRaw === "string" ? mesRaw : null;

  const data = await loadMensalidadesDetail(studentId, mes);
  if (!data) notFound();

  return <MensalidadesDetailClient payload={data} />;
}
