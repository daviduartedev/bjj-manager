/**
 * Coloca current_degree = 0 em todos os alunos adultos (multi-tenant seguro).
 *
 * Por defeito restrito à conta do perfil OWNER_EMAIL (evita tocar outras contas no mesmo DB).
 * Para todas as contas: ALL_ACCOUNTS=1 (uso admin).
 *
 * Requer .env.local: DATABASE_URL
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

dotenv.config({ path: path.join(root, ".env.local"), quiet: true });
dotenv.config({ path: path.join(root, ".env"), quiet: true });

const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim() || "maikon@aslam.com.br";
const ALL_ACCOUNTS = process.env.ALL_ACCOUNTS === "1" || process.env.ALL_ACCOUNTS === "true";

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    console.error(`Falta ${name} no ambiente (.env.local).`);
    process.exit(2);
  }
  return v.trim();
}

async function main() {
  const databaseUrl = requireEnv("DATABASE_URL");
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    let accountFilter = "";
    const params = [];
    if (!ALL_ACCOUNTS) {
      params.push(OWNER_EMAIL);
      accountFilter = `AND account_id = (
        SELECT p.account_id FROM public.profiles p
        JOIN auth.users u ON u.id = p.user_id
        WHERE lower(u.email) = lower($1)
      )`;
    }

    const sql = `
      UPDATE public.students
      SET current_degree = 0, updated_at = now()
      WHERE kind = 'adult'::student_kind
      ${accountFilter}
    `;

    const res = await client.query(sql, params);
    console.log(
      ALL_ACCOUNTS
        ? `Actualizados ${res.rowCount} alunos adultos (todas as contas).`
        : `Actualizados ${res.rowCount} alunos adultos (conta de ${OWNER_EMAIL}).`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
