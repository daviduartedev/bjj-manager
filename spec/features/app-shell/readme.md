# Feature: App shell (área operacional)

Contrato canónico para o **chrome autenticado**: navegação persistente, cabeçalho e proteção HTTP alinhados a **AUTH-** e **DS-**. As features de domínio (alunos, mensalidades, configurações, etc.) montam-se **dentro** deste shell.

## Relação com outras specs

- Autenticação: **AUTH-2.x** em [`spec/features/authentication/readme.md`](../authentication/readme.md) (destino **`/painel`**, anónimos → `/login`).
- Design system: **DS-** em [`spec/features/design-system/readme.md`](../design-system/readme.md) (tokens, alvos de toque, tema claro/escuro).
- Produto: **SPEC-2.1**, **SPEC-5.1**, **SPEC-10.x** em [`spec/product/spec.md`](../../product/spec.md).

## Implementação (referência)

| Área | Artefatos típicos |
|------|-------------------|
| Layout | `app/(dashboard)/layout.tsx`; `DashboardShell`, **`DashboardPageHero`**, **`DashboardPanel`**, **`DashboardBackLink`**, **`DashboardStatTile`** (páginas operacionais , ritmo visual alinhado a `/alunos`) |
| Rotas públicas da área autenticada | Segmentos **pt-BR** listados em **SHELL-2** |
| Constantes | Módulo partilhado (ex. `lib/routes.ts`) consumido por middleware e menus |
| Sessão / guard HTTP | `lib/supabase/middleware.ts` (lista de prefixos protegidos, redirects) |

## SHELL-1. Escopo

**SHELL-1.1.** O utilizador autenticado opera dentro de um **layout partilhado** com cabeçalho, navegação principal e área de conteúdo.

**SHELL-1.2.** Em **desktop** (breakpoint **`lg`** do Tailwind do projeto), a navegação principal é uma **sidebar** visível.

**SHELL-1.3.** Em **mobile** (`< lg`), a navegação principal inclui **top bar** com controlo que abre um **drawer** e uma **bottom navigation** com os **mesmos destinos principais** da sidebar (obrigatória neste MVP).

**SHELL-1.4.** Estado de abertura do drawer é **apenas no cliente**; não há ida ao servidor só para abrir ou fechar o menu.

## SHELL-2. Rotas canónicas (pt-BR)

Os primeiros segmentos da área operacional (autenticada) são:

| Rota | Função |
|------|--------|
| `/painel` | Entrada principal pós-login , **painel operacional** (**PNL-** em [`spec/features/dashboard/readme.md`](../dashboard/readme.md)): KPIs, «Atenção hoje», distribuição por faixa |
| `/alunos` | Alunos e subrotas (ex.: **`/alunos/novo`**, **`/alunos/[id]`** (perfil , **SPR-**, com aba **Documentos** , **SPR-11**), **`/alunos/[id]/editar`**, **`/alunos/[id]/graduacoes`** (histórico de graduações , **GRD-**); ver **STU-1** em [`students-crud/readme.md`](../students-crud/readme.md)) |
| `/mensalidades` | Mensalidades , lista mensal de cobrança (**BUI-1**) |
| `/mensalidades/[studentId]` | Detalhe financeiro do aluno (**BUI-1**) |
| `/pedagogico/planos` | Planos de aula mensais por categoria (**PED-** em [`spec/features/lesson-plans/readme.md`](../lesson-plans/readme.md)); subrotas: `novo`, `[id]`, `[id]/editar` |
| `/documentos` | Hub central de documentos do aluno (**DOC-** em [`spec/features/student-documents/readme.md`](../student-documents/readme.md)); subrota `[documentId]` para detalhe |
| `/configuracoes` | Configurações da academia / conta (**CFG-** em [`spec/features/settings/readme.md`](../settings/readme.md), inclui **CFG-6** , recebedor para documentos formais) |
| `/perfil` | Perfil do utilizador |

Novas áreas autenticadas devem acrescentar prefixo aqui e no middleware, salvo decisão futura de agrupamento sob um único segmento.

Para inventário de testes de segurança (**SECE2E-4**), incluir também rotas públicas **`/`**, **`/login`**, **`/register`** e qualquer segmento dinâmico adicional encontrado no código (ex.: **`/mensalidades/[studentId]`**), além da lista acima.

## SHELL-3. Navegação e estado ativo

**SHELL-3.1.** Itens principais da navegação (rótulos em **pt-BR**): **Painel**, **Alunos**, **Mensalidades**, **Pedagógico**, **Documentos**, **Configurações**. Em mobile (bottom navigation) mantém-se o subset principal; os itens menos frequentes (**Documentos**) podem ficar atrás de um menu compacto se o espaço da bottom bar não acomodar todos sem comprometer toque ≥ 44px (**SHELL-7.3**, **DS-1.3**).

**SHELL-3.2.** O destino atual deve ficar **visualmente destacado** (cor de destaque acordada com identidade , vermelho no chrome escuro).

**SHELL-3.3.** Comparação com **`pathname`** deve tratar **subrotas** (ex.: `/alunos/novo` mantém **Alunos** ativo).

## SHELL-4. Cabeçalho e utilizador

**SHELL-4.1.** O cabeçalho apresenta a **marca** da aplicação (**Casca - Gestão de Academias de BJJ** ou nome configurado equivalente) **e**, quando existir contexto válido de academia, o **`account.name`**.

**SHELL-4.2.** Menu do utilizador inclui entrada **Perfil** (`/perfil`) e **Sair** (terminar sessão).

## SHELL-5. Proteção e legado

**SHELL-5.1.** **Anónimos** não acedem aos paths sob **SHELL-2**; o middleware redireciona para **`/login`** (**AUTH-2.3**).

**SHELL-5.2.** O middleware é a **fonte única** de bloqueio por falta de sessão; o layout não deve repetir redirect para o mesmo fim.

**SHELL-5.3.** Pedidos a **`/dashboard`** redirecionam para **`/painel`** (compatibilidade com links antigos e docs históricos).

## SHELL-6. Estados de carregamento e dados

**SHELL-6.1.** Enquanto partes do shell dependem de hidratação no cliente, deve existir **skeleton** cobrindo o **shell completo** (não só o conteúdo interno), para evitar “salto” de layout.

**SHELL-6.2.** Se o utilizador estiver autenticado em Auth mas em **estado inválido para domínio** (**AUTH-6.1**), **não** redirecionar para `/login`. O shell permanece utilizável; a **área de conteúdo** mostra mensagem **genérica** e orientação, **sem** expor detalhes internos; **Sair** permanece acessível.

## SHELL-7. Identidade, tema e responsividade

**SHELL-7.1.** Chrome **escuro**: sidebar com **fundo preto de marca** (**#050505** / `--secondary`), ícones claros, item activo em **vermelho** (**--primary**), dentro dos **tokens** (**DS-1.2**, **DS-1.12**). O **canvas** da área de conteúdo mantém tema claro com **acentos** da paleta (**BUI-8**).

**SHELL-7.2.** Chrome no **tema claro**: superfícies do shell **suavizadas** (cinza muito escuro / slate), não necessariamente preto `#050505` em toda a largura, mantendo **contraste** e hierarquia com o conteúdo.

**SHELL-7.3.** O shell deve ser **totalmente responsivo**; controlos tocáveis respeitam **≥ 44px** (**DS-1.3**).

## SHELL-8. Stack de navegação

**SHELL-8.1.** Sem bibliotecas adicionais só para navegação; usar **Radix** + **Tailwind** (ex.: primitivos shadcn **Sheet** / **Dropdown** conforme já adoptados).

## Manutenção

Alterações em paths autenticados, no middleware ou no layout partilhado devem actualizar este readme (**SHELL-**), **AUTH-2.x** quando afectarem destinos ou guards, e os cenários do ciclo em `cycles/.../07-0430-app-shell/scenarios.feature`.
