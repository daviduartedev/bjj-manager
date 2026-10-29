# Tickets e evidencia

- [x] Validar proposta de fronteiras/tickets com o usuario; publicar spec e sub-issues ready-for-agent. Evidencia: aprovacao assincrona e issues #80-#86 com sub-issues/dependencias nativas.
- [x] T1 Contratar e iniciar a avaliacao da academia. Evidencia: `lib/subscriptions/service.test.ts`, `webhook.test.ts`, `abacatepay.test.ts`; `tsc --noEmit`; Vitest 633/633. Ativacao externa pendente.
- [x] T2 Operar com acesso e capacidade do plano. Evidencia: `access.test.ts`, `guards.test.ts`; banner e actions com `requireAcademyWriteAccess`; migration 049. Enforcement inicia desligado.
- [x] T3 Gerenciar renovacao, cancelamento e troca de plano. Evidencia: testes de cancelamento, quote, upgrade avulso, retomada e downgrade em `service.test.ts`; `proration.test.ts`. Codigo no mesmo modulo de T1.
- [x] T4 Administrar academias, testes e isencoes no Casca. Evidencia: `lib/platform-admin/service.test.ts`; correcao de `casca_admin_overview` para `students.status = 'active'`.
- [x] T5 Receber e-mails da conta e da assinatura. Evidencia: `process.test.ts` (incluindo lembrete), `resend.test.ts`, `password-recovery.test.ts`; migration 052 e rota `/api/internal/subscriptions/notifications`. Sem envio real.
- [x] T6 Escolher o plano pela LP e concluir a contratacao. Evidencia: `register-academy.test.ts`, `academy-registration.test.ts`, `lp-pricing.tsx`. Smoke de browser pendente.
- [ ] Revisao Standards e Spec; corrigir findings.
- [x] Typecheck, suite completa e verificacao local. Evidencia: tsc limpo; Vitest 97 arquivos / 633 testes.
- [ ] dvd-tests com resultados, screenshots e checklist humano nao marcado.
- [ ] Entregar roteiro externo Vercel/Resend/AbacatePay/Supabase e hashes por ticket.

Marcar somente com evidencia real, distinguindo implementacao local e ativacao externa pendente.
