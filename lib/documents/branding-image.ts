import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { DocumentPayload } from "./types";

const BRANDING_BUCKET = process.env.SUPABASE_BRANDING_BUCKET ?? "branding-dev";

function mimeFromPath(path: string): string {
  return path.toLowerCase().endsWith(".svg") ? "image/svg+xml" : "image/png";
}

export async function resolveBrandingImageDataUrl(
  client: SupabaseClient,
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  try {
    const { data, error } = await client.storage.from(BRANDING_BUCKET).download(path);
    if (error || !data) return null;
    const buf = Buffer.from(await data.arrayBuffer());
    return `data:${mimeFromPath(path)};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function attachResolvedLogo(
  client: SupabaseClient,
  payload: DocumentPayload,
): Promise<DocumentPayload> {
  if (payload.type !== "enrollment_liability_form" && payload.type !== "payment_receipt") {
    return payload;
  }
  const logoImageDataUrl = await resolveBrandingImageDataUrl(
    client,
    payload.data.receiver?.logoPath,
  );
  return {
    ...payload,
    data: {
      ...payload.data,
      logoImageDataUrl,
    },
  } as DocumentPayload;
}