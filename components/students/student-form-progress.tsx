"use client";

import {
  STUDENT_FORM_STEPS,
  studentFormProgressPercent,
} from "@/lib/validations/student-form-steps";
import { cn } from "@/lib/utils";

type Props = {
  step: number;
  onSelectCompleted?: (stepIndex: number) => void;
};

export function StudentFormProgress({ step, onSelectCompleted }: Props) {
  const percent = studentFormProgressPercent(step);
  const current = STUDENT_FORM_STEPS[step];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium sm:hidden">{current?.label}</p>
      <ol className="hidden gap-2 sm:flex sm:justify-between">
        {STUDENT_FORM_STEPS.map((item, index) => {
          const isCurrent = index === step;
          const isCompleted = index < step;
          const className = cn(
            "text-xs",
            isCurrent && "font-medium text-foreground",
            isCompleted && "text-muted-foreground",
            !isCurrent && !isCompleted && "text-muted-foreground/60",
          );
          if (isCompleted && onSelectCompleted) {
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={className}
                  onClick={() => onSelectCompleted(index)}
                >
                  {item.label}
                </button>
              </li>
            );
          }
          return (
            <li
              key={item.id}
              className={className}
              aria-current={isCurrent ? "step" : undefined}
            >
              {item.label}
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
        className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className="h-full rounded-full bg-zinc-950 transition-[width] duration-200 dark:bg-zinc-100"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
