import type { Metadata } from "next";

import { ProductsClient } from "@/components/products/products-client";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PageFrame } from "@/components/prototype/page-frame";
import { loadProductLedgerPageData } from "@/lib/data/product-ledger-page";
import { loadProductsPageData } from "@/lib/data/products-page";
import { Package } from "lucide-react";

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
      <PageFrame
        title="A loja da academia"
        icon={Package}
        tone="orange"
      >
        <div className="space-y-8" data-tour="page-produtos">
          <DashboardPanel icon={Package} title="Não foi possível carregar produtos">
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
                Opcional:{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  db/migrations/004_product_catalog_visuals_and_variants.sql
                </code>{" "}
                — nome Zanshin e variantes iniciais (kimono azul por tamanho; rash manga curta/longa).
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
      </PageFrame>
    );
  }

  const ledger = await loadProductLedgerPageData().catch(() => ({
    notes: [],
    students: [],
    available: false,
  }));

  return (
    <PageFrame
      title="A loja da academia"
      icon={Package}
      tone="orange"
    >
      <div data-tour="page-produtos">
        <ProductsClient
          products={products}
          ledgerNotes={ledger.notes}
          ledgerStudents={ledger.students}
          ledgerAvailable={ledger.available}
        />
      </div>
    </PageFrame>
  );
}
