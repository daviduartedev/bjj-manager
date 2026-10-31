import { OFFERED_SUBSCRIPTION_PLAN_IDS, SUBSCRIPTION_PLAN_IDS, getSubscriptionPlan, type SubscriptionPlanId } from "./catalog";
import type { ProviderCheckout as OneOffCheckout, ProviderPlanChange, ProviderSubscription, SubscriptionGateway } from "./types";
import { providerSubscriptionSchema } from "./validation";

const API_URL = "https://api.abacatepay.com/v2";
type BillingEnvironment = Record<string, string | undefined>;
type ProviderCheckout = { id: string; url: string; amount?: number; customerId?: string | null; externalId?: string | null; devMode?: boolean; items?: Array<{ id: string; quantity: number }> };

export type AbacatePayGateway = SubscriptionGateway & {
  request<T>(path: string, body?: unknown): Promise<T>;
  cancelSubscription(id: string): Promise<void>;
  deleteSubscriptionCheckout(id: string): Promise<void>;
  listSubscriptionsByCheckout(id: string): Promise<ProviderSubscription[]>;
  createOneOffCheckout(input: { operationId: string; amountCents: number; customerId: string }): Promise<{ id: string; url: string }>;
  getCheckout(id: string): Promise<OneOffCheckout>;
  changePlan(input: { subscriptionId: string; planId: SubscriptionPlanId }): Promise<ProviderPlanChange>;
};

const BILLING_ENV_KEYS = [
  "CASCA_ABACATEPAY_API_KEY",
  "CASCA_ABACATEPAY_ENV",
  "NEXT_PUBLIC_APP_URL",
  "CASCA_ABACATEPAY_PRODUCT_INICIAL",
  "CASCA_ABACATEPAY_PRODUCT_INICIAL_TRIAL",
  "CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100",
  "CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100_TRIAL",
  "CASCA_ABACATEPAY_PRODUCT_ILIMITADO",
  "CASCA_ABACATEPAY_PRODUCT_ILIMITADO_TRIAL",
  "CASCA_ABACATEPAY_PRODUCT_ESSENCIAL",
  "CASCA_ABACATEPAY_PRODUCT_ESSENCIAL_TRIAL",
  "CASCA_ABACATEPAY_PRODUCT_ACADEMIA",
  "CASCA_ABACATEPAY_PRODUCT_ACADEMIA_TRIAL",
  "CASCA_ABACATEPAY_PRODUCT_EVOLUCAO",
  "CASCA_ABACATEPAY_PRODUCT_EVOLUCAO_TRIAL",
] as const;

function cleanEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let text = value.trim();
  if (text.length >= 2 && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))) {
    text = text.slice(1, -1).trim();
  }
  return text || undefined;
}

/** Reads each billing variable by its own name. Passing `process.env` whole drops keys that the bundler did not see. */
export function readProcessBillingEnvironment(): BillingEnvironment {
  return {
    CASCA_ABACATEPAY_API_KEY: process.env.CASCA_ABACATEPAY_API_KEY,
    CASCA_ABACATEPAY_ENV: process.env.CASCA_ABACATEPAY_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    CASCA_ABACATEPAY_PRODUCT_INICIAL: process.env.CASCA_ABACATEPAY_PRODUCT_INICIAL,
    CASCA_ABACATEPAY_PRODUCT_INICIAL_TRIAL: process.env.CASCA_ABACATEPAY_PRODUCT_INICIAL_TRIAL,
    CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100: process.env.CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100,
    CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100_TRIAL: process.env.CASCA_ABACATEPAY_PRODUCT_ACADEMIA_100_TRIAL,
    CASCA_ABACATEPAY_PRODUCT_ILIMITADO: process.env.CASCA_ABACATEPAY_PRODUCT_ILIMITADO,
    CASCA_ABACATEPAY_PRODUCT_ILIMITADO_TRIAL: process.env.CASCA_ABACATEPAY_PRODUCT_ILIMITADO_TRIAL,
    CASCA_ABACATEPAY_PRODUCT_ESSENCIAL: process.env.CASCA_ABACATEPAY_PRODUCT_ESSENCIAL,
    CASCA_ABACATEPAY_PRODUCT_ESSENCIAL_TRIAL: process.env.CASCA_ABACATEPAY_PRODUCT_ESSENCIAL_TRIAL,
    CASCA_ABACATEPAY_PRODUCT_ACADEMIA: process.env.CASCA_ABACATEPAY_PRODUCT_ACADEMIA,
    CASCA_ABACATEPAY_PRODUCT_ACADEMIA_TRIAL: process.env.CASCA_ABACATEPAY_PRODUCT_ACADEMIA_TRIAL,
    CASCA_ABACATEPAY_PRODUCT_EVOLUCAO: process.env.CASCA_ABACATEPAY_PRODUCT_EVOLUCAO,
    CASCA_ABACATEPAY_PRODUCT_EVOLUCAO_TRIAL: process.env.CASCA_ABACATEPAY_PRODUCT_EVOLUCAO_TRIAL,
  };
}

function normalizeBillingEnvironment(environment: BillingEnvironment): BillingEnvironment {
  const normalized = Object.fromEntries(BILLING_ENV_KEYS.map((key) => [key, cleanEnv(environment[key])])) as BillingEnvironment;
  const mode = normalized.CASCA_ABACATEPAY_ENV?.toLowerCase();
  return { ...normalized, CASCA_ABACATEPAY_ENV: mode };
}

/** True only when every offered plan has its optional trial product. Absent products charge the monthly price. */
export function commercialTrialsConfigured(environment: BillingEnvironment): boolean {
  const normalized = normalizeBillingEnvironment(environment);
  return OFFERED_SUBSCRIPTION_PLAN_IDS.every((id) => normalized[`CASCA_ABACATEPAY_PRODUCT_${id.toUpperCase()}_TRIAL`]?.startsWith("prod_") === true);
}

export function createAbacatePayGateway(source: BillingEnvironment, fetcher: typeof fetch = fetch): AbacatePayGateway {
  const environment = normalizeBillingEnvironment(source);
  const key = environment.CASCA_ABACATEPAY_API_KEY;
  const mode = environment.CASCA_ABACATEPAY_ENV;
  let appUrl: URL;
  try {
    appUrl = new URL(environment.NEXT_PUBLIC_APP_URL ?? "");
  } catch {
    throw new Error("billing_configuration_missing");
  }
  if (!key || !["sandbox", "production"].includes(mode ?? "") || !["http:", "https:"].includes(appUrl.protocol)) throw new Error("billing_configuration_missing");
  if (mode === "production" && appUrl.protocol !== "https:") throw new Error("billing_origin_invalid");

  function readProductId(planId: SubscriptionPlanId, trial: boolean): string | null {
    const name = `CASCA_ABACATEPAY_PRODUCT_${planId.toUpperCase()}${trial ? "_TRIAL" : ""}`;
    const id = environment[name];
    if (!id) return null;
    if (!id.startsWith("prod_")) throw new Error("billing_product_missing");
    return id;
  }
  function productId(planId: SubscriptionPlanId, trial: boolean): string {
    const id = (trial ? readProductId(planId, true) : null) ?? readProductId(planId, false);
    if (!id) throw new Error("billing_product_missing");
    return id;
  }
  function usesTrialProduct(planId: SubscriptionPlanId, trial: boolean): boolean {
    return trial && readProductId(planId, true) !== null;
  }
  // Novas contratações usam só a oferta atual. Produtos legados são opcionais, mas validados quando presentes.
  for (const id of OFFERED_SUBSCRIPTION_PLAN_IDS) {
    if (!readProductId(id, false)) throw new Error("billing_product_missing");
  }
  for (const id of SUBSCRIPTION_PLAN_IDS) {
    readProductId(id, false);
    readProductId(id, true);
  }

  async function request<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetcher(`${API_URL}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const result = await response.json();
    if (!response.ok || !result || result.success !== true || result.data == null) throw new Error("billing_provider_unavailable");
    return result.data as T;
  }

  async function validateProduct(planId: SubscriptionPlanId, trial: boolean) {
    const withTrial = usesTrialProduct(planId, trial);
    const id = productId(planId, trial);
    const product = await request<{ id: string; price: number; currency: string; cycle: string | null; trialDays?: number | null; devMode: boolean; status: string }>(`/products/get?id=${encodeURIComponent(id)}`);
    if (product.id !== id || product.price !== getSubscriptionPlan(planId)?.priceCents || product.currency !== "BRL" || product.cycle !== "MONTHLY" || product.devMode !== (mode === "sandbox") || product.status !== "ACTIVE" || (withTrial ? product.trialDays !== 3 : Boolean(product.trialDays))) throw new Error("billing_product_invalid");
  }

  return {
    devMode: mode === "sandbox",
    request,
    async cancelSubscription(id) {
      await request("/subscriptions/cancel", { id });
    },
    async deleteSubscriptionCheckout(id) {
      await request(`/subscriptions/checkouts/delete?id=${encodeURIComponent(id)}`, {});
    },
    async listSubscriptionsByCheckout(id) {
      const data = await request<unknown>(`/subscriptions/list?checkoutId=${encodeURIComponent(id)}&limit=100`);
      const subscriptions = providerSubscriptionSchema.array().parse(data);
      if (subscriptions.length === 100 || subscriptions.some((subscription) => subscription.checkoutId !== id || subscription.devMode !== (mode === "sandbox"))) throw new Error("billing_subscription_reconciliation_failed");
      return subscriptions;
    },
    async createCustomer(input) {
      const result = await request<{ id: string }>("/customers/create", input);
      if (typeof result.id !== "string" || !result.id.startsWith("cust_")) throw new Error("billing_customer_invalid");
      return { id: result.id };
    },
    async createCheckout(input) {
      if (!getSubscriptionPlan(input.planId)) throw new Error("billing_plan_invalid");
      const withTrial = usesTrialProduct(input.planId, input.trial);
      await validateProduct(input.planId, input.trial);
      const result = await request<ProviderCheckout>("/subscriptions/create", {
        items: [{ id: productId(input.planId, input.trial), quantity: 1 }],
        customerId: input.customerId,
        externalId: input.operationId,
        methods: ["CARD"],
        returnUrl: new URL("/conta/assinatura", appUrl).toString(),
        completionUrl: new URL("/conta/assinatura?contratacao=recebida", appUrl).toString(),
        retryPolicy: { maxRetry: 3, retryEvery: 1 },
      });
      const amountMatches = result.amount === getSubscriptionPlan(input.planId)?.priceCents || (withTrial && result.amount === 0);
      if (result.devMode !== (mode === "sandbox") || result.externalId !== input.operationId || result.customerId !== input.customerId || !amountMatches || result.items?.length !== 1 || result.items[0].id !== productId(input.planId, input.trial) || result.items[0].quantity !== 1) throw new Error("billing_checkout_invalid");
      return safeCheckout(result);
    },
    async getSubscription(id): Promise<ProviderSubscription> {
      const result = await request<unknown>(`/subscriptions/get?id=${encodeURIComponent(id)}`);
      return providerSubscriptionSchema.parse(result);
    },
    async findCheckoutByOperation(input) {
      const result = await request<ProviderCheckout>(`/subscriptions/checkouts/get?externalId=${encodeURIComponent(input.operationId)}`);
      if (!result.customerId || result.externalId !== input.operationId || result.devMode !== (mode === "sandbox") || (input.customerId && result.customerId !== input.customerId)) throw new Error("billing_checkout_reconciliation_failed");
      if (!result.items || result.items.length !== 1 || result.items[0].id !== productId(input.planId, input.trial) || result.items[0].quantity !== 1) throw new Error("billing_checkout_reconciliation_failed");
      return { ...safeCheckout(result), customerId: result.customerId };
    },
    async createOneOffCheckout(input) {
      if (!Number.isInteger(input.amountCents) || input.amountCents < 100) throw new Error("billing_amount_invalid");
      const product = await request<{ id: string; price: number; currency: string; cycle: string | null; devMode: boolean; status: string }>("/products/create", {
        externalId: `casca-upgrade-${input.operationId}`,
        name: "Diferença proporcional Casca",
        price: input.amountCents,
        currency: "BRL",
      });
      if (!product.id?.startsWith("prod_") || product.price !== input.amountCents || product.currency !== "BRL" || product.cycle || product.devMode !== (mode === "sandbox") || product.status !== "ACTIVE") {
        throw new Error("billing_product_invalid");
      }
      const result = await request<ProviderCheckout>("/checkouts/create", {
        items: [{ id: product.id, quantity: 1 }],
        customerId: input.customerId,
        externalId: input.operationId,
        methods: ["CARD"],
        returnUrl: new URL("/conta/assinatura", appUrl).toString(),
        completionUrl: new URL("/conta/assinatura?contratacao=recebida", appUrl).toString(),
      });
      if (result.devMode !== (mode === "sandbox") || result.externalId !== input.operationId || result.customerId !== input.customerId || result.amount !== input.amountCents) {
        throw new Error("billing_checkout_invalid");
      }
      return safeCheckout(result);
    },
    async findOneOffCheckoutByOperation(input) {
      const result = await request<ProviderCheckout>(`/checkouts/get?externalId=${encodeURIComponent(input.operationId)}`);
      if (!result.customerId || result.externalId !== input.operationId || result.devMode !== (mode === "sandbox") || result.customerId !== input.customerId || result.amount !== input.amountCents) {
        throw new Error("billing_checkout_reconciliation_failed");
      }
      return { ...safeCheckout(result), customerId: result.customerId };
    },
    async getCheckout(id) {
      const result = await request<ProviderCheckout & { paidAmount?: number | null; status?: string; frequency?: string | null; updatedAt?: string }>(`/checkouts/get?id=${encodeURIComponent(id)}`);
      if (!result.id?.startsWith("bill_") || result.devMode !== (mode === "sandbox")) throw new Error("billing_checkout_invalid");
      return {
        id: result.id,
        amount: result.amount ?? 0,
        paidAmount: result.paidAmount ?? null,
        customerId: result.customerId ?? null,
        externalId: result.externalId ?? null,
        status: result.status ?? "PENDING",
        frequency: result.frequency ?? "ONE_TIME",
        devMode: result.devMode === true,
        updatedAt: result.updatedAt ?? new Date(0).toISOString(),
      };
    },
    async changePlan(input) {
      if (!getSubscriptionPlan(input.planId)) throw new Error("billing_plan_invalid");
      await validateProduct(input.planId, false);
      const result = await request<ProviderPlanChange>("/subscriptions/change-plan", {
        id: input.subscriptionId,
        productId: productId(input.planId, false),
        quantity: 1,
      });
      if (result.subscriptionId !== input.subscriptionId || result.productId !== productId(input.planId, false) || result.newAmount !== getSubscriptionPlan(input.planId)?.priceCents || result.status !== "PENDING" || !result.id?.startsWith("subu_")) {
        throw new Error("billing_plan_change_invalid");
      }
      return result;
    },
  };
}

function safeCheckout(checkout: ProviderCheckout): { id: string; url: string } {
  const url = new URL(checkout.url);
  if (!checkout.id?.startsWith("bill_") || url.protocol !== "https:" || url.hostname !== "app.abacatepay.com") throw new Error("billing_checkout_invalid");
  return { id: checkout.id, url: url.toString() };
}
