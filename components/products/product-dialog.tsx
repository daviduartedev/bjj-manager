"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createProduct } from "@/actions/products";
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
import { shouldToastActionError } from "@/lib/ui/action-field-errors";
import { primaryActionClass } from "@/lib/ui/form-chrome";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNameError(null);
    setLoading(true);
    try {
      const r = await createProduct({ name });
      if (!r.ok) {
        const fieldMessage = r.fieldErrors?.name?.[0];
        if (fieldMessage) setNameError(fieldMessage);
        if (shouldToastActionError(r)) toast.error(r.error);
        return;
      }
      toast.success("Produto criado.");
      setName("");
      onOpenChange(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setName("");
          setNameError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent size="short">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
            <DialogDescription>
              Cadastro interno para controle de estoque. Sem venda ou checkout nesta etapa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="new-product-name">Nome</Label>
            <Input
              id="new-product-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null);
              }}
              placeholder="Ex.: Faixa branca"
              maxLength={120}
              disabled={loading}
              autoComplete="off"
              aria-invalid={nameError ? true : undefined}
            />
            {nameError ? (
              <p className="text-crm-sm font-medium text-destructive">{nameError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="submit" className={primaryActionClass} disabled={loading}>
              {loading ? "Criando…" : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
