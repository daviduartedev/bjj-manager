"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";

import {
  removeAccountSignature,
  uploadAccountSignature,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";

type Props = {
  /** Caminho relativo no bucket (mostra preview se for PNG/SVG). */
  initialPath: string | null;
  /** URL assinada (server-side) — opcional se nada estiver carregado. */
  initialPreviewUrl: string | null;
};

const ALLOWED_HINT = "PNG ou SVG, máximo 256 KB.";

export function SignatureUploader({ initialPath, initialPreviewUrl }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [path, setPath] = useState<string | null>(initialPath);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl);
  const [pending, startTransition] = useTransition();

  function handleSelect() {
    inputRef.current?.click();
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/png", "image/svg+xml"].includes(file.type)) {
      toast.error("Use PNG ou SVG.");
      return;
    }
    if (file.size > 256 * 1024) {
      toast.error("Ficheiro maior que 256 KB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const r = await uploadAccountSignature(formData);
      if (!r.ok) {
        toast.error(r.error);
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(initialPreviewUrl);
        return;
      }
      toast.success("Assinatura atualizada.");
      setPath("uploaded");
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const r = await removeAccountSignature();
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setPath(null);
      setPreviewUrl(null);
      toast.success("Assinatura removida.");
    });
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml"
        className="hidden"
        onChange={handleFile}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className="flex h-24 w-48 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground"
          aria-label="Pré-visualização da assinatura"
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Assinatura digital"
              width={192}
              height={96}
              unoptimized
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-crm-xs">Sem imagem</span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={handleSelect}
            className="min-h-11 touch-manipulation"
          >
            {path ? "Substituir" : "Carregar"}
          </Button>
          {path ? (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={handleRemove}
              className="min-h-11 touch-manipulation"
            >
              Remover
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-crm-xs text-muted-foreground">{ALLOWED_HINT}</p>
    </div>
  );
}
