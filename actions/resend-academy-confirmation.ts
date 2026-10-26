"use server";

import { resendAcademyConfirmation as resend } from "@/lib/auth/resend-academy-confirmation";
import { createClient } from "@/lib/supabase/server";

export async function resendAcademyConfirmation(input: unknown) {
  return resend(input, {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
    async resendSignup(args) {
      const supabase = await createClient();
      const { error } = await supabase.auth.resend({
        type: args.type,
        email: args.email,
        options: { emailRedirectTo: args.emailRedirectTo },
      });
      if (error) throw new Error("resend failed");
    },
  });
}
