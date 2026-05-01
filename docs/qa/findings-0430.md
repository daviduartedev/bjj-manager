# QA / endurecimento — achados 0430 (2026-05-01)

Documentação do attest manual automatizado (execução pontual) e da **importação da planilha Aslam** para a conta do utilizador `maikon@aslam.com.br` em produção.

## 1. Importação da planilha → Supabase

### Origem

- **Fonte canónica**: Excel `Planilha Alunos ASLAM.xlsx` (abas **KIDS** e **ADULTO**). Gerar TSV com `pnpm convert:planilha` ou `node scripts/convert-planilha-xlsx.mjs [caminho.xlsx]` (por defeito: `Downloads/Planilha Alunos ASLAM.xlsx`).
- Saída: `scripts/data/aslam-kids.tsv` e `scripts/data/aslam-adults.tsv` (linhas sem nome ignoradas).

### Comportamento do script

- Fluxo recomendado: `pnpm convert:planilha` → `pnpm import:sheet` (`scripts/import-aslam-sheet.mjs`).
- Variáveis: `DATABASE_URL` (obrigatório), opcionalmente `OWNER_EMAIL` (default `maikon@aslam.com.br`), `IMPORT_YEAR` (default **2026**), `IMPORT_CURRENT_MONTH` (default **5** — maio), `DRY_RUN=1` só valida contagens sem escrever.
- **Destrutivo**: apaga todos os **alunos** da conta alvo e reinsere linhas + vínculos `student_plans` + linhas `payments` dos meses importados.
- **Planos**: garante os três tipos (`kids_1`, `kids_2`, `adult`) como em **BR-1.4** / seed.
- **Faixa branca (kids)**: o seed usa o mesmo `slug` `white` para adulto e kids com `ON CONFLICT (slug) DO NOTHING`; em bases onde só existe `white` adulto, o script cria alias **`white_kids`** (`ensureKidsWhiteAlias`) e resolve BRANCA kids com fallback `white` → `white_kids`.
- **Adultos “LARANJA”** na planilha: não há faixa adulta laranja no catálogo; na TSV foi mapeado para **`blue`** (faixa azul) para **Isabella** e **Isabella Duarte** — rever na operação se preferirem outra convenção.
- **Mensalidades**: ano **2026** (`IMPORT_YEAR`). Kids e adultos: **Jan–Dez** (12 colunas da folha).
- **Estados da folha** → `payment_status`:
  - **BOLSISTA** → `scholarship` em todos os meses importados.
  - **ISENTO** → `other` em todos os meses (checkboxes ignorados).
  - **CANCELADO** → aluno `inactive`, sem pagamentos.
  - Checkbox **marcado** → `paid` para esse mês.
  - **Desmarcado**: meses anteriores ao mês corrente de import (`IMPORT_CURRENT_MONTH`) → `unpaid`; mês corrente → `pending` (alinhado a **BR-4**).

### Execução verificada

- Importação concluída com sucesso: **107** alunos (40 kids + 67 adultos) na conta associada a `maikon@aslam.com.br`.

## 2. Testes E2E e segurança (execução pontual)

Foram adicionados temporariamente **Playwright** e `e2e/attest-routes.spec.ts`, executados contra o servidor Next local (`PLAYWRIGHT_BASE_URL`, ex.: `http://127.0.0.1:3001`), e **removidos do repositório** após este relatório, por pedido de não manter a suite permanente.

### Cobertura attestada

| Área | Verificação |
|------|-------------|
| Rotas protegidas sem sessão | `/painel`, `/alunos`, `/alunos/novo`, `/mensalidades`, `/configuracoes`, `/perfil`, UUIDs exemplo em `/alunos/[id]` e `/mensalidades/[id]` → redirecionam para **`/login`**. |
| Legado | `/dashboard` sem sessão → **`/login`** (encadeamento via `/painel`). |
| Público | `/` e `/login` respondem &lt; 400; formulário de login com campos **E-mail** / **Senha** visíveis. |
| Segredo service role | Corpo HTML de `/` e `/login` **sem** substring `SUPABASE_SERVICE_ROLE` nem padrão obvio `service_role":`. |

### Teste autenticado

- Bloco **login → `/painel` → `/alunos`** ficou **skipped** na execução gravada por falta de `E2E_EMAIL` / `E2E_PASSWORD` no ambiente. Para repetir com sessão real, exportar essas variáveis e voltar a gerar temporariamente o spec Playwright (ou usar `pnpm db:validate-rls` para JWT / RLS).

### Resultado da última corrida

- **12** testes passaram, **1** skipped (fluxo autenticado), **0** falhas.

## 3. Referências

- **SEC- / middleware**: `lib/supabase/middleware.ts`, `lib/routes.ts`.
- **RLS**: `pnpm db:validate-rls`, `docs/security/rls.md`.
- **Reimportação**: alterar TSV em `scripts/data/`, rever `IMPORT_YEAR` / mês corrente, correr `pnpm import:sheet`.
