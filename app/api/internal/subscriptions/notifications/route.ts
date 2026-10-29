import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { runSubscriptionNotificationJob } from "@/lib/subscription-emails/server";

export const runtime = "nodejs";

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization");
  if (!expected || !header?.startsWith("Bearer ")) return false;
  const got = Buffer.from(header.slice(7));
  const want = Buffer.from(expected);
  return got.length === want.length && timingSafeEqual(got, want);
}

async function run(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const result = await runSubscriptionNotificationJob();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Integração de e-mail temporariamente indisponível." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
