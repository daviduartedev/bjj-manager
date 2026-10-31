import { z } from "zod";

import { newPasswordField, PASSWORD_MIN_LENGTH } from "@/lib/auth/password-policy";
import { ACADEMY_MODALITIES } from "@/lib/modalities/catalog";
import { getSubscriptionPlan, type SubscriptionPlanId } from "@/lib/subscriptions/catalog";
import type { SubscriptionKind, SubscriptionStatus } from "@/lib/subscriptions/types";

const planSchema = z.enum(["essencial", "academia", "evolucao"]);
const kindSchema = z.enum(["commercial", "internal_test", "exempt"]);
const kindChangeSchema = z.object({
  accountId: z.string().uuid(), kind: kindSchema, planId: planSchema,
  reason: z.string().trim().min(5).max(500),
}).strict();
const internalSchema = z.object({
  requestId: z.string().uuid(), academyName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  password: newPasswordField,
  modality: z.enum(ACADEMY_MODALITIES), planId: planSchema,
}).strict();

export type AdminAcademy = {
  account_id: string; academy_name: string; kind: SubscriptionKind; status: SubscriptionStatus;
  plan_id: SubscriptionPlanId; active_students: number; trial_ends_at: string | null; paid_until: string | null;
};
export type AdminHistory = { id: string; account_id: string; academy_name: string; action: string; reason: string; created_at: string };
export type AdminOverview = {
  academies: AdminAcademy[]; history: AdminHistory[]; total: number;
  counts: { commercial: number; trialing: number; internal_test: number; exempt: number; cancelled: number; new_paid: number };
  paid_plan_counts: { plan_id: SubscriptionPlanId; count: number }[];
};
export type InternalAcademyRequest = {
  id: string; actor_user_id: string; academy_name: string; email: string; modality: string;
  plan_id: SubscriptionPlanId; user_id: string | null; account_id: string | null;
};
export type AdminSubscription = { kind: SubscriptionKind; plan_id: SubscriptionPlanId; provider_subscription_id: string | null; provider_checkout_id?: string | null; version?: number };
export type KindChange = z.infer<typeof kindChangeSchema> & { actorUserId: string; expectedVersion?: number };
type InternalInput = z.infer<typeof internalSchema>;
type AdminResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface PlatformAdminDependencies {
  ownerUserId: string | undefined;
  repository: {
    overview(page: number): Promise<AdminOverview>;
    getSubscription(accountId: string): Promise<AdminSubscription | null>;
    changeKind(input: KindChange): Promise<void>;
    reserveInternal(input: Omit<InternalInput, "password"> & { actorUserId: string }): Promise<InternalAcademyRequest>;
    linkInternalUser(requestId: string, userId: string): Promise<void>;
    completeInternal(requestId: string): Promise<string>;
  };
  cancelRecurring(providerSubscriptionId: string, checkoutId?: string | null): Promise<void>;
  cancelPendingCheckout?: (checkoutId: string) => Promise<void>;
  createInternalUser(input: { requestId: string; email: string; password: string }): Promise<string>;
}

export function isPlatformOwner(userId: string | null | undefined, ownerUserId: string | undefined): boolean {
  return Boolean(userId && ownerUserId && z.string().uuid().safeParse(ownerUserId).success && userId === ownerUserId);
}

export function createPlatformAdminService(deps: PlatformAdminDependencies) {
  function denied(userId: string): boolean { return !isPlatformOwner(userId, deps.ownerUserId); }
  const accessDenied = { ok: false, error: "Acesso restrito ao administrador da plataforma." } as const;

  return {
    async overview(userId: string, input: unknown): Promise<AdminResult<AdminOverview & { mrrCents: number }>> {
      if (denied(userId)) return accessDenied;
      const parsed = z.object({ page: z.coerce.number().int().min(1).max(10000).default(1) }).strict().safeParse(input);
      if (!parsed.success) return { ok: false, error: "Página inválida." };
      try {
        const overview = await deps.repository.overview(parsed.data.page);
        const mrrCents = overview.paid_plan_counts.reduce((sum, row) => sum + (getSubscriptionPlan(row.plan_id)?.priceCents ?? 0) * row.count, 0);
        return { ok: true, data: { ...overview, mrrCents } };
      } catch {
        return { ok: false, error: "Não foi possível carregar as academias. Confira a configuração da plataforma e tente novamente." };
      }
    },

    async changeKind(userId: string, input: unknown): Promise<AdminResult<null>> {
      if (denied(userId)) return accessDenied;
      const parsed = kindChangeSchema.safeParse(input);
      if (!parsed.success) return { ok: false, error: "Informe a academia, o plano e um motivo de 5 a 500 caracteres." };
      try {
        const current = await deps.repository.getSubscription(parsed.data.accountId);
        if (!current) return { ok: false, error: "Academia não encontrada." };
        if (current.kind === "commercial" && parsed.data.kind === "commercial") return { ok: false, error: "A troca de plano comercial deve ser feita na assinatura da academia." };
        if (current.kind === "commercial" && current.provider_subscription_id) await deps.cancelRecurring(current.provider_subscription_id, current.provider_checkout_id);
        else if (current.kind === "commercial" && current.provider_checkout_id) {
          if (!deps.cancelPendingCheckout) throw new Error("checkout_cancellation_unavailable");
          await deps.cancelPendingCheckout(current.provider_checkout_id);
        }
        await deps.repository.changeKind({ ...parsed.data, actorUserId: userId, ...(current.version === undefined ? {} : { expectedVersion: current.version }) });
        return { ok: true, data: null };
      } catch {
        return { ok: false, error: "A condição não foi alterada. Não foi possível confirmar o encerramento da cobrança ou salvar a alteração; tente novamente." };
      }
    },

    async createInternal(userId: string, input: unknown): Promise<AdminResult<{ accountId: string }>> {
      if (denied(userId)) return accessDenied;
      const parsed = internalSchema.safeParse(input);
      if (!parsed.success) return { ok: false, error: `Informe nome, modalidade, plano, e-mail novo e senha com pelo menos ${PASSWORD_MIN_LENGTH} caracteres.` };
      try {
        const { password, ...details } = parsed.data;
        const request = await deps.repository.reserveInternal({ ...details, actorUserId: userId });
        if (request.account_id) return { ok: true, data: { accountId: request.account_id } };
        let userIdForAcademy = request.user_id;
        if (!userIdForAcademy) {
          userIdForAcademy = await deps.createInternalUser({ requestId: request.id, email: request.email, password });
          await deps.repository.linkInternalUser(request.id, userIdForAcademy);
        }
        const accountId = await deps.repository.completeInternal(request.id);
        return { ok: true, data: { accountId } };
      } catch {
        return { ok: false, error: "Criação não concluída. Use um e-mail novo e repita com os mesmos dados para retomar a operação com segurança." };
      }
    },
  };
}
