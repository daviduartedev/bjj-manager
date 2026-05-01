/**
 * Valida RLS contra o projeto Supabase (anon, authenticated, tentativa de INSERT inválido).
 * Requer em .env.local: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL,
 * NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
 *
 * Obrigatório se os utilizadores ainda não existirem: VALIDATION_TEST_PASSWORD — senha forte
 * partilhada (apenas para estes emails de teste; não commitar).
 *
 * Usage: pnpm db:validate-rls
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");

const root = path.join(__dirname, "..");
require("dotenv").config({ path: path.join(root, ".env.local"), quiet: true });
require("dotenv").config({ path: path.join(root, ".env"), quiet: true });

const EMAIL_A = "maikon@aslam.com.br";
const EMAIL_B = "rls-validation-b@aslam.com.br";

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    console.error(`Falta ${name} no ambiente (.env.local).`);
    process.exit(2);
  }
  return v.trim();
}

async function ensureAuthUser(admin, email, passwordForCreate) {
  const list = await admin.auth.admin.listUsers({ perPage: 200, page: 1 });
  if (list.error) throw list.error;
  const found = list.data.users.find((u) => u.email === email);
  if (found) return { user: found, created: false };

  if (!passwordForCreate) {
    console.error(
      `Utilizador ${email} não existe. Defina VALIDATION_TEST_PASSWORD no .env.local e volte a executar.`
    );
    process.exit(2);
  }

  const created = await admin.auth.admin.createUser({
    email,
    password: passwordForCreate,
    email_confirm: true,
  });
  if (created.error) throw created.error;
  return { user: created.data.user, created: true };
}

async function main() {
  const databaseUrl = requireEnv("DATABASE_URL");
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const testPassword = process.env.VALIDATION_TEST_PASSWORD?.trim() || null;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("— Auth: garantir utilizadores A e B —");
  const uA = await ensureAuthUser(admin, EMAIL_A, testPassword);
  const uB = await ensureAuthUser(admin, EMAIL_B, testPassword);
  if (uA.created || uB.created) {
    console.log(
      "Utilizador(es) criado(s). Mantenha VALIDATION_TEST_PASSWORD para login nos testes JWT."
    );
  }

  if (testPassword) {
    for (const uid of [uA.user.id, uB.user.id]) {
      const up = await admin.auth.admin.updateUserById(uid, {
        password: testPassword,
      });
      if (up.error) throw up.error;
    }
    console.log("— Senhas de teste alinhadas (VALIDATION_TEST_PASSWORD) —");
  }

  const pg = new Client({
    connectionString: databaseUrl,
    ssl:
      databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
        ? undefined
        : { rejectUnauthorized: false },
  });
  await pg.connect();

  try {
    const beltRes = await pg.query(
      "select id from public.belts order by kind, ordinal limit 1"
    );
    if (!beltRes.rows.length) throw new Error("Sem faixas em public.belts.");
    const beltId = beltRes.rows[0].id;

    console.log("— Postgres: garantir contas + perfis + alunos de teste —");

    async function ensureProfileAndStudent(userId, email, suffix) {
      const existing = await pg.query(
        "select account_id from public.profiles where user_id = $1",
        [userId]
      );
      let accountId;
      if (existing.rows.length) {
        accountId = existing.rows[0].account_id;
        console.log(`  Perfil existente ${email} → account ${accountId}`);
      } else {
        const acc = await pg.query(
          `insert into public.accounts (name) values ($1) returning id`,
          [`RLS test (${suffix})`]
        );
        accountId = acc.rows[0].id;
        await pg.query(
          `insert into public.profiles (user_id, account_id, display_name) values ($1, $2, $3)`,
          [userId, accountId, suffix]
        );
        console.log(`  Criado perfil ${email} → account ${accountId}`);
      }

      const marker = `RLS-V-${suffix}`;
      const st = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [accountId, marker]
      );
      if (st.rows.length) {
        console.log(`  Aluno de teste já existe em ${accountId}`);
        return { accountId, studentId: st.rows[0].id };
      }
      const ins = await pg.query(
        `insert into public.students (account_id, kind, full_name, current_belt_id, current_degree, status)
         values ($1, 'adult', $2, $3, 0, 'active') returning id`,
        [accountId, marker, beltId]
      );
      console.log(`  Aluno de teste criado em account ${accountId}`);
      return { accountId, studentId: ins.rows[0].id };
    }

    const tenantA = await ensureProfileAndStudent(uA.user.id, EMAIL_A, "A");
    const tenantB = await ensureProfileAndStudent(uB.user.id, EMAIL_B, "B");

    const passwordForSignIn = testPassword;
    if (!passwordForSignIn) {
      console.warn(
        "\n[Defina VALIDATION_TEST_PASSWORD para testar login JWT e INSERT RLS como utilizador A.]"
      );
      console.warn("Testes anon continuam.\n");
    }

    console.log("— Cliente anon: esperado 0 linhas —");
    const anonClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const anonStudents = await anonClient.from("students").select("id");
    if (anonStudents.error)
      throw new Error(`anon students: ${anonStudents.error.message}`);
    if ((anonStudents.data || []).length !== 0) {
      throw new Error(
        `anon devia ver 0 students, viu ${(anonStudents.data || []).length}`
      );
    }
    const anonBelts = await anonClient.from("belts").select("id");
    if (anonBelts.error)
      throw new Error(`anon belts: ${anonBelts.error.message}`);
    if ((anonBelts.data || []).length !== 0) {
      throw new Error(
        `anon devia ver 0 belts, viu ${(anonBelts.data || []).length}`
      );
    }

    if (passwordForSignIn) {
      console.log("— Utilizador A: só alunos da própria conta —");
      const userClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signIn = await userClient.auth.signInWithPassword({
        email: EMAIL_A,
        password: passwordForSignIn,
      });
      if (signIn.error) throw signIn.error;

      const asA = await userClient.from("students").select("id, account_id");
      if (asA.error) throw new Error(`A students: ${asA.error.message}`);
      const rowsA = asA.data || [];
      for (const r of rowsA) {
        if (r.account_id !== tenantA.accountId) {
          throw new Error(
            `A viu student de outra conta: ${r.id} account ${r.account_id}`
          );
        }
      }
      const sawMarker = rowsA.length > 0;
      if (!sawMarker) console.warn("  Aviso: A não devolveu linhas (perfil/conta?)");

      console.log("— INSERT aluno com account_id alheio (esperado erro) —");
      const evil = await userClient.from("students").insert({
        account_id: tenantB.accountId,
        kind: "adult",
        full_name: "should-fail",
        current_belt_id: beltId,
        current_degree: 0,
        status: "active",
      });
      if (!evil.error) {
        await userClient
          .from("students")
          .delete()
          .eq("full_name", "should-fail");
        throw new Error("INSERT com account_id alheio deveria falhar e não falhou");
      }
      console.log(`  Recusado pelo Postgres/PostgREST: ${evil.error.message}`);

      await userClient.auth.signOut();
    }

    console.log("\nOK — validação RLS concluída.");
  } finally {
    await pg.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
