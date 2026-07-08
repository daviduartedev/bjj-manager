"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { MessageCircle, Upload } from "lucide-react";

import {
  getEnrollmentLiabilityDownloadUrl,
  sendEnrollmentLiabilityWhatsApp,
  uploadSignedEnrollmentDocument,
} from "@/actions/enrollment-liability-forms";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EnrollmentLiabilityFormDetail } from "@/actions/enrollment-liability-forms";

type Props = {
  detail: EnrollmentLiabilityFormDetail;
};

export function EnrollmentLiabilityDetailActions({ detail }: Props) {
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const isDraft = detail.status === "pending" && !detail.pdf_path;
  const canWhatsApp =
    detail.status === "ready" &&
    detail.signature_status !== "signed" &&
    Boolean(detail.whatsapp_phone);
  const canUpload =
    detail.status === "ready" && detail.signature_status !== "signed";

  function download() {
    startTransition(async () => {
      const r = await getEnrollmentLiabilityDownloadUrl({ documentId: detail.id });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      window.open(r.url, "_blank", "noopener,noreferrer");
    });
  }

  function whatsapp() {
    startTransition(async () => {
      const r = await sendEnrollmentLiabilityWhatsApp({ documentId: detail.id });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      window.open(r.url, "_blank", "noopener,noreferrer");
      toast.success("WhatsApp aberto com link de assinatura.");
    });
  }

  function upload(file: File) {
    const fd = new FormData();
    fd.set("documentId", detail.id);
    fd.set("file", file);
    startTransition(async () => {
      const r = await uploadSignedEnrollmentDocument(fd);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Documento assinado registrado.");
      window.location.reload();
    });
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {isDraft ? null : (
          <Button
            type="button"
            variant="outline"
            disabled={pending || !detail.pdf_path}
            onClick={download}
            className="min-h-11"
          >
            Baixar PDF
          </Button>
        )}

        {canWhatsApp ? (
          <Button
            type="button"
            disabled={pending}
            onClick={whatsapp}
            className="min-h-11"
          >
            <MessageCircle className="mr-2 size-4" />
            Enviar WhatsApp
          </Button>
        ) : detail.status === "ready" && detail.signature_status !== "signed" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button type="button" disabled className="min-h-11">
                  <MessageCircle className="mr-2 size-4" />
                  Enviar WhatsApp
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {detail.whatsapp_disabled_reason ?? "Telefone indisponível"}
            </TooltipContent>
          </Tooltip>
        ) : null}

        {canUpload ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              className="min-h-11"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-2 size-4" />
              Registrar assinado
            </Button>
          </>
        ) : null}

        {detail.signature_status === "awaiting_signature" ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="min-h-11"
            onClick={whatsapp}
          >
            Reenviar WhatsApp
          </Button>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
