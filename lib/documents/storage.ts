import type { SupabaseClient } from "@supabase/supabase-js";

const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET ?? "documents-dev";
const DEFAULT_SIGN_TTL_SECONDS = Number.parseInt(
  process.env.DOCUMENTS_SIGN_TTL_SECONDS ?? "1800",
  10,
);

export function getDocumentsBucket(): string {
  return DOCUMENTS_BUCKET;
}

export function buildDocumentPath(args: {
  accountId: string;
  documentId: string;
  ext: "pdf" | "html";
}): string {
  return `${args.accountId}/${args.documentId}/v1.${args.ext}`;
}

export async function uploadDocumentArtifact(
  client: SupabaseClient,
  args: {
    path: string;
    content: Buffer | Uint8Array;
    contentType: string;
  },
): Promise<{ path: string; size: number }> {
  const { error } = await client.storage
    .from(DOCUMENTS_BUCKET)
    .upload(args.path, args.content, {
      cacheControl: "0",
      upsert: true,
      contentType: args.contentType,
    });
  if (error) throw error;
  return { path: args.path, size: args.content.byteLength };
}

export async function createDocumentSignedUrl(
  client: SupabaseClient,
  path: string,
  ttlSeconds: number = DEFAULT_SIGN_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await client.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, ttlSeconds);
  if (error || !data?.signedUrl) {
    throw error ?? new Error("Não foi possível gerar URL assinada.");
  }
  return data.signedUrl;
}

export async function archiveDocumentArtifact(
  client: SupabaseClient,
  path: string,
): Promise<void> {
  const archivedPath = path.replace(/\.(pdf|html)$/i, ".archived.$1");
  await client.storage.from(DOCUMENTS_BUCKET).copy(path, archivedPath);
  await client.storage.from(DOCUMENTS_BUCKET).remove([path]);
}
