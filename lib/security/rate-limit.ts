/**
 * Rate limiting em memória (Middleware Edge).
 * Adequado para suavizar picos; em ambientes multi-instância usar Redis/Upstash (**SECE2E**).
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const MAX_KEYS = 4096;

function evictIfNeeded() {
  if (store.size <= MAX_KEYS) return;
  const first = store.keys().next().value as string | undefined;
  if (first) store.delete(first);
}

/**
 * @returns `true` se o pedido pode prosseguir; `false` se excedeu o limite.
 */
export function allowRateLimit(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  evictIfNeeded();
  const bucket = store.get(key);
  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export function serverActionsRateLimitKey(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) {
    const ip = xf.split(",")[0]?.trim();
    if (ip) return `sa:${ip}`;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return `sa:${realIp}`;
  return "sa:unknown";
}

export function isNextServerActionRequest(request: Request): boolean {
  if (request.method !== "POST") return false;
  for (const [name] of request.headers) {
    if (name.toLowerCase() === "next-action") return true;
  }
  return false;
}
