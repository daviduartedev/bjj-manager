import { z } from "zod";

export const subscriptionPlanIdSchema = z.enum(["essencial", "academia", "evolucao"]);
export const checkoutInputSchema = z.object({ planId: subscriptionPlanIdSchema }).strict();
export const planChangeInputSchema = z.object({ planId: subscriptionPlanIdSchema }).strict();

const providerId = z.string().min(1).max(160);
const timestamp = z.string().datetime({ offset: true });

export const providerSubscriptionSchema = z.object({
  id: providerId,
  checkoutId: providerId.nullable(),
  customerId: providerId,
  amount: z.number().int().nonnegative(),
  status: z.enum(["PENDING", "ACTIVE", "CANCELLED"]),
  method: z.enum(["CARD", "PIX"]),
  devMode: z.boolean(),
  trialDays: z.number().int().nullable(),
  trialEndsAt: timestamp.nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

// O provedor pode acrescentar campos: somente o contrato consumido é validado.
export const subscriptionEventSchema = z.object({
  id: providerId,
  event: z.string().min(1).max(100),
  apiVersion: z.literal(2),
  devMode: z.boolean(),
  data: z.object({
    subscription: z.object({
      id: providerId,
      amount: z.number().int().nonnegative(),
      status: z.enum(["PENDING", "ACTIVE", "CANCELLED"]),
      method: z.enum(["CARD", "PIX"]),
      frequency: z.string().optional(),
      trialDays: z.number().int().nullable().optional(),
      trialEndsAt: timestamp.nullable().optional(),
      createdAt: timestamp,
      updatedAt: timestamp,
      cancelledDueTo: z.string().nullable().optional(),
    }).passthrough().optional(),
    customer: z.object({ id: providerId }).passthrough().nullable().optional(),
    payment: z.object({
      id: providerId,
      amount: z.number().int().nonnegative(),
      paidAmount: z.number().int().nonnegative(),
      status: z.string(),
      updatedAt: timestamp,
      receiptUrl: z.string().max(2048).nullable().optional(),
    }).passthrough().optional(),
    checkout: z.object({ id: providerId, updatedAt: timestamp.optional(), customerId: providerId.nullable().optional() }).passthrough().optional(),
  }).passthrough(),
}).passthrough();
