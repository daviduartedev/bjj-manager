import { describe, expect, it } from "vitest";

import {
  cancelCheckInSchema,
  checkInSchema,
  completeStudentOnboardingSchema,
  provisionPortalAccessSchema,
} from "@/lib/validations/student-portal";

const STUDENT_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("provisionPortalAccessSchema", () => {
  it("accepts link_existing mode", () => {
    const result = provisionPortalAccessSchema.safeParse({
      mode: "link_existing",
      studentId: STUDENT_ID,
      authEmail: "aluno@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts create_invite mode", () => {
    const result = provisionPortalAccessSchema.safeParse({
      mode: "create_invite",
      studentId: STUDENT_ID,
      email: "aluno@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts create_password mode", () => {
    const result = provisionPortalAccessSchema.safeParse({
      mode: "create_password",
      studentId: STUDENT_ID,
      email: "aluno@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects link_existing without authEmail", () => {
    const result = provisionPortalAccessSchema.safeParse({
      mode: "link_existing",
      studentId: STUDENT_ID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra fields", () => {
    const result = provisionPortalAccessSchema.safeParse({
      mode: "create_invite",
      studentId: STUDENT_ID,
      email: "aluno@example.com",
      authEmail: "extra@example.com",
    });
    expect(result.success).toBe(false);
  });
});

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
