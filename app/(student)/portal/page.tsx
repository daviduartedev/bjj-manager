import type { Metadata } from "next";
import { Hand } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";

export const metadata: Metadata = {
  title: "Portal do aluno",
};

export default function PortalHomePage() {
  return (
    <PageFrame
      title="Início"
      emoji="🏠"
      icon={Hand}
      tone="amber"
    >
      {null}
    </PageFrame>
  );
}
