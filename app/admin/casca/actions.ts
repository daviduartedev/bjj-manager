"use server";

import { revalidatePath } from "next/cache";

import { getPlatformAdminService, getPlatformAdminUser } from "@/lib/platform-admin/server";

export async function changeAcademyCommercialKind(input: unknown) {
  const user = await getPlatformAdminUser();
  if (!user) return { ok: false, error: "Acesso restrito ao administrador da plataforma." } as const;
  const service = getPlatformAdminService();
  if (!service) return { ok: false, error: "Administração indisponível. Tente novamente mais tarde." } as const;
  const result = await service.changeKind(user.id, input);
  if (result.ok) { revalidatePath("/admin/casca"); revalidatePath("/conta/assinatura"); }
  return result;
}

export async function createInternalTestAcademy(input: unknown) {
  const user = await getPlatformAdminUser();
  if (!user) return { ok: false, error: "Acesso restrito ao administrador da plataforma." } as const;
  const service = getPlatformAdminService();
  if (!service) return { ok: false, error: "Administração indisponível. Tente novamente mais tarde." } as const;
  const result = await service.createInternal(user.id, input);
  if (result.ok) revalidatePath("/admin/casca");
  return result;
}
