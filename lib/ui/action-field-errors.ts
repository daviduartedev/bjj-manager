import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function applyActionFieldErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  fieldErrors: Record<string, string[]>,
): void {
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages[0];
    if (!message) continue;
    setError(key as Path<TFieldValues>, { message });
  }
}

/** Toast only when the failure has no field messages to show under inputs. */
export function shouldToastActionError(result: {
  fieldErrors?: Record<string, string[]>;
}): boolean {
  if (!result.fieldErrors) return true;
  return !Object.values(result.fieldErrors).some((messages) =>
    messages.some((message) => message.length > 0),
  );
}

export function applyActionFailureToForm<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  result: { fieldErrors?: Record<string, string[]> },
): { toastError: boolean } {
  if (result.fieldErrors) {
    applyActionFieldErrors(setError, result.fieldErrors);
  }
  return { toastError: shouldToastActionError(result) };
}
