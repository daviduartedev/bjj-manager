import { describe, expect, it } from "vitest";

import {
  isOperationalAreaPath,
  isPortalIndisponivelPath,
  isProtectedAuthenticatedPath,
  isStudentPortalPath,
  ROUTES,
} from "@/lib/routes";

describe("student portal route helpers", () => {
  it("detects portal paths", () => {
    expect(isStudentPortalPath("/portal")).toBe(true);
    expect(isStudentPortalPath("/portal/aulas")).toBe(true);
    expect(isStudentPortalPath("/portal/financeiro")).toBe(true);
    expect(isStudentPortalPath("/painel")).toBe(false);
  });

  it("detects operational paths", () => {
    expect(isOperationalAreaPath("/painel")).toBe(true);
    expect(isOperationalAreaPath("/alunos/abc/editar")).toBe(true);
    expect(isOperationalAreaPath("/portal")).toBe(false);
  });

  it("detects indisponivel path", () => {
    expect(isPortalIndisponivelPath(ROUTES.portalIndisponivel)).toBe(true);
    expect(isPortalIndisponivelPath("/portal")).toBe(false);
  });

  it("unions protected authenticated paths", () => {
    expect(isProtectedAuthenticatedPath("/portal/loja")).toBe(true);
    expect(isProtectedAuthenticatedPath("/mensalidades")).toBe(true);
    expect(isProtectedAuthenticatedPath("/login")).toBe(false);
  });
});
