"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function LoginForm({ recoveryMessage }: { recoveryMessage: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        email: values.email.trim(),
        password: values.password,
      });
      if (error) {
        toast.error(mapAuthErrorToMessage(error));
        return;
      }
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
    <Card className="w-full max-w-md border-border/70 bg-card/95 text-card-foreground shadow-xl shadow-black/25 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>Entre com o e-mail e a senha da sua conta.</CardDescription>
      </CardHeader>
      {recoveryMessage ? (
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{recoveryMessage}</p>
          <ResendConfirmationForm />
        </CardContent>
      ) : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      disabled={loading}
                      className="min-h-11 w-full touch-manipulation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="min-h-11 w-full touch-manipulation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full min-h-11 sm:min-h-10" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
            <Link
              href="/register"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Criar academia
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
