# Feature: autenticação (aplicação)

Contrato canónico para **sessão do professor** na app Next.js com **Supabase Auth** e **`@supabase/ssr`**. Complementa **SEC-** ([`spec/features/rls-security/readme.md`](../rls-security/readme.md)) e o bootstrap em [`docs/security/rls.md`](../../../docs/security/rls.md).

## Relação com outras specs

- Produto (escopo MVP): **SPEC-2.1**, **SPEC-3.7**, **SPEC-5.1** em [`spec/product/spec.md`](../../product/spec.md).
- Entidades / provisionamento: **ENT-2.3** em [`spec/product/entities.md`](../../product/entities.md).
- Infraestrutura: **SPEC-11.2** em [`spec/product/spec.md`](../../product/spec.md) (sem `service_role` no cliente).

## Implementação (referência)

| Área | Artefatos típicos |
|------|-------------------|
| Sessão SSR | [`lib/supabase/server.ts`](../../../lib/supabase/server.ts), [`lib/supabase/middleware.ts`](../../../lib/supabase/middleware.ts), [`middleware.ts`](../../../middleware.ts) |
| Cliente browser | [`lib/supabase/client.ts`](../../../lib/supabase/client.ts) |
| UI entrada | `app/(auth)/login/`, layout `(auth)` |
| Área autenticada | prefixos **`/painel`**, **`/alunos`**, **`/mensalidades`**, **`/configuracoes`**, **`/perfil`** (ver **SHELL-2**); legado **`/dashboard`** → **`/painel`** |
| Validação | `lib/validations/auth.ts` (Zod) |
| Helpers servidor | `lib/auth.ts` (`getCurrentUser`, `getCurrentAccount`) |

## AUTH-1. Escopo MVP

**AUTH-1.1.** Fluxo suportado na aplicação: **login** com **e-mail e senha** apenas. **OAuth** permanece fora do MVP (roadmap).

**AUTH-1.2.** **Autocadastro** (registro público), página **`/register`** e fluxos equivalentes **não** fazem parte do MVP. Pedidos a **`/register`** são **redirecionados para `/login`** (307 via middleware), para não expor fluxo de registo nem links mortos.

**AUTH-1.3.** **Recuperação de senha** self-service na aplicação fica **fora do MVP** neste arranque operacional (credenciais tratadas fora da app, ex.: dashboard Supabase ou comunicação direta).

## AUTH-2. Destinos e navegação

**AUTH-2.1.** Após autenticação bem-sucedida, o utilizador deve ser levado ao **`/painel`** (área operacional).

**AUTH-2.2.** Utilizador **com sessão válida** que abre **`/login`** deve ser **redirecionado para `/painel`**.

**AUTH-2.3.** Utilizador **sem sessão** que acede a qualquer rota sob os **prefixos da área operacional** definidos em **SHELL-2** em [`spec/features/app-shell/readme.md`](../app-shell/readme.md) deve ser **redirecionado para `/login`**. O caminho legado **`/dashboard`** deve **redirecionar para `/painel`** (**SHELL-5.3**).

## AUTH-3. Sessão e cookies

**AUTH-3.1.** A renovação da sessão em cada pedido relevante usa o padrão **`@supabase/ssr`** com cookies geridos pelo cliente servidor/middleware (comportamento **HttpOnly** conforme capacidades do Supabase SSR).

**AUTH-3.2.** Duração e política de sessão seguem o **default** do projeto Supabase; não há requisito de “lembrar-me” custom no MVP.

## AUTH-4. Confirmação de e-mail

**AUTH-4.1.** Não há requisito de produto adicional para confirmação de e-mail além da configuração do projeto Supabase; a UI deve tratar graciosamente estados como “e-mail não confirmado” se o projeto os mantiver ativos.

## AUTH-5. Erros e linguagem

**AUTH-5.1.** Mensagens apresentadas ao utilizador devem ser em **português claro**, derivadas de códigos ou mensagens da API Supabase com **mapeamento explícito** quando necessário.

**AUTH-5.2.** Erros de autenticação no fluxo de login devem ser comunicados com **notificação toast** (na stack atual: **Sonner**).

## AUTH-6. Validade dos dados de domínio

**AUTH-6.1.** Um utilizador autenticado **sem** linha em `public.profiles` (ou sem `current_account_id()` resolvível) não está em estado válido para domínio multi-tenant; a aplicação deve evitar mostrar dados de negócio e orientar (mensagem genérica + contacto operacional), sem expor detalhes internos.

## AUTH-7. Provisionamento e evolução

**AUTH-7.1.** Criação de utilizador em **Auth** e das linhas **`accounts` + `profiles`** é **manual** no MVP, conforme [`docs/security/rls.md`](../../../docs/security/rls.md), coerente com **SEC-2.2** (sem política de `INSERT` para essas tabelas no papel `authenticated`).

**AUTH-7.2.** **Recomendação** para futuro **autocadastro**: implementar criação atómica via **trigger** (ou função **`SECURITY DEFINER`** no Postgres) associada a `auth.users`, em vez de depender de `service_role` no browser — reduz superfície e mantém transação única no banco.

## Manutenção

Alterações em fluxos de sessão, novas rotas protegidas ou mudanças no bootstrap devem atualizar este readme, **AUTH-** citado em commits, e [`docs/security/rls.md`](../../../docs/security/rls.md) quando o procedimento operacional mudar.
