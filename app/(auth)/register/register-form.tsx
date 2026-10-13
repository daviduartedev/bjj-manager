"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { registerAcademy } from "@/actions/register-academy";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  academyRegistrationSchema,
  type AcademyRegistrationInput,
} from "@/lib/validations/academy-registration";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState<string | null>(null);

  const form = useForm<AcademyRegistrationInput>({
    resolver: zodResolver(academyRegistrationSchema),
    defaultValues: {
      email: "",
      password: "",
      academyName: "",
      displayName: "",
    },
    mode: "onSubmit",
  });

  async function onSubmit(values: AcademyRegistrationInput) {
    setLoading(true);
    try {
      const result = await registerAcademy({
        email: values.email,
        password: values.password,
        academyName: values.academyName,
        displayName: values.displayName,
      });

      if (result.ok) {
        setWaiting(result.message);
        return;
      }

      if ("message" in result) {
        toast.error(result.message);
        return;
      }

      for (const [key, messages] of Object.entries(result.fieldErrors)) {
        const message = messages[0];
        if (!message) continue;
        form.setError(key as keyof AcademyRegistrationInput, { message });
      }
    } finally {
      setLoading(false);
    }
  }

  if (waiting) {
    return (
      <Card className="w-full max-w-md border-border/70 bg-card/95 text-card-foreground shadow-xl shadow-black/25 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Verifique o e-mail</CardTitle>
          <CardDescription>{waiting}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/95 text-card-foreground shadow-xl shadow-black/25 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Criar academia</CardTitle>
        <CardDescription>
          Informe seus dados. A confirmação precisa ser aberta neste navegador.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="academyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da academia</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="organization"
                      disabled={loading}
                      maxLength={80}
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
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu nome</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      disabled={loading}
                      maxLength={80}
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
                      autoComplete="new-password"
                      disabled={loading}
                      className="min-h-11 w-full touch-manipulation"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Mínimo de 8 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col pt-2">
            <Button type="submit" className="w-full min-h-11 sm:min-h-10" disabled={loading}>
              {loading ? "Criando…" : "Criar academia"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
