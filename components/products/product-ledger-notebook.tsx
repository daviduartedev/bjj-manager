"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NotebookPen } from "lucide-react";

import {
  createLedgerNote,
  deleteLedgerNote,
  issueLedgerReceipt,
  markLedgerInstallmentPaid,
  updateLedgerNote,
} from "@/actions/product-ledger";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { formActionsClass, primaryActionClass, secondaryActionClass } from "@/lib/ui/form-chrome";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductRow } from "@/lib/data/products-page";
import type { LedgerNoteRow, LedgerStudentOption } from "@/lib/data/product-ledger-page";
import {
  LEDGER_PAYMENT_METHOD_LABELS,
  type LedgerKind,
  type LedgerPaymentMethod,
} from "@/lib/products/ledger";
import { cn } from "@/lib/utils";

function formatBrl(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
}

function parseReaisToCents(raw: string): number | null {
  const normalized = raw.replace(/\s/g, "").replace("R$", "").replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export function ProductLedgerNotebook({
  notes,
  students,
  products,
  available,
}: {
  notes: LedgerNoteRow[];
  students: LedgerStudentOption[];
  products: ProductRow[];
  available: boolean;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<LedgerKind>("sale");
  const [studentId, setStudentId] = useState("");
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [total, setTotal] = useState("");
  const [installments, setInstallments] = useState("1");
  const [method, setMethod] = useState<LedgerPaymentMethod>("pix");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todos" | "a_receber" | "a_pagar" | "quitado">("todos");

  const selectedProduct = products.find((p) => p.id === productId);
  const variants = selectedProduct?.variants ?? [];
  const editingRow = notes.find((row) => row.id === editingId) ?? null;
  const moneyLocked = Boolean(editingRow && editingRow.receivedCents > 0);

  function reaisFromCents(cents: number) {
    return (cents / 100).toFixed(2).replace(".", ",");
  }

  function resetForm() {
    setEditingId(null);
    setKind("sale");
    setStudentId("");
    setProductId("");
    setVariantId("");
    setQuantity("1");
    setTotal("");
    setInstallments("1");
    setMethod("pix");
    setTitle("");
    setNote("");
  }

  const visible = useMemo(() => {
    if (filter === "todos") return notes;
    return notes.filter((row) => row.bucket === filter);
  }, [filter, notes]);

  const totals = useMemo(
    () => ({
      receber: notes.filter((n) => n.bucket === "a_receber").reduce((s, n) => s + n.remainingCents, 0),
      pagar: notes.filter((n) => n.bucket === "a_pagar").reduce((s, n) => s + n.remainingCents, 0),
    }),
    [notes],
  );

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const totalCents = parseReaisToCents(total);
    if (!totalCents) {
      toast.error("Indique o valor.");
      return;
    }
    setSaving(true);
    try {
      const payload =
        kind === "sale"
          ? {
              kind: "sale" as const,
              studentId,
              productId,
              productVariantId: variantId || null,
              quantity: Number(quantity),
              totalCents,
              installmentCount: Number(installments),
              paymentMethod: method,
              note: note || null,
            }
          : {
              kind: "outlay" as const,
              title,
              totalCents,
              installmentCount: Number(installments),
              paymentMethod: method,
              note: note || null,
            };
      const r = editingId
        ? await updateLedgerNote({ ...payload, noteId: editingId })
        : await createLedgerNote(payload);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(editingId ? "Anotação atualizada." : kind === "sale" ? "Venda anotada." : "Saída anotada.");
      resetForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function onEdit(row: LedgerNoteRow) {
    setEditingId(row.id);
    setKind(row.kind);
    setStudentId(row.studentId ?? "");
    setProductId(row.productId ?? "");
    setVariantId(row.productVariantId ?? "");
    setQuantity(String(row.quantity));
    setTotal(reaisFromCents(row.totalCents));
    setInstallments(String(row.installmentCount));
    setMethod(row.paymentMethod);
    setTitle(row.kind === "outlay" ? row.title : "");
    setNote(row.note ?? "");
    document.getElementById("ledger-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onDelete(noteId: string) {
    if (!window.confirm("Excluir esta anotação do caderno?")) return;
    const r = await deleteLedgerNote({ noteId });
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    if (editingId === noteId) resetForm();
    toast.success("Anotação excluída.");
    router.refresh();
  }

  async function onPay(installmentId: string) {
    const r = await markLedgerInstallmentPaid({ installmentId });
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Parcela marcada.");
    router.refresh();
  }

  async function onReceipt(noteId: string) {
    const r = await issueLedgerReceipt({ noteId });
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Recibo emitido.");
    if (r.downloadUrl) window.open(r.downloadUrl, "_blank", "noopener,noreferrer");
    router.refresh();
  }

  if (!available) {
    return (
      <EmptyState
        icon={NotebookPen}
        title="Caderno ainda não está no banco"
        description="Aplique db/migrations/016_product_ledger_notes.sql (ou pnpm db:apply) para anotar vendas e saídas."
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <form
        id="ledger-form"
        onSubmit={onCreate}
        className="rounded-lg border border-border/80 bg-[hsl(42_33%_97%)] p-5 shadow-sm dark:bg-card"
      >
        <p className="font-display text-lg font-semibold tracking-tight">
          {editingId ? "Editar anotação" : "Nova anotação"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {moneyLocked
            ? "Parcela já paga: altere o lembrete e o pagamento, ou exclua o registro."
            : "Bloco de lembretes: venda a um aluno ou conta a pagar da academia."}
        </p>
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={kind === "sale" ? "default" : "outline"}
              disabled={moneyLocked}
              onClick={() => setKind("sale")}
            >
              Venda
            </Button>
            <Button
              type="button"
              variant={kind === "outlay" ? "default" : "outline"}
              disabled={moneyLocked}
              onClick={() => setKind("outlay")}
            >
              A pagar
            </Button>
          </div>

          {kind === "sale" ? (
            <>
              <div className="space-y-2">
                <Label>Aluno</Label>
                <Select value={studentId} onValueChange={setStudentId} disabled={moneyLocked}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quem comprou" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select
                  value={productId}
                  disabled={moneyLocked}
                  onValueChange={(value) => {
                    setProductId(value);
                    setVariantId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Quimono, rash guard…" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {variants.length > 0 ? (
                <div className="space-y-2">
                  <Label>Tamanho</Label>
                  <Select value={variantId} onValueChange={setVariantId} disabled={moneyLocked}>
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.size_label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="ledger-qty">Quantidade</Label>
                <Input
                  id="ledger-qty"
                  inputMode="numeric"
                  value={quantity}
                  disabled={moneyLocked}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="ledger-title">O que a academia tem a pagar</Label>
              <Input
                id="ledger-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Fornecedor, reposição de estoque…"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ledger-total">Valor</Label>
              <Input
                id="ledger-total"
                value={total}
                disabled={moneyLocked}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="350,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger-x">Vezes</Label>
              <Input
                id="ledger-x"
                inputMode="numeric"
                value={installments}
                disabled={moneyLocked}
                onChange={(e) => setInstallments(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pagamento</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as LedgerPaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEDGER_PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ledger-note">Lembrete</Label>
            <Input
              id="ledger-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Entregar na quinta, deixar na secretaria…"
            />
          </div>

          <div className={formActionsClass}>
            {editingId ? (
              <Button type="button" className={secondaryActionClass} disabled={saving} onClick={resetForm}>
                Cancelar
              </Button>
            ) : null}
            <Button type="submit" className={primaryActionClass} disabled={saving}>
              {saving ? "Salvando…" : editingId ? "Salvar" : "Anotar no caderno"}
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/80 bg-card px-4 py-3">
            <p className="text-crm-xs font-semibold uppercase tracking-wide text-muted-foreground">
              A receber
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{formatBrl(totals.receber)}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card px-4 py-3">
            <p className="text-crm-xs font-semibold uppercase tracking-wide text-muted-foreground">
              A pagar
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{formatBrl(totals.pagar)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todos", "Todas"],
              ["a_receber", "A receber"],
              ["a_pagar", "A pagar"],
              ["quitado", "Quitadas"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="Caderno em branco"
            description="Anote a primeira venda de quimono ou rash guard, ou uma conta a pagar."
          />
        ) : (
          <ul className="space-y-4">
            {visible.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-border/80 bg-[hsl(42_40%_98%)] p-5 shadow-sm dark:bg-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold tracking-tight">{row.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.kind === "sale" ? "Venda" : "Saída"} ·{" "}
                      {LEDGER_PAYMENT_METHOD_LABELS[row.paymentMethod]} · {row.installmentCount}x ·{" "}
                      {formatBrl(row.totalCents)}
                    </p>
                    {row.note ? <p className="mt-2 text-sm">{row.note}</p> : null}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      row.bucket === "a_receber" && "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
                      row.bucket === "a_pagar" && "bg-red-100 text-red-950 dark:bg-red-950 dark:text-red-100",
                      row.bucket === "quitado" && "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100",
                    )}
                  >
                    {row.bucket === "a_receber"
                      ? `A receber ${formatBrl(row.remainingCents)}`
                      : row.bucket === "a_pagar"
                        ? `A pagar ${formatBrl(row.remainingCents)}`
                        : "Quitado"}
                  </span>
                </div>
                <ol className="mt-4 space-y-2">
                  {row.installments.map((parcel) => (
                    <li key={parcel.id} className="flex items-center justify-between gap-3 text-sm">
                      <span>
                        {parcel.sequence}/{row.installmentCount} · {formatBrl(parcel.amountCents)}
                        {parcel.paidAt ? " · paga" : ""}
                      </span>
                      {parcel.paidAt ? null : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onPay(parcel.id)}
                        >
                          Marcar paga
                        </Button>
                      )}
                    </li>
                  ))}
                </ol>
                <div className={`mt-4 ${formActionsClass}`}>
                  {row.canIssueReceipt ? (
                    <Button
                      type="button"
                      className={secondaryActionClass}
                      onClick={() => onReceipt(row.id)}
                    >
                      {row.receiptDocumentId ? "Abrir recibo" : "Emitir recibo"}
                    </Button>
                  ) : null}
                  <Button type="button" className={secondaryActionClass} onClick={() => onEdit(row)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className={primaryActionClass}
                    onClick={() => onDelete(row.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
