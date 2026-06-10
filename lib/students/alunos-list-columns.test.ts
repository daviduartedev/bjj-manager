import { describe, expect, it } from "vitest";

import {
  DEFAULT_ALUNOS_LIST_COLUMNS,
  parseAlunosListColumns,
  stringifyAlunosListColumns,
  toggleAlunosListColumn,
} from "@/lib/students/alunos-list-columns";

describe("alunos-list-columns", () => {
  it("usa todas as colunas por defeito", () => {
    expect(parseAlunosListColumns()).toEqual([...DEFAULT_ALUNOS_LIST_COLUMNS]);
  });

  it("parseia subconjunto da URL", () => {
    expect(parseAlunosListColumns("faixa,peso,idade")).toEqual([
      "faixa",
      "peso",
      "idade",
    ]);
  });

  it("toggle adiciona e remove coluna mantendo ordem canónica", () => {
    const without = toggleAlunosListColumn(
      ["faixa", "idade"],
      "faixa",
    );
    expect(without).toEqual(["idade"]);
    const withPeso = toggleAlunosListColumn(without, "peso");
    expect(withPeso).toEqual(["peso", "idade"]);
  });

  it("omitir colunas default na query string", () => {
    expect(stringifyAlunosListColumns(DEFAULT_ALUNOS_LIST_COLUMNS)).toBeNull();
    expect(stringifyAlunosListColumns(["faixa", "idade"])).toBe("faixa,idade");
  });
});
