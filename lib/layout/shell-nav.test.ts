import { describe, expect, it } from "vitest";

import {
  getBottomNavMore,
  getBottomNavPrimary,
  isBottomNavMoreActive,
  MAIN_NAV_ITEMS,
} from "@/components/layout/dashboard-nav-config";
import { isShellNavActive } from "@/lib/layout/shell-nav";
import { ROUTES } from "@/lib/routes";

describe("isShellNavActive", () => {
  it("marca o destino exacto", () => {
    expect(isShellNavActive("/painel", ROUTES.painel)).toBe(true);
    expect(isShellNavActive("/alunos", ROUTES.alunos)).toBe(true);
  });

  it("mantém o item activo nas subrotas", () => {
    expect(isShellNavActive("/alunos/novo", ROUTES.alunos)).toBe(true);
    expect(isShellNavActive("/alunos/abc/editar", ROUTES.alunos)).toBe(true);
    expect(isShellNavActive("/aulas/turmas", ROUTES.aulas)).toBe(true);
    expect(isShellNavActive("/pedagogico/planos/novo", ROUTES.pedagogicoPlanos)).toBe(true);
  });

  it("não activa um item irmão", () => {
    expect(isShellNavActive("/alunos", ROUTES.painel)).toBe(false);
    expect(isShellNavActive("/painel", ROUTES.alunos)).toBe(false);
    expect(isShellNavActive("/documentos", ROUTES.alunos)).toBe(false);
  });
});

describe("bottom nav chrome", () => {
  it("parte o menu sem perder destinos", () => {
    const primary = getBottomNavPrimary();
    const more = getBottomNavMore();
    const hrefs = [...primary, ...more].map((item) => item.href).sort();
    const all = MAIN_NAV_ITEMS.map((item) => item.href).sort();

    expect(hrefs).toEqual(all);
    expect(primary.length).toBeGreaterThan(0);
    expect(more.length).toBeGreaterThan(0);
  });

  it("destaca Mais quando um destino secundário está activo", () => {
    expect(isBottomNavMoreActive(ROUTES.documentos)).toBe(true);
    expect(isBottomNavMoreActive(ROUTES.configuracoes)).toBe(true);
    expect(isBottomNavMoreActive(ROUTES.painel)).toBe(false);
    expect(isBottomNavMoreActive("/alunos/novo")).toBe(false);
  });
});
