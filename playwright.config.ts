import path from "path";

import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const root = path.resolve(__dirname);
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });
dotenv.config({ path: path.join(root, ".env.test"), override: true });

const baseURL = process.env.E2E_BASE_URL?.trim() || "http://127.0.0.1:3000";

/** Next dev/server precisa de NEXT_PUBLIC_* no processo filho; mapear desde E2E_* em CI/.env.test */
function webServerEnv(): Record<string, string> {
  const supabaseUrl =
    process.env.E2E_SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.E2E_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const nextEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) nextEnv[k] = v;
  }
  if (supabaseUrl) nextEnv.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
  if (anonKey) nextEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;
  return nextEnv;
}

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  grepInvert: /@exploratory/,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: webServerEnv(),
  },
});
