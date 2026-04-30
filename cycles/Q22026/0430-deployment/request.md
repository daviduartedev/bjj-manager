# Deployment

## Context
Subir o BJJ Manager para a Vercel apontando ao Supabase de produção,
com variáveis de ambiente configuradas e checklist final percorrido.

## Intent
- Projeto Vercel ligado ao repositório.
- Variáveis de ambiente em **Production** e **Preview**:
  - `NEXT_PUBLIC_SUPABASE_URL`,
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  - `SUPABASE_SERVICE_ROLE_KEY` (apenas server, environment Production
    com proteção de acesso),
  - `NEXT_PUBLIC_APP_URL`,
  - `NEXT_PUBLIC_APP_NAME`.
- Supabase de produção:
  - `db/schema.sql`, `db/seed.sql`, `db/policies.sql` aplicados.
  - Domínio confiável adicionado em Auth → URL Configuration.
  - Templates de e-mail revisados em pt-BR.
- Domínio customizado configurado (se aplicável).
- Checklist `docs/release/release-checklist.md` percorrido.

## Taste / Constraints
- `service_role_key` jamais em variável `NEXT_PUBLIC_*`.
- Build de produção limpo, sem warnings de Next.
- Branch única em deploy: `develop` (ou `main` conforme convenção
  final).
- Rollback claro: snapshot do Supabase antes de aplicar migrações.

## References
- `cycles/Q22026/0430-qa-hardening/request.md`
- `.env.example`.

## Attachments
- (nenhum)
