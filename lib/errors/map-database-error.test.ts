import { describe, expect, it } from "vitest";

import {
  isDatabasePrivilegeError,
  mapDatabaseErrorToUserMessage,
} from "./map-database-error";

describe("isDatabasePrivilegeError", () => {
  it("reconhece a recusa de RLS que o caderno devolve ao salvar", () => {
    const error = {
      code: "42501",
      message:
        'new row violates row-level security policy for table "product_ledger_notes"',
    };
    expect(isDatabasePrivilegeError(error)).toBe(true);
    expect(mapDatabaseErrorToUserMessage(error)).toBeNull();
  });

  it("não trata coluna ausente como falta de permissão", () => {
    const error = {
      code: "42703",
      message: 'column "updated_at" of relation "product_ledger_notes" does not exist',
    };
    expect(isDatabasePrivilegeError(error)).toBe(false);
    expect(mapDatabaseErrorToUserMessage(error)).toMatch(/atualização na base/);
  });
});
