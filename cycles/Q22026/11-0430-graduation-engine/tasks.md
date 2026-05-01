# Tarefas , Graduation engine (11-0430)

Checklist executável; citar **GRD-**, **GR-**, **SPR-**, **SHELL-**, **DS-**, **DATE-**, **SEC-** nos commits quando aplicável.

## Spec e documentação (obrigatório)

- [ ] Garantir que `spec/features/graduation-engine/readme.md` reflecte **GRD-** (estado actual pós-refino).
- [ ] Actualizar `spec/features/student-profile/readme.md` (**SPR-7**, **SPR-9**, resumo + link histórico).
- [ ] Actualizar `spec/features/app-shell/readme.md` (**SHELL-2**, subrota `graduacoes`).
- [ ] Actualizar `spec/features/design-system/readme.md` (**DS-1.11** vibrancy).
- [ ] Actualizar `spec/product/spec.md` e cópia em `docs/product/spec.md` (**SPEC-10.4**).
- [ ] Actualizar `spec/product/graduation-rules.md` e `docs/product/graduation-rules.md` (**GR-4.5**; rever **GR-4.2** se necessário para alinhar limites por faixa).
- [ ] Actualizar `spec/README.md` (entrada **graduation-engine**, convenção **GRD-**).
- [ ] Actualizar `cycles/Q22026/11-0430-graduation-engine/scenarios.feature` se **GRD-** mudar no decurso do ciclo.
- [ ] Alinhar `cycles/Q22026/10-0430-student-profile/scenarios.feature` ao fim do placeholder **Promover** (cenário de pagamento mantém-se até ao ciclo 13).

## Rotas e navegação

- [ ] Acrescentar `routeAlunoGraduacoes(id)` (ou equivalente) em `lib/routes.ts`.
- [ ] Implementar `app/(dashboard)/alunos/[id]/graduacoes/page.tsx` (RSC; `notFound()` se aluno inacessível , **SPR-2.2**).
- [ ] Cabeçalho com volta ao perfil ou à lista conforme padrão **STU-1.2** / **GRD-**.

## Domínio e acções

- [ ] Criar `lib/graduation/` com `getBeltOrder(kind)`, `isOrderRespected(...)`, `nextBelt(...)` e funções auxiliares para limites de grau (preta 1–6; demais 0–4 conforme faixa).
- [ ] Criar `actions/graduations.ts` com `promoteStudent({ studentId, beltId, degree, isSkip, skipReason?, graduatedAt })` , transaccional; **nunca** aceitar `account_id` do cliente (**SEC-3.3**).
- [ ] Validar: sem datas futuras (timezone **America/Sao_Paulo**); sem demotion; sem no-op; +1 grau só na mesma faixa; pulo de faixa → `was_skip` + `skip_reason` não vazio; ordem respeitada → `was_skip` falso e `skip_reason` nulo (**GR-6.3**).

## UI

- [ ] Modal **Promover aluno** (cliente) reutilizável: aberto desde o perfil (**SPR-9.2**) e desde `/alunos/[id]/graduacoes`.
- [ ] Selecção de faixa: defeito filtrado por `student_kind`; modo **excepção** para catálogo completo (**GRD-**).
- [ ] Badge/chip com cor da faixa (`color_hex`); mensagem amigável para pulo de faixa (“Você está pulando da [X] para a [Y]. Justifique:”).
- [ ] Banner/modal informativo kids ≥ 16 quando aplicável (**GR-3.1**).
- [ ] Perfil: últimos **5** graduações + link “Ver histórico completo”; página dedicada com timeline completa.

## Identidade visual (ciclo)

- [ ] Aplicar **DS-1.11**: fortalecer acentos nas superfícies da área autenticada (`globals.css`, shell, cartões-chave) mantendo contraste e tokens.
- [ ] Actualizar `docs/design/style-guide.md` com nota breve coerente com **DS-1.11**.

## Qualidade

- [ ] Testes **Vitest** para funções em `lib/graduation/` (ordem, pulo, limites de grau, mesma faixa +1).
- [ ] `pnpm lint` e `pnpm type-check` sem erros.
- [ ] Checklist manual: promoção feliz; pulo de faixa bloqueado sem texto; ordem respeitada sem skip; data futura rejeitada; RLS (outro tenant); cores das faixas visíveis.
