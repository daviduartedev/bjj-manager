import { createHmac, timingSafeEqual } from "node:crypto";

const ABACATEPAY_PUBLIC_KEY = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

export function verifySubscriptionWebhook(input: { rawBody: string; suppliedSecret: string | null; expectedSecret: string | undefined; signature: string | null }): boolean {
  if (!input.expectedSecret || !input.suppliedSecret || !input.signature) return false;
  const expectedSecret = Buffer.from(input.expectedSecret);
  const suppliedSecret = Buffer.from(input.suppliedSecret);
  if (expectedSecret.length !== suppliedSecret.length || !timingSafeEqual(expectedSecret, suppliedSecret)) return false;
  const expectedSignature = Buffer.from(createHmac("sha256", ABACATEPAY_PUBLIC_KEY).update(input.rawBody, "utf8").digest("base64"));
  const suppliedSignature = Buffer.from(input.signature);
  return expectedSignature.length === suppliedSignature.length && timingSafeEqual(expectedSignature, suppliedSignature);
}
