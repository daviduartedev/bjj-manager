"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  provisionStudentPortalAccess,
  type ProvisionPortalSuccessOutcome,
} from "@/actions/student-portal/provision-access";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  provisionPortalAccessSchema,
  type ProvisionPortalAccessInput,
} from "@/lib/validations/student-portal";

type ProvisionMode = ProvisionPortalAccessInput["mode"];

type Props = {
  studentId: string;
  studentEmail?: string | null;
  linkedUserId: string | null;
  blocked: boolean;
};

const MODE_LABEL: Record<ProvisionMode, string> = {
  link_existing: "Associar Auth existente",
  create_invite: "Convite por e-mail",
  create_password: "Criar com senha temporária",
};

function defaultValues(
  studentId: string,
  mode: ProvisionMode,
  studentEmail?: string | null,
): ProvisionPortalAccessInput {
  const email = studentEmail?.trim() ?? "";
  if (mode === "link_existing") {
    return { mode, studentId, authEmail: email };
  }
  return { mode, studentId, email };
}

function PasswordReveal({
  email,
  temporaryPassword,
  onDismiss,
}: {
  email: string;
  temporaryPassword: string;
  onDismiss: () => void;
}) {
  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      toast.success("Senha copiada.");
    } catch {
      toast.error("Não foi possível copiar. Seleccione e copie manualmente.");
    }
  }

  return (
    <div
      className="space-y-3 rounded-lg border border-[hsl(var(--status-pending)/0.35)] bg-[hsl(var(--status-pending)/0.08)] p-4"
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Senha temporária (mostrada uma vez)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Entrega esta senha ao aluno ({email}). Não será possível vê-la novamente após fechar.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          onClick={onDismiss}
          aria-label="Fechar aviso de senha"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm tracking-wide">
          {temporaryPassword}
        </code>
        <Button type="button" variant="outline" className="min-h-11 shrink-0" onClick={copyPassword}>
          <Copy className="size-4" aria-hidden />
          Copiar senha
        </Button>
      </div>
    </div>
  );
}

export function ProvisionPortalAccess({
  studentId,
  studentEmail,
  linkedUserId,
  blocked,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ProvisionMode>("create_invite");
  const [passwordReveal, setPasswordReveal] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);

  const form = useForm<ProvisionPortalAccessInput>({
    resolver: zodResolver(provisionPortalAccessSchema),
    defaultValues: defaultValues(studentId, mode, studentEmail),
  });

  function handleModeChange(nextMode: ProvisionMode) {
    setMode(nextMode);
    form.reset(defaultValues(studentId, nextMode, studentEmail));
    setPasswordReveal(null);
  }

  function toastForOutcome(outcome: ProvisionPortalSuccessOutcome) {
    if (outcome.kind === "linked") {
      toast.success("Acesso ao portal associado.");
      return;
    }
    if (outcome.kind === "invited") {
      toast.success(`Convite enviado para ${outcome.email}.`);
      return;
    }
    toast.success("Utilizador criado. Copie a senha temporária abaixo.");
  }

  async function onSubmit(values: ProvisionPortalAccessInput) {
    setLoading(true);
    try {
      const result = await provisionStudentPortalAccess(values);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof ProvisionPortalAccessInput, {
              message: messages[0],
            });
          }
        }
        toast.error(result.error);
        return;
      }

      toastForOutcome(result.outcome);

      if (result.outcome.kind === "password_created") {
        setPasswordReveal({
          email: result.outcome.email,
          temporaryPassword: result.outcome.temporaryPassword,
        });
      } else {
        setPasswordReveal(null);
      }

      form.reset(defaultValues(studentId, mode, studentEmail));
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="provision-mode">Modo de provisionamento</Label>
        <Select value={mode} onValueChange={(v) => handleModeChange(v as ProvisionMode)}>
          <SelectTrigger id="provision-mode" className="min-h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(MODE_LABEL) as ProvisionMode[]).map((key) => (
              <SelectItem key={key} value={key}>
                {MODE_LABEL[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {passwordReveal ? (
        <PasswordReveal
          email={passwordReveal.email}
          temporaryPassword={passwordReveal.temporaryPassword}
          onDismiss={() => setPasswordReveal(null)}
        />
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("studentId")} />
          <input type="hidden" {...form.register("mode")} />

          {mode === "link_existing" ? (
            <FormField
              control={form.control}
              name="authEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail da conta Auth existente</FormLabel>
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
          ) : (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail do aluno</FormLabel>
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
          )}

          <p className="text-xs text-muted-foreground">
            {mode === "link_existing"
              ? "O utilizador tem de existir no Supabase Auth. Será criado um perfil aluno nesta academia, se necessário."
              : mode === "create_invite"
                ? "Será enviado convite Supabase para o aluno definir a senha no primeiro acesso."
                : "Será criada uma conta com senha temporária de 12 caracteres, mostrada uma única vez."}
          </p>

          <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={loading}>
            {loading
              ? "A processar…"
              : mode === "link_existing"
                ? "Associar acesso"
                : mode === "create_invite"
                  ? "Enviar convite"
                  : "Criar utilizador"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
