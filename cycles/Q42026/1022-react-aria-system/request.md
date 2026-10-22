# Request — Design system unificado com React Aria

## Cycle
- **Path:** `cycles/Q42026/1022-react-aria-system/`
- **Tipo:** Large
- **Data:** 2026-10-22
- **Autor:** Codex + usuário

## Contexto

Os componentes de formulário e interação variam entre páginas: existem primitives compartilhados, controles Radix, selects nativos e estilos locais. Isso produz diferenças de foco, altura, hover, navegação por teclado e posicionamento de menus. O cadastro público `/register` também precisa escolher Estado antes de Cidade e permitir selecionar municípios do estado escolhido. A senha atual aceita oito caracteres, sem orientação suficiente.

## O que precisa ser feito

Adotar React Aria Components como base acessível dos controles compartilhados do Casca. Consolidar inputs, botões, selects/comboboxes, abas e padrões de ações (CTAs alinhados à direita quando apropriado), com tokens Casca, tamanhos coerentes, foco/hover/disabled/loading e teclado consistentes. Aplicar o padrão no `/register` e migrar os consumidores restantes em etapas. Em `/register`, Estado precede Cidade; após selecionar a UF, Cidade torna-se um combobox pesquisável de municípios oficiais do IBGE. Revisar a política e a orientação de senha conforme diretrizes atuais, sincronizando validação de cliente e servidor/Auth.

## Motivação / valor

Uma linguagem de interação previsível melhora acessibilidade, reduz regressões visuais e facilita manutenção, sem descaracterizar a paleta sóbria do Casca.

## Critérios de aceite (alto nível)

- [ ] Primitives compartilhados usam React Aria Components para os padrões incluídos e preservam a identidade/tokenização Casca.
- [ ] `/register` apresenta Estado antes de Cidade; Cidade depende da UF, busca municípios correspondentes e possui estados de carregamento, vazio, erro e teclado.
- [ ] A política de senha é explicada na interface, validada no servidor e compatível com as capacidades/configuração do Supabase Auth; não prometer verificação de senha vazada sem implementar essa checagem.
- [ ] Formulários migrados usam foco, tamanhos, estados e ações padronizados; links continuam semanticamente links.
- [ ] Não há regressões nos fluxos migrados; testes, type-check, lint/build aplicáveis e auditoria acessível/visual passam.

## Stages previstas (estimativa inicial)

1. Stage 1 — Compatibilidade React Aria, primitives Casca e aplicação completa no `/register`.
2. Stage 2 — Migração dos formulários de autenticação, configurações e operações de baixa abrangência.
3. Stage 3 — Migração dos formulários/abas do dashboard por domínios e auditoria geral de consumidores.

## Restrições e riscos conhecidos

- A stack usa React 19 RC com Next 15; validar a compatibilidade da versão escolhida do React Aria antes de fixar dependência.
- Não substituir botões de ação por elementos com semântica de link, nem forçar popovers para baixo quando isso os tornaria inacessíveis fora do viewport.
- Usar os tokens existentes e respeitar tema claro/escuro.
- A mudança é de UI/validação; não alterar regras de negócio nem fazer migrações de banco sem necessidade demonstrada.
- A adoção por todo o sistema envolve muitos consumidores e deve ser incremental, testada por etapa.

## Fora de escopo

- Redesign amplo das páginas além da padronização de controles e barras de ação.
- MFA, login sem senha, recuperação de conta e mudanças na arquitetura de autenticação.
- Bloqueio externo de senhas vazadas, a menos que haja serviço/dependência aprovado e integrado com segurança.
- Atualização das specs canônicas antes da validação e aprovação do comportamento final.

## Specs relevantes

- `spec/frontend.md`
- `spec/security.md`
- `spec/features/design-system/readme.md`
- `spec/features/authentication/readme.md` (se existir)

## Referências

- React Aria Components: https://react-aria.adobe.com/
- IBGE Localidades: https://servicodados.ibge.gov.br/api/docs/localidades
- NIST SP 800-63B-4: https://pages.nist.gov/800-63-4/sp800-63b.html
