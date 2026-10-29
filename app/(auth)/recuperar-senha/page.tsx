import type { Metadata } from "next";

import { recoveryRequestErrorMessage } from "@/lib/auth/password-recovery";

import { RecoverPasswordForm } from "./recover-password-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default async function RecoverPasswordPage({ searchParams }: { searchParams: Promise<{ erro?: string | string[] }> }) {
  const params = await searchParams;
  const token = Array.isArray(params.erro) ? params.erro[0] : params.erro;
  return <RecoverPasswordForm linkError={recoveryRequestErrorMessage(token)} />;
}
