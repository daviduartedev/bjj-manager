"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowUpRight, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand/logo-mark";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { mapAuthErrorToMessage } from "@/lib/auth/map-auth-error";
import { completePasswordLogin } from "@/lib/auth/provision-destination";
import { resolveAuthRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

import { ResendConfirmationForm } from "../resend-confirmation-form";

const photo = "/images/casca-login-academy-bg.png";

export function LoginForm({ recoveryMessage }: { recoveryMessage: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resendForEmail, setResendForEmail] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        if (error.code === "email_not_confirmed") {
          setResendForEmail(values.email);
        }
        toast.error(mapAuthErrorToMessage(error));
        return;
      }
      setResendForEmail(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Não foi possível confirmar a sessão.");
        return;
      }
      const role = await resolveAuthRole(supabase, user.id);
      const decision = await completePasswordLogin({
        role,
        async provision() {
          const { data, error } = await supabase.rpc("provision_academy_for_current_user");
          return { data, error: Boolean(error) };
        },
      });
      if ("message" in decision) {
        toast.error(decision.message);
        return;
      }
      toast.success("Sessão iniciada.");
      router.push(decision.path);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] min-h-dvh overflow-y-auto bg-[#F5F3F0] text-[#050505]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[570px] bg-[#050505] [clip-path:polygon(0_0,100%_0,100%_82%,0_62%)] sm:h-[620px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg,rgba(5,5,5,.82),rgba(5,5,5,.88)),url(${photo})`,
          }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "radial-gradient(rgba(245,243,240,.72) 1.2px,transparent 1.2px)",
            backgroundSize: "34px 34px",
            maskImage: "linear-gradient(90deg,black,transparent 78%)",
          }}
        />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" aria-label="Casca — início" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BF1E27] focus-visible:ring-offset-2">
          <LogoMark height={32} priority className="border border-white/10" />
        </Link>
        <Link
          href="/register"
          className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/55 px-4 py-2.5 text-xs font-bold tracking-[0.12em] text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          CRIAR ACADEMIA
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </header>

      <main className="relative z-[1] mx-auto flex min-h-[calc(100dvh-80px)] max-w-6xl items-center justify-center px-5 pb-20 pt-5 sm:px-8 sm:pb-24">
        <section className="w-full max-w-[480px] rounded-2xl bg-[#F5F3F0] p-7 text-[#050505] shadow-[0_28px_80px_rgba(0,0,0,0.32)] ring-1 ring-black/[0.08] sm:p-12">
          <div className="text-center">
            <h1 className="mb-2 text-balance text-[32px] font-semibold leading-tight tracking-[-0.035em] text-[#050505] sm:text-[36px]">
              Bem-vindo de volta
            </h1>
            <p className="mb-8 text-sm text-[#3A3A3A]/75">
              Entre com os dados da sua conta Casca.
            </p>
          </div>

          {recoveryMessage ? (
            <div className="mb-6 space-y-4 rounded-lg bg-white/75 p-4 text-sm text-[#3A3A3A]">
              <p>{recoveryMessage}</p>
              <ResendConfirmationForm />
            </div>
          ) : null}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold tracking-[0.16em] text-[#3A3A3A]/75">
                      E-MAIL
                    </FormLabel>
                    <div className="relative flex h-12 items-center">
                      <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 z-10 size-4 text-[#3A3A3A]/50" />
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          disabled={loading}
                          placeholder="nome@academia.com.br"
                          className="h-12 rounded-md border-[#E5E2DC] bg-white/75 pl-10 text-sm placeholder:text-[#3A3A3A]/45 focus-visible:ring-[#BF1E27]"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold tracking-[0.16em] text-[#3A3A3A]/75">
                      SENHA
                    </FormLabel>
                    <div className="relative flex h-12 items-center">
                      <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 z-10 size-4 text-[#3A3A3A]/50" />
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          disabled={loading}
                          placeholder="Sua senha"
                          className="h-12 rounded-md border-[#E5E2DC] bg-white/75 pl-10 text-sm placeholder:text-[#3A3A3A]/45 focus-visible:ring-[#BF1E27]"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="group mt-2 h-[58px] w-full rounded-md bg-[#BF1E27] text-xs font-extrabold tracking-[0.18em] text-white shadow-lg shadow-[#BF1E27]/20 transition hover:bg-[#a91820] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "ENTRANDO…" : "ENTRAR"}
                {!loading ? <ArrowRight className="transition-transform group-hover:translate-x-1" /> : null}
              </Button>
            </form>
          </Form>

          {resendForEmail ? (
            <div className="mt-5 space-y-3 rounded-lg border border-[#E5E2DC] bg-white/70 p-4">
              <p className="text-sm leading-6 text-[#3A3A3A]">
                Confirme seu e-mail antes de entrar. Se a mensagem não chegou, você pode pedir outro link.
              </p>
              <ResendConfirmationForm defaultEmail={resendForEmail} emailHidden />
            </div>
          ) : null}

          <p className="mt-5 text-center text-xs text-[#3A3A3A]/80">
            Primeira vez por aqui?{" "}
            <Link href="/register" className="font-bold text-[#BF1E27] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BF1E27]">
              Criar academia
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
