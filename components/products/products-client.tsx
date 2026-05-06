"use client";

import { useMemo, useState } from "react";
import { Boxes, Layers, Package, PackagePlus, Ruler, Sparkles } from "lucide-react";

import { KimonoSizeGuide } from "@/components/products/kimono-size-guide";
import { ProductDialog } from "@/components/products/product-dialog";
import { ProductEditorCard } from "@/components/products/product-editor-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductRow } from "@/lib/data/products-page";
import { cn } from "@/lib/utils";

export function ProductsClient({ products }: { products: ProductRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mainTab, setMainTab] = useState("catalogo");

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
      label: "Peças",
      value: metrics.stock,
      hint: "em estoque",
      icon: Boxes,
      tone:
        "border-bjj-yellow/35 bg-gradient-to-br from-bjj-yellow/[0.14] via-card to-card text-bjj-text",
      iconWrap: "bg-bjj-yellow/25 text-bjj-text ring-1 ring-bjj-yellow/40",
    },
  ] as const;

  return (
    <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border border-border/80 bg-muted/60 p-1 shadow-sm sm:flex sm:w-auto sm:justify-start">
          <TabsTrigger
            id="produtos-tab-catalogo"
            value="catalogo"
            className="min-h-11 gap-2 rounded-lg data-[state=active]:shadow-sm"
          >
            <Package className="size-4 shrink-0 opacity-80" aria-hidden />
            Catálogo
          </TabsTrigger>
          <TabsTrigger
            id="produtos-tab-guia"
            value="guia"
            className="min-h-11 gap-2 rounded-lg data-[state=active]:shadow-sm"
          >
            <Ruler className="size-4 shrink-0 opacity-80" aria-hidden />
            Guia de kimonos
          </TabsTrigger>
        </TabsList>
        {mainTab === "catalogo" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden min-h-10 shrink-0 gap-2 sm:inline-flex"
            onClick={() => setMainTab("guia")}
          >
            <Ruler className="size-4" aria-hidden />
            Ver tamanhos A0–A5 / M00–M4
          </Button>
        ) : null}
      </div>

      {mainTab === "catalogo" ? (
        <div
          className="mt-6 space-y-6"
          role="tabpanel"
          id="produtos-panel-catalogo"
          aria-labelledby="produtos-tab-catalogo"
        >
          <section
            className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3"
            aria-label="Resumo do estoque"
          >
            {statTiles.map((tile) => (
              <article
                key={tile.label}
                className={cn(
                  "relative overflow-hidden rounded-xl border p-3 shadow-sm transition-[transform,box-shadow] duration-200 lg:rounded-2xl lg:p-4",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  tile.tone,
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-4 -top-8 size-20 rounded-full bg-white/40 blur-xl lg:size-28"
                />
                <div className="relative flex items-start gap-2 lg:gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg lg:size-11 lg:rounded-xl",
                      tile.iconWrap,
                    )}
                  >
                    <tile.icon className="size-4 lg:size-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[0.65rem] font-medium uppercase tracking-wide opacity-80 lg:text-crm-xs">
                      {tile.label}
                    </p>
                    <p className="font-display text-2xl font-semibold tabular-nums tracking-tight text-foreground lg:text-3xl">
                      {tile.value}
                    </p>
                    <p className="hidden text-crm-xs text-muted-foreground lg:block">{tile.hint}</p>
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
                  Organize por produto; cada cartão tem a sua própria lista de tamanhos com scroll quando
                  necessário. Sem checkout nesta etapa.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:shrink-0 sm:items-end">
                <Button
                  type="button"
                  className="min-h-11 w-full gap-2 shadow-lg shadow-primary/25 transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                  onClick={() => setDialogOpen(true)}
                >
                  <PackagePlus className="size-4" aria-hidden />
                  Novo produto
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-2 text-crm-xs text-muted-foreground sm:text-right"
                  onClick={() => setMainTab("guia")}
                >
                  Consultar guia de kimonos (A0–A5, M00–M4)
                </Button>
              </div>
            </div>
          </section>

          <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />

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
                    Ainda não há produtos. Crie o primeiro item para registar tamanhos e quantidades da
                    academia.
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
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
              {products.map((p) => (
                <ProductEditorCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className="mt-6"
          role="tabpanel"
          id="produtos-panel-guia"
          aria-labelledby="produtos-tab-guia"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-crm-sm text-muted-foreground">
              Referência para etiquetas de tamanho em kimonos. Volte ao catálogo para editar stock.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="min-h-10 w-full shrink-0 sm:w-auto"
              onClick={() => setMainTab("catalogo")}
            >
              Voltar ao catálogo
            </Button>
          </div>
          <KimonoSizeGuide />
        </div>
      )}
    </Tabs>
  );
}
