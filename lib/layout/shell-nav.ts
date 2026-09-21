/**
 * Destino activo no chrome autenticado (**SHELL-3.3**):
 * o item cobre a rota exacta e as subrotas (`/alunos/novo` mantém Alunos).
 */
export function isShellNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
