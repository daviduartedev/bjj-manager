import { describe, expect, it } from "vitest";

import { academyCallbackPath, confirmationRecoveryMessage } from "./academy-callback";

const RECOVERY = "/login?confirmacao=link";
const LINK_MESSAGE =
  "Este link não pôde ser usado. Peça outro e-mail de confirmação neste navegador.";

describe("academyCallbackPath", () => {
  it("manda link sem código, troca falhada ou aberto noutro aparelho para o login com recuperação, uma vez", () => {
    expect(
      academyCallbackPath({
        code: null,
        next: "/painel",
        exchangeFailed: false,
        provisionFailed: false,
        provisionData: null,
      }),
    ).toBe(RECOVERY);

    expect(
      academyCallbackPath({
        code: "",
        next: null,
        exchangeFailed: false,
        provisionFailed: false,
        provisionData: null,
      }),
    ).toBe(RECOVERY);

    expect(
      academyCallbackPath({
        code: "pkce-de-outro-aparelho",
        next: "/painel",
        exchangeFailed: true,
        provisionFailed: false,
        provisionData: null,
      }),
    ).toBe(RECOVERY);

    expect(confirmationRecoveryMessage("link")).toBe(LINK_MESSAGE);
    expect(confirmationRecoveryMessage(null)).toBeNull();
  });

  it("depois da troca, segue a provisão e não o parâmetro next", () => {
    expect(
      academyCallbackPath({
        code: "codigo-valido",
        next: "/portal",
        exchangeFailed: false,
        provisionFailed: false,
        provisionData: { outcome: "created", role: "professor" },
      }),
    ).toBe("/painel");

    expect(
      academyCallbackPath({
        code: "codigo-valido",
        next: "/painel",
        exchangeFailed: false,
        provisionFailed: false,
        provisionData: { outcome: "existing", role: "student" },
      }),
    ).toBe("/portal");

    expect(
      academyCallbackPath({
        code: "codigo-valido",
        next: "/painel",
        exchangeFailed: false,
        provisionFailed: true,
        provisionData: null,
      }),
    ).toBe("/login");
  });
});
