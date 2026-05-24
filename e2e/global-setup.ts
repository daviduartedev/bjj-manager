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

  const emailB = process.env.E2E_USER_B_EMAIL?.trim();
  if (!emailB) {
    fs.writeFileSync(
      cachePath,
      JSON.stringify({ studentIdB: null, reason: "missing_E2E_USER_B_EMAIL" }),
    );
    return;
  }

  const list = await admin.auth.admin.listUsers({ perPage: 200, page: 1 });
  if (list.error) {
    fs.writeFileSync(
      cachePath,
      JSON.stringify({ studentIdB: null, reason: String(list.error.message) }),
    );
    return;
  }

  const userB = list.data.users.find((u) => u.email === emailB);
  if (!userB) {
    fs.writeFileSync(
      cachePath,
      JSON.stringify({
        studentIdB: null,
        reason: `auth_user_not_found_${emailB}`,
      }),
    );
    return;
  }

  const { data: profileB, error: profileError } = await admin
    .from("profiles")
    .select("account_id")
    .eq("user_id", userB.id)
    .maybeSingle();

  if (profileError || !profileB?.account_id) {
    fs.writeFileSync(
      cachePath,
      JSON.stringify({
        studentIdB: null,
        reason: profileError?.message ?? "no_profile_for_E2E_USER_B",
      }),
    );
    return;
  }

  const { data, error } = await admin
    .from("students")
    .select("id")
    .eq("full_name", "RLS-V-B")
    .eq("account_id", profileB.account_id)
    .maybeSingle();

  if (error) {
    fs.writeFileSync(
      cachePath,
      JSON.stringify({ studentIdB: null, reason: String(error.message) }),
    );
    return;
  }

  const studentIdB = data?.id ?? null;

  // Look up the RLS-V-CLASS session for Stage 3 E2E
  let classSessionId: string | null = null;
  let classId: string | null = null;
  let classStudentId: string | null = null;

  if (studentIdB && profileB?.account_id) {
    const sessionRes = await admin
      .from("class_sessions")
      .select("id, class_id, classes!inner(name)")
      .eq("account_id", profileB.account_id)
      .filter("classes.name", "eq", "RLS-V-CLASS")
      .order("session_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (sessionRes.data) {
      classSessionId = sessionRes.data.id as string;
      classId = sessionRes.data.class_id as string;
    }

    // Find student enrolled in RLS-V-CLASS from the student account
    const studentEmail = process.env.E2E_STUDENT_EMAIL?.trim();
    if (studentEmail && classId) {
      const studentUserList = await admin.auth.admin.listUsers({ perPage: 200, page: 1 });
      const studentUser = studentUserList.data?.users.find((u) => u.email === studentEmail);
      if (studentUser) {
        const enrollRes = await admin
          .from("student_class_enrollments")
          .select("student_id")
          .eq("class_id", classId)
          .eq("account_id", profileB.account_id)
          .limit(1)
          .maybeSingle();
        if (enrollRes.data) {
          classStudentId = enrollRes.data.student_id as string;
        }
      }
    }
  }

  fs.writeFileSync(
    cachePath,
    JSON.stringify({
      studentIdB,
      classSessionId,
      classId,
      classStudentId,
      reason: studentIdB
        ? null
        : "no_RLS-V-B_student_run_pnpm_db_validate_rls_first",
    }),
  );
}
