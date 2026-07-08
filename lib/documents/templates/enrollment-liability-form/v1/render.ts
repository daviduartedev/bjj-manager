import type { AddressFields } from "./schema";
import { escapeHtml, formatDateBr } from "../../shared/format";

function fieldLine(label: string, value: string | null | undefined): string {
  const v = value?.trim() ? escapeHtml(value) : "___________________________";
  return `<p class="form-line"><span class="form-label">${escapeHtml(label)}</span> ${v}</p>`;
}

function boolLine(label: string, value: boolean | null | undefined): string {
  const sim = value === true ? "☑" : "☐";
  const nao = value === false ? "☑" : "☐";
  return `<p class="form-line">${escapeHtml(label)}: ( ${sim} ) SIM ( ${nao} ) NÃO</p>`;
}

function formatAddress(addr: AddressFields): string {
  return `${addr.street}, n° ${addr.number}, Bairro ${addr.neighborhood}, ${addr.city}/${addr.state}, CEP ${addr.zip}`;
}

function signatureImageHtml(dataUrl?: string | null): string {
  if (!dataUrl) return "";
  return `<img src="${dataUrl}" alt="Assinatura" class="signature-img" />`;
}

export type MinorTemplateData = {
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
    <style>
      .aslam-form { font-size: 10.5pt; line-height: 1.5; }
      .aslam-title { font-size: 12pt; font-weight: 700; text-align: center; margin: 0 0 16px; text-transform: uppercase; }
      .form-line { margin: 6px 0; }
      .form-label { font-weight: 600; }
      .clauses { margin-top: 16px; white-space: pre-line; }
      .signature-block { margin-top: 32px; text-align: center; }
      .signature-line { display: inline-block; width: 70%; border-top: 1px solid #0F172A; padding-top: 6px; margin-top: 48px; }
      .signature-img { max-height: 80px; max-width: 280px; margin: 8px auto; display: block; }
    </style>
    <div class="aslam-form">
      <h1 class="aslam-title">Matrícula e Termo de Responsabilidade – Autorização para Participação de Atleta (Menor de 18 anos) em Aulas de Jiujitsu</h1>
      <p class="form-line"><span class="form-label">Ref.:</span> ${escapeHtml(data.documentNumber)} · ${escapeHtml(data.academyName)}</p>
      ${fieldLine("Nome pai/mãe/responsável", g.fullName)}
      ${fieldLine("RG", g.rg)}
      ${fieldLine("CPF", g.cpf)}
      ${fieldLine("Tel.", g.phone)}
      ${fieldLine("Município", g.municipality)}
      ${fieldLine("Estado", g.state)}
      <p class="form-line"><span class="form-label">Endereço:</span> ${escapeHtml(formatAddress(g.address))}</p>
      ${fieldLine("Nome do(a) menor", s.fullName)}
      ${fieldLine("IDADE", s.age != null ? String(s.age) : null)}
      ${boolLine("É PORTADOR DE DEFICIÊNCIA", s.hasDisability)}
      ${boolLine("FAZ USO DE ALGUM MEDICAMENTO", s.usesMedication)}
      ${fieldLine("QUAL (AIS)", s.medicationDetails)}
      <p class="form-line"><span class="form-label">DATA DO ÚLTIMO EXAME FÍSICO:</span> ${examDate}</p>
      ${fieldLine("POSSUI ALGUMA CONDIÇÃO MÉDICA OU PROBLEMAS NÃO PREVIAMENTE MENCIONADOS", s.medicalConditions)}
      <p class="form-line">Eu, <strong>${escapeHtml(g.fullName)}</strong>, na qualidade de responsável pelo(a) menor, AUTORIZO-O(A) a participar das Aulas de Jiu-Jitsu, compreendendo a inscrição nas aulas, que acontecem na ${escapeHtml(data.academyName)}, bem como, declaro ter conhecimento de todo o Regulamento das Aulas, aceitando todos os seus termos e, comprometendo-me a acompanha-lo (a). Assumo, ainda, toda a responsabilidade pela presente autorização e participação do menor, conforme Regulamento e nos seguintes termos: Declaram, ainda, o RESPONSÁVEL e MENOR/ATLETA:</p>
      <div class="clauses">${escapeHtml(data.clauses)}</div>
      <p class="form-line">Por ser verdade, firmo a presente autorização sob as penas da Lei e confirmo a veracidade das declarações.</p>
      <div class="signature-block">
        <p>${escapeHtml(data.signaturePlace)}, ${escapeHtml(formatDateBr(data.issuedAt))}</p>
        ${signatureImageHtml(data.signatureImageDataUrl)}
        <div class="signature-line">Assinatura do Responsável</div>
        ${fieldLine("CPF", g.cpf)}
      </div>
    </div>
  `;
}

export type AdultTemplateData = {
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
    <style>
      .aslam-form { font-size: 10.5pt; line-height: 1.5; }
      .aslam-title { font-size: 12pt; font-weight: 700; text-align: center; margin: 0 0 16px; text-transform: uppercase; }
      .form-line { margin: 6px 0; }
      .form-label { font-weight: 600; }
      .clauses { margin-top: 16px; white-space: pre-line; }
      .signature-block { margin-top: 32px; text-align: center; }
      .signature-line { display: inline-block; width: 70%; border-top: 1px solid #0F172A; padding-top: 6px; margin-top: 48px; }
      .signature-img { max-height: 80px; max-width: 280px; margin: 8px auto; display: block; }
    </style>
    <div class="aslam-form">
      <h1 class="aslam-title">Matrícula e Termo de Responsabilidade de Atleta de Jiu Jitsu</h1>
      <p class="form-line"><span class="form-label">Ref.:</span> ${escapeHtml(data.documentNumber)} · ${escapeHtml(data.academyName)}</p>
      ${fieldLine("Eu", s.fullName)}
      ${fieldLine("RG", s.rg)}
      ${fieldLine("CPF", s.cpf)}
      <p class="form-line"><span class="form-label">Endereço:</span> ${escapeHtml(formatAddress(s.address))}</p>
      ${fieldLine("IDADE", s.age != null ? String(s.age) : null)}
      ${boolLine("É PORTADOR DE DEFICIÊNCIA", s.hasDisability)}
      ${boolLine("FAZ USO DE ALGUM MEDICAMENTO", s.usesMedication)}
      ${fieldLine("QUAL (AIS)", s.medicationDetails)}
      <p class="form-line"><span class="form-label">DATA DO ÚLTIMO EXAME FÍSICO:</span> ${examDate}</p>
      ${fieldLine("POSSUI ALGUMA CONDIÇÃO MÉDICA OU PROBLEMAS NÃO PREVIAMENTE MENCIONADOS", s.medicalConditions)}
      <div class="clauses">${escapeHtml(data.clauses)}</div>
      <div class="signature-block">
        <p>${escapeHtml(data.signaturePlace)}, ${escapeHtml(formatDateBr(data.issuedAt))}</p>
        ${signatureImageHtml(data.signatureImageDataUrl)}
        <div class="signature-line">Assinatura do Praticante</div>
        ${fieldLine("CPF", s.cpf)}
      </div>
    </div>
  `;
}
