import { normalizePhoneE164 } from "@/lib/documents/whatsapp";

const SLUG_MAX_LENGTH = 40;

const RESERVED_SLUGS = new Set([
  "loja",
  "painel",
  "portal",
  "login",
  "admin",
  "api",
  "produtos",
  "termos",
  "privacidade",
  "configuracoes",
]);

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

const CONFIRM_SLUG_CHANGE_ERROR =
  "Confirme a troca do endereço. O endereço anterior deixa de abrir.";

const INVALID_SLUG_ERROR =
  "O endereço precisa ter de 3 a 40 caracteres, só com letras minúsculas, números e hífens.";

const RESERVED_SLUG_ERROR = "Este endereço está reservado.";

const TAKEN_SLUG_ERROR = "Este endereço já está em uso.";

const PUBLISH_WHATSAPP_ERROR = "Informe um WhatsApp válido para publicar a loja.";

const CLEAR_WHATSAPP_ERROR = "Despublique a loja antes de apagar o WhatsApp.";

const INVALID_WHATSAPP_ERROR = "Informe um WhatsApp válido.";

export type StorefrontAccess = "not_found" | "empty" | "catalog";

export function slugifyAcademyName(name: string): string {
  const stripped = name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const hyphenated = stripped.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return hyphenated.slice(0, SLUG_MAX_LENGTH).replace(/-+$/g, "");
}

function slugWithSuffix(base: string, n: number): string {
  if (n <= 1) return base;
  const suffix = `-${n}`;
  const head = base.slice(0, SLUG_MAX_LENGTH - suffix.length).replace(/-+$/g, "");
  return `${head}${suffix}`;
}

function isReservedOrTaken(candidate: string, taken: ReadonlySet<string>): boolean {
  return RESERVED_SLUGS.has(candidate) || taken.has(candidate);
}

export function allocateSlug(name: string, taken: readonly string[]): string {
  const slugified = slugifyAcademyName(name);
  const base = slugified.length < 3 ? "academia" : slugified;
  const takenSet = new Set(taken.map((slug) => slug.toLowerCase()));

  let n = 1;
  let candidate = base;
  while (isReservedOrTaken(candidate, takenSet) || !SLUG_PATTERN.test(candidate)) {
    n += 1;
    candidate = slugWithSuffix(base, n);
  }
  return candidate;
}

export function validateSlugChange(input: {
  next: string;
  current: string;
  takenByOthers: readonly string[];
  confirmed: boolean;
}): { ok: true; slug: string } | { ok: false; error: string } {
  const slug = slugifyAcademyName(input.next);
  if (!SLUG_PATTERN.test(slug)) {
    return { ok: false, error: INVALID_SLUG_ERROR };
  }

  if (slug === input.current) {
    return { ok: true, slug };
  }

  if (!input.confirmed) {
    return { ok: false, error: CONFIRM_SLUG_CHANGE_ERROR };
  }

  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, error: RESERVED_SLUG_ERROR };
  }

  const taken = input.takenByOthers.some((other) => other.toLowerCase() === slug);
  if (taken) {
    return { ok: false, error: TAKEN_SLUG_ERROR };
  }

  return { ok: true, slug };
}

export function resolveStorefrontAccess(input: {
  slugFound: boolean;
  published: boolean;
  whatsappE164: string | null;
  eligibleProductCount: number;
  preview: boolean;
}): StorefrontAccess {
  if (!input.slugFound) return "not_found";

  if (input.preview) {
    return input.eligibleProductCount === 0 ? "empty" : "catalog";
  }

  if (!input.published || input.whatsappE164 == null) return "not_found";

  return input.eligibleProductCount === 0 ? "empty" : "catalog";
}

export function canPublishStorefront(input: {
  published: boolean;
  whatsappRaw: string | null;
  currentlyPublished: boolean;
}):
  | { ok: true; whatsappE164: string | null; published: boolean }
  | { ok: false; error: string } {
  const whatsappE164 = normalizePhoneE164(input.whatsappRaw);
  const raw = (input.whatsappRaw ?? "").trim();

  if (input.currentlyPublished && whatsappE164 == null) {
    return { ok: false, error: CLEAR_WHATSAPP_ERROR };
  }

  if (input.published && whatsappE164 == null) {
    return { ok: false, error: PUBLISH_WHATSAPP_ERROR };
  }

  if (whatsappE164 == null && raw !== "") {
    return { ok: false, error: INVALID_WHATSAPP_ERROR };
  }

  return { ok: true, whatsappE164, published: input.published };
}

export function canCopyStorefrontLink(access: StorefrontAccess): boolean {
  return access !== "not_found";
}

export function storefrontPath(slug: string): string {
  return `/loja/${slug}`;
}
