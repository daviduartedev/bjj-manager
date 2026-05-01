import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DesignSystemProviders } from "@/app/design-system/providers";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Galeria de tokens e componentes (disponível apenas em desenvolvimento).",
};

export default function DesignSystemLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <DesignSystemProviders>{children}</DesignSystemProviders>;
}
