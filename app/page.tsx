import type { Metadata } from "next";

import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "Início",
  description:
    "Se preocupe apenas em dar aula. No Casca, você visualiza e organiza toda a gestão da sua academia em um só lugar.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <LandingPage />
    </div>
  );
}
