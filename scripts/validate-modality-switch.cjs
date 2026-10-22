/** #37: academia vazia, bloqueios e corrida real. Só loopback e banco _test. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { Client } = require("pg");

const connectionString = process.env.CASCA_TEST_DATABASE_URL;
if (!connectionString) throw new Error("Defina CASCA_TEST_DATABASE_URL local.");
const target = new URL(connectionString);
if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) || !target.pathname.endsWith("_test")) {
  throw new Error("Apenas loopback e banco _test.");
}

const admin = new Client({ connectionString });
const left = new Client({ connectionString });
const right = new Client({ connectionString });

function readMigration(name) {
  return fs.readFileSync(path.join(__dirname, "../db/migrations", name), "utf8");
}

async function asUser(db, uid) {
  await db.query("RESET ROLE");
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [uid]);
  await db.query("SET LOCAL ROLE authenticated");
}

async function rejected(db, sql, args, code) {
  await db.query("SAVEPOINT invalid");
  try {
    await assert.rejects(db.query(sql, args), (error) => error.code === code);
  } finally {
    await db.query("ROLLBACK TO SAVEPOINT invalid");
  }
}

async function academy(modality = "jiu_jitsu") {
  await admin.query("RESET ROLE");
  const account = randomUUID();
  const user = randomUUID();
  await admin.query("INSERT INTO public.accounts(id, name, modality) VALUES ($1, 'Troca', $2)", [account, modality]);
  await admin.query("INSERT INTO auth.users(id) VALUES ($1)", [user]);
  const { rows } = await admin.query(
    "INSERT INTO public.profiles(user_id, account_id, display_name, role) VALUES ($1, $2, 'Professor', 'professor') RETURNING id",
    [user, account],
  );
  return { account, user, profile: rows[0].id };
}

async function waitUntilBlocked(blockedPid, blockerPid) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const { rows } = await admin.query("SELECT $1::int = ANY(pg_blocking_pids($2::int)) AS blocked", [
      blockerPid,
      blockedPid,
    ]);
    if (rows[0].blocked) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("A conexão esperada não ficou bloqueada pelo lock da academia.");
}

async function blockers() {
  const removed = await academy("boxing");
  await admin.query(
    "INSERT INTO public.students(account_id, status, kind, full_name, birth_date, removed_at) VALUES ($1, 'inactive', 'adult', 'Removido', '2000-01-01', now())",
    [removed.account],
  );
  await asUser(admin, removed.user);
  await rejected(admin, "SELECT public.switch_academy_modality('judo')", [], "23514");
  await admin.query("RESET ROLE");
  assert.equal((await admin.query("SELECT modality FROM public.accounts WHERE id = $1", [removed.account])).rows[0].modality, "boxing");

  const klass = await academy();
  await admin.query(
    "INSERT INTO public.classes(account_id, name, kind, modality, instructor_profile_id) VALUES ($1, 'Noite', 'adult', 'jiu_jitsu', $2)",
    [klass.account, klass.profile],
  );
  await asUser(admin, klass.user);
  await rejected(admin, "SELECT public.switch_academy_modality('judo')", [], "23514");

  const session = await academy();
  const { rows: classes } = await admin.query(
    "INSERT INTO public.classes(account_id, name, kind, modality, instructor_profile_id) VALUES ($1, 'Manhã', 'adult', 'jiu_jitsu', $2) RETURNING id",
    [session.account, session.profile],
  );
  await admin.query(
    "INSERT INTO public.class_sessions(account_id, class_id, session_date, start_time, end_time) VALUES ($1, $2, '2026-01-06', '19:00', '20:00')",
    [session.account, classes[0].id],
  );
  await asUser(admin, session.user);
  await rejected(admin, "SELECT public.switch_academy_modality('muay_thai')", [], "23514");

  const payment = await academy("boxing");
  const { rows: students } = await admin.query(
    "INSERT INTO public.students(account_id, status, kind, full_name, birth_date) VALUES ($1, 'active', 'adult', 'Pagante', '2000-01-01') RETURNING id",
    [payment.account],
  );
  await admin.query(
    "INSERT INTO public.payments(student_id, reference_month, amount_cents) VALUES ($1, '2026-01-01', 15000)",
    [students[0].id],
  );
  await asUser(admin, payment.user);
  await rejected(admin, "SELECT public.switch_academy_modality('jiu_jitsu')", [], "23514");

  const document = await academy();
  await admin.query(
    "INSERT INTO public.generated_documents(account_id, type, payload_json) VALUES ($1, 'certificate', '{}')",
    [document.account],
  );
  await asUser(admin, document.user);
  await rejected(admin, "SELECT public.switch_academy_modality('boxing')", [], "23514");
  await admin.query("RESET ROLE");
}

async function race() {
  const held = await academy();
  const moving = await academy();
  try {
    await left.query("BEGIN");
    await left.query(
      "INSERT INTO public.classes(account_id, name, kind, modality, instructor_profile_id) VALUES ($1, 'Presa', 'adult', 'jiu_jitsu', $2)",
      [held.account, held.profile],
    );
    await right.query("BEGIN");
    await asUser(right, held.user);
    const waitingSwitch = right.query("SELECT public.switch_academy_modality('boxing')").then(
      () => ({ ok: true }),
      (error) => ({ ok: false, error }),
    );
    await waitUntilBlocked(right.processID, left.processID);
    await left.query("COMMIT");
    const switchResult = await waitingSwitch;
    assert.equal(switchResult.ok, false);
    assert.equal(switchResult.error.code, "23514");
    await right.query("ROLLBACK");
    const heldRow = await admin.query("SELECT modality FROM public.accounts WHERE id = $1", [held.account]);
    const heldClass = await admin.query("SELECT modality FROM public.classes WHERE account_id = $1", [held.account]);
    assert.equal(heldRow.rows[0].modality, "jiu_jitsu");
    assert.equal(heldClass.rows[0].modality, "jiu_jitsu");

    await left.query("BEGIN");
    await asUser(left, moving.user);
    await left.query("SELECT public.switch_academy_modality('boxing')");
    await right.query("BEGIN");
    const waitingInsert = right.query(
      "INSERT INTO public.classes(account_id, name, kind, modality, instructor_profile_id) VALUES ($1, 'Tardia', 'adult', 'jiu_jitsu', $2)",
      [moving.account, moving.profile],
    ).then(
      () => ({ ok: true }),
      (error) => ({ ok: false, error }),
    );
    await waitUntilBlocked(right.processID, left.processID);
    await left.query("COMMIT");
    const insertResult = await waitingInsert;
    assert.equal(insertResult.ok, false);
    assert.equal(insertResult.error.code, "23514");
    await right.query("ROLLBACK");
    const moved = await admin.query(
      "SELECT modality, (SELECT count(*)::int FROM public.classes WHERE account_id = $1) AS classes FROM public.accounts WHERE id = $1",
      [moving.account],
    );
    assert.equal(moved.rows[0].modality, "boxing");
    assert.equal(moved.rows[0].classes, 0);
  } finally {
    await admin.query("DELETE FROM public.accounts WHERE id = ANY($1::uuid[])", [[held.account, moving.account]]);
    await admin.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [[held.user, moving.user]]);
  }
}

async function main() {
  await Promise.all([admin.connect(), left.connect(), right.connect()]);
  const created = [];
  try {
    if (process.argv.includes("--apply-migration")) {
      await admin.query(readMigration("037_modality_classes_portal.sql"));
      await admin.query(readMigration("038_switch_academy_modality.sql"));
    }
    await admin.query("BEGIN");
    const empty = await academy();
    created.push(empty);
    await admin.query(
      "INSERT INTO public.plans(account_id, kind, name, price_cents) VALUES ($1, 'kids_1', 'Kids especial', 22222)",
      [empty.account],
    );
    await asUser(admin, empty.user);
    await admin.query("SELECT public.switch_academy_modality('boxing')");
    const after = await admin.query(
      "SELECT a.modality, p.name, p.price_cents, (SELECT count(*)::int FROM public.students s WHERE s.account_id = a.id) AS students FROM public.accounts a JOIN public.plans p ON p.account_id = a.id WHERE a.id = $1",
      [empty.account],
    );
    assert.equal(after.rows[0].modality, "boxing");
    assert.equal(after.rows[0].name, "Kids especial");
    assert.equal(Number(after.rows[0].price_cents), 22222);
    assert.equal(after.rows[0].students, 0);
    await rejected(admin, "UPDATE public.accounts SET modality = 'judo' WHERE id = $1", [empty.account], "42501");
    await rejected(admin, "SELECT public.switch_academy_modality('boxing')", [], "22023");
    await rejected(admin, "SELECT public.switch_academy_modality('karate')", [], "22023");

    const outsider = await academy("judo");
    created.push(outsider);
    await asUser(admin, outsider.user);
    await admin.query("SELECT public.switch_academy_modality('muay_thai')");
    await admin.query("RESET ROLE");
    assert.equal((await admin.query("SELECT modality FROM public.accounts WHERE id = $1", [empty.account])).rows[0].modality, "boxing");
    assert.equal((await admin.query("SELECT modality FROM public.accounts WHERE id = $1", [outsider.account])).rows[0].modality, "muay_thai");

    const studentUser = randomUUID();
    await admin.query("INSERT INTO auth.users(id) VALUES ($1)", [studentUser]);
    await admin.query(
      "INSERT INTO public.profiles(user_id, account_id, display_name, role) VALUES ($1, $2, 'Aluno', 'student')",
      [studentUser, empty.account],
    );
    await asUser(admin, studentUser);
    await rejected(admin, "SELECT public.switch_academy_modality('judo')", [], "42501");
    await admin.query("RESET ROLE");
    const stranger = randomUUID();
    await admin.query("INSERT INTO auth.users(id) VALUES ($1)", [stranger]);
    await asUser(admin, stranger);
    await rejected(admin, "SELECT public.switch_academy_modality('judo')", [], "42501");
    await admin.query("RESET ROLE");
    await blockers();
    await admin.query("ROLLBACK");

    await race();
    console.log("PASS: troca só na academia vazia; aluno removido, turma, aula, pagamento e documento bloqueiam; plano comercial permanece; corrida não grava turma no contexto errado.");
  } finally {
    await admin.query("ROLLBACK").catch(() => {});
    await left.query("ROLLBACK").catch(() => {});
    await right.query("ROLLBACK").catch(() => {});
    await Promise.all([admin.end(), left.end(), right.end()]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
