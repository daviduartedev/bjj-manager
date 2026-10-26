import { buildWhatsAppShareUrl, normalizePhoneE164 } from "@/lib/documents/whatsapp";

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

const DESCRIPTION_MAX_LENGTH = 500;

const DESCRIPTION_TOO_LONG_ERROR = "A descrição pode ter no máximo 500 caracteres.";

const LISTING_WARNING = "Este produto não entra na loja.";

const AUDIENCE_LABEL = {
  masculine: "Masculino",
  feminine: "Feminino",
  unisex: "Unissex",
} as const;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export type StorefrontVariantInput = {
  sizeLabel: string;
  priceCents: number | null;
  stockQuantity: number;
  sortOrder: number;
  line: "unisex" | "feminine";
};

export type StorefrontProductInput = {
  name: string;
  active: boolean;
  catalogVisible: boolean;
  description: string | null;
  audience: "unisex" | "masculine" | "feminine";
  variants: StorefrontVariantInput[];
};

export type StorefrontCatalogProduct = {
  name: string;
  audienceLabel: "Masculino" | "Feminino" | "Unissex";
  description: string | null;
  priceLabel: string | null;
  initialSizeLabel: string | null;
};

export type StorefrontCardContext = {
  academyName: string;
  storeUrl: string;
  whatsappE164: string | null;
};

export type StorefrontChip = {
  label: string;
  priceLabel: string;
  available: boolean;
};

export type StorefrontCard = {
  name: string;
  audienceLabel: "Masculino" | "Feminino" | "Unissex";
  description: string | null;
  chips: StorefrontChip[];
  initialChipIndex: number | null;
  whatsappHref: string | null;
};

export function normalizeStorefrontDescription(
  value: string,
): { ok: true; description: string | null } | { ok: false; error: string } {
  const description = value.trim();
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: DESCRIPTION_TOO_LONG_ERROR };
  }
  return { ok: true, description: description === "" ? null : description };
}

function hasPriceAboveZero(product: StorefrontProductInput): boolean {
  return product.variants.some((variant) => (variant.priceCents ?? 0) > 0);
}

export function storefrontListingWarning(product: StorefrontProductInput): string | null {
  if (!product.catalogVisible) return null;
  if (!product.active || !hasPriceAboveZero(product)) return LISTING_WARNING;
  return null;
}

function compareVariants(a: StorefrontVariantInput, b: StorefrontVariantInput): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.sizeLabel.localeCompare(b.sizeLabel, "pt-BR");
}

function initialPricedVariant(
  variants: readonly StorefrontVariantInput[],
): StorefrontVariantInput | null {
  const available = variants.filter(
    (variant) => (variant.priceCents ?? 0) > 0 && variant.stockQuantity > 0,
  );
  available.sort(compareVariants);
  return available[0] ?? null;
}

function descriptionForCard(description: string | null): string | null {
  if (description == null) return null;
  const trimmed = description.trim();
  return trimmed === "" ? null : trimmed;
}

function formatPriceCents(cents: number): string {
  return brlFormatter.format(cents / 100);
}

function chipLabel(variant: StorefrontVariantInput): string {
  if (variant.line === "feminine") return `${variant.sizeLabel} · Feminino`;
  return variant.sizeLabel;
}

function storefrontWhatsAppMessage(args: {
  name: string;
  tamanho: string;
  priceLabel: string;
  academyName: string;
  storeUrl: string;
}): string {
  return `Olá! Quero 1× ${args.name} — ${args.tamanho}. Valor: ${args.priceLabel}. Vi na loja ${args.academyName}: ${args.storeUrl}`;
}

export function storefrontChipWhatsAppHref(args: {
  whatsappE164: string | null;
  name: string;
  tamanho: string;
  priceLabel: string;
  academyName: string;
  storeUrl: string;
}): string | null {
  const phoneE164 = normalizePhoneE164(args.whatsappE164);
  if (!phoneE164) return null;
  return buildWhatsAppShareUrl({
    phoneE164,
    message: storefrontWhatsAppMessage(args),
  });
}

export function projectStorefrontCard(
  product: StorefrontProductInput,
  ctx: StorefrontCardContext,
): StorefrontCard {
  const visible = product.variants.filter((variant) => (variant.priceCents ?? 0) > 0);
  visible.sort(compareVariants);

  const chips: StorefrontChip[] = visible.map((variant) => ({
    label: chipLabel(variant),
    priceLabel: formatPriceCents(variant.priceCents ?? 0),
    available: variant.stockQuantity > 0,
  }));
  const found = chips.findIndex((chip) => chip.available);
  const initialChipIndex = found === -1 ? null : found;
  const initial = initialChipIndex == null ? null : chips[initialChipIndex];

  return {
    name: product.name,
    audienceLabel: AUDIENCE_LABEL[product.audience],
    description: descriptionForCard(product.description),
    chips,
    initialChipIndex,
    whatsappHref: initial
      ? storefrontChipWhatsAppHref({
          whatsappE164: ctx.whatsappE164,
          name: product.name,
          tamanho: initial.label,
          priceLabel: initial.priceLabel,
          academyName: ctx.academyName,
          storeUrl: ctx.storeUrl,
        })
      : null,
  };
}

function listedStorefrontProducts(
  products: readonly StorefrontProductInput[],
): StorefrontProductInput[] {
  const listed = products.filter(
    (product) => product.active && product.catalogVisible && hasPriceAboveZero(product),
  );
  listed.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return listed;
}

export function projectStorefrontCatalog(products: readonly StorefrontProductInput[]): {
  products: StorefrontCatalogProduct[];
} {
  return {
    products: listedStorefrontProducts(products).map((product) => {
      const initial = initialPricedVariant(product.variants);
      const priceCents = initial?.priceCents;
      return {
        name: product.name,
        audienceLabel: AUDIENCE_LABEL[product.audience],
        description: descriptionForCard(product.description),
        priceLabel:
          priceCents != null && priceCents > 0 ? formatPriceCents(priceCents) : null,
        initialSizeLabel: initial?.sizeLabel ?? null,
      };
    }),
  };
}

export function projectStorefrontCards(
  products: readonly StorefrontProductInput[],
  ctx: StorefrontCardContext,
): StorefrontCard[] {
  return listedStorefrontProducts(products).map((product) => projectStorefrontCard(product, ctx));
}

function foldStorefrontSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function filterStorefrontByName<T extends { name: string }>(
  products: readonly T[],
  query: string,
): T[] {
  const needle = foldStorefrontSearch(query);
  return products.filter((product) => foldStorefrontSearch(product.name).includes(needle));
}

const STOREFRONT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const STOREFRONT_PHOTO_MAX_COUNT = 6;

const PHOTO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export function checkStorefrontPhoto(
  file: { size: number; type: string },
  existingCount: number,
): { ok: true; ext: "jpg" | "png" | "webp" } | { ok: false; error: string } {
  if (existingCount >= STOREFRONT_PHOTO_MAX_COUNT) {
    return { ok: false, error: "Cada produto aceita no máximo 6 fotos." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Arquivo vazio." };
  }
  if (file.size > STOREFRONT_PHOTO_MAX_BYTES) {
    return { ok: false, error: "A foto pode ter no máximo 5 MB." };
  }
  const ext = PHOTO_EXT[file.type as keyof typeof PHOTO_EXT];
  if (!ext) {
    return { ok: false, error: "Use JPEG, PNG ou WebP." };
  }
  return { ok: true, ext };
}

export function reorderStorefrontPhotos<T extends { id: string }>(
  photos: readonly T[],
  orderedIds: readonly string[],
): T[] {
  if (orderedIds.length !== photos.length) return [...photos];
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const next: T[] = [];
  const seen = new Set<string>();
  for (const id of orderedIds) {
    const photo = byId.get(id);
    if (!photo || seen.has(id)) return [...photos];
    seen.add(id);
    next.push(photo);
  }
  return next;
}

export const STOREFRONT_THEME_DEFAULTS = {
  pageBackground: "#f4f4f5",
  pageText: "#18181b",
  headerBackground: "#ffffff",
  headerText: "#18181b",
  footerBackground: "#ffffff",
  footerText: "#3f3f46",
  cardBackground: "#ffffff",
  cardText: "#18181b",
  mutedText: "#71717a",
  border: "#e4e4e7",
  accent: "#18181b",
  accentText: "#fafafa",
} as const;

export type StorefrontThemeKey = keyof typeof STOREFRONT_THEME_DEFAULTS;
export type StorefrontTheme = Record<StorefrontThemeKey, string>;

const STOREFRONT_THEME_KEYS = Object.keys(STOREFRONT_THEME_DEFAULTS) as StorefrontThemeKey[];
const STOREFRONT_HEX = /^#[0-9a-fA-F]{6}$/;

export function storefrontThemeDefaults(): StorefrontTheme {
  return { ...STOREFRONT_THEME_DEFAULTS };
}

export function parseStorefrontTheme(
  input: unknown,
): { ok: true; theme: StorefrontTheme } | { ok: false; error: string } {
  const theme = storefrontThemeDefaults();
  if (input == null) return { ok: true, theme };
  if (typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "A aparência da loja está inválida." };
  }
  const record = input as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!STOREFRONT_THEME_KEYS.includes(key as StorefrontThemeKey)) {
      return { ok: false, error: "A aparência da loja tem um campo desconhecido." };
    }
  }
  for (const key of STOREFRONT_THEME_KEYS) {
    const value = record[key];
    if (value == null || value === "") continue;
    if (typeof value !== "string" || !STOREFRONT_HEX.test(value)) {
      return { ok: false, error: "Use cores no formato #RRGGBB." };
    }
    theme[key] = value.toLowerCase();
  }
  return { ok: true, theme };
}

export function storefrontThemeStyle(theme: StorefrontTheme): Record<string, string> {
  return {
    "--store-page": theme.pageBackground,
    "--store-text": theme.pageText,
    "--store-header": theme.headerBackground,
    "--store-header-text": theme.headerText,
    "--store-footer": theme.footerBackground,
    "--store-footer-text": theme.footerText,
    "--store-card": theme.cardBackground,
    "--store-card-text": theme.cardText,
    "--store-muted": theme.mutedText,
    "--store-border": theme.border,
    "--store-accent": theme.accent,
    "--store-accent-text": theme.accentText,
  };
}

export function storefrontCover(
  photos: readonly { url: string }[],
  logoUrl: string | null,
): { urls: string[]; fallback: "logo" | "none" } {
  if (photos.length > 0) {
    return { urls: photos.map((photo) => photo.url), fallback: "none" };
  }
  if (logoUrl) {
    return { urls: [], fallback: "logo" };
  }
  return { urls: [], fallback: "none" };
}
