export const BRANDING_BUCKET = process.env.SUPABASE_BRANDING_BUCKET ?? "branding-dev";
export const BRANDING_MAX_BYTES = 256 * 1024;
export const BRANDING_ALLOWED_MIME = ["image/png", "image/svg+xml"] as const;

export type BrandingKind = "signature" | "logo";
export type BrandingAccountColumn = "signature_url" | "logo_url";

export const BRANDING_ACCOUNT_COLUMN: Record<BrandingKind, BrandingAccountColumn> = {
  signature: "signature_url",
  logo: "logo_url",
};

export type BrandingFileCheck =
  | { ok: true; ext: "png" | "svg"; contentType: (typeof BRANDING_ALLOWED_MIME)[number] }
  | { ok: false; error: string };

export type BrandingActionResult = { ok: true } | { ok: false; error: string };

export function checkBrandingFile(file: { size: number; type: string }): BrandingFileCheck {
  if (file.size === 0) {
    return { ok: false, error: "Ficheiro vazio." };
  }
  if (file.size > BRANDING_MAX_BYTES) {
    return { ok: false, error: "Ficheiro maior que 256 KB." };
  }
  if (!BRANDING_ALLOWED_MIME.includes(file.type as (typeof BRANDING_ALLOWED_MIME)[number])) {
    return { ok: false, error: "Use PNG ou SVG." };
  }
  const ext = file.type === "image/png" ? "png" : "svg";
  return { ok: true, ext, contentType: file.type as (typeof BRANDING_ALLOWED_MIME)[number] };
}

export function brandingObjectPath(
  accountId: string,
  kind: BrandingKind,
  ext: "png" | "svg",
): string {
  return `${accountId}/${kind}.${ext}`;
}

export async function persistBrandingUpload(args: {
  accountId: string;
  kind: BrandingKind;
  file: { size: number; type: string; arrayBuffer: () => Promise<ArrayBuffer> };
  upload: (path: string, body: Uint8Array, contentType: string) => Promise<void>;
  writePath: (
    accountId: string,
    column: BrandingAccountColumn,
    value: string,
  ) => Promise<void>;
}): Promise<BrandingActionResult> {
  const checked = checkBrandingFile(args.file);
  if (!checked.ok) return checked;

  const path = brandingObjectPath(args.accountId, args.kind, checked.ext);
  const arrayBuffer = await args.file.arrayBuffer();
  await args.upload(path, new Uint8Array(arrayBuffer), checked.contentType);
  await args.writePath(args.accountId, BRANDING_ACCOUNT_COLUMN[args.kind], path);
  return { ok: true };
}

export async function removeBrandingAsset(args: {
  accountId: string;
  kind: BrandingKind;
  readPath: (accountId: string, column: BrandingAccountColumn) => Promise<string | null>;
  remove: (paths: string[]) => Promise<void>;
  writePath: (
    accountId: string,
    column: BrandingAccountColumn,
    value: null,
  ) => Promise<void>;
}): Promise<BrandingActionResult> {
  const column = BRANDING_ACCOUNT_COLUMN[args.kind];
  const current = await args.readPath(args.accountId, column);
  if (current) {
    await args.remove([current]);
  }
  await args.writePath(args.accountId, column, null);
  return { ok: true };
}
