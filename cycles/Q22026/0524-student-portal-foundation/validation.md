# validation.md — Medium Cycle

## Cycle: student-portal-foundation
## Data de validação: 2026-05-24

---

## Resultado dos comandos

| Comando | Resultado | Observações |
|---|---|---|
| `pnpm lint` | N/A | Cycle documental — sem alteração de código |
| `pnpm typecheck` | N/A | Cycle documental |
| `pnpm test` | N/A | Cycle documental |
| `pnpm build` | N/A | Cycle documental |
| `pnpm e2e` | N/A | Cycle documental |

---

## Mapeamento scenarios.feature → evidência

| Cenário | Tipo de evidência | Resultado |
|---|---|---|
| Aluno faz check-in dentro da janela | spec-delta SPT-5.1–5.2 | PASS |
| Aluno cancela check-in antes do fechamento da janela | spec-delta SPT-5.3 | PASS |
| Check-in rejeitado fora da janela | spec-delta SPT-5.1 | PASS |
| Check-in rejeitado após horário de início | spec-delta SPT-5.1 | PASS |
| Check-in não equivale a presença oficial | spec-delta SPT-5.4, SPT-0.1 | PASS |
| Professor converte check-ins em presença em lote | spec-delta SPT-6.2 | PASS |
| Professor adiciona presença manual sem check-in | spec-delta SPT-6.3 | PASS |
| Professor remove aluno que fez check-in mas faltou | spec-delta SPT-6.4 | PASS |
| Aluno vê aulas das suas turmas na próxima semana | spec-delta SPT-7 | PASS |
| Aluno reserva produto com estoque disponível | spec-delta SPT-8.3 | PASS |
| Reserva rejeitada sem estoque | spec-delta SPT-8.3 | PASS |
| Reserva expirada devolve estoque | spec-delta SPT-8.4 | PASS |
| Professor confirma pagamento presencial da reserva | spec-delta SPT-8.5 | PASS |
| Aluno vê layout PIX com aviso Em breve | spec-delta SPT-9 | PASS |
| Aluno não acede a dados de outro aluno | spec-delta SEC-3.7 | PASS |
| Professor não acede ao portal como destino pós-login | spec-delta AUTH-8 | PASS |
| Aluno não acede ao painel do professor | spec-delta AUTH-8 | PASS |
| Portal desligado por feature flag | spec-delta SPT-11 | PASS |
| Planos pedagógicos não aparecem como aulas agendadas | spec-delta SPT-0.3 | PASS |

---

## Smoke manual — revisão documental

| Passo | Ação | Resultado esperado | Resultado observado |
|---|---|---|---|
| 1 | Ler `request.md` vs `plan.md` + `spec-delta.md` | Escopo alinhado, sem implementação | PASS |
| 2 | Verificar D1–D7 em `plan.md` e ROADMAP sec. 4 | Cada decisão Fechada ou Adiada | PASS |
| 3 | Verificar separação CheckIn/Presença | SPT-0, SPT-5, SPT-6, SPT-10 | PASS |
| 4 | Verificar placeholder PIX | SPT-9 + cenário + flag desligada | PASS |
| 5 | Verificar mapa phases 1–4 | Slugs e critérios em `plan.md` | PASS |
| 6 | `ROADMAP_PORTAL_ALUNO.md` atualizado | Fase 0 ✅, decisões, PIX | PASS |
| 7 | Zero SQL/migrations gerados | Nenhum ficheiro `db/` alterado | PASS |
| 8 | Aprovação humana explícita | OK para Fase 1; prefixo `/portal` confirmado | PASS |

---

## Falhas baseline (pré-existentes)

- Nenhuma verificada neste cycle documental.

---

## Conclusão

- [x] Todos os cenários de aceite com evidência documental
- [x] Decisões D1–D7 fechadas ou adiadas com owner
- [x] `ROADMAP_PORTAL_ALUNO.md` alinhado
- [x] Nenhum SQL/script de alteração de dados gerado
- [x] Aprovação humana (passo 8) — 2026-05-24
- [x] Pronto para `/update-spec` e `/close-cycle` — spec promovida 2026-05-24
