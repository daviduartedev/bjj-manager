import { describe, expect, it } from "vitest";

import {
  dialogSizeClass,
  formActionsClass,
  primaryActionClass,
  secondaryActionClass,
} from "@/lib/ui/form-chrome";

describe("form chrome", () => {
  it("define exactamente três larguras de diálogo", () => {
    expect(Object.keys(dialogSizeClass).sort()).toEqual([
      "confirm",
      "short",
      "wide",
    ]);
  });

  it("alinha CTAs à direita com a mesma altura e largura mínima", () => {
    expect(formActionsClass).toContain("justify-end");
    expect(primaryActionClass).toContain("h-10");
    expect(secondaryActionClass).toContain("h-10");
    expect(primaryActionClass).toContain("min-w-[7.5rem]");
    expect(secondaryActionClass).toContain("min-w-[7.5rem]");
  });
});
