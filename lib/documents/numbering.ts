import type { SupabaseClient } from "@supabase/supabase-js";

import { DOCUMENT_TYPE_NUMBER_PREFIX, type DocumentType } from "./types";

export function formatDocumentNumber(
  type: DocumentType,
  year: number,
  seq: number,
): string {
  return `${DOCUMENT_TYPE_NUMBER_PREFIX[type]}-${year}-${seq
    .toString()
    .padStart(4, "0")}`;
}

/**
 * Reserva atómica do próximo número para `(account, type, year)`.
 * Faz INSERT com `ON CONFLICT DO UPDATE` retornando `last_seq` já incrementado
 * (transação implícita), para evitar race conditions.
 */
export async function reserveNextDocumentNumber(
  client: SupabaseClient,
  args: { accountId: string; type: DocumentType; year: number },
): Promise<{ number: string; seq: number }> {
  const { accountId, type, year } = args;

  const { data, error } = await client.rpc("reserve_document_number", {
    p_account_id: accountId,
    p_type: type,
    p_year: year,
  });

  if (error) throw error;
  const seq = Number((data as { last_seq?: number })?.last_seq ?? data);
  if (!Number.isFinite(seq) || seq <= 0) {
    throw new Error("Falha ao reservar número de documento.");
  }
  return { number: formatDocumentNumber(type, year, seq), seq };
}

/**
 * Implementação alternativa para ambientes que não tenham a função RPC instalada:
 * usa upsert sequencial com `select`/`update`. Mantemos como fallback defensivo.
 */
export async function reserveNextDocumentNumberFallback(
  client: SupabaseClient,
  args: { accountId: string; type: DocumentType; year: number },
): Promise<{ number: string; seq: number }> {
  const { accountId, type, year } = args;

  const { data: existing } = await client
    .from("document_sequences")
    .select("last_seq")
    .eq("account_id", accountId)
    .eq("type", type)
    .eq("year", year)
    .maybeSingle();

  const nextSeq = (existing?.last_seq ?? 0) + 1;

  const { error: upsertErr } = await client
    .from("document_sequences")
    .upsert(
      {
        account_id: accountId,
        type,
        year,
        last_seq: nextSeq,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id,type,year" },
    );

  if (upsertErr) throw upsertErr;

  return { number: formatDocumentNumber(type, year, nextSeq), seq: nextSeq };
}
