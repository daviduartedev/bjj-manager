import type { Metadata } from "next";

import { confirmationRecoveryMessage } from "@/lib/auth/academy-callback";
import { PASSWORD_UPDATED_MESSAGE } from "@/lib/auth/password-recovery";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

type LoginPageProps = {
  searchParams: Promise<{ confirmacao?: string | string[]; senha?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.confirmacao) ? params.confirmacao[0] : params.confirmacao;
  const senha = Array.isArray(params.senha) ? params.senha[0] : params.senha;
  return <LoginForm recoveryMessage={confirmationRecoveryMessage(token)} successMessage={senha === "atualizada" ? PASSWORD_UPDATED_MESSAGE : null} />;
}
