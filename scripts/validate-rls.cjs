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
const MARKER_PAYMENT = "RLS-V-PAYMENT";
const MARKER_GRADUATION = "RLS-V-GRADUATION";
const MARKER_PLAN = "RLS-V-PLAN";

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

    if (passwordForSignIn) {
      console.log(", Mensalidades: professor grava, aluno não lê nem grava ,");

      const assertPaymentWriteRefused = (result, label) => {
        if (result.error) {
          console.log(`  Recusado ${label}: ${result.error.message}`);
          return;
        }
        if ((result.data || []).length > 0) {
          throw new Error(`${label} não devia alterar mensalidade`);
        }
      };

      const financeStudentName = studentFixture ? MARKER_STUDENT : "RLS-V-A";
      const financeStudent = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [tenantA.accountId, financeStudentName]
      );
      if (!financeStudent.rows.length) {
        throw new Error(
          `Fixture de mensalidade sem aluno ${financeStudentName}`
        );
      }
      const financeStudentId = financeStudent.rows[0].id;

      await pg.query(
        `delete from public.payments p
         using public.students s
         where p.student_id = s.id
           and s.full_name like 'RLS-V-%'
           and p.notes = $1`,
        [MARKER_PAYMENT]
      );

      const profPay = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInProfPay = await profPay.auth.signInWithPassword({
        email: EMAIL_A,
        password: passwordForSignIn,
      });
      if (signInProfPay.error) throw signInProfPay.error;

      const insertedPay = await profPay
        .from("payments")
        .insert({
          student_id: financeStudentId,
          reference_month: "2099-01-01",
          amount_cents: 12000,
          status: "pending",
          notes: MARKER_PAYMENT,
        })
        .select("id, status")
        .single();
      if (insertedPay.error) {
        throw new Error(
          `professor insert mensalidade: ${insertedPay.error.message}`
        );
      }
      const paymentId = insertedPay.data.id;

      const markedPaid = await profPay
        .from("payments")
        .update({
          amount_cents: 12000,
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .eq("notes", MARKER_PAYMENT)
        .select("id, status, amount_cents")
        .single();
      if (markedPaid.error) {
        throw new Error(
          `professor marcar mensalidade paga: ${markedPaid.error.message}`
        );
      }
      if (markedPaid.data?.status !== "paid") {
        throw new Error("professor não marcou a mensalidade fixture como paga");
      }

      const markedScholarship = await profPay
        .from("payments")
        .update({
          amount_cents: 0,
          status: "scholarship",
          paid_at: null,
        })
        .eq("id", paymentId)
        .eq("notes", MARKER_PAYMENT)
        .select("id, status, amount_cents")
        .single();
      if (markedScholarship.error) {
        throw new Error(
          `professor marcar Bolsista: ${markedScholarship.error.message}`
        );
      }
      if (
        markedScholarship.data?.status !== "scholarship" ||
        Number(markedScholarship.data?.amount_cents) !== 0
      ) {
        throw new Error(
          "professor não actualizou a mensalidade fixture para Bolsista"
        );
      }

      const tenantBStudent = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [tenantB.accountId, "RLS-V-B"]
      );
      if (!tenantBStudent.rows.length) {
        throw new Error("Fixture RLS-V-B ausente para isolamento de mensalidade");
      }
      const crossPay = await profPay.from("payments").insert({
        student_id: tenantBStudent.rows[0].id,
        reference_month: "2099-01-01",
        amount_cents: 12000,
        status: "pending",
        notes: MARKER_PAYMENT,
      });
      if (!crossPay.error) {
        await pg.query(
          `delete from public.payments
           where student_id = $1 and notes = $2 and reference_month = '2099-01-01'`,
          [tenantBStudent.rows[0].id, MARKER_PAYMENT]
        );
        throw new Error(
          "professor não devia gravar mensalidade de outra academia"
        );
      }
      console.log(
        `  Recusado INSERT mensalidade cross-tenant: ${crossPay.error.message}`
      );

      await profPay.auth.signOut();

      const userBPay = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInBPay = await userBPay.auth.signInWithPassword({
        email: EMAIL_B,
        password: passwordForSignIn,
      });
      if (signInBPay.error) throw signInBPay.error;

      const bPayRead = await userBPay
        .from("payments")
        .select("id")
        .eq("id", paymentId);
      if (bPayRead.error) {
        throw new Error(`B payments: ${bPayRead.error.message}`);
      }
      if ((bPayRead.data || []).length !== 0) {
        throw new Error("B não devia ler mensalidade da conta A");
      }
      assertPaymentWriteRefused(
        await userBPay
          .from("payments")
          .update({ status: "paid", amount_cents: 1 })
          .eq("id", paymentId)
          .select("id"),
        "UPDATE mensalidade cross-tenant"
      );
      assertPaymentWriteRefused(
        await userBPay.from("payments").delete().eq("id", paymentId).select("id"),
        "DELETE mensalidade cross-tenant"
      );
      await userBPay.auth.signOut();

      const afterCross = await pg.query(
        `select status, amount_cents from public.payments
         where id = $1 and notes = $2`,
        [paymentId, MARKER_PAYMENT]
      );
      if (
        afterCross.rows.length !== 1 ||
        afterCross.rows[0].status !== "scholarship" ||
        Number(afterCross.rows[0].amount_cents) !== 0
      ) {
        throw new Error("mensalidade fixture alterada por outra academia");
      }

      if (studentFixture) {
        const studentPay = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const signInStudentPay = await studentPay.auth.signInWithPassword({
          email: studentFixture.email,
          password: passwordForSignIn,
        });
        if (signInStudentPay.error) throw signInStudentPay.error;

        const alunoRead = await studentPay.from("payments").select("id");
        if (alunoRead.error) {
          throw new Error(`aluno payments: ${alunoRead.error.message}`);
        }
        if ((alunoRead.data || []).length !== 0) {
          throw new Error(
            `aluno devia ver 0 mensalidades, viu ${(alunoRead.data || []).length}`
          );
        }

        const alunoInsert = await studentPay.from("payments").insert({
          student_id: financeStudentId,
          reference_month: "2099-02-01",
          amount_cents: 12000,
          status: "paid",
          paid_at: new Date().toISOString(),
          notes: MARKER_PAYMENT,
        });
        if (!alunoInsert.error) {
          await pg.query(
            `delete from public.payments
             where student_id = $1 and notes = $2 and reference_month = '2099-02-01'`,
            [financeStudentId, MARKER_PAYMENT]
          );
          throw new Error("aluno não devia criar mensalidade");
        }
        console.log(
          `  Recusado INSERT mensalidade (aluno): ${alunoInsert.error.message}`
        );

        assertPaymentWriteRefused(
          await studentPay
            .from("payments")
            .update({
              amount_cents: 5000,
              status: "paid",
              paid_at: new Date().toISOString(),
            })
            .eq("id", paymentId)
            .select("id, status"),
          "UPDATE mensalidade (aluno)"
        );
        assertPaymentWriteRefused(
          await studentPay
            .from("payments")
            .delete()
            .eq("id", paymentId)
            .select("id"),
          "DELETE mensalidade (aluno)"
        );

        const afterAluno = await pg.query(
          `select status, amount_cents from public.payments
           where id = $1 and notes = $2`,
          [paymentId, MARKER_PAYMENT]
        );
        if (
          afterAluno.rows.length !== 1 ||
          afterAluno.rows[0].status !== "scholarship" ||
          Number(afterAluno.rows[0].amount_cents) !== 0
        ) {
          throw new Error("aluno alterou a mensalidade fixture");
        }

        await studentPay.auth.signOut();
      } else {
        console.log(
          "  [Opcional] sem fixture student — testes de aluno em mensalidades omitidos."
        );
      }

      const profVoid = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInVoid = await profVoid.auth.signInWithPassword({
        email: EMAIL_A,
        password: passwordForSignIn,
      });
      if (signInVoid.error) throw signInVoid.error;
      const voided = await profVoid
        .from("payments")
        .delete()
        .eq("id", paymentId)
        .eq("notes", MARKER_PAYMENT)
        .select("id");
      if (voided.error) {
        throw new Error(`professor estornar mensalidade: ${voided.error.message}`);
      }
      if ((voided.data || []).length !== 1) {
        throw new Error("professor devia estornar a mensalidade fixture");
      }
      await profVoid.auth.signOut();
    }

    if (passwordForSignIn) {
      console.log(", Graduações: professor grava, aluno não lê nem grava ,");

      const assertGraduationWriteRefused = (result, label) => {
        if (result.error) {
          console.log(`  Recusado ${label}: ${result.error.message}`);
          return;
        }
        if ((result.data || []).length > 0) {
          throw new Error(`${label} não devia alterar graduação`);
        }
      };

      const graduationStudentName = studentFixture ? MARKER_STUDENT : "RLS-V-A";
      const graduationStudent = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [tenantA.accountId, graduationStudentName]
      );
      if (!graduationStudent.rows.length) {
        throw new Error(
          `Fixture de graduação sem aluno ${graduationStudentName}`
        );
      }
      const graduationStudentId = graduationStudent.rows[0].id;

      await pg.query(
        `delete from public.student_graduations g
         using public.students s
         where g.student_id = s.id
           and s.full_name like 'RLS-V-%'
           and g.skip_reason = $1`,
        [MARKER_GRADUATION]
      );

      const graduatedAt = "2099-01-15T15:00:00.000Z";
      const graduationRow = {
        student_id: graduationStudentId,
        resulting_belt_id: beltId,
        resulting_degree: 0,
        graduated_at: graduatedAt,
        was_skip: true,
        skip_reason: MARKER_GRADUATION,
      };

      const profGrad = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInProfGrad = await profGrad.auth.signInWithPassword({
        email: EMAIL_A,
        password: passwordForSignIn,
      });
      if (signInProfGrad.error) throw signInProfGrad.error;

      const insertedGrad = await profGrad
        .from("student_graduations")
        .insert(graduationRow)
        .select("id, resulting_degree")
        .single();
      if (insertedGrad.error) {
        throw new Error(
          `professor insert graduação: ${insertedGrad.error.message}`
        );
      }
      const graduationId = insertedGrad.data.id;

      const promoted = await profGrad
        .from("student_graduations")
        .update({ resulting_degree: 1 })
        .eq("id", graduationId)
        .eq("skip_reason", MARKER_GRADUATION)
        .select("id, resulting_degree")
        .single();
      if (promoted.error) {
        throw new Error(
          `professor actualizar graduação: ${promoted.error.message}`
        );
      }
      if (Number(promoted.data?.resulting_degree) !== 1) {
        throw new Error("professor não actualizou a graduação fixture");
      }

      const tenantBStudent = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [tenantB.accountId, "RLS-V-B"]
      );
      if (!tenantBStudent.rows.length) {
        throw new Error("Fixture RLS-V-B ausente para isolamento de graduação");
      }
      const crossGrad = await profGrad.from("student_graduations").insert({
        ...graduationRow,
        student_id: tenantBStudent.rows[0].id,
      });
      if (!crossGrad.error) {
        await pg.query(
          `delete from public.student_graduations
           where student_id = $1 and skip_reason = $2`,
          [tenantBStudent.rows[0].id, MARKER_GRADUATION]
        );
        throw new Error(
          "professor não devia gravar graduação de outra academia"
        );
      }
      console.log(
        `  Recusado INSERT graduação cross-tenant: ${crossGrad.error.message}`
      );

      await profGrad.auth.signOut();

      const userBGrad = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signInBGrad = await userBGrad.auth.signInWithPassword({
        email: EMAIL_B,
        password: passwordForSignIn,
      });
      if (signInBGrad.error) throw signInBGrad.error;

      const bGradRead = await userBGrad
        .from("student_graduations")
        .select("id")
        .eq("id", graduationId);
      if (bGradRead.error) {
        throw new Error(`B graduations: ${bGradRead.error.message}`);
      }
      if ((bGradRead.data || []).length !== 0) {
        throw new Error("B não devia ler graduação da conta A");
      }
      assertGraduationWriteRefused(
        await userBGrad
          .from("student_graduations")
          .update({ resulting_degree: 2 })
          .eq("id", graduationId)
          .select("id"),
        "UPDATE graduação cross-tenant"
      );
      assertGraduationWriteRefused(
        await userBGrad
          .from("student_graduations")
          .delete()
          .eq("id", graduationId)
          .select("id"),
        "DELETE graduação cross-tenant"
      );
      await userBGrad.auth.signOut();

      const afterCross = await pg.query(
        `select resulting_degree from public.student_graduations
         where id = $1 and skip_reason = $2`,
        [graduationId, MARKER_GRADUATION]
      );
      if (
        afterCross.rows.length !== 1 ||
        Number(afterCross.rows[0].resulting_degree) !== 1
      ) {
        throw new Error("graduação fixture alterada por outra academia");
      }

      if (studentFixture) {
        const studentGrad = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const signInStudentGrad = await studentGrad.auth.signInWithPassword({
          email: studentFixture.email,
          password: passwordForSignIn,
        });
        if (signInStudentGrad.error) throw signInStudentGrad.error;

        const alunoRead = await studentGrad
          .from("student_graduations")
          .select("id");
        if (alunoRead.error) {
          throw new Error(`aluno graduations: ${alunoRead.error.message}`);
        }
        if ((alunoRead.data || []).length !== 0) {
          throw new Error(
            `aluno devia ver 0 graduações, viu ${(alunoRead.data || []).length}`
          );
        }

        const alunoInsert = await studentGrad.from("student_graduations").insert({
          ...graduationRow,
          graduated_at: "2099-02-15T15:00:00.000Z",
        });
        if (!alunoInsert.error) {
          await pg.query(
            `delete from public.student_graduations
             where student_id = $1 and skip_reason = $2 and graduated_at = '2099-02-15T15:00:00.000Z'`,
            [graduationStudentId, MARKER_GRADUATION]
          );
          throw new Error("aluno não devia criar graduação");
        }
        console.log(
          `  Recusado INSERT graduação (aluno): ${alunoInsert.error.message}`
        );

        assertGraduationWriteRefused(
          await studentGrad
            .from("student_graduations")
            .update({ resulting_degree: 2 })
            .eq("id", graduationId)
            .select("id, resulting_degree"),
          "UPDATE graduação (aluno)"
        );
        assertGraduationWriteRefused(
          await studentGrad
            .from("student_graduations")
            .delete()
            .eq("id", graduationId)
            .select("id"),
          "DELETE graduação (aluno)"
        );

        const afterAluno = await pg.query(
          `select resulting_degree from public.student_graduations
           where id = $1 and skip_reason = $2`,
          [graduationId, MARKER_GRADUATION]
        );
        if (
          afterAluno.rows.length !== 1 ||
          Number(afterAluno.rows[0].resulting_degree) !== 1
        ) {
          throw new Error("aluno alterou a graduação fixture");
        }

        await studentGrad.auth.signOut();
      } else {
        console.log(
          "  [Opcional] sem fixture student — testes de aluno em graduações omitidos."
        );
      }

      await pg.query(
        `delete from public.student_graduations
         where id = $1 and skip_reason = $2`,
        [graduationId, MARKER_GRADUATION]
      );
    }

    if (passwordForSignIn) {
      console.log(", Planos comerciais: professor grava, aluno não lê nem grava ,");

      const LINK_START = "2099-01-01";
      const LINK_END = "2099-01-02";
      const PLAN_KINDS = ["baby", "kids_1", "kids_2", "adult"];
      const PLAN_PRICE = 22200;

      const assertCommercialWriteRefused = (result, label) => {
        if (result.error) {
          console.log(`  Recusado ${label}: ${result.error.message}`);
          return;
        }
        if ((result.data || []).length > 0) {
          throw new Error(`${label} não devia alterar plano comercial nem vínculo`);
        }
      };

      const isUniqueViolation = (error) =>
        error?.code === "23505" ||
        /duplicate key|plans_account_kind_unique/i.test(error?.message || "");

      const deleteSentinelLinks = (accountId) =>
        pg.query(
          `delete from public.student_plans sp
           using public.students s
           where sp.student_id = s.id
             and s.account_id = $1
             and s.full_name like 'RLS-V-%'
             and sp.started_at = $2
             and sp.ended_at = $3`,
          [accountId, LINK_START, LINK_END]
        );

      const signIn = async (email) => {
        const client = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const signed = await client.auth.signInWithPassword({
          email,
          password: passwordForSignIn,
        });
        if (signed.error) throw signed.error;
        return client;
      };

      const attemptAlunoPlanInsert = async (client, kind, strictUnique) => {
        const result = await client.from("plans").insert({
          account_id: tenantA.accountId,
          kind,
          name: MARKER_PLAN,
          price_cents: 1,
          active: false,
        });
        if (!result.error) {
          await pg.query(
            `delete from public.plans
             where account_id = $1 and name = $2 and kind = $3::public.plan_kind
               and price_cents = 1`,
            [tenantA.accountId, MARKER_PLAN, kind]
          );
          throw new Error("aluno não devia criar plano comercial");
        }
        if (strictUnique && isUniqueViolation(result.error)) {
          throw new Error(
            "INSERT de plano do aluno falhou por unicidade, não por recusa de acesso"
          );
        }
        console.log(`  Recusado INSERT plano (aluno): ${result.error.message}`);
      };

      await deleteSentinelLinks(tenantA.accountId);
      await deleteSentinelLinks(tenantB.accountId);

      const planStudentName = studentFixture ? MARKER_STUDENT : "RLS-V-A";
      const planStudent = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [tenantA.accountId, planStudentName]
      );
      if (!planStudent.rows.length) {
        throw new Error(`Fixture de plano sem aluno ${planStudentName}`);
      }
      const planStudentId = planStudent.rows[0].id;

      const tenantBStudent = await pg.query(
        `select id from public.students where account_id = $1 and full_name = $2`,
        [tenantB.accountId, "RLS-V-B"]
      );
      if (!tenantBStudent.rows.length) {
        throw new Error("Fixture RLS-V-B ausente para isolamento de plano");
      }
      const tenantBStudentId = tenantBStudent.rows[0].id;

      const existingPlans = await pg.query(
        `select id, kind::text as kind, name, price_cents
         from public.plans where account_id = $1`,
        [tenantA.accountId]
      );
      const markerPlan = existingPlans.rows.find((row) => row.name === MARKER_PLAN);
      const usedKinds = new Set(existingPlans.rows.map((row) => row.kind));
      const freeKinds = PLAN_KINDS.filter((kind) => !usedKinds.has(kind));

      let planId = null;
      let vinculoId = null;
      let insertedFixture = false;
      let priceRestore = null;
      let alunoPlanInsertChecked = false;

      const assertFixtureUntouched = async (label) => {
        const planRow = await pg.query(
          `select price_cents from public.plans where id = $1 and name = $2`,
          [planId, MARKER_PLAN]
        );
        if (
          planRow.rows.length !== 1 ||
          Number(planRow.rows[0].price_cents) !== PLAN_PRICE
        ) {
          throw new Error(`${label}: plano fixture alterado`);
        }
        const linkRow = await pg.query(
          `select custom_price_cents, due_day from public.student_plans
           where id = $1 and started_at = $2 and ended_at = $3`,
          [vinculoId, LINK_START, LINK_END]
        );
        if (
          linkRow.rows.length !== 1 ||
          Number(linkRow.rows[0].custom_price_cents) !== 8800 ||
          Number(linkRow.rows[0].due_day) !== 12
        ) {
          throw new Error(`${label}: vínculo fixture alterado`);
        }
      };

      try {
        let professorInsertKind = null;
        if (markerPlan) {
          planId = markerPlan.id;
          priceRestore = {
            id: markerPlan.id,
            name: markerPlan.name,
            price_cents: markerPlan.price_cents,
          };
        } else if (freeKinds.length >= 1) {
          professorInsertKind = freeKinds[0];
        } else {
          const unlinked = await pg.query(
            `select p.id, p.name, p.price_cents
             from public.plans p
             where p.account_id = $1
               and not exists (
                 select 1 from public.student_plans sp where sp.plan_id = p.id
               )
             order by case p.kind when 'baby' then 0 else 1 end
             limit 1`,
            [tenantA.accountId]
          );
          const borrow =
            unlinked.rows[0] ||
            existingPlans.rows.find((row) => row.kind === "baby") ||
            existingPlans.rows[0];
          if (!borrow) {
            throw new Error("Fixture de plano comercial indisponível na conta de teste");
          }
          priceRestore = {
            id: borrow.id,
            name: borrow.name,
            price_cents: borrow.price_cents,
          };
          planId = borrow.id;
        }

        const alunoInsertKind =
          studentFixture && freeKinds.length >= 2
            ? freeKinds[1]
            : studentFixture && markerPlan && freeKinds.length >= 1
              ? freeKinds[0]
              : null;
        const alunoInsertKindEarly =
          studentFixture && !markerPlan && freeKinds.length === 1
            ? freeKinds[0]
            : null;

        if (alunoInsertKindEarly) {
          const studentEarly = await signIn(studentFixture.email);
          try {
            await attemptAlunoPlanInsert(studentEarly, alunoInsertKindEarly, true);
            alunoPlanInsertChecked = true;
          } finally {
            await studentEarly.auth.signOut();
          }
        }

        const profPlan = await signIn(EMAIL_A);

        if (professorInsertKind) {
          const insertedPlan = await profPlan
            .from("plans")
            .insert({
              account_id: tenantA.accountId,
              kind: professorInsertKind,
              name: MARKER_PLAN,
              price_cents: 11100,
              active: true,
            })
            .select("id, price_cents")
            .single();
          if (insertedPlan.error) {
            throw new Error(
              `professor insert plano comercial: ${insertedPlan.error.message}`
            );
          }
          planId = insertedPlan.data.id;
          insertedFixture = true;
        }

        const planPatch = priceRestore
          ? { name: MARKER_PLAN, price_cents: PLAN_PRICE }
          : { price_cents: PLAN_PRICE };
        const priced = await profPlan
          .from("plans")
          .update(planPatch)
          .eq("id", planId)
          .select("id, name, price_cents")
          .single();
        if (priced.error) {
          throw new Error(
            `professor actualizar plano comercial: ${priced.error.message}`
          );
        }
        if (
          priced.data?.name !== MARKER_PLAN ||
          Number(priced.data?.price_cents) !== PLAN_PRICE
        ) {
          throw new Error("professor não actualizou o plano comercial fixture");
        }

        const insertedLink = await profPlan
          .from("student_plans")
          .insert({
            student_id: planStudentId,
            plan_id: planId,
            custom_price_cents: 9900,
            due_day: 10,
            started_at: LINK_START,
            ended_at: LINK_END,
          })
          .select("id, custom_price_cents, due_day")
          .single();
        if (insertedLink.error) {
          throw new Error(
            `professor insert vínculo: ${insertedLink.error.message}`
          );
        }
        vinculoId = insertedLink.data.id;

        const pricedLink = await profPlan
          .from("student_plans")
          .update({ custom_price_cents: 8800, due_day: 12 })
          .eq("id", vinculoId)
          .select("id, custom_price_cents, due_day")
          .single();
        if (pricedLink.error) {
          throw new Error(
            `professor actualizar vínculo: ${pricedLink.error.message}`
          );
        }
        if (
          Number(pricedLink.data?.custom_price_cents) !== 8800 ||
          Number(pricedLink.data?.due_day) !== 12
        ) {
          throw new Error("professor não actualizou o vínculo fixture");
        }

        const crossPlan = await profPlan.from("plans").insert({
          account_id: tenantB.accountId,
          kind: "baby",
          name: MARKER_PLAN,
          price_cents: 33300,
          active: false,
        });
        if (!crossPlan.error) {
          await pg.query(
            `delete from public.plans
             where account_id = $1 and name = $2 and price_cents = 33300`,
            [tenantB.accountId, MARKER_PLAN]
          );
          throw new Error("professor não devia gravar plano de outra academia");
        }
        console.log(
          `  Recusado INSERT plano cross-tenant: ${crossPlan.error.message}`
        );

        const crossLink = await profPlan.from("student_plans").insert({
          student_id: tenantBStudentId,
          plan_id: planId,
          custom_price_cents: 9900,
          due_day: 10,
          started_at: LINK_START,
          ended_at: LINK_END,
        });
        if (!crossLink.error) {
          await pg.query(
            `delete from public.student_plans
             where student_id = $1 and started_at = $2 and ended_at = $3`,
            [tenantBStudentId, LINK_START, LINK_END]
          );
          throw new Error("professor não devia gravar vínculo de outra academia");
        }
        console.log(
          `  Recusado INSERT vínculo cross-tenant: ${crossLink.error.message}`
        );

        await profPlan.auth.signOut();

        const userBPlan = await signIn(EMAIL_B);
        const bPlanRead = await userBPlan
          .from("plans")
          .select("id")
          .eq("id", planId);
        if (bPlanRead.error) {
          throw new Error(`B plans: ${bPlanRead.error.message}`);
        }
        if ((bPlanRead.data || []).length !== 0) {
          throw new Error("B não devia ler plano comercial da conta A");
        }
        assertCommercialWriteRefused(
          await userBPlan
            .from("plans")
            .update({ price_cents: 1 })
            .eq("id", planId)
            .select("id"),
          "UPDATE plano cross-tenant"
        );
        assertCommercialWriteRefused(
          await userBPlan.from("plans").delete().eq("id", planId).select("id"),
          "DELETE plano cross-tenant"
        );
        const bLinkRead = await userBPlan
          .from("student_plans")
          .select("id")
          .eq("id", vinculoId);
        if (bLinkRead.error) {
          throw new Error(`B student_plans: ${bLinkRead.error.message}`);
        }
        if ((bLinkRead.data || []).length !== 0) {
          throw new Error("B não devia ler vínculo da conta A");
        }
        assertCommercialWriteRefused(
          await userBPlan
            .from("student_plans")
            .update({ custom_price_cents: 1, due_day: 1 })
            .eq("id", vinculoId)
            .select("id"),
          "UPDATE vínculo cross-tenant"
        );
        assertCommercialWriteRefused(
          await userBPlan
            .from("student_plans")
            .delete()
            .eq("id", vinculoId)
            .select("id"),
          "DELETE vínculo cross-tenant"
        );
        await userBPlan.auth.signOut();
        await assertFixtureUntouched("outra academia");

        if (studentFixture) {
          const studentPlan = await signIn(studentFixture.email);
          const alunoPlans = await studentPlan.from("plans").select("id");
          if (alunoPlans.error) {
            throw new Error(`aluno plans: ${alunoPlans.error.message}`);
          }
          if ((alunoPlans.data || []).length !== 0) {
            throw new Error(
              `aluno devia ver 0 planos comerciais, viu ${(alunoPlans.data || []).length}`
            );
          }
          const alunoLinks = await studentPlan.from("student_plans").select("id");
          if (alunoLinks.error) {
            throw new Error(`aluno student_plans: ${alunoLinks.error.message}`);
          }
          if ((alunoLinks.data || []).length !== 0) {
            throw new Error(
              `aluno devia ver 0 vínculos, viu ${(alunoLinks.data || []).length}`
            );
          }

          if (!alunoPlanInsertChecked) {
            await attemptAlunoPlanInsert(
              studentPlan,
              alunoInsertKind || "adult",
              Boolean(alunoInsertKind)
            );
          }

          assertCommercialWriteRefused(
            await studentPlan
              .from("plans")
              .update({ price_cents: 1 })
              .eq("id", planId)
              .select("id, price_cents"),
            "UPDATE plano (aluno)"
          );
          assertCommercialWriteRefused(
            await studentPlan.from("plans").delete().eq("id", planId).select("id"),
            "DELETE plano (aluno)"
          );

          const alunoLinkInsert = await studentPlan.from("student_plans").insert({
            student_id: planStudentId,
            plan_id: planId,
            custom_price_cents: 1,
            due_day: 3,
            started_at: LINK_START,
            ended_at: LINK_END,
          });
          if (!alunoLinkInsert.error) {
            await pg.query(
              `delete from public.student_plans
               where student_id = $1 and plan_id = $2 and custom_price_cents = 1
                 and started_at = $3 and ended_at = $4`,
              [planStudentId, planId, LINK_START, LINK_END]
            );
            throw new Error("aluno não devia criar vínculo");
          }
          console.log(
            `  Recusado INSERT vínculo (aluno): ${alunoLinkInsert.error.message}`
          );

          assertCommercialWriteRefused(
            await studentPlan
              .from("student_plans")
              .update({ custom_price_cents: 1, due_day: 4 })
              .eq("id", vinculoId)
              .select("id, custom_price_cents, due_day"),
            "UPDATE vínculo (aluno)"
          );
          assertCommercialWriteRefused(
            await studentPlan
              .from("student_plans")
              .delete()
              .eq("id", vinculoId)
              .select("id"),
            "DELETE vínculo (aluno)"
          );

          await assertFixtureUntouched("aluno");
          await studentPlan.auth.signOut();
        } else {
          console.log(
            "  [Opcional] sem fixture student — testes de aluno em planos comerciais omitidos."
          );
        }
      } finally {
        await deleteSentinelLinks(tenantA.accountId);
        await deleteSentinelLinks(tenantB.accountId);
        if (insertedFixture && planId) {
          await pg.query(
            `delete from public.plans where id = $1 and name = $2`,
            [planId, MARKER_PLAN]
          );
        }
        if (priceRestore) {
          await pg.query(
            `update public.plans set name = $2, price_cents = $3 where id = $1`,
            [priceRestore.id, priceRestore.name, priceRestore.price_cents]
          );
        }
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
