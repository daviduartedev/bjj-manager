import type { Metadata } from "next";

import { resolveStorefrontAccess } from "@/lib/storefront/storefront";

export const metadata: Metadata = {
  title: "Loja não encontrada",
  robots: { index: false, follow: false },
};

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  const access = resolveStorefrontAccess({ slugFound: false });
  if (access !== "not_found") return null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Loja não encontrada</h1>
    </main>
  );
}
