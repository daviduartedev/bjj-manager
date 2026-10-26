# Plano — Design system unificado com React Aria

## Cycle: 1022-react-aria-system
## Gerado em: 2026-10-22

## Resumo do plano

Trabalho Large e incremental. Primeiro validar React Aria na stack existente, definir wrappers/tokens e converter `/register`, incluindo dependência Estado→Cidade via API pública do IBGE e política de senha coerente com NIST/Supabase. Depois migrar consumidores por grupos de domínio, mantendo adaptadores compatíveis onde a troca imediata de API for arriscada. A auditoria final identifica controles residuais e valida estados e semântica.

## Stages

### Stage 1 — Fundação compartilhada e cadastro público
- **Objetivo:** React Aria comprovado na stack, wrappers visuais Casca definidos e `/register` totalmente migrado.
- **Tasks:** ver `tasks.md` — Stage 1
- **Arquivos principais:** `components/ui/`, `app/(auth)/register/`, `lib/validations/academy-registration.ts`, `actions/register-academy.ts`
- **Critério de saída:** fluxo do cadastro passa por teclado/mobile, estado/cidade funciona, senha validada server-side e testes estáveis.

### Stage 2 — Autenticação e configurações
- **Objetivo:** converter os formulários de login, confirmação/reenvio e configurações para os wrappers estabelecidos.
- **Tasks:** ver `tasks.md` — Stage 2
- **Arquivos principais:** `app/(auth)/`, `app/(dashboard)/configuracoes/`, componentes compartilhados relacionados.
- **Critério de saída:** formulários do grupo usam os mesmos estados/medidas e não têm regressões de auth nem configurações.

### Stage 3 — Migração operacional e auditoria sistêmica
- **Objetivo:** migrar formulários e abas restantes do dashboard em lotes por domínio; auditar consumidores de inputs, botões, dropdowns e tabs.
- **Tasks:** ver `tasks.md` — Stage 3
- **Arquivos principais:** `components/`, `app/(dashboard)/`, `spec/features/design-system/`, `docs/design/style-guide.md`
- **Critério de saída:** consumidores em escopo usam primitives canônicos ou exceções documentadas; testes, revisão e validação responsiva/a11y concluídos.

## Riscos globais

| Risco | Probabilidade | Stage afetada | Mitigação |
|---|---|---|---|
| React Aria incompatível com React 19 RC | Média | 1 | Testar peer deps, render e interação na versão instalada antes da adoção ampla. |
| Migração ampla quebra RHF/forms ou APIs shadcn existentes | Alta | 1–3 | Wrappers incrementais e migração por domínio com testes. |
| Endpoint IBGE falha, responde lento ou muda | Média | 1 | Timeout, mensagens recuperáveis, cache/revalidação e teste de contrato sem bloquear cadastro silenciosamente. |
| Política forte diverge da configuração Supabase | Média | 1 | Confirmar política mínima do projeto; alinhar schemas client/server e configuração Auth. |
| Posição de popover conflita com viewport | Média | 1–3 | Preferir placement bottom e manter collision/viewport handling; verificar em telas pequenas. |

## Fora de escopo (confirmado)

- Redesign de páginas fora dos componentes de interação e áreas de ações.
- MFA e bloqueio de credenciais vazadas por serviço externo.
- Migrações de banco sem requisito técnico comprovado.

## Dependências entre stages

- Stage 2 depende dos wrappers e convenções validados na Stage 1.
- Stage 3 depende de migração e documentação do padrão da Stage 2.

## Perguntas abertas

- Nenhuma necessária para iniciar a Stage 1. A integração deve usar endpoint oficial público do IBGE, sem dependência de terceiros.
