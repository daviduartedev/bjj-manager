import { describe, expect, it, vi } from "vitest";

import {
  completePasswordLogin,
  destinationForProvision,
  loginDecisionForProvision,
} from "./provision-destination";

describe("destinationForProvision", () => {
  it("manda academia recém-criada para concluir a assinatura", () => {
    expect(destinationForProvision({ outcome: "created", role: "professor" })).toBe("/conta/assinatura");
    expect(destinationForProvision({ outcome: "created", role: null })).toBe("/conta/assinatura");
  });

  it("manda professor que já existe para o painel e aluno para o portal", () => {
    expect(destinationForProvision({ outcome: "existing", role: "professor" })).toBe("/painel");
    expect(destinationForProvision({ outcome: "existing", role: "student" })).toBe("/portal");
  });

  it("não manda e-mail pendente, inelegível ou papel desconhecido para o painel", () => {
    expect(destinationForProvision({ outcome: "email_not_confirmed", role: null })).toBe("/login");
    expect(destinationForProvision({ outcome: "ineligible", role: null })).toBe("/login");
    expect(destinationForProvision({ outcome: "existing", role: "owner" })).toBe("/login");
    expect(destinationForProvision({ outcome: "existing", role: null })).toBe("/login");
    expect(destinationForProvision(null)).toBe("/login");
  });

  it("lê a primeira linha quando o resultado vem como tabela", () => {
    expect(
      destinationForProvision([{ outcome: "existing", role: "student" }]),
    ).toBe("/portal");
  });
});

describe("loginDecisionForProvision", () => {
  it("abre a assinatura quando a academia acaba de ser criada", () => {
    expect(loginDecisionForProvision({ outcome: "created", role: "professor" })).toEqual({
      path: "/conta/assinatura",
    });
  });

  it("abre o painel para professor que já existe e o portal para aluno", () => {
    expect(loginDecisionForProvision({ outcome: "existing", role: "professor" })).toEqual({
      path: "/painel",
    });
    expect(loginDecisionForProvision({ outcome: "existing", role: "student" })).toEqual({
      path: "/portal",
    });
  });

  it("fica fora do painel quando a conta é inelegível ou o e-mail não foi confirmado", () => {
    expect(loginDecisionForProvision({ outcome: "ineligible", role: null })).toEqual({
      message: "Esta conta não abre o painel da academia.",
    });
    expect(loginDecisionForProvision({ outcome: "email_not_confirmed", role: null })).toEqual({
      message: "Confirme o e-mail antes de entrar no painel.",
    });
  });
});

describe("completePasswordLogin", () => {
  it("chama a provisão uma vez quando ainda não há perfil e segue o resultado", async () => {
    const provision = vi.fn().mockResolvedValue({
      data: { outcome: "created", role: "professor" },
      error: false,
    });

    const decision = await completePasswordLogin({ role: null, provision });

    expect(decision).toEqual({ path: "/conta/assinatura" });
    expect(provision).toHaveBeenCalledOnce();
  });

  it("não chama a provisão quando o professor ou o aluno já tem papel", async () => {
    const provision = vi.fn();

    await expect(completePasswordLogin({ role: "professor", provision })).resolves.toEqual({
      path: "/painel",
    });
    await expect(completePasswordLogin({ role: "student", provision })).resolves.toEqual({
      path: "/portal",
    });
    expect(provision).not.toHaveBeenCalled();
  });

  it("fica fora do painel se a provisão falha, sem tratar a falha como academia criada", async () => {
    const provision = vi.fn().mockResolvedValue({ data: null, error: true });

    await expect(completePasswordLogin({ role: null, provision })).resolves.toEqual({
      message: "Não foi possível entrar no painel. Tente novamente.",
    });
    expect(provision).toHaveBeenCalledOnce();
  });
});
