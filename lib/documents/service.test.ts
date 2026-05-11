import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { DocumentGenerationService } from "./service";
import type { DocumentPayload } from "./types";

vi.mock("./renderer", () => ({
  renderHtmlToPdf: vi.fn(async () => Buffer.from("%PDF-1.4 fake")),
}));

vi.mock("./template-resolver", () => ({
  resolveTemplate: vi.fn(() => ({
    type: "payment_receipt",
    version: 1,
    builder: () => "<html><body>test</body></html>",
  })),
}));

vi.mock("./numbering", async () => {
  const actual = await vi.importActual<typeof import("./numbering")>(
    "./numbering",
  );
  return {
    ...actual,
    reserveNextDocumentNumber: vi.fn(async () => ({ number: "REC-2026-0001" })),
    reserveNextDocumentNumberFallback: vi.fn(async () => ({
      number: "REC-2026-0001",
    })),
  };
});

vi.mock("./storage", async () => {
  const actual = await vi.importActual<typeof import("./storage")>("./storage");
  return {
    ...actual,
    uploadDocumentArtifact: vi.fn(async (_c: unknown, args: { path: string }) => ({
      path: args.path,
      size: 12,
    })),
  };
});

type Row = {
  id: string;
  status: string;
  number: string | null;
  pdf_path: string | null;
  html_path: string | null;
  version: number | null;
  idempotency_key: string | null;
};

function buildClient(initialRows: Row[] = []) {
  const rows = [...initialRows];
  const updates: Array<{ id: string; patch: Record<string, unknown> }> = [];
  const inserts: Array<Record<string, unknown>> = [];

  const fromImpl = (table: string) => {
    if (table !== "generated_documents") {
      throw new Error(`unexpected table ${table}`);
    }

    type SelectChain = {
      eq: (col: string, val: unknown) => SelectChain;
      order: () => SelectChain;
      limit: () => SelectChain;
      maybeSingle: () => Promise<{ data: Row | null; error: null }>;
      single: () => Promise<{ data: Row | null; error: null }>;
    };

    const selectFor = (filters: Record<string, unknown>): SelectChain => ({
      eq: (col, val) =>
        selectFor({ ...filters, [col]: val }),
      order: () => selectFor(filters),
      limit: () => selectFor(filters),
      maybeSingle: async () => {
        const found = rows
          .filter((r) => {
            if (filters.account_id && r.id && true) {
              return (
                r.idempotency_key === filters.idempotency_key
              );
            }
            return false;
          })
          .at(-1);
        return { data: found ?? null, error: null };
      },
      single: async () => {
        const found = rows.find((r) => r.id === filters.id) ?? null;
        return { data: found, error: null };
      },
    });

    return {
      select: () => selectFor({}),
      insert: (payload: Record<string, unknown>) => {
        const id = `row-${rows.length + 1}`;
        const newRow: Row = {
          id,
          status: (payload.status as string) ?? "pending",
          number: (payload.number as string) ?? null,
          pdf_path: null,
          html_path: null,
          version: (payload.version as number) ?? 1,
          idempotency_key: (payload.idempotency_key as string | null) ?? null,
        };
        rows.push(newRow);
        inserts.push(payload);
        return {
          select: () => ({
            single: async () => ({ data: { id }, error: null }),
          }),
        };
      },
      update: (patch: Record<string, unknown>) => ({
        eq: (col: string, val: unknown) => {
          if (col === "id") {
            const r = rows.find((row) => row.id === val);
            if (r) {
              Object.assign(r, patch);
              updates.push({ id: r.id, patch });
            }
          }
          return Promise.resolve({ error: null });
        },
      }),
    };
  };

  return {
    client: { from: fromImpl } as unknown as Parameters<
      typeof DocumentGenerationService.prototype.generate
    >[0] extends never
      ? never
      : ConstructorParameters<typeof DocumentGenerationService>[0],
    rows,
    updates,
    inserts,
  };
}

const basePayload: DocumentPayload = {
  accountId: "acc-1",
  studentId: "stu-1",
  receiver: {
    legalName: "Escola",
    cnpj: "11222333000181",
  },
  data: {
    documentNumber: "PLACEHOLDER",
    issuedAt: new Date().toISOString(),
    reissue: { isReissue: false, version: 1, reason: null },
    paymentId: "pay-1",
    referenceMonth: "2026-05-01",
    paidAt: new Date().toISOString(),
    paidAmountCents: 19990,
    paymentMethod: "pix",
    student: { name: "Aluno Teste", phone: null, document: null },
  },
} as unknown as DocumentPayload;

describe("DocumentGenerationService.generate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("insere e gera quando não existe linha prévia", async () => {
    const { client, inserts, rows } = buildClient([]);
    const svc = new DocumentGenerationService(client);

    const out = await svc.generate({
      accountId: "acc-1",
      type: "payment_receipt",
      payload: basePayload,
      idempotencyKey: "pay-1",
      paymentId: "pay-1",
      studentId: "stu-1",
    });

    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.reused).toBe(false);
      expect(out.number).toBe("REC-2026-0001");
    }
    expect(inserts).toHaveLength(1);
    // Regressão: payload_json é NOT NULL no DB; o INSERT precisa carregá-lo.
    expect(inserts[0].payload_json).not.toBeNull();
    expect(inserts[0].payload_json).toBeTypeOf("object");
    expect(rows.at(-1)?.status).toBe("ready");
  });

  it("reusa linha 'ready' existente sem inserir nem renderizar", async () => {
    const { client, inserts } = buildClient([
      {
        id: "existing-1",
        status: "ready",
        number: "REC-2026-0007",
        pdf_path: "acc-1/existing-1/v1.pdf",
        html_path: null,
        version: 1,
        idempotency_key: "pay-2",
      },
    ]);
    const svc = new DocumentGenerationService(client);

    const out = await svc.generate({
      accountId: "acc-1",
      type: "payment_receipt",
      payload: basePayload,
      idempotencyKey: "pay-2",
      paymentId: "pay-2",
      studentId: "stu-1",
    });

    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.reused).toBe(true);
      expect(out.documentId).toBe("existing-1");
      expect(out.number).toBe("REC-2026-0007");
    }
    expect(inserts).toHaveLength(0);
  });

  it("retry: reaproveita linha 'failed' em vez de inserir nova (idempotência preservada)", async () => {
    const { client, inserts, rows } = buildClient([
      {
        id: "failed-1",
        status: "failed",
        number: "REC-2026-0099",
        pdf_path: null,
        html_path: null,
        version: 1,
        idempotency_key: "pay-3",
      },
    ]);
    const svc = new DocumentGenerationService(client);

    const out = await svc.generate({
      accountId: "acc-1",
      type: "payment_receipt",
      payload: basePayload,
      idempotencyKey: "pay-3",
      paymentId: "pay-3",
      studentId: "stu-1",
    });

    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.documentId).toBe("failed-1");
      expect(out.number).toBe("REC-2026-0099");
    }
    expect(inserts).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("ready");
  });
});
