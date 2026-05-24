import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isStudentRole, postLoginPathForRole, resolveAuthRole } from "@/lib/auth/roles";
import { isStudentPortalEnabled } from "@/lib/feature-flags/student-portal";
import { mergeSessionCookieOptions } from "@/lib/security/cookie-hardening";
import {
  isOperationalAreaPath,
  isPortalBloqueadoPath,
  isPortalIndisponivelPath,
  isPortalOnboardingPath,
  isProtectedAuthenticatedPath,
  isStudentPortalPath,
  LEGACY_DASHBOARD_PREFIX,
  ROUTES,
} from "@/lib/routes";

type StudentPortalGateRow = {
  archived_at: string | null;
  removed_at: string | null;
  portal_terms_accepted_at: string | null;
};

async function resolveStudentPortalGateRow(
  supabase: Parameters<typeof resolveAuthRole>[0],
  userId: string,
): Promise<StudentPortalGateRow | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile?.account_id) return null;

  const { data: student } = await supabase
    .from("students")
    .select("archived_at, removed_at, portal_terms_accepted_at")
    .eq("user_id", userId)
    .eq("account_id", profile.account_id)
    .maybeSingle();

  return (student as StudentPortalGateRow | null) ?? null;
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

function redirectWithCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
) {
  const redirectResponse = NextResponse.redirect(new URL(pathname, request.url));
  copyCookies(supabaseResponse, redirectResponse);
  return redirectResponse;
}

/**
 * Atualiza a sessão Supabase em cada navegação (necessário para SSR) e aplica
 * redirecionamentos AUTH-2 / AUTH-8, proteção **SHELL-2** e legado /dashboard.
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

  if (user && (pathname === ROUTES.login || pathname === "/register")) {
    const role = await resolveAuthRole(supabase, user.id);
    return redirectWithCookies(request, supabaseResponse, postLoginPathForRole(role));
  }

  if (!user && isProtectedAuthenticatedPath(pathname)) {
    return redirectWithCookies(request, supabaseResponse, ROUTES.login);
  }

  if (!user && pathname === "/register") {
    return redirectWithCookies(request, supabaseResponse, ROUTES.login);
  }

  if (user && (isStudentPortalPath(pathname) || isOperationalAreaPath(pathname))) {
    const role = await resolveAuthRole(supabase, user.id);

    if (isStudentPortalPath(pathname) && !isStudentRole(role)) {
      return redirectWithCookies(request, supabaseResponse, ROUTES.painel);
    }

    if (isOperationalAreaPath(pathname) && isStudentRole(role)) {
      return redirectWithCookies(request, supabaseResponse, ROUTES.portal);
    }

    if (
      isStudentRole(role) &&
      isStudentPortalPath(pathname) &&
      !isStudentPortalEnabled() &&
      !isPortalIndisponivelPath(pathname)
    ) {
      return redirectWithCookies(request, supabaseResponse, ROUTES.portalIndisponivel);
    }

    if (isStudentRole(role) && isStudentPortalPath(pathname) && isStudentPortalEnabled()) {
      const studentRow = await resolveStudentPortalGateRow(supabase, user.id);

      if (studentRow?.archived_at || studentRow?.removed_at) {
        if (!isPortalBloqueadoPath(pathname)) {
          return redirectWithCookies(request, supabaseResponse, ROUTES.portalBloqueado);
        }
      } else if (studentRow && !studentRow.portal_terms_accepted_at) {
        if (!isPortalOnboardingPath(pathname)) {
          return redirectWithCookies(request, supabaseResponse, ROUTES.portalOnboarding);
        }
      } else if (studentRow?.portal_terms_accepted_at && isPortalOnboardingPath(pathname)) {
        return redirectWithCookies(request, supabaseResponse, ROUTES.portal);
      }
    }
  }

  return supabaseResponse;
}
