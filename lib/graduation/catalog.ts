import type { BeltCatalogRow } from "@/lib/data/students-catalog";

import type { BeltRef } from "./types";

export function buildBeltCatalogMap(
  belts: BeltCatalogRow[],
): Map<string, BeltRef> {
  const map = new Map<string, BeltRef>();
  for (const b of belts) {
    map.set(b.id, {
      id: b.id,
      kind: b.kind,
      slug: b.slug,
      ordinal: b.ordinal,
    });
  }
  return map;
}
