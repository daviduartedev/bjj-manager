"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { provisionStudentPortalAccess } from "@/actions/student-portal/provision-access";
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
import {
  provisionPortalAccessSchema,
  type ProvisionPortalAccessInput,
} from "@/lib/validations/student-portal";

type Props = {
  studentId: string;
  linkedUserId: string | null;
  blocked: boolean;
};

export function ProvisionPortalAccess({ studentId, linkedUserId, blocked }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProvisionPortalAccessInput>({
    resolver: zodResolver(provisionPortalAccessSchema),
    defaultValues: { studentId, authEmail: "" },
  });

  async function onSubmit(values: ProvisionPortalAccessInput) {
    setLoading(true);
    try {
      const result = await provisionStudentPortalAccess(values);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof ProvisionPortalAccessInput, { message: messages[0] });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success("Acesso ao portal associado.");
      form.reset({ studentId, authEmail: "" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (linkedUserId) {
    return (
      <p className="text-sm text-muted-foreground">
        Portal associado. O aluno pode entrar com a conta Auth ligada a este cadastro.
      </p>
    );
  }

  if (blocked) {
    return (
      <p className="text-sm text-muted-foreground">
        Aluno arquivado ou removido — provisionamento indisponível.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...form.register("studentId")} />
        <FormField
          control={form.control}
          name="authEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail da conta Auth do aluno</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  disabled={loading}
                  className="min-h-11"
                  placeholder="aluno@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs text-muted-foreground">
          O utilizador tem de existir previamente no Supabase Auth. Será criado um perfil com papel
          aluno nesta academia, se ainda não existir.
        </p>
        <Button type="submit" className="min-h-11" disabled={loading}>
          {loading ? "Associando…" : "Associar acesso ao portal"}
        </Button>
      </form>
    </Form>
  );
}
