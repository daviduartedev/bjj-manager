import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GraduationsPageClient } from "@/components/graduation/graduations-page-client";
import { getGraduationsPageByStudentId } from "@/lib/data/graduations-page";
import { getCurrentAccount } from "@/lib/auth";
import { getStudentProfileById } from "@/lib/data/students-profile";
import { ReferencedGraduationsPageClient } from "@/components/graduation/referenced-graduations-page-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const context = await getCurrentAccount();
  if (context?.account.modality === "judo" || context?.account.modality === "muay_thai") {
    const profile = await getStudentProfileById(id);
    return { title: profile ? `Graduações — ${profile.full_name}` : "Graduações" };
  }
  const payload = await getGraduationsPageByStudentId(id);
  return {
    title: payload
      ? `Graduações — ${payload.full_name}`
      : "Graduações",
  };
}

export default async function AlunoGraduacoesPage({ params }: PageProps) {
  const { id } = await params;
  const context = await getCurrentAccount();
  if (context?.account.modality === "judo" || context?.account.modality === "muay_thai") {
    const profile = await getStudentProfileById(id);
    if (!profile) notFound();
    return <ReferencedGraduationsPageClient profile={profile} />;
  }
  const payload = await getGraduationsPageByStudentId(id);
  if (!payload) notFound();

  return <GraduationsPageClient payload={payload} />;
}
