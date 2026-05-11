import { describe, expect, it } from "vitest";

import {
  createLessonPlanSchema,
  duplicateLessonPlanSchema,
  publishLessonPlanSchema,
} from "./lesson-plans";

describe("createLessonPlanSchema", () => {
  it("aceita um plano válido com tópicos", () => {
    const r = createLessonPlanSchema.safeParse({
      planKind: "adult",
      referenceMonth: "2026-05-01",
      title: "Adulto · Maio 2026",
      internalNotes: "",
      content: {
        topics: [
          {
            id: "t-1",
            title: "Tópico 1",
            kind: "techniques",
            items: [{ id: "i-1", text: "Triangle from guard" }],
          },
        ],
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejeita mês de referência fora do formato YYYY-MM-01", () => {
    expect(
      createLessonPlanSchema.safeParse({
        planKind: "adult",
        referenceMonth: "2026-05-15",
        title: "Adulto · Maio 2026",
        content: { topics: [] },
      }).success,
    ).toBe(false);
  });

  it("rejeita planKind desconhecido", () => {
    expect(
      createLessonPlanSchema.safeParse({
        planKind: "juvenil",
        referenceMonth: "2026-05-01",
        title: "x",
        content: { topics: [] },
      }).success,
    ).toBe(false);
  });
});

describe("publishLessonPlanSchema", () => {
  it("default archiveExisting=false", () => {
    const r = publishLessonPlanSchema.safeParse({
      lessonPlanId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.archiveExisting).toBe(false);
  });
});

describe("duplicateLessonPlanSchema", () => {
  it("permite duplicar para outro mês", () => {
    const r = duplicateLessonPlanSchema.safeParse({
      lessonPlanId: "550e8400-e29b-41d4-a716-446655440000",
      targetReferenceMonth: "2026-06-01",
    });
    expect(r.success).toBe(true);
  });
});
