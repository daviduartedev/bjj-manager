"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createProductVariant,
  deleteProductVariant,
  updateProduct,
  updateProductVariant,
} from "@/actions/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductRow } from "@/lib/data/products-page";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

type Props = {
  product: ProductRow;
};

export function ProductEditorCard({ product }: Props) {
  const router = useRouter();
  const [nameDraft, setNameDraft] = useState(product.name);
  const [active, setActive] = useState(product.active);
  const [savingProduct, setSavingProduct] = useState(false);

  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState(0);
  const [addingVariant, setAddingVariant] = useState(false);

  useEffect(() => {
    setNameDraft(product.name);
    setActive(product.active);
  }, [product.id, product.name, product.active]);

  async function saveProductMeta() {
    setSavingProduct(true);
    try {
      const r = await updateProduct({
        productId: product.id,
        name: nameDraft.trim(),
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Produto atualizado.");
      router.refresh();
    } finally {
      setSavingProduct(false);
    }
  }

  async function toggleActive(checked: boolean) {
    setActive(checked);
    const r = await updateProduct({
      productId: product.id,
      active: checked,
    });
    if (!r.ok) {
      toast.error(r.error);
      setActive(!checked);
      return;
    }
    toast.success(checked ? "Produto ativado." : "Produto desativado.");
    router.refresh();
  }

  const variantCount = product.variants.length;
  const stockTotal = product.variants.reduce(
    (n, v) => n + Math.max(0, v.stock_quantity),
    0,
  );

  return (
    <DashboardPanel
      icon={Package}
      title={product.name}
      subtitle={`${variantCount} tamanho${variantCount === 1 ? "" : "s"} · ${stockTotal} peça${stockTotal === 1 ? "" : "s"} em estoque`}
      className={cn(
        "shadow-md transition-[box-shadow,transform] duration-200 hover:shadow-lg",
        product.active
          ? "border-l-[5px] border-l-primary ring-1 ring-primary/[0.12]"
          : "border-l-[5px] border-l-muted-foreground/35 opacity-[0.97]",
      )}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "border font-medium",
              product.active
                ? "border-bjj-green/35 bg-bjj-green/10 text-bjj-green"
                : "border-muted-foreground/40 bg-muted/60 text-muted-foreground",
            )}
          >
            {product.active ? "Em uso" : "Inativo"}
          </Badge>
          <Badge
            variant="outline"
            className="border-bjj-blue/30 bg-bjj-blue/[0.08] font-normal text-bjj-blue"
          >
            Código {product.code}
          </Badge>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 gap-4 sm:max-w-md">
            <div className="space-y-2">
              <Label htmlFor={`prod-name-${product.id}`}>Nome do produto</Label>
              <Input
                id={`prod-name-${product.id}`}
                className="min-h-11"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                maxLength={120}
                disabled={savingProduct}
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id={`prod-active-${product.id}`}
                checked={active}
                disabled={savingProduct}
                onCheckedChange={(v) => void toggleActive(v === true)}
                className="size-5"
              />
              <Label htmlFor={`prod-active-${product.id}`} className="cursor-pointer font-normal">
                Produto ativo (visível para gestão)
              </Label>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full shrink-0 sm:w-auto"
            disabled={
              savingProduct || nameDraft.trim() === product.name.trim()
            }
            onClick={() => void saveProductMeta()}
          >
            {savingProduct ? "Salvando…" : "Salvar nome"}
          </Button>
        </div>

        <div className="space-y-3 rounded-2xl border border-bjj-blue/15 bg-gradient-to-br from-bjj-blue/[0.06] via-card to-primary/[0.04] p-4 ring-1 ring-bjj-blue/10 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-crm-sm font-semibold text-foreground">
              Tamanhos e estoque
            </p>
            <p className="text-crm-xs text-muted-foreground">
              Edição manual; não há venda nem baixa automática.
            </p>
          </div>

          <ul className="divide-y divide-border/80 overflow-hidden rounded-xl border border-bjj-blue/20 bg-card/70 shadow-inner">
            {product.variants.length === 0 ? (
              <li className="px-4 py-6 text-crm-sm text-muted-foreground">
                Nenhum tamanho cadastrado. Adicione abaixo.
              </li>
            ) : (
              product.variants.map((v) => <VariantRow key={v.id} variant={v} />)
            )}
          </ul>

          <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] to-muted/30 p-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`new-size-${product.id}`}>Novo tamanho</Label>
                <Input
                  id={`new-size-${product.id}`}
                  className="min-h-11"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Ex.: M"
                  disabled={addingVariant}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`new-stock-${product.id}`}>Quantidade inicial</Label>
                <Input
                  id={`new-stock-${product.id}`}
                  type="number"
                  min={0}
                  className="min-h-11"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  disabled={addingVariant}
                />
              </div>
            </div>
            <Button
              type="button"
              className="min-h-11 w-full shrink-0 sm:w-auto"
              disabled={addingVariant || newSize.trim() === ""}
              onClick={async () => {
                setAddingVariant(true);
                try {
                  const qty =
                    Number.isFinite(newStock) && newStock >= 0
                      ? Math.floor(newStock)
                      : 0;
                  const r = await createProductVariant({
                    productId: product.id,
                    sizeLabel: newSize.trim(),
                    stockQuantity: qty,
                  });
                  if (!r.ok) {
                    toast.error(r.error);
                    return;
                  }
                  toast.success("Tamanho adicionado.");
                  setNewSize("");
                  setNewStock(0);
                  router.refresh();
                } finally {
                  setAddingVariant(false);
                }
              }}
            >
              {addingVariant ? "Adicionando…" : "Adicionar tamanho"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

function VariantRow(props: { variant: ProductRow["variants"][number] }) {
  const router = useRouter();
  const { variant } = props;
  const [sizeDraft, setSizeDraft] = useState(variant.size_label);
  const [stockDraft, setStockDraft] = useState(variant.stock_quantity);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSizeDraft(variant.size_label);
    setStockDraft(variant.stock_quantity);
  }, [variant.id, variant.size_label, variant.stock_quantity]);

  async function saveVariant() {
    setBusy(true);
    try {
      const r = await updateProductVariant({
        variantId: variant.id,
        sizeLabel:
          sizeDraft.trim() === variant.size_label ? undefined : sizeDraft.trim(),
        stockQuantity:
          stockDraft === variant.stock_quantity ? undefined : stockDraft,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Tamanho atualizado.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeVariant() {
    if (
      variant.stock_quantity > 0 &&
      !confirm(
        `Este tamanho tem estoque (${variant.stock_quantity}). Remover mesmo assim?`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const r = await deleteProductVariant({ variantId: variant.id });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Tamanho removido.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const dirty =
    sizeDraft.trim() !== variant.size_label || stockDraft !== variant.stock_quantity;

  const stock = variant.stock_quantity;
  const stockStyle =
    stock <= 0
      ? "border-bjj-red/30 bg-bjj-red/[0.06]"
      : stock <= 5
        ? "border-bjj-yellow/40 bg-bjj-yellow/[0.10]"
        : "border-bjj-green/25 bg-bjj-green/[0.06]";

  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-end",
        stockStyle,
      )}
    >
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-crm-xs" htmlFor={`var-size-${variant.id}`}>
            Tamanho
          </Label>
          <Input
            id={`var-size-${variant.id}`}
            className="min-h-11"
            value={sizeDraft}
            onChange={(e) => setSizeDraft(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-crm-xs" htmlFor={`var-stock-${variant.id}`}>
            Quantidade
          </Label>
          <Input
            id={`var-stock-${variant.id}`}
            type="number"
            min={0}
            className="min-h-11"
            value={stockDraft}
            onChange={(e) => {
              const n = Number(e.target.value);
              setStockDraft(Number.isFinite(n) ? n : 0);
            }}
            disabled={busy}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 w-full sm:w-auto"
          disabled={busy || !dirty}
          onClick={() => void saveVariant()}
        >
          Salvar
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full sm:w-auto"
          disabled={busy}
          onClick={() => void removeVariant()}
        >
          Remover
        </Button>
      </div>
    </li>
  );
}
