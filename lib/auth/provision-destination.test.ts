import { describe, expect, it } from "vitest";

import { destinationForProvision } from "./provision-destination";

describe("destinationForProvision", () => {
  it("manda academia recém-criada para o painel", () => {
    expect(destinationForProvision({ outcome: "created", role: "professor" })).toBe("/painel");
    expect(destinationForProvision({ outcome: "created", role: null })).toBe("/painel");
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
