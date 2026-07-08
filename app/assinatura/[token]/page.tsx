import type { Metadata } from "next";

import { getSigningPageData } from "@/actions/signing";
import { SigningPageClient } from "@/components/signing/signing-page-client";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Assinar documento",
};

type PageProps = { params: Promise<{ token: string }> };

export default async function AssinaturaPage({ params }: PageProps) {
  const { token } = await params;
  const result = await getSigningPageData(token);

  if (!result.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <h1 className="text-lg font-semibold">Link indisponível</h1>
            <p className="mt-2 text-crm-sm text-muted-foreground">{result.error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <SigningPageClient token={token} initial={result.data} />
    </main>
  );
}
