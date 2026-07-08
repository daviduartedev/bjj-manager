"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

import { submitSignature, type SigningPageData } from "@/actions/signing";
import { SignaturePad } from "@/components/signing/signature-pad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  token: string;
  initial: SigningPageData;
};

export function SigningPageClient({ token, initial }: Props) {
  const [signature, setSignature] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!signature) {
      setError("Desenhe sua assinatura antes de confirmar.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await submitSignature({ token, signatureDataUrl: signature });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="size-12 text-primary" />
          <h1 className="text-xl font-semibold">Assinatura registrada</h1>
          <p className="text-crm-sm text-muted-foreground">
            Obrigado! A academia já pode visualizar o documento assinado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg">Assinar documento</CardTitle>
        <p className="text-crm-sm text-muted-foreground">
          {initial.academyName} · {initial.documentNumber}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3 text-crm-sm">
          <p>
            <span className="font-medium">Signatário:</span> {initial.signerLabel}
          </p>
          <p className="text-muted-foreground">
            {initial.variant === "minor"
              ? "Responsável legal pelo menor"
              : "Praticante adulto"}
          </p>
        </div>
        <p className="text-crm-sm">
          Desenhe sua assinatura no quadro abaixo com o dedo ou mouse.
        </p>
        <SignaturePad onChange={setSignature} disabled={pending} />
        {error ? <p className="text-crm-sm text-destructive">{error}</p> : null}
        <Button
          type="button"
          className="min-h-11 w-full"
          disabled={pending}
          onClick={submit}
        >
          Confirmar assinatura
        </Button>
      </CardContent>
    </Card>
  );
}
