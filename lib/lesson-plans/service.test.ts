import { describe, expect, it, vi } from "vitest";

import { LessonPlanService, LessonPlanServiceError } from "./service";

type MockState = {
  plans: Array<Record<string, unknown>>;
  revisions: Array<Record<string, unknown>>;
};

function buildClient(state: MockState) {
  function selectChainable(rows: Array<Record<string, unknown>>) {
    let filtered = rows.slice();
    let limited = false;
    const chain = {
      eq(col: string, val: unknown) {
        filtered = filtered.filter((r) => r[col] === val);
        return chain;
      },
      neq(col: string, val: unknown) {
        filtered = filtered.filter((r) => r[col] !== val);
        return chain;
      },
      order(col: string, opts: { ascending: boolean }) {
        filtered = filtered.sort((a, b) => {
          const av = a[col] as number;
          const bv = b[col] as number;
          return opts.ascending ? av - bv : bv - av;
        });
        return chain;
      },
      limit(n: number) {
        filtered = filtered.slice(0, n);
        limited = true;
        return chain;
      },
      maybeSingle: async () => {
        const data = filtered[0] ?? null;
        return { data, error: null };
      },
      then: undefined,
    } as unknown as {
      eq: (c: string, v: unknown) => typeof chain;
      neq: (c: string, v: unknown) => typeof chain;
      order: (c: string, opts: { ascending: boolean }) => typeof chain;
      limit: (n: number) => typeof chain;
      maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: null }>;
    };
    void limited;
    return chain;
  }

  return {
    from(table: string) {
      const rows =
        table === "lesson_plans"
          ? state.plans
          : table === "lesson_plan_revisions"
            ? state.revisions
            : [];
      return {
        select: () => selectChainable(rows),
        insert: (payload: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              const id = `id-${rows.length + 1}`;
              const inserted = { id, ...payload };
              rows.push(inserted);
              return { data: inserted, error: null };
            },
          }),
        }),
        update: (payload: Record<string, unknown>) => ({
          eq: (col: string, val: unknown) => {
            const target = rows.find((r) => r[col] === val);
            if (target) Object.assign(target, payload);
            return Promise.resolve({ data: target ?? null, error: null });
          },
        }),
      };
    },
  } as unknown as ConstructorParameters<typeof LessonPlanService>[0];
}

describe("LessonPlanService", () => {
  it("create cria plano + revisão #1 e aponta current_revision_id", async () => {
    const state: MockState = { plans: [], revisions: [] };
    const client = buildClient(state);
    const svc = new LessonPlanService(client, "acc-1", "user-1");

    const r = await svc.create({
      planKind: "adult",
      referenceMonth: "2026-05-01",
      title: "Adulto Maio 2026",
      internalNotes: null,
      content: { topics: [] },
    });

    expect(r.id).toBe("id-1");
    expect(state.plans).toHaveLength(1);
    expect(state.revisions).toHaveLength(1);
    expect(state.revisions[0].revision_number).toBe(1);
    expect(state.plans[0].current_revision_id).toBe("id-1");
  });

  it("update com content cria nova revisão incrementando o número", async () => {
    const state: MockState = {
      plans: [
        {
          id: "plan-1",
          account_id: "acc-1",
          plan_kind: "adult",
          reference_month: "2026-05-01",
          title: "v1",
          status: "draft",
        },
      ],
      revisions: [
        { id: "rev-1", lesson_plan_id: "plan-1", revision_number: 1, content_json: {} },
      ],
    };
    const client = buildClient(state);
    const svc = new LessonPlanService(client, "acc-1", "user-1");

    const r = await svc.update({
      lessonPlanId: "plan-1",
      internalNotes: null,
      content: { topics: [] },
    });
    expect(r.revisionNumber).toBe(2);
    expect(state.revisions).toHaveLength(2);
  });

  it("publish bloqueia quando outro plano publicado existe sem confirmação", async () => {
    const state: MockState = {
      plans: [
        {
          id: "plan-1",
          account_id: "acc-1",
          plan_kind: "adult",
          reference_month: "2026-05-01",
          title: "novo",
          status: "draft",
        },
        {
          id: "plan-2",
          account_id: "acc-1",
          plan_kind: "adult",
          reference_month: "2026-05-01",
          title: "antigo",
          status: "published",
        },
      ],
      revisions: [],
    };
    const client = buildClient(state);
    const svc = new LessonPlanService(client, "acc-1", "user-1");

    await expect(
      svc.publish({ lessonPlanId: "plan-1", archiveExisting: false }),
    ).rejects.toBeInstanceOf(LessonPlanServiceError);
  });

  it("publish com archiveExisting arquiva o plano anterior", async () => {
    const state: MockState = {
      plans: [
        {
          id: "plan-1",
          account_id: "acc-1",
          plan_kind: "adult",
          reference_month: "2026-05-01",
          title: "novo",
          status: "draft",
        },
        {
          id: "plan-2",
          account_id: "acc-1",
          plan_kind: "adult",
          reference_month: "2026-05-01",
          title: "antigo",
          status: "published",
        },
      ],
      revisions: [],
    };
    const client = buildClient(state);
    const svc = new LessonPlanService(client, "acc-1", "user-1");
    const r = await svc.publish({ lessonPlanId: "plan-1", archiveExisting: true });
    expect(r.archivedExistingId).toBe("plan-2");
    expect(state.plans.find((p) => p.id === "plan-2")?.status).toBe("archived");
    expect(state.plans.find((p) => p.id === "plan-1")?.status).toBe("published");
  });
});

vi.mock("server-only", () => ({}));
