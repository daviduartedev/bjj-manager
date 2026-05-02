import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { mergeSessionCookieOptions } from "@/lib/security/cookie-hardening";
import {
  isAuthenticatedAreaPath,
  LEGACY_DASHBOARD_PREFIX,
  ROUTES,
} from "@/lib/routes";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

/**
 * Atualiza a sessão Supabase em cada navegação (necessário para SSR) e aplica
 * redirecionamentos AUTH-2 (login → /painel, proteção **SHELL-2**, legado /dashboard).
 *
 * Sem variáveis Supabase (.env), comportamento no-op (bootstrap do projeto).
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: unknown }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(
            name,
            value,
            mergeSessionCookieOptions(
              options as Record<string, unknown> | undefined,
            ) as Parameters<typeof supabaseResponse.cookies.set>[2],
          ),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname === LEGACY_DASHBOARD_PREFIX || pathname.startsWith(`${LEGACY_DASHBOARD_PREFIX}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.painel;
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const redirectResponse = NextResponse.redirect(new URL(ROUTES.painel, request.url));
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (!user && isAuthenticatedAreaPath(pathname)) {
    const redirectResponse = NextResponse.redirect(new URL(ROUTES.login, request.url));
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (!user && pathname === "/register") {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
