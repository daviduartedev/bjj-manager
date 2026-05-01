import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

/** Tipografia única estilo CRM / painel operacional (IBM Plex Sans — legível em dados densos, bom suporte a pt-BR). */
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "BJJ Manager",
    template: "%s | BJJ Manager",
  },
  description:
    "Plataforma para professores de jiu-jitsu gerenciarem alunos, graduacoes e mensalidades.",
  applicationName: "BJJ Manager",
  authors: [{ name: "BJJ Manager" }],
  keywords: ["jiu-jitsu", "bjj", "academia", "alunos", "graduacao", "mensalidade"],
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={ibmPlexSans.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
