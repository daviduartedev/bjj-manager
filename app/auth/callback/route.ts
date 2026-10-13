import { NextResponse } from "next/server";

import { destinationForProvision } from "@/lib/auth/provision-destination";
import { createClient } from "@/lib/supabase/server";

/**
 * Confirmação do cadastro no mesmo navegador.
 * O destino sai da provisão — o parâmetro `next` da query não é seguido.
 * Convite de aluno continua em /login.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const loginUrl = new URL("/login", requestUrl.origin);
  const code = requestUrl.searchParams.get("code");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!code || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(loginUrl);

  const { data, error: provisionError } = await supabase.rpc("provision_academy_for_current_user");
  const destination = provisionError ? "/login" : destinationForProvision(data);

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
