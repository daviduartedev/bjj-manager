import { Copy, QrCode } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isStudentPortalPaymentsPixEnabled } from "@/lib/feature-flags/student-portal";

const PLACEHOLDER_PIX_KEY = "00000000000";

export function PixPlaceholder() {
  const pixEnabled = isStudentPortalPaymentsPixEnabled();
  const actionsDisabled = !pixEnabled;

  return (
    <section
      className="rounded-xl border border-border/80 border-l-[3px] border-l-primary/30 bg-card p-6 shadow-sm ring-1 ring-border/40"
      aria-labelledby="pix-placeholder-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 id="pix-placeholder-heading" className="type-card-heading">
            Pagamento via PIX
          </h2>
          <p className="type-lead max-w-prose text-muted-foreground">
            {pixEnabled
              ? "O pagamento online estará disponível em breve nesta área."
              : "Pagamento online ainda não está activo para a sua academia."}
          </p>
        </div>
        <Badge variant="pending" className="shrink-0">
          Em breve
        </Badge>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:items-start">
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex aspect-square w-full max-w-[14rem] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40"
            aria-hidden
          >
            <QrCode className="size-16 text-muted-foreground/70" strokeWidth={1.25} />
          </div>
          <p className="text-center text-crm-xs text-muted-foreground">QR code de exemplo</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pix-key">Chave PIX da academia</Label>
            <Input
              id="pix-key"
              readOnly
              disabled={actionsDisabled}
              value={PLACEHOLDER_PIX_KEY}
              aria-describedby="pix-key-help"
            />
            <p id="pix-key-help" className="text-crm-xs text-muted-foreground">
              Valor fictício apenas para pré-visualização do layout.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={actionsDisabled} className="min-h-11 gap-2">
              Pagar mensalidade
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={actionsDisabled}
              className="min-h-11 gap-2"
            >
              <Copy className="size-4" aria-hidden />
              Copiar chave
            </Button>
          </div>

          {actionsDisabled ? (
            <p className="text-crm-sm text-muted-foreground" role="status">
              As acções de pagamento ficam desactivadas enquanto o PIX online não estiver activo.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
