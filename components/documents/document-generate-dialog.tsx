"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  generateDocument,
  getDocumentDownloadUrl,
} from "@/actions/documents";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DocumentType } from "@/lib/documents/types";
import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/types";

type Variant = "enrollment_proof" | "certificate" | "liability_term" | "manual_receipt";

type Props = {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: () => void;
};

export function DocumentGenerateDialog({
  studentId,
  open,
  onOpenChange,
  onGenerated,
}: Props) {
  const [variant, setVariant] = useState<Variant>("enrollment_proof");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [guardianFullName, setGuardianFullName] = useState("");
  const [guardianDocument, setGuardianDocument] = useState("");
  const [amountCents, setAmountCents] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setDescription("");
    setBodyMarkdown("");
    setGuardianFullName("");
    setGuardianDocument("");
    setAmountCents("");
    setPaidAt("");
  }

  function submit() {
    startTransition(async () => {
      let payload: unknown;
      if (variant === "enrollment_proof") {
        payload = { type: "enrollment_proof", studentId };
      } else if (variant === "certificate") {
        payload = {
          type: "certificate",
          studentId,
          title: title.trim(),
          description: description.trim(),
        };
      } else if (variant === "liability_term") {
        payload = {
          type: "liability_term",
          studentId,
          bodyMarkdown: bodyMarkdown.trim(),
          guardianFullName: guardianFullName.trim() || null,
          guardianDocument: guardianDocument.trim() || null,
        };
      } else {
        payload = {
          type: "manual_receipt",
          studentId,
          amountCents: Math.round(Number(amountCents.replace(",", ".")) * 100),
          description: description.trim(),
          paidAt: paidAt || new Date().toISOString(),
        };
      }
      const r = await generateDocument(payload);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(`Documento ${r.number} gerado.`);
      const signed = await getDocumentDownloadUrl({ documentId: r.documentId });
      if (signed.ok) {
        window.open(signed.url, "_blank", "noopener,noreferrer");
      }
      reset();
      onOpenChange(false);
      onGenerated?.();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="flex max-h-[min(92vh,720px)] flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerar documento</DialogTitle>
          <DialogDescription>
            Escolha o tipo e preencha os campos necessários. O PDF é assinado pela
            academia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={variant} onValueChange={(v) => setVariant(v as Variant)}>
            <SelectTrigger className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["enrollment_proof", "certificate", "liability_term", "manual_receipt"] as const).map(
                (t) => (
                  <SelectItem key={t} value={t}>
                    {DOCUMENT_TYPE_LABELS[t as DocumentType]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        {variant === "certificate" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Conclusão da temporada de competição"
                className="min-h-11"
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
              />
            </div>
          </div>
        ) : null}

        {variant === "liability_term" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="body">Conteúdo do termo</Label>
              <Textarea
                id="body"
                value={bodyMarkdown}
                onChange={(e) => setBodyMarkdown(e.target.value)}
                rows={6}
                maxLength={10000}
                placeholder="Texto integral do termo a ser assinado"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guardian">Responsável (opcional)</Label>
                <Input
                  id="guardian"
                  value={guardianFullName}
                  onChange={(e) => setGuardianFullName(e.target.value)}
                  className="min-h-11"
                  maxLength={160}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian-doc">Documento (opcional)</Label>
                <Input
                  id="guardian-doc"
                  value={guardianDocument}
                  onChange={(e) => setGuardianDocument(e.target.value)}
                  className="min-h-11"
                  maxLength={40}
                />
              </div>
            </div>
          </div>
        ) : null}

        {variant === "manual_receipt" ? (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={amountCents}
                  onChange={(e) => setAmountCents(e.target.value)}
                  placeholder="120,00"
                  className="min-h-11 tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidAt">Pago em</Label>
                <Input
                  id="paidAt"
                  type="datetime-local"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="min-h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc-manual">Descrição</Label>
              <Textarea
                id="desc-manual"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            onClick={submit}
            disabled={pending}
          >
            {pending ? "Gerando…" : "Gerar e abrir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
