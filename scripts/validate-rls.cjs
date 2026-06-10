/**
 * Valida RLS contra o projeto Supabase (anon, authenticated, tentativa de INSERT inválido).
 * Variáveis: DATABASE_URL; URL/anon/service via NEXT_PUBLIC_* ou E2E_SUPABASE_* (ver **SECE2E-7.3**).
 * Carrega `.env`, `.env.local` e `.env.test` (último sobrescreve) para alinhar CI e Playwright.
 *
 * Emails de teste: E2E_USER_A_EMAIL / E2E_USER_B_EMAIL ou valores por defeito históricos.
 * Papel student (opcional): E2E_STUDENT_EMAIL — conta dedicada; fixture só toca linhas RLS-V-*.
 * Senha partilhada para criar/sincronizar utilizadores: VALIDATION_TEST_PASSWORD ou E2E_USER_A_PASSWORD.
 *
 * Usage: pnpm db:validate-rls
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");

const root = path.join(__dirname, "..");
require("dotenv").config({ path: path.join(root, ".env") });
require("dotenv").config({ path: path.join(root, ".env.local"), override: true });
require("dotenv").config({ path: path.join(root, ".env.test"), override: true });

const EMAIL_A = process.env.E2E_USER_A_EMAIL?.trim();
const EMAIL_B = process.env.E2E_USER_B_EMAIL?.trim();
const EMAIL_STUDENT = process.env.E2E_STUDENT_EMAIL?.trim();

/** Marcadores exclusivos de fixture — nunca alterar alunos/profiles fora destes nomes. */
const MARKER_PEER = "RLS-V-A-PEER";
const MARKER_STUDENT = "RLS-V-A-STUDENT";
const MARKER_STUDENT_PROFILE = "RLS-V-STUDENT";
const MARKER_CLASS = "RLS-V-CLASS";
const MARKER_PRODUCT = "RLS-V-SHOP-PRODUCT";
const MARKER_PRODUCT_CODE = "RLS-V-SHOP";

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    console.error(`Falta ${name} no ambiente (.env.local / .env.test / CI).`);
    process.exit(2);
  }
  return v.trim();
}

function requireEnvAny(names, label) {
  for (const name of names) {
    const v = process.env[name];
    if (v && String(v).trim()) return String(v).trim();
  }
  console.error(`Falta ${label} (defina uma de: ${names.join(", ")}).`);
  process.exit(2);
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

/**
 * Turma + sessão + inscrições para testes portal Fase 2 (marcadores RLS-V-*).
 */
async function ensureClassPortalFixture(
  pg,
  accountId,
  instructorProfileId,
  studentId,
  peerStudentId
) {
  const existing = await pg.query(
    `select c.id as class_id, cs.id as session_id
     from public.classes c
     inner join public.class_sessions cs on cs.class_id = c.id
     where c.account_id = $1 and c.name = $2
     order by cs.session_date asc
     limit 1`,
    [accountId, MARKER_CLASS]
  );
  if (existing.rows.length) {
    return {
      classId: existing.rows[0].class_id,
      sessionId: existing.rows[0].session_id,
      studentId,
      peerStudentId,
    };
  }

  const classIns = await pg.query(
    `insert into public.classes (account_id, name, kind, instructor_profile_id)
     values ($1, $2, 'adult', $3)
     returning id`,
    [accountId, MARKER_CLASS, instructorProfileId]
  );
  const classId = classIns.rows[0].id;

  const sessionDateRes = await pg.query(
    `select (current_date + interval '1 day')::date as session_date,
            extract(isodow from (current_date + interval '1 day'))::int as iso_dow`
  );
  const sessionDate = sessionDateRes.rows[0].session_date;
  const isoDow = Number(sessionDateRes.rows[0].iso_dow);

  await pg.query(
    `insert into public.class_recurring_schedules
       (account_id, class_id, day_of_week, start_time, end_time)
     values ($1, $2, $3, '19:00', '20:30')
     on conflict (class_id, day_of_week, start_time) do nothing`,
    [accountId, classId, isoDow]
  );

  const sessionIns = await pg.query(
    `insert into public.class_sessions
       (account_id, class_id, session_date, start_time, end_time)
     values ($1, $2, $3, '19:00', '20:30')
     on conflict (class_id, session_date, start_time) do update
       set account_id = excluded.account_id
     returning id`,
    [accountId, classId, sessionDate]
  );
  const sessionId = sessionIns.rows[0].id;

  for (const sid of [studentId, peerStudentId]) {
    await pg.query(
      `insert into public.student_class_enrollments (account_id, student_id, class_id)
       values ($1, $2, $3)
       on conflict (student_id, class_id) do nothing`,
      [accountId, sid, classId]
    );
  }

  console.log(`  Fixture portal: turma ${MARKER_CLASS}, sessão ${sessionId}`);
  return { classId, sessionId, studentId, peerStudentId };
}

/**
 * Produto portal + variante para testes loja Fase 3 (marcadores RLS-V-SHOP-*).
 */
async function ensureShopFixture(pg, accountId) {
  const existing = await pg.query(
    `select p.id as product_id, pv.id as variant_id, pv.stock_quantity
     from public.products p
     inner join public.product_variants pv on pv.product_id = p.id
     where p.account_id = $1 and p.code = $2
     limit 1`,
    [accountId, MARKER_PRODUCT_CODE]
  );
  if (existing.rows.length) {
    await pg.query(
      `update public.product_variants
       set stock_quantity = 2, price_cents = 9900, updated_at = now()
       where id = $1`,
      [existing.rows[0].variant_id]
    );
    await pg.query(
      `update public.products
       set active = true, portal_visible = true, updated_at = now()
       where id = $1`,
      [existing.rows[0].product_id]
    );
    return {
      productId: existing.rows[0].product_id,
      variantId: existing.rows[0].variant_id,
    };
  }

  const productIns = await pg.query(
    `insert into public.products
       (account_id, code, name, active, portal_visible, description)
     values ($1, $2, $3, true, true, 'Fixture loja RLS')
     returning id`,
    [accountId, MARKER_PRODUCT_CODE, MARKER_PRODUCT]
  );
  const productId = productIns.rows[0].id;

  const variantIns = await pg.query(
    `insert into public.product_variants
       (product_id, size_label, stock_quantity, price_cents)
     values ($1, 'M', 2, 9900)
     returning id`,
    [productId]
  );

  console.log(`  Fixture loja: produto ${MARKER_PRODUCT}, variante M`);
  return { productId, variantId: variantIns.rows[0].id };
}

async function isShopSchemaReady(pg) {
  const res = await pg.query(
    `select exists (
       select 1 from information_schema.tables
       where table_schema = 'public' and table_name = 'reservations'
     ) as ok`
  );
  return Boolean(res.rows[0]?.ok);
}

async function main() {
  if (!EMAIL_A || !EMAIL_B) {
    console.error(
      "Defina E2E_USER_A_EMAIL e E2E_USER_B_EMAIL (contas de teste dedicadas; ver docs/testing/e2e-test-accounts.md).",
    );
    process.exit(2);
  }

  const databaseUrl = requireEnv("DATABASE_URL");
  const supabaseUrl = requireEnvAny(
    ["NEXT_PUBLIC_SUPABASE_URL", "E2E_SUPABASE_URL"],
    "URL Supabase (NEXT_PUBLIC_SUPABASE_URL ou E2E_SUPABASE_URL)",
  );
  const anonKey = requireEnvAny(
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "E2E_SUPABASE_ANON_KEY"],
    "anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY ou E2E_SUPABASE_ANON_KEY)",
  );
  const serviceKey = requireEnvAny(
    ["SUPABASE_SERVICE_ROLE_KEY", "E2E_SUPABASE_SERVICE_ROLE_KEY"],
    "service_role (SUPABASE_SERVICE_ROLE_KEY ou E2E_SUPABASE_SERVICE_ROLE_KEY)",
  );

  const testPassword =
    process.env.VALIDATION_TEST_PASSWORD?.trim() ||
    process.env.E2E_USER_A_PASSWORD?.trim() ||
    null;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(", Auth: garantir utilizadores A e B ,");
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
    console.log(", Senhas de teste alinhadas (VALIDATION_TEST_PASSWORD) ,");
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

    console.log(", Postgres: garantir contas + perfis + alunos de teste ,");

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

    async function ensurePeerStudent(accountId) {
      const st = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [accountId, MARKER_PEER]
      );
      if (st.rows.length) return st.rows[0].id;
      const ins = await pg.query(
        `insert into public.students (account_id, kind, full_name, current_belt_id, current_degree, status)
         values ($1, 'adult', $2, $3, 0, 'active') returning id`,
        [accountId, MARKER_PEER, beltId]
      );
      console.log(`  Aluno peer de teste (${MARKER_PEER}) criado em ${accountId}`);
      return ins.rows[0].id;
    }

    /**
     * Fixture student role: só INSERT/UPDATE em linhas com marcadores RLS-V-*.
     * Ignorado se E2E_STUDENT_EMAIL não estiver definido ou perfil existir noutra conta.
     */
    async function ensureStudentRoleFixture(accountId) {
      if (!EMAIL_STUDENT) {
        console.log(
          "  [Opcional] E2E_STUDENT_EMAIL não definido — testes de papel student omitidos."
        );
        return null;
      }

      const uStudent = await ensureAuthUser(admin, EMAIL_STUDENT, testPassword);
      if (testPassword) {
        const up = await admin.auth.admin.updateUserById(uStudent.user.id, {
          password: testPassword,
        });
        if (up.error) throw up.error;
      }

      const existingProfile = await pg.query(
        `select id, account_id, display_name from public.profiles where user_id = $1`,
        [uStudent.user.id]
      );

      if (existingProfile.rows.length) {
        const row = existingProfile.rows[0];
        if (row.account_id !== accountId) {
          console.warn(
            `  [SKIP student RLS] ${EMAIL_STUDENT} tem perfil noutra conta (${row.account_id}) — não alterar dados de produção.`
          );
          return null;
        }
        if (!String(row.display_name).startsWith("RLS-")) {
          console.warn(
            `  [SKIP student RLS] Perfil de ${EMAIL_STUDENT} não é fixture RLS (display_name=${row.display_name}).`
          );
          return null;
        }
        await pg.query(
          `update public.profiles set role = 'student' where user_id = $1 and account_id = $2 and display_name = $3`,
          [uStudent.user.id, accountId, MARKER_STUDENT_PROFILE]
        );
      } else {
        await pg.query(
          `insert into public.profiles (user_id, account_id, display_name, role)
           values ($1, $2, $3, 'student')`,
          [uStudent.user.id, accountId, MARKER_STUDENT_PROFILE]
        );
        console.log(`  Perfil student fixture criado (${MARKER_STUDENT_PROFILE})`);
      }

      let studentRow = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [accountId, MARKER_STUDENT]
      );
      if (!studentRow.rows.length) {
        studentRow = await pg.query(
          `insert into public.students (account_id, kind, full_name, current_belt_id, current_degree, status)
           values ($1, 'adult', $2, $3, 0, 'active') returning id`,
          [accountId, MARKER_STUDENT, beltId]
        );
        console.log(`  Aluno student fixture criado (${MARKER_STUDENT})`);
      }

      await pg.query(
        `update public.students set user_id = $1
         where account_id = $2 and full_name = $3`,
        [uStudent.user.id, accountId, MARKER_STUDENT]
      );

      await ensurePeerStudent(accountId);

      return { userId: uStudent.user.id, email: EMAIL_STUDENT, accountId };
    }

    const studentFixture = await ensureStudentRoleFixture(tenantA.accountId);

    const passwordForSignIn = testPassword;
    if (!passwordForSignIn) {
      console.warn(
        "\n[Defina VALIDATION_TEST_PASSWORD para testar login JWT e INSERT RLS como utilizador A.]"
      );
      console.warn("Testes anon continuam.\n");
    }

    console.log(", Cliente anon: esperado 0 linhas ,");
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
    const anonClasses = await anonClient.from("classes").select("id");
    if (anonClasses.error)
      throw new Error(`anon classes: ${anonClasses.error.message}`);
    if ((anonClasses.data || []).length !== 0) {
      throw new Error(
        `anon devia ver 0 classes, viu ${(anonClasses.data || []).length}`
      );
    }

    if (passwordForSignIn) {
      console.log(", Utilizador A: só alunos da própria conta ,");
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

      console.log(", INSERT aluno com account_id alheio (esperado erro) ,");
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

      if (studentFixture && passwordForSignIn) {
        console.log(", Utilizador student: só a própria linha em students ,");
        const studentClient = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const signInStudent = await studentClient.auth.signInWithPassword({
          email: studentFixture.email,
          password: passwordForSignIn,
        });
        if (signInStudent.error) throw signInStudent.error;

        const asStudent = await studentClient
          .from("students")
          .select("id, account_id, full_name");
        if (asStudent.error)
          throw new Error(`student students: ${asStudent.error.message}`);
        const studentRows = asStudent.data || [];
        if (studentRows.length !== 1) {
          throw new Error(
            `student devia ver exactamente 1 aluno, viu ${studentRows.length}`
          );
        }
        if (studentRows[0].full_name !== MARKER_STUDENT) {
          throw new Error(
            `student viu linha inesperada: ${studentRows[0].full_name}`
          );
        }
        if (studentRows[0].account_id !== studentFixture.accountId) {
          throw new Error("student viu aluno de outra conta");
        }

        const peerProbe = studentRows.find((r) => r.full_name === MARKER_PEER);
        if (peerProbe) {
          throw new Error("student não devia ver aluno peer na mesma conta");
        }

        console.log(", Student: UPDATE onboarding na própria linha ,");
        const onboardingAt = new Date().toISOString();
        const onboardingUpdate = await studentClient
          .from("students")
          .update({
            portal_terms_accepted_at: onboardingAt,
            guardian_email: "rls-test-guardian@example.com",
          })
          .eq("full_name", MARKER_STUDENT)
          .select("id");
        if (onboardingUpdate.error) {
          throw new Error(
            `student onboarding update: ${onboardingUpdate.error.message}`
          );
        }
        if ((onboardingUpdate.data || []).length !== 1) {
          throw new Error("student onboarding update não afectou a linha esperada");
        }

        console.log(", Student: profiles — só a própria linha ,");
        const studentProfiles = await studentClient
          .from("profiles")
          .select("id, user_id, role");
        if (studentProfiles.error) {
          throw new Error(`student profiles: ${studentProfiles.error.message}`);
        }
        const profileRows = studentProfiles.data || [];
        if (profileRows.length !== 1) {
          throw new Error(
            `student devia ver 1 profile, viu ${profileRows.length}`
          );
        }
        if (profileRows[0].role !== "student") {
          throw new Error(`student profile role inesperada: ${profileRows[0].role}`);
        }

        console.log(", Student: não escala role em profiles ,");
        const roleEscalation = await studentClient
          .from("profiles")
          .update({ role: "professor" })
          .eq("user_id", studentFixture.userId);
        if (!roleEscalation.error) {
          throw new Error("student não devia conseguir alterar profiles.role");
        }
        console.log(
          `  Recusado ao alterar role: ${roleEscalation.error.message}`
        );

        await studentClient.auth.signOut();
      }
    }

    console.log(", Portal Fase 2: fixture turma/sessão/check-in ,");
    const profileARow = await pg.query(
      `select id from public.profiles where user_id = $1 and account_id = $2`,
      [uA.user.id, tenantA.accountId]
    );
    if (!profileARow.rows.length) {
      throw new Error("Perfil professor A não encontrado para fixture classes");
    }
    const instructorProfileId = profileARow.rows[0].id;

    const studentIdRow = await pg.query(
      `select id from public.students where account_id = $1 and full_name = $2`,
      [tenantA.accountId, MARKER_STUDENT]
    );
    const peerIdRow = await pg.query(
      `select id from public.students where account_id = $1 and full_name = $2`,
      [tenantA.accountId, MARKER_PEER]
    );

    let classPortalFixture = null;
    if (studentIdRow.rows.length && peerIdRow.rows.length) {
      classPortalFixture = await ensureClassPortalFixture(
        pg,
        tenantA.accountId,
        instructorProfileId,
        studentIdRow.rows[0].id,
        peerIdRow.rows[0].id
      );
    } else {
      console.warn(
        "  [SKIP portal Fase 2] Marcadores student/peer ausentes — testes class_* omitidos."
      );
    }

    if (passwordForSignIn && classPortalFixture) {
      console.log(", Professor A: CRUD turma e leitura check-ins ,");
      const profClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInProf = await profClient.auth.signInWithPassword({
        email: EMAIL_A,
        password: passwordForSignIn,
      });
      if (signInProf.error) throw signInProf.error;

      const profClasses = await profClient
        .from("classes")
        .select("id, name")
        .eq("name", MARKER_CLASS);
      if (profClasses.error) {
        throw new Error(`professor classes: ${profClasses.error.message}`);
      }
      if ((profClasses.data || []).length !== 1) {
        throw new Error(
          `professor devia ver 1 turma fixture, viu ${(profClasses.data || []).length}`
        );
      }

      const profCheckIns = await profClient
        .from("check_ins")
        .select("id")
        .eq("class_session_id", classPortalFixture.sessionId);
      if (profCheckIns.error) {
        throw new Error(`professor check_ins: ${profCheckIns.error.message}`);
      }

      const profInsertClass = await profClient.from("classes").insert({
        account_id: tenantB.accountId,
        name: "should-fail-cross-tenant",
        kind: "adult",
        instructor_profile_id: instructorProfileId,
      });
      if (!profInsertClass.error) {
        await profClient
          .from("classes")
          .delete()
          .eq("name", "should-fail-cross-tenant");
        throw new Error(
          "professor não devia inserir turma com account_id alheio"
        );
      }
      console.log(
        `  Recusado INSERT turma cross-tenant: ${profInsertClass.error.message}`
      );

      await profClient.auth.signOut();

      console.log(", Utilizador B: isolamento check-ins conta A ,");
      const userBClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInB = await userBClient.auth.signInWithPassword({
        email: EMAIL_B,
        password: passwordForSignIn,
      });
      if (signInB.error) throw signInB.error;

      const bCheckIns = await userBClient
        .from("check_ins")
        .select("id")
        .eq("class_session_id", classPortalFixture.sessionId);
      if (bCheckIns.error) {
        throw new Error(`B check_ins: ${bCheckIns.error.message}`);
      }
      if ((bCheckIns.data || []).length !== 0) {
        throw new Error("B não devia ver check-ins da conta A");
      }
      await userBClient.auth.signOut();
    }

    if (passwordForSignIn && studentFixture && classPortalFixture) {
      console.log(", Student: check-in próprio e isolamento ,");
      const studentPortalClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInStudentPortal = await studentPortalClient.auth.signInWithPassword(
        {
          email: studentFixture.email,
          password: passwordForSignIn,
        }
      );
      if (signInStudentPortal.error) throw signInStudentPortal.error;

      await pg.query(`delete from public.check_ins where class_session_id = $1`, [
        classPortalFixture.sessionId,
      ]);

      const ownCheckIn = await studentPortalClient
        .from("check_ins")
        .insert({
          class_session_id: classPortalFixture.sessionId,
          student_id: classPortalFixture.studentId,
          account_id: studentFixture.accountId,
        })
        .select("id")
        .single();
      if (ownCheckIn.error) {
        throw new Error(`student check-in insert: ${ownCheckIn.error.message}`);
      }

      await pg.query(
        `insert into public.check_ins (account_id, class_session_id, student_id)
         values ($1, $2, $3)
         on conflict (class_session_id, student_id) do nothing`,
        [
          studentFixture.accountId,
          classPortalFixture.sessionId,
          classPortalFixture.peerStudentId,
        ]
      );

      const visibleCheckIns = await studentPortalClient
        .from("check_ins")
        .select("id, student_id")
        .eq("class_session_id", classPortalFixture.sessionId);
      if (visibleCheckIns.error) {
        throw new Error(
          `student check_ins select: ${visibleCheckIns.error.message}`
        );
      }
      const visibleRows = visibleCheckIns.data || [];
      if (visibleRows.length !== 1) {
        throw new Error(
          `student devia ver 1 check-in (próprio), viu ${visibleRows.length}`
        );
      }
      if (visibleRows[0].student_id !== classPortalFixture.studentId) {
        throw new Error("student viu check-in de outro aluno");
      }

      const evilInsert = await studentPortalClient.from("check_ins").insert({
        class_session_id: classPortalFixture.sessionId,
        student_id: classPortalFixture.peerStudentId,
        account_id: studentFixture.accountId,
      });
      if (!evilInsert.error) {
        throw new Error(
          "student não devia inserir check-in com student_id alheio"
        );
      }
      console.log(
        `  Recusado INSERT check-in alheio: ${evilInsert.error.message}`
      );

      const peerCheckInRow = await pg.query(
        `select id from public.check_ins
         where class_session_id = $1 and student_id = $2`,
        [classPortalFixture.sessionId, classPortalFixture.peerStudentId]
      );
      if (peerCheckInRow.rows.length) {
        const evilDelete = await studentPortalClient
          .from("check_ins")
          .delete()
          .eq("id", peerCheckInRow.rows[0].id);
        if (evilDelete.error) {
          console.log(
            `  DELETE check-in alheio recusado: ${evilDelete.error.message}`
          );
        } else if ((evilDelete.data || []).length > 0) {
          throw new Error("student não devia apagar check-in de outro aluno");
        }
      }

      console.log(", Student: attendances bloqueado ,");
      const profForAttendance = await pg.query(
        `select id from public.profiles where user_id = $1 limit 1`,
        [uA.user.id]
      );
      const attendanceInsert = await studentPortalClient
        .from("attendances")
        .insert({
          account_id: studentFixture.accountId,
          class_session_id: classPortalFixture.sessionId,
          student_id: classPortalFixture.studentId,
          recorded_by: profForAttendance.rows[0].id,
          origin: "checkin_student",
        });
      if (!attendanceInsert.error) {
        throw new Error("student não devia inserir attendance");
      }
      console.log(
        `  Recusado INSERT attendance: ${attendanceInsert.error.message}`
      );

      await studentPortalClient.auth.signOut();
    }

    const shopReady = await isShopSchemaReady(pg);
    if (!shopReady) {
      console.warn(
        "  [SKIP portal Fase 3] Tabela reservations ausente — aplique migration 012."
      );
    } else if (passwordForSignIn && studentFixture && classPortalFixture) {
      console.log(", Portal Fase 3: loja/reservas ,");
      const shopFixture = await ensureShopFixture(pg, studentFixture.accountId);

      await pg.query(`delete from public.reservations where account_id = $1`, [
        studentFixture.accountId,
      ]);

      const profShopClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInProfShop = await profShopClient.auth.signInWithPassword({
        email: EMAIL_A,
        password: passwordForSignIn,
      });
      if (signInProfShop.error) throw signInProfShop.error;

      const profProducts = await profShopClient
        .from("products")
        .select("id, code")
        .eq("code", MARKER_PRODUCT_CODE);
      if (profProducts.error) {
        throw new Error(`professor products: ${profProducts.error.message}`);
      }
      if ((profProducts.data || []).length !== 1) {
        throw new Error("professor devia ver produto fixture da loja");
      }

      const evilProductInsert = await profShopClient.from("products").insert({
        account_id: tenantB.accountId,
        code: "evil-cross-tenant",
        name: "should-fail",
      });
      if (!evilProductInsert.error) {
        await profShopClient
          .from("products")
          .delete()
          .eq("code", "evil-cross-tenant");
        throw new Error("professor não devia inserir produto cross-tenant");
      }

      await profShopClient.auth.signOut();

      const studentShopClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInStudentShop = await studentShopClient.auth.signInWithPassword(
        {
          email: studentFixture.email,
          password: passwordForSignIn,
        }
      );
      if (signInStudentShop.error) throw signInStudentShop.error;

      const studentProducts = await studentShopClient
        .from("products")
        .select("id, portal_visible")
        .eq("code", MARKER_PRODUCT_CODE);
      if (studentProducts.error) {
        throw new Error(`student products: ${studentProducts.error.message}`);
      }
      if ((studentProducts.data || []).length !== 1) {
        throw new Error("student devia ver 1 produto portal_visible");
      }

      const evilStudentProduct = await studentShopClient.from("products").insert({
        account_id: studentFixture.accountId,
        code: "evil-student-product",
        name: "hack",
      });
      if (!evilStudentProduct.error) {
        throw new Error("student não devia inserir produto");
      }

      const beforeStock = await pg.query(
        `select stock_quantity from public.product_variants where id = $1`,
        [shopFixture.variantId]
      );
      const stockBefore = Number(beforeStock.rows[0].stock_quantity);

      const reserveRpc = await studentShopClient.rpc("reserve_product_variant", {
        p_variant_id: shopFixture.variantId,
      });
      if (reserveRpc.error) {
        throw new Error(`student reserve_product_variant: ${reserveRpc.error.message}`);
      }
      const reservationId = reserveRpc.data?.id;
      if (!reservationId) {
        throw new Error("reserve_product_variant não devolveu reservation");
      }

      const afterStock = await pg.query(
        `select stock_quantity from public.product_variants where id = $1`,
        [shopFixture.variantId]
      );
      if (Number(afterStock.rows[0].stock_quantity) !== stockBefore - 1) {
        throw new Error("stock não desceu após reserva atómica");
      }

      const ownReservations = await studentShopClient
        .from("reservations")
        .select("id, student_id, status");
      if (ownReservations.error) {
        throw new Error(`student reservations: ${ownReservations.error.message}`);
      }
      const resRows = ownReservations.data || [];
      if (resRows.length !== 1) {
        throw new Error(
          `student devia ver 1 reservation, viu ${resRows.length}`
        );
      }
      if (resRows[0].student_id !== classPortalFixture.studentId) {
        throw new Error("student viu reservation de outro aluno");
      }

      await pg.query(
        `insert into public.reservations
           (account_id, student_id, product_variant_id, status, price_cents, expires_at)
         values ($1, $2, $3, 'pending_payment', 9900, now() + interval '1 day')`,
        [
          studentFixture.accountId,
          classPortalFixture.peerStudentId,
          shopFixture.variantId,
        ]
      );

      const visibleAfterPeer = await studentShopClient
        .from("reservations")
        .select("id");
      if ((visibleAfterPeer.data || []).length !== 1) {
        throw new Error("student não devia ver reservation do peer");
      }

      const accountPixUpdate = await studentShopClient
        .from("accounts")
        .update({ pix_key: "00000000000" })
        .eq("id", studentFixture.accountId)
        .select("id");
      if (accountPixUpdate.error) {
        console.log(
          `  Recusado UPDATE pix_key: ${accountPixUpdate.error.message}`
        );
      } else if ((accountPixUpdate.data || []).length > 0) {
        throw new Error("student não devia actualizar pix_key da conta");
      }

      await studentShopClient.auth.signOut();

      const profConfirmClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await profConfirmClient.auth.signInWithPassword({
        email: EMAIL_A,
        password: passwordForSignIn,
      });

      const confirmPaid = await profConfirmClient
        .from("reservations")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", reservationId)
        .select("id, status")
        .single();
      if (confirmPaid.error) {
        throw new Error(`professor confirm paid: ${confirmPaid.error.message}`);
      }
      if (confirmPaid.data?.status !== "paid") {
        throw new Error("professor não confirmou reservation como paid");
      }

      await profConfirmClient.auth.signOut();

      await pg.query(
        `update public.product_variants set stock_quantity = 0 where id = $1`,
        [shopFixture.variantId]
      );
      const expireResIns = await pg.query(
        `insert into public.reservations
           (account_id, student_id, product_variant_id, status, price_cents, expires_at)
         values ($1, $2, $3, 'pending_payment', 9900, now() + interval '1 day')
         returning id`,
        [
          studentFixture.accountId,
          classPortalFixture.studentId,
          shopFixture.variantId,
        ]
      );
      await pg.query(
        `update public.reservations
         set created_at = now() - interval '2 days',
             expires_at = now() - interval '1 hour'
         where id = $1`,
        [expireResIns.rows[0].id]
      );
      await pg.query(`select public.expire_stale_reservations($1)`, [
        studentFixture.accountId,
      ]);
      const expiredRow = await pg.query(
        `select status from public.reservations where id = $1`,
        [expireResIns.rows[0].id]
      );
      if (expiredRow.rows[0].status !== "expired") {
        throw new Error("expire_stale_reservations não marcou expired");
      }
      const stockAfterExpire = await pg.query(
        `select stock_quantity from public.product_variants where id = $1`,
        [shopFixture.variantId]
      );
      if (Number(stockAfterExpire.rows[0].stock_quantity) !== 1) {
        throw new Error("stock não reposto após expiração");
      }

      await pg.query(`delete from public.reservations where account_id = $1`, [
        studentFixture.accountId,
      ]);
    }

    console.log("\nOK , validação RLS concluída.");
  } finally {
    await pg.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
