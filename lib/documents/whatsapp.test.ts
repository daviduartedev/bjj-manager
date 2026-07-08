import { describe, expect, it } from "vitest";

import {
  buildWhatsAppShareUrl,
  composeDocumentWhatsAppMessage,
  composeEnrollmentLiabilityWhatsAppMessage,
  normalizePhoneE164,
} from "./whatsapp";

describe("normalizePhoneE164", () => {
  it("aceita número brasileiro com DDD e prefixa 55", () => {
    expect(normalizePhoneE164("(11) 99999-1234")).toBe("5511999991234");
  });

  it("preserva número já com 55", () => {
    expect(normalizePhoneE164("+55 11 99999-1234")).toBe("5511999991234");
  });

  it("rejeita número curto", () => {
    expect(normalizePhoneE164("123")).toBe(null);
    expect(normalizePhoneE164("")).toBe(null);
    expect(normalizePhoneE164(null)).toBe(null);
  });

  it("remove prefixo 00 (formato internacional alternativo)", () => {
    expect(normalizePhoneE164("0055 11 99999-1234")).toBe("5511999991234");
  });
});

describe("buildWhatsAppShareUrl", () => {
  it("compõe URL wa.me com mensagem encoded", () => {
    const url = buildWhatsAppShareUrl({
      phoneE164: "5511999991234",
      message: "Olá, segue o recibo: https://x.test/r",
    });
    expect(url.startsWith("https://wa.me/5511999991234?text=")).toBe(true);
    expect(url).toContain("Ol%C3%A1");
    expect(url).toContain("https%3A%2F%2Fx.test%2Fr");
  });
});

describe("composeDocumentWhatsAppMessage", () => {
  it("inclui nome, número e link", () => {
    const msg = composeDocumentWhatsAppMessage({
      documentNumber: "REC-2026-0001",
      documentTypeLabel: "Recibo de pagamento",
      signedUrl: "https://x.test/r",
      academyName: "Aslam BJJ",
      studentFirstName: "João",
    });
    expect(msg).toContain("Olá, João!");
    expect(msg).toContain("REC-2026-0001");
    expect(msg).toContain("https://x.test/r");
  });
});

describe("composeEnrollmentLiabilityWhatsAppMessage", () => {
  it("inclui número ELF e link de assinatura", () => {
    const msg = composeEnrollmentLiabilityWhatsAppMessage({
      documentNumber: "ELF-2026-0001",
      academyName: "Aslam BJJ",
      signingUrl: "https://app.test/assinatura/tok",
      recipientFirstName: "Maria",
    });
    expect(msg).toContain("Olá, Maria!");
    expect(msg).toContain("ELF-2026-0001");
    expect(msg).toContain("Assine aqui: https://app.test/assinatura/tok");
  });
});
