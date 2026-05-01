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

/** Perfil só leitura (`/alunos/[id]`, **SPR-1**). */
export function routeAlunoPerfil(studentId: string): string {
  return `${ROUTES.alunos}/${studentId}`;
}

/** Detalhe financeiro na lista de mensalidades (**BUI-1**). */
export function routeMensalidadesAluno(studentId: string): string {
  return `${ROUTES.mensalidades}/${studentId}`;
}

/** Lista de mensalidades com filtro inicial (**BUI-2.6**, **PNL-**). */
export function routeMensalidadesComFiltro(filtro: "atrasado" | "pendente"): string {
  return `${ROUTES.mensalidades}?filtro=${filtro}`;
}

/** Lista de alunos só ativos (atalhos do painel). */
export function routeAlunosActivos(): string {
  return `${ROUTES.alunos}?status=active`;
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
