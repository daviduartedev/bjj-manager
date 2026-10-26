"use server";

import { revalidatePath } from "next/cache";

import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import { parsePainelHiddenBlocks } from "@/lib/painel/hidden-blocks";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

export type PainelActionResult = { ok: true } | { ok: false; error: string };

export async function updatePainelHiddenBlocks(
  input: unknown,
): Promise<PainelActionResult> {
  try {
    const hidden = parsePainelHiddenBlocks(input);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sessão inválida." };

    const { error } = await supabase
      .from("profiles")
      .update({
        painel_hidden_blocks: hidden,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath(ROUTES.painel);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        mapDatabaseErrorToUserMessage(e) ??
        "Não foi possível guardar a personalização do painel.",
    };
  }
}
