import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { isStudentRole, postLoginPathForRole, resolveAuthRole } from "@/lib/auth/roles";

function profilesClient(result: {
  data: { role?: string | null } | null;
  error: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { from } as unknown as SupabaseClient;
}

describe("resolveAuthRole", () => {
  it("returns null when the profile query errors", async () => {
    const supabase = profilesClient({ data: null, error: { message: "unavailable" } });

    await expect(resolveAuthRole(supabase, "user-1")).resolves.toBeNull();
  });

  it("returns null when there is no profile row", async () => {
    const supabase = profilesClient({ data: null, error: null });

    await expect(resolveAuthRole(supabase, "user-1")).resolves.toBeNull();
  });

  it("returns null when the stored role is null", async () => {
    const supabase = profilesClient({ data: { role: null }, error: null });

    await expect(resolveAuthRole(supabase, "user-1")).resolves.toBeNull();
  });

  it("returns student only for the student role", async () => {
    const supabase = profilesClient({ data: { role: "student" }, error: null });

    await expect(resolveAuthRole(supabase, "user-1")).resolves.toBe("student");
  });

  it("returns professor only for the professor role", async () => {
    const supabase = profilesClient({ data: { role: "professor" }, error: null });

    await expect(resolveAuthRole(supabase, "user-1")).resolves.toBe("professor");
  });

  it("returns null for an unknown or empty role", async () => {
    const unknown = profilesClient({ data: { role: "dono" }, error: null });
    const empty = profilesClient({ data: { role: "" }, error: null });

    await expect(resolveAuthRole(unknown, "user-1")).resolves.toBeNull();
    await expect(resolveAuthRole(empty, "user-1")).resolves.toBeNull();
  });
});

describe("isStudentRole", () => {
  it("treats null as not a student", () => {
    expect(isStudentRole(null)).toBe(false);
    expect(isStudentRole("student")).toBe(true);
    expect(isStudentRole("professor")).toBe(false);
  });
});

describe("postLoginPathForRole", () => {
  it("keeps a known role on its own area", () => {
    expect(postLoginPathForRole("student")).toBe("/portal");
    expect(postLoginPathForRole("professor")).toBe("/painel");
  });
});
