import type { ReceiverInfo } from "@/lib/documents/types";

import type { AddressFields } from "./schema";
import { escapeHtml, formatCnpjMask, formatDateBr } from "../../shared/format";

const ASLAM_STYLES = `
  .aslam-doc { font-size: 10pt; line-height: 1.55; color: #0F172A; }
  .aslam-header { display: flex; align-items: center; gap: 20px; padding-bottom: 14px; margin-bottom: 18px; border-bottom: 2px solid #0F172A; }
  .aslam-logo { width: 72px; height: 72px; object-fit: contain; flex-shrink: 0; }
  .aslam-header-meta { flex: 1; min-width: 0; }
  .aslam-academy { margin: 0; font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; }
  .aslam-sub { margin: 2px 0 0; font-size: 9pt; color: #475569; }
  .aslam-ref { margin: 6px 0 0; font-size: 8.5pt; color: #64748B; }
  .aslam-title { font-size: 11.5pt; font-weight: 700; text-align: center; margin: 0 0 20px; line-height: 1.4; text-transform: uppercase; }
  .aslam-section { margin: 18px 0; page-break-inside: avoid; }
  .aslam-section-title { margin: 0 0 10px; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #334155; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
  .aslam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
  .aslam-field { margin: 0; }
  .aslam-field-full { grid-column: 1 / -1; }
  .aslam-label { display: block; font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #64748B; margin-bottom: 2px; }
  .aslam-value { display: block; font-size: 10pt; font-weight: 500; min-height: 1.2em; border-bottom: 1px solid #CBD5E1; padding-bottom: 2px; }
  .aslam-value.empty { color: #94A3B8; font-weight: 400; }
  .aslam-bool-row { display: flex; align-items: center; gap: 12px; font-size: 9.5pt; margin: 4px 0; }
  .aslam-bool-opt { display: inline-flex; align-items: center; gap: 4px; }
  .aslam-intro { margin: 14px 0; text-align: justify; font-size: 10pt; line-height: 1.6; }
  .aslam-clauses { margin: 12px 0; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; }
  .aslam-clauses ol { margin: 0; padding-left: 1.25rem; }
  .aslam-clauses li { margin: 8px 0; text-align: justify; }
  .aslam-clauses p { margin: 0; text-align: justify; line-height: 1.6; }
  .aslam-legal-note { margin-top: 14px; font-size: 9.5pt; text-align: justify; font-style: italic; color: #334155; }
  .aslam-signature { margin-top: 36px; text-align: center; page-break-inside: avoid; }
  .aslam-signature-place { margin: 0 0 12px; font-size: 10pt; }
  .aslam-signature-img { max-height: 72px; max-width: 260px; margin: 0 auto 8px; display: block; }
  .aslam-signature-line { display: inline-block; width: 65%; border-top: 1px solid #0F172A; padding-top: 6px; margin-top: 40px; font-size: 9.5pt; font-weight: 600; }
  .aslam-signature-cpf { margin-top: 8px; font-size: 9pt; color: #475569; }
`;

function fieldValue(value: string | null | undefined): string {
  const v = value?.trim();
  if (!v) return `<span class="aslam-value empty">___________________________</span>`;
  return `<span class="aslam-value">${escapeHtml(v)}</span>`;
}

function fieldBlock(label: string, value: string | null | undefined, full = false): string {
  return `<div class="aslam-field${full ? " aslam-field-full" : ""}">
    <span class="aslam-label">${escapeHtml(label)}</span>
    ${fieldValue(value)}
  </div>`;
}

function boolRow(label: string, value: boolean | null | undefined): string {
  const sim = value === true ? "☑" : "☐";
  const nao = value === false ? "☑" : "☐";
  return `<p class="aslam-bool-row">
    <span>${escapeHtml(label)}</span>
    <span class="aslam-bool-opt">( ${sim} ) SIM</span>
    <span class="aslam-bool-opt">( ${nao} ) NÃO</span>
  </p>`;
}

function formatAddress(addr: AddressFields): string {
  return `${addr.street}, n° ${addr.number}, Bairro ${addr.neighborhood}, ${addr.city}/${addr.state}, CEP ${addr.zip}`;
}

function signatureImageHtml(dataUrl?: string | null): string {
  if (!dataUrl) return "";
  return `<img src="${dataUrl}" alt="Assinatura" class="aslam-signature-img" />`;
}

function renderHeader(args: {
  logoDataUrl: string;
  receiver: ReceiverInfo;
  documentNumber: string;
  issuedAt: string;
}): string {
  const academy = args.receiver.legalName ?? args.receiver.academyName;
  const cnpj = args.receiver.cnpj
    ? `CNPJ ${escapeHtml(formatCnpjMask(args.receiver.cnpj))}`
    : "Associação de Lutas e Artes Marciais — ASLAM";

  return `
    <header class="aslam-header">
      <img class="aslam-logo" src="${args.logoDataUrl}" alt="ASLAM" />
      <div class="aslam-header-meta">
        <p class="aslam-academy">${escapeHtml(academy)}</p>
        <p class="aslam-sub">${cnpj}</p>
        <p class="aslam-ref">Documento ${escapeHtml(args.documentNumber)} · Emitido em ${escapeHtml(formatDateBr(args.issuedAt))}</p>
      </div>
    </header>
  `;
}

function renderNumberedClauses(clauses: string): string {
  const items = clauses
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+\)\s*/, ""));

  if (items.length <= 1) {
    return `<div class="aslam-clauses"><p>${escapeHtml(clauses.trim())}</p></div>`;
  }

  return `<div class="aslam-clauses"><ol>${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ol></div>`;
}

export type MinorTemplateData = {
  receiver: ReceiverInfo;
  logoDataUrl: string;
  academyName: string;
  documentNumber: string;
  issuedAt: string;
  guardian: {
    fullName: string;
    rg: string | null;
    cpf: string | null;
    phone: string | null;
    municipality: string | null;
    state: string | null;
    address: AddressFields;
  };
  student: {
    fullName: string;
    age: number | null;
    hasDisability: boolean | null;
    usesMedication: boolean | null;
    medicationDetails: string | null;
    lastPhysicalExamDate: string | null;
    medicalConditions: string | null;
  };
  signaturePlace: string;
  clauses: string;
  signatureImageDataUrl?: string | null;
};

export function renderMinorTemplate(data: MinorTemplateData): string {
  const g = data.guardian;
  const s = data.student;
  const examDate = s.lastPhysicalExamDate
    ? formatDateBr(s.lastPhysicalExamDate)
    : "____/____/_____";

  return `
    <style>${ASLAM_STYLES}</style>
    <div class="aslam-doc">
      ${renderHeader({
        logoDataUrl: data.logoDataUrl,
        receiver: data.receiver,
        documentNumber: data.documentNumber,
        issuedAt: data.issuedAt,
      })}
      <h1 class="aslam-title">Matrícula e Termo de Responsabilidade — Autorização para Participação de Atleta (Menor de 18 anos) em Aulas de Jiu-Jitsu</h1>

      <section class="aslam-section">
        <h2 class="aslam-section-title">Dados do responsável legal</h2>
        <div class="aslam-grid">
          ${fieldBlock("Nome pai/mãe/responsável", g.fullName, true)}
          ${fieldBlock("RG", g.rg)}
          ${fieldBlock("CPF", g.cpf)}
          ${fieldBlock("Telefone", g.phone)}
          ${fieldBlock("Município", g.municipality)}
          ${fieldBlock("Estado", g.state)}
          ${fieldBlock("Endereço", formatAddress(g.address), true)}
        </div>
      </section>

      <section class="aslam-section">
        <h2 class="aslam-section-title">Dados do(a) menor</h2>
        <div class="aslam-grid">
          ${fieldBlock("Nome do(a) menor", s.fullName, true)}
          ${fieldBlock("Idade", s.age != null ? String(s.age) : null)}
        </div>
      </section>

      <section class="aslam-section">
        <h2 class="aslam-section-title">Questionário de saúde</h2>
        ${boolRow("É portador de deficiência", s.hasDisability)}
        ${boolRow("Faz uso de algum medicamento", s.usesMedication)}
        ${fieldBlock("Qual(is) medicamento(s)", s.medicationDetails, true)}
        <div class="aslam-field aslam-field-full" style="margin-top:8px">
          <span class="aslam-label">Data do último exame físico</span>
          <span class="aslam-value">${escapeHtml(examDate)}</span>
        </div>
        ${fieldBlock("Condições médicas ou problemas não mencionados", s.medicalConditions, true)}
      </section>

      <p class="aslam-intro">
        Eu, <strong>${escapeHtml(g.fullName)}</strong>, na qualidade de responsável pelo(a) menor,
        <strong>autorizo-o(a)</strong> a participar das aulas de Jiu-Jitsu na ${escapeHtml(data.academyName)},
        declarando ter conhecimento do Regulamento das Aulas e comprometendo-me a acompanhá-lo(a).
        Assumo toda a responsabilidade pela presente autorização, conforme os termos abaixo:
      </p>

      ${renderNumberedClauses(data.clauses)}

      <p class="aslam-legal-note">
        Por ser verdade, firmo a presente autorização sob as penas da Lei e confirmo a veracidade das declarações.
      </p>

      <section class="aslam-signature">
        <p class="aslam-signature-place">${escapeHtml(data.signaturePlace)}, ${escapeHtml(formatDateBr(data.issuedAt))}</p>
        ${signatureImageHtml(data.signatureImageDataUrl)}
        <div class="aslam-signature-line">Assinatura do Responsável</div>
        ${g.cpf ? `<p class="aslam-signature-cpf">CPF: ${escapeHtml(g.cpf)}</p>` : ""}
      </section>
    </div>
  `;
}

export type AdultTemplateData = {
  receiver: ReceiverInfo;
  logoDataUrl: string;
  academyName: string;
  documentNumber: string;
  issuedAt: string;
  student: {
    fullName: string;
    rg: string | null;
    cpf: string | null;
    address: AddressFields;
    age: number | null;
    hasDisability: boolean | null;
    usesMedication: boolean | null;
    medicationDetails: string | null;
    lastPhysicalExamDate: string | null;
    medicalConditions: string | null;
  };
  signaturePlace: string;
  clauses: string;
  signatureImageDataUrl?: string | null;
};

export function renderAdultTemplate(data: AdultTemplateData): string {
  const s = data.student;
  const examDate = s.lastPhysicalExamDate
    ? formatDateBr(s.lastPhysicalExamDate)
    : "____/____/_____";

  return `
    <style>${ASLAM_STYLES}</style>
    <div class="aslam-doc">
      ${renderHeader({
        logoDataUrl: data.logoDataUrl,
        receiver: data.receiver,
        documentNumber: data.documentNumber,
        issuedAt: data.issuedAt,
      })}
      <h1 class="aslam-title">Matrícula e Termo de Responsabilidade de Atleta de Jiu-Jitsu</h1>

      <section class="aslam-section">
        <h2 class="aslam-section-title">Dados do praticante</h2>
        <div class="aslam-grid">
          ${fieldBlock("Nome completo", s.fullName, true)}
          ${fieldBlock("RG", s.rg)}
          ${fieldBlock("CPF", s.cpf)}
          ${fieldBlock("Idade", s.age != null ? String(s.age) : null)}
          ${fieldBlock("Endereço", formatAddress(s.address), true)}
        </div>
      </section>

      <section class="aslam-section">
        <h2 class="aslam-section-title">Questionário de saúde</h2>
        ${boolRow("É portador de deficiência", s.hasDisability)}
        ${boolRow("Faz uso de algum medicamento", s.usesMedication)}
        ${fieldBlock("Qual(is) medicamento(s)", s.medicationDetails, true)}
        <div class="aslam-field aslam-field-full" style="margin-top:8px">
          <span class="aslam-label">Data do último exame físico</span>
          <span class="aslam-value">${escapeHtml(examDate)}</span>
        </div>
        ${fieldBlock("Condições médicas ou problemas não mencionados", s.medicalConditions, true)}
      </section>

      <p class="aslam-intro">
        Eu, abaixo identificado(a), declaro estar ciente dos riscos inerentes à prática do Jiu-Jitsu
        na ${escapeHtml(data.academyName)} e concordo com os termos de responsabilidade a seguir:
      </p>

      ${renderNumberedClauses(data.clauses)}

      <section class="aslam-signature">
        <p class="aslam-signature-place">${escapeHtml(data.signaturePlace)}, ${escapeHtml(formatDateBr(data.issuedAt))}</p>
        ${signatureImageHtml(data.signatureImageDataUrl)}
        <div class="aslam-signature-line">Assinatura do Praticante</div>
        ${s.cpf ? `<p class="aslam-signature-cpf">CPF: ${escapeHtml(s.cpf)}</p>` : ""}
      </section>
    </div>
  `;
}
