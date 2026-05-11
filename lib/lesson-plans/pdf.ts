import "server-only";

import { renderHtmlToPdf } from "@/lib/documents/renderer";
import {
  escapeHtml,
  formatDateBr,
  formatMonthYearBr,
} from "@/lib/documents/templates/shared/format";
import { buildLayout } from "@/lib/documents/templates/shared/layout";
import { planKindLabels } from "@/lib/i18n/domain-enums";

import type { LessonPlanContent, LessonPlanItem, LessonPlanTopic } from "@/lib/validations/lesson-plans";

function renderItem(item: LessonPlanItem): string {
  const children = (item.children ?? [])
    .map(
      (c) =>
        `<li class="ml-4 list-[circle]">${escapeHtml(c.text)}</li>`,
    )
    .join("");
  return `
    <li>
      <span>${escapeHtml(item.text)}</span>
      ${children ? `<ul class="mt-1 ml-4 space-y-1 list-[circle] pl-4">${children}</ul>` : ""}
    </li>
  `;
}

function renderTopic(topic: LessonPlanTopic): string {
  return `
    <section class="topic">
      <h2 class="topic-title">${escapeHtml(topic.title)}</h2>
      ${topic.summary ? `<p class="topic-summary">${escapeHtml(topic.summary)}</p>` : ""}
      ${topic.items.length > 0 ? `<ul class="topic-items">${topic.items.map(renderItem).join("")}</ul>` : ""}
    </section>
  `;
}

export async function renderLessonPlanPdf(args: {
  academyName: string;
  legalName: string | null;
  planKind: "adult" | "kids_1" | "kids_2";
  referenceMonth: string;
  title: string;
  revisionNumber: number;
  content: LessonPlanContent;
}): Promise<Buffer> {
  const body = `
    <div class="header">
      <div class="brand">${escapeHtml(args.legalName ?? args.academyName)} · Plano pedagógico</div>
      <div class="doc-number">Revisão #${args.revisionNumber}</div>
    </div>

    <h1 class="title">${escapeHtml(args.title)}</h1>
    <p class="subtitle">${escapeHtml(planKindLabels[args.planKind])} · ${escapeHtml(formatMonthYearBr(args.referenceMonth))}</p>

    ${args.content.summary ? `<p class="body-text">${escapeHtml(args.content.summary)}</p>` : ""}

    <div class="lesson-plan">
      ${args.content.topics.map(renderTopic).join("")}
    </div>

    <p class="footer-note">Emitido em ${escapeHtml(formatDateBr(new Date()))}</p>

    <style>
      .topic{margin:16px 0}
      .topic-title{font-size:13pt;font-weight:600;margin:0 0 4px;color:#0F172A;border-left:3px solid #0EA5E9;padding-left:8px}
      .topic-summary{font-size:10.5pt;color:#475569;margin:0 0 6px}
      .topic-items{margin:6px 0 0 18px;padding-left:8px;list-style:disc}
      .topic-items li{margin:3px 0}
      .footer-note{margin-top:24px;font-size:9.5pt;color:#475569}
    </style>
  `;

  const html = buildLayout({
    title: args.title,
    body,
    footer: `${args.academyName} · ${args.title}`,
  });

  return renderHtmlToPdf(html);
}
