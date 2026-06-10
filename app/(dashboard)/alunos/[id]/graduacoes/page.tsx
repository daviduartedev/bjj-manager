import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GraduationsPageClient } from "@/components/graduation/graduations-page-client";
import { getGraduationsPageByStudentId } from "@/lib/data/graduations-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const payload = await getGraduationsPageByStudentId(id);
  return {
    title: payload
      ? `Graduações — ${payload.full_name}`
      : "Graduações",
  };
}

export default async function AlunoGraduacoesPage({ params }: PageProps) {
  const { id } = await params;
  const payload = await getGraduationsPageByStudentId(id);
  if (!payload) notFound();

  return <GraduationsPageClient payload={payload} />;
}
