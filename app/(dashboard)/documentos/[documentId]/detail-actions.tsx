"use client";

import { Download, ExternalLink, MessageCircle, Repeat2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getDocumentDownloadUrl,
  getWhatsAppShareLink,
} from "@/actions/documents";
import { ReissueDialog } from "@/components/documents/reissue-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  documentId: string;
  status: "pending" | "ready" | "failed" | "archived";
};

export function DocumentDetailActions({ documentId, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [reissueOpen, setReissueOpen] = useState(false);

  function withSignedUrl(fn: (url: string) => void) {
    startTransition(async () => {
      const r = await getDocumentDownloadUrl({ documentId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      fn(r.url);
    });
  }

  function whatsapp() {
    startTransition(async () => {
      const r = await getWhatsAppShareLink({ documentId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      window.open(r.url, "_blank", "noopener,noreferrer");
    });
  }

  const ready = status === "ready";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={!ready || pending}
        onClick={() =>
          withSignedUrl((url) => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `${documentId}.pdf`;
            a.rel = "noopener";
            a.click();
          })
        }
      >
        <Download className="mr-2 size-4" /> Baixar
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={!ready || pending}
        onClick={() => withSignedUrl((url) => window.open(url, "_blank", "noopener,noreferrer"))}
      >
        <ExternalLink className="mr-2 size-4" /> Abrir
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={!ready || pending}
        onClick={whatsapp}
      >
        <MessageCircle className="mr-2 size-4" /> WhatsApp
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={!ready || pending}
        onClick={() => setReissueOpen(true)}
      >
        <Repeat2 className="mr-2 size-4" /> Reemitir
      </Button>
      <ReissueDialog
        documentId={reissueOpen ? documentId : null}
        open={reissueOpen}
        onOpenChange={setReissueOpen}
      />
    </div>
  );
}
