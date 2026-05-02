import { describe, expect, it } from "vitest";

import { updateAccountSchema, updateProfileSchema } from "./settings";

describe("settings schemas strict (mass assignment)", () => {
  it("updateAccountSchema rejeita account_id", () => {
    expect(
      updateAccountSchema.safeParse({
        name: "Academia",
        account_id: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(false);
  });

  it("updateProfileSchema rejeita user_id", () => {
    expect(
      updateProfileSchema.safeParse({
        displayName: "Professor",
        phone: "",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(false);
  });
});
