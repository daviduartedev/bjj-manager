"use server";

import { revalidatePath } from "next/cache";

import { mapBillingActionError } from "@/lib/billing/action-errors";
import { BillingDomainError } from "@/lib/billing/domain-error";
import { getEffectivePrice } from "@/lib/billing/get-effective-price";
import { normalizeReferenceMonth } from "@/lib/billing/reference-month";
import { applyStudentPlanChange } from "@/lib/billing/student-plan";
import { logDocumentEvent } from "@/lib/documents/audit";
import { buildPaymentReceiptPayload } from "@/lib/documents/payload-builder";
import { DocumentGenerationService } from "@/lib/documents/service";
import { archiveDocumentArtifact } from "@/lib/documents/storage";
import { ROUTES } from "@/lib/routes";
import {
  recordPaymentSchema,
  recordPaymentsBulkSchema,
  setStudentPlanSchema,
  updatePlanPriceSchema,
  updatePlanSchema,
  voidPaymentSchema,
} from "@/lib/validations/billing";
import { createClient } from "@/lib/supabase/server";

export type BillingActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type ReceiptOutcome =
  | { status: "ready"; documentId: string; number: string; reused: boolean }
  | { status: "failed"; error: string }
  | { status: "skipped" };

export type RecordPaymentResult =
  | {
      ok: true;
      paymentId: string;
      studentId: string;
      receipt: ReceiptOutcome;
    }
  | { ok: false; error: string };

export type RecordPaymentsBulkResult =
  | {
      ok: true;
      recorded: number;
      failures: { studentId: string; error: string }[];
    }
  | { ok: false; error: string };

export type RetryReceiptResult =
  | {
      ok: true;
      receipt: ReceiptOutcome;
    }
  | { ok: false; error: string };

/**
 * Estado do recibo automático para um pagamento confirmado:
 * - `ready`     há um documento `payment_receipt` em estado `ready`.
 * - `failed`    a última tentativa terminou em erro, dá para retry.
 * - `missing`   o pagamento existe e está confirmado mas ainda não há documento gerado
 *               (pode acontecer com pagamentos antigos, geração saltada por flag,
 *               ou bolsista/outro).
 */
export type ReceiptLookup =
  | {
      status: "ready";
      documentId: string;
      number: string;
      reused: true;
    }
  | { status: "failed"; documentId: string; error: string }
  | { status: "missing" };

export type GetReceiptForPaymentResult =
  | { ok: true; receipt: ReceiptLookup }
  | { ok: false; error: string };

export async function updatePlanPrice(
  input: unknown,
): Promise<BillingActionResult> {
  try {
    const parsed = updatePlanPriceSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        Object.values(first).flat()[0] ??
        "Verifique o preço indicado e tente novamente.";
      return { ok: false, error: msg };
    }

    const { planId, priceCents } = parsed.data;
    const supabase = await createClient();

    const { data: row, error: selErr } = await supabase
      .from("plans")
      .select("id")
      .eq("id", planId)
      .maybeSingle();

    if (selErr) throw selErr;
    if (!row) {
      return {
        ok: false,
        error:
          "Plano não encontrado ou já não está disponível nesta academia.",
      };
    }

    const { error: upErr } = await supabase
      .from("plans")
      .update({
        price_cents: priceCents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId);

    if (upErr) throw upErr;

    revalidatePath(ROUTES.alunos);
    revalidatePath(ROUTES.configuracoes);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function updatePlan(input: unknown): Promise<BillingActionResult> {
  try {
    const parsed = updatePlanSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        Object.values(first).flat()[0] ??
        "Verifique os dados do plano e tente novamente.";
      return { ok: false, error: msg };
    }

    const { planId, name, priceCents, active } = parsed.data;
    const supabase = await createClient();

    const { data: row, error: selErr } = await supabase
      .from("plans")
      .select("id")
      .eq("id", planId)
      .maybeSingle();

    if (selErr) throw selErr;
    if (!row) {
      return {
        ok: false,
        error:
          "Plano não encontrado ou já não está disponível nesta academia.",
      };
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) patch.name = name;
    if (priceCents !== undefined) patch.price_cents = priceCents;
    if (active !== undefined) patch.active = active;

    const { error: upErr } = await supabase
      .from("plans")
      .update(patch)
      .eq("id", planId);

    if (upErr) throw upErr;

    revalidatePath(ROUTES.alunos);
    revalidatePath(ROUTES.mensalidades);
    revalidatePath(ROUTES.configuracoes);
    revalidatePath(ROUTES.painel);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function setStudentPlan(input: unknown): Promise<BillingActionResult> {
  try {
    const parsed = setStudentPlanSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        Object.values(first).flat()[0] ??
        "Verifique o plano, o dia de vencimento e tente novamente.";
      return { ok: false, error: msg };
    }

    const { studentId, planId, dueDay, customPriceCents } = parsed.data;
    const supabase = await createClient();

    await applyStudentPlanChange({
      supabase,
      studentId,
      planId,
      dueDay,
      customPriceCents,
    });

    revalidatePath(ROUTES.alunos);
    revalidatePath(`${ROUTES.alunos}/${studentId}/editar`);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

function parsePaidAt(input: string | undefined): string | null {
  if (input === undefined || input === "") return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function revalidateGlobalBilling() {
  revalidatePath(ROUTES.painel);
  revalidatePath(ROUTES.mensalidades);
  revalidatePath(ROUTES.alunos);
}

function revalidateStudentBilling(studentId: string) {
  revalidatePath(`${ROUTES.alunos}/${studentId}`);
  revalidatePath(`${ROUTES.mensalidades}/${studentId}`);
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

async function fetchEffectivePriceCents(
  supabase: SupabaseServer,
  studentId: string,
): Promise<{ ok: true; effectiveCents: number } | { ok: false; error: string }> {
  const { data: spRow, error: spErr } = await supabase
    .from("student_plans")
    .select(
      `
      custom_price_cents,
      plans!inner ( price_cents )
    `,
    )
    .eq("student_id", studentId)
    .is("ended_at", null)
    .maybeSingle();

  if (spErr) throw spErr;
  if (!spRow) {
    return {
      ok: false,
      error: mapBillingActionError(new BillingDomainError("NO_OPEN_PLAN")),
    };
  }

  const rawPlans = spRow.plans as
    | { price_cents: number }
    | { price_cents: number }[]
    | null;
  const planEmbed = Array.isArray(rawPlans) ? rawPlans[0] : rawPlans;
  if (!planEmbed) {
    return {
      ok: false,
      error: mapBillingActionError(new BillingDomainError("PLAN_NOT_AVAILABLE")),
    };
  }
  const effectiveCents = getEffectivePrice({
    customPriceCents: spRow.custom_price_cents,
    planPriceCents: planEmbed.price_cents,
  });

  return { ok: true, effectiveCents };
}

async function upsertRecordedPaymentRow(
  supabase: SupabaseServer,
  args: {
    studentId: string;
    refMonth: string;
    status: "paid" | "scholarship";
    amountCents: number;
    paidAtIso: string | null;
    notes: string | null;
    paymentMethod: string | null;
  },
): Promise<{ paymentId: string }> {
  const {
    studentId,
    refMonth,
    status,
    amountCents,
    paidAtIso,
    notes,
    paymentMethod,
  } = args;
  const timestamp = paidAtIso ?? new Date().toISOString();

  const { data, error: upErr } = await supabase
    .from("payments")
    .upsert(
      {
        student_id: studentId,
        reference_month: refMonth,
        amount_cents: amountCents,
        status,
        paid_at: timestamp,
        notes: notes ?? null,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,reference_month" },
    )
    .select("id")
    .single();

  if (upErr) throw upErr;
  return { paymentId: data.id as string };
}

async function tryAutoIssueReceipt(
  supabase: SupabaseServer,
  args: { paymentId: string; studentId: string; userId: string | null },
): Promise<ReceiptOutcome> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", args.userId ?? "")
      .maybeSingle();
    if (!profile?.account_id) {
      return { status: "skipped" };
    }
    const accountId = profile.account_id as string;

    const built = await buildPaymentReceiptPayload(supabase, {
      accountId,
      paymentId: args.paymentId,
    });

    const service = new DocumentGenerationService(supabase);
    const r = await service.generate({
      accountId,
      type: "payment_receipt",
      payload: built.payload,
      idempotencyKey: args.paymentId,
      paymentId: args.paymentId,
      studentId: built.studentId,
      createdByUserId: args.userId ?? null,
    });

    if (r.ok) {
      logDocumentEvent({
        level: "info",
        event: "auto_receipt.ready",
        accountId,
        documentId: r.documentId,
        documentType: "payment_receipt",
        payload: { paymentId: args.paymentId, reused: r.reused },
      });
      return {
        status: "ready",
        documentId: r.documentId,
        number: r.number,
        reused: r.reused,
      };
    }

    logDocumentEvent({
      level: "warn",
      event: "auto_receipt.failed",
      accountId,
      documentType: "payment_receipt",
      payload: { paymentId: args.paymentId, code: r.errorCode },
    });
    return { status: "failed", error: r.errorMessage };
  } catch (err) {
    const message = (err as Error).message ?? "Falha ao gerar recibo.";
    logDocumentEvent({
      level: "warn",
      event: "auto_receipt.exception",
      payload: { paymentId: args.paymentId, message },
    });
    return { status: "failed", error: message };
  }
}

export async function recordPayment(input: unknown): Promise<RecordPaymentResult> {
  try {
    const parsed = recordPaymentSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        Object.values(first).flat()[0] ??
        "Verifique o mês de referência e o valor e tente novamente.";
      return { ok: false, error: msg };
    }

    const {
      studentId,
      referenceMonth,
      recordingKind,
      paidAt,
      notes,
      paymentMethod,
    } = parsed.data;
    const refMonth = normalizeReferenceMonth(referenceMonth);
    if (!refMonth) {
      return {
        ok: false,
        error: "Mês de referência inválido. Use uma data válida.",
      };
    }

    const paidAtIso = parsePaidAt(paidAt);
    if (paidAt !== undefined && paidAt !== "" && paidAtIso === null) {
      return {
        ok: false,
        error: "Data ou hora do pagamento inválida.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const price = await fetchEffectivePriceCents(supabase, studentId);
    if (!price.ok) {
      return { ok: false, error: price.error };
    }

    let inserted: { paymentId: string };
    if (recordingKind === "scholarship") {
      inserted = await upsertRecordedPaymentRow(supabase, {
        studentId,
        refMonth,
        status: "scholarship",
        amountCents: 0,
        paidAtIso,
        notes: notes ?? null,
        paymentMethod: paymentMethod ?? null,
      });
    } else {
      inserted = await upsertRecordedPaymentRow(supabase, {
        studentId,
        refMonth,
        status: "paid",
        amountCents: price.effectiveCents,
        paidAtIso,
        notes: notes ?? null,
        paymentMethod: paymentMethod ?? null,
      });
    }

    let receipt: ReceiptOutcome = { status: "skipped" };
    if (recordingKind === "paid") {
      receipt = await tryAutoIssueReceipt(supabase, {
        paymentId: inserted.paymentId,
        studentId,
        userId: user?.id ?? null,
      });
    }

    revalidateGlobalBilling();
    revalidateStudentBilling(studentId);
    return {
      ok: true,
      paymentId: inserted.paymentId,
      studentId,
      receipt,
    };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function recordPaymentsBulk(
  input: unknown,
): Promise<RecordPaymentsBulkResult> {
  try {
    const parsed = recordPaymentsBulkSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        Object.values(first).flat()[0] ??
        "Verifique os alunos e o mês de referência.";
      return { ok: false, error: msg };
    }

    const { studentIds, referenceMonth, paidAt, notes, paymentMethod } =
      parsed.data;
    const refMonth = normalizeReferenceMonth(referenceMonth);
    if (!refMonth) {
      return {
        ok: false,
        error: "Mês de referência inválido. Use uma data válida.",
      };
    }

    const paidAtIso = parsePaidAt(paidAt);
    if (paidAt !== undefined && paidAt !== "" && paidAtIso === null) {
      return {
        ok: false,
        error: "Data ou hora do pagamento inválida.",
      };
    }

    const supabase = await createClient();
    const failures: { studentId: string; error: string }[] = [];
    let recorded = 0;
    const okIds: string[] = [];

    for (const studentId of studentIds) {
      const price = await fetchEffectivePriceCents(supabase, studentId);
      if (!price.ok) {
        failures.push({ studentId, error: price.error });
        continue;
      }
      try {
        await upsertRecordedPaymentRow(supabase, {
          studentId,
          refMonth,
          status: "paid",
          amountCents: price.effectiveCents,
          paidAtIso,
          notes: notes ?? null,
          paymentMethod: paymentMethod ?? null,
        });
        recorded += 1;
        okIds.push(studentId);
      } catch (e) {
        failures.push({
          studentId,
          error: mapBillingActionError(e),
        });
      }
    }

    if (recorded > 0) {
      revalidateGlobalBilling();
      for (const id of okIds) {
        revalidateStudentBilling(id);
      }
    }

    return { ok: true, recorded, failures };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function voidPayment(input: unknown): Promise<BillingActionResult> {
  try {
    const parsed = voidPaymentSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        Object.values(first).flat()[0] ??
        "Identificador de pagamento inválido.";
      return { ok: false, error: msg };
    }

    const { paymentId } = parsed.data;
    const supabase = await createClient();

    const { data: row, error: selErr } = await supabase
      .from("payments")
      .select("id, student_id")
      .eq("id", paymentId)
      .maybeSingle();

    if (selErr) throw selErr;
    if (!row) {
      throw new BillingDomainError("PAYMENT_NOT_AVAILABLE");
    }

    const studentId = row.student_id as string;

    const { data: receipts } = await supabase
      .from("generated_documents")
      .select("id, pdf_path, status")
      .eq("payment_id", paymentId)
      .neq("status", "archived");

    if (receipts && receipts.length > 0) {
      for (const r of receipts) {
        try {
          if (r.pdf_path) {
            await archiveDocumentArtifact(supabase, r.pdf_path as string);
          }
        } catch (storageErr) {
          logDocumentEvent({
            level: "warn",
            event: "auto_receipt.archive_storage_failed",
            documentId: (r.id as string) ?? undefined,
            payload: { message: (storageErr as Error).message },
          });
        }
      }
      const ids = receipts.map((r) => r.id as string);
      await supabase
        .from("generated_documents")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .in("id", ids);
    }

    const { error: delErr } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (delErr) throw delErr;

    revalidateGlobalBilling();
    revalidateStudentBilling(studentId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function retryReceiptGeneration(
  input: unknown,
): Promise<RetryReceiptResult> {
  try {
    const parsed = voidPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Identificador de pagamento inválido." };
    }
    const { paymentId } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sessão inválida." };

    const { data: payment } = await supabase
      .from("payments")
      .select("id, student_id, status")
      .eq("id", paymentId)
      .maybeSingle();
    if (!payment) {
      return { ok: false, error: "Pagamento não encontrado." };
    }
    if (payment.status !== "paid") {
      return {
        ok: false,
        error: "Apenas pagamentos confirmados geram recibo.",
      };
    }

    const receipt = await tryAutoIssueReceipt(supabase, {
      paymentId,
      studentId: payment.student_id as string,
      userId: user.id,
    });

    revalidateGlobalBilling();
    revalidateStudentBilling(payment.student_id as string);

    return { ok: true, receipt };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

/**
 * Lê (sem regenerar) o estado do recibo automático para um pagamento.
 * Usado pelo botão "Comprovante" da lista de mensalidades para abrir o popup
 * sem disparar render desnecessário quando o documento já existe.
 */
export async function getReceiptForPayment(
  input: unknown,
): Promise<GetReceiptForPaymentResult> {
  try {
    const parsed = voidPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Identificador de pagamento inválido." };
    }
    const { paymentId } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sessão inválida." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.account_id) {
      return { ok: false, error: "Conta não encontrada." };
    }

    const { data: row, error } = await supabase
      .from("generated_documents")
      .select("id, status, number, error_message")
      .eq("account_id", profile.account_id as string)
      .eq("payment_id", paymentId)
      .eq("type", "payment_receipt")
      .neq("status", "archived")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!row) {
      return { ok: true, receipt: { status: "missing" } };
    }

    if (row.status === "ready") {
      return {
        ok: true,
        receipt: {
          status: "ready",
          documentId: row.id as string,
          number: (row.number as string) ?? "",
          reused: true,
        },
      };
    }

    return {
      ok: true,
      receipt: {
        status: "failed",
        documentId: row.id as string,
        error:
          (row.error_message as string | null) ??
          "Recibo ainda não foi gerado com sucesso.",
      },
    };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}
