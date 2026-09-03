import type { Article, StockLevel, StockLocation, StockMovement, StockUser } from "../../api";
import { selectedText, setText } from "../../utils/dom";
import { escapeHtml, formatDate, formatNumber } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type RetoursTransfertsContext = {
  latestMovements: StockMovement[];
  setLatestMovements: (movements: StockMovement[]) => void;
  latestStockLevels: StockLevel[];
  setLatestStockLevels: (levels: StockLevel[]) => void;
  currentUser: StockUser | null;
  badge: (label: string, tone: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  option: (value: string, label: string) => string;
  fillSelect: (select: HTMLSelectElement | undefined, options: string, placeholder?: string) => void;
  userOptions: (users: StockUser[]) => string;
  articleOptions: (articles: Article[]) => string;
  locationOptions: (locations: StockLocation[]) => string;
  actionEyeFor: (action: string) => string;
  movementLinesPreview: (movement: StockMovement, mode?: "entry" | "exit") => string;
  hubLogoMarkup: () => string;
  toNumber: (value: string) => number;
  articleStockAtLocation: (articleId: string, locationId: string | null | undefined) => number;
  openModal: (root: HTMLElement, id: string) => void;
  closeModal: (root: HTMLElement, id: string) => void;
  showToast: (root: HTMLElement, message: string, type?: "success" | "error") => void;
  updateApiBackedViews: (root: HTMLElement) => void;
  getArticles: () => Promise<Article[]>;
  getLocations: () => Promise<StockLocation[]>;
  getUsers: () => Promise<StockUser[]>;
  getStockMovements: () => Promise<StockMovement[]>;
  getStockLevels: () => Promise<StockLevel[]>;
  createStockReturn: (payload: Parameters<typeof import("../../api").createStockReturn>[0]) => Promise<StockMovement>;
  createStockTransfer: (payload: Parameters<typeof import("../../api").createStockTransfer>[0]) => Promise<StockMovement>;
  controlStockReturn: (id: string, payload: Parameters<typeof import("../../api").controlStockReturn>[1]) => Promise<StockMovement>;
  uploadReturnProof: (id: string, payload: Parameters<typeof import("../../api").uploadReturnProof>[1]) => Promise<StockMovement>;
  uploadTransferProof: (id: string, payload: Parameters<typeof import("../../api").uploadTransferProof>[1]) => Promise<StockMovement>;
  getReturnProof: (id: string) => Promise<{ url: string; fileName?: string | null }>;
  getTransferProof: (id: string) => Promise<{ url: string; fileName?: string | null }>;
};

let latestMovements: StockMovement[] = [];
let latestStockLevels: StockLevel[] = [];
let currentUser: StockUser | null = null;
let selectedReturnTransferId: string | null = null;
let activeCtx: RetoursTransfertsContext | null = null;

function syncFrom(ctx: RetoursTransfertsContext) {
  activeCtx = ctx;
  latestMovements = ctx.latestMovements;
  latestStockLevels = ctx.latestStockLevels;
  currentUser = ctx.currentUser;
}

function syncTo() {
  if (!activeCtx) return;
  activeCtx.setLatestMovements(latestMovements);
  activeCtx.setLatestStockLevels(latestStockLevels);
}

function withContext<T>(ctx: RetoursTransfertsContext, callback: () => T): T {
  syncFrom(ctx);
  try {
    return callback();
  } finally {
    syncTo();
  }
}

async function withContextAsync<T>(ctx: RetoursTransfertsContext, callback: () => Promise<T>): Promise<T> {
  syncFrom(ctx);
  try {
    return await callback();
  } finally {
    syncTo();
  }
}

function requireCtx() {
  if (!activeCtx) throw new Error("Retours transferts context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone: BadgeTone) { return requireCtx().badge(label, tone); }
function emptyRow(colspan: number, message: string) { return requireCtx().emptyRow(colspan, message); }
function option(value: string, label: string) { return requireCtx().option(value, label); }
function fillSelect(select: HTMLSelectElement | undefined, options: string, placeholder?: string) { return requireCtx().fillSelect(select, options, placeholder); }
function userOptions(users: StockUser[]) { return requireCtx().userOptions(users); }
function articleOptions(articles: Article[]) { return requireCtx().articleOptions(articles); }
function locationOptions(locations: StockLocation[]) { return requireCtx().locationOptions(locations); }
function actionEyeFor(action: string) { return requireCtx().actionEyeFor(action); }
function movementLinesPreview(movement: StockMovement, mode: "entry" | "exit" = "entry") { return requireCtx().movementLinesPreview(movement, mode); }
function hubLogoMarkup() { return requireCtx().hubLogoMarkup(); }
function toNumber(value: string) { return requireCtx().toNumber(value); }
function articleStockAtLocation(articleId: string, locationId: string | null | undefined) { return requireCtx().articleStockAtLocation(articleId, locationId); }
function openModal(root: HTMLElement, id: string) { return requireCtx().openModal(root, id); }
function closeModal(root: HTMLElement, id: string) { return requireCtx().closeModal(root, id); }
function showToast(root: HTMLElement, message: string, type?: "success" | "error") { return requireCtx().showToast(root, message, type); }
function updateApiBackedViews(root: HTMLElement) { return requireCtx().updateApiBackedViews(root); }
function getArticles() { return requireCtx().getArticles(); }
function getLocations() { return requireCtx().getLocations(); }
function getUsers() { return requireCtx().getUsers(); }
function getStockMovements() { return requireCtx().getStockMovements(); }
function getStockLevels() { return requireCtx().getStockLevels(); }
function createStockReturn(payload: Parameters<RetoursTransfertsContext["createStockReturn"]>[0]) { return requireCtx().createStockReturn(payload); }
function createStockTransfer(payload: Parameters<RetoursTransfertsContext["createStockTransfer"]>[0]) { return requireCtx().createStockTransfer(payload); }
function controlStockReturn(id: string, payload: Parameters<RetoursTransfertsContext["controlStockReturn"]>[1]) { return requireCtx().controlStockReturn(id, payload); }
function uploadReturnProof(id: string, payload: Parameters<RetoursTransfertsContext["uploadReturnProof"]>[1]) { return requireCtx().uploadReturnProof(id, payload); }
function uploadTransferProof(id: string, payload: Parameters<RetoursTransfertsContext["uploadTransferProof"]>[1]) { return requireCtx().uploadTransferProof(id, payload); }
function getReturnProof(id: string) { return requireCtx().getReturnProof(id); }
function getTransferProof(id: string) { return requireCtx().getTransferProof(id); }

function renderReturnTransferRegistry(root: HTMLElement, movements: StockMovement[] = latestMovements) {
  const returnsBody = root.querySelector<HTMLElement>("#retours tbody");
  const returns = movements.filter(
    (movement) =>
      movement.type === "RETURN" || movement.type === "TRANSFER",
  );
  if (returnsBody)
    returnsBody.innerHTML = returns.length
      ? returns.map(returnTransferRow).join("")
      : emptyRow(8, "Aucun retour ou transfert en base pour le moment.");
  setText(
    root,
    "#returnsExpectedCount",
    returns.filter(
      (movement) =>
        movement.type === "RETURN" && movement.status !== "COMPLETED",
    ).length,
  );
  setText(
    root,
    "#transfersOpenCount",
    returns.filter(
      (movement) =>
        movement.type === "TRANSFER" && movement.status !== "COMPLETED",
    ).length,
  );
  setText(
    root,
    "#returnsReviewCount",
    returns.filter(
      (movement) =>
        movement.status === "SUBMITTED" || movement.status === "PREPARED",
    ).length,
  );
  window.lucide?.createIcons();
}

function returnTransferDocumentCss() {
  return `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e9edf4; color: #0f172a; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
    .toolbar { width: 210mm; margin: 10px auto 0; display: flex; justify-content: flex-end; }
    .toolbar button { border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 7px 11px; font-weight: 800; cursor: pointer; font-size: 12px; }
    .page { width: 210mm; min-height: 297mm; margin: 10px auto 18px; background: #fff; padding: 10mm; box-shadow: 0 8px 26px rgba(15, 23, 42, .12); }
    .doc-head { display: grid; grid-template-columns: 30mm 1fr 52mm; border: 1px solid #b9c7da; min-height: 23mm; }
    .logo-cell { display: flex; align-items: center; justify-content: center; border-right: 1px solid #b9c7da; padding: 3mm; }
    .hub-logo { width: 24mm; height: 16mm; background: #e71845; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: .86; }
    .hub-logo-main { font-size: 20pt; font-weight: 950; letter-spacing: -.07em; }
    .hub-logo-tag { margin-top: 1.5mm; font-size: 3pt; font-weight: 900; letter-spacing: .04em; }
    .doc-name { padding: 4mm 5mm; display: flex; flex-direction: column; justify-content: center; }
    .doc-name .small { color: #334155; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
    .doc-name .value { margin-top: 2mm; font-size: 15px; font-weight: 950; }
    .doc-name .hint { margin-top: 1mm; color: #64748b; font-size: 10px; }
    .meta { border-left: 1px solid #b9c7da; display: grid; grid-template-rows: repeat(4, 1fr); }
    .meta div { display: grid; grid-template-columns: 20mm 1fr; align-items: center; border-bottom: 1px solid #d3dcea; min-height: 5.8mm; }
    .meta div:last-child { border-bottom: 0; }
    .meta b { padding: 1.7mm; font-size: 7.5px; text-transform: uppercase; color: #1e293b; }
    .meta span { padding: 1.7mm; text-align: right; font-size: 9.5px; font-weight: 900; }
    .title { padding: 10mm 0 7mm; text-align: center; font-size: 17px; font-weight: 950; letter-spacing: .13em; text-transform: uppercase; }
    .info-strip { margin: 0 0 7mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm 10mm; }
    .info-item { min-width: 0; padding-bottom: 2.5mm; border-bottom: 1px solid #d8e1ec; }
    .info-item .label { color: #475569; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .09em; }
    .info-item .value { margin-top: 1.5mm; font-size: 12px; font-weight: 900; line-height: 1.25; }
    .items, .signature-table { width: 100%; border-collapse: collapse; }
    .items th { background: #eaf1fb; color: #102033; font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
    .items td, .items th { border: 1px solid #d3dcea; padding: 2.6mm; vertical-align: middle; }
    .items td { font-size: 10.5px; }
    .items span { color: #64748b; font-size: 9px; }
    .right { text-align: right; }
    .strong { font-weight: 900; }
    .num { width: 10mm; text-align: center; font-weight: 900; color: #1d4ed8; }
    .sign-title { margin: 10mm 0 3mm; font-size: 12px; font-weight: 950; }
    .signature-table td { border: 1px solid #b9c7da; width: 33.33%; height: 34mm; vertical-align: top; padding: 3mm; }
    .signature-table .role { color: #1e293b; font-size: 8.5px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .signature-table .name { margin-top: 3mm; font-size: 11px; font-weight: 900; }
    .signature-table .line { margin-top: 18mm; color: #475569; font-size: 9px; }
    @media print { body { background: white; } .toolbar { display: none; } .page { width: 210mm; min-height: 297mm; margin: 0; padding: 10mm; box-shadow: none; } }
  `;
}

function returnDocumentHtml(movement: StockMovement) {
  const source = movement.sourceRequest ?? latestMovements.find((item) => item.id === movement.sourceRequestId);
  const sourceByArticle = new Map(returnSourceLines(source).map((line) => [line.articleId, line]));
  const total = movement.lines.reduce((sum, line) => sum + Number(line.completedQuantity ?? 0), 0);
  const rows = movement.lines
    .map((line, index) => {
      const breakdown = returnLineBreakdown(line, movement);
      const sourceQuantity = sourceByArticle.get(line.articleId)?.completedQuantity;
      const observation = returnLineDisplayObservation(line);
      return `<tr>
        <td class="num">${index + 1}</td>
        <td><strong>${escapeHtml(line.article?.designation ?? "Article")}</strong><br><span>${escapeHtml(line.article?.code ?? "")}</span></td>
        <td>${escapeHtml(line.article?.unit ?? "U")}</td>
        <td class="right strong">${sourceQuantity === undefined ? "" : formatNumber(sourceQuantity)}</td>
        <td class="right strong">${formatNumber(breakdown.total)}</td>
        <td class="right">${formatNumber(breakdown.good)}</td>
        <td class="right">${formatNumber(breakdown.damaged)}</td>
        <td class="right">${formatNumber(breakdown.scrap)}</td>
        <td class="right">${formatNumber(breakdown.pending)}</td>
        <td>${escapeHtml(observation)}</td>
      </tr>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Retour stock ${escapeHtml(movement.reference)}</title><style>${returnTransferDocumentCss()}</style></head><body>
    <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer PDF</button></div>
    <main class="page">
      <header class="doc-head">
        <div class="logo-cell">${hubLogoMarkup()}</div>
        <div class="doc-name"><div class="small">Document interne</div><div class="value">Retour stock</div><div class="hint">Reception du materiel revenu et etat constate</div></div>
        <div class="meta"><div><b>Bon</b><span>${escapeHtml(movement.reference)}</span></div><div><b>Source</b><span>${escapeHtml(source?.reference ?? "")}</span></div><div><b>Statut</b><span>${escapeHtml(returnTransferDetailStatus(movement))}</span></div><div><b>Date</b><span>${escapeHtml(formatDate(movement.date))}</span></div></div>
      </header>
      <div class="title">Fiche retour stock</div>
      <section class="info-strip">
        <div class="info-item"><div class="label">Sortie source</div><div class="value">${escapeHtml(source?.reference ?? "")}</div></div>
        <div class="info-item"><div class="label">Emplacement retour</div><div class="value">${escapeHtml(movement.toLocation?.name ?? "")}</div></div>
        <div class="info-item"><div class="label">Responsable</div><div class="value">${escapeHtml(movement.handledBy ?? "")}</div></div>
        <div class="info-item"><div class="label">Ramene par</div><div class="value">${escapeHtml(movement.deliveredBy ?? "")}</div></div>
        <div class="info-item"><div class="label">Receptionne par</div><div class="value">${escapeHtml(movement.receivedBy ?? "")}</div></div>
        <div class="info-item"><div class="label">Total retourne</div><div class="value">${formatNumber(total)}</div></div>
      </section>
      <table class="items"><thead><tr><th>N</th><th>Designation</th><th>Unite</th><th class="right">Sortie</th><th class="right">Retour</th><th class="right">Bon etat</th><th class="right">A reparer</th><th class="right">Rebut</th><th class="right">A controler</th><th>Observation</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="sign-title">Signatures</div>
      <table class="signature-table"><tbody><tr>
        <td><div class="role">Reception retour</div><div class="name">${escapeHtml(movement.receivedBy ?? "")}</div><div class="line">Date et signature</div></td>
        <td><div class="role">Controle etat</div><div class="name">${escapeHtml(movement.handledBy ?? "")}</div><div class="line">Date et signature</div></td>
        <td><div class="role">Responsable magasin</div><div class="name">${escapeHtml(movement.toLocation?.responsible ?? "")}</div><div class="line">Date et signature</div></td>
      </tr></tbody></table>
    </main>
  </body></html>`;
}

function transferDocumentHtml(movement: StockMovement) {
  const total = movement.lines.reduce((sum, line) => sum + Number(line.completedQuantity ?? 0), 0);
  const rows = movement.lines
    .map((line, index) => {
      const quantity = Number(line.completedQuantity ?? 0);
      const observation = (line.observation ?? "").trim();
      return `<tr>
        <td class="num">${index + 1}</td>
        <td><strong>${escapeHtml(line.article?.designation ?? "Article")}</strong><br><span>${escapeHtml(line.article?.code ?? "")}</span></td>
        <td>${escapeHtml(line.article?.unit ?? "U")}</td>
        <td class="right strong">${formatNumber(quantity)}</td>
        <td>${escapeHtml(observation)}</td>
      </tr>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Transfert stock ${escapeHtml(movement.reference)}</title><style>${returnTransferDocumentCss()}</style></head><body>
    <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer PDF</button></div>
    <main class="page">
      <header class="doc-head">
        <div class="logo-cell">${hubLogoMarkup()}</div>
        <div class="doc-name"><div class="small">Document interne</div><div class="value">Transfert stock</div><div class="hint">Sortie interne depuis un emplacement vers une destination</div></div>
        <div class="meta"><div><b>Bon</b><span>${escapeHtml(movement.reference)}</span></div><div><b>Source</b><span>${escapeHtml(movement.fromLocation?.name ?? "")}</span></div><div><b>Statut</b><span>${escapeHtml(returnTransferDetailStatus(movement))}</span></div><div><b>Date</b><span>${escapeHtml(formatDate(movement.date))}</span></div></div>
      </header>
      <div class="title">Fiche transfert stock</div>
      <section class="info-strip">
        <div class="info-item"><div class="label">Emplacement source</div><div class="value">${escapeHtml(movement.fromLocation?.name ?? "")}</div></div>
        <div class="info-item"><div class="label">Destination</div><div class="value">${escapeHtml(movement.toLocation?.name ?? "")}</div></div>
        <div class="info-item"><div class="label">Responsable</div><div class="value">${escapeHtml(movement.handledBy ?? "")}</div></div>
        <div class="info-item"><div class="label">Transporte par</div><div class="value">${escapeHtml(movement.deliveredBy ?? "")}</div></div>
        <div class="info-item"><div class="label">Receptionne par</div><div class="value">${escapeHtml(movement.receivedBy ?? "")}</div></div>
        <div class="info-item"><div class="label">Quantite totale</div><div class="value">${formatNumber(total)}</div></div>
      </section>
      <table class="items"><thead><tr><th>N</th><th>Designation</th><th>Unite</th><th class="right">Quantite transferee</th><th>Observation</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="sign-title">Signatures</div>
      <table class="signature-table"><tbody><tr>
        <td><div class="role">Magasin source</div><div class="name">${escapeHtml(movement.fromLocation?.responsible ?? movement.handledBy ?? "")}</div><div class="line">Date et signature</div></td>
        <td><div class="role">Transport</div><div class="name">${escapeHtml(movement.deliveredBy ?? "")}</div><div class="line">Date et signature</div></td>
        <td><div class="role">Magasin destination</div><div class="name">${escapeHtml(movement.receivedBy ?? movement.toLocation?.responsible ?? "")}</div><div class="line">Date et signature</div></td>
      </tr></tbody></table>
    </main>
  </body></html>`;
}

function downloadReturnPdf(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement || movement.type !== "RETURN") {
    showToast(root, "Retour stock introuvable.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour telecharger la fiche.", "error");
    return;
  }
  popup.document.write(returnDocumentHtml(movement));
  popup.document.close();
  popup.focus();
  popup.print();
}

function downloadTransferPdf(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement || movement.type !== "TRANSFER") {
    showToast(root, "Transfert stock introuvable.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour telecharger la fiche.", "error");
    return;
  }
  popup.document.write(transferDocumentHtml(movement));
  popup.document.close();
  popup.focus();
  popup.print();
}

function returnTransferRow(movement: StockMovement) {
  const first = movement.lines[0];
  const origin =
    movement.type === "RETURN"
      ? (movement.deliveredBy ?? "Sortie retournee")
      : (movement.fromLocation?.name ?? "-");
  const destination = movement.toLocation?.name ?? "-";
  const state = first?.observation || movement.notes || "-";
  const label = movement.type === "RETURN" ? "Retour" : "Transfert";
  const statusLabel =
    movement.type === "RETURN"
      ? movement.status === "COMPLETED"
        ? "Traite"
        : "A controler"
      : movement.status === "COMPLETED"
        ? "Transfere"
        : movement.status;
  const tone: "success" | "warning" | "gray" =
    movement.status === "COMPLETED"
      ? "success"
      : movement.status === "PREPARED"
        ? "warning"
        : "gray";
  return (
    "<tr>" +
    '<td class="px-5 py-4 font-bold">' +
    escapeHtml(movement.reference) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(label) +
    "</td>" +
    '<td class="px-5 py-4">' +
    movementLinesPreview(movement, "exit") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(origin) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(destination) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(state) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(statusLabel, tone) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    actionEyeFor(`openReturnTransferDetail('${movement.id}')`) +
    "</td>" +
    "</tr>"
  );
}

function returnTransferDetailStatus(movement: StockMovement) {
  if (movement.type === "RETURN") {
    return movement.status === "COMPLETED" ? "Traite" : "A controler";
  }
  return movement.status === "COMPLETED" ? "Transfere" : movement.status;
}

function returnTransferDetailTone(movement: StockMovement): "success" | "warning" | "gray" {
  if (movement.status === "COMPLETED") return "success";
  if (movement.status === "PREPARED") return "warning";
  return "gray";
}

function returnLineBreakdown(
  line: StockMovement["lines"][number],
  movement?: StockMovement,
) {
  const text = line.observation ?? "";
  const readFrom = (source: string, label: string) => {
    const match = source.match(new RegExp(label + "\\s+(\\d+(?:[.,]\\d+)?)", "i"));
    return match ? Number(match[1].replace(",", ".")) : 0;
  };
  const read = (label: string) => readFrom(text, label);
  const structured = /Retour:\s*total/i.test(text);
  const fallbackTotal = Number(line.completedQuantity ?? 0);
  let good = read("bon etat");
  let damaged = read("endommage");
  let scrap = read("rebut");
  let pending = read("a controler");
  const parsedTotal = read("total");
  for (const section of text.split("|").map((part) => part.trim())) {
    if (!/^Controle retour:/i.test(section)) continue;
    const controlled = readFrom(section, "sur a controler");
    const accepted = readFrom(section, "quantite acceptee");
    if (/Reintegre au stock/i.test(section)) {
      good += accepted || controlled;
    } else if (/Rebut \/ inutilisable/i.test(section)) {
      scrap += controlled;
    } else if (/A reparer \/ anomalie/i.test(section)) {
      damaged += controlled;
    }
    pending = Math.max(0, pending - controlled);
  }
  return {
    total: parsedTotal || fallbackTotal,
    good: structured ? good : movement?.status === "COMPLETED" ? fallbackTotal : 0,
    damaged,
    scrap,
    pending: structured ? pending : movement?.status === "PREPARED" ? fallbackTotal : 0,
    structured,
  };
}

function returnLineDisplayObservation(line: StockMovement["lines"][number]) {
  return (line.observation ?? "")
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part && !/^Retour:/i.test(part) && !/^(bon etat|endommage|rebut|a controler)\s+/i.test(part))
    .join(" | ");
}

function returnTransferDocumentBlock(movement: StockMovement) {
  const isReturn = movement.type === "RETURN";
  const hasProof = Boolean(movement.proofFileKey || movement.proofFileName);
  const canUpload = movement.status !== "CANCELLED";
  const inputId = (isReturn ? "signedReturnProof-" : "signedTransferProof-") + movement.id;
  const downloadAction = isReturn
    ? "downloadReturnPdf('" + escapeHtml(movement.id) + "')"
    : "downloadTransferPdf('" + escapeHtml(movement.id) + "')";
  const uploadAction = isReturn
    ? "uploadSignedReturnProof('" + escapeHtml(movement.id) + "')"
    : "uploadSignedTransferProof('" + escapeHtml(movement.id) + "')";
  const viewAction = isReturn
    ? "viewSignedReturnProof('" + escapeHtml(movement.id) + "')"
    : "viewSignedTransferProof('" + escapeHtml(movement.id) + "')";
  return `
    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div class="px-5 py-4 bg-gray-50 border-b">
        <h3 class="font-bold">Documents</h3>
        <p class="text-sm text-gray-500 mt-1">Telecharge la fiche, puis joins la version signee.</p>
      </div>
      <div class="grid gap-4 p-5 md:grid-cols-2">
        <div class="rounded-xl border border-accent-100 bg-accent-50/40 p-4">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white"><i data-lucide="file-down" class="w-5 h-5"></i></div>
            <div>
              <div class="text-xs font-bold uppercase text-gray-500">Etape 1</div>
              <div class="font-bold">Telecharger la fiche</div>
              <p class="mt-1 text-sm text-gray-500">Imprime la fiche pour signature et classement.</p>
            </div>
          </div>
          <button type="button" data-action="${downloadAction}" class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 font-semibold text-white hover:bg-accent-500"><i data-lucide="download" class="w-4 h-4"></i>Telecharger la fiche</button>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-4">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white"><i data-lucide="upload" class="w-5 h-5"></i></div>
            <div>
              <div class="text-xs font-bold uppercase text-gray-500">Etape 2</div>
              <div class="font-bold">Uploader la fiche signee</div>
              <p class="mt-1 text-sm text-gray-500">PDF ou image signee rattachee a ce bon.</p>
            </div>
          </div>
          <input id="${escapeHtml(inputId)}" type="file" accept=".pdf,image/*" class="mt-4 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm" ${canUpload ? "" : "disabled"}>
          <button type="button" data-action="${uploadAction}" class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-accent-300 bg-accent-50 px-4 py-2.5 font-semibold text-accent-700 hover:bg-accent-100 ${canUpload ? "" : "pointer-events-none opacity-50"}"><i data-lucide="upload" class="w-4 h-4"></i>Uploader la fiche signee</button>
          <div class="mt-3 rounded-lg border ${hasProof ? "border-success-100 bg-success-50 text-success-700" : "border-gray-200 bg-gray-50 text-gray-500"} p-3 text-sm font-semibold">
            ${hasProof ? `<div class="flex items-center justify-between gap-3"><span class="min-w-0 truncate"><i data-lucide="paperclip" class="mr-1 inline h-4 w-4"></i>${escapeHtml(movement.proofFileName ?? "Fiche signee")}</span><button type="button" data-action="${viewAction}" class="shrink-0 rounded-lg border border-success-200 bg-white px-3 py-1.5 text-xs font-bold text-success-700 hover:bg-success-50">Voir la preuve</button></div>` : "Aucune fiche signee jointe."}
          </div>
        </div>
      </div>
    </div>
  `;
}

function openReturnTransferDetail(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement || (movement.type !== "RETURN" && movement.type !== "TRANSFER")) {
    showToast(root, "Retour ou transfert introuvable dans le registre charge.", "error");
    return;
  }
  selectedReturnTransferId = id;
  const kind = movement.type === "RETURN" ? "Fiche retour" : "Fiche transfert";
  const title = movement.type === "RETURN" ? "Retour stock" : "Transfert stock";
  const source = movement.sourceRequest ?? latestMovements.find((item) => item.id === movement.sourceRequestId);
  const sourceByArticle = new Map(
    returnSourceLines(source).map((line) => [line.articleId, line]),
  );
  const total = movement.lines.reduce(
    (sum, line) => sum + Number(line.completedQuantity ?? 0),
    0,
  );
  const rows = movement.lines
    .map(
      (line, index) => {
        const sourceQuantity = sourceByArticle.get(line.articleId)?.completedQuantity;
        const breakdown = returnLineBreakdown(line, movement);
        const observation = movement.type === "RETURN"
          ? returnLineDisplayObservation(line)
          : (line.observation ?? "").trim();
        return `<tr>
          <td class="px-5 py-4 font-bold text-gray-400">${index + 1}</td>
          <td class="px-5 py-4"><div class="font-bold">${escapeHtml(line.article?.designation ?? "-")}</div><div class="text-xs text-gray-500">${escapeHtml(line.article?.code ?? "-")} - ${escapeHtml(line.article?.unit ?? "U")}</div></td>
          ${
            movement.type === "RETURN"
              ? '<td class="px-5 py-4 text-right font-semibold">' +
                (sourceQuantity === undefined ? "-" : formatNumber(sourceQuantity)) +
                "</td>"
              : ""
          }
          <td class="px-5 py-4 text-right font-bold">${formatNumber(breakdown.total)}</td>
          ${
            movement.type === "RETURN"
              ? '<td class="px-5 py-4 text-right">' +
                formatNumber(breakdown.good) +
                '</td><td class="px-5 py-4 text-right">' +
                formatNumber(breakdown.damaged) +
                '</td><td class="px-5 py-4 text-right">' +
                formatNumber(breakdown.scrap) +
                '</td><td class="px-5 py-4 text-right">' +
                formatNumber(breakdown.pending) +
                "</td>"
              : ""
          }
          <td class="px-5 py-4">${escapeHtml(observation)}</td>
        </tr>`;
      },
    )
    .join("");
  setText(root, "#returnTransferDetailKind", kind);
  setText(root, "#returnTransferDetailTitle", movement.reference);
  setText(
    root,
    "#returnTransferDetailSubtitle",
    title + " en lecture seule.",
  );
  const body = root.querySelector<HTMLElement>("#returnTransferDetailBody");
  if (body) {
    const sourceLine =
      movement.type === "RETURN"
        ? `<div><span class="detail-label">Sortie source</span> <strong>${escapeHtml(source?.reference ?? "-")}</strong></div>`
        : `<div><span class="detail-label">Origine</span> <strong>${escapeHtml(movement.fromLocation?.name ?? "-")}</strong></div>`;
    body.innerHTML = `
      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div class="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <div class="p-5">
            <div class="flex flex-wrap items-center gap-2">
              ${badge(returnTransferDetailStatus(movement), returnTransferDetailTone(movement))}
              <span class="text-sm text-gray-500">${formatDate(movement.date)}</span>
            </div>
            <div class="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div><span class="detail-label">Reference</span> <strong>${escapeHtml(movement.reference)}</strong></div>
              <div><span class="detail-label">Type</span> <strong>${escapeHtml(movement.type === "RETURN" ? "Retour" : "Transfert")}</strong></div>
              ${sourceLine}
              <div><span class="detail-label">Destination</span> <strong>${escapeHtml(movement.toLocation?.name ?? "-")}</strong></div>
              <div><span class="detail-label">Total articles</span> <strong>${formatNumber(movement.lines.length)} article${movement.lines.length > 1 ? "s" : ""}</strong></div>
              <div><span class="detail-label">${movement.type === "RETURN" ? "Quantite retournee" : "Quantite totale"}</span> <strong>${formatNumber(total)}</strong></div>
            </div>
          </div>
          <div class="border-t bg-gray-50 p-5 md:border-l md:border-t-0">
            <div class="grid gap-3 text-sm">
              <div><span class="detail-label">Responsable stock</span> <strong>${escapeHtml(movement.handledBy ?? "-")}</strong></div>
              <div><span class="detail-label">Transporte / ramene par</span> <strong>${escapeHtml(movement.deliveredBy ?? "-")}</strong></div>
              <div><span class="detail-label">Receptionne par</span> <strong>${escapeHtml(movement.receivedBy ?? "-")}</strong></div>
              <div><span class="detail-label">Statut</span> <strong>${escapeHtml(returnTransferDetailStatus(movement))}</strong></div>
            </div>
          </div>
        </div>
      </div>
      <div class="border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 bg-gray-50 border-b"><h3 class="font-bold">Articles ${movement.type === "RETURN" ? "retournes" : "transferes"}</h3><p class="text-sm text-gray-500 mt-1">Detail des lignes du bon.</p></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[1120px] text-sm"><thead class="bg-gray-50 text-xs uppercase text-gray-500"><tr><th class="px-5 py-3 text-left">N</th><th class="px-5 py-3 text-left">Article</th>${movement.type === "RETURN" ? '<th class="px-5 py-3 text-right">Quantite sortie</th>' : ""}<th class="px-5 py-3 text-right">${movement.type === "RETURN" ? "Quantite retournee" : "Quantite"}</th>${movement.type === "RETURN" ? '<th class="px-5 py-3 text-right">Bon etat</th><th class="px-5 py-3 text-right">Endommage</th><th class="px-5 py-3 text-right">Rebut</th><th class="px-5 py-3 text-right">A controler</th>' : ""}<th class="px-5 py-3 text-left">Observation</th></tr></thead><tbody class="divide-y">${rows || emptyRow(movement.type === "RETURN" ? 9 : 4, "Aucune ligne sur ce bon.")}</tbody></table></div>
      </div>
      ${returnTransferDocumentBlock(movement)}
      ${movement.notes ? `<div class="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700"><div class="font-bold mb-1">Observation generale</div>${escapeHtml(movement.notes)}</div>` : ""}`;
  }
  const controlButton = root.querySelector<HTMLButtonElement>("#returnControlButton");
  if (controlButton) {
    const canControl =
      movement.type === "RETURN" &&
      movement.status === "PREPARED" &&
      movement.lines.some((line) => returnLineBreakdown(line, movement).pending > 0);
    controlButton.classList.toggle("hidden", !canControl);
  }
  openModal(root, "returnTransferDetailModal");
}

function returnControlDecisionLabel(decision: string) {
  if (decision === "REINTEGRATE") return "Reintegrer au stock";
  if (decision === "DISCARD") return "Rebut / inutilisable";
  if (decision === "REPAIR") return "A reparer / anomalie";
  return decision;
}

function refreshReturnControlLines(root: HTMLElement) {
  const rows = Array.from(
    root.querySelectorAll<HTMLTableRowElement>("#returnControlLines .return-control-line"),
  );
  rows.forEach((row) => {
    const decision = row.querySelector<HTMLSelectElement>(".return-control-decision")?.value ?? "REINTEGRATE";
    const quantity = row.querySelector<HTMLInputElement>(".return-control-accepted");
    const returned = Number(row.dataset.returnedQuantity ?? "0");
    if (!quantity) return;
    if (decision === "REINTEGRATE") {
      quantity.disabled = false;
      quantity.max = String(returned);
      if (!quantity.value || Number(quantity.value) <= 0) {
        quantity.value = String(returned);
      }
      quantity.classList.remove("bg-gray-50");
    } else {
      quantity.value = "0";
      quantity.disabled = true;
      quantity.classList.add("bg-gray-50");
    }
  });
}

function openReturnControl(root: HTMLElement) {
  const movement = selectedReturnTransferId
    ? latestMovements.find((item) => item.id === selectedReturnTransferId)
    : null;
  if (!movement || movement.type !== "RETURN" || movement.status !== "PREPARED") {
    showToast(root, "Ce retour ne peut pas etre controle.", "error");
    return;
  }
  const source = movement.sourceRequest ?? latestMovements.find((item) => item.id === movement.sourceRequestId);
  const sourceByArticle = new Map(
    returnSourceLines(source).map((line) => [line.articleId, line]),
  );
  const body = root.querySelector<HTMLTableSectionElement>("#returnControlLines");
  if (!body) return;
  const pendingLines = movement.lines.filter((line) => returnLineBreakdown(line, movement).pending > 0);
  if (!pendingLines.length) {
    showToast(root, "Ce retour n'a plus de quantite a controler.");
    return;
  }
  body.innerHTML = pendingLines
    .map((line) => {
      const returned = returnLineBreakdown(line, movement).pending;
      const sourceQuantity = sourceByArticle.get(line.articleId)?.completedQuantity;
      return `<tr class="return-control-line" data-line-id="${escapeHtml(line.id)}" data-returned-quantity="${returned}">
        <td class="px-5 py-4"><div class="font-bold">${escapeHtml(line.article?.designation ?? "-")}</div><div class="text-xs text-gray-500">${escapeHtml(line.article?.code ?? "-")} - ${escapeHtml(line.article?.unit ?? "U")}</div></td>
        <td class="px-5 py-4 text-right font-semibold">${sourceQuantity === undefined ? "-" : formatNumber(sourceQuantity)}</td>
        <td class="px-5 py-4 text-right font-bold">${formatNumber(returned)}</td>
        <td class="px-5 py-4"><select class="return-control-decision w-full h-10 border rounded-lg px-3"><option value="REINTEGRATE">Reintegrer au stock</option><option value="DISCARD">Rebut / inutilisable</option><option value="REPAIR">A reparer / anomalie</option></select></td>
        <td class="px-5 py-4 text-right"><input type="number" min="0" max="${returned}" value="${returned}" class="return-control-accepted w-28 h-10 border rounded-lg px-3 text-right"></td>
        <td class="px-5 py-4"><input class="return-control-observation w-full h-10 border rounded-lg px-3" placeholder="Observation de controle"></td>
      </tr>`;
    })
    .join("");
  setText(root, "#returnControlTitle", movement.reference);
  setText(
    root,
    "#returnControlSubtitle",
    "Controle du retour avant traitement final.",
  );
  const handledBy = root.querySelector<HTMLInputElement>("#returnControlHandledBy");
  const notes = root.querySelector<HTMLInputElement>("#returnControlNotes");
  if (handledBy) handledBy.value = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "";
  if (notes) notes.value = "";
  root
    .querySelectorAll<HTMLSelectElement>("#returnControlLines .return-control-decision")
    .forEach((select) => {
      select.onchange = () => refreshReturnControlLines(root);
    });
  refreshReturnControlLines(root);
  openModal(root, "returnControlModal");
}

async function submitReturnControl(root: HTMLElement) {
  const movement = selectedReturnTransferId
    ? latestMovements.find((item) => item.id === selectedReturnTransferId)
    : null;
  if (!movement || movement.type !== "RETURN") {
    showToast(root, "Retour stock introuvable.", "error");
    return;
  }
  const rows = Array.from(
    root.querySelectorAll<HTMLTableRowElement>("#returnControlLines .return-control-line"),
  );
  const lines = rows.map((row) => {
    const decision =
      row.querySelector<HTMLSelectElement>(".return-control-decision")?.value ??
      "REINTEGRATE";
    const acceptedQuantity =
      toNumber(row.querySelector<HTMLInputElement>(".return-control-accepted")?.value ?? "0") ?? 0;
    return {
      lineId: row.dataset.lineId ?? "",
      decision: decision as "REINTEGRATE" | "DISCARD" | "REPAIR",
      acceptedQuantity,
      observation:
        row.querySelector<HTMLInputElement>(".return-control-observation")?.value.trim() ||
        undefined,
      returnedQuantity: Number(row.dataset.returnedQuantity ?? "0"),
    };
  });
  if (
    !lines.length ||
    lines.some(
      (line) =>
        !line.lineId ||
        !["REINTEGRATE", "DISCARD", "REPAIR"].includes(line.decision) ||
        line.acceptedQuantity < 0 ||
        line.acceptedQuantity > line.returnedQuantity ||
        (line.decision === "REINTEGRATE" && line.acceptedQuantity <= 0),
    )
  ) {
    showToast(root, "Controle invalide : verifie les decisions et quantites acceptees.", "error");
    return;
  }
  try {
    await controlStockReturn(movement.id, {
      handledBy:
        root.querySelector<HTMLInputElement>("#returnControlHandledBy")?.value.trim() ||
        undefined,
      notes:
        root.querySelector<HTMLInputElement>("#returnControlNotes")?.value.trim() ||
        undefined,
      lines: lines.map(({ returnedQuantity: _returnedQuantity, ...line }) => line),
    });
    const [movements, stockLevels] = await Promise.all([
      getStockMovements(),
      getStockLevels().catch(() => latestStockLevels),
    ]);
    latestMovements = movements;
    latestStockLevels = stockLevels;
    closeModal(root, "returnControlModal");
    updateApiBackedViews(root);
    openReturnTransferDetail(root, movement.id);
    showToast(root, "Retour controle et traite.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Controle du retour impossible.",
      "error",
    );
  }
}

async function uploadSignedReturnProof(root: HTMLElement, id: string) {
  const input = root.querySelector<HTMLInputElement>(
    `#signedReturnProof-${CSS.escape(id)}`,
  );
  const file = input?.files?.[0];
  if (!file) {
    showToast(root, "Ajoute la fiche retour signee.", "error");
    return;
  }
  try {
    const updated = await uploadReturnProof(id, {
      file,
      uploadedBy: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
        : undefined,
    });
    latestMovements = await getStockMovements();
    selectedReturnTransferId = updated.id;
    openReturnTransferDetail(root, updated.id);
    updateApiBackedViews(root);
    showToast(root, "Fiche retour signee uploadee.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Upload impossible.",
      "error",
    );
  }
}

async function uploadSignedTransferProof(root: HTMLElement, id: string) {
  const input = root.querySelector<HTMLInputElement>(
    `#signedTransferProof-${CSS.escape(id)}`,
  );
  const file = input?.files?.[0];
  if (!file) {
    showToast(root, "Ajoute la fiche transfert signee.", "error");
    return;
  }
  try {
    const updated = await uploadTransferProof(id, {
      file,
      uploadedBy: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
        : undefined,
    });
    latestMovements = await getStockMovements();
    selectedReturnTransferId = updated.id;
    openReturnTransferDetail(root, updated.id);
    updateApiBackedViews(root);
    showToast(root, "Fiche transfert signee uploadee.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Upload impossible.",
      "error",
    );
  }
}

async function viewSignedReturnProof(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement?.proofFileName && !movement?.proofFileKey) {
    showToast(root, "Aucune preuve signee jointe.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour ouvrir la preuve.", "error");
    return;
  }
  popup.opener = null;
  try {
    const proof = await getReturnProof(id);
    popup.location.href = proof.url;
    showToast(root, "Preuve signee ouverte : " + (proof.fileName ?? movement.proofFileName ?? "fichier"));
  } catch (error) {
    popup.close();
    showToast(
      root,
      error instanceof Error ? error.message : "Preuve signee inaccessible.",
      "error",
    );
  }
}

async function viewSignedTransferProof(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement?.proofFileName && !movement?.proofFileKey) {
    showToast(root, "Aucune preuve signee jointe.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour ouvrir la preuve.", "error");
    return;
  }
  popup.opener = null;
  try {
    const proof = await getTransferProof(id);
    popup.location.href = proof.url;
    showToast(root, "Preuve signee ouverte : " + (proof.fileName ?? movement.proofFileName ?? "fichier"));
  } catch (error) {
    popup.close();
    showToast(
      root,
      error instanceof Error ? error.message : "Preuve signee inaccessible.",
      "error",
    );
  }
}

function addTransferLine(root: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#transferLines");
  const first = body?.querySelector<HTMLElement>(".transfer-line");
  if (!body || !first) return;
  const row = first.cloneNode(true) as HTMLElement;
  row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
    input.value = input.classList.contains("transfer-available") ? "0" : "";
  });
  row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
    select.innerHTML =
      first.querySelector<HTMLSelectElement>("select")?.innerHTML ?? "";
    select.selectedIndex = 0;
  });
  body.appendChild(row);
  void populateReturnTransferModals(root, "transferModal");
}

function removeTransferLine(root: HTMLElement, trigger: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#transferLines");
  const row = trigger.closest<HTMLElement>(".transfer-line");
  if (!body || !row) return;
  const rows = body.querySelectorAll(".transfer-line");
  if (rows.length > 1) row.remove();
  body
    .querySelectorAll<HTMLElement>(".transfer-line")
    .forEach((item, index) => {
      const number = item.querySelector<HTMLElement>(".transfer-line-number");
      if (number) number.textContent = String(index + 1);
    });
}

function returnLineQuantity(movement: StockMovement, articleId: string) {
  return movement.lines
    .filter((line) => line.articleId === articleId)
    .reduce((sum, line) => sum + Number(line.completedQuantity ?? 0), 0);
}

function returnSourceLines(source: StockMovement | undefined | null) {
  if (!source) return [];
  const linesByArticle = new Map<string, StockMovement["lines"][number]>();
  source.lines.forEach((line) => {
    const existing = linesByArticle.get(line.articleId);
    if (!existing) {
      linesByArticle.set(line.articleId, { ...line });
      return;
    }
    linesByArticle.set(line.articleId, {
      ...existing,
      completedQuantity:
        Number(existing.completedQuantity ?? 0) +
        Number(line.completedQuantity ?? 0),
    });
  });
  return [...linesByArticle.values()];
}

function returnedQuantityForSource(sourceMovementId: string, articleId: string) {
  return latestMovements
    .filter(
      (movement) =>
        movement.type === "RETURN" &&
        movement.sourceRequestId === sourceMovementId &&
        movement.status !== "CANCELLED",
    )
    .reduce((sum, movement) => sum + returnLineQuantity(movement, articleId), 0);
}

function remainingReturnQuantity(sourceMovementId: string, articleId: string) {
  const source = latestMovements.find((movement) => movement.id === sourceMovementId);
  const sourceLine = returnSourceLines(source).find(
    (line) => line.articleId === articleId,
  );
  return Math.max(
    0,
    Number(sourceLine?.completedQuantity ?? 0) -
      returnedQuantityForSource(sourceMovementId, articleId),
  );
}

function returnLineRow(index: number) {
  return `<tr class="return-line">
    <td class="px-5 py-4 font-bold text-gray-400 return-line-number">${index + 1}</td>
    <td class="px-5 py-4"><select class="return-line-article w-full h-10 border rounded-lg px-3"><option value="">Selectionner article</option></select><div class="return-line-initial mt-1 text-xs font-semibold text-gray-500">Sortie initiale: -</div></td>
    <td class="px-5 py-4 text-right return-line-returned">-</td>
    <td class="px-5 py-4 text-right font-bold return-line-remaining">-</td>
    <td class="px-5 py-4 text-right"><input type="number" min="0" class="return-line-good w-24 h-10 border rounded-lg px-3 text-right" placeholder="0"></td>
    <td class="px-5 py-4 text-right"><input type="number" min="0" class="return-line-damaged w-24 h-10 border rounded-lg px-3 text-right" placeholder="0"></td>
    <td class="px-5 py-4 text-right"><input type="number" min="0" class="return-line-scrap w-24 h-10 border rounded-lg px-3 text-right" placeholder="0"></td>
    <td class="px-5 py-4 text-right"><input type="number" min="0" class="return-line-pending w-24 h-10 border rounded-lg px-3 text-right" placeholder="0"></td>
    <td class="px-5 py-4 text-right font-bold return-line-total">0</td>
    <td class="px-5 py-4"><input class="return-line-observation w-full h-10 border rounded-lg px-3" placeholder="Observation"></td>
    <td class="px-5 py-4 text-right"><button type="button" data-action="removeReturnLine" title="Retirer la ligne" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-error-700 hover:bg-error-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
  </tr>`;
}

function returnArticleOptions(
  sourceMovementId: string,
  selectedArticleId = "",
  blockedArticleIds: Set<string> = new Set(),
) {
  const source = latestMovements.find((movement) => movement.id === sourceMovementId);
  return (
    option("", "Selectionner article") +
    returnSourceLines(source)
      .map((line) => {
        const remaining = remainingReturnQuantity(sourceMovementId, line.articleId);
        const alreadySelected =
          blockedArticleIds.has(line.articleId) &&
          line.articleId !== selectedArticleId;
        const remainingLabel =
          remaining <= 0 ? "tout retourne" : "reste " + formatNumber(remaining);
        const label =
          (line.article?.code ?? "-") +
          " - " +
          (line.article?.designation ?? "Article") +
          " (" +
          remainingLabel +
          ")";
        const disabled =
          alreadySelected || (remaining <= 0 && line.articleId !== selectedArticleId);
        return `<option value="${escapeHtml(line.articleId)}"${line.articleId === selectedArticleId ? " selected" : ""}${disabled ? " disabled" : ""}>${escapeHtml(label)}</option>`;
      })
      .join("")
  );
}

function refreshReturnLines(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  const sourceMovementId = modal?.dataset.returnSourceMovementId ?? "";
  const body = modal?.querySelector<HTMLTableSectionElement>("#returnLines");
  if (!modal || !body || !sourceMovementId) return;
  const source = latestMovements.find((movement) => movement.id === sourceMovementId);
  const sourceLines = returnSourceLines(source);
  const sourceByArticle = new Map(sourceLines.map((line) => [line.articleId, line]));
  const rows = Array.from(body.querySelectorAll<HTMLTableRowElement>(".return-line"));
  const selectedIds = rows
    .map((row) => row.querySelector<HTMLSelectElement>(".return-line-article")?.value ?? "")
    .filter(Boolean);

  rows.forEach((row, index) => {
    const select = row.querySelector<HTMLSelectElement>(".return-line-article");
    const selectedArticleId = select?.value ?? "";
    const number = row.querySelector<HTMLElement>(".return-line-number");
    if (number) number.textContent = String(index + 1);
    if (select) {
      const selectedElsewhere = new Set(
        selectedIds.filter((articleId) => articleId !== selectedArticleId),
      );
      select.innerHTML = returnArticleOptions(
        sourceMovementId,
        selectedArticleId,
        selectedElsewhere,
      );
      select.value = selectedArticleId;
      select.onchange = () => refreshReturnLines(root);
    }
    const sourceLine = sourceByArticle.get(selectedArticleId);
    const exited = Number(sourceLine?.completedQuantity ?? 0);
    const returned = selectedArticleId
      ? returnedQuantityForSource(sourceMovementId, selectedArticleId)
      : 0;
    const remaining = selectedArticleId
      ? remainingReturnQuantity(sourceMovementId, selectedArticleId)
      : 0;
    const quantityInputs = [
      row.querySelector<HTMLInputElement>(".return-line-good"),
      row.querySelector<HTMLInputElement>(".return-line-damaged"),
      row.querySelector<HTMLInputElement>(".return-line-scrap"),
      row.querySelector<HTMLInputElement>(".return-line-pending"),
    ].filter(Boolean) as HTMLInputElement[];
    const totalNode = row.querySelector<HTMLElement>(".return-line-total");
    const duplicate =
      selectedArticleId &&
      selectedIds.filter((articleId) => articleId === selectedArticleId).length > 1;
    row.dataset.articleId = selectedArticleId;
    row.dataset.remaining = String(remaining);
    row.classList.toggle("bg-error-50", Boolean(duplicate));
    const total = quantityInputs.reduce(
      (sum, input) => sum + (toNumber(input.value) ?? 0),
      0,
    );
    quantityInputs.forEach((input) => {
      input.max = String(remaining);
      input.disabled = Boolean(selectedArticleId && remaining <= 0);
      input.oninput = () => refreshReturnLines(root);
      input.classList.toggle("text-error-700", total > remaining || Boolean(duplicate));
      input.classList.toggle("bg-gray-50", input.disabled);
    });
    if (totalNode) {
      totalNode.textContent = formatNumber(total);
      totalNode.classList.toggle("text-error-700", total > remaining || Boolean(duplicate));
    }
    setText(
      row,
      ".return-line-initial",
      selectedArticleId ? "Sortie initiale: " + formatNumber(exited) : "Sortie initiale: -",
    );
    setText(row, ".return-line-returned", selectedArticleId ? formatNumber(returned) : "-");
    setText(row, ".return-line-remaining", selectedArticleId ? formatNumber(remaining) : "-");
  });
  window.lucide?.createIcons();
}

function resetReturnLines(root: HTMLElement, sourceMovementId: string) {
  const body = root.querySelector<HTMLTableSectionElement>("#returnLines");
  if (!body) return;
  if (!sourceMovementId) {
    body.innerHTML =
      '<tr><td colspan="11" class="px-5 py-6 text-center text-gray-500">Selectionne une sortie pour afficher ses articles.</td></tr>';
    return;
  }
  body.innerHTML = returnLineRow(0);
  refreshReturnLines(root);
}

function addReturnLine(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  const body = modal?.querySelector<HTMLTableSectionElement>("#returnLines");
  const sourceMovementId = modal?.dataset.returnSourceMovementId ?? "";
  if (!body || !sourceMovementId) {
    showToast(root, "Selectionne d'abord une sortie.", "error");
    return;
  }
  const rows = body.querySelectorAll(".return-line");
  body.insertAdjacentHTML("beforeend", returnLineRow(rows.length));
  refreshReturnLines(root);
}

function removeReturnLine(root: HTMLElement, trigger: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#returnLines");
  const row = trigger.closest<HTMLTableRowElement>(".return-line");
  if (!body || !row) return;
  const rows = body.querySelectorAll(".return-line");
  if (rows.length <= 1) {
    row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      input.value = "";
    });
    row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
      select.selectedIndex = 0;
    });
  } else {
    row.remove();
  }
  refreshReturnLines(root);
}

function returnSourceOptionLabel(movement: StockMovement) {
  const articleCount = movement.lines.length;
  const articleLabel =
    articleCount > 1
      ? formatNumber(articleCount) + " articles"
      : movement.lines[0]?.article?.designation ?? "1 article";
  const context =
    movement.project?.name ??
    movement.toLocation?.name ??
    movement.requestedBy ??
    movement.receivedBy ??
    "Destination inconnue";
  return `${movement.reference} Ã‚Â· ${articleLabel} Ã‚Â· ${context}`;
}

function returnSourceCompactOptionLabel(movement: StockMovement) {
  const articleCount = movement.lines.length;
  const articleLabel =
    articleCount > 1
      ? formatNumber(articleCount) + " articles"
      : movement.lines[0]?.article?.designation ?? "1 article";
  const context =
    movement.project?.name ??
    movement.toLocation?.name ??
    movement.requestedBy ??
    movement.receivedBy ??
    "Destination inconnue";
  return `${movement.reference} - ${articleLabel} - ${context}`;
}

function normalizeReturnSourceOptions(
  select: HTMLSelectElement,
  movements: StockMovement[],
) {
  Array.from(select.options).forEach((item) => {
    if (!item.value) return;
    const movement = movements.find((source) => source.id === item.value);
    if (movement) item.textContent = returnSourceCompactOptionLabel(movement);
  });
}

function updateReturnSelection(root: HTMLElement, movements: StockMovement[]) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  const select = modal?.querySelector<HTMLSelectElement>("#returnSourceSelect");
  if (!modal || !select) return;
  normalizeReturnSourceOptions(select, movements);
  const movement = movements.find((item) => item.id === select.value);
  latestMovements = movements;
  const sourceLines = returnSourceLines(movement);
  const totalExited = sourceLines.reduce(
    (sum, line) => sum + Number(line.completedQuantity ?? 0),
    0,
  );
  const totalReturned = movement
    ? sourceLines.reduce(
        (sum, line) =>
          sum + returnedQuantityForSource(movement.id, line.articleId),
        0,
      )
    : 0;
  const values: Record<string, string> = {
    bon: movement?.reference ?? "-",
    article: sourceLines.length
      ? formatNumber(sourceLines.length) +
        " article" +
        (sourceLines.length > 1 ? "s" : "")
      : "-",
    beneficiary: movement?.requestedBy ?? movement?.receivedBy ?? "-",
    destination: movement?.toLocation?.name ?? movement?.project?.name ?? "-",
    quantity: movement ? formatNumber(Math.max(0, totalExited - totalReturned)) : "-",
    returned: movement ? formatNumber(totalReturned) : "-",
  };
  Object.entries(values).forEach(([key, value]) => {
    const node = modal.querySelector<HTMLElement>(
      `[data-return-kpi="${key}"] .font-bold`,
    );
    if (node) node.textContent = value;
  });
  modal.dataset.returnSourceMovementId = movement?.id ?? "";
  const summary = modal.querySelector<HTMLElement>("#returnSelectionSummary");
  if (summary)
    summary.innerHTML = movement
      ? `<div><div class="text-sm font-bold">${escapeHtml(movement.reference)} - sortie selectionnee</div><div class="text-xs text-gray-600">${escapeHtml(values.quantity)} encore dehors sur ${escapeHtml(values.article)}</div></div>`
      : `<div><div class="text-sm font-bold">Aucune sortie selectionnee</div><div class="text-xs text-gray-600">Selectionne une sortie pour pre-remplir le formulaire.</div></div>`;
  resetReturnLines(root, movement?.id ?? "");
}

async function populateReturnTransferModals(
  root: HTMLElement,
  modalId: "returnModal" | "transferModal",
) {
  const modal = root.querySelector<HTMLElement>("#" + modalId);
  if (!modal) return;
  const [articles, locations, users, movements] = await Promise.all([
    getArticles().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => []),
    getStockMovements().catch(() => []),
  ]);
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const userChoices = userOptions(users);
  if (modalId === "transferModal") {
    const reference = root.querySelector<HTMLElement>("#transferReference");
    const transferNumber =
      latestMovements.filter((item) => item.type === "TRANSFER").length + 1;
    if (reference)
      reference.textContent = `TRF-${new Date().getFullYear()}-${String(transferNumber).padStart(3, "0")}`;
    const articleChoices =
      option("", "Selectionner article") + articleOptions(articles);
    const locationChoices =
      option("", "Selectionner emplacement") + locationOptions(locations);
    const fillTransferLine = (row: HTMLElement) => {
      const article = row.querySelector<HTMLSelectElement>(".transfer-article");
      const source = row.querySelector<HTMLSelectElement>(".transfer-source");
      const destination = row.querySelector<HTMLSelectElement>(
        ".transfer-destination",
      );
      if (article) article.innerHTML = articleChoices;
      if (source) source.innerHTML = locationChoices;
      if (destination) destination.innerHTML = locationChoices;
      const refresh = () => {
        const available = row.querySelector<HTMLInputElement>(
          ".transfer-available",
        );
        if (available)
          available.value =
            article?.value && source?.value
              ? String(articleStockAtLocation(article.value, source.value))
              : "0";
      };
      article?.addEventListener("change", refresh);
      source?.addEventListener("change", refresh);
      refresh();
    };
    modal
      .querySelectorAll<HTMLElement>("#transferLines .transfer-line")
      .forEach(fillTransferLine);
    modal.dataset.transferLineSetup = "1";
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#transferHandledBy") ?? undefined,
      userChoices,
    );
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#transferDeliveredBy") ??
        undefined,
      userChoices,
    );
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#transferReceivedBy") ??
        undefined,
      userChoices,
    );
    return;
  }
  const exits = movements.filter(
    (movement) => movement.type === "EXIT" && movement.lines.length > 0,
  );
  const sourceSelect = modal.querySelector<HTMLSelectElement>(
    "#returnSourceSelect",
  );
  if (sourceSelect) {
    sourceSelect.innerHTML =
      option("", "Selectionner une sortie") +
      exits
        .map((movement) => {
          return option(movement.id, returnSourceCompactOptionLabel(movement));
        })
        .join("");
    sourceSelect.onchange = () => updateReturnSelection(root, latestMovements);
  }
  fillSelect(selects[1], locationOptions(locations));
  fillSelect(selects[2], userChoices);
  fillSelect(selects[3], userChoices);
  fillSelect(selects[4], userChoices);
  updateReturnSelection(root, movements);
}

async function submitStockReturn(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  if (!modal) return;
  const notes = modal
    .querySelector<HTMLTextAreaElement>("textarea")
    ?.value.trim();
  const sourceMovementId =
    modal.querySelector<HTMLSelectElement>("#returnSourceSelect")?.value ?? "";
  modal.dataset.returnSourceMovementId = sourceMovementId;
  try {
    latestMovements = await getStockMovements();
    refreshReturnLines(root);
  } catch {
    // Keep the current modal values if the refresh is temporarily unavailable.
  }
  const sourceMovement = latestMovements.find(
    (item) => item.id === sourceMovementId,
  );
  const lineRows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>(
      "#returnLines .return-line",
    ),
  );
  const lines = lineRows
    .map((row) => {
      const articleId =
        row.querySelector<HTMLSelectElement>(".return-line-article")?.value ??
        "";
      const goodQuantity =
        toNumber(row.querySelector<HTMLInputElement>(".return-line-good")?.value ?? "0") ?? 0;
      const damagedQuantity =
        toNumber(row.querySelector<HTMLInputElement>(".return-line-damaged")?.value ?? "0") ?? 0;
      const scrapQuantity =
        toNumber(row.querySelector<HTMLInputElement>(".return-line-scrap")?.value ?? "0") ?? 0;
      const pendingControlQuantity =
        toNumber(row.querySelector<HTMLInputElement>(".return-line-pending")?.value ?? "0") ?? 0;
      const completedQuantity =
        goodQuantity + damagedQuantity + scrapQuantity + pendingControlQuantity;
      return {
        articleId,
        completedQuantity,
        goodQuantity,
        damagedQuantity,
        scrapQuantity,
        pendingControlQuantity,
        remaining: Number(row.dataset.remaining ?? "0"),
        observation:
          row
            .querySelector<HTMLInputElement>(".return-line-observation")
            ?.value.trim() || notes,
      };
    })
    .filter((line) => line.completedQuantity > 0);
  const selectedArticleIds = lines.map((line) => line.articleId).filter(Boolean);
  const hasDuplicateArticle =
    new Set(selectedArticleIds).size !== selectedArticleIds.length;
  const attachmentFileName =
    root.querySelector<HTMLInputElement>("#returnAttachment")?.files?.[0]?.name;
  const toLocationId =
    modal.querySelector<HTMLSelectElement>("#returnLocation")?.value;
  if (
    !sourceMovement ||
    !toLocationId ||
    !lines.length ||
    lines.some((line) => !line.articleId) ||
    hasDuplicateArticle ||
    lines.some(
      (line) =>
        line.completedQuantity > line.remaining ||
        line.goodQuantity < 0 ||
        line.damagedQuantity < 0 ||
        line.scrapQuantity < 0 ||
        line.pendingControlQuantity < 0,
    )
  ) {
    showToast(
      root,
      hasDuplicateArticle
        ? "Chaque article ne peut apparaitre qu'une seule fois dans le retour."
        : "Sortie concernee, article, emplacement retour et quantite valide sont requis.",
      "error",
    );
    return;
  }
  try {
    const createdReturn = await createStockReturn({
      reference: "RET-" + Date.now(),
      date:
        root.querySelector<HTMLInputElement>("#returnDate")?.value ||
        new Date().toISOString(),
      sourceMovementId: sourceMovement.id,
      toLocationId,
      handledBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#returnHandledBy") ?? undefined,
      ),
      deliveredBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#returnDeliveredBy") ??
          undefined,
      ),
      receivedBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#returnReceivedBy") ??
          undefined,
      ),
      notes:
        [
          notes,
          attachmentFileName
            ? `Piece jointe: ${attachmentFileName}`
            : undefined,
        ]
          .filter(Boolean)
          .join(" - ") || undefined,
      attachmentFileName,
      lines,
    });
    if (!createdReturn.sourceRequestId) {
      throw new Error("Le retour a ete cree sans sortie source rattachee.");
    }
    const [movements, stockLevels] = await Promise.all([
      getStockMovements(),
      getStockLevels().catch(() => latestStockLevels),
    ]);
    latestMovements = movements;
    latestStockLevels = stockLevels;
    closeModal(root, "returnModal");
    updateApiBackedViews(root);
    showToast(
      root,
      lines.some((line) => line.pendingControlQuantity > 0)
        ? "Retour enregistre avec quantites a controler."
        : "Retour enregistre avec etat du materiel.",
    );
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Retour impossible.",
      "error",
    );
  }
}

async function submitStockTransfer(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#transferModal");
  if (!modal) return;
  const notes = modal
    .querySelector<HTMLTextAreaElement>("textarea")
    ?.value.trim();
  const lines = Array.from(
    modal.querySelectorAll<HTMLElement>("#transferLines .transfer-line"),
  )
    .map((row) => {
      const articleId =
        row.querySelector<HTMLSelectElement>(".transfer-article")?.value ?? "";
      const fromLocationId =
        row.querySelector<HTMLSelectElement>(".transfer-source")?.value ?? "";
      const toLocationId =
        row.querySelector<HTMLSelectElement>(".transfer-destination")?.value ??
        "";
      const quantity = toNumber(
        row.querySelector<HTMLInputElement>(".transfer-quantity")?.value ?? "0",
      );
      const available = articleStockAtLocation(articleId, fromLocationId);
      return { articleId, fromLocationId, toLocationId, quantity, available };
    })
    .filter(
      (line) =>
        line.articleId ||
        line.fromLocationId ||
        line.toLocationId ||
        line.quantity > 0,
    );
  if (
    !lines.length ||
    lines.some(
      (line) =>
        !line.articleId ||
        !line.fromLocationId ||
        !line.toLocationId ||
        line.quantity <= 0 ||
        line.quantity > line.available,
    )
  ) {
    showToast(
      root,
      "Chaque ligne doit avoir un article, une source, une destination et une quantite disponible.",
      "error",
    );
    return;
  }
  if (
    new Set(lines.map((line) => line.fromLocationId)).size > 1 ||
    new Set(lines.map((line) => line.toLocationId)).size > 1
  ) {
    showToast(
      root,
      "Les articles d'un meme transfert doivent partager la source et la destination.",
      "error",
    );
    return;
  }
  try {
    await createStockTransfer({
      reference:
        root
          .querySelector<HTMLElement>("#transferReference")
          ?.textContent?.trim() ||
        `TRF-${new Date().getFullYear()}-${Date.now()}`,
      date:
        root.querySelector<HTMLInputElement>("#transferDate")?.value ||
        new Date().toISOString(),
      fromLocationId: lines[0].fromLocationId,
      toLocationId: lines[0].toLocationId,
      handledBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#transferHandledBy") ??
          undefined,
      ),
      deliveredBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#transferDeliveredBy") ??
          undefined,
      ),
      receivedBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#transferReceivedBy") ??
          undefined,
      ),
      notes,
      lines: lines.map(({ articleId, quantity }) => ({
        articleId,
        completedQuantity: quantity,
        observation: notes,
      })),
    });
    closeModal(root, "transferModal");
    updateApiBackedViews(root);
    showToast(
      root,
      "Transfert enregistre. Le stock source et destination sont mis a jour.",
    );
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Transfert impossible.",
      "error",
    );
  }
}
export function renderReturnTransferRegistryPage(root: HTMLElement, ctx: RetoursTransfertsContext, movements?: StockMovement[]) {
  return withContext(ctx, () => renderReturnTransferRegistry(root, movements));
}

export function downloadReturnPdfPage(root: HTMLElement, id: string, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => downloadReturnPdf(root, id));
}

export function downloadTransferPdfPage(root: HTMLElement, id: string, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => downloadTransferPdf(root, id));
}

export function openReturnTransferDetailPage(root: HTMLElement, id: string, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => openReturnTransferDetail(root, id));
}

export function openReturnControlPage(root: HTMLElement, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => openReturnControl(root));
}

export function submitReturnControlPage(root: HTMLElement, ctx: RetoursTransfertsContext) {
  return withContextAsync(ctx, () => submitReturnControl(root));
}

export function uploadSignedReturnProofPage(root: HTMLElement, id: string, ctx: RetoursTransfertsContext) {
  return withContextAsync(ctx, () => uploadSignedReturnProof(root, id));
}

export function uploadSignedTransferProofPage(root: HTMLElement, id: string, ctx: RetoursTransfertsContext) {
  return withContextAsync(ctx, () => uploadSignedTransferProof(root, id));
}

export function viewSignedReturnProofPage(root: HTMLElement, id: string, ctx: RetoursTransfertsContext) {
  return withContextAsync(ctx, () => viewSignedReturnProof(root, id));
}

export function viewSignedTransferProofPage(root: HTMLElement, id: string, ctx: RetoursTransfertsContext) {
  return withContextAsync(ctx, () => viewSignedTransferProof(root, id));
}

export function addTransferLinePage(root: HTMLElement, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => addTransferLine(root));
}

export function removeTransferLinePage(root: HTMLElement, trigger: HTMLElement, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => removeTransferLine(root, trigger));
}

export function addReturnLinePage(root: HTMLElement, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => addReturnLine(root));
}

export function removeReturnLinePage(root: HTMLElement, trigger: HTMLElement, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => removeReturnLine(root, trigger));
}

export function populateReturnTransferModalsPage(root: HTMLElement, modalId: "returnModal" | "transferModal", ctx: RetoursTransfertsContext) {
  return withContextAsync(ctx, () => populateReturnTransferModals(root, modalId));
}

export function submitStockReturnPage(root: HTMLElement, ctx: RetoursTransfertsContext) {
  return withContextAsync(ctx, () => submitStockReturn(root));
}

export function submitStockTransferPage(root: HTMLElement, ctx: RetoursTransfertsContext) {
  return withContextAsync(ctx, () => submitStockTransfer(root));
}

export function returnSourceLinesPage(source: StockMovement | undefined | null, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => returnSourceLines(source));
}

export function returnedQuantityForSourcePage(sourceMovementId: string, articleId: string, ctx: RetoursTransfertsContext) {
  return withContext(ctx, () => returnedQuantityForSource(sourceMovementId, articleId));
}