import type { Metadata } from "next";
import { Hand } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { getStudentForCurrentUser } from "@/lib/auth/student-context";

export const metadata: Metadata = {
  title: "Portal do aluno",
};

export default async function PortalHomePage() {
  const student = await getStudentForCurrentUser();
  const firstName = student?.full_name?.split(/\s+/)[0] ?? "Aluno";

  return (
    <PageFrame
      title={`Olá, ${firstName}`}
      icon={Hand}
      tone="amber"
    >
      {null}
    </PageFrame>
  );
}
