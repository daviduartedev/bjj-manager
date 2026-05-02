import { createClient } from "@supabase/supabase-js";
import { test, expect } from "./fixtures";

import { readIdorContext } from "./helpers/idor-context";

test.describe("RLS via Supabase REST (JWT utilizador A)", () => {
  test("select do aluno RLS-V-B por id devolve vazio", async () => {
    const url = process.env.E2E_SUPABASE_URL?.trim();
    const anon = process.env.E2E_SUPABASE_ANON_KEY?.trim();
    const email = process.env.E2E_USER_A_EMAIL?.trim();
    const password = process.env.E2E_USER_A_PASSWORD?.trim();
    const { studentIdB } = readIdorContext();

    test.skip(!url || !anon || !email || !password, "Env Supabase/E2E incompleto");
    test.skip(!studentIdB, "Sem studentIdB — executar db:validate-rls antes");

    const supabase = createClient(url!, anon!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const signIn = await supabase.auth.signInWithPassword({ email: email!, password: password! });
    expect(signIn.error).toBeNull();

    const row = await supabase
      .from("students")
      .select("id, full_name")
      .eq("id", studentIdB)
      .maybeSingle();

    expect(row.error).toBeNull();
    expect(row.data).toBeNull();

    await supabase.auth.signOut();
  });
});
