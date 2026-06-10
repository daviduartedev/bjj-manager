/**
 * Rotas canónicas da área autenticada (pt-BR). Ver **SHELL-2**.
 */

export const ROUTES = {
  login: "/login",
  portal: "/portal",
  portalAulas: "/portal/aulas",
  portalPresenca: "/portal/presenca",
  portalLoja: "/portal/loja",
  portalFinanceiro: "/portal/financeiro",
  portalIndisponivel: "/portal/indisponivel",
  portalOnboarding: "/portal/onboarding",
  portalBloqueado: "/portal/bloqueado",
  painel: "/painel",
  alunos: "/alunos",
  alunosNovo: "/alunos/novo",
  mensalidades: "/mensalidades",
  produtos: "/produtos",
  documentos: "/documentos",
  pedagogicoPlanos: "/pedagogico/planos",
  pedagogicoPlanoNovo: "/pedagogico/planos/novo",
  aulas: "/aulas",
  aulasTurmas: "/aulas/turmas",
  aulasTurmasNova: "/aulas/turmas/nova",
  configuracoes: "/configuracoes",
  perfil: "/perfil",
} as const;

/** Edição de turma, horários e inscrições. */
export function routeAulasTurma(classId: string): string {
  return `${ROUTES.aulasTurmas}/${classId}`;
}

/** Detalhe de sessão com lista de check-ins. */
export function routeAulasSessao(sessionId: string): string {
  return `/aulas/sessao/${sessionId}`;
}

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

/** Histórico completo de graduações (**GRD-1.1**). */
export function routeAlunoGraduacoes(studentId: string): string {
  return `${ROUTES.alunos}/${studentId}/graduacoes`;
}

/** Detalhe de documento gerado (`/documentos/[documentId]`). */
export function routeDocumentoDetalhe(documentId: string): string {
  return `${ROUTES.documentos}/${documentId}`;
}

/** Detalhe / edição de plano pedagógico. */
export function routePedagogicoPlano(id: string): string {
  return `${ROUTES.pedagogicoPlanos}/${id}`;
}

export function routePedagogicoPlanoEditar(id: string): string {
  return `${ROUTES.pedagogicoPlanos}/${id}/editar`;
}

/** Prefixos da área operacional (professor/academia). Ver **SHELL-2**. */
export const OPERATIONAL_PATH_PREFIXES: readonly string[] = [
  ROUTES.painel,
  ROUTES.alunos,
  ROUTES.mensalidades,
  ROUTES.produtos,
  ROUTES.documentos,
  "/pedagogico",
  ROUTES.aulas,
  ROUTES.configuracoes,
  ROUTES.perfil,
];

/** Prefixos do portal do aluno (**SPT-**, **SHELL-2**). */
export const STUDENT_PORTAL_PATH_PREFIXES: readonly string[] = [ROUTES.portal];

/** @deprecated Preferir {@link OPERATIONAL_PATH_PREFIXES}. */
export const AUTHENTICATED_PATH_PREFIXES = OPERATIONAL_PATH_PREFIXES;

export function isOperationalAreaPath(pathname: string): boolean {
  return OPERATIONAL_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** @deprecated Preferir {@link isOperationalAreaPath}. */
export function isAuthenticatedAreaPath(pathname: string): boolean {
  return isOperationalAreaPath(pathname);
}

export function isStudentPortalPath(pathname: string): boolean {
  return STUDENT_PORTAL_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isPortalIndisponivelPath(pathname: string): boolean {
  return (
    pathname === ROUTES.portalIndisponivel ||
    pathname.startsWith(`${ROUTES.portalIndisponivel}/`)
  );
}

export function isPortalOnboardingPath(pathname: string): boolean {
  return (
    pathname === ROUTES.portalOnboarding ||
    pathname.startsWith(`${ROUTES.portalOnboarding}/`)
  );
}

export function isPortalBloqueadoPath(pathname: string): boolean {
  return (
    pathname === ROUTES.portalBloqueado ||
    pathname.startsWith(`${ROUTES.portalBloqueado}/`)
  );
}

export function isPortalExemptFromOnboardingPath(pathname: string): boolean {
  return (
    isPortalIndisponivelPath(pathname) ||
    isPortalOnboardingPath(pathname) ||
    isPortalBloqueadoPath(pathname)
  );
}

export function isProtectedAuthenticatedPath(pathname: string): boolean {
  return isOperationalAreaPath(pathname) || isStudentPortalPath(pathname);
}

/** Legado: rota antiga da área operacional. */
export const LEGACY_DASHBOARD_PREFIX = "/dashboard";
