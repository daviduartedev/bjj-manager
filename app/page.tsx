import type { Metadata } from "next";

import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Início",
  description:
    "A plataforma brasileira para gestão de academias de artes marciais. Acompanhe alunos, graduações, aulas e mensalidades com uma rotina feita para a sua academia.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <LandingPage />
    </div>
  );
}
