import { describe, expect, it, vi } from "vitest";

import { commercialTrialsConfigured, createAbacatePayGateway } from "./abacatepay";

const configuration = {
  CASCA_ABACATEPAY_API_KEY: "abc_dev_fake_only_for_tests",
  CASCA_ABACATEPAY_ENV: "sandbox",
  NEXT_PUBLIC_APP_URL: "http://localhost:3011",
  CASCA_ABACATEPAY_PRODUCT_INICIAL: "prod_inicial",
  CASCA_ABACATEPAY_PRODUCT_INICIAL_TRIAL: "prod_inicial_trial",
  CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100: "prod_academia_100",
  CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100_TRIAL: "prod_academia_100_trial",
  CASCA_ABACATEPAY_PRODUCT_ILIMITADO: "prod_ilimitado",
  CASCA_ABACATEPAY_PRODUCT_ILIMITADO_TRIAL: "prod_ilimitado_trial",
};
const trialProduct = { id: "prod_inicial_trial", price: 7990, currency: "BRL", cycle: "MONTHLY", trialDays: 3, devMode: true, status: "ACTIVE" };

describe("contrato HTTP de contratação AbacatePay", () => {
  it("cria checkout hospedado com produto trial e sem aceitar preço do navegador", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ success: true, data: trialProduct, error: null })).mockResolvedValueOnce(Response.json({ success: true, data: { id: "bill_new", url: "https://app.abacatepay.com/pay/bill_new", externalId: "op_new", customerId: "cust_owner", devMode: true, amount: 0, items: [{ id: "prod_inicial_trial", quantity: 1 }] }, error: null }));
    const gateway = createAbacatePayGateway(configuration, fetcher);
    expect(await gateway.createCheckout({ operationId: "op_new", planId: "inicial", customerId: "cust_owner", trial: true })).toEqual({ id: "bill_new", url: "https://app.abacatepay.com/pay/bill_new" });
    const [url, request] = fetcher.mock.calls[1];
    expect(url).toBe("https://api.abacatepay.com/v2/subscriptions/create");
    expect(JSON.parse(String(request?.body))).toMatchObject({ items: [{ id: "prod_inicial_trial", quantity: 1 }], methods: ["CARD"], externalId: "op_new", completionUrl: "http://localhost:3011/conta/assinatura?contratacao=recebida" });
    expect(JSON.parse(String(request?.body))).not.toHaveProperty("amount");
  });

  it("concilia apenas pelo identificador próprio e valida cliente, ambiente e produto retornados", async () => {
    const checkout = { id: "bill_existing", url: "https://app.abacatepay.com/pay/bill_existing", customerId: "cust_owner", externalId: "op_existing", devMode: true, items: [{ id: "prod_inicial_trial", quantity: 1 }] };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ success: true, data: checkout, error: null }));
    const gateway = createAbacatePayGateway(configuration, fetcher);
    const input = { operationId: "op_existing", planId: "inicial" as const, trial: true, customerId: "cust_owner" };
    expect(await gateway.findCheckoutByOperation?.(input)).toMatchObject({ id: "bill_existing", customerId: "cust_owner" });
    expect(fetcher.mock.calls[0][0]).toBe("https://api.abacatepay.com/v2/subscriptions/checkouts/get?externalId=op_existing");
    for (const invalid of [{ externalId: "op_other" }, { customerId: "cust_other" }, { devMode: false }, { items: [{ id: "prod_other", quantity: 1 }] }]) {
      fetcher.mockResolvedValueOnce(Response.json({ success: true, data: { ...checkout, ...invalid }, error: null }));
      await expect(gateway.findCheckoutByOperation?.(input)).rejects.toThrow("billing_checkout_reconciliation_failed");
    }
  });

  it("recusa redirecionamento para página externa mesmo quando a API retorna sucesso", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ success: true, data: trialProduct, error: null })).mockResolvedValueOnce(Response.json({ success: true, data: { id: "bill_fake", url: "https://example.test/steal", externalId: "op", customerId: "cust_owner", devMode: true, amount: 0, items: [{ id: "prod_inicial_trial", quantity: 1 }] }, error: null }));
    await expect(createAbacatePayGateway(configuration, fetcher).createCheckout({ operationId: "op", planId: "inicial", customerId: "cust_owner", trial: true })).rejects.toThrow("billing_checkout_invalid");
  });

  it("não cria checkout se produto remoto tem preço ou prazo diferente do anunciado", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ success: true, data: { ...trialProduct, trialDays: 7 }, error: null }));
    await expect(createAbacatePayGateway(configuration, fetcher).createCheckout({ operationId: "op", planId: "inicial", customerId: "cust_owner", trial: true })).rejects.toThrow("billing_product_invalid");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("cria cobrança avulsa com o valor proporcional calculado no servidor", async () => {
    const product = { id: "prod_upgrade", price: 4129, currency: "BRL", cycle: null, devMode: true, status: "ACTIVE" };
    const checkout = { id: "bill_up", url: "https://app.abacatepay.com/pay/bill_up", externalId: "op-up", customerId: "cust_owner", devMode: true, amount: 4129, items: [{ id: "prod_upgrade", quantity: 1 }] };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ success: true, data: product, error: null })).mockResolvedValueOnce(Response.json({ success: true, data: checkout, error: null }));
    const gateway = createAbacatePayGateway(configuration, fetcher);
    expect(await gateway.createOneOffCheckout({ operationId: "op-up", amountCents: 4129, customerId: "cust_owner" })).toEqual({ id: "bill_up", url: "https://app.abacatepay.com/pay/bill_up" });
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toMatchObject({ price: 4129, currency: "BRL" });
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body))).toMatchObject({ methods: ["CARD"], externalId: "op-up" });
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body))).not.toHaveProperty("amount");
  });

  it("aceita sandbox e produto com espaço ou aspas", () => {
    const gateway = createAbacatePayGateway({
      ...configuration,
      CASCA_ABACATEPAY_ENV: " Sandbox ",
      CASCA_ABACATEPAY_PRODUCT_INICIAL: ' "prod_inicial" ',
      CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100: " prod_academia_100 ",
      CASCA_ABACATEPAY_PRODUCT_ILIMITADO: "'prod_ilimitado'",
    });
    expect(gateway.devMode).toBe(true);
  });

  it("cobra o produto mensal quando a variante de avaliação não está configurada", async () => {
    const paidOnly = Object.fromEntries(Object.entries(configuration).filter(([key]) => !key.endsWith("_TRIAL")));
    const monthly = { id: "prod_inicial", price: 7990, currency: "BRL", cycle: "MONTHLY", trialDays: null, devMode: true, status: "ACTIVE" };
    const checkout = { id: "bill_paid", url: "https://app.abacatepay.com/pay/bill_paid", externalId: "op_paid", customerId: "cust_owner", devMode: true, amount: 7990, items: [{ id: "prod_inicial", quantity: 1 }] };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ success: true, data: monthly, error: null })).mockResolvedValueOnce(Response.json({ success: true, data: checkout, error: null }));
    const gateway = createAbacatePayGateway(paidOnly, fetcher);
    expect(await gateway.createCheckout({ operationId: "op_paid", planId: "inicial", customerId: "cust_owner", trial: true })).toEqual({ id: "bill_paid", url: "https://app.abacatepay.com/pay/bill_paid" });
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body))).toMatchObject({ items: [{ id: "prod_inicial", quantity: 1 }] });
  });

  it("agenda a troca recorrente pelo produto do catálogo, sem preço do navegador", async () => {
    const monthly = { id: "prod_academia_100", price: 12990, currency: "BRL", cycle: "MONTHLY", trialDays: null, devMode: true, status: "ACTIVE" };
    const update = { id: "subu_a", subscriptionId: "subs_a", productId: "prod_academia_100", newAmount: 12990, status: "PENDING" };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ success: true, data: monthly, error: null })).mockResolvedValueOnce(Response.json({ success: true, data: update, error: null }));
    const gateway = createAbacatePayGateway(configuration, fetcher);
    expect(await gateway.changePlan({ subscriptionId: "subs_a", planId: "academia_100" })).toMatchObject({ id: "subu_a", newAmount: 12990 });
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body))).toEqual({ id: "subs_a", productId: "prod_academia_100", quantity: 1 });
  });

  it("exige os produtos dos planos oferecidos e aceita a ausência dos legados", () => {
    expect(() => createAbacatePayGateway({ ...configuration, CASCA_ABACATEPAY_PRODUCT_ILIMITADO: undefined })).toThrow("billing_product_missing");
    expect(createAbacatePayGateway(configuration).devMode).toBe(true);
    expect(() => createAbacatePayGateway({ ...configuration, CASCA_ABACATEPAY_PRODUCT_EVOLUCAO: "evolucao" })).toThrow("billing_product_missing");
  });

  it("considera a avaliação configurada só pelos planos oferecidos", () => {
    expect(commercialTrialsConfigured(configuration)).toBe(true);
    expect(commercialTrialsConfigured({ ...configuration, CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100_TRIAL: undefined })).toBe(false);
  });

  it("recusa produto do plano Ilimitado com preço diferente do catálogo", async () => {
    const monthly = { id: "prod_ilimitado", price: 15900, currency: "BRL", cycle: "MONTHLY", trialDays: null, devMode: true, status: "ACTIVE" };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ success: true, data: monthly, error: null }));
    await expect(createAbacatePayGateway(configuration, fetcher).changePlan({ subscriptionId: "subs_a", planId: "ilimitado" })).rejects.toThrow("billing_product_invalid");
  });
});
