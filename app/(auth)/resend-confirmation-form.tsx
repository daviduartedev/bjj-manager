"use client";

import { useState } from "react";

import { resendAcademyConfirmation } from "@/actions/resend-academy-confirmation";
import { RESEND_CONFIRMATION_MESSAGE } from "@/lib/auth/resend-academy-confirmation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResendConfirmationForm({
  defaultEmail,
  emailHidden = false,
}: {
  defaultEmail?: string;
  emailHidden?: boolean;
}) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setFieldError(null);
    try {
      const result = await resendAcademyConfirmation({ email });
      if (result.ok) {
        setMessage(result.message);
        return;
      }
      setFieldError(result.fieldErrors.email?.[0] ?? "Digite um e-mail válido.");
    } catch {
      setMessage(RESEND_CONFIRMATION_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {emailHidden ? null : (
        <div className="space-y-2">
          <Label htmlFor="resend-email">E-mail</Label>
          <Input
            id="resend-email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={loading}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 w-full touch-manipulation"
          />
        </div>
      )}
      {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button
        type="submit"
        variant="outline"
        className="w-full min-h-11 sm:min-h-10"
        disabled={loading}
      >
        {loading ? "Enviando…" : "Reenviar e-mail"}
      </Button>
    </form>
  );
}
