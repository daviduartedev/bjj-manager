import { NextResponse } from "next/server";

import { getBrazilianMunicipalities } from "@/lib/localities/ibge";
import { BRAZIL_STATES } from "@/lib/validations/academy-registration";

export const revalidate = 86_400;
export const maxDuration = 20;

export async function GET(
  _request: Request,
  context: { params: Promise<{ state: string }> },
) {
  const { state } = await context.params;
  if (!(BRAZIL_STATES as readonly string[]).includes(state)) {
    return NextResponse.json({ error: "Estado brasileiro inválido." }, { status: 400 });
  }

  try {
    const municipalities = await getBrazilianMunicipalities(state);
    return NextResponse.json({ municipalities });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar as cidades agora. Tente novamente." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
