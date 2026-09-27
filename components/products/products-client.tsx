"use client";

import { useMemo, useState } from "react";
import { Boxes, Layers, NotebookPen, Package, PackagePlus, Ruler, Sparkles } from "lucide-react";

import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { DashboardStatTile } from "@/components/layout/dashboard-stat-tile";
import { EmptyState } from "@/components/layout/empty-state";
import { KimonoSizeGuide } from "@/components/products/kimono-size-guide";
import { ProductLedgerNotebook } from "@/components/products/product-ledger-notebook";
import type { LedgerNoteRow, LedgerStudentOption } from "@/lib/data/product-ledger-page";
import { ProductDialog } from "@/components/products/product-dialog";
import { ProductEditorCard } from "@/components/products/product-editor-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductRow } from "@/lib/data/products-page";

export function ProductsClient({
  products,
  ledgerNotes,
  ledgerStudents,
  ledgerAvailable,
}: {
  products: ProductRow[];
  ledgerNotes: LedgerNoteRow[];
  ledgerStudents: LedgerStudentOption[];
  ledgerAvailable: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mainTab, setMainTab] = useState("caderno");

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

  return (
    <Tabs value={mainTab} onValueChange={setMainTab} className="w-full space-y-8">
      <section className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4" aria-label="Resumo do estoque">
        <DashboardStatTile label="Produtos" value={products.length} icon={Package} accent="primary" />
        <DashboardStatTile label="Ativos" value={metrics.active} icon={Sparkles} accent="paid" />
        <DashboardStatTile label="Tamanhos" value={metrics.variants} icon={Layers} accent="info" />
        <DashboardStatTile label="Peças" value={metrics.stock} icon={Boxes} accent="pending" />
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-md border border-border/80 bg-muted/60 p-1 sm:flex sm:w-auto sm:justify-start">
          <TabsTrigger
            id="produtos-tab-caderno"
            value="caderno"
            className="min-h-11 gap-2 data-[state=active]:shadow-sm"
          >
            <NotebookPen className="size-4 shrink-0 opacity-80" aria-hidden />
            Caderno
          </TabsTrigger>
          <TabsTrigger
            id="produtos-tab-catalogo"
            value="catalogo"
            className="min-h-11 gap-2 data-[state=active]:shadow-sm"
          >
            <Package className="size-4 shrink-0 opacity-80" aria-hidden />
            Catálogo
          </TabsTrigger>
          <TabsTrigger
            id="produtos-tab-guia"
            value="guia"
            className="min-h-11 gap-2 data-[state=active]:shadow-sm"
          >
            <Ruler className="size-4 shrink-0 opacity-80" aria-hidden />
            Guia de kimonos
          </TabsTrigger>
        </TabsList>
        {mainTab === "catalogo" ? (
          <Button
            type="button"
            variant="outline"
            className="hidden min-h-11 shrink-0 gap-2 sm:inline-flex"
            onClick={() => setMainTab("guia")}
          >
            <Ruler className="size-4" aria-hidden />
            Ver tamanhos A0–A5 / M00–M4
          </Button>
        ) : null}
      </div>

      {mainTab === "caderno" ? (
        <div role="tabpanel" id="produtos-panel-caderno" aria-labelledby="produtos-tab-caderno">
          <ProductLedgerNotebook
            notes={ledgerNotes}
            students={ledgerStudents}
            products={products}
            available={ledgerAvailable}
          />
        </div>
      ) : null}

      {mainTab === "catalogo" ? (
        <div
          role="tabpanel"
          id="produtos-panel-catalogo"
          aria-labelledby="produtos-tab-catalogo"
        >
          <DashboardPanel
            icon={Package}
            title="Catálogo"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="type-lead max-w-xl">
                Organize por produto; cada cartão tem a sua própria lista de tamanhos.
              </p>
              <div className="flex flex-col gap-2 sm:shrink-0 sm:items-end">
                <Button
                  type="button"
                  className="min-h-11 w-full gap-2 shadow-md shadow-primary/20 sm:w-auto"
                  onClick={() => setDialogOpen(true)}
                >
                  <PackagePlus className="size-4" aria-hidden />
                  Novo produto
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 text-muted-foreground"
                  onClick={() => setMainTab("guia")}
                >
                  Consultar guia de kimonos (A0–A5, M00–M4)
                </Button>
              </div>
            </div>

            <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />

            {products.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Comece o seu catálogo interno"
                description="Ainda não há produtos. Crie o primeiro item para registar tamanhos e quantidades da academia."
                className="rounded-none border-0 bg-transparent shadow-none"
              >
                <Button
                  type="button"
                  className="min-h-11 gap-2"
                  onClick={() => setDialogOpen(true)}
                >
                  <PackagePlus className="size-4" aria-hidden />
                  Adicionar primeiro produto
                </Button>
              </EmptyState>
            ) : (
              <div className="flex flex-col gap-8">
                {products.map((p) => (
                  <ProductEditorCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </DashboardPanel>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="produtos-panel-guia"
          aria-labelledby="produtos-tab-guia"
        >
          <DashboardPanel
            icon={Ruler}
            title="Guia de kimonos"
          >
            <div className="mb-6">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 w-full shrink-0 sm:w-auto"
                onClick={() => setMainTab("catalogo")}
              >
                Voltar ao catálogo
              </Button>
            </div>
            <KimonoSizeGuide />
          </DashboardPanel>
        </div>
      )}
    </Tabs>
  );
}
