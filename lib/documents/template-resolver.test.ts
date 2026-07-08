import { describe, expect, it } from "vitest";

import { resolveTemplate } from "./template-resolver";

describe("resolveTemplate", () => {
  it("resolve cada tipo conhecido", () => {
    const types = [
      "payment_receipt",
      "enrollment_proof",
      "certificate",
      "liability_term",
      "enrollment_liability_form",
      "manual_receipt",
    ] as const;
    for (const t of types) {
      const r = resolveTemplate(t);
      expect(r.version).toBe(1);
      expect(typeof r.builder).toBe("function");
    }
  });
});
