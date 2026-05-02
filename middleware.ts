import { NextResponse, type NextRequest } from "next/server";

import {
  allowRateLimit,
  isNextServerActionRequest,
  serverActionsRateLimitKey,
} from "@/lib/security/rate-limit";
import { updateSession } from "@/lib/supabase/middleware";

const SERVER_ACTION_WINDOW_MS = 60_000;
const SERVER_ACTION_MAX =
  Number.parseInt(process.env.SECURITY_SERVER_ACTION_MAX_PER_MINUTE ?? "", 10) ||
  180;

/**
 * Middleware global: rate limit a Server Actions (**SECURITY_SERVER_ACTION_MAX_PER_MINUTE**),
 * revalida sessão Supabase (SSR), protege prefixos **SHELL-2**, `/dashboard` → `/painel`.
 */
export async function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    request.nextUrl.pathname.startsWith("/design-system")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  if (isNextServerActionRequest(request)) {
    const key = serverActionsRateLimitKey(request);
    if (!allowRateLimit(key, SERVER_ACTION_MAX, SERVER_ACTION_WINDOW_MS)) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
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
