/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

/**
 * Origens extra para Server Actions atrás de proxy / multi-host (CSRF host ↔ Origin).
 * Lista separada por vírgulas. Em branco → apenas same-origin (comportamento Next.js).
 */
const rawAllowedOrigins = process.env.SERVER_ACTIONS_ALLOWED_ORIGINS;
const serverActionsAllowedOrigins =
  rawAllowedOrigins == null || rawAllowedOrigins === ""
    ? []
    : rawAllowedOrigins.split(",").map((s) => s.trim()).filter(Boolean);

const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "playwright",
    "puppeteer-core",
    "@sparticuz/chromium",
  ],
  /**
   * Chromium só na rota interna (evita Server Actions com binário + symlinks → zip inválido na Vercel).
   * Chave = pathname da rota (sem `/route`). Ver doc Next: outputFileTracingIncludes.
   */
  outputFileTracingIncludes: {
    "/api/internal/pdf-from-html": [
      "node_modules/@sparticuz/chromium/bin/**",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
      ...(serverActionsAllowedOrigins.length > 0
        ? { allowedOrigins: serverActionsAllowedOrigins }
        : {}),
    },
  },
};

export default nextConfig;
