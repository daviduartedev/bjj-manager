import { describe, expect, it } from "vitest";

import {
  digitsOnly,
  isValidCnpjBasic,
  maskCnpj,
  updateAccountSchema,
  updateProfileSchema,
  updateReceiverSchema,
} from "./settings";

describe("settings schemas strict (mass assignment)", () => {
  it("updateAccountSchema rejeita account_id", () => {
    expect(
      updateAccountSchema.safeParse({
        name: "Academia",
        account_id: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(false);
  });

  it("updateProfileSchema rejeita user_id", () => {
    expect(
      updateProfileSchema.safeParse({
        displayName: "Professor",
        phone: "",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(false);
  });
});

describe("CNPJ utilitários", () => {
  it("digitsOnly remove tudo que não é dígito", () => {
    expect(digitsOnly("00.000.000/0000-00")).toBe("00000000000000");
  });

  it("maskCnpj formata progressivamente", () => {
    expect(maskCnpj("12")).toBe("12");
    expect(maskCnpj("1234")).toBe("12.34");
    expect(maskCnpj("123456")).toBe("12.345.6");
    expect(maskCnpj("12345678")).toBe("12.345.678");
    expect(maskCnpj("12345678000123")).toBe("12.345.678/0001-23");
  });

  it("isValidCnpjBasic aceita 14 dígitos não repetidos", () => {
    expect(isValidCnpjBasic("12345678000123")).toBe(true);
    expect(isValidCnpjBasic("11111111111111")).toBe(false);
    expect(isValidCnpjBasic("123")).toBe(false);
  });
});

describe("updateReceiverSchema", () => {
  it("aceita campos vazios (CFG-7 — recibo gera com vazios)", () => {
    const r = updateReceiverSchema.safeParse({ legalName: "", cnpj: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.legalName).toBe(null);
      expect(r.data.cnpj).toBe(null);
    }
  });

  it("normaliza CNPJ para 14 dígitos", () => {
    const r = updateReceiverSchema.safeParse({
      legalName: "Aslam BJJ Ltda",
      cnpj: "12.345.678/0001-23",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.cnpj).toBe("12345678000123");
  });

  it("rejeita CNPJ com menos de 14 dígitos", () => {
    const r = updateReceiverSchema.safeParse({
      legalName: "Aslam BJJ Ltda",
      cnpj: "123",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita campos extras (mass assignment)", () => {
    const r = updateReceiverSchema.safeParse({
      legalName: "Aslam BJJ",
      cnpj: "",
      account_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(false);
  });
});
