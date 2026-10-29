import { describe, expect, it, vi } from "vitest";

import { createResendGateway } from "./resend";

describe("envio comercial Resend", () => {
  it("envia com chave de idempotencia e sem expor o segredo no corpo", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ id: "email-a" }));
    const gateway = createResendGateway({ RESEND_API_KEY: "re_test_only" }, fetcher);
    expect(await gateway.send({ from: "Casca <conta@example.test>", to: "ana@example.test", subject: "Sua avaliação do Casca começou", text: "texto" }, "casca-notification/n1")).toEqual({ id: "email-a" });
    const [url, request] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(request?.headers).toMatchObject({ Authorization: "Bearer re_test_only", "Idempotency-Key": "casca-notification/n1" });
    expect(JSON.parse(String(request?.body))).toEqual({ from: "Casca <conta@example.test>", to: ["ana@example.test"], subject: "Sua avaliação do Casca começou", text: "texto" });
  });

  it("recusa configuração ausente antes de chamar o provedor", () => {
    expect(() => createResendGateway({ RESEND_API_KEY: " " })).toThrow("email_configuration_missing");
  });
});
