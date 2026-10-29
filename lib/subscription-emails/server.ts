import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { processSubscriptionNotifications } from "./process";
import { createNotificationRepository } from "./repository";
import { createResendGateway } from "./resend";

function appUrl(environment: Record<string, string | undefined>) {
  const value = environment.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3011";
  return value.replace(/\/$/, "");
}

function fromAddress(environment: Record<string, string | undefined>) {
  const from = environment.RESEND_FROM_EMAIL?.trim();
  if (!from || /[\r\n]/.test(from) || !from.includes("@")) throw new Error("email_configuration_missing");
  return from;
}

export function runSubscriptionNotificationJob(environment: Record<string, string | undefined> = process.env) {
  const client = createAdminClient();
  if (!client) throw new Error("email_configuration_missing");
  return processSubscriptionNotifications({
    repository: createNotificationRepository(client),
    gateway: createResendGateway(environment),
    from: fromAddress(environment),
    appUrl: appUrl(environment),
  });
}
