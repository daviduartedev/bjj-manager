import { describe, expect, it } from "vitest";

import {
  getCheckinWindowState,
  isCheckinWindowOpen,
} from "@/lib/classes/checkin-window";

/** Instante em SP: 2026-06-02 19:00 (aula). */
const SESSION_DATE = "2026-06-02";
const START_TIME = "19:00:00";

describe("checkin-window", () => {
  it("rejeita antes de abrir (mais de 6h antes)", () => {
    const now = new Date("2026-06-02T09:00:00-03:00");
    expect(getCheckinWindowState(SESSION_DATE, START_TIME, now)).toBe("not_yet_open");
    expect(isCheckinWindowOpen(SESSION_DATE, START_TIME, now)).toBe(false);
  });

  it("aceita dentro da janela (4h antes)", () => {
    const now = new Date("2026-06-02T15:00:00-03:00");
    expect(getCheckinWindowState(SESSION_DATE, START_TIME, now)).toBe("open");
    expect(isCheckinWindowOpen(SESSION_DATE, START_TIME, now)).toBe(true);
  });

  it("aceita no limite de abertura (exactamente 6h antes)", () => {
    const now = new Date("2026-06-02T13:00:00-03:00");
    expect(getCheckinWindowState(SESSION_DATE, START_TIME, now)).toBe("open");
  });

  it("rejeita após início da aula", () => {
    const now = new Date("2026-06-02T19:00:00-03:00");
    expect(getCheckinWindowState(SESSION_DATE, START_TIME, now)).toBe("closed");
    expect(isCheckinWindowOpen(SESSION_DATE, START_TIME, now)).toBe(false);
  });

  it("rejeita após início (durante a aula)", () => {
    const now = new Date("2026-06-02T19:30:00-03:00");
    expect(getCheckinWindowState(SESSION_DATE, START_TIME, now)).toBe("closed");
  });
});
