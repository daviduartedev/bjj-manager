import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { renderWithServerlessChromium } from "@/lib/documents/chromium-serverless";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  html: z.string().min(1).max(900_000),
  options: z
    .object({
      format: z.enum(["A4", "Letter"]).optional(),
      margin: z
        .object({
          top: z.string().optional(),
          right: z.string().optional(),
          bottom: z.string().optional(),
          left: z.string().optional(),
        })
        .optional(),
      printBackground: z.boolean().optional(),
    })
    .optional(),
});

function verifyBearer(rawHeader: string | null, secretBuf: Buffer): boolean {
  if (rawHeader == null || rawHeader === "") return false;
  const m = /^Bearer\s+(.+)$/i.exec(rawHeader.trim());
  if (!m) return false;
  const tok = Buffer.from(m[1]!.trim(), "utf8");
  if (tok.length !== secretBuf.length) return false;
  try {
    return timingSafeEqual(tok, secretBuf);
  } catch {
    return false;
  }
}

/** Rota apenas para invocação interna (Lambdas isoladas): binário Chromium só entra aqui no trace da Vercel. */
export async function POST(req: NextRequest) {
  const secretRaw = process.env.PDF_INTERNAL_RENDER_TOKEN ?? "";
  if (secretRaw.length < 24) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "PDF_INTERNAL_RENDER_TOKEN em falha ou curto demais (mínimo 24 caracteres).",
      },
      { status: 503 },
    );
  }

  const secret = Buffer.from(secretRaw, "utf8");
  if (!verifyBearer(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, {
      status: 401,
    });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, {
      status: 400,
    });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Payload inválido." }, {
      status: 400,
    });
  }

  try {
    const pdf = await renderWithServerlessChromium(parsed.data.html, {
      ...(parsed.data.options ?? {}),
    });
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[pdf-from-html]", e);
    return NextResponse.json(
      {
        ok: false,
        error: "Renderização falhou.",
      },
      { status: 500 },
    );
  }
}
