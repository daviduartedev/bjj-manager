/**
 * Cria utilizadores Auth dedicados a testes E2E/RLS (domínio @cascabjj.test).
 * Não altera alunos/profiles de produção — só cria users Auth se ainda não existirem.
 *
 * Escreve/atualiza E2E_* e VALIDATION_TEST_PASSWORD em .env.local e .env.test.
 *
 * Usage: pnpm setup:e2e-accounts
 * Depois: pnpm db:validate-rls (liga profiles, accounts, marcadores RLS-V-*)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const root = path.join(__dirname, "..");
require("dotenv").config({ path: path.join(root, ".env") });
require("dotenv").config({ path: path.join(root, ".env.local"), override: true });

/** Emails fixos de teste — nunca usar emails de produção aqui. */
const DEFAULT_EMAIL_A = "casca-e2e-prof-a@cascabjj.test";
const DEFAULT_EMAIL_B = "casca-e2e-prof-b@cascabjj.test";
const DEFAULT_EMAIL_STUDENT = "casca-e2e-student@cascabjj.test";

function requireEnvAny(names, label) {
  for (const name of names) {
    const v = process.env[name];
    if (v && String(v).trim()) return String(v).trim();
  }
  console.error(`Falta ${label} (defina uma de: ${names.join(", ")}) em .env.local.`);
  process.exit(2);
}

function generateTestPassword() {
  return crypto.randomBytes(18).toString("base64url").slice(0, 24);
}

function upsertEnvVars(filePath, vars) {
  const header = "# --- E2E / RLS test accounts (setup-e2e-test-accounts.cjs) ---";
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

  if (!content.includes(header)) {
    content = content.trimEnd() + `\n\n${header}\n`;
  }

  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      content = content.trimEnd() + `\n${line}\n`;
    }
  }

  fs.writeFileSync(filePath, content.endsWith("\n") ? content : content + "\n");
}

async function ensureAuthUser(admin, email, password) {
  const list = await admin.auth.admin.listUsers({ perPage: 200, page: 1 });
  if (list.error) throw list.error;
  const found = list.data.users.find((u) => u.email === email);
  if (found) {
    const up = await admin.auth.admin.updateUserById(found.id, {
      password,
      email_confirm: true,
    });
    if (up.error) throw up.error;
    return { user: found, created: false };
  }

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error) throw created.error;
  return { user: created.data.user, created: true };
}

async function main() {
  const supabaseUrl = requireEnvAny(
    ["NEXT_PUBLIC_SUPABASE_URL", "E2E_SUPABASE_URL"],
    "URL Supabase"
  );
  const serviceKey = requireEnvAny(
    ["SUPABASE_SERVICE_ROLE_KEY", "E2E_SUPABASE_SERVICE_ROLE_KEY"],
    "service_role key"
  );

  const emailA = process.env.E2E_USER_A_EMAIL?.trim() || DEFAULT_EMAIL_A;
  const emailB = process.env.E2E_USER_B_EMAIL?.trim() || DEFAULT_EMAIL_B;
  const emailStudent =
    process.env.E2E_STUDENT_EMAIL?.trim() || DEFAULT_EMAIL_STUDENT;
  const password =
    process.env.VALIDATION_TEST_PASSWORD?.trim() ||
    process.env.E2E_USER_A_PASSWORD?.trim() ||
    generateTestPassword();

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("A criar/sincronizar utilizadores Auth de teste (@cascabjj.test)…");

  const results = [];
  for (const email of [emailA, emailB, emailStudent]) {
    const r = await ensureAuthUser(admin, email, password);
    results.push({ email, created: r.created });
    console.log(`  ${r.created ? "Criado" : "Atualizado"}: ${email}`);
  }

  const envVars = {
    E2E_USER_A_EMAIL: emailA,
    E2E_USER_A_PASSWORD: password,
    E2E_USER_B_EMAIL: emailB,
    E2E_USER_B_PASSWORD: password,
    E2E_STUDENT_EMAIL: emailStudent,
    VALIDATION_TEST_PASSWORD: password,
    E2E_SUPABASE_URL: supabaseUrl,
    E2E_SUPABASE_ANON_KEY:
      process.env.E2E_SUPABASE_ANON_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      "",
    E2E_SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  };

  const envLocalPath = path.join(root, ".env.local");
  upsertEnvVars(envLocalPath, envVars);

  const envTestPath = path.join(root, ".env.test");
  upsertEnvVars(envTestPath, {
    ...envVars,
    E2E_BASE_URL: process.env.E2E_BASE_URL?.trim() || "http://127.0.0.1:3000",
    DATABASE_URL: process.env.DATABASE_URL?.trim() || "",
  });

  console.log("\nOK — variáveis gravadas em .env.local e .env.test");
  console.log("  Prof A:  ", emailA);
  console.log("  Prof B:  ", emailB);
  console.log("  Student: ", emailStudent);
  console.log("  Password: (em VALIDATION_TEST_PASSWORD — ver .env.local)");
  console.log("\nPróximo passo: pnpm db:validate-rls");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
