import { describe, expect, it, vi } from "vitest";

import {
  applyActionFailureToForm,
  shouldToastActionError,
} from "@/lib/ui/action-field-errors";

describe("shouldToastActionError", () => {
  it("mantém toast quando a falha não tem campo", () => {
    expect(shouldToastActionError({ fieldErrors: undefined })).toBe(true);
    expect(shouldToastActionError({})).toBe(true);
  });

  it("não toasta quando há erros de campo para mostrar debaixo do input", () => {
    expect(
      shouldToastActionError({
        fieldErrors: { academy_start_date: ["O ano de entrada não pode ser no futuro."] },
      }),
    ).toBe(false);
  });

  it("toasta se fieldErrors vier vazio", () => {
    expect(shouldToastActionError({ fieldErrors: {} })).toBe(true);
    expect(shouldToastActionError({ fieldErrors: { name: [] } })).toBe(true);
  });
});

describe("applyActionFailureToForm", () => {
  it("grava a primeira mensagem de cada campo e indica se deve toastar", () => {
    const setError = vi.fn();
    const withFields = applyActionFailureToForm(setError, {
      fieldErrors: { full_name: ["Informe o nome.", "ignorada"] },
    });
    expect(setError).toHaveBeenCalledWith("full_name", { message: "Informe o nome." });
    expect(withFields.toastError).toBe(false);

    setError.mockClear();
    const withoutFields = applyActionFailureToForm(setError, {
      fieldErrors: undefined,
    });
    expect(setError).not.toHaveBeenCalled();
    expect(withoutFields.toastError).toBe(true);
  });
});
