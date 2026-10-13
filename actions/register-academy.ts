"use server";

import {
  submitAcademyRegistration,
  type SignupCallResult,
} from "@/lib/auth/register-academy";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function authErrorFields(error: { message: string }): SignupCallResult["error"] {
  const code = "code" in error && typeof error.code === "string" ? error.code : undefined;
  return { message: error.message, code };
}

export async function registerAcademy(input: unknown) {
  const appUrl = process.env.APP_URL ?? "";
  const admin = createAdminClient();

  return submitAcademyRegistration(input, {
    appUrl,
    async signUp(args) {
      if (!admin) {
        return { user: null, error: { message: "registration unavailable" } };
      }

      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({
        email: args.email,
        password: args.password,
        options: { emailRedirectTo: args.emailRedirectTo },
      });

      const identities = data.user?.identities;
      return {
        user: data.user
          ? {
              id: data.user.id,
              identities: Array.isArray(identities)
                ? identities.map((identity) => ({ id: identity.id }))
                : null,
            }
          : null,
        error: error ? authErrorFields(error) : null,
      };
    },
    async recordIntent(args) {
      if (!admin) return { ok: false };

      const { error } = await admin.rpc("record_academy_registration", {
        user_id: args.userId,
        academy_name: args.academyName,
        display_name: args.displayName,
      });

      return error ? { ok: false } : { ok: true };
    },
  });
}
