import { describe, expect, it } from "vitest";
import { referencedGraduationSummary } from "./referenced-graduation-summary";
describe("apresentação da data referenciada", () => {
  it("mantém data desconhecida e tempo indisponível mesmo com entrada conhecida", () => {
    expect(referencedGraduationSummary({ graduation_reference_id:"cbj-2023",current_rank_code:"dan-10",current_rank_date:null }, "2026-10-22")).toMatchObject({ dateLabel:"Data não informada",durationLabel:"Tempo indisponível" });
  });
  it("usa exclusivamente a data civil da graduação conhecida", () => {
    expect(referencedGraduationSummary({ graduation_reference_id:"cbj-2023",current_rank_code:"kyu-1",current_rank_date:"2025-10-22" }, "2026-10-22")).toMatchObject({ dateLabel:"22 out 2025",durationLabel:"1 ano" });
  });
});
