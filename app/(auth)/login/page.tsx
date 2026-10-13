import type { Metadata } from "next";

import { confirmationRecoveryMessage } from "@/lib/auth/academy-callback";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

type LoginPageProps = {
  searchParams: Promise<{ confirmacao?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.confirmacao) ? params.confirmacao[0] : params.confirmacao;
  return <LoginForm recoveryMessage={confirmationRecoveryMessage(token)} />;
}
