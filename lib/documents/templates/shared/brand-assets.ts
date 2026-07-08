import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

let cachedLogoDataUrl: string | null = null;

/** Logo ASLAM embutido em data URL para renderização PDF offline. */
export function getAslamLogoDataUrl(): string {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  const filePath = join(process.cwd(), "public", "Logo.png");
  const buf = readFileSync(filePath);
  cachedLogoDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  return cachedLogoDataUrl;
}
