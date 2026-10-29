"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { newPasswordSchema } from "@/lib/auth/password-recovery";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({ resolver: zodResolver(newPasswordSchema), defaultValues: { password: "" } });

  async function onSubmit(values: { password: string }) {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: values.password });
      if (updateError) {
        setError("Não foi possível atualizar a senha. Peça outro link de recuperação.");
        return;
      }
      await supabase.auth.signOut();
      router.replace(`/login?senha=atualizada`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Defina uma senha com pelo menos 15 caracteres para voltar à sua academia.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Nova senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
          <Button type="submit" className="min-h-11 w-full" disabled={loading}>{loading ? "Salvando…" : "Salvar senha"}</Button>
        </form>
      </Form>
    </section>
  );
}
