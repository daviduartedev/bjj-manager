# Feature: Design system

## Objetivo

Padronizar tipografia, componentes de interface (shadcn/ui), padrões de layout e estados comuns (carregamento, vazio, erro) para as entregas do MVP, com tokens já definidos no bootstrap.

## Documentos

| Documento | Descrição |
|-----------|-----------|
| [`docs/design/style-guide.md`](../../../docs/design/style-guide.md) | Guia legível: paleta, hierarquia, acessibilidade, uso de tokens |
| [`app/globals.css`](../../../app/globals.css) | Variáveis CSS e badges semânticos |
| [`tailwind.config.ts`](../../../tailwind.config.ts) | Mapa de cores `bjj.*`, família tipográfica e escala `crm-*` |

## Ciclo

- Request: `cycles/Q22026/03-0430-design-system/request.md`
- Plano: `cycles/Q22026/03-0430-design-system/plan.md`
- Tarefas: `cycles/Q22026/03-0430-design-system/tasks.md`
- Cenários: `cycles/Q22026/03-0430-design-system/scenarios.feature`

## Consumidores

- Ciclos **auth**, **app shell** (**SHELL-**), **students**, **student-profile**, **graduation-engine**, **dashboard**, **billing-ui** (**BUI-**) , importam componentes de `@/components/ui` e `@/components/layout` conforme este feature.

## Regras (DS-)

**DS-1.1.** Interação e cópia da interface seguem **pt-BR** (**SPEC-1.3**).

**DS-1.2.** Cores em UI devem derivar de **tokens** (`hsl(var(--…))`, tema Tailwind semântico ou paleta `bjj.*` documentada). Evitar hex arbitrários em componentes.

**DS-1.3.** **Mobile-first**; alvos de toque recomendados **≥ 44px** nos controles primários (botões, itens de menu tocáveis).

**DS-1.4.** **Foco visível** em elementos interativos (anel de foco consistente com `--ring`).

**DS-1.5.** Hierarquia tipográfica: **IBM Plex Sans** (`next/font`) como **única família** (corpo e títulos , padrão CRM); base **15px** (`text-crm-base` no `body`); títulos com **tracking reduzido** (`tracking-tight`); utilitários **`.type-page-title`**, **`.type-section-title`**, **`.type-card-heading`**, **`.type-meta-label`**, **`.type-field-label`**, **`.type-lead`** para ritmo consistente; escala **`crm-*`** no `tailwind.config.ts`.

**DS-1.6.** Estética: visual **limpo, profissional, marcial**; uso pontual de verde/azul/amarelo para status e detalhes , ver guia para semântica.

**DS-1.7.** **Tema escuro:** tokens em `.dark` devem permanecer **paritários** em legibilidade com o tema claro; telas de referência devem permitir **inspecionar ambos** (ex.: página `/design-system` em desenvolvimento).

**DS-1.8.** Toasts: usar **Sonner** como camada de notificação; **sem border-radius** nos toasts (cantos retos), conforme decisão de produto deste ciclo.

**DS-1.9.** A rota **`/design-system`** é galeria de tokens e componentes para **desenvolvimento** (`NODE_ENV !== 'production'`). Em **produção**, o **middleware** devolve **404** para esse caminho (o bundle pode existir, mas o acesso HTTP é bloqueado).

**DS-1.10.** Componentes shadcn adicionados neste escopo devem corresponder à lista acordada no request do ciclo; não expandir o kit sem necessidade de um ciclo MVP.

**DS-1.11.** **Realce cromático da área operacional:** além da sobriedade marcial, o tema pode incluir **gradientes subtis** na área de conteúdo ou cabeçalhos de secção, **acentos de `--primary` / `--status-*`** em cartões e estados hover focados, e **navegação activa** mais legível no shell , sempre derivado de **tokens** (**SPEC-10.4**). Evitar hex soltas em componentes; validar **contraste** nos dois temas. Ciclo de referência: **11-0430-graduation-engine**.

**DS-1.12.** **Chrome premium (dashboard):** a **sidebar** usa fundo **preto de identidade** (`--secondary` / **#050505**); o **conteúdo** pode usar **lavagem** (`--content-wash-*`) e **status** (`--status-*`, `--primary`) para cartões, cabeçalhos de página e hover , ver **BUI-8** em [`spec/features/billing-ui/readme.md`](../billing-ui/readme.md). Manter legibilidade e contraste **WCAG AA** onde aplicável.

## Decisões registradas (refino)

- Pergunta “componente só para galeria?”: **não** encher o kit com peças sem uso futuro no MVP; a galeria **mostra** o kit acordado, que já está motivado pelos próximos ciclos.
- Produção: middleware devolve **404** em `/design-system`.
- Tabela: só primitivos **Table** aqui; dados tabulares ricos ficam para os ciclos de domínio.
- Qualidade: lint + type-check; sem E2E dedicado à galeria neste ciclo.
