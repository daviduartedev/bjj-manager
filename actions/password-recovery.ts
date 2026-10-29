"use server";

import { passwordRecoveryCallbackUrl, requestPasswordRecovery } from "@/lib/auth/password-recovery";
import { createClient } from "@/lib/supabase/server";

export async function sendPasswordRecovery(input: unknown) {
  const supabase = await createClient();
  return requestPasswordRecovery(input, {
    redirectTo: passwordRecoveryCallbackUrl({ NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL }),
    async resetPasswordForEmail(email, redirectTo) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      return { error };
    },
  });
}
