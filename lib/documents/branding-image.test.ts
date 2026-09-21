import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { attachResolvedLogo, resolveBrandingImageDataUrl } from "./branding-image";
import type { DocumentPayload } from "./types";

function fakeClient(download: () => Promise<{ data: Blob | null; error: unknown }>) {
  return {
    storage: {
      from: () => ({
        download,
      }),
    },
  } as never;
}

const receiptPayload = (): DocumentPayload => ({
  type: "payment_receipt",
  data: {
    documentNumber: "REC-2026-0001",
    issuedAt: "2026-05-10T12:00:00.000Z",
    reissue: { isReissue: false, version: 1, reason: null },
    receiver: {
      academyName: "Academia Horizonte",
      legalName: "Academia Horizonte LTDA",
      cnpj: null,
      signaturePath: null,
      logoPath: "acc-1/logo.png",
    },
    payer: { fullName: "Aluno", document: null },
    payment: {
      amountCents: 1000,
      paidAt: "2026-05-10T12:00:00.000Z",
      referenceMonth: "2026-05-01",
      paymentMethod: null,
      notes: null,
      description: "Mensalidade",
    },
  },
});

describe("resolveBrandingImageDataUrl", () => {
  it("devolve null quando o caminho está vazio", async () => {
    const client = fakeClient(async () => {
      throw new Error("não deveria descarregar");
    });
    expect(await resolveBrandingImageDataUrl(client, null)).toBeNull();
    expect(await resolveBrandingImageDataUrl(client, "")).toBeNull();
  });

  it("devolve null quando o download falha", async () => {
    const client = fakeClient(async () => ({ data: null, error: new Error("missing") }));
    expect(await resolveBrandingImageDataUrl(client, "acc-1/logo.png")).toBeNull();
  });

  it("devolve data URL quando o objecto existe", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const client = fakeClient(async () => ({
      data: new Blob([bytes], { type: "image/png" }),
      error: null,
    }));
    const url = await resolveBrandingImageDataUrl(client, "acc-1/logo.png");
    expect(url).toBe(`data:image/png;base64,${Buffer.from(bytes).toString("base64")}`);
  });
});

describe("attachResolvedLogo", () => {
  it("anexa a data URL ao recibo quando o download funciona", async () => {
    const bytes = new Uint8Array([9, 8, 7]);
    const client = fakeClient(async () => ({
      data: new Blob([bytes], { type: "image/png" }),
      error: null,
    }));
    const next = await attachResolvedLogo(client, receiptPayload());
    if (next.type !== "payment_receipt") throw new Error("tipo");
    expect(next.data.logoImageDataUrl).toBe(
      `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`,
    );
  });

  it("trata falha de resolve como sem logo", async () => {
    const client = fakeClient(async () => {
      throw new Error("storage down");
    });
    const next = await attachResolvedLogo(client, receiptPayload());
    if (next.type !== "payment_receipt") throw new Error("tipo");
    expect(next.data.logoImageDataUrl).toBeNull();
  });
});
