# Feature: Verificação de segurança (E2E / API / CI)

Contrato canónico para a **suíte automatizada de segurança** da aplicação (Playwright), integração com validação **RLS** quando disponível, e critérios de **pipeline**. Complementa **AUTH-**, **SHELL-**, **SEC-** e **SPEC-11.x** sem substituir políticas de produto já definidas.

## Relação com outras specs

- Sessão e rotas: **AUTH-2.x**, **AUTH-3.x** em [`spec/features/authentication/readme.md`](../authentication/readme.md).
- Rotas operacionais e redirects: **SHELL-2**, **SHELL-5.x** em [`spec/features/app-shell/readme.md`](../app-shell/readme.md).
- Isolamento multi-tenant no Postgres: **SEC-3.x**, **SEC-4.x** em [`spec/features/rls-security/readme.md`](../rls-security/readme.md).
- Infra e chaves: **SPEC-11.2**, **SPEC-11.3** em [`spec/product/spec.md`](../../product/spec.md).
- Cenários de aceitação (Gherkin): `cycles/Q22026/22-0430-cibersegurança/scenarios.feature`.

## Implementação (referência)

| Área | Artefactos típicos |
|------|-------------------|
| E2E / API HTTP | Playwright (`playwright.config.ts`, `e2e/` ou pasta acordada), scripts `package.json` |
| Ambiente de teste | `.env.test.example`, secrets `E2E_*` no CI, projeto Supabase dedicado |
| RLS | `pnpm db:validate-rls` (`scripts/validate-rls.cjs`), variáveis de base de dados no CI |
| Rotas | `lib/routes.ts`, `middleware.ts`, `lib/supabase/middleware.ts` |
| Inventário | [`route-inventory.md`](./route-inventory.md), `lib/routes.ts`, `middleware.ts` |
| Mass assignment | Schemas Zod `.strict()` em `lib/validations/{students,billing,settings}.ts`; testes em `lib/validations/*.test.ts`; verificação action-a-action em [`server-actions-mass-assignment-verification.md`](./server-actions-mass-assignment-verification.md) (**SECE2E-3.5**) |
| Mapa de mutações | Ver **SECE2E-3.5** e [`server-actions-mass-assignment-verification.md`](./server-actions-mass-assignment-verification.md) |
| Headers / CSRF / cookies / rate limit | `next.config.mjs` (**SECE2E-1.5–1.7**); `middleware.ts`; `lib/security/`; `lib/supabase/middleware.ts`, `lib/supabase/server.ts` |

## SECE2E-1. Objectivo e escopo da automação

**SECE2E-1.1.** A suíte cobre **protecção de rotas privadas**, **IDOR** entre contas, **payloads inválidos** e **mass assignment**, **XSS** (refletido e armazenado em campos de formulário relevantes), **CSRF** (camada Next.js + configuração de origens), **cabeçalhos de segurança**, **validação de cookies de sessão**, **detecção de vazamento de dados sensíveis** em respostas e HTML, e **rate limiting** de Server Actions (**SECE2E-1.7**). Limitação global da API Auth do Supabase permanece no projeto Supabase / WAF (**checklist manual**).

**SECE2E-1.2.** **Vitest** permanece para testes unitários e de integração; **Playwright** é a ferramenta **E2E** e para pedidos **HTTP** aos Route Handlers e fluxos reais.

**SECE2E-1.3.** Ordem de cobertura HTTP: (1) **`app/api/**` Route Handlers** quando existirem (baseline actual: **zero** handlers — ver [`route-inventory.md`](./route-inventory.md)); (2) fluxos reais que disparam **Server Actions**; (3) **Supabase REST com JWT** apenas como camada adicional quando o cliente browser usar Supabase directamente ou houver risco real de bypass; não obrigar auditoria completa da API REST do Supabase se o vector não estiver exposto pela app.

**SECE2E-1.4.** Entregáveis humanos por ciclo de auditoria: **relatório curto** (riscos, lacunas, recomendações) e **checklist manual** do que a automação não cobre (`cycles/.../audit-report.md`, `manual-checklist.md` ou equivalente versionado).

**SECE2E-1.5.** **Cabeçalhos HTTP** definidos em [`next.config.mjs`](../../../next.config.mjs) para `/:path*`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` restritiva, `X-DNS-Prefetch-Control: off`; em **produção** acrescenta `Strict-Transport-Security` (1 ano, `includeSubDomains`). **Content-Security-Policy** com `script-src` não está definida aqui — introduzir com **nonces** ou política report-only num ciclo dedicado para não partir bundles Next.

**SECE2E-1.6.** **CSRF em Server Actions:** o Next.js **15** valida pedidos `POST` com cabeçalho `Next-Action` contra **Origin** / **Host** / **`x-forwarded-host`** (mesma origem por defeito). Origens extra confiáveis (proxy, ALB, preview): variável de ambiente **`SERVER_ACTIONS_ALLOWED_ORIGINS`** (lista separada por vírgulas), mapeada para `experimental.serverActions.allowedOrigins` em [`next.config.mjs`](../../../next.config.mjs). **`bodySizeLimit`** por defeito **1mb**.

**SECE2E-1.7.** **Rate limiting:** pedidos **Server Action** (`POST` + cabeçalho `Next-Action`) passam por contador em memória no [`middleware.ts`](../../../middleware.ts): **`SECURITY_SERVER_ACTION_MAX_PER_MINUTE`** (por defeito **180** / janela **60s** / IP via `x-forwarded-for` ou `x-real-ip`). Resposta **429** com `Retry-After: 60`. Em **várias instâncias** sem sticky sessions, usar **Upstash Redis**, Cloudflare ou equivalente (**lacuna documentada**).

**SECE2E-1.8.** **Cookies de sessão Supabase:** ao aplicar `cookies.set` no middleware e no cliente servidor [`lib/supabase/server.ts`](../../../lib/supabase/server.ts), mesclam-se opções com [`mergeSessionCookieOptions`](../../../lib/security/cookie-hardening.ts): `SameSite=lax` por defeito; **`Secure`** em **`NODE_ENV === 'production'`**.

## SECE2E-2. Ambiente e dados de teste

**SECE2E-2.1.** Execução **padrão** e **CI** usam projeto Supabase **dedicado** (teste/staging), **não** o `.env.local` de desenvolvimento do dia-a-dia.

**SECE2E-2.2.** Variáveis canónicas (nomes mínimos): `E2E_USER_A_EMAIL`, `E2E_USER_A_PASSWORD`, `E2E_USER_B_EMAIL`, `E2E_USER_B_PASSWORD`, `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY`; URL/base da app conforme necessário ao Playwright.

**SECE2E-2.3.** Setup recomendado: **seed SQL** para estrutura e dados base; utilizadores **A** e **B** fixos no ambiente de teste; **fixtures/helpers** para dados isolados por teste; **teardown** quando seguro; **proibição** de dados reais de produção.

## SECE2E-3. Contratos HTTP e páginas

**SECE2E-3.1.** **Página privada** sem sessão válida: **redirect** para **`/login`** (coerente com **AUTH-2.3**); sem renderização de conteúdo de negócio antes de confirmar sessão; sem “flash” visível de dados sensíveis antes do redirect.

**SECE2E-3.2.** **Route Handler privado** sem autenticação: **401**. Autenticado sem permissão: **403** ou **404** conforme política de não enumeração. Recurso inexistente: **404**. Payload inválido: **400** ou **422**. Método HTTP não suportado: **405** quando aplicável. **500** em entrada inválida ou falha previsível de validação: **bug**.

**SECE2E-3.3.** Resposta de API privada que devolve **HTML de aplicação** ou **redirect** no lugar de semântica REST adequada é **comportamento a corrigir**, salvo **excepção documentada** neste readme com justificativa de produto.

**SECE2E-3.4.** **Server Actions** podem não ser REST; mesmo assim **não** podem vazar dados alheios, **stack traces**, nem permitir acção indevida.

**SECE2E-3.5.** **Mass assignment:** todo payload `unknown` aceite por Server Actions de mutação deve passar por **Zod** com **`.strict()`** no objecto raiz, de modo que **chaves não declaradas** (ex.: `account_id`, `user_id`, `amount_cents`, `status` em formulários que não o preveem) **falham validação** — não são apenas ignoradas. Campos de propriedade (`account_id` em `students`, montantes efectivos em `payments`) derivam **só** da sessão + RLS + lógica de domínio, nunca de campos extra no JSON.

| Módulo | Acções mutativas | Schema canónico |
|--------|------------------|-----------------|
| [`actions/students.ts`](../../../actions/students.ts) | `createStudent`, `updateStudent`, `quickUpdateStudent` | [`lib/validations/students.ts`](../../../lib/validations/students.ts) (`buildStudentFullFormSchema`, `buildQuickEditFormSchema`) |
| [`actions/students.ts`](../../../actions/students.ts) | `setStudentStatus`, `deleteStudent` | enum `studentUiStatusSchema` (sem objecto arbitrário) |
| [`actions/billing.ts`](../../../actions/billing.ts) | `updatePlanPrice`, `updatePlan`, `setStudentPlan`, `recordPayment`, `recordPaymentsBulk`, `voidPayment` | [`lib/validations/billing.ts`](../../../lib/validations/billing.ts) |
| [`actions/settings.ts`](../../../actions/settings.ts) | `updateAccount`, `updateProfile` | [`lib/validations/settings.ts`](../../../lib/validations/settings.ts) |
| [`app/(dashboard)/actions.ts`](../../../app/(dashboard)/actions.ts) | `signOut` | sem payload do cliente |

Novas Server Actions com input estruturado devem seguir o mesmo padrão e acrescentar linha nesta tabela.

Revisão consolidada (call sites, campos sensíveis, schemas só cliente): [`server-actions-mass-assignment-verification.md`](./server-actions-mass-assignment-verification.md).

## SECE2E-4. Superfície de rotas para E2E

**SECE2E-4.1.** Lista **mínima** a cobrir: **`/painel`**, **`/alunos`**, **`/mensalidades`**, **`/configuracoes`**, **`/perfil`**, redirect **`/dashboard`** → **`/painel`**, **`/`** (pública ou redirect esperado), **`/login`**, **`/register`** (redirect para **`/login`** ou política MVP equivalente).

**SECE2E-4.2.** Rotas **dinâmicas** devem ser inventariadas a partir do código (ex.: **`/alunos/[id]`**, **`/alunos/[id]/editar`**, **`/mensalidades/[studentId]`**) e classificadas como pública, privada, privada dinâmica, API pública, API privada, ou legado/redirecionamento.

**SECE2E-4.3.** O **middleware** actual **exclui** o prefixo **`api`** do matcher; novos Route Handlers em **`/api/*`** devem ser explicitamente protegidos na implementação e incluídos no inventário (**SECE2E-4.2**).

## SECE2E-5. Critério “flash” e HTML inicial

**SECE2E-5.1.** Critério **estrito** para **HTML inicial** e para **dados sensíveis** em visitantes não autenticados: não devem aparecer no documento nem após navegação estabilizada em cenários de bloqueio.

**SECE2E-5.2.** Critério **pragmático** para hidratação client-side: não é obrigatório medir milissegundos; se o teste observar dado privado **antes** do redirect de protecção, falha.

## SECE2E-6. Padrões de vazamento proibidos (automático)

**SECE2E-6.1.** As assertivas de resposta/corpo devem falhar se aparecerem (lista não exaustiva, evoluir com o produto): fragmentos de **stack trace**; **JWT** / **access_token** / **refresh_token**; **service_role**; `SUPABASE_SERVICE_ROLE_KEY`; `SUPABASE_JWT_SECRET`; `DATABASE_URL`; `postgres://`; `postgresql://`; **password** / **passwordHash** / **hashed_password** em contexto de fuga; cabeçalho **`Authorization`** ou corpo com **`Bearer `** indevidos; **`Set-Cookie`** indevido no corpo; **`NEXT_PUBLIC_`** com valor sensível; linhas **`Error: `** com detalhe interno; `PrismaClientKnownRequestError`; **PostgrestError** bruto; mensagens **Supabase internal** brutas.

**SECE2E-6.2.** Padrões adicionais a monitorizar: `eyJ`, `Bearer `, prefixos típicos `sb-`, `atob(`, `-----BEGIN`.

**SECE2E-6.3.** Ajustar falsos positivos (ex.: palavra “password” em texto de UI legítimo) por contexto de selector ou URL, não por remover a regra global sem revisão.

## SECE2E-7. CI, RLS e política de bloqueio

**SECE2E-7.1.** **GitHub Actions**: execução em **pull request** para branches principais e **`workflow_dispatch`** manual; **nightly** opcional após estabilização.

**SECE2E-7.2.** Falhas em **IDOR**, **bypass de autenticação** ou **vazamento sensível** (**SECE2E-6**) são **bloqueantes**. Testes **exploratórios** ou **flaky** devem estar marcados como não bloqueantes até estabilização.

**SECE2E-7.3.** Executar **`pnpm db:validate-rls`** no CI quando o comando existir e os secrets de base estiverem configurados; **não** criar substituto superficial só para “caixa marcada”. Se variáveis do script de validação divergirem de `E2E_*`, documentar e planear alinhamento.

## Manutenção

Novas rotas operacionais (**SHELL-2**), Route Handlers ou Server Actions críticas devem atualizar **inventário**, **SECE2E-**, e os cenários em `scenarios.feature` no ciclo correspondente.
