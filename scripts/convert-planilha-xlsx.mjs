/**
 * Lê `Planilha Alunos ASLAM.xlsx` (abas ADULTO e KIDS) e gera
 * `scripts/data/aslam-adults.tsv` e `scripts/data/aslam-kids.tsv`
 * para `pnpm import:sheet`.
 *
 * Uso:
 *   node scripts/convert-planilha-xlsx.mjs [caminho.xlsx]
 *
 * Caminho por defeito: %USERPROFILE%/Downloads/Planilha Alunos ASLAM.xlsx
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(__dirname, "data");

const ADULT_BELT = {
  PRETA: "black",
  MARROM: "brown",
  ROXA: "purple",
  AZUL: "blue",
  BRANCA: "white",
  LARANJA: "blue",
};

const KIDS_BELT = {
  LARANJA: "orange",
  AMARELA: "yellow",
  CINZA: "gray",
  BRANCA: "white",
  VERDE: "green",
  "VERDE E BRANCA": "green_white",
  "AMARELA E BRANCA": "yellow_white",
  "LARANJA E BRANCA": "orange_white",
  CINZA_E_BRANCA: "gray_white",
};

function normFaixa(s) {
  return String(s ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function beltSlug(kind, faixaRaw) {
  const f = normFaixa(faixaRaw);
  const map = kind === "kids" ? KIDS_BELT : ADULT_BELT;
  if (map[f]) return map[f];
  const compact = f.replace(/\s+/g, "_");
  if (map[compact]) return map[compact];
  throw new Error(`Faixa não mapeada (${kind}): "${faixaRaw}"`);
}

/** Excel pode guardar ano (2017) ou serial de data. */
function startYearFromCell(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    if (v >= 1900 && v <= 2100) return Math.floor(v);
    if (v > 30000 && v < 60000) {
      const d = excelSerialToDate(v);
      return d ? d.getFullYear() : null;
    }
    return null;
  }
  const n = parseInt(String(v).trim(), 10);
  if (!Number.isNaN(n) && n >= 1900 && n <= 2100) return n;
  return null;
}

function excelSerialToDate(serial) {
  if (typeof serial !== "number" || serial < 20000) return null;
  const utc = Math.round((serial - 25569) * 86400 * 1000);
  return new Date(utc);
}

/** Formata data do serial Excel em UTC (evita deslocar para o mês anterior). */
function isoDateUtcFromExcelSerial(serial) {
  const d = excelSerialToDate(serial);
  if (!d) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Coluna mensalidade: Excel grava 120 = R$ 120,00 (número).
 * Texto "R$ 120,00" / "1.234,56" também suportado.
 */
function feeToCents(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && !Number.isNaN(v)) {
    return Math.round(v * 100);
  }
  const s = String(v)
    .trim()
    .replace(/R\$\s*/i, "")
    .replace(/\s/g, "");
  if (!s) return 0;
  const normalized = s.includes(",")
    ? s.replace(/\./g, "").replace(",", ".")
    : s.replace(",", ".");
  const n = parseFloat(normalized);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

/** Data da coluna "Ano de graduação": só para faixas coloridas (não branca). YYYY-MM-DD */
function graduationIsoFromCell(raw, beltSlug) {
  if (!beltSlug || beltSlug === "white") return "";
  if (raw == null || raw === "") return "";
  if (typeof raw === "number") {
    if (raw >= 1900 && raw <= 2100) return `${Math.floor(raw)}-01-01`;
    const iso = isoDateUtcFromExcelSerial(raw);
    return iso || "";
  }
  const s = String(raw).trim();
  const slash = /^(\d{1,2})\/(\d{4})$/.exec(s);
  if (slash) {
    const mm = slash[1].padStart(2, "0");
    return `${slash[2]}-${mm}-01`;
  }
  const yOnly = /^(\d{4})$/.exec(s);
  if (yOnly) return `${yOnly[1]}-01-01`;
  return "";
}

function normStatus(s) {
  return String(s ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[ÇÃ]/g, (c) => (c === "Ç" ? "C" : "A"));
}

function bool01(v) {
  if (v === true || v === 1) return "1";
  if (v === false || v === 0) return "0";
  const t = String(v).trim().toUpperCase();
  if (t === "TRUE" || t === "1" || t === "SIM") return "1";
  return "0";
}

function rowToTsvLine(cols) {
  return cols.join("\t");
}

function parseSheet(wb, sheetName, kind) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error(`Aba em falta: ${sheetName}`);
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true });
  if (!rows.length) return [];

  const header = rows[0].map((h) => String(h ?? "").trim());
  /** Índice da coluna STATUS (KIDS às vezes vem com cabeçalho vazio antes de JAN). */
  let statusIdx = header.findIndex((h) => h === "STATUS");
  if (statusIdx < 0 && sheetName === "KIDS") {
    statusIdx = 6;
  }
  const janIdx = header.findIndex((h) => h === "JAN");
  if (janIdx < 0) throw new Error(`Coluna JAN não encontrada em ${sheetName}`);

  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const nome = String(row[0] ?? "").trim();
    if (!nome) continue;

    let status = row[statusIdx] ?? "";
    if (sheetName === "KIDS" && String(status).trim() === "") {
      status = row[6] ?? "";
    }
    status = normStatus(status);

    const faixa = row[3];
    let slug;
    try {
      slug = beltSlug(kind, faixa);
    } catch (e) {
      console.warn(`Linha ${r + 1} (${sheetName}) ignorada: ${e.message}`);
      continue;
    }

    const startYear = startYearFromCell(row[2]) ?? new Date().getFullYear();
    const fee = feeToCents(row[5]);
    const graduatedAt = graduationIsoFromCell(row[4], slug);

    const months = [];
    for (let m = 0; m < 12; m++) {
      months.push(bool01(row[janIdx + m]));
    }

    out.push({
      name: nome,
      startYear,
      belt: slug,
      fee_cents: fee,
      status,
      months,
      graduated_at: graduatedAt,
    });
  }
  return out;
}

function writeKidsTsv(rows) {
  const header =
    "name\tstartYear\tbelt\tfee_cents\tstatus\tjan\tfeb\tmar\tapr\tmay\tjun\tjul\taug\tsep\toct\tnov\tdec\tgraduated_at";
  const lines = [header];
  for (const r of rows) {
    lines.push(
      rowToTsvLine([
        r.name,
        r.startYear,
        r.belt,
        r.fee_cents,
        r.status,
        ...r.months,
        r.graduated_at ?? "",
      ]),
    );
  }
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, "aslam-kids.tsv"), lines.join("\n") + "\n", "utf8");
}

function writeAdultsTsv(rows) {
  const header =
    "name\tstartYear\tbelt\tfee_cents\tstatus\tjan\tfeb\tmar\tapr\tmay\tjun\tjul\taug\tsep\toct\tnov\tdec\tgraduated_at";
  const lines = [header];
  for (const r of rows) {
    lines.push(
      rowToTsvLine([
        r.name,
        r.startYear,
        r.belt,
        r.fee_cents,
        r.status,
        ...r.months,
        r.graduated_at ?? "",
      ]),
    );
  }
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, "aslam-adults.tsv"), lines.join("\n") + "\n", "utf8");
}

const defaultXlsx = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  "Downloads",
  "Planilha Alunos ASLAM.xlsx",
);
const xlsxPath = path.resolve(process.argv[2] || defaultXlsx);

if (!fs.existsSync(xlsxPath)) {
  console.error(`Ficheiro não encontrado: ${xlsxPath}`);
  process.exit(2);
}

const wb = XLSX.readFile(xlsxPath);
const adults = parseSheet(wb, "ADULTO", "adult");
const kids = parseSheet(wb, "KIDS", "kids");

writeAdultsTsv(adults);
writeKidsTsv(kids);

console.log(
  `Gerado a partir de:\n  ${xlsxPath}\nADULTO: ${adults.length} linhas → scripts/data/aslam-adults.tsv\nKIDS: ${kids.length} linhas → scripts/data/aslam-kids.tsv\nPróximo passo: pnpm import:sheet`,
);
