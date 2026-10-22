# Notas de implementação — Design system com React Aria

## Stage 1 — Fundação compartilhada e cadastro público

- Decisões técnicas: `react-aria-components@1.22.1`; primitives compartilhados em `components/ui/react-aria-controls.tsx`; mantidos os componentes antigos para migração em etapas. `/register` passou a usar React Aria em campos, selects, combobox e ações. Galeria em `/design-system` demonstra tema, erro, disabled, teclado e seleção.
- Compatibilidade: peer dependencies incluem React 19; `pnpm type-check` e interação real no Next 15/React 19 RC passaram.
- API de localidades: endpoint servidor `/api/locations/states/[state]/cities`, baseado no serviço oficial IBGE, cache por 24h, timeout e erro recuperável. Seleção tem busca com normalização de acentos, mínimo de duas letras para evitar renderizar listas grandes, troca de UF limpa a cidade e validação de município/UF ocorre também no servidor.
- Política de senha/Supabase: mínimo de 15 caracteres sem regras artificiais de composição; limite de 72 bytes alinhado ao Auth; mensagem de `weak_password` mapeada para o campo. Proteção contra senhas vazadas depende da configuração/plano do projeto e não é anunciada pela interface.
- Evidência: 24 testes focados passam; `pnpm type-check` passa; smoke browser em `http://localhost:3100/register` e `/design-system` passou para progresso por etapas, busca/teclado, troca de UF e rejeição de senha curta. Endpoint RJ retornou 92 municípios; UF inválida retorna HTTP 400.
- Verificações restantes: checklist manual humano. Suite completa tem falha independente em `lib/marketing/landing-photos.test.ts` (texto “Alunos” esperado na landing). `pnpm lint` do projeto não está operacional com ESLint 9 + config `.eslintrc`; lint direcionado via modo compatibilidade passou sem erros. `pnpm build` passou; warnings existentes em protótipos fora da migração.
- Desvios e riscos: o comportamento indisponível/erro do serviço e viewport mobile ainda devem ser confirmados manualmente; nenhuma conta real foi criada no smoke.

## Stage 2 — Autenticação e configurações

- Decisões técnicas:
- Desvios e riscos:

## Stage 3 — Migração operacional e auditoria sistêmica

- Decisões técnicas:
- Exceções justificadas:
- Desvios e riscos:
