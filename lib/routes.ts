/**
 * Rotas canónicas da área autenticada (pt-BR). Ver **SHELL-2**.
 */

export const ROUTES = {
  login: "/login",
  painel: "/painel",
  alunos: "/alunos",
  alunosNovo: "/alunos/novo",
  mensalidades: "/mensalidades",
  configuracoes: "/configuracoes",
  perfil: "/perfil",
} as const;

/** Perfil só leitura (`/alunos/[id]` — **SPR-1**). */
export function routeAlunoPerfil(studentId: string): string {
  return `${ROUTES.alunos}/${studentId}`;
}

/** Ficha completa do aluno (`/alunos/[id]/editar`). */
export function routeAlunoEditar(studentId: string): string {
  return `${ROUTES.alunos}/${studentId}/editar`;
}

/** Prefixos protegidos pelo middleware (sessão obrigatória). */
export const AUTHENTICATED_PATH_PREFIXES: readonly string[] = [
  ROUTES.painel,
  ROUTES.alunos,
  ROUTES.mensalidades,
  ROUTES.configuracoes,
  ROUTES.perfil,
];

export function isAuthenticatedAreaPath(pathname: string): boolean {
  return AUTHENTICATED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Legado: rota antiga da área operacional. */
export const LEGACY_DASHBOARD_PREFIX = "/dashboard";
