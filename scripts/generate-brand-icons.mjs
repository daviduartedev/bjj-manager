/**
 * Gera favicons e ícones PWA a partir de `public/Logo.png`.
 * Executar após alterar a logo: `node scripts/generate-brand-icons.mjs`
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const input = join(root, "public", "Logo.png");

const bg = { r: 5, g: 5, b: 5, alpha: 1 };

async function squareIcon(size, destRel) {
  const dest = join(root, destRel);
  await mkdir(dirname(dest), { recursive: true });
  await sharp(input)
    .resize(size, size, {
      fit: "contain",
      background: bg,
      position: "center",
    })
    .png()
    .toFile(dest);
  console.log("wrote", destRel);
}

async function main() {
  await squareIcon(16, "public/favicon-16x16.png");
  await squareIcon(32, "public/favicon-32x32.png");
  await squareIcon(180, "public/apple-touch-icon.png");
  await squareIcon(192, "public/android-chrome-192x192.png");
  await squareIcon(512, "public/android-chrome-512x512.png");
  await squareIcon(512, "app/icon.png");
  await squareIcon(180, "app/apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
