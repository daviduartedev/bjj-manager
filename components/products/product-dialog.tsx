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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await createProduct({ name });
      if (!r.ok) {
        toast.error(r.error);
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
        if (!next) setName("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="overflow-hidden border-t-4 border-t-primary border-primary/20 bg-gradient-to-b from-primary/[0.04] to-card pt-6 sm:max-w-md">
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
              className="min-h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Faixa branca"
              maxLength={120}
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={loading}>
              {loading ? "Criando…" : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
