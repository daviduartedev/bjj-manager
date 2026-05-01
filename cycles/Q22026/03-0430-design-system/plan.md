# Plano , Design system (delta)

## Contexto

Complementar o bootstrap (tokens em `app/globals.css`, paleta `bjj.*` em `tailwind.config.ts`) com componentes shadcn adicionais, peças de layout reutilizáveis, página de referência em desenvolvimento e guia de estilo. Objetivo: reduzir inconsistência nas próximas entregas (auth, shell, alunos, dashboard, cobrança).

## Esclarecimento do refino (pergunta 1)

A pergunta era: **cada componente da lista precisa ser usado depois em uma tela do MVP**, ou pode existir componente **só para aparecer na página `/design-system`**?

**Decisão:** não introduzir componentes shadcn que **não** estejam na lista acordada nem que **nenhum** ciclo MVP vá usar. Os itens listados no `request.md` estão **justificados** pelos fluxos previstos (menus, formulários, tabelas, diálogos, feedback). A rota `/design-system` é **ferramenta de desenvolvimento** para pré-visualizar tokens e variantes; ela não substitui “uso em produto”, mas os componentes expostos são os mesmos que as features vão importar.

## Decisões consolidadas (respostas + defaults)

| Tema | Decisão |
|------|---------|
| `/design-system` em dev | Acessível **sem login** quando `NODE_ENV !== 'production'`. |
| Produção | Middleware devolve **404** para `/design-system`; sem flag extra neste ciclo. |
| Tema escuro | **Documentado e demonstrado** na página e no guia; paridade claro/escuro nos tokens já existentes em `:root` / `.dark`. |
| Toasts | **Sonner** (`sonner`) como stack atual; **sem border-radius** nos toasts (cantos retos via classes). |
| Tabela | Apenas **primitivos Table** (markup + estilos shadcn); **TanStack Table** entra no ciclo que implementar listagens interativas (ex.: alunos/cobrança). |
| Tokens | Eliminar cor solta em `.badge-pending`; usar variável semântica no `:root`. |
| EmptyState | Bloco com título, descrição opcional, **ícone Lucide opcional**, área para **ações** (CTAs). |
| Touch targets | **≥ 44px** nos tamanhos default de controles interativos principais (botões, linhas de menu onde aplicável); documentado no guia. |
| Testes | **Lint + type-check** obrigatórios; cenários manuais na página de design system; **sem** E2E novo neste ciclo. |

## Delta em relação ao estado canônico atual

- **Antes:** tokens e poucos componentes (`button`, `input`, `card`, `badge`, `label`); sem hub de regras **DS-**; sem guia de estilo em `docs/design/`; sem rota de galeria.
- **Depois:** conjunto de UI alinhado ao MVP; layout (`PageHeader`, `Section`, `EmptyState`); **DS-** em `spec/features/design-system/readme.md`; **SPEC-10.1–10.3** (identidade visual) em `spec/product/spec.md`; `docs/design/style-guide.md`; `/design-system` só em dev.

## Fora de escopo

- TanStack Table no ciclo de design system.
- Novos componentes shadcn além dos listados no `request.md`.
- Testes E2E automatizados para a galeria.
- Expor `/design-system` em produção (mesmo com flag), neste ciclo.

## Riscos / notas

- Adicionar dependências Radix faltantes e **sonner**; manter versões compatíveis com React 19 RC / Next 15 conforme `package.json`.
- Cantos retos **apenas** nos toasts por decisão explícita; demais componentes seguem `rounded-*` já usados no projeto até decisão global futura.

## Referências

- `cycles/Q22026/03-0430-design-system/request.md`
- `spec/features/design-system/readme.md`
- `docs/design/style-guide.md`
