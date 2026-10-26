# Execution Map — React Aria system / Stage 1 — Fundação e cadastro público

## Objetivo

Validar React Aria Components nesta combinação React 19 RC/Next 15, criar os primitives Casca compartilhados necessários e migrar `/register`, incluindo seleção dependente de Estado/Cidade via IBGE e política de senha alinhada às diretrizes atuais e ao Supabase Auth.

## Tasks incluídas

| # | Descrição | Arquivo alvo |
|---|---|---|
| 1.1 | Validar compatibilidade e fixar a dependência React Aria Components | `package.json`, `pnpm-lock.yaml` |
| 1.2 | Definir wrappers tokenizados para campos, ações, Select/ComboBox e Tabs, sem quebrar usos atuais | `components/ui/`, `app/globals.css` |
| 1.3 | Estabelecer padrão de barra de ações com CTA no fim e estados coerentes | `components/ui/`, `app/(auth)/register/register-form.tsx` |
| 1.4 | Reordenar Estado antes de Cidade e carregar municípios por UF com busca, estados de erro/loading/vazio e acessibilidade de teclado | `app/(auth)/register/register-form.tsx`, `app/api/locations/states/[state]/cities/route.ts`, `lib/localities/` |
| 1.5 | Fortalecer política de senha no schema compartilhado pelo servidor e no formulário; alinhar configuração/capacidade do Supabase | `lib/validations/academy-registration.ts`, `app/(auth)/register/register-form.tsx`, `actions/register-academy.ts`, documentação/config auth |
| 1.6 | Testar fluxos, responsividade, foco, mensagens e estados; registrar evidências | testes existentes/novos e documentos do ciclo |

## Arquivos que serão criados ou modificados

- `package.json`, `pnpm-lock.yaml` — dependência aprovada/compatível.
- `components/ui/*` — wrappers React Aria que preservem API antiga quando possível; não será feita conversão cega de todo o repositório nesta stage.
- `app/globals.css` — estados e tokens compartilhados somente se wrappers não bastarem.
- `app/(auth)/register/register-form.tsx` — aplicação dos wrappers, ordem de campos e ações.
- `app/api/brazil/states/[uf]/cities/route.ts` (ou módulo equivalente) — integração servidor/cache para os municípios IBGE, se necessária após prova de contrato.
- `lib/validations/academy-registration.ts` e testes relacionados — validação de senha e cidade/UF.
- `actions/register-academy.ts` — somente se o contrato de dados precisar de validação adicional.

## Specs relevantes

- `spec/frontend.md` — labels, feedback, teclado, consistência e responsividade.
- `spec/security.md` — validação server-side e senhas.
- `spec/features/design-system/readme.md` — tokens, foco e componentes compartilhados.
- `spec/features/authentication/readme.md` — confirmar existência/escopo antes de editar.

## Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Peer compatibility incompleta do React Aria com React 19 RC | Média | Verificar peer deps, type-check e interação em browser antes de migrar o cadastro. |
| Mudança da senha não coincide com Auth provider | Média | Confirmar limite mínimo/complexidade ativo em Supabase; validação do servidor continua obrigatória. |
| API IBGE indisponível ou lenta | Média | Timeout e erro recuperável; ao trocar UF, limpar município anterior; evitar salvar valor incompatível. |
| Popover aberto para cima ou cortado | Média | Preferir placement abaixo e manter reposicionamento/collision handling para caber no viewport. |
| Migração quebra API de campo/form do RHF | Média | Wrappers de compatibilidade e testes do fluxo, sem migrar consumidores não listados. |

## Fora de escopo desta stage

- Migrar formulários de todas as demais áreas do sistema.
- Alterar banco de dados ou importar lista de municípios para persistência.
- MFA, serviço externo de senhas comprometidas ou mudanças no login.
- Redesign das páginas além dos controles e alinhamento das ações.

## Validações que serão rodadas ao final

- Testes unitários do schema e dos componentes/fluxos alterados.
- `pnpm type-check`, `pnpm lint`, testes afetados e `pnpm build`.
- Smoke em `/register`: desktop/mobile, teclado, busca/carga/erro de cidades, validação de senha e avançar/voltar.
- Auditoria de interface conforme `web-interface-guidelines` para os padrões tocados.

## Cenários de aceite desta stage

- UF é escolhida antes; Cidade só habilita depois e as opções refletem a UF.
- Cidade pode ser localizada por texto e escolhida por teclado/leitor de tela.
- Trocar UF limpa a cidade; erros de serviço permitem recuperação.
- Senha mais curta que o mínimo rejeitada no cliente e no servidor; instruções não exigem classes artificiais.
- Foco, alturas, hover/disabled e CTA principal usam o padrão Casca.

## Critério de parada

Stage 1 concluída quando dependência React Aria for comprovada, testes/type-check/lint/build aplicáveis passarem, os cenários do cadastro forem demonstrados no browser e evidências/notas forem registradas. Parar em seguida para revisão e checkpoint; não avançar para Stage 2.
