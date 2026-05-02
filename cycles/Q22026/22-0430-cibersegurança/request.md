# Request: Auditoria e Testes E2E de Cibersegurança

Você deve atuar como um engenheiro sênior de segurança de aplicações, com foco em aplicações web modernas, autenticação, autorização, APIs, proteção de rotas e isolamento de dados.

O objetivo deste ciclo é criar uma suíte de testes E2E e de API focada exclusivamente em cibersegurança, validando que a aplicação resiste a usos indevidos, acessos não autorizados, manipulação de requisições e entradas maliciosas.

Antes de implementar qualquer teste, inspecione cuidadosamente o projeto, incluindo:

- stack utilizada;
- rotas públicas;
- rotas privadas;
- rotas dinâmicas;
- APIs;
- middlewares;
- autenticação;
- autorização;
- schemas de validação;
- banco de dados;
- entidades principais;
- regras de ownership;
- permissões;
- tratamento de erros;
- exposição de dados no frontend e backend.

---

## Objetivo principal

Criar uma bateria de testes de segurança que valide se a aplicação:

- protege rotas privadas;
- bloqueia APIs privadas sem autenticação;
- impede acesso a dados de outros usuários;
- impede manipulação de IDs;
- rejeita payloads maliciosos;
- valida dados no servidor;
- não expõe tokens, secrets ou informações sensíveis;
- retorna erros seguros;
- resiste a tentativas comuns de abuso;
- mantém isolamento entre usuários, contas, professores, tenants ou organizações.

---

## Escopo obrigatório

### 1. Proteção de rotas privadas

Identifique todas as páginas privadas da aplicação e teste:

- acesso sem autenticação;
- acesso com sessão inválida;
- acesso após logout;
- acesso direto por URL;
- refresh direto em rota privada;
- tentativa de voltar no navegador após logout;
- redirecionamento correto para login;
- ausência de dados privados renderizados antes do redirect.

Exemplo de comportamento esperado:

- usuário não autenticado não deve visualizar dashboard;
- usuário não autenticado não deve visualizar páginas internas;
- dados privados não devem aparecer nem brevemente na tela.

---

### 2. Proteção de APIs privadas

Identifique todas as APIs privadas e teste:

- chamada sem autenticação;
- chamada com cookie/token ausente;
- chamada com sessão inválida;
- chamada com método HTTP incorreto;
- chamada com headers manipulados;
- chamada com payload vazio;
- chamada com payload inválido;
- chamada com payload contendo campos proibidos.

As APIs privadas devem retornar status adequado, como:

- `401` para não autenticado;
- `403` para autenticado sem permissão;
- `400` ou `422` para payload inválido;
- `404` quando o recurso não existe ou não pertence ao usuário;
- `405` para método não permitido, se aplicável.

Use os códigos coerentes com a arquitetura já existente do projeto.

---

### 3. Autorização e IDOR

Crie testes obrigatórios para IDOR, ou seja, Insecure Direct Object Reference.

Use pelo menos dois usuários distintos:

- usuário A;
- usuário B.

Crie ou identifique recursos pertencentes a cada usuário e valide que:

- usuário A não consegue visualizar recurso do usuário B;
- usuário A não consegue editar recurso do usuário B;
- usuário A não consegue excluir recurso do usuário B;
- usuário A não consegue listar recursos do usuário B;
- usuário A não consegue acessar recurso do usuário B alterando ID na URL;
- usuário A não consegue acessar recurso do usuário B chamando API diretamente;
- buscas e filtros não retornam dados de outro usuário.

Exemplos de rotas a testar, adaptando ao projeto real:

```txt
/students/[id]
/api/students/[id]
/appointments/[id]
/api/appointments/[id]
/payments/[id]
/api/payments/[id]
/profile/[id]
/api/users/[id]