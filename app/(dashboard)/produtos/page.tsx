import type { Metadata } from "next";

import { ProductsClient } from "@/components/products/products-client";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { loadProductsPageData } from "@/lib/data/products-page";

export const metadata: Metadata = {
  title: "Produtos",
};

export default async function ProdutosPage() {
  const products = await loadProductsPageData();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div data-tour="page-produtos">
        <DashboardPageHero
          badge="Controle interno"
          title="Produtos"
          description="Cadastro de produtos, tamanhos e estoque manual da academia. Sem venda nem checkout nesta etapa."
        />
      </div>

      <ProductsClient products={products} />
    </div>
  );
}
