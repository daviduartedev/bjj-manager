"use server";

import { getCurrentUser } from "@/lib/auth";
import { isPlatformOwner } from "@/lib/platform-admin/service";
import { getCurrentSubscription } from "@/lib/subscriptions/server";

/** Somente a sessao validada no servidor decide privilegio global e adesao pendente. */
export async function getSpecialPostLoginPath(): Promise<"/admin/casca" | "/conta/assinatura" | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (isPlatformOwner(user.id, process.env.CASCA_PLATFORM_ADMIN_USER_ID)) return "/admin/casca";
  try {
    const current = await getCurrentSubscription();
    return current?.enforcementEnabled && current.subscription?.kind === "commercial" && current.subscription.status === "pending"
      ? "/conta/assinatura" : null;
  } catch {
    return null;
  }
}
