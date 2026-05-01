# Regras de graduação — Casca - Gestão de Academias de BJJ

Referência de ordem de faixas: **IBJJF** — *General System of Graduation* (faixas por idade; graus em faixas coloridas adulto). O aplicativo é uma ferramenta da academia; federações podem impor regras adicionais.

---

## GR-1. Faixas adulto (16+)

**GR-1.1.** Ordem **obrigatória** para promoção de **faixa**: Branca → Azul → Roxa → Marrom → Preta.

**GR-1.2.** Faixas **coral / vermelha** (pós-7º grau na preta) estão **fora do MVP** de cadastro; apenas mencionadas como limite do produto inicial.

**GR-1.3.** Nas faixas **Branca, Azul, Roxa e Marrom**, existem **4 graus** (informais: listras no patch preto; no sistema: grau **0–4**, onde **0** = sem grau e **4** = quarto grau antes da próxima promoção de faixa).

**GR-1.4.** Na **Preta**, os **graus** seguem o modelo IBJJF (**1º ao 6º grau** na faixa preta). Faixas **coral** e **vermelha** (posterior à carreira na preta) continuam **fora do MVP** (**GR-1.2**). Não se aplica o limite “quatro graus” das faixas coloridas (**SPEC-8.2**).

**GR-1.5.** Promoção de **grau** não altera a **faixa**. Promoção de **faixa** pode resetar graus conforme implementação (típico: volta a **0** graus na nova faixa).

---

## GR-2. Faixas kids (4–15 anos, catálogo MVP)

**GR-2.1.** Ordem **obrigatória** de **faixas** no sistema (nomes podem ser normalizados na UI):

1. Branca  
2. Cinza/Branca  
3. Cinza  
4. Cinza/Preta  
5. Amarela/Branca  
6. Amarela  
7. Amarela/Preta  
8. Laranja/Branca  
9. Laranja  
10. Laranja/Preta  
11. Verde/Branca  
12. Verde  
13. Verde/Preta  

**GR-2.2.** Cada faixa kids no sistema comporta **4 graus** (**0–4**) antes da próxima **faixa** da lista (**GR-2.1**).

**GR-2.3.** Idades mínimas por **grupo de cor** na competição IBJJF (referência): Cinza **4+**; Amarelo **7+**; Laranja **10+**; Verde **13+**. O MVP **não obriga** bloqueio automático por idade salvo decisão explícita em ciclo futuro; o professor é responsável pela conformidade.

---

## GR-3. Transição kids → adulto (informação de produto)

**GR-3.1.** Quando o aluno atinge a política de idade adulta do sistema (tipicamente **16 anos**), a **primeira faixa adulta** aplicável é decisão do **professor** (Branca ou superior), alinhada à prática IBJJF de transição.

**GR-3.2.** Implementação de alertas ou assistentes de transição fica nos ciclos de **student-profile** / **graduation-engine**.

---

## GR-4. Ordem e “pulo” de faixa

**GR-4.1.** **Pulo** ocorre quando a nova faixa não é a **sucessora imediata** da faixa anterior na lista aplicável (**GR-1.1** ou **GR-2.1**).

**GR-4.2.** O **grau resultante** deve situar-se nos **limites da faixa**: faixas coloridas adulto e faixas kids **0–4**; faixa preta adulto **1–6** (**GR-1.3**, **GR-1.4**, **GR-2.2**). Combinações fora destes intervalos são **inválidas**.

**GR-4.3.** Ao detectar pulo de **faixa** (**GR-4.1**), o sistema **bloqueia** a conclusão do registro até que exista **justificativa obrigatória** em texto (motivo do pulo).

**GR-4.4.** A justificativa deve ser **persistida** no histórico da graduação (**ENT-5.1**).

**GR-4.5.** Num **único** registo de promoção mantendo a **mesma faixa**, apenas é válido avançar **exactamente um grau** (ex.: de grau 2 para grau 3). Saltos de mais de um grau na mesma faixa são **rejeitados** pela aplicação; **não** se dispara o fluxo de justificativa de **pulo de faixa** (**GR-4.3**), que é específico de **GR-4.1**.

---

## GR-5. Fora do MVP

**GR-5.1.** Fluxos de **transferência entre academias**, **homologação de faixa por terceiros** e **exceções federativas** não têm regra operacional no app; podem usar campos de observação se existirem.

**GR-5.2.** Quem pode promover quem (hierarquia de professor na IBJJF) **não** é enforced no MVP (um professor por conta).

---

## GR-6. Rastreio para implementação

**GR-6.1.** Catálogo de faixas e ordinais deve refletir **GR-1** e **GR-2** (ciclo schema **belts**).

**GR-6.2.** Histórico deve armazenar **was_skip** e **skip_reason** quando **GR-4.3** aplicável.

**GR-6.3.** No banco, recomenda-se **CHECK** em `student_graduations`: se **não** houve pulo (`was_skip` falso), `skip_reason` deve ser nulo; se houve pulo (`was_skip` verdadeiro), `skip_reason` deve ser texto não vazio após `trim` — alinhado a **GR-4.4**.
