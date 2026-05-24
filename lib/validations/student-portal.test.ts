import { describe, expect, it } from "vitest";

import {
  cancelCheckInSchema,
  checkInSchema,
  completeStudentOnboardingSchema,
} from "@/lib/validations/student-portal";

describe("completeStudentOnboardingSchema", () => {
  it("requires acceptTerms true", () => {
    const result = completeStudentOnboardingSchema.safeParse({
      acceptTerms: false,
      guardianEmail: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts adult without guardian email", () => {
    const result = completeStudentOnboardingSchema.safeParse({
      acceptTerms: true,
      guardianEmail: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("checkInSchema", () => {
  it("accepts uuid classSessionId", () => {
    const result = checkInSchema.safeParse({
      classSessionId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid uuid", () => {
    const result = checkInSchema.safeParse({ classSessionId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects extra fields", () => {
    const result = checkInSchema.safeParse({
      classSessionId: "550e8400-e29b-41d4-a716-446655440000",
      studentId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(false);
  });
});

describe("cancelCheckInSchema", () => {
  it("matches checkInSchema shape", () => {
    const payload = {
      classSessionId: "550e8400-e29b-41d4-a716-446655440000",
    };
    expect(cancelCheckInSchema.safeParse(payload).success).toBe(true);
    expect(checkInSchema.safeParse(payload).success).toBe(true);
  });
});
