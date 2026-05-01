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
     * Não executar middleware em pedidos de assets do Next (doc oficial + `/_next/*` em dev,
     * ex. webpack-hmr), nem em `api/*`, favicon e extensões estáticas. Evita interferir em
     * `/_next/static/*` quando o pedido deve ir direto ao filesystem interno do Next.
     */
    "/((?!api|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
