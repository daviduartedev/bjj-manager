import type { Metadata } from "next";

import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Início",
  description:
    "Casca é o software para donos e professores de academia de jiu-jitsu: alunos, graduações, mensalidades e painel operacional num só lugar.",
};

export default function HomePage() {
  return <LandingPage />;
}
