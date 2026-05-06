"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ProductAudience,
  ProductRow,
  VariantLine,
} from "@/lib/data/products-page";
import { getProductHeroVisual } from "@/lib/products/product-visuals";
import { cn } from "@/lib/utils";
import { Filter, Package, X } from "lucide-react";

type Props = {
  product: ProductRow;
};

export function ProductEditorCard({ product }: Props) {
  const router = useRouter();
  const visual = useMemo(
    () => getProductHeroVisual(product.code, product.name),
    [product.code, product.name],
  );

  const [nameDraft, setNameDraft] = useState(product.name);
  const [audienceDraft, setAudienceDraft] = useState<ProductAudience>(
    product.audience,
  );
  const [active, setActive] = useState(product.active);
  const [savingProduct, setSavingProduct] = useState(false);

  const [sizeQuery, setSizeQuery] = useState("");
  const [chipSize, setChipSize] = useState<string | null>(null);
  const [lineFilter, setLineFilter] = useState<"all" | "feminine">("all");

  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState(0);
  const [newLine, setNewLine] = useState<VariantLine>(
    product.audience === "feminine" ? "feminine" : "unisex",
  );
  const [addingVariant, setAddingVariant] = useState(false);

  useEffect(() => {
    setNameDraft(product.name);
    setAudienceDraft(product.audience);
    setActive(product.active);
    setNewLine(product.audience === "feminine" ? "feminine" : "unisex");
  }, [product.id, product.name, product.audience, product.active]);

  const sizeChips = useMemo(() => {
    const labels = [...new Set(product.variants.map((v) => v.size_label))];
    return labels.sort((a, b) =>
      a.localeCompare(b, "pt", { numeric: true, sensitivity: "base" }),
    );
  }, [product.variants]);

  const filteredVariants = useMemo(() => {
    return product.variants.filter((v) => {
      if (
        product.audience === "feminine" &&
        lineFilter === "feminine" &&
        v.line !== "feminine"
      ) {
        return false;
      }
      if (chipSize != null && v.size_label !== chipSize) return false;
      if (
        sizeQuery.trim() !== "" &&
        !v.size_label.toLowerCase().includes(sizeQuery.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [product.variants, product.audience, lineFilter, chipSize, sizeQuery]);

  function clearFilters() {
    setSizeQuery("");
    setChipSize(null);
    setLineFilter("all");
  }

  async function saveProductMeta() {
    setSavingProduct(true);
    try {
      const r = await updateProduct({
        productId: product.id,
        name:
          nameDraft.trim() !== product.name.trim()
            ? nameDraft.trim()
            : undefined,
        audience:
          audienceDraft !== product.audience ? audienceDraft : undefined,
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

  const hasActiveFilters =
    sizeQuery.trim() !== "" ||
    chipSize != null ||
    (product.audience === "feminine" && lineFilter === "feminine");

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/90 shadow-md transition-shadow duration-200 hover:shadow-lg",
        product.active
          ? "ring-1 ring-primary/15"
          : "opacity-[0.96] ring-1 ring-muted-foreground/20",
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          {/* Bloco 1 — imagem + identidade (listagem do item) */}
          <div className="relative aspect-[16/11] w-full shrink-0 border-b border-border/80 bg-muted/30 lg:aspect-auto lg:w-[min(100%,280px)] lg:border-b-0 lg:border-r">
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 280px"
              priority={false}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 pt-8">
              <p className="text-xs font-medium text-white drop-shadow-sm">
                {visual.credit}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-8 p-5 sm:p-6">
            <header className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    <Package className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <h2 className="font-display text-lg font-semibold leading-tight text-foreground sm:text-xl">
                      {product.name}
                    </h2>
                    <p className="text-crm-xs text-muted-foreground">
                      {variantCount} tamanho{variantCount === 1 ? "" : "s"} ·{" "}
                      {stockTotal} peça{stockTotal === 1 ? "" : "s"} em estoque
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
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
                    {product.code}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
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
                <div className="space-y-2">
                  <Label htmlFor={`prod-audience-${product.id}`}>Público / corte</Label>
                  <Select
                    disabled={savingProduct}
                    value={audienceDraft}
                    onValueChange={(v) =>
                      setAudienceDraft(v as ProductAudience)
                    }
                  >
                    <SelectTrigger
                      id={`prod-audience-${product.id}`}
                      className="min-h-11"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unisex">Unissex</SelectItem>
                      <SelectItem value="masculine">Masculino</SelectItem>
                      <SelectItem value="feminine">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <Checkbox
                    id={`prod-active-${product.id}`}
                    checked={active}
                    disabled={savingProduct}
                    onCheckedChange={(v) => void toggleActive(v === true)}
                    className="size-5"
                  />
                  <Label
                    htmlFor={`prod-active-${product.id}`}
                    className="cursor-pointer font-normal leading-snug"
                  >
                    Ativo na gestão
                  </Label>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="min-h-11 w-full sm:w-auto"
                disabled={
                  savingProduct ||
                  (nameDraft.trim() === product.name.trim() &&
                    audienceDraft === product.audience)
                }
                onClick={() => void saveProductMeta()}
              >
                {savingProduct ? "Salvando…" : "Salvar identificação"}
              </Button>
            </header>

            {/* Bloco 2 — filtro de tamanhos */}
            <section className="space-y-4 rounded-2xl border border-bjj-blue/20 bg-gradient-to-br from-bjj-blue/[0.05] to-transparent p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="size-4 text-bjj-blue" aria-hidden />
                <h3 className="text-sm font-semibold text-foreground">
                  Filtrar tamanhos
                </h3>
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 gap-1 text-crm-xs"
                    onClick={clearFilters}
                  >
                    <X className="size-3.5" aria-hidden />
                    Limpar filtros
                  </Button>
                ) : null}
              </div>

              {product.audience === "feminine" ? (
                <div className="space-y-2">
                  <p className="text-crm-xs font-medium text-muted-foreground">
                    Linha de corte (filtro)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={lineFilter === "all" ? "default" : "outline"}
                      className="min-h-9"
                      onClick={() => setLineFilter("all")}
                    >
                      Todos os tamanhos
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={lineFilter === "feminine" ? "default" : "outline"}
                      className="min-h-9"
                      onClick={() => setLineFilter("feminine")}
                    >
                      Só corte feminino
                    </Button>
                  </div>
                  <p className="text-crm-xs text-muted-foreground">
                    Marque cada variação como &quot;Feminino&quot; ou &quot;Unissex&quot; na
                    listagem abaixo. O filtro mostra apenas linhas femininas quando ativo.
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor={`size-search-${product.id}`}>Buscar tamanho</Label>
                <Input
                  id={`size-search-${product.id}`}
                  className="min-h-11"
                  placeholder="Ex.: A2, M, GG…"
                  value={sizeQuery}
                  onChange={(e) => {
                    setSizeQuery(e.target.value);
                    setChipSize(null);
                  }}
                />
              </div>

              {sizeChips.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-crm-xs text-muted-foreground">Atalhos</p>
                  <div className="flex flex-wrap gap-2">
                    {sizeChips.map((label) => (
                      <Button
                        key={label}
                        type="button"
                        size="sm"
                        variant={chipSize === label ? "default" : "secondary"}
                        className="h-9 min-w-[2.5rem] rounded-full px-3 font-medium tabular-nums"
                        onClick={() =>
                          setChipSize(chipSize === label ? null : label)
                        }
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            {/* Bloco 3 — quantidades */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Quantidades em estoque
              </h3>
              {filteredVariants.length === 0 ? (
                <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-crm-sm text-muted-foreground">
                  {product.variants.length === 0
                    ? "Nenhum tamanho cadastrado. Use o formulário abaixo para adicionar."
                    : "Nenhum tamanho corresponde ao filtro. Limpe os filtros ou ajuste a linha."}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/80">
                  <table className="w-full min-w-[520px] text-left text-crm-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-crm-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2.5 font-medium sm:px-4">Tamanho</th>
                        {product.audience === "feminine" ? (
                          <th className="px-3 py-2.5 font-medium sm:px-4">Linha</th>
                        ) : null}
                        <th className="px-3 py-2.5 font-medium sm:px-4">Qtd</th>
                        <th className="px-3 py-2.5 font-medium sm:px-4 text-right">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVariants.map((v) => (
                        <VariantTableRow
                          key={v.id}
                          variant={v}
                          showLine={product.audience === "feminine"}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="rounded-xl border border-primary/20 bg-muted/20 p-4">
                <p className="mb-3 text-crm-xs font-medium text-muted-foreground">
                  Novo tamanho
                </p>
                <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
                  <div className="space-y-2 sm:col-span-4">
                    <Label htmlFor={`new-size-${product.id}`}>Tamanho</Label>
                    <Input
                      id={`new-size-${product.id}`}
                      className="min-h-11"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="Ex.: A2 ou M1"
                      disabled={addingVariant}
                    />
                  </div>
                  {product.audience === "feminine" ? (
                    <div className="space-y-2 sm:col-span-3">
                      <Label htmlFor={`new-line-${product.id}`}>Linha</Label>
                      <Select
                        disabled={addingVariant}
                        value={newLine}
                        onValueChange={(v) => setNewLine(v as VariantLine)}
                      >
                        <SelectTrigger
                          id={`new-line-${product.id}`}
                          className="min-h-11"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feminine">Corte feminino</SelectItem>
                          <SelectItem value="unisex">Unissex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  <div className="space-y-2 sm:col-span-3">
                    <Label htmlFor={`new-stock-${product.id}`}>Qtd inicial</Label>
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
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      className="min-h-11 w-full"
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
                            line:
                              product.audience === "feminine"
                                ? newLine
                                : undefined,
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
                      {addingVariant ? "…" : "Adicionar"}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VariantTableRow(props: {
  variant: ProductRow["variants"][number];
  showLine: boolean;
}) {
  const router = useRouter();
  const { variant, showLine } = props;
  const [sizeDraft, setSizeDraft] = useState(variant.size_label);
  const [stockDraft, setStockDraft] = useState(variant.stock_quantity);
  const [lineDraft, setLineDraft] = useState<VariantLine>(variant.line);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSizeDraft(variant.size_label);
    setStockDraft(variant.stock_quantity);
    setLineDraft(variant.line);
  }, [variant.id, variant.size_label, variant.stock_quantity, variant.line]);

  async function saveVariant() {
    setBusy(true);
    try {
      const r = await updateProductVariant({
        variantId: variant.id,
        sizeLabel:
          sizeDraft.trim() === variant.size_label ? undefined : sizeDraft.trim(),
        stockQuantity:
          stockDraft === variant.stock_quantity ? undefined : stockDraft,
        line: lineDraft === variant.line ? undefined : lineDraft,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Atualizado.");
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
      toast.success("Removido.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const dirty =
    sizeDraft.trim() !== variant.size_label ||
    stockDraft !== variant.stock_quantity ||
    lineDraft !== variant.line;

  const stock = variant.stock_quantity;
  const rowTone =
    stock <= 0
      ? "bg-bjj-red/[0.04]"
      : stock <= 5
        ? "bg-bjj-yellow/[0.06]"
        : "bg-bjj-green/[0.03]";

  return (
    <tr className={cn("border-b border-border/70 last:border-0", rowTone)}>
      <td className="px-3 py-2 align-middle sm:px-4">
        <Input
          className="h-10 min-w-[4.5rem] font-medium tabular-nums"
          value={sizeDraft}
          onChange={(e) => setSizeDraft(e.target.value)}
          disabled={busy}
          aria-label="Tamanho"
        />
      </td>
      {showLine ? (
        <td className="px-3 py-2 align-middle sm:px-4">
          <Select
            disabled={busy}
            value={lineDraft}
            onValueChange={(v) => setLineDraft(v as VariantLine)}
          >
            <SelectTrigger className="h-10 w-[min(100%,9rem)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feminine">Feminino</SelectItem>
              <SelectItem value="unisex">Unissex</SelectItem>
            </SelectContent>
          </Select>
        </td>
      ) : null}
      <td className="px-3 py-2 align-middle sm:px-4">
        <Input
          type="number"
          min={0}
          className="h-10 w-[min(100%,5.5rem)] tabular-nums"
          value={stockDraft}
          onChange={(e) => {
            const n = Number(e.target.value);
            setStockDraft(Number.isFinite(n) ? n : 0);
          }}
          disabled={busy}
          aria-label="Quantidade"
        />
      </td>
      <td className="px-3 py-2 align-middle text-right sm:px-4">
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-9"
            disabled={busy || !dirty}
            onClick={() => void saveVariant()}
          >
            Salvar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9"
            disabled={busy}
            onClick={() => void removeVariant()}
          >
            Remover
          </Button>
        </div>
      </td>
    </tr>
  );
}
