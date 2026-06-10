import { isValidDegreeForBelt } from "@/lib/students/degree";

import type { BeltRef, GraduationEventInput } from "./types";

export function beltById(
  catalog: Map<string, BeltRef>,
  beltId: string,
): BeltRef | null {
  return catalog.get(beltId) ?? null;
}

export function compareBeltOrdinal(
  a: BeltRef,
  b: BeltRef,
): number {
  if (a.kind !== b.kind) {
    return a.kind === "adult" ? 1 : -1;
  }
  return a.ordinal - b.ordinal;
}

export function compareState(
  a: { belt: BeltRef; degree: number },
  b: { belt: BeltRef; degree: number },
): number {
  const beltCmp = compareBeltOrdinal(a.belt, b.belt);
  if (beltCmp !== 0) return beltCmp;
  return a.degree - b.degree;
}

export function isBeltSkip(from: BeltRef, to: BeltRef): boolean {
  if (from.kind !== to.kind) return true;
  return to.ordinal - from.ordinal > 1;
}

export function isSameBelt(from: BeltRef, to: BeltRef): boolean {
  return from.id === to.id;
}

/**
 * Valida transição entre dois estados consecutivos na timeline (GRD-3).
 */
export function validateStep(
  from: { belt: BeltRef; degree: number },
  to: { belt: BeltRef; degree: number },
  wasSkip: boolean,
  skipReason: string | null,
): string | null {
  const cmp = compareState(from, to);
  if (cmp >= 0) {
    return "Não é permitido regresso de faixa ou grau.";
  }

  if (isSameBelt(from.belt, to.belt)) {
    if (to.degree !== from.degree + 1) {
      return "Na mesma faixa só é válido avançar exactamente um grau.";
    }
    if (wasSkip) {
      return "Pulo de faixa não se aplica quando a faixa se mantém.";
    }
    return null;
  }

  if (!isValidDegreeForBelt(to.belt.slug, to.belt.kind, to.degree)) {
    return "Grau inválido para a faixa resultante.";
  }

  const skipped = isBeltSkip(from.belt, to.belt);
  if (skipped) {
    if (!wasSkip) {
      return "Pulo de faixa exige marcação e justificativa.";
    }
    if (!skipReason?.trim()) {
      return "Informe a justificativa do pulo de faixa.";
    }
    return null;
  }

  if (to.belt.ordinal !== from.belt.ordinal + 1) {
    return "Mudança de faixa inválida.";
  }
  if (wasSkip) {
    return "Justificativa de pulo só se aplica quando houve pulo de faixa.";
  }
  return null;
}

export function sortGraduationEvents(
  events: GraduationEventInput[],
): GraduationEventInput[] {
  return [...events].sort((a, b) => {
    const ta = new Date(a.graduated_at).getTime();
    const tb = new Date(b.graduated_at).getTime();
    if (ta !== tb) return ta - tb;
    const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
    const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ca - cb;
  });
}

export function validateTimeline(
  events: GraduationEventInput[],
  catalog: Map<string, BeltRef>,
): string | null {
  const sorted = sortGraduationEvents(events);
  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i]!;
    const toBelt = beltById(catalog, ev.resulting_belt_id);
    if (!toBelt) return "Faixa inválida.";
    if (
      !isValidDegreeForBelt(
        toBelt.slug,
        toBelt.kind,
        ev.resulting_degree,
      )
    ) {
      return "Grau inválido para a faixa.";
    }

    if (i === 0) continue;

    const prev = sorted[i - 1]!;
    const fromBelt = beltById(catalog, prev.resulting_belt_id);
    if (!fromBelt) return "Faixa inválida no histórico.";

    const stepErr = validateStep(
      { belt: fromBelt, degree: prev.resulting_degree },
      { belt: toBelt, degree: ev.resulting_degree },
      ev.was_skip,
      ev.skip_reason,
    );
    if (stepErr) return stepErr;
  }
  return null;
}

export function latestGraduationEvent(
  events: GraduationEventInput[],
): GraduationEventInput | null {
  if (!events.length) return null;
  const sorted = [...events].sort((a, b) => {
    const ta = new Date(a.graduated_at).getTime();
    const tb = new Date(b.graduated_at).getTime();
    if (ta !== tb) return tb - ta;
    const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
    const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return cb - ca;
  });
  return sorted[0] ?? null;
}
