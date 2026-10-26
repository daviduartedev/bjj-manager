## Parent

Part of #6

## What to build

No cabeçalho do Painel, Personalizar abre um modal estreito com checkboxes dos blocos: Atrasados, Alunos ativos, Recebido, Alertas de graduação, Previsão de receita, Atenção, Faixas, Aulas de hoje. Tudo ligado por defeito. A escolha grava no perfil do professor (não na academia, não só neste browser). Esconder um bloco tira-o do painel na próxima visita neste utilizador.

## Acceptance criteria

- [ ] Controlo Personalizar no cabeçalho do Painel; modal de largura de confirmação.
- [ ] Os oito blocos listados, todos on por defeito; gravar persiste por professor.
- [ ] Recarregar a sessão mostra a mesma escolha; outro professor da mesma academia não herda a escolha.
- [ ] Migração/coluna no perfil alinhada ao schema existente; RLS continua a impedir ler/escrever perfil de outra conta.

## Blocked by

- None (can start immediately).
