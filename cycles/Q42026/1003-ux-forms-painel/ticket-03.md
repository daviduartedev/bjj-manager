## Parent

Part of #6

## What to build

Cadastro de aluno e edição completa passam a quatro trechos — Identificação, Faixa, Mensalidade, Contactos — com barra de progresso sem «Passo 01». Voltar conserva valores; não avança o trecho inválido; gravar só no último (Cancelar no último e sair no primeiro voltam a Alunos sem persistir). Ao marcar isento na página e na edição rápida, diálogo «Este aluno sai da cobrança de todas as mensalidades. Tem certeza?»; cancelar desfaz a marcação; desmarcar não pede; bolsista do mês não entra neste fluxo.

## Acceptance criteria

- [ ] `/alunos/novo` e `/alunos/[id]/editar` mostram os quatro trechos na ordem acordada; peso só na edição, no trecho Faixa; grau oculto na faixa branca.
- [ ] Barra visual sem numeração «Passo 01»; 25% por trecho concluído.
- [ ] Continuar valida só o trecho actual; Voltar não apaga o que já foi escrito; persistência só no submit do último trecho.
- [ ] Voltar/Continuar/Cancelar/Salvar (ou Registar aluno) partilham a altura dos CTAs do chrome.
- [ ] Marcar isento abre o diálogo com a frase locked; Cancelar deixa o checkbox desligado; desmarcar não abre diálogo.
- [ ] Edição rápida continua um único ecrã (modal largo), com a mesma confirmação de isento.

## Blocked by

- Blocked by #7, #8.
