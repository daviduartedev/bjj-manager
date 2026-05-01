/**
 * Rótulos pt-BR para enums persistidos em inglês no Postgres (BR-7.3).
 */

export const paymentStatusLabels: Record<
  "pending" | "paid" | "unpaid" | "scholarship" | "other",
  string
> = {
  pending: "Pendente",
  paid: "Pago",
  unpaid: "Não pago",
  scholarship: "Bolsista",
  other: "Outro",
};

export const planKindLabels: Record<"kids_1" | "kids_2" | "adult", string> = {
  kids_1: "Kids 1",
  kids_2: "Kids 2",
  adult: "Adulto",
};

export const studentStatusLabels: Record<
  "active" | "inactive" | "trial" | "paused",
  string
> = {
  active: "Ativo",
  inactive: "Inativo",
  trial: "Trial",
  paused: "Pausado",
};

export const studentKindLabels: Record<"adult" | "kids", string> = {
  adult: "Adulto",
  kids: "Kids",
};

export const beltKindLabels: Record<"adult" | "kids", string> = {
  adult: "Adulto",
  kids: "Kids",
};
