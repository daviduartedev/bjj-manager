"use client";

import { useMemo, useState } from "react";
import { Boxes, Layers, Package, PackagePlus, Sparkles } from "lucide-react";

import { ProductDialog } from "@/components/products/product-dialog";
import { ProductEditorCard } from "@/components/products/product-editor-card";
import { Button } from "@/components/ui/button";
import type { ProductRow } from "@/lib/data/products-page";
import { cn } from "@/lib/utils";

export function ProductsClient({ products }: { products: ProductRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const metrics = useMemo(() => {
    const active = products.filter((p) => p.active).length;
    const variants = products.reduce((n, p) => n + p.variants.length, 0);
    const stock = products.reduce(
      (n, p) =>
        n + p.variants.reduce((s, v) => s + Math.max(0, v.stock_quantity), 0),
      0,
    );
    return { active, variants, stock };
  }, [products]);

  const statTiles = [
    {
      label: "Produtos",
      value: products.length,
      hint: "no catálogo",
      icon: Package,
      tone:
        "border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card text-primary",
      iconWrap: "bg-primary/15 text-primary ring-1 ring-primary/20",
    },
    {
      label: "Ativos",
      value: metrics.active,
      hint: "visíveis na gestão",
      icon: Sparkles,
      tone:
        "border-bjj-green/25 bg-gradient-to-br from-bjj-green/[0.11] via-card to-card text-bjj-green",
      iconWrap: "bg-bjj-green/15 text-bjj-green ring-1 ring-bjj-green/25",
    },
    {
      label: "Tamanhos",
      value: metrics.variants,
      hint: "linhas de estoque",
      icon: Layers,
      tone:
        "border-bjj-blue/25 bg-gradient-to-br from-bjj-blue/[0.10] via-card to-card text-bjj-blue",
      iconWrap: "bg-bjj-blue/15 text-bjj-blue ring-1 ring-bjj-blue/25",
    },
    {
      label: "Peças em estoque",
      value: metrics.stock,
      hint: "soma das quantidades",
      icon: Boxes,
      tone:
        "border-bjj-yellow/35 bg-gradient-to-br from-bjj-yellow/[0.14] via-card to-card text-bjj-text",
      iconWrap: "bg-bjj-yellow/25 text-bjj-text ring-1 ring-bjj-yellow/40",
    },
  ] as const;

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo do estoque">
        {statTiles.map((tile) => (
          <article
            key={tile.label}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
              tile.tone,
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-10 size-28 rounded-full bg-white/40 blur-2xl"
            />
            <div className="relative flex items-start gap-3">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  tile.iconWrap,
                )}
              >
                <tile.icon className="size-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-crm-xs font-medium uppercase tracking-wide opacity-80">
                  {tile.label}
                </p>
                <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                  {tile.value}
                </p>
                <p className="text-crm-xs text-muted-foreground">{tile.hint}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.06] via-card to-bjj-blue/[0.06] p-1 shadow-sm ring-1 ring-primary/10">
        <div className="flex flex-col gap-4 rounded-[calc(1rem-3px)] bg-card/90 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Cadastro e estoque manual
            </p>
            <p className="max-w-xl text-crm-sm leading-relaxed text-muted-foreground">
              Organize produtos por nome e controle tamanhos com números claros. Esta área é só para operação interna — sem checkout nem venda online nesta etapa.
            </p>
          </div>
          <Button
            type="button"
            className="min-h-11 w-full shrink-0 gap-2 shadow-lg shadow-primary/25 transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
            onClick={() => setDialogOpen(true)}
          >
            <PackagePlus className="size-4" aria-hidden />
            Novo produto
          </Button>
        </div>
      </section>

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <div className="space-y-6">
        {products.length === 0 ? (
          <div
            className="relative overflow-hidden rounded-3xl border border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.07] via-card to-bjj-blue/[0.08] px-6 py-14 text-center shadow-inner ring-1 ring-primary/10"
            role="status"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/15 to-transparent"
            />
            <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-4 ring-primary/10">
                <Package className="size-8" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  Comece o seu catálogo interno
                </p>
                <p className="text-crm-sm text-muted-foreground">
                  Ainda não há produtos. Crie o primeiro item para registar tamanhos e quantidades da academia.
                </p>
              </div>
              <Button
                type="button"
                className="min-h-11 gap-2 shadow-md shadow-primary/20"
                onClick={() => setDialogOpen(true)}
              >
                <PackagePlus className="size-4" aria-hidden />
                Adicionar primeiro produto
              </Button>
            </div>
          </div>
        ) : (
          products.map((p) => <ProductEditorCard key={p.id} product={p} />)
        )}
      </div>
    </>
  );
}
