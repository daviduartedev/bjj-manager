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
export function shouldToastActionError(
  result: {
    fieldErrors?: Record<string, string[]>;
  },
  knownFields?: Iterable<string>,
): boolean {
  if (!result.fieldErrors) return true;
  const entries = Object.entries(result.fieldErrors).filter(([, messages]) =>
    messages.some((message) => message.length > 0),
  );
  if (entries.length === 0) return true;
  if (!knownFields) return false;
  const known = new Set(knownFields);
  return entries.some(([key]) => !known.has(key));
}

export function applyActionFailureToForm<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  result: { fieldErrors?: Record<string, string[]> },
  knownFields?: Iterable<string>,
): { toastError: boolean } {
  if (result.fieldErrors) {
    applyActionFieldErrors(setError, result.fieldErrors);
  }
  return { toastError: shouldToastActionError(result, knownFields) };
}
