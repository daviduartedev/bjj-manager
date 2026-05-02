import fs from "fs";
import path from "path";

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

export default async function globalSetup() {
  const root = path.resolve(__dirname, "..");
  dotenv.config({ path: path.join(root, ".env") });
  dotenv.config({ path: path.join(root, ".env.local"), override: true });
  dotenv.config({ path: path.join(root, ".env.test"), override: true });

  const cacheDir = path.join(__dirname, ".cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, "idor-context.json");

  const url = process.env.E2E_SUPABASE_URL?.trim();
  const serviceKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    fs.writeFileSync(
      cachePath,
      JSON.stringify({
        studentIdB: null,
        reason: "missing_E2E_SUPABASE_URL_or_E2E_SUPABASE_SERVICE_ROLE_KEY",
      }),
    );
    return;
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin
    .from("students")
    .select("id")
    .eq("full_name", "RLS-V-B")
    .maybeSingle();

  if (error) {
    fs.writeFileSync(
      cachePath,
      JSON.stringify({ studentIdB: null, reason: String(error.message) }),
    );
    return;
  }

  fs.writeFileSync(
    cachePath,
    JSON.stringify({
      studentIdB: data?.id ?? null,
      reason: data?.id
        ? null
        : "no_RLS-V-B_student_run_pnpm_db_validate_rls_first",
    }),
  );
}
