/**
 * Remove `.next` para corrigir assets 404/500 e CSS ausente no dev (cache inconsistente).
 * Uso: `pnpm clean:next` ou `pnpm dev:clean`
 */
import { rmSync } from "node:fs";

try {
  rmSync(".next", { recursive: true, force: true });
  console.log("[clean-next] Pasta .next removida.");
} catch (err) {
  const code = /** @type {{ code?: string }} */ (err).code;
  if (code !== "ENOENT") throw err;
  console.log("[clean-next] .next já não existia.");
}
