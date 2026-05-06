import type { Metadata } from "next";

import { ProductsClient } from "@/components/products/products-client";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { loadProductsPageData } from "@/lib/data/products-page";

export const metadata: Metadata = {
  title: "Produtos",
};

export default async function ProdutosPage() {
  let products;
  try {
    products = await loadProductsPageData();
  } catch (err) {
    console.error("[produtos] loadProductsPageData failed", err);

    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div data-tour="page-produtos">
          <DashboardPageHero
            className="-mx-4 rounded-b-3xl border-b border-primary/15 bg-gradient-to-br from-primary/[0.08] via-background to-bjj-blue/[0.09] px-4 pb-10 pt-2 ring-1 ring-primary/10 sm:-mx-6 sm:px-6"
            badge="Controle interno"
            title="Produtos"
            description="Cadastro de produtos, tamanhos e estoque manual da academia. Sem venda nem checkout nesta etapa."
          />
        </div>

        <DashboardPanel
          className="border-l-[5px] border-l-bjj-yellow ring-1 ring-bjj-yellow/20"
          title="Não foi possível carregar produtos"
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              O servidor não conseguiu ler a tabela de produtos na base de dados.
              No ambiente de produção, é preciso aplicar a migração que cria{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                products
              </code>{" "}
              e{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                product_variants
              </code>{" "}
              (ficheiro{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                db/migrations/002_products_inventory.sql
              </code>
              ) no mesmo projeto Supabase ligado ao deploy (variáveis{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                NEXT_PUBLIC_SUPABASE_*
              </code>
              ).
            </p>
            <p>
              Confirme também nos logs da Vercel (Functions → Runtime Logs) a mensagem
              completa deste erro; o digest mostrado na página serve apenas para cruzar
              com o log no servidor.
            </p>
          </div>
        </DashboardPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div data-tour="page-produtos">
        <DashboardPageHero
          className="-mx-4 rounded-b-3xl border-b border-primary/15 bg-gradient-to-br from-primary/[0.08] via-background to-bjj-blue/[0.09] px-4 pb-10 pt-2 ring-1 ring-primary/10 sm:-mx-6 sm:px-6"
          badge="Controle interno"
          title="Produtos"
          description="Cadastro de produtos, tamanhos e estoque manual da academia. Sem venda nem checkout nesta etapa."
        />
      </div>

      <ProductsClient products={products} />
    </div>
  );
}
