import { describe, expect, it } from "vitest";

import { buildStudentFullFormSchema } from "@/lib/validations/students";
import {
  ISENTO_CLEAR_CONFIRM_MESSAGE,
  ISENTO_CONFIRM_MESSAGE,
  STUDENT_FORM_STEPS,
  studentFormProgressPercent,
  studentFormStepFields,
  studentFormStepIndexForFields,
  validateStudentFormStep,
} from "@/lib/validations/student-form-steps";

const beltAdult = {
  id: "10000000-0000-4000-8000-000000000001",
  slug: "white",
  kind: "adult" as const,
};
const beltAdultBlue = {
  id: "10000000-0000-4000-8000-000000000005",
  slug: "blue",
  kind: "adult" as const,
};
const planAdult = {
  id: "20000000-0000-4000-8000-000000000001",
  kind: "adult" as const,
};

const schema = buildStudentFullFormSchema(
  [beltAdult, beltAdultBlue],
  [planAdult],
);

const validInput = {
  full_name: "Teste Silva",
  birth_date: "2010-05-01",
  academy_start_date: "2024-01-15",
  kind: "adult" as const,
  current_belt_id: beltAdult.id,
  current_degree: 0,
  is_exempt: false,
  plan_id: planAdult.id,
  due_day: 10,
};

describe("STUDENT_FORM_STEPS", () => {
  it("nomeia os quatro trechos sem numeração", () => {
    expect(STUDENT_FORM_STEPS.map((step) => step.label)).toEqual([
      "Identificação",
      "Faixa",
      "Mensalidade",
      "Contatos",
    ]);
  });
});

describe("studentFormStepFields", () => {
  it("agrupa nome, nascimento e tipo em Identificação", () => {
    expect(studentFormStepFields(0)).toEqual([
      "full_name",
      "birth_date",
      "kind",
    ]);
  });

  it("agrupa entrada, faixa, grau e peso em Faixa", () => {
    expect(studentFormStepFields(1)).toEqual([
      "academy_start_date",
      "current_belt_id",
      "current_degree",
      "weight_kg",
    ]);
  });

  it("agrupa isento, plano e vencimento em Mensalidade", () => {
    expect(studentFormStepFields(2)).toEqual([
      "is_exempt",
      "plan_id",
      "due_day",
    ]);
  });

  it("agrupa CPF, telefones, e-mail e observações em Contatos", () => {
    expect(studentFormStepFields(3)).toEqual([
      "document",
      "phone",
      "guardian_phone",
      "email",
      "notes",
    ]);
  });
});

describe("studentFormStepIndexForFields", () => {
  it("devolve o primeiro trecho que contém algum dos campos", () => {
    expect(studentFormStepIndexForFields(["email"])).toBe(3);
    expect(studentFormStepIndexForFields(["full_name", "email"])).toBe(0);
    expect(studentFormStepIndexForFields(["plan_id"])).toBe(2);
    expect(studentFormStepIndexForFields(["unknown"])).toBeNull();
  });
});

describe("studentFormProgressPercent", () => {
  it("enche 25% por trecho concluído", () => {
    expect(studentFormProgressPercent(0)).toBe(0);
    expect(studentFormProgressPercent(1)).toBe(25);
    expect(studentFormProgressPercent(2)).toBe(50);
    expect(studentFormProgressPercent(3)).toBe(75);
    expect(studentFormProgressPercent(4)).toBe(100);
  });
});

describe("validateStudentFormStep", () => {
  it("rejeita Identificação sem nome e ignora e-mail inválido de Contatos", () => {
    const result = validateStudentFormStep(
      schema,
      { ...validInput, full_name: "", email: "nao-e-email" },
      0,
    );
    expect(result).toEqual({
      ok: false,
      fieldErrors: { full_name: ["Informe o nome."] },
    });
  });

  it("avança Identificação mesmo com e-mail inválido ainda por preencher", () => {
    const result = validateStudentFormStep(
      schema,
      { ...validInput, email: "nao-e-email" },
      0,
    );
    expect(result).toEqual({ ok: true });
  });

  it("rejeita Faixa com ano de entrada futuro e não exige Contatos", () => {
    const result = validateStudentFormStep(
      schema,
      { ...validInput, academy_start_date: "2099-01-01", email: "nao-e-email" },
      1,
    );
    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        academy_start_date: ["O ano de entrada não pode ser no futuro."],
      },
    });
  });

  it("exige plano e vencimento em Mensalidade quando o aluno não é isento", () => {
    const result = validateStudentFormStep(
      schema,
      { ...validInput, plan_id: undefined, due_day: undefined },
      2,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.plan_id).toEqual(["Escolha o plano."]);
    expect(result.fieldErrors.due_day).toEqual(["Informe o dia de vencimento."]);
  });

  it("não exige plano em Mensalidade quando o aluno é isento", () => {
    const result = validateStudentFormStep(
      schema,
      {
        ...validInput,
        is_exempt: true,
        plan_id: undefined,
        due_day: undefined,
      },
      2,
    );
    expect(result).toEqual({ ok: true });
  });

  it("rejeita e-mail inválido só no trecho Contatos", () => {
    const result = validateStudentFormStep(
      schema,
      { ...validInput, email: "nao-e-email" },
      3,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors.email?.[0]).toBe("E-mail inválido.");
  });
});

describe("ISENTO_CONFIRM_MESSAGE", () => {
  it("trava a frase do diálogo de isento", () => {
    expect(ISENTO_CONFIRM_MESSAGE).toBe(
      "Este aluno sai da cobrança de todas as mensalidades. Tem certeza?",
    );
  });

  it("trava a frase ao desmarcar isento", () => {
    expect(ISENTO_CLEAR_CONFIRM_MESSAGE).toBe(
      "Este aluno volta à cobrança de todas as mensalidades. Tem certeza?",
    );
  });
});
