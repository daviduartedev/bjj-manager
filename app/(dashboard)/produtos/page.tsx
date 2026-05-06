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
      <div className="mx-auto max-w-7xl space-y-6">
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
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              O servidor não conseguiu consultar produtos no Supabase ligado a este deploy
              (variáveis{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              e{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
              ). Confirme que é o <strong className="text-foreground">mesmo projeto</strong> em que corre o SQL.
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-foreground/90">
              <li>
                Se as tabelas ainda não existem: no Supabase →{" "}
                <strong className="font-medium">SQL Editor</strong>, execute o ficheiro{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  db/migrations/002_products_inventory.sql
                </code>{" "}
                (cria{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">products</code> e{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">product_variants</code>
                ).
              </li>
              <li>
                Execute também{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  db/migrations/003_product_audience_variant_line.sql
                </code>{" "}
                (colunas <code className="rounded bg-muted px-1 py-0.5 text-xs">audience</code>{" "}
                e <code className="rounded bg-muted px-1 py-0.5 text-xs">line</code>) para filtros
                femininos e gravação de variantes com linha. Em builds recentes, a{" "}
                <strong className="text-foreground">leitura</strong> da página pode funcionar só com a 002,
                mas criar/editar tamanhos continua a exigir a 003 quando o servidor usa{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">line</code>.
              </li>
              <li>
                Se usa RLS por conta, aplique as políticas de{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">db/policies.sql</code> para{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">products</code> /{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">product_variants</code>.
              </li>
            </ol>
            <p>
              Na Vercel, abra{" "}
              <strong className="font-medium text-foreground">Functions → Runtime Logs</strong>{" "}
              no deployment correspondente para ver a mensagem completa do PostgREST/Supabase (ex.:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                relation does not exist
              </code>{" "}
              ou{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                column ... does not exist
              </code>
              ).
            </p>
          </div>
        </DashboardPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
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
