import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware global - revalida sessao Supabase em todas as rotas.
 * A protecao real (redirect /login) sera adicionada no Cycle 05 / 06.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match em todos os caminhos exceto:
     * - _next/static, _next/image, favicon
     * - arquivos com extensao (svg, png, jpg, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
