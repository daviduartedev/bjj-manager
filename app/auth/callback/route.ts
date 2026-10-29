import { NextResponse } from "next/server";

import { academyCallbackPath } from "@/lib/auth/academy-callback";
import { createClient } from "@/lib/supabase/server";
import { isPlatformOwner } from "@/lib/platform-admin/service";

/**
 * Confirmação do cadastro no mesmo navegador.
 * O destino sai da provisão — o parâmetro `next` da query não é seguido.
 * Link expirado, código ausente ou troca falhada cai uma vez em /login com recuperação.
 * Convite de aluno continua em /login.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let exchangeFailed = !code || !supabaseUrl || !supabaseAnonKey;
  let provisionFailed = false;
  let provisionData: unknown = null;

  if (!exchangeFailed && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      exchangeFailed = true;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isPlatformOwner(user.id, process.env.CASCA_PLATFORM_ADMIN_USER_ID)) {
        return NextResponse.redirect(new URL("/admin/casca", requestUrl.origin));
      }
      const { data, error: provisionError } = await supabase.rpc(
        "provision_academy_for_current_user",
      );
      provisionFailed = Boolean(provisionError);
      provisionData = data;
    }
  }

  const path = academyCallbackPath({
    code,
    next,
    exchangeFailed,
    provisionFailed,
    provisionData,
  });

  return NextResponse.redirect(new URL(path, requestUrl.origin));
}
