"use client";

import { Check } from "lucide-react";

import {
  STUDENT_FORM_STEPS,
  studentFormProgressPercent,
} from "@/lib/validations/student-form-steps";
import { cn } from "@/lib/utils";

const STEP_HINT: Record<(typeof STUDENT_FORM_STEPS)[number]["id"], string> = {
  identificacao: "Nome, nascimento e tipo de aluno.",
  faixa: "Entrada na academia, faixa e grau.",
  mensalidade: "Isento, ou plano e dia de vencimento.",
  contactos: "CPF, telefone, e-mail e observações.",
};

type Props = {
  step: number;
  onSelectCompleted?: (stepIndex: number) => void;
};

export function StudentFormProgress({ step, onSelectCompleted }: Props) {
  const percent = studentFormProgressPercent(step);
  const current = STUDENT_FORM_STEPS[step];

  return (
    <div className="rounded-2xl border border-border bg-muted/80 px-3 py-4 sm:px-4">
      <ol className="grid grid-cols-4">
        {STUDENT_FORM_STEPS.map((item, index) => {
          const isCurrent = index === step;
          const isCompleted = index < step;
          const marker = (
            <span
              className={cn(
                "relative z-10 flex size-9 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                isCurrent &&
                  "bg-secondary text-secondary-foreground shadow-[0_8px_20px_-12px_rgba(15,23,42,0.8)] ring-4 ring-secondary/10",
                isCompleted &&
                  "bg-secondary text-secondary-foreground",
                !isCurrent &&
                  !isCompleted &&
                  "border border-border bg-card text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : index + 1}
            </span>
          );
          const label = (
            <span
              className={cn(
                "max-w-[5.5rem] text-center text-[11px] leading-tight sm:max-w-none sm:text-xs",
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          );

          return (
            <li key={item.id} className="relative flex flex-col items-center gap-2">
              {index < STUDENT_FORM_STEPS.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-1/2 top-[1.125rem] h-px w-full",
                    index < step
                      ? "bg-secondary"
                      : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
              {isCompleted && onSelectCompleted ? (
                <button
                  type="button"
                  className="relative z-10 flex flex-col items-center gap-2"
                  onClick={() => onSelectCompleted(index)}
                >
                  {marker}
                  {label}
                </button>
              ) : (
                <div
                  className="relative z-10 flex flex-col items-center gap-2"
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {marker}
                  {label}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={current?.label}
        aria-label="Progresso da ficha"
        className="sr-only"
      />
      {current ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{current.label}.</span>{" "}
          {STEP_HINT[current.id]}
        </p>
      ) : null}
    </div>
  );
}
