# BJJ Manager

SaaS web responsivo para professores de jiu-jitsu gerenciarem alunos,
graduações e mensalidades.

> **Status:** projeto recém-bootstrapado (Cycle `0430-project-bootstrap`).
> Nenhuma feature de negócio implementada ainda. A construção segue um
> workflow **spec-driven** em `/cycles`.

---

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (componentes locais em `components/ui`)
- **Supabase** (`@supabase/ssr`) — Auth, Postgres, RLS
- **Zod** + **React Hook Form** — validação e formulários
- **date-fns** — datas em pt-BR
- **lucide-react** — ícones

## Comandos

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build
pnpm lint
pnpm type-check
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="BJJ Manager"
```

## Identidade visual

Paleta inspirada em academia de jiu-jitsu (limpa, forte, profissional):

| Token            | Hex       | Uso                          |
|------------------|-----------|------------------------------|
| Preto principal  | `#050505` | header / sidebar / identidade |
| Branco           | `#FFFFFF` | base / cards                 |
| Off-white        | `#F5F3F0` | fundo do app                 |
| Vermelho         | `#BF1E27` | ação primária / destaque     |
| Verde            | `#1D8B32` | status "Pago"                |
| Azul             | `#1E5AA8` | informativo / Adulto         |
| Amarelo          | `#F4C542` | status "Pendente"            |
| Cinza texto      | `#3A3A3A` | corpo de texto               |
| Cinza borda      | `#E5E2DC` | bordas / divisores           |

Tokens em `app/globals.css` e `tailwind.config.ts`.

## Estrutura

```
/app                 rotas (App Router)
  /(auth)            login, register
  /(dashboard)       área autenticada
/components
  /ui                shadcn primitives (button, card, input, ...)
  /layout            page-header, section, empty-state
  /alunos            /graduations  /billing  /painel  /configuracoes
/lib
  /supabase          client/server/middleware
  /validations       schemas Zod
  /dates             helpers de data
  /graduation        regras de faixa/grau
  /billing           regras de plano/status
  utils.ts           cn(), formatBRL()
/actions             Server Actions (students, graduations, billing, settings)
/db                  schema.sql, seed.sql, policies.sql
/cycles              workflow spec-driven (ver abaixo)
middleware.ts        revalida sessão Supabase
```

## Workflow spec-driven (`/cycles`)

A construção do produto é dividida em ciclos pequenos, executáveis e
ordenados. Cada ciclo é uma pasta com um `request.md` cru —
descrição da feature, sem plano, sem tarefas.

Convenção:

```
cycles/Q{trimestre}{ano}/{MMDD}-<slug>/request.md
```

Exemplo:

```
cycles/Q22026/08-0430-students-crud/request.md
```

Toda implementação acontece na **mesma branch** (`develop` ou `main`,
sem feature branches). Os ciclos não dependem uns dos outros para
**existir** (todos podem ser escritos antes), mas têm ordem natural de
execução.

Veja `cycles/README.md` para detalhes do workflow e a lista completa
dos ciclos do Q2 2026.

## MVP

Resumo executivo; detalhes, regras numeradas e personas estão na **fonte da verdade**:

- **Produto:** [`spec/product/spec.md`](spec/product/spec.md) (espelho: [`docs/product/spec.md`](docs/product/spec.md))
- **Entidades:** [`spec/product/entities.md`](spec/product/entities.md)
- **Graduação:** [`spec/product/graduation-rules.md`](spec/product/graduation-rules.md)
- **Cobrança:** [`spec/product/billing-rules.md`](spec/product/billing-rules.md)

Em linha:

1. Autenticação do professor e conta/academia.
2. Dashboard com alertas simples.
3. CRUD e perfil de alunos (adulto e kids).
4. Faixa, grau e histórico de graduação (bloqueio com justificativa em pulo de faixa).
5. Cálculos de idade e tempos (faixa/grau/treino).
6. Planos Kids/Adulto, preço personalizado por aluno, dia de vencimento.
7. Mensalidade por mês de referência com status **manual** pelo professor: **Pago**, **Não pago**, **Pendente**, **Outro**; ação em lote **marcar todos como pagos** (sem gateway no MVP).

## Fora do MVP (Roadmap)

Presença, turmas, QR code, WhatsApp, documentos, certificados,
exportação CSV/Excel, login de aluno, app do aluno, gateways de pagamento.
Roadmap amplo em `cycles/Q22026/21-0430-future-roadmap/request.md`.
