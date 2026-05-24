"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { completeStudentOnboarding } from "@/actions/student-portal/onboarding";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";

const baseSchema = z
  .object({
    acceptTerms: z.boolean(),
    guardianEmail: z.string().optional(),
  })
  .strict();

type FormValues = z.infer<typeof baseSchema>;

type Props = {
  requiresGuardianEmail: boolean;
  studentName: string;
};

export function StudentOnboardingForm({ requiresGuardianEmail, studentName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { acceptTerms: false, guardianEmail: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!values.acceptTerms) {
      form.setError("acceptTerms", { message: "Aceite o termo de uso para continuar." });
      return;
    }
    if (requiresGuardianEmail && !values.guardianEmail?.trim()) {
      form.setError("guardianEmail", { message: "Informe o e-mail do responsável." });
      return;
    }

    setLoading(true);
    try {
      const result = await completeStudentOnboarding({
        acceptTerms: true as const,
        guardianEmail: values.guardianEmail?.trim() || "",
      });
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof FormValues, { message: messages[0] });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success("Onboarding concluído.");
      router.push(ROUTES.portal);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Olá, {studentName}. Antes de aceder ao portal, confirme os termos abaixo.
        </p>

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="font-normal leading-snug">
                  Li e aceito o termo de uso do portal do aluno desta academia.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {requiresGuardianEmail ? (
          <FormField
            control={form.control}
            name="guardianEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail do responsável</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    disabled={loading}
                    className="min-h-11"
                    placeholder="responsavel@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <Button type="submit" className="min-h-11 w-full" disabled={loading}>
          {loading ? "Salvando…" : "Continuar para o portal"}
        </Button>
      </form>
    </Form>
  );
}
