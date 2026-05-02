# Checklist manual — complemento à automação (ciclo 22-0430-cibersegurança)

Itens que **não** são totalmente cobertos pela suíte Playwright ou que exigem julgamento humano.

## Revisão humana

- [ ] **CSRF:** confirmar em staging/produção que **Origin** alinha com **Host** / **`x-forwarded-host`**; preencher **`SERVER_ACTIONS_ALLOWED_ORIGINS`** se usar proxy. SameSite/Secure documentados em **SECE2E-1.8**.
- [x] **Mass assignment:** schemas Zod `.strict()` em alunos, cobrança e configurações; testes Vitest para chaves extra — rever cada **nova** Action que aceite `unknown` e actualizar a tabela **SECE2E-3.5**.
- [ ] **Políticas Supabase** no dashboard (RLS, rotação de keys, CORS, Auth hooks).
- [ ] **Dependências:** `pnpm audit` / política de upgrades.
- [ ] **Controlo de acesso** a secrets (`service_role`, `DATABASE_URL`) no CI e no Supabase.
- [ ] **Cópias de erro** novas na UI: garantir ausência de mensagens técnicas brutas ao utilizador.

## Exploratório / manual-only

- [ ] **Rate limiting** global / multi-instância (Redis, CDN) e **Supabase Auth** (dashboard projeto); middleware cobre só Server Actions (**SECE2E-1.7**).
- [ ] **Clickjacking / CSP / framing** após endurecimento de headers.
- [ ] **Revisão de logs** server-side em staging após cenários de erro.

## Entrega

- Data da última revisão:
- Responsável:
