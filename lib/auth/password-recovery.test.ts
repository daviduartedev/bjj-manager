import { describe, expect, it, vi } from "vitest";

import {
  PASSWORD_RECOVERY_SENT_MESSAGE,
  passwordRecoveryCallbackUrl,
  recoveryCallbackPath,
  requestPasswordRecovery,
} from "./password-recovery";

describe("recuperação de senha", () => {
  it("usa callback fixo no servidor, sem destino escolhido pelo navegador", () => {
    expect(passwordRecoveryCallbackUrl({ NEXT_PUBLIC_APP_URL: "https://app.casca.test/" })).toBe("https://app.casca.test/auth/recovery");
    expect(recoveryCallbackPath({ code: "pkce", exchangeFailed: false })).toBe("/redefinir-senha");
    expect(recoveryCallbackPath({ code: "pkce", exchangeFailed: true })).toBe("/recuperar-senha?erro=link");
    expect(recoveryCallbackPath({ code: null, exchangeFailed: false })).toBe("/recuperar-senha?erro=link");
  });

  it("responde a mesma mensagem com e-mail existente, inexistente ou falha do provedor", async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });
    const ok = await requestPasswordRecovery({ email: "ana@academia.com" }, { redirectTo: "https://app.casca.test/auth/recovery", resetPasswordForEmail });
    expect(ok).toEqual({ ok: true, message: PASSWORD_RECOVERY_SENT_MESSAGE });
    expect(resetPasswordForEmail).toHaveBeenCalledWith("ana@academia.com", "https://app.casca.test/auth/recovery");

    resetPasswordForEmail.mockRejectedValueOnce(new Error("unknown user"));
    const missing = await requestPasswordRecovery({ email: "nao-existe@academia.com" }, { redirectTo: "https://app.casca.test/auth/recovery", resetPasswordForEmail });
    expect(missing).toEqual({ ok: true, message: PASSWORD_RECOVERY_SENT_MESSAGE });

    expect((await requestPasswordRecovery({ email: "invalido" }, { redirectTo: "https://app.casca.test/auth/recovery", resetPasswordForEmail })).ok).toBe(false);
  });
});
