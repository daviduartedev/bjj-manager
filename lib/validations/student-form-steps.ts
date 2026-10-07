export const STUDENT_FORM_STEPS = [
  { id: "identificacao", label: "Identificação" },
  { id: "faixa", label: "Faixa" },
  { id: "mensalidade", label: "Mensalidade" },
  { id: "contactos", label: "Contactos" },
] as const;

export type StudentFormStepId = (typeof STUDENT_FORM_STEPS)[number]["id"];

export const STUDENT_FORM_STEP_FIELDS = {
  identificacao: ["full_name", "birth_date", "kind"],
  faixa: [
    "academy_start_date",
    "current_belt_id",
    "current_degree",
    "weight_kg",
  ],
  mensalidade: ["is_exempt", "plan_id", "due_day"],
  contactos: ["document", "phone", "guardian_phone", "email", "notes"],
} as const;

export type StudentFormStepFieldName =
  (typeof STUDENT_FORM_STEP_FIELDS)[StudentFormStepId][number];

export const STUDENT_FORM_STEP_COUNT = STUDENT_FORM_STEPS.length;

export const ISENTO_CONFIRM_MESSAGE =
  "Este aluno sai da cobrança de todas as mensalidades. Tem certeza?";

export const ISENTO_CLEAR_CONFIRM_MESSAGE =
  "Este aluno volta à cobrança de todas as mensalidades. Tem certeza?";

export function studentFormStepFields(
  stepIndex: number,
): readonly StudentFormStepFieldName[] {
  const step = STUDENT_FORM_STEPS[stepIndex];
  if (!step) return [];
  return STUDENT_FORM_STEP_FIELDS[step.id];
}

export function studentFormStepIndexForFields(
  fieldNames: Iterable<string>,
): number | null {
  const names = new Set(fieldNames);
  for (let i = 0; i < STUDENT_FORM_STEPS.length; i++) {
    if (studentFormStepFields(i).some((field) => names.has(field))) {
      return i;
    }
  }
  return null;
}

/** Fill = completed chunks / 4. The chunk in progress does not count. */
export function studentFormProgressPercent(completedChunks: number): number {
  const n = Math.min(
    STUDENT_FORM_STEP_COUNT,
    Math.max(0, Math.trunc(completedChunks)),
  );
  return n * 25;
}

type StepSchema = {
  safeParse: (data: unknown) =>
    | { success: true }
    | {
        success: false;
        error: {
          flatten: () => {
            fieldErrors: Record<string, string[] | undefined>;
          };
        };
      };
};

export function fieldErrorsOnStudentFormStep(
  fieldErrors: Record<string, string[] | undefined>,
  stepIndex: number,
): Record<string, string[]> {
  const names = new Set<string>(studentFormStepFields(stepIndex));
  const out: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (!names.has(key) || !messages?.length) continue;
    const kept = messages.filter((message) => message.length > 0);
    if (kept.length === 0) continue;
    out[key] = kept;
  }
  return out;
}

export function validateStudentFormStep(
  schema: StepSchema,
  values: unknown,
  stepIndex: number,
): { ok: true } | { ok: false; fieldErrors: Record<string, string[]> } {
  const parsed = schema.safeParse(values);
  if (parsed.success) return { ok: true };
  const fieldErrors = fieldErrorsOnStudentFormStep(
    parsed.error.flatten().fieldErrors,
    stepIndex,
  );
  if (Object.keys(fieldErrors).length === 0) return { ok: true };
  return { ok: false, fieldErrors };
}
