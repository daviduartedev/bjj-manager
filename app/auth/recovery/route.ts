import { NextResponse } from "next/server";

import { recoveryCallbackPath } from "@/lib/auth/password-recovery";
import { createClient } from "@/lib/supabase/server";

/**
 * Troca o código de recuperação pela sessão e segue para o formulário fixo.
 * Não provisiona academia e ignora qualquer destino enviado na query.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let exchangeFailed = !code || !supabaseUrl || !supabaseAnonKey;
  if (!exchangeFailed && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    exchangeFailed = Boolean(error);
  }

  return NextResponse.redirect(new URL(recoveryCallbackPath({ code, exchangeFailed }), requestUrl.origin));
}
