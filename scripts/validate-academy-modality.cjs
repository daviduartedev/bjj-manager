/**
 * Prova de compatibilidade #28 em Postgres DESCARTÁVEL. Nunca lê .env.
 * CASCA_TEST_DATABASE_URL deve apontar a loopback e banco terminado em _test.
 * --apply-migration aplica 031 dentro da transação de teste; tudo termina em rollback.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { Client } = require("pg");

const connectionString = process.env.CASCA_TEST_DATABASE_URL;
if (!connectionString) throw new Error("Defina CASCA_TEST_DATABASE_URL para um banco local descartável.");
const target = new URL(connectionString);
if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) || !target.pathname.endsWith("_test")) {
  throw new Error("Este validador só aceita loopback e banco terminado em _test.");
}

const db = new Client({ connectionString });
const accountA = randomUUID();
const accountB = randomUUID();
const userA = randomUUID();
const userB = randomUUID();
const newUser = randomUUID();
const legacyUser = randomUUID();
const metadataUser = randomUUID();

async function asUser(userId) {
  await db.query("RESET ROLE");
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [userId]);
  await db.query("SET LOCAL ROLE authenticated");
}

async function denied(sql, args = [], expectedCode = "42501") {
  await db.query("SAVEPOINT denied_operation");
  try {
    await assert.rejects(db.query(sql, args), (error) => error.code === expectedCode, `Operação deveria ser recusada: ${sql}`);
  } finally {
    await db.query("ROLLBACK TO SAVEPOINT denied_operation");
  }
}

async function snapshot() {
  const tables = ["accounts", "belts", "students", "student_graduations", "plans", "student_plans", "payments", "generated_documents"];
  const result = {};
  for (const table of tables) {
    const { rows } = await db.query(`SELECT to_jsonb(t) - 'modality' AS value FROM public.${table} t ORDER BY id`);
    result[table] = rows.map((row) => row.value);
  }
  return result;
}

async function main() {
  await db.connect();
  try {
    await db.query("BEGIN");
    await db.query("INSERT INTO auth.users(id) SELECT unnest($1::uuid[])", [[userA, userB, newUser, legacyUser, metadataUser]]);
    await db.query("INSERT INTO public.accounts(id, name) VALUES ($1, 'Academia teste A'), ($2, 'Academia teste B')", [accountA, accountB]);
    await db.query(`INSERT INTO public.profiles(user_id, account_id, display_name, role)
      VALUES ($1, $2, 'Professor A', 'professor'), ($3, $4, 'Professor B', 'professor')`, [userA, accountA, userB, accountB]);
    const { rows: [plan] } = await db.query(`INSERT INTO public.plans(account_id, kind, name, price_cents)
      VALUES ($1, 'adult', 'Plano personalizado', 19876) RETURNING id`, [accountA]);
    for (const kind of ["adult", "kids", "baby"]) {
      const slug = kind === "adult" ? "blue" : "gray_white";
      const { rows: [student] } = await db.query(`INSERT INTO public.students(account_id, kind, full_name, current_belt_id, current_degree, status, birth_date, academy_start_date)
        SELECT $1, $2::public.student_kind, $3, id, 1, 'active', '2000-01-01', '2020-02-03'
        FROM public.belts WHERE slug = $4 RETURNING id`, [accountA, kind, `Aluno teste ${kind}`, slug]);
      assert.ok(student, `Faixa de fixture não encontrada: ${slug}`);
      await db.query(`INSERT INTO public.student_graduations(student_id, resulting_belt_id, resulting_degree, graduated_at, weight_kg)
        SELECT id, current_belt_id, current_degree, '2025-04-05T12:00:00Z', 70.5 FROM public.students WHERE id=$1`, [student.id]);
      if (kind === "adult") {
        await db.query(`INSERT INTO public.student_plans(student_id, plan_id, due_day, custom_price_cents, started_at)
          VALUES ($1, $2, 12, 18765, '2025-04-01')`, [student.id, plan.id]);
        await db.query(`INSERT INTO public.payments(student_id, reference_month, amount_cents, status, paid_at)
          VALUES ($1, '2025-04-01', 18765, 'paid', '2025-04-12T12:00:00Z')`, [student.id]);
        await db.query(`INSERT INTO public.generated_documents(account_id, student_id, type, status, payload_json, pdf_path)
          VALUES ($1, $2, 'certificate', 'ready', '{"name":"Documento anterior","belt":"Azul"}', 'test/previous.pdf')`, [accountA, student.id]);
      }
    }
    // Intenção legada, inclusive nome e consumo, deve continuar válida no upgrade.
    await db.query("SET LOCAL ROLE service_role");
    await db.query("SELECT public.record_academy_registration($1, 'Academia legado', 'Professor legado')", [legacyUser]);
    await db.query("RESET ROLE");
    const before = await snapshot();
    if (process.argv.includes("--apply-migration")) {
      const migration = fs.readFileSync(path.join(__dirname, "../db/migrations/031_academy_modality.sql"), "utf8")
        .replace(/^BEGIN;\s*$/m, "").replace(/^COMMIT;\s*$/m, "");
      await db.query(migration);
      await db.query(migration); // Reaplicação aditiva não altera os dados.
    }
    assert.deepEqual(await snapshot(), before, "Upgrade deve preservar todos os campos anteriores");
    const { rows: accounts } = await db.query("SELECT modality FROM public.accounts");
    assert.ok(accounts.length >= 2);
    assert.ok(accounts.every((row) => row.modality === "jiu_jitsu"));
    assert.equal((await db.query("SELECT modality FROM public.academy_registration_intents WHERE user_id=$1", [legacyUser])).rows[0].modality, "jiu_jitsu");
    console.log("PASS: migração/reaplicação preservam JJ adulto/kids/baby, IDs, graus, datas, histórico, preços, vínculo, pagamento e documento");

    await db.query("SET LOCAL ROLE service_role");
    await db.query("SELECT public.record_academy_registration($1, 'Academia nova', 'Professora nova', 'jiu_jitsu')", [newUser]);
    await db.query("SELECT public.record_academy_registration($1, 'Nome ignorado', 'Nome ignorado', 'boxing')", [newUser]);
    await denied("SELECT public.record_academy_registration($1, 'Academia nova', 'Pessoa nova', 'invalid')", [metadataUser], "22023");
    await db.query("RESET ROLE");
    assert.equal((await db.query("SELECT modality FROM public.academy_registration_intents WHERE user_id=$1", [newUser])).rows[0].modality, "jiu_jitsu");
    await db.query("UPDATE auth.users SET email_confirmed_at=now(), raw_user_meta_data=$2::jsonb WHERE id=$1", [newUser, '{"modality":"boxing","role":"student"}']);
    await asUser(newUser);
    assert.equal((await db.query("SELECT public.provision_academy_for_current_user() AS result")).rows[0].result.outcome, "created");
    const { rows: [created] } = await db.query("SELECT id, name, modality FROM public.accounts");
    assert.equal(created.name, "Academia nova");
    assert.equal(created.modality, "jiu_jitsu");
    assert.equal((await db.query("SELECT public.provision_academy_for_current_user() AS result")).rows[0].result.outcome, "existing");
    assert.equal((await db.query("SELECT id FROM public.accounts")).rows[0].id, created.id);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.plans")).rows[0].n, 4);
    await denied("SELECT * FROM public.academy_registration_intents");
    await denied("SELECT public.record_academy_registration($1, 'Academia falsa', 'Pessoa falsa', 'jiu_jitsu')", [metadataUser]);
    await denied("UPDATE public.accounts SET modality='boxing' WHERE id=$1", [created.id]);
    console.log("PASS: intenção confiável imutável, confirmação/provisão idempotente, RPC e alteração direta protegidas");

    await db.query("RESET ROLE");
    await db.query("UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1", [legacyUser]);
    await asUser(legacyUser);
    assert.equal((await db.query("SELECT public.provision_academy_for_current_user() AS result")).rows[0].result.outcome, "created");
    assert.equal((await db.query("SELECT modality FROM public.accounts")).rows[0].modality, "jiu_jitsu");
    await db.query("RESET ROLE");
    await db.query("UPDATE auth.users SET email_confirmed_at=now(), raw_user_meta_data=$2::jsonb WHERE id=$1", [metadataUser, '{"role":"professor","modality":"judo"}']);
    await asUser(metadataUser);
    assert.equal((await db.query("SELECT public.provision_academy_for_current_user() AS result")).rows[0].result.outcome, "ineligible");
    console.log("PASS: intenção anterior continua provisionável; metadata sem intenção não concede academia");

    await asUser(userA);
    assert.deepEqual((await db.query("SELECT id FROM public.accounts")).rows.map((row) => row.id), [accountA]);
    assert.equal((await db.query("SELECT id FROM public.accounts WHERE id=$1", [accountB])).rowCount, 0);
    assert.equal((await db.query("UPDATE public.accounts SET name='Invadida' WHERE id=$1 RETURNING id", [accountB])).rowCount, 0);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.students")).rows[0].n, 3);
    await asUser(userB);
    assert.equal((await db.query("SELECT id FROM public.students")).rowCount, 0);
    assert.deepEqual((await db.query("SELECT id FROM public.accounts")).rows.map((row) => row.id), [accountB]);
    console.log("PASS: duas academias reais conhecidas isoladas por RLS em leitura e escrita");
  } finally {
    await db.query("ROLLBACK");
    await db.end();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
