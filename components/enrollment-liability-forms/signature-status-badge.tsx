import type { DocumentSignatureStatus } from "@/lib/documents/types";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<DocumentSignatureStatus, string> = {
  awaiting_signature: "Aguardando assinatura",
  signed: "Assinado",
};

const VARIANTS: Record<
  DocumentSignatureStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  awaiting_signature: "secondary",
  signed: "default",
};

export function SignatureStatusBadge({
  status,
}: {
  status: DocumentSignatureStatus | null | undefined;
}) {
  if (!status) return null;
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}

export function EnrollmentLiabilityDocBadge({
  status,
  signatureStatus,
}: {
  status: "pending" | "ready" | "failed" | "archived";
  signatureStatus: DocumentSignatureStatus | null;
}) {
  if (status === "pending" && !signatureStatus) {
    return <Badge variant="outline">Rascunho</Badge>;
  }
  if (status === "ready" && !signatureStatus) {
    return <Badge variant="secondary">PDF gerado</Badge>;
  }
  if (signatureStatus) {
    return <SignatureStatusBadge status={signatureStatus} />;
  }
  if (status === "failed") {
    return <Badge variant="destructive">Falhou</Badge>;
  }
  return null;
}
