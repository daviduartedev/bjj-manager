import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Atualiza a sessao Supabase em cada navegacao (necessario para SSR).
 *
 * Comportamento defensivo: se as variaveis Supabase ainda nao foram
 * configuradas (caso tipico durante o Cycle 0430-project-bootstrap,
 * antes do Cycle 0430-supabase-schema / 0430-authentication), este
 * middleware vira no-op em vez de quebrar a aplicacao. Assim que
 * voce preencher .env.local, ele passa a revalidar a sessao
 * automaticamente.
 *
 * Sera ligado ao middleware.ts da raiz para proteger rotas
 * autenticadas no Cycle 0430-app-shell.
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem credenciais configuradas ainda -> nao tenta instanciar o cliente.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: do not run code between createServerClient and getUser.
  await supabase.auth.getUser();

  return supabaseResponse;
}
