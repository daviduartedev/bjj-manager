"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Info,
  Inbox,
  MoreHorizontal,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const demoFormSchema = z.object({
  nome: z.string().min(2, "Informe pelo menos 2 caracteres."),
  aceito: z.boolean().refine((v) => v === true, {
    message: "Marque para continuar.",
  }),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

export function DesignSystemGallery() {
  const [surfaceDark, setSurfaceDark] = useState(false);

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      nome: "",
      aceito: false,
    },
  });

  return (
    <div
      className={cn(
        surfaceDark && "dark",
        "min-h-screen bg-background text-foreground transition-colors",
      )}
    >
      <div className="container max-w-5xl space-y-12 py-10">
        <PageHeader
          title="Design system"
          description="Referência visual e componentes primitivos. Ambiente de desenvolvimento apenas."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={surfaceDark ? "secondary" : "outline"}
                onClick={() => setSurfaceDark(false)}
              >
                Tema claro
              </Button>
              <Button
                type="button"
                variant={surfaceDark ? "default" : "outline"}
                onClick={() => setSurfaceDark(true)}
              >
                Tema escuro
              </Button>
            </div>
          }
        />

        <Section
          title="Tipografia e tokens"
          description="IBM Plex Sans (corpo e títulos), escala CRM (15px base), utilitários type-* e cores semânticas."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hierarquia</CardTitle>
                <CardDescription>Exemplos de texto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="type-page-title max-w-xl">Título de página (type-page-title)</div>
                <h3 className="type-section-title">Título de secção</h3>
                <p className="type-meta-label max-w-xs">Rótulo meta</p>
                <p className="type-lead">Descrição auxiliar (type-lead).</p>
                <p className="text-crm-sm text-muted-foreground">
                  Texto secundário; corpo a 15px (<code className="text-foreground">text-crm-base</code> no{" "}
                  <code className="text-foreground">body</code>).
                </p>
                <p className="text-crm-base text-foreground">
                  Cadastro de alunos, graduação e mensalidades em pt-BR.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Paleta BJJ</CardTitle>
                <CardDescription>Chaves tailwind bjj.*</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                  <span className="size-6 rounded-sm border border-border bg-bjj-black" />
                  bjj.black
                </div>
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                  <span className="size-6 rounded-sm border border-border bg-bjj-red" />
                  bjj.red
                </div>
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                  <span className="size-6 rounded-sm border border-border bg-bjj-off" />
                  bjj.off
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Em telas preferir tokens semânticos (bg-background, text-primary,
                etc.).
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section title="Badges de status" description="Cobrança e alertas.">
          <div className="flex flex-wrap gap-3">
            <Badge variant="paid">Pago</Badge>
            <Badge variant="pending">Pendente</Badge>
            <Badge variant="overdue">Em atraso</Badge>
            <Badge variant="info">Informativo</Badge>
            <Separator orientation="vertical" className="hidden h-8 sm:block" />
            <span className="badge-paid">Pago (classe)</span>
            <span className="badge-pending">Pendente (classe)</span>
            <span className="badge-overdue">Atraso (classe)</span>
            <span className="badge-info">Info (classe)</span>
          </div>
        </Section>

        <Section title="Botões e campos">
          <div className="flex flex-wrap gap-3">
            <Button>Primária</Button>
            <Button variant="secondary">Secundária</Button>
            <Button variant="outline">Contorno</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destrutiva</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ds-email">E-mail</Label>
              <Input id="ds-email" type="email" placeholder="professor@academia.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds-note">Observação</Label>
              <Textarea id="ds-note" placeholder="Notas internas…" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Checkbox id="ds-check" />
              <Label htmlFor="ds-check">Checkbox (alvo ≥ 44px)</Label>
            </div>
          </div>
        </Section>

        <Section title="Feedback">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                toast.success("Mensalidades atualizadas.", {
                  description: "Sonner com cantos retos.",
                })
              }
            >
              Toast de sucesso
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.error("Não foi possível salvar.")}
            >
              Toast de erro
            </Button>
          </div>
        </Section>

        <Section title="Sobreposições">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar ação</DialogTitle>
                  <DialogDescription>
                    Exemplo de diálogo modal com foco gerenciado pelo Radix.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                  <Button type="button">Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir menu">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem>Duplicar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select defaultValue="adulto">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Faixa etária" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kids">Kids</SelectItem>
                <SelectItem value="adulto">Adulto</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <p className="text-sm text-muted-foreground">
                  Conteúdo auxiliar e filtros rápidos.
                </p>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Ajuda">
                  <Info className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dica contextual para o professor.</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="perfil">
            <TabsList>
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="graduacao">Graduação</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            </TabsList>
            <TabsContent value="perfil">
              <Card>
                <CardHeader>
                  <CardTitle>Dados do aluno</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Conteúdo exemplo da aba Perfil.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="graduacao">
              <p className="text-sm text-muted-foreground">
                Histórico de faixas e graus.
              </p>
            </TabsContent>
            <TabsContent value="financeiro">
              <p className="text-sm text-muted-foreground">
                Planos e status de mensalidade.
              </p>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Avatar">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar>
              <AvatarFallback>BJ</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        </Section>

        <Section title="Tabela">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Ana Costa</TableCell>
                <TableCell>Adulto</TableCell>
                <TableCell>
                  <Badge variant="paid">Pago</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Luiz Souza</TableCell>
                <TableCell>Kids</TableCell>
                <TableCell>
                  <Badge variant="pending">Pendente</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Formulário (RHF + Zod)">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Exemplo validado</CardTitle>
              <CardDescription>
                Campos mínimos para padrão dos próximos fluxos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit(() =>
                    toast.success("Formulário válido (demo)."),
                  )}
                >
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do aluno" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aceito"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Li e aceito os termos de uso (demo).
                          </FormLabel>
                          <FormDescription>
                            Checkbox obrigatório neste exemplo.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Enviar</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </Section>

        <Section title="Estados de página">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium">Carregamento</p>
              <div className="space-y-2">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Vazio</p>
              <EmptyState
                icon={Inbox}
                title="Nenhum aluno neste filtro"
                description="Ajuste a busca ou cadastre um novo aluno para começar."
              >
                <Button>Novo aluno</Button>
              </EmptyState>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <p className="text-sm font-medium">Erro (bloco)</p>
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Falha ao carregar dados
                </CardTitle>
                <CardDescription>
                  Tente novamente ou verifique sua conexão.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline">Tentar de novo</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}
