import { describe, expect, it } from "vitest";

import {
  buildPaymentReminderRows,
  filterPaymentReminderRows,
  paginatePaymentReminderRows,
} from "./payment-reminders";

const sample = [
  { studentId: "1", fullName: "Ana Costa", whatsappHref: "https://wa.me/5511" },
  { studentId: "2", fullName: "Bruno Lima", whatsappHref: null },
  { studentId: "3", fullName: "Carla Nunes", whatsappHref: "https://wa.me/5512" },
];

describe("filterPaymentReminderRows", () => {
  it("filtra por nome sem distinguir maiúsculas", () => {
    const rows = filterPaymentReminderRows(sample, { query: "ana", phone: "all" });
    expect(rows.map((r) => r.studentId)).toEqual(["1"]);
  });

  it("mostra só quem tem WhatsApp", () => {
    const rows = filterPaymentReminderRows(sample, { query: "", phone: "whatsapp" });
    expect(rows.map((r) => r.studentId)).toEqual(["1", "3"]);
  });

  it("mostra só quem está sem telefone", () => {
    const rows = filterPaymentReminderRows(sample, { query: "", phone: "no_phone" });
    expect(rows.map((r) => r.studentId)).toEqual(["2"]);
  });
});

describe("paginatePaymentReminderRows", () => {
  it("corta a página e não passa do último índice", () => {
    const first = paginatePaymentReminderRows(sample, 1, 2);
    expect(first.rows.map((r) => r.studentId)).toEqual(["1", "2"]);
    expect(first.pageCount).toBe(2);
    const overflow = paginatePaymentReminderRows(sample, 9, 2);
    expect(overflow.page).toBe(2);
    expect(overflow.rows.map((r) => r.studentId)).toEqual(["3"]);
  });
});

describe("buildPaymentReminderRows", () => {
  it("keeps overdue names and builds a wa.me link when there is a phone", () => {
    const rows = buildPaymentReminderRows(
      [{ studentId: "s1", fullName: "João Silva", phone: "11988887777" }],
      "Aslam BJJ",
      "2026-09",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].fullName).toBe("João Silva");
    expect(rows[0].whatsappHref).toMatch(/^https:\/\/wa\.me\/55/);
    expect(rows[0].whatsappHref).toContain("Lembrete");
  });

  it("leaves href null when the phone is missing", () => {
    const rows = buildPaymentReminderRows(
      [{ studentId: "s2", fullName: "Maria", phone: null }],
      "Aslam BJJ",
      "2026-09",
    );
    expect(rows[0].whatsappHref).toBeNull();
  });
});
