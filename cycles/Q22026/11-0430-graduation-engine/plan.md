# Plano — Graduation engine (delta)

## Contexto

A graduação é o núcleo operacional do domínio: o professor regista promoções; o sistema valida ordem oficial (IBJJF / **GR-**), exige justificativa quando há **pulo de faixa**, mantém histórico imutável e actualiza o estado actual do aluno. Este ciclo substitui o modal placeholder **Promover** do perfil (**SPR-9.2**), introduz a página de histórico completo e entrega helpers + Server Action transaccional. Inclui ainda um **realce cromático** da área autenticada (**SPEC-10.4**, **DS-1.11**) para uma interface mais viva sem abandonar tokens.

## Respostas do refino (consolidado)

| # | Tema | Decisão |
|---|------|---------|
| 1.1 | Rotas | **Manter o padrão actual do projecto**: URLs **`/alunos/[id]`** e **`/alunos/[id]/graduacoes`** (**SHELL-2**). Segmentos de pasta Next podem ser `app/(dashboard)/alunos/...`; o pedido original em inglês (`students`) não altera o contrato público. |
| 1.2 | Catálogo de faixas no modal | **Por defeito** lista filtrada por `student_kind`; **excepções** permitidas — o professor pode aceder a faixas do outro kind quando a operação o exige (transição, caso excepcional), com UI explícita (ex.: “Mostrar todas as faixas”) para não confundir o fluxo normal. |
| 1.3 | Kids ≥ 16 no fluxo de promoção | **Sim**: reforço informativo no modal (alinhado **GR-3.1** / **SPR-4.1**) quando `student_kind` é kids e idade ≥ 16. |
| 4 | Salto de **graus** na mesma faixa | **Validação estrita**: numa única promoção só é válido **+1 grau** na mesma faixa; saltos maiores são **rejeitados**. **Não** há fluxo de justificativa obrigatória por “pulo de grau” — **GR-4.3** aplica-se ao **pulo de faixa** (**GR-4.1**). Ver **GR-4.5** canónico. |
| 5 | Faixa preta | **Sim**: graus **1–6** na preta; faixas coloridas **0–4**; kids **0–4** — **GR-1.3**, **GR-1.4**, **GR-2.2**. |
| 6 | Regresso de faixa/grau ou estado repetido | **Bloquear**: não permitir “demotion” nem promoção cujo resultado seja **igual** ao par actual **(faixa, grau)**; mensagens claras no cliente e validação na Server Action. |
| 7 | `graduatedAt` | **Datas passadas e hoje** permitidas; **datas futuras proibidas**. “Dia civil” interpretado em **`America/Sao_Paulo`** (**DATE-** / **BR-3** coerente). |
| 8 | Histórico no perfil vs página dedicada | **Perfil**: resumo (**SPR-7**) com até **5** eventos mais recentes + CTA **“Ver histórico completo”** → **`/alunos/[id]/graduacoes`**. **Página dedicada**: timeline/cards completos, ordenação consistente (mais recente primeiro). |
| 9 | Após promover com sucesso | **Permanecer na página actual** (perfil ou histórico), com **revalidação** de dados e **toast** de sucesso (**DS-1.8**). |
| — | Identidade visual | **Mais cor e vida** na área operacional: acentos e hierarquia cromática a partir de tokens (**SPEC-10.4**, **DS-1.11**); ajustes em `globals.css` / shell / cartões conforme guia actualizado. |

## Delta em relação ao estado canónico actual

- **Antes:** **SPR-9.2** era modal placeholder; não existia feature canónica **GRD-**; histórico completo só no separador do perfil.
- **Depois:** **GRD-** em [`spec/features/graduation-engine/readme.md`](../../../spec/features/graduation-engine/readme.md); **SPR-7**/**SPR-9** actualizados; **SHELL-2** inclui **`/alunos/[id]/graduacoes`**; **GR-4.5** em [`spec/product/graduation-rules.md`](../../../spec/product/graduation-rules.md); **SPEC-10.4** e **DS-1.11** para vibrancy.

## Implementação (referência para o ciclo)

| Área | Artefactos típicos |
|------|-------------------|
| Página histórico | `app/(dashboard)/alunos/[id]/graduacoes/page.tsx` |
| Rotas | `lib/routes.ts` — `routeAlunoGraduacoes(studentId)` |
| Server Action | `actions/graduations.ts` — `promoteStudent(...)` transaccional |
| Domínio puro | `lib/graduation/` — `getBeltOrder`, `isOrderRespected`, `nextBelt`, limites de grau por faixa |
| UI | Modal **Promover** (perfil + histórico); badges com `belts.color_hex`; alerta copy para pulo de faixa |
| DS | `app/globals.css`, `tailwind.config.ts`, componentes de layout/shell conforme **DS-1.11** |

## Alinhamento com outros ciclos

- **10-0430-student-profile**: substitui placeholder **Promover**; perfil mostra últimos 5 eventos + link.
- **09-0430-date-duration-utilities**: formatação de datas no histórico e validação de `graduatedAt`.
- **04-0430-supabase-schema**: `student_graduations`, `belts`, checks **GR-6.3**.

## Fora de escopo

- Editar ou apagar linhas de `student_graduations`; hierarquia entre professores; homologação externa (**GR-5**).

## Riscos / notas

- **Kind mismatch** (aluno kids com faixa adulta escolhida na excepção): validar integridade no servidor (faixa escolhida deve existir e `belt.kind` coerente com a escolha do utilizador ou modo “excepção” documentado em **GRD-**).
- **Transacção**: INSERT em `student_graduations` + UPDATE em `students` na mesma unidade atómica.

## Referências

- `cycles/Q22026/11-0430-graduation-engine/request.md`
- `spec/features/graduation-engine/readme.md` (**GRD-**)
- `spec/product/graduation-rules.md` (**GR-**)
- `spec/features/student-profile/readme.md` (**SPR-**)
