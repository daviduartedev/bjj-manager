import { randomBytes } from "node:crypto";

import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

/** Comprimento da senha temporária (**STU-12.6**). */
export const TEMPORARY_PASSWORD_LENGTH = 12;

/**
 * Cliente Supabase com service role — **apenas** server-side (AUTH-7, SPEC-11.2).
 * Usado em provisionamento de portal quando RLS não permite INSERT em `profiles`.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    return null;
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function findAuthUserIdByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200, page: 1 });
  if (error) return null;

  const found = data.users.find((u) => u.email?.trim().toLowerCase() === normalized);
  return found?.id ?? null;
}

/** Senha temporária legível (sem caracteres ambíguos). */
export function generateTemporaryPassword(
  length = TEMPORARY_PASSWORD_LENGTH,
): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export async function createAuthUserWithPassword(
  admin: SupabaseClient,
  email: string,
  password: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const { data, error } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message ?? "Não foi possível criar o utilizador Auth.",
    };
  }

  return { ok: true, userId: data.user.id };
}

export async function inviteAuthUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const redirectTo = `${appUrl.replace(/\/$/, "")}/login`;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    { redirectTo },
  );

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message ?? "Não foi possível enviar o convite por e-mail.",
    };
  }

  return { ok: true, userId: data.user.id };
}
