import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/lib/branding";

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
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Plataforma para professores de jiu-jitsu gerenciarem alunos, graduações e mensalidades da academia.",
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME }],
  keywords: [
    "Casca",
    "jiu-jitsu",
    "bjj",
    "academia",
    "alunos",
    "graduação",
    "mensalidade",
  ],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
