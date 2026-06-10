# language: pt
@casca @cycle-0609-graduation-edit-kids-protect-isento
Funcionalidade: Graduação editável, proteção Kids 2 e aluno Isento
  Como professor da academia
  Quero corrigir graduações, manter a segmentação Kids 1/Kids 2 estável e marcar alunos isentos
  Para operar com dados fiéis sem falsa inadimplência

  # ============================
  # Stage 1 — Proteção Kids 1 / Kids 2
  # ============================

  Cenário: Pipeline de base de dados não altera alunos em Kids 2
    Dado que existem alunos com vínculo aberto no plano Kids 2
    Quando o administrador executa o pipeline de aplicação da base de dados
    Então a contagem de alunos com vínculo aberto em Kids 2 permanece a mesma
    E nenhum aluno é movido automaticamente para Kids 1

  Cenário: Migração proibida é detectada antes de ir para produção
    Dado um ficheiro de migração que reatribui em massa vínculos entre Kids 1 e Kids 2
    Quando a verificação de planos é executada no CI ou após aplicar a base
    Então a verificação falha com mensagem clara sobre a política de planos

  # ============================
  # Stage 2 — Aluno Isento
  # ============================

  Cenário: Professor marca aluno como Isento
    Dado um aluno activo com mensalidade em aberto
    Quando marco esse aluno como Isento na ficha ou edição rápida
    Então o aluno passa a aparecer como Isento no perfil
    E deixo de o ver na lista trabalhável de mensalidades

  Cenário: Aluno Isento não aparece como atrasado após o vencimento
    Dado um aluno marcado como Isento
    E a data actual é posterior ao dia de vencimento que tinha
    Quando abro o perfil ou ficha desse aluno
    Então não vejo indicador ou chip Atrasado
    E a área financeira mostra apenas que o aluno está Isento

  Cenário: Aluno deixa de ser Isento e volta ao recorte de cobrança
    Dado um aluno marcado como Isento
    Quando desmarco a opção Isento
    Então o aluno volta a poder aparecer na lista de mensalidades conforme as regras habituais de cobrança

  Esquema do Cenário: Isento permanece distinto de Bolsista mensal
    Dado um aluno <situação>
    Quando consulto o estado financeiro apresentado
    Então vejo o rótulo "<rótulo>" e não confundo com cobrança mensal normal

    Exemplos:
      | situação                              | rótulo    |
      | marcado como Isento de forma persistente | Isento    |
      | com mensalidade do mês marcada Bolsista  | Bolsista  |

  # ============================
  # Stage 3 — Graduação editável + peso + visual
  # ============================

  Cenário: Professor regista graduação retroactiva com peso
    Dado um aluno com histórico de graduação incompleto
    Quando registo uma graduação com data passada, faixa, grau e peso 72,5 kg
    Então o evento aparece no histórico com a data e o peso
    E o tempo na faixa e no grau actuais reflecte a nova data de referência

  Cenário: Professor corrige data ou peso de uma graduação existente
    Dado um evento de graduação já registado
    Quando edito a data ou o peso desse evento
    Então as alterações ficam guardadas
    E a faixa e o grau actuais do aluno permanecem coerentes com o histórico

  Cenário: Sistema impede apagar graduações do histórico
    Dado um evento de graduação no histórico completo
    Quando procuro remover esse evento
    Então não existe acção de eliminar disponível na interface

  Cenário: Promoção inválida continua bloqueada na edição
    Dado um aluno na faixa azul grau 2
    Quando tento registar ou editar para faixa azul grau 4 num único passo
    Então o sistema rejeita a operação com mensagem clara

  Esquema do Cenário: Ilustração da faixa reflecte faixa e grau actuais
    Dado um aluno do tipo <tipo> na faixa <faixa> com <graus> graus
    Quando vejo o separador Graduação no perfil ou o histórico completo
    Então vejo uma ilustração da faixa coerente com a cor e os graus indicados

    Exemplos:
      | tipo   | faixa | graus |
      | adulto | Azul  | 3     |
      | kids   | Verde | 2     |

  Cenário: Peso fora da faixa permitida é rejeitado
    Dado que estou a registar ou editar uma graduação
    Quando informo peso 15,0 kg ou 300,0 kg
    Então o sistema mostra erro de validação antes de guardar
