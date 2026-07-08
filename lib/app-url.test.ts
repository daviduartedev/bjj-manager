import { afterEach, describe, expect, it } from "vitest";

import { resolvePublicAppOrigin } from "./app-url";

const ENV_KEYS = [
  "APP_URL",
  "CANONICAL_APP_URL",
  "VERCEL_ENV",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
  "NEXT_PUBLIC_APP_URL",
] as const;

function snapshotEnv(): Record<string, string | undefined> {
  return Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
}

function restoreEnv(snap: Record<string, string | undefined>) {
  for (const k of ENV_KEYS) {
    const v = snap[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

describe("resolvePublicAppOrigin", () => {
  const snap = snapshotEnv();

  afterEach(() => restoreEnv(snap));

  it("prioriza APP_URL canónico", () => {
    process.env.APP_URL = "https://app.aslam.com.br/";
    process.env.NEXT_PUBLIC_APP_URL = "https://stale.vercel.app";
    expect(resolvePublicAppOrigin()).toBe("https://app.aslam.com.br");
  });

  it("em produção Vercel usa VERCEL_PROJECT_PRODUCTION_URL antes de NEXT_PUBLIC_APP_URL", () => {
    delete process.env.APP_URL;
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "bjj-manager.vercel.app";
    process.env.NEXT_PUBLIC_APP_URL = "https://casca-gestao-bjj.vercel.app";
    expect(resolvePublicAppOrigin()).toBe("https://bjj-manager.vercel.app");
  });

  it("fallback para localhost", () => {
    for (const k of ENV_KEYS) delete process.env[k];
    expect(resolvePublicAppOrigin()).toBe("http://localhost:3000");
  });
});
