import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware global: revalida sessão Supabase (SSR), protege prefixos **SHELL-2**
 * e redireciona `/dashboard` → `/painel` (ver `lib/supabase/middleware.ts`, AUTH-2).
 */
export async function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    request.nextUrl.pathname.startsWith("/design-system")
  ) {
    return new NextResponse(null, { status: 404 });
  }

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
