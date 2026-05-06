"use client";

import { useState } from "react";

import { ProductDialog } from "@/components/products/product-dialog";
import { ProductEditorCard } from "@/components/products/product-editor-card";
import { Button } from "@/components/ui/button";
import type { ProductRow } from "@/lib/data/products-page";

export function ProductsClient({ products }: { products: ProductRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          className="min-h-11 w-full shadow-md shadow-primary/15 transition-shadow hover:shadow-lg hover:shadow-primary/20 sm:w-auto"
          onClick={() => setDialogOpen(true)}
        >
          Novo produto
        </Button>
      </div>

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <div className="space-y-6">
        {products.length === 0 ? (
          <p className="text-crm-sm text-muted-foreground" role="status">
            Nenhum produto cadastrado. Use Novo produto ou confira o provisionamento da conta.
          </p>
        ) : (
          products.map((p) => <ProductEditorCard key={p.id} product={p} />)
        )}
      </div>
    </>
  );
}
