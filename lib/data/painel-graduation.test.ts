import { describe, expect, it } from "vitest";

import { buildPainelGraduationView, type PainelGraduationStudent } from "./painel-graduation";

function student(overrides: Partial<PainelGraduationStudent> = {}): PainelGraduationStudent {
  return {
    id: "aluno",
    fullName: "Aluno",
    kind: "adult",
    academyStartDate: "2020-01-01",
    currentBelt: null,
    currentDegree: null,
    graduations: [],
    graduationReferenceId: null,
    currentRankCode: null,
    currentRankDate: null,
    ...overrides,
  };
}

describe("painel de graduação por modalidade", () => {
  it("conserva alerta e distribuição de faixa do Jiu-Jitsu", () => {
    const view = buildPainelGraduationView("jiu_jitsu", "2025-01-05", [
      student({
        id: "longo",
        fullName: "Tempo longo",
        academyStartDate: "2026-01-01",
        currentBelt: { id: "belt-blue", slug: "blue", kind: "adult", ordinal: 2 },
        currentDegree: 2,
        graduations: [{
          resulting_belt_id: "belt-blue",
          resulting_degree: 2,
          graduated_at: "2024-01-01T15:00:00.000Z",
        }],
      }),
      student({
        id: "recente",
        fullName: "Recente",
        currentBelt: { id: "belt-white", slug: "white", kind: "adult", ordinal: 0 },
        currentDegree: 0,
        graduations: [{
          resulting_belt_id: "belt-white",
          resulting_degree: 0,
          graduated_at: "2025-01-01T15:00:00.000Z",
        }],
      }),
      student({
        id: "kids",
        fullName: "Criança",
        kind: "kids",
        currentBelt: { id: "belt-gray", slug: "gray_white", kind: "kids", ordinal: 1 },
        currentDegree: 0,
        graduations: [{
          resulting_belt_id: "belt-gray",
          resulting_degree: 0,
          graduated_at: "2025-01-04T15:00:00.000Z",
        }],
      }),
    ]);

    expect(view.alerts.map((row) => row.fullName)).toEqual(["Tempo longo"]);
    expect(view.distributionAdult.map((slice) => slice.label)).toEqual(["Branca", "Azul"]);
    expect(view.distributionKids.map((slice) => slice.label)).toEqual(["Cinza/Branca"]);
  });

  it("não cria prontidão nem faixa para Boxe, mesmo com entrada antiga", () => {
    const view = buildPainelGraduationView("boxing", "2026-10-22", [
      student({ fullName: "Boxe", academyStartDate: "2020-01-01" }),
    ]);
    expect(view.alerts).toEqual([]);
    expect(view.distributionAdult).toEqual([]);
    expect(view.distributionKids).toEqual([]);
  });

  it("separa dan vermelhos do Judô e não estima elegibilidade pela matrícula", () => {
    const view = buildPainelGraduationView("judo", "2026-10-22", [
      student({
        id: "dez",
        fullName: "Décimo",
        graduationReferenceId: "cbj-2023",
        currentRankCode: "dan-10",
        currentRankDate: null,
        academyStartDate: "2020-01-01",
      }),
      student({
        id: "nove",
        fullName: "Nono",
        graduationReferenceId: "cbj-2023",
        currentRankCode: "dan-9",
        currentRankDate: null,
        academyStartDate: "2020-01-01",
      }),
    ]);
    expect(view.alerts).toEqual([]);
    expect(view.distributionKids).toEqual([]);
    expect(view.distributionAdult.map((slice) => [slice.label, slice.count])).toEqual([
      ["9º dan — Vermelha", 1],
      ["10º dan — Vermelha", 1],
    ]);
  });

  it("distingue khan dourados do Muay Thai sem alerta de prontidão", () => {
    const view = buildPainelGraduationView("muay_thai", "2026-10-22", [
      student({
        graduationReferenceId: "cbmtt-19-khan",
        currentRankCode: "khan-19",
        currentRankDate: null,
      }),
      student({
        id: "dezesseis",
        graduationReferenceId: "cbmtt-19-khan",
        currentRankCode: "khan-16",
        currentRankDate: null,
      }),
    ]);
    expect(view.alerts).toEqual([]);
    expect(view.distributionAdult.map((slice) => slice.label)).toEqual([
      "16º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)",
      "19º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)",
    ]);
  });
});
