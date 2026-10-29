import { NextResponse } from "next/server";

import { getSubscriptionService } from "@/lib/subscriptions/server";
import { verifySubscriptionWebhook } from "@/lib/subscriptions/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 262144) return NextResponse.json({ error: "Evento inválido." }, { status: 413 });
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > 262144) return NextResponse.json({ error: "Evento inválido." }, { status: 413 });
  const valid = verifySubscriptionWebhook({ rawBody, suppliedSecret: new URL(request.url).searchParams.get("webhookSecret"), expectedSecret: process.env.CASCA_ABACATEPAY_WEBHOOK_SECRET, signature: request.headers.get("x-webhook-signature") });
  if (!valid) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Evento inválido." }, { status: 400 }); }
  const service = getSubscriptionService();
  if (!service) return NextResponse.json({ error: "Integração temporariamente indisponível." }, { status: 503 });
  const result = await service.receiveEvent(payload);
  if (!result.ok) return NextResponse.json({ error: "Não foi possível processar o evento." }, { status: 503 });
  return NextResponse.json({ received: true, outcome: result.data.outcome });
}
