import { describe, expect, it, vi } from "vitest";

import { createPlatformAdminService, type PlatformAdminDependencies, type InternalAcademyRequest } from "./service";

const OWNER = "10000000-0000-4000-8000-000000000001";
const OTHER = "10000000-0000-4000-8000-000000000002";
const ACCOUNT = "20000000-0000-4000-8000-000000000001";
const REQUEST = "30000000-0000-4000-8000-000000000001";

function setup() {
  const calls: string[] = [];
  const request: InternalAcademyRequest = { id: REQUEST, actor_user_id: OWNER, academy_name: "Academia interna", email: "teste@example.test", modality: "jiu_jitsu", plan_id: "academia", user_id: null, account_id: null };
  const deps: PlatformAdminDependencies = {
    ownerUserId: OWNER,
    repository: {
      overview: vi.fn().mockResolvedValue({ academies: [], history: [], counts: { commercial: 3, trialing: 1, internal_test: 2, exempt: 2, cancelled: 1, new_paid: 1 }, paid_plan_counts: [{ plan_id: "essencial", count: 2 }, { plan_id: "academia", count: 1 }], total: 0 }),
      getSubscription: vi.fn().mockResolvedValue({ kind: "commercial", plan_id: "essencial", provider_subscription_id: "subs_paid" }),
      changeKind: vi.fn(async () => { calls.push("persist"); }),
      reserveInternal: vi.fn(async () => { calls.push("reserve"); return request; }),
      linkInternalUser: vi.fn(async () => { calls.push("link"); }),
      completeInternal: vi.fn(async () => { calls.push("complete"); return ACCOUNT; }),
    },
    cancelRecurring: vi.fn(async () => { calls.push("cancel"); }),
    createInternalUser: vi.fn(async () => { calls.push("auth"); return "40000000-0000-4000-8000-000000000001"; }),
  };
  return { deps, service: createPlatformAdminService(deps), calls, request };
}

describe("administracao comercial da plataforma", () => {
  it("nega usuario comum antes de consultar academias ou alterar isencao", async () => {
    const { deps, service } = setup();
    expect((await service.overview(OTHER, { page: 1 })).ok).toBe(false);
    expect((await service.changeKind(OTHER, { accountId: ACCOUNT, kind: "exempt", planId: "essencial", reason: "Cliente fundador" })).ok).toBe(false);
    expect(deps.repository.overview).not.toHaveBeenCalled();
    expect(deps.repository.changeKind).not.toHaveBeenCalled();
  });

  it("nao concede acesso global quando a identidade administrativa nao foi configurada", async () => {
    const { deps } = setup();
    deps.ownerUserId = undefined;
    const service = createPlatformAdminService(deps);
    expect((await service.overview(OWNER, { page: 1 })).ok).toBe(false);
    expect(deps.repository.overview).not.toHaveBeenCalled();
  });

  it("interrompe a recorrencia antes de conceder isencao e registra o motivo", async () => {
    const { deps, service, calls } = setup();
    const result = await service.changeKind(OWNER, { accountId: ACCOUNT, kind: "exempt", planId: "academia", reason: "Cliente fundador" });
    expect(result.ok).toBe(true);
    expect(calls).toEqual(["cancel", "persist"]);
    expect(deps.repository.changeKind).toHaveBeenCalledWith({ actorUserId: OWNER, accountId: ACCOUNT, kind: "exempt", planId: "academia", reason: "Cliente fundador" });
  });

  it("nao concede isencao quando o cancelamento externo falha", async () => {
    const { deps, service } = setup();
    deps.cancelRecurring = vi.fn().mockRejectedValue(new Error("provider unavailable"));
    expect((await service.changeKind(OWNER, { accountId: ACCOUNT, kind: "exempt", planId: "academia", reason: "Cliente fundador" })).ok).toBe(false);
    expect(deps.repository.changeKind).not.toHaveBeenCalled();
  });

  it("recusa alteracao direta de plano comercial e campos financeiros fornecidos pelo navegador", async () => {
    const { deps, service } = setup();
    expect((await service.changeKind(OWNER, { accountId: ACCOUNT, kind: "commercial", planId: "evolucao", reason: "Aumentar capacidade" })).ok).toBe(false);
    expect((await service.changeKind(OWNER, { accountId: ACCOUNT, kind: "exempt", planId: "essencial", reason: "Cliente fundador", amount: 0 })).ok).toBe(false);
    expect(deps.repository.changeKind).not.toHaveBeenCalled();
  });

  it("retirar isencao pede nova adesao sem chamar cobranca automatica", async () => {
    const { deps, service, calls } = setup();
    deps.repository.getSubscription = vi.fn().mockResolvedValue({ kind: "exempt", plan_id: "essencial", provider_subscription_id: null });
    expect((await service.changeKind(OWNER, { accountId: ACCOUNT, kind: "commercial", planId: "academia", reason: "Fim da parceria" })).ok).toBe(true);
    expect(calls).toEqual(["persist"]);
    expect(deps.cancelRecurring).not.toHaveBeenCalled();
  });

  it("calcula receita recorrente somente a partir das quantidades pagantes", async () => {
    const { service } = setup();
    const result = await service.overview(OWNER, { page: 1 });
    expect(result.ok && result.data.mrrCents).toBe(37700);
  });

  it("reserva a operacao antes de criar o usuario sintetico e nao repete conta concluida", async () => {
    const { deps, service, calls, request } = setup();
    const input = { requestId: REQUEST, academyName: "Academia interna", email: "teste@example.test", password: "senha-interna-de-teste", modality: "jiu_jitsu", planId: "academia" };
    expect((await service.createInternal(OWNER, input)).ok).toBe(true);
    expect(calls).toEqual(["reserve", "auth", "link", "complete"]);
    request.account_id = ACCOUNT;
    expect((await service.createInternal(OWNER, input)).ok).toBe(true);
    expect(deps.createInternalUser).toHaveBeenCalledOnce();
    expect(deps.repository.reserveInternal).toHaveBeenCalledWith(expect.not.objectContaining({ password: expect.anything() }));
  });
});
