import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
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
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
