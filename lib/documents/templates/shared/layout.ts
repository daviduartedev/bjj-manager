import { escapeHtml } from "./format";

export type LayoutOptions = {
  title: string;
  reissue?: { isReissue: boolean; version: number; reason: string | null };
  body: string;
  footer?: string;
};

const BASE_STYLE = `
  *{box-sizing:border-box}
  body{margin:0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#0F172A;background:#fff;font-size:11pt;line-height:1.45}
  .page{padding:0;}
  .header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E2E8F0;padding-bottom:12px;margin-bottom:20px}
  .brand{font-size:9pt;letter-spacing:.04em;text-transform:uppercase;color:#475569}
  .doc-number{font-size:9pt;color:#475569}
  .title{font-size:18pt;font-weight:700;margin:0 0 6px;letter-spacing:.01em}
  .subtitle{font-size:10pt;color:#475569;margin:0 0 18px}
  .reissue-banner{display:inline-flex;align-items:center;gap:6px;background:#FEF3C7;border:1px solid #F59E0B;color:#78350F;font-size:9pt;font-weight:600;padding:4px 10px;border-radius:9999px;margin-bottom:16px}
  .section{margin:18px 0}
  .row{display:flex;flex-wrap:wrap;gap:12px}
  .row .field{flex:1 1 240px}
  .label{font-size:8.5pt;color:#64748B;text-transform:uppercase;letter-spacing:.06em;margin:0 0 2px}
  .value{font-size:11pt;font-weight:500;margin:0}
  .amount{font-size:24pt;font-weight:700;color:#0F172A;margin:0;letter-spacing:.01em}
  .desc{font-size:11pt;color:#1E293B;margin:0}
  .signature{margin-top:48px;text-align:center}
  .signature-line{display:inline-block;width:60%;border-top:1px solid #0F172A;padding-top:6px;font-size:10pt}
  .signature-img{max-height:64px;max-width:240px;margin:0 auto 4px;display:block}
  .footer{margin-top:36px;padding-top:12px;border-top:1px solid #E2E8F0;font-size:8.5pt;color:#64748B;text-align:center}
  .table{width:100%;border-collapse:collapse;margin-top:8px}
  .table th,.table td{text-align:left;font-size:10pt;padding:6px 4px;border-bottom:1px solid #E2E8F0}
  .table th{font-weight:600;color:#334155}
  .body-text{white-space:pre-line;font-size:11pt;line-height:1.55}
`;

export function buildLayout({ title, reissue, body, footer }: LayoutOptions): string {
  const reissueBanner =
    reissue?.isReissue && reissue.version > 1
      ? `<div class="reissue-banner">2ª via — versão ${reissue.version}${
          reissue.reason ? ` · ${escapeHtml(reissue.reason)}` : ""
        }</div>`
      : "";

  const footerHtml = footer
    ? `<div class="footer">${footer}</div>`
    : `<div class="footer">Documento gerado eletronicamente por Casca · ${new Date().getFullYear()}</div>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${BASE_STYLE}</style>
</head>
<body>
  <main class="page">
    ${reissueBanner}
    ${body}
    ${footerHtml}
  </main>
</body>
</html>`;
}
