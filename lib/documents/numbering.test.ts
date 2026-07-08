import { describe, expect, it } from "vitest";

import { formatDocumentNumber } from "./numbering";

describe("formatDocumentNumber", () => {
  it("usa prefixo + ano + seq 4 dígitos", () => {
    expect(formatDocumentNumber("payment_receipt", 2026, 1)).toBe("REC-2026-0001");
    expect(formatDocumentNumber("certificate", 2026, 42)).toBe("CERT-2026-0042");
    expect(formatDocumentNumber("enrollment_proof", 2026, 999)).toBe("MAT-2026-0999");
    expect(formatDocumentNumber("liability_term", 2026, 1234)).toBe("TR-2026-1234");
    expect(formatDocumentNumber("enrollment_liability_form", 2026, 3)).toBe(
      "ELF-2026-0003",
    );
    expect(formatDocumentNumber("manual_receipt", 2026, 7)).toBe("MREC-2026-0007");
  });
});
