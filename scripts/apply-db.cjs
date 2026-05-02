/**
 * Applies db/schema.sql, db/seed.sql, then db/policies.sql using Postgres wire protocol.
 * Set DATABASE_URL (Supabase: Project Settings → Database → URI, port 5432).
 *
 * Usage: pnpm db:apply
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const envLocal = path.join(__dirname, "..", ".env.local");
const envFile = path.join(__dirname, "..", ".env");
require("dotenv").config({ path: envLocal, quiet: true });
require("dotenv").config({ path: envFile, quiet: true });

const root = path.join(__dirname, "..");

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL;

  if (!connectionString || !String(connectionString).trim()) {
    console.error(
      "Não há connection string do Postgres. Em .env.local, descomenta e preenche uma destas variáveis:\n" +
        "  DATABASE_URL (recomendado) , Supabase → Project Settings → Database → Connection string (URI, modo direct ou session)\n" +
        "  Alternativas: SUPABASE_DB_URL, POSTGRES_URL, SUPABASE_DATABASE_URL\n" +
        "Nota: é a password da **base de dados**, não a anon key nem a service_role key."
    );
    process.exit(2);
  }

  if (connectionString.includes("YOUR_DB_PASSWORD")) {
    console.error(
      "Substitui YOUR_DB_PASSWORD em DATABASE_URL pela password real (Database settings no Supabase)."
    );
    process.exit(2);
  }

  const schemaSql = fs.readFileSync(path.join(root, "db", "schema.sql"), "utf8");
  const seedSql = fs.readFileSync(path.join(root, "db", "seed.sql"), "utf8");
  const policiesSql = fs.readFileSync(path.join(root, "db", "policies.sql"), "utf8");

  const migrationsDir = path.join(root, "db", "migrations");
  const migrationFiles = fs.existsSync(migrationsDir)
    ? fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort()
    : [];

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
    await client.query(schemaSql);
    await client.query(seedSql);
    for (const mf of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, mf), "utf8");
      await client.query(sql);
      console.log(`  migration ok: ${mf}`);
    }
    await client.query(policiesSql);

    const belts = await client.query(
      "select count(*)::int as n from public.belts"
    );
    const plans = await client.query(
      "select count(*)::int as n from public.plans"
    );
    const accounts = await client.query(
      "select count(*)::int as n from public.accounts"
    );

    console.log("OK , schema + seed + migrations + policies (RLS) aplicados.");
    console.log(`  accounts: ${accounts.rows[0].n}`);
    console.log(`  belts: ${belts.rows[0].n}`);
    console.log(`  plans: ${plans.rows[0].n}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
