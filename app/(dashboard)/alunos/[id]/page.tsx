import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StudentProfileClient } from "@/components/students/student-profile-client";
import { getStudentProfileById } from "@/lib/data/students-profile";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getStudentProfileById(id);
  return {
    title: profile ? `${profile.full_name}, Aluno` : "Aluno",
  };
}

export default async function AlunoPerfilPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getStudentProfileById(id);
  if (!profile) notFound();

  return <StudentProfileClient profile={profile} />;
}
