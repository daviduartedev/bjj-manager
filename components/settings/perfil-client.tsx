"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateProfile } from "@/actions/settings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
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
import { ROUTES } from "@/lib/routes";
import { maskPhoneBrInput } from "@/lib/students/input-masks";
import {
  updateProfileFormSchema,
  type UpdateProfileFormValues,
} from "@/lib/validations/settings";
import { UserRound } from "lucide-react";

function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  email: string | null;
  academyName: string;
  initialDisplayName: string;
  initialPhone: string | null;
};

export function PerfilClient(props: Props) {
  const router = useRouter();

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      displayName: props.initialDisplayName,
      phone: props.initialPhone ?? "",
    },
    mode: "onSubmit",
  });

  const displayNameWatch = form.watch("displayName");

  useEffect(() => {
    form.reset({
      displayName: props.initialDisplayName,
      phone: props.initialPhone ?? "",
    });
  }, [props.initialDisplayName, props.initialPhone, form]);

  async function onSubmit(values: UpdateProfileFormValues) {
    const r = await updateProfile({
      displayName: values.displayName.trim(),
      phone: values.phone.trim() === "" ? "" : values.phone.trim(),
    });
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Perfil atualizado.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <DashboardPanel icon={UserRound} title="Seus dados" subtitle="Nome, contato e e-mail da conta">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <Avatar className="size-16 shrink-0 border border-border shadow-sm">
            <AvatarFallback className="text-lg font-semibold">
              {initialsFromDisplayName(displayNameWatch)}
            </AvatarFallback>
          </Avatar>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex min-w-0 flex-1 flex-col gap-4 md:max-w-lg"
            >
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex flex-wrap items-baseline gap-2">
                      Nome de exibição
                      <span className="text-crm-xs font-normal text-muted-foreground">(obrigatório)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        className="min-h-11 touch-manipulation"
                        maxLength={120}
                        aria-required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(00) 00000-0000"
                        className="min-h-11 touch-manipulation"
                        maxLength={40}
                        value={field.value}
                        onChange={(e) => field.onChange(maskPhoneBrInput(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label htmlFor="email-ro">E-mail</Label>
                <Input
                  id="email-ro"
                  value={props.email ?? ""}
                  readOnly
                  tabIndex={-1}
                  className="min-h-11 bg-muted/50"
                />
                <p className="text-crm-xs text-muted-foreground">
                  E-mail de login definido no Supabase Auth.
                </p>
              </div>
              <Button
                type="submit"
                className="min-h-11 w-full touch-manipulation sm:w-auto"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Salvando…" : "Salvar perfil"}
              </Button>
            </form>
          </Form>
        </div>
      </DashboardPanel>

      <DashboardPanel title="Academia" subtitle="Identidade da conta">
        <p className="text-crm-sm text-muted-foreground">
          Nome atual: <span className="font-medium text-foreground">{props.academyName}</span>
        </p>
        <p className="mt-3 text-crm-sm">
          <Link
            href={ROUTES.configuracoes}
            className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 touch-manipulation hover:underline"
          >
            Gerir academia e planos
          </Link>
        </p>
      </DashboardPanel>
    </div>
  );
}
