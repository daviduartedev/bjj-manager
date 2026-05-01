/**
 * Importa alunos + vínculo de plano + pagamentos mensais a partir de
 * `scripts/data/aslam-kids.tsv` e `scripts/data/aslam-adults.tsv` (planilha Aslam).
 *
 * Associa tudo à conta do perfil com e-mail OWNER_EMAIL (por defeito maikon@aslam.com.br).
 *
 * Requer .env.local: DATABASE_URL
 *
 * ATENÇÃO: por defeito REMOVE todos os alunos da conta (e dependentes) antes de inserir.
 * Uso: pnpm import:sheet
 *
 * Opções via ambiente:
 *   OWNER_EMAIL — email do professor (default maikon@aslam.com.br)
 *   IMPORT_YEAR — ano dos meses de referência (default 2026)
 *   IMPORT_CURRENT_MONTH — mês "corrente" para Pendente vs Não pago (1–12, default 5 = maio)
 *   DRY_RUN=1 — apenas valida TSV e resolve belts/planos, não escreve
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

dotenv.config({ path: path.join(root, ".env.local"), quiet: true });
dotenv.config({ path: path.join(root, ".env"), quiet: true });

const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim() || "maikon@aslam.com.br";
const IMPORT_YEAR = Number(process.env.IMPORT_YEAR || "2026");
const IMPORT_CURRENT_MONTH = Number(process.env.IMPORT_CURRENT_MONTH || "5");
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    console.error(`Falta ${name} no ambiente (.env.local).`);
    process.exit(2);
  }
  return v.trim();
}

function parseTsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cols = line.split("\t");
    const o = {};
    header.forEach((h, i) => {
      o[h] = cols[i] ?? "";
    });
    return o;
  });
}

/** Aceita 0/1, TRUE/FALSE (planilha exportada). */
function parseMonthFlag(value) {
  if (value === true || value === 1) return true;
  const s = String(value ?? "")
    .trim()
    .toUpperCase();
  return s === "TRUE" || s === "1";
}

function parseFeeCents(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return 0;
  const digits = s.replace(/\D/g, "");
  if (digits) return parseInt(digits, 10);
  return parseInt(s, 10) || 0;
}

/** TSV grava centavos (12000). Se 0 e não isento/bolsa/cancelado → mensalidade típica da conta. */
function effectiveFeeCents(rawField, studentKind, statusNorm) {
  const exempt = ["BOLSISTA", "ISENTO", "CANCELADO"].includes(statusNorm);
  const n = parseFeeCents(rawField);
  if (n > 0) return n;
  if (exempt) return 0;
  return studentKind === "adult" ? 12000 : 10000;
}

/** Importação: todos sem graus até dados refinados (preta incluída). */
function degreeForImport() {
  return 0;
}

function shouldInsertGraduationFromSheet(beltSlug, graduatedAtIso) {
  if (!beltSlug || beltSlug === "white") return false;
  return Boolean(String(graduatedAtIso ?? "").trim());
}

function monthRef(year, month1to12) {
  return `${year}-${String(month1to12).padStart(2, "0")}-01`;
}

/**
 * @param {object} p
 * @param {number} monthN - 1..12
 * @param {boolean} checked
 */
function paymentStatusForMonth(p, monthN, checked) {
  const st = p.status?.trim().toUpperCase().replace(/\s+/g, "_");
  if (st === "CANCELADO") return null;
  if (st === "BOLSISTA") return "scholarship";
  if (st === "ISENTO") return "other";

  if (checked) return "paid";

  if (monthN < IMPORT_CURRENT_MONTH) return "unpaid";
  if (monthN === IMPORT_CURRENT_MONTH) return "pending";
  return "pending";
}

async function ensureDefaultPlans(client, accountId) {
  const kinds = [
    ["kids_1", "Kid 1", 10000],
    ["kids_2", "Juvenil", 12000],
    ["adult", "Adulto", 12000],
  ];
  for (const [kind, name, price] of kinds) {
    await client.query(
      `INSERT INTO public.plans (account_id, kind, name, price_cents, active)
       VALUES ($1, $2::plan_kind, $3, $4, true)
       ON CONFLICT ON CONSTRAINT plans_account_kind_unique DO NOTHING`,
      [accountId, kind, name, price],
    );
  }
  const r = await client.query(
    `SELECT id, kind::text AS kind FROM public.plans WHERE account_id = $1`,
    [accountId],
  );
  const byKind = {};
  for (const row of r.rows) byKind[row.kind] = row.id;
  return byKind;
}

/**
 * O seed usa `ON CONFLICT (slug)` com o mesmo slug `white` para adult e kids;
 * em muitas bases só existe uma linha `white`. Garantimos alias estável para kids.
 */
async function ensureKidsWhiteAlias(client) {
  await client.query(`
    INSERT INTO public.belts (kind, slug, ordinal)
    VALUES ('kids', 'white_kids', 1)
    ON CONFLICT (slug) DO NOTHING
  `);
}

/**
 * Resolve faixa por tipo + slug; tenta alias `white_kids` para BRANCA kids.
 */
async function resolveBeltId(client, studentKind, slug) {
  const trySlugs =
    studentKind === "kids" && slug === "white" ? ["white", "white_kids"] : [slug];
  for (const s of trySlugs) {
    const r = await client.query(
      `SELECT id FROM public.belts WHERE kind = $1::belt_kind AND slug = $2`,
      [studentKind, s],
    );
    if (r.rows.length) return r.rows[0].id;
  }
  throw new Error(`Faixa não encontrada no catálogo: ${studentKind} / ${slug}`);
}

async function main() {
  const databaseUrl = requireEnv("DATABASE_URL");
  const kidsPath = path.join(__dirname, "data", "aslam-kids.tsv");
  const adultsPath = path.join(__dirname, "data", "aslam-adults.tsv");

  const kidsRows = parseTsv(kidsPath);
  const adultRows = parseTsv(adultsPath);

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const accRes = await client.query(
      `SELECT p.account_id
       FROM public.profiles p
       JOIN auth.users u ON u.id = p.user_id
       WHERE lower(u.email) = lower($1)`,
      [OWNER_EMAIL],
    );
    if (!accRes.rows.length) {
      console.error(`Nenhum perfil para email ${OWNER_EMAIL}.`);
      process.exit(2);
    }
    const accountId = accRes.rows[0].account_id;
    console.log(`Conta: ${accountId} (${OWNER_EMAIL})`);

    if (DRY_RUN) {
      console.log(`DRY_RUN: ${kidsRows.length} kids, ${adultRows.length} adults — sem escrita.`);
      process.exit(0);
    }

    await ensureKidsWhiteAlias(client);
    const planIds = await ensureDefaultPlans(client, accountId);
    if (!planIds.kids_1 || !planIds.adult) {
      console.error("Planos kids_1 ou adult em falta após ensureDefaultPlans.");
      process.exit(2);
    }

    const kidPlan = planIds.kids_1;
    const adultPlan = planIds.adult;

    await client.query("BEGIN");

    const del = await client.query(
      `DELETE FROM public.students WHERE account_id = $1 RETURNING id`,
      [accountId],
    );
    console.log(`Removidos ${del.rowCount} alunos existentes da conta.`);

    let inserted = 0;

    async function insertStudentFlow(row, studentKind, planId, monthFlags, beltSlug) {
      const stRaw = row.status?.trim().toUpperCase().replace(/\s+/g, "_");
      const studentStatus = stRaw === "CANCELADO" ? "inactive" : "active";
      const startYear = parseInt(row.startYear, 10) || IMPORT_YEAR;
      const feeCents = effectiveFeeCents(row.fee_cents, studentKind, stRaw);
      const currentDeg = degreeForImport();

      const beltId = await resolveBeltId(client, studentKind, beltSlug);
      const sidRes = await client.query(
        `INSERT INTO public.students (
           account_id, kind, full_name, current_belt_id, current_degree, status,
           academy_start_date
         ) VALUES ($1, $2::student_kind, $3, $4, $5, $6::student_status, $7)
         RETURNING id`,
        [
          accountId,
          studentKind,
          row.name.trim(),
          beltId,
          currentDeg,
          studentStatus,
          `${startYear}-01-01`,
        ],
      );
      const studentId = sidRes.rows[0].id;

      const gradIso = String(row.graduated_at ?? "").trim();
      if (
        studentStatus === "active" &&
        shouldInsertGraduationFromSheet(beltSlug, gradIso)
      ) {
        await client.query(
          `INSERT INTO public.student_graduations (
             student_id, resulting_belt_id, resulting_degree, graduated_at, was_skip
           ) VALUES ($1, $2, $3, ($4::date), false)`,
          [studentId, beltId, 0, gradIso],
        );
      }

      const custom = feeCents;
      await client.query(
        `INSERT INTO public.student_plans (student_id, plan_id, custom_price_cents, due_day, started_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [studentId, planId, custom, 10, `${IMPORT_YEAR}-01-01`],
      );

      if (studentStatus === "inactive") {
        inserted += 1;
        return;
      }

      for (let i = 0; i < monthFlags.length; i++) {
        const monthN = i + 1;
        const checked = parseMonthFlag(monthFlags[i]);
        const paySt = paymentStatusForMonth(row, monthN, checked);
        if (paySt === null) continue;

        const ref = monthRef(IMPORT_YEAR, monthN);
        await client.query(
          `INSERT INTO public.payments (student_id, reference_month, amount_cents, status)
           VALUES ($1, $2, $3, $4::payment_status)
           ON CONFLICT (student_id, reference_month) DO UPDATE SET
             amount_cents = EXCLUDED.amount_cents,
             status = EXCLUDED.status,
             updated_at = now()`,
          [studentId, ref, feeCents, paySt],
        );
      }
      inserted += 1;
    }

    for (const row of kidsRows) {
      if (!row.name?.trim()) continue;
      const flags = [
        row.jan,
        row.feb,
        row.mar,
        row.apr,
        row.may,
        row.jun,
        row.jul,
        row.aug,
        row.sep,
        row.oct,
        row.nov,
        row.dec,
      ];
      const beltSlug = row.belt?.trim();
      await insertStudentFlow(
        { ...row, name: row.name, fee_cents: row.fee_cents },
        "kids",
        kidPlan,
        flags,
        beltSlug,
      );
    }

    for (const row of adultRows) {
      if (!row.name?.trim()) continue;
      const flags = [
        row.jan,
        row.feb,
        row.mar,
        row.apr,
        row.may,
        row.jun,
        row.jul,
        row.aug,
        row.sep,
        row.oct,
        row.nov,
        row.dec,
      ];
      const beltSlug = row.belt?.trim();
      await insertStudentFlow(
        { ...row, name: row.name, fee_cents: row.fee_cents },
        "adult",
        adultPlan,
        flags,
        beltSlug,
      );
    }

    await client.query("COMMIT");
    console.log(`Importação concluída: ${inserted} alunos (kids + adultos).`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
