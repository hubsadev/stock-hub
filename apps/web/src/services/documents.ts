import { escapeHtml, formatDate } from "../utils/format";

export type MaterialRequestDocumentInput = {
  reference: string;
  docCode: string;
  exitReference: string;
  date: string;
  client: string;
  project: string;
  site: string;
  team: string;
  requester: string;
  stockManager: string;
  receivedBy: string;
  rows: string;
};

export type DownloadMaterialRequestPdfContext = {
  showToast: (
    root: HTMLElement,
    message: string,
    tone?: "success" | "error",
  ) => void;
  selectedText: (select: HTMLSelectElement | undefined) => string | undefined;
  toNumber: (value: string) => number;
  escapeHtml: (value: unknown) => string;
  formatNumber: (value: number | string) => string;
};

export function downloadMaterialRequestPdfDocument(
  root: HTMLElement,
  ctx: DownloadMaterialRequestPdfContext,
) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal || modal.dataset.mode !== "prepare") {
    ctx.showToast(
      root,
      "Le PDF final est disponible apres preparation de la demande.",
      "error",
    );
    return;
  }

  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const rows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr"),
  );
  const reference = "DS-AUTO";
  const docCode = reference.replace(/^DS-/, "DM-");
  const date =
    modal.querySelector<HTMLInputElement>('input[type="date"]')?.value ||
    new Date().toISOString().slice(0, 10);
  const client = ctx.selectedText(selects[0]) || "-";
  const project = ctx.selectedText(selects[1]) || "-";
  const team = ctx.selectedText(selects[2]) || "-";
  const site = ctx.selectedText(selects[3]) || "-";
  const requester = ctx.selectedText(selects[4]) || "-";
  const stockManager =
    ctx.selectedText(
      root.querySelector<HTMLSelectElement>("#materialStockManager") ??
        undefined,
    ) || "-";
  const receivedBy =
    ctx.selectedText(
      root.querySelector<HTMLSelectElement>("#materialReceivedBy") ?? undefined,
    ) || "-";

  const lineHtml = rows
    .map((row, index) => {
      const inputs = Array.from(
        row.querySelectorAll<HTMLInputElement>("input"),
      );
      const articleText =
        ctx.selectedText(
          row.querySelector<HTMLSelectElement>("select") ?? undefined,
        ) || "-";
      const articleName = articleText.replace(/\s*\([^)]*\)\s*$/, "");
      const articleCode =
        articleText.match(/\(([^)]*)\)/)?.[1] ?? "Article catalogue";
      const unit = inputs[0]?.value || "-";
      const requested = ctx.toNumber(inputs[1]?.value ?? "0");
      const delivered = ctx.toNumber(inputs[2]?.value ?? "0");
      const observation =
        inputs[3]?.value ||
        (delivered < requested ? "Remise partielle" : "RAS");
      return (
        "<tr>" +
        '<td class="num">' +
        (index + 1) +
        "</td>" +
        "<td><strong>" +
        ctx.escapeHtml(articleName) +
        "</strong><br><span>" +
        ctx.escapeHtml(articleCode) +
        "</span></td>" +
        "<td>" +
        ctx.escapeHtml(unit) +
        "</td>" +
        '<td class="right strong">' +
        ctx.escapeHtml(ctx.formatNumber(requested)) +
        "</td>" +
        '<td class="right strong">' +
        ctx.escapeHtml(ctx.formatNumber(delivered)) +
        "</td>" +
        "<td>" +
        ctx.escapeHtml(observation) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  const html = materialRequestDocumentHtml({
    reference,
    docCode,
    exitReference: "-",
    date,
    client,
    project,
    site,
    team,
    requester,
    stockManager,
    receivedBy,
    rows: lineHtml,
  });

  const popup = window.open("", "_blank");
  if (!popup) {
    ctx.showToast(
      root,
      "Impossible d'ouvrir le PDF. Autorise les popups pour Stock Hub.",
      "error",
    );
    return;
  }
  popup.document.write(html);
  popup.document.close();
}

export function hubLogoMarkup() {
  return `<div class="hub-logo" aria-label="HUB"><div class="hub-logo-main">HUB</div><div class="hub-logo-tag">QUALITE PRECISION FIABILITE</div></div>`;
}

export function materialRequestDocumentHtml(input: MaterialRequestDocumentInput) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Demande materiel ${escapeHtml(input.reference)}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e9edf4; color: #0f172a; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
    .toolbar { width: 210mm; margin: 10px auto 0; display: flex; justify-content: flex-end; }
    .toolbar button { border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 7px 11px; font-weight: 800; cursor: pointer; font-size: 12px; }
    .page { width: 210mm; min-height: 297mm; margin: 10px auto 18px; background: #fff; padding: 10mm; box-shadow: 0 8px 26px rgba(15, 23, 42, .12); }
    .doc-head { display: grid; grid-template-columns: 30mm 1fr 46mm; border: 1px solid #b9c7da; min-height: 23mm; }
    .logo-cell { display: flex; align-items: center; justify-content: center; border-right: 1px solid #b9c7da; padding: 3mm; }
    .hub-logo { width: 24mm; height: 16mm; background: #e71845; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: .86; }
    .hub-logo-main { font-size: 20pt; font-weight: 950; letter-spacing: -.07em; }
    .hub-logo-tag { margin-top: 1.5mm; font-size: 3pt; font-weight: 900; letter-spacing: .04em; }
    .doc-name { padding: 4mm 5mm; display: flex; flex-direction: column; justify-content: center; }
    .doc-name .small { color: #334155; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
    .doc-name .value { margin-top: 2mm; font-size: 15px; font-weight: 950; }
    .doc-name .hint { margin-top: 1mm; color: #64748b; font-size: 10px; }
    .meta { border-left: 1px solid #b9c7da; display: grid; grid-template-rows: repeat(4, 1fr); }
    .meta div { display: grid; grid-template-columns: 18mm 1fr; align-items: center; border-bottom: 1px solid #d3dcea; min-height: 5.8mm; }
    .meta div:last-child { border-bottom: 0; }
    .meta b { padding: 1.7mm; font-size: 7.5px; text-transform: uppercase; color: #1e293b; }
    .meta span { padding: 1.7mm; text-align: right; font-size: 9.5px; font-weight: 900; }
    .title { padding: 10mm 0 7mm; text-align: center; font-size: 17px; font-weight: 950; letter-spacing: .13em; text-transform: uppercase; }
    .info-strip { margin: 0 0 7mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm 10mm; }
    .info-item { min-width: 0; padding-bottom: 2.5mm; border-bottom: 1px solid #d8e1ec; }
    .info-item .label { color: #475569; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .09em; }
    .info-item .value { margin-top: 1.5mm; font-size: 12px; font-weight: 900; line-height: 1.25; }
    .items, .signature-table { width: 100%; border-collapse: collapse; }
    .items { margin-top: 2mm; }
    .items th { background: #eaf1fb; color: #102033; font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
    .items td, .items th { border: 1px solid #d3dcea; padding: 3mm; vertical-align: middle; }
    .items td { font-size: 11px; }
    .items span { color: #64748b; font-size: 9px; }
    .right { text-align: right; }
    .strong { font-weight: 900; }
    .num { width: 10mm; text-align: center; font-weight: 900; color: #1d4ed8; }
    .sign-title { margin: 10mm 0 3mm; font-size: 12px; font-weight: 950; }
    .signature-table td { border: 1px solid #b9c7da; width: 33.33%; height: 34mm; vertical-align: top; padding: 3mm; }
    .signature-table .role { color: #1e293b; font-size: 8.5px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .signature-table .name { margin-top: 3mm; font-size: 11px; font-weight: 900; }
    .signature-table .line { margin-top: 18mm; color: #475569; font-size: 9px; }
    .footer { margin-top: 6mm; color: #64748b; font-size: 8px; display: flex; justify-content: space-between; gap: 10mm; }
    @media print { body { background: white; } .toolbar { display: none; } .page { width: 210mm; min-height: 297mm; margin: 0; padding: 10mm; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer PDF</button></div>
  <main class="page">
    <header class="doc-head">
      <div class="logo-cell">${hubLogoMarkup()}</div>
      <div class="doc-name"><div class="small">Document interne</div><div class="value">Demande de materiels</div><div class="hint">Document de sortie stock et remise materiel</div></div>
      <div class="meta"><div><b>Doc N</b><span>${escapeHtml(input.docCode)}</span></div><div><b>Demande</b><span>${escapeHtml(input.reference)}</span></div><div><b>Bon sortie</b><span>${escapeHtml(input.exitReference)}</span></div><div><b>Date</b><span>${escapeHtml(formatDate(input.date))}</span></div></div>
    </header>
    <div class="title">Demande de materiels</div>
    <section class="info-strip" aria-label="Informations de la demande">
      <div class="info-item"><div class="label">Client</div><div class="value">${escapeHtml(input.client)}</div></div>
      <div class="info-item"><div class="label">Projet</div><div class="value">${escapeHtml(input.project)}</div></div>
      <div class="info-item"><div class="label">Site / zone</div><div class="value">${escapeHtml(input.site)}</div></div>
      <div class="info-item"><div class="label">Equipe / service</div><div class="value">${escapeHtml(input.team)}</div></div>
      <div class="info-item"><div class="label">Demandeur</div><div class="value">${escapeHtml(input.requester)}</div></div>
      <div class="info-item"><div class="label">Resp. stock</div><div class="value">${escapeHtml(input.stockManager)}</div></div>
    </section>
    <table class="items"><thead><tr><th>N</th><th>Designation</th><th>Unite</th><th class="right">Demandee</th><th class="right">Remise</th><th>Observation</th></tr></thead><tbody>${input.rows}</tbody></table>
    <div class="sign-title">Signatures</div>
    <table class="signature-table"><tbody><tr>
      <td><div class="role">Demandeur</div><div class="name">${escapeHtml(input.requester)}</div><div class="line">Date et signature</div></td>
      <td><div class="role">PM / Responsable</div><div class="name">${escapeHtml(input.receivedBy)}</div><div class="line">Date et signature</div></td>
      <td><div class="role">Responsable logistique</div><div class="name">${escapeHtml(input.stockManager)}</div><div class="line">Date et signature</div></td>
    </tr></tbody></table>
    
  </main>
</body>
</html>`;
}
