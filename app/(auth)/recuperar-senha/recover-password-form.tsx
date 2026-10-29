"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { sendPasswordRecovery } from "@/actions/password-recovery";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { recoveryEmailSchema } from "@/lib/auth/password-recovery";

export function RecoverPasswordForm({ linkError }: { linkError: string | null }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({ resolver: zodResolver(recoveryEmailSchema), defaultValues: { email: "" } });

  async function onSubmit(values: { email: string }) {
    setLoading(true);
    try {
      const result = await sendPasswordRecovery(values);
      if (result.ok) setMessage(result.message);
      else form.setError("email", { message: result.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Informe o e-mail da conta. Se ele existir, enviaremos um link para este navegador.</p>
      </div>
      {linkError ? <p className="rounded-xl bg-muted p-3 text-sm" role="alert">{linkError}</p> : null}
      {message ? <p className="rounded-xl bg-primary/10 p-3 text-sm" role="status">{message}</p> : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="min-h-11 w-full" disabled={loading}>{loading ? "Enviando…" : "Enviar instruções"}</Button>
          </form>
        </Form>
      )}
      <p className="text-sm"><Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">Voltar ao login</Link></p>
    </section>
  );
}
