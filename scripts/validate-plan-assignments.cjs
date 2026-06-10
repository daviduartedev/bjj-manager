/**
 * Guardrail: migrations não podem mass-reassign student_plans entre kids_1 ↔ kids_2.
 * Opcionalmente reporta (e valida mínimo) COUNT de vínculos abertos em kids_2.
 *
 * Usage:
 *   pnpm db:validate-plans
 *   pnpm db:validate-plans --static-only
 *
 * Env:
 *   DATABASE_URL (ou aliases usados em apply-db.cjs)
 *   PLAN_GUARD_KIDS2_MIN_COUNT — falha se COUNT kids_2 abertos < valor
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const root = path.join(__dirname, "..");
const migrationsDir = path.join(root, "db", "migrations");

const FORBIDDEN_MASS_REASSIGN =
  /UPDATE\s+public\.student_plans[\s\S]*INSERT\s+INTO\s+public\.student_plans[\s\S]*kids_2[\s\S]*kids_1/i;

function loadEnv() {
  const envLocal = path.join(root, ".env.local");
  const envFile = path.join(root, ".env");
  require("dotenv").config({ path: envFile, quiet: true });
  require("dotenv").config({ path: envLocal, quiet: true });
}

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    ""
  ).trim();
}

function validateMigrationFilesStatic() {
  if (!fs.existsSync(migrationsDir)) {
    console.log("validate-plan-assignments: sem pasta db/migrations — OK");
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const violations = [];

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8");
    if (FORBIDDEN_MASS_REASSIGN.test(sql)) {
      violations.push(file);
    }
  }

  if (violations.length) {
    console.error(
      "validate-plan-assignments: FALHA — migration(s) com mass-reassign proibido kids_2→kids_1:\n" +
        violations.map((f) => `  - db/migrations/${f}`).join("\n") +
        "\nVer docs/database/migrations-policy.md"
    );
    process.exit(1);
  }

  console.log(
    `validate-plan-assignments: análise estática OK (${files.length} migration(s))`
  );
}

async function validateDbSnapshot() {
  const connectionString = getConnectionString();
  if (!connectionString || connectionString.includes("YOUR_DB_PASSWORD")) {
    console.log(
      "validate-plan-assignments: DATABASE_URL ausente — skip snapshot DB"
    );
    return;
  }

  const client = new Client({
    connectionString,
    ssl:
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1")
        ? undefined
        : { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const result = await client.query(`
      SELECT COUNT(*)::int AS kids_2_abertos
      FROM public.student_plans sp
      INNER JOIN public.plans p ON p.id = sp.plan_id
      WHERE sp.ended_at IS NULL
        AND p.kind = 'kids_2'
    `);
    const count = result.rows[0]?.kids_2_abertos ?? 0;
    console.log(`validate-plan-assignments: vínculos abertos kids_2 = ${count}`);

    const minRaw = process.env.PLAN_GUARD_KIDS2_MIN_COUNT;
    if (minRaw !== undefined && String(minRaw).trim() !== "") {
      const min = Number(minRaw);
      if (!Number.isFinite(min)) {
        console.error(
          "validate-plan-assignments: PLAN_GUARD_KIDS2_MIN_COUNT inválido"
        );
        process.exit(1);
      }
      if (count < min) {
        console.error(
          `validate-plan-assignments: FALHA — kids_2 abertos (${count}) < mínimo (${min})`
        );
        process.exit(1);
      }
      console.log(
        `validate-plan-assignments: mínimo kids_2 (${min}) satisfeito`
      );
    }
  } finally {
    await client.end();
  }
}

async function main() {
  loadEnv();
  const staticOnly = process.argv.includes("--static-only");

  validateMigrationFilesStatic();

  if (!staticOnly) {
    await validateDbSnapshot();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { validateMigrationFilesStatic, validateDbSnapshot, main };
