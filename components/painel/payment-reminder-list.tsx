"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  filterPaymentReminderRows,
  paginatePaymentReminderRows,
  PAYMENT_REMINDER_PAGE_SIZE,
  type PaymentReminderPhoneFilter,
  type PaymentReminderRow,
} from "@/lib/painel/payment-reminders";
import { routeAlunoPerfil } from "@/lib/routes";

const filterControl =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm";

function PaymentReminderWhatsAppButton(props: { href: string | null }) {
  const label = (
    <>
      <MessageCircle className="size-4" aria-hidden />
      Enviar lembrete
    </>
  );

  if (props.href) {
    return (
      <Button asChild variant="outline" size="sm" className="min-h-11 shrink-0">
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="payment-reminder-whatsapp"
        >
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="min-h-11 shrink-0"
            data-testid="payment-reminder-whatsapp-disabled"
          >
            {label}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Aluno sem telefone válido para WhatsApp.</TooltipContent>
    </Tooltip>
  );
}

export function PaymentReminderList(props: { rows: PaymentReminderRow[] }) {
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState<PaymentReminderPhoneFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterPaymentReminderRows(props.rows, { query, phone }),
    [props.rows, query, phone],
  );
  const view = useMemo(
    () => paginatePaymentReminderRows(filtered, page, PAYMENT_REMINDER_PAGE_SIZE),
    [filtered, page],
  );

  if (props.rows.length === 0) {
    return (
      <p className="text-crm-sm text-muted-foreground">
        Nenhum aluno com mensalidade atrasada neste mês.
      </p>
    );
  }

  const from = view.total === 0 ? 0 : (view.page - 1) * PAYMENT_REMINDER_PAGE_SIZE + 1;
  const to = Math.min(view.page * PAYMENT_REMINDER_PAGE_SIZE, view.total);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="lembrete-busca" className="type-field-label">
              Buscar
            </Label>
            <Input
              id="lembrete-busca"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Nome do aluno"
              className={filterControl}
              data-testid="payment-reminder-search"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="lembrete-exibir" className="type-field-label">
              Exibir
            </Label>
            <Select
              value={phone}
              onValueChange={(v) => {
                setPhone(v as PaymentReminderPhoneFilter);
                setPage(1);
              }}
            >
              <SelectTrigger
                id="lembrete-exibir"
                className={filterControl}
                data-testid="payment-reminder-phone-filter"
              >
                <SelectValue placeholder="Exibir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="whatsapp">Com WhatsApp</SelectItem>
                <SelectItem value="no_phone">Sem telefone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {view.total === 0 ? (
          <p className="text-crm-sm text-muted-foreground">
            Nenhum aluno corresponde aos filtros.
          </p>
        ) : (
          <>
            <p className="text-crm-xs text-muted-foreground" data-testid="payment-reminder-count">
              {from}–{to} de {view.total}
            </p>
            <ul className="space-y-2">
              {view.rows.map((r) => (
                <li
                  key={r.studentId}
                  data-testid="payment-reminder-row"
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <Link
                    href={routeAlunoPerfil(r.studentId)}
                    className="text-crm-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    {r.fullName}
                  </Link>
                  <PaymentReminderWhatsAppButton href={r.whatsappHref} />
                </li>
              ))}
            </ul>
            {view.pageCount > 1 ? (
              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 min-w-[44px]"
                  disabled={view.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  data-testid="payment-reminder-prev"
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 min-w-[44px]"
                  disabled={view.page >= view.pageCount}
                  onClick={() => setPage((p) => Math.min(view.pageCount, p + 1))}
                  data-testid="payment-reminder-next"
                >
                  Seguinte
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
