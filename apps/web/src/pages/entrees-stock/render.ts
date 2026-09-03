import type {
  Article,
  StockLevel,
  StockLocation,
  StockMovement,
  StockUser,
  Supplier,
} from "../../api";
import { selectedText, setText } from "../../utils/dom";
import { escapeHtml, formatDate, formatNumber, isToday } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type EntreesStockContext = {
  latestMovements: StockMovement[];
  setLatestMovements: (movements: StockMovement[]) => void;
  latestArticles: Article[];
  setLatestArticles: (articles: Article[]) => void;
  latestSuppliers: Supplier[];
  setLatestSuppliers: (suppliers: Supplier[]) => void;
  latestLocations: StockLocation[];
  setLatestLocations: (locations: StockLocation[]) => void;
  latestStockLevels: StockLevel[];
  setLatestStockLevels: (levels: StockLevel[]) => void;
  currentUser: StockUser | null;
  badge: (label: string, tone: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  option: (value: string, label: string, selected?: boolean) => string;
  fillSelect: (select: HTMLSelectElement | undefined, options: string, placeholder?: string) => void;
  articleOptions: (articles: Article[]) => string;
  userDisplayName: (user: Pick<StockUser, "email" | "firstName" | "lastName" | "identifier">) => string;
  toNumber: (value: string) => number;
  openModal: (root: HTMLElement, id: string) => void;
  closeModal: (root: HTMLElement, id: string) => void;
  showToast: (root: HTMLElement, message: string, type?: "success" | "error") => void;
  updateApiBackedViews: (root: HTMLElement) => void;
  hubLogoMarkup: () => string;
  getArticles: () => Promise<Article[]>;
  getSuppliers: () => Promise<Supplier[]>;
  getLocations: () => Promise<StockLocation[]>;
  getUsers: () => Promise<StockUser[]>;
  getStockMovements: () => Promise<StockMovement[]>;
  getStockLevels: () => Promise<StockLevel[]>;
  createStockEntry: (payload: Parameters<typeof import("../../api").createStockEntry>[0]) => Promise<StockMovement>;
  resolveStockEntryDispute: (id: string, payload: Parameters<typeof import("../../api").resolveStockEntryDispute>[1]) => Promise<StockMovement>;
  uploadEntryProof: (id: string, payload: Parameters<typeof import("../../api").uploadEntryProof>[1]) => Promise<StockMovement>;
  getEntryProof: (id: string) => Promise<{ url: string; fileName?: string | null }>;
};

let latestMovements: StockMovement[] = [];
let latestArticles: Article[] = [];
let latestSuppliers: Supplier[] = [];
let latestLocations: StockLocation[] = [];
let latestStockLevels: StockLevel[] = [];
let currentUser: StockUser | null = null;
let currentEntryFilter = "ALL";
let selectedEntryId: string | null = null;
let activeCtx: EntreesStockContext | null = null;

function syncFrom(ctx: EntreesStockContext) {
  activeCtx = ctx;
  latestMovements = ctx.latestMovements;
  latestArticles = ctx.latestArticles;
  latestSuppliers = ctx.latestSuppliers;
  latestLocations = ctx.latestLocations;
  latestStockLevels = ctx.latestStockLevels;
  currentUser = ctx.currentUser;
}

function syncTo() {
  if (!activeCtx) return;
  activeCtx.setLatestMovements(latestMovements);
  activeCtx.setLatestArticles(latestArticles);
  activeCtx.setLatestSuppliers(latestSuppliers);
  activeCtx.setLatestLocations(latestLocations);
  activeCtx.setLatestStockLevels(latestStockLevels);
}

function withContext<T>(ctx: EntreesStockContext, callback: () => T): T {
  syncFrom(ctx);
  try {
    return callback();
  } finally {
    syncTo();
  }
}

async function withContextAsync<T>(ctx: EntreesStockContext, callback: () => Promise<T>): Promise<T> {
  syncFrom(ctx);
  try {
    return await callback();
  } finally {
    syncTo();
  }
}

function requireCtx() {
  if (!activeCtx) throw new Error("Entrees stock context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone: BadgeTone) { return requireCtx().badge(label, tone); }
function emptyRow(colspan: number, message: string) { return requireCtx().emptyRow(colspan, message); }
function option(value: string, label: string, selected?: boolean) { return requireCtx().option(value, label, selected); }
function fillSelect(select: HTMLSelectElement | undefined, options: string, placeholder?: string) { return requireCtx().fillSelect(select, options, placeholder); }
function articleOptions(articles: Article[]) { return requireCtx().articleOptions(articles); }
function userDisplayName(user: Pick<StockUser, "email" | "firstName" | "lastName" | "identifier">) { return requireCtx().userDisplayName(user); }
function toNumber(value: string) { return requireCtx().toNumber(value); }
function openModal(root: HTMLElement, id: string) { return requireCtx().openModal(root, id); }
function closeModal(root: HTMLElement, id: string) { return requireCtx().closeModal(root, id); }
function showToast(root: HTMLElement, message: string, type?: "success" | "error") { return requireCtx().showToast(root, message, type); }
function updateApiBackedViews(root: HTMLElement) { return requireCtx().updateApiBackedViews(root); }
function hubLogoMarkup() { return requireCtx().hubLogoMarkup(); }
function getArticles() { return requireCtx().getArticles(); }
function getSuppliers() { return requireCtx().getSuppliers(); }
function getLocations() { return requireCtx().getLocations(); }
function getUsers() { return requireCtx().getUsers(); }
function getStockMovements() { return requireCtx().getStockMovements(); }
function getStockLevels() { return requireCtx().getStockLevels(); }
function createStockEntry(payload: Parameters<EntreesStockContext["createStockEntry"]>[0]) { return requireCtx().createStockEntry(payload); }
function resolveStockEntryDispute(id: string, payload: Parameters<EntreesStockContext["resolveStockEntryDispute"]>[1]) { return requireCtx().resolveStockEntryDispute(id, payload); }
function uploadEntryProof(id: string, payload: Parameters<EntreesStockContext["uploadEntryProof"]>[1]) { return requireCtx().uploadEntryProof(id, payload); }
function getEntryProof(id: string) { return requireCtx().getEntryProof(id); }

function entryDocumentHtml(movement: StockMovement) {
  const origin =
    movement.notes?.match(/^Origine entree:\s*([^\-]+)/i)?.[1]?.trim() ??
    "Reception directe";
  const rows = movement.lines
    .map((line, index) => {
      const expected = Number(line.expectedQuantity ?? 0);
      const completed = Number(line.completedQuantity ?? 0);
      const gap = completed - expected;
      const observation = cleanEntryLineObservation(line.observation);
      return `<tr>
    <td class="num">${index + 1}</td>
    <td><strong>${escapeHtml(line.article?.designation ?? "Article")}</strong><br><span>${escapeHtml(line.article?.code ?? "-")}</span></td>
    <td>${escapeHtml(line.article?.unit ?? "U")}</td>
    <td class="right strong">${formatNumber(expected)}</td>
    <td class="right strong">${formatNumber(completed)}</td>
    <td class="right strong">${formatNumber(gap)}</td>
    <td>${escapeHtml(observation)}</td>
  </tr>`;
    })
    .join("");
  const { expected, completed } = entryMovementTotals(movement);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Entree stock ${escapeHtml(movement.reference)}</title>
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
    @media print { body { background: white; } .toolbar { display: none; } .page { width: 210mm; min-height: 297mm; margin: 0; padding: 10mm; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer PDF</button></div>
  <main class="page">
    <header class="doc-head">
      <div class="logo-cell">${hubLogoMarkup()}</div>
      <div class="doc-name"><div class="small">Document interne</div><div class="value">Entree stock</div><div class="hint">Reception et controle du materiel entrant</div></div>
      <div class="meta"><div><b>Doc N</b><span>${escapeHtml(movement.reference.replace(/^BE-/, "FE-"))}</span></div><div><b>Bon</b><span>${escapeHtml(movement.reference)}</span></div><div><b>Statut</b><span>${escapeHtml(entryStatusLabel(movement))}</span></div><div><b>Date</b><span>${escapeHtml(formatDate(movement.date))}</span></div></div>
    </header>
    <div class="title">Fiche entree stock</div>
    <section class="info-strip" aria-label="Informations de l'entree">
      <div class="info-item"><div class="label">Fournisseur</div><div class="value">${escapeHtml(movement.supplier?.name ?? "-")}</div></div>
      <div class="info-item"><div class="label">Origine</div><div class="value">${escapeHtml(origin)}</div></div>
      <div class="info-item"><div class="label">Magasin reception</div><div class="value">${escapeHtml(movement.toLocation?.name ?? "-")}</div></div>
      <div class="info-item"><div class="label">Responsable</div><div class="value">${escapeHtml(movement.handledBy ?? movement.receivedBy ?? "-")}</div></div>
      <div class="info-item"><div class="label">Total attendu</div><div class="value">${formatNumber(expected)}</div></div>
      <div class="info-item"><div class="label">Total recu</div><div class="value">${formatNumber(completed)}</div></div>
    </section>
    <table class="items"><thead><tr><th>N</th><th>Designation</th><th>Unite</th><th class="right">Attendue</th><th class="right">Recue</th><th class="right">Ecart</th><th>Observation</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="sign-title">Signatures</div>
    <table class="signature-table"><tbody><tr>
      <td><div class="role">Reception stock</div><div class="name">${escapeHtml(movement.receivedBy ?? movement.handledBy ?? "-")}</div><div class="line">Date et signature</div></td>
      <td><div class="role">Controle qualite</div><div class="name"></div><div class="line">Date et signature</div></td>
      <td><div class="role">Responsable magasin</div><div class="name">${escapeHtml(movement.toLocation?.responsible ?? movement.handledBy ?? "-")}</div><div class="line">Date et signature</div></td>
    </tr></tbody></table>
  </main>
</body>
</html>`;
}

function cleanEntryLineObservation(value: string | null | undefined) {
  const text = (value ?? "").trim();
  if (/^Origine entree\s*:/i.test(text)) return "";
  return text;
}

function downloadEntryPdf(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement || movement.type !== "ENTRY") {
    showToast(root, "Entree stock introuvable.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour telecharger la fiche.", "error");
    return;
  }
  popup.document.write(entryDocumentHtml(movement));
  popup.document.close();
  try {
    popup.history.replaceState(null, "", "/documents/entree-stock/" + encodeURIComponent(movement.reference));
  } catch {
    // The printable document still works when the browser blocks URL replacement.
  }
  popup.focus();
  popup.print();
}

function movementStatus(movement: StockMovement) {
  if (movement.status === "CANCELLED") return badge("Annulee", "gray");
  return badge(entryStatusLabel(movement), entryStatusTone(movement));
}

function entryStatusLabel(movement: StockMovement) {
  if (movement.status === "CANCELLED") return "Annulee";
  const status = entryStatusKindFromLines(movement.lines);
  if (status === "issue") return "Litige";
  if (status === "partial") return "Partielle";
  return "Recue";
}

function entryStatusTone(movement: StockMovement) {
  if (movement.status === "CANCELLED") return "gray";
  const status = entryStatusKindFromLines(movement.lines);
  if (status === "issue") return "error";
  if (status === "partial") return "warning";
  return "success";
}

function movementLinesPreview(
  movement: StockMovement,
  _mode: "entry" | "exit",
) {
  const count = movement.lines.length;
  if (!count) {
    return '<div class="font-bold text-gray-500">Aucun article</div>';
  }

  const first = movement.lines[0];
  const code = first.article?.code ?? "-";
  const designation = first.article?.designation ?? "Article";
  const more =
    count > 1
      ? '<span class="shrink-0 rounded-full bg-accent-50 px-2 py-1 text-xs font-bold text-accent-600">+' +
        formatNumber(count - 1) +
        " autre" +
        (count - 1 > 1 ? "s" : "") +
        "</span>"
      : "";

  return (
    '<div class="flex min-w-[220px] max-w-[320px] items-center justify-between gap-3">' +
    '<div class="min-w-0">' +
    '<div class="truncate font-bold text-gray-900">' +
    escapeHtml(designation) +
    '</div><div class="truncate text-xs text-gray-500">' +
    escapeHtml(code) +
    "</div></div>" +
    more +
    "</div>"
  );
}

function entryMovementRow(movement: StockMovement) {
  const { expected, completed } = entryMovementTotals(movement);
  const delta = completed - expected;
  return (
    "<tr>" +
    '<td class="px-5 py-4 font-bold">' +
    escapeHtml(movement.reference) +
    "</td>" +
    '<td class="px-5 py-4">' +
    formatDate(movement.date) +
    "</td>" +
    '<td class="px-5 py-4">' +
    movementLinesPreview(movement, "entry") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movement.supplier?.name ?? "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movement.supplier?.name ?? "Reception directe") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movement.toLocation?.name ?? "-") +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(expected) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(completed) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(delta) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movement.handledBy ?? movement.receivedBy ?? "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    movementStatus(movement) +
    "</td>" +
    '<td class="px-5 py-4 text-right"><button data-action="openEntryDetail(\'' +
    escapeHtml(movement.id) +
    '\')" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50" title="Voir la fiche"><i data-lucide="eye" class="w-4 h-4"></i></button></td>' +
    "</tr>"
  );
}

function openEntryDetail(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement) {
    showToast(
      root,
      "Entree stock introuvable dans le registre charge.",
      "error",
    );
    return;
  }
  selectedEntryId = id;
  const { expected, completed } = entryMovementTotals(movement);
  const origin =
    movement.notes?.match(/^Origine entree:\s*([^\-]+)/i)?.[1]?.trim() ??
    "Reception directe";
  setText(root, "#entryDetailTitle", movement.reference);
  setText(
    root,
    "#entryDetailSubtitle",
    "Fiche lecture seule de l'entree stock recue.",
  );
  const fields = root.querySelector<HTMLElement>("#entryDetailFields");
  const rows = movement.lines
    .map((line, index) => {
      const lineExpected = Number(line.expectedQuantity ?? 0);
      const lineCompleted = Number(line.completedQuantity ?? 0);
      const observation = cleanEntryLineObservation(line.observation);
      return (
        '<div class="md:col-span-2 rounded-lg border border-gray-200 p-3">' +
        '<div class="flex items-start justify-between gap-3"><div><div class="text-xs font-semibold text-gray-400">Ligne ' +
        String(index + 1) +
        '</div><div class="font-bold mt-1">' +
        escapeHtml(line.article ? line.article.code + " - " + line.article.designation : "-") +
        '</div></div><div class="text-right"><div class="font-bold">' +
        formatNumber(lineCompleted) +
        '</div><div class="text-xs text-gray-500">' +
        escapeHtml(line.article?.unit ?? "U") +
        "</div></div></div>" +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm"><div><span class="text-gray-500">Attendue</span><div class="font-semibold">' +
        formatNumber(lineExpected) +
        '</div></div><div><span class="text-gray-500">Recue</span><div class="font-semibold">' +
        formatNumber(lineCompleted) +
        '</div></div><div><span class="text-gray-500">Ecart</span><div class="font-semibold">' +
        formatNumber(lineCompleted - lineExpected) +
        '</div></div><div><span class="text-gray-500">Prix unitaire</span><div class="font-semibold">' +
        formatNumber(Number(line.unitPrice ?? 0)) +
        "</div></div></div>" +
        (observation
          ? '<div class="mt-3 text-sm text-gray-600">' +
            escapeHtml(observation) +
            "</div>"
          : "") +
        "</div>"
      );
    })
    .join("");
  const canUploadProof = movement.status !== "CANCELLED";
  const hasProof = Boolean(movement.proofFileName || movement.proofFileKey);
  const proofInfo = hasProof
    ? `<div class="mt-4 flex items-center gap-2 rounded-lg border border-success-100 bg-success-50 px-3 py-2 text-sm font-semibold text-success-700"><i data-lucide="check" class="w-4 h-4 shrink-0"></i><span class="min-w-0 truncate">${escapeHtml(movement.proofFileName ?? "Preuve ajoutee")}</span></div>`
    : `<div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">Aucune fiche signee jointe.</div>`;
  const documents =
    `<div class="md:col-span-2 rounded-xl border border-gray-200 overflow-hidden">` +
    `<div class="px-5 py-4 border-b border-gray-200 bg-gray-50"><h3 class="font-bold">Documents</h3><p class="text-sm text-gray-500 mt-1">Telecharge la fiche d'entree, puis joins la version signee.</p></div>` +
    `<div class="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">` +
    `<div class="rounded-xl border border-accent-100 bg-accent-50/40 p-4">` +
    `<div class="flex items-start gap-3"><div class="w-11 h-11 rounded-xl bg-accent-600 text-white flex items-center justify-center shrink-0"><i data-lucide="file-down" class="w-5 h-5"></i></div><div><div class="text-xs font-bold uppercase tracking-wide text-gray-500">Etape 1</div><h4 class="font-bold mt-1">Telecharger la fiche d'entree</h4><p class="text-sm text-gray-600 mt-1">Imprime la fiche recue pour signature et classement.</p></div></div>` +
    `<button type="button" data-action="downloadEntryPdf('${escapeHtml(movement.id)}')" class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 font-semibold text-white hover:bg-accent-500"><i data-lucide="download" class="w-4 h-4"></i>Telecharger la fiche</button>` +
    `${hasProof ? `<button type="button" data-action="viewSignedEntryProof('${escapeHtml(movement.id)}')" class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"><i data-lucide="file-check" class="w-4 h-4"></i>Voir la preuve</button>` : ""}` +
    `</div>` +
    `<div class="rounded-xl border border-gray-200 bg-white p-4">` +
    `<div class="flex items-start gap-3"><div class="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0"><i data-lucide="upload" class="w-5 h-5"></i></div><div><div class="text-xs font-bold uppercase tracking-wide text-gray-500">Etape 2</div><h4 class="font-bold mt-1">Uploader la fiche signee</h4><p class="text-sm text-gray-600 mt-1">PDF ou image signee rattachee a ce bon d'entree.</p></div></div>` +
    `<input id="signedEntryProof-${escapeHtml(movement.id)}" type="file" accept="application/pdf,image/*" class="mt-4 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">` +
    `<button type="button" data-action="uploadSignedEntryProof('${escapeHtml(movement.id)}')" class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-accent-300 bg-accent-50 px-4 py-2.5 font-semibold text-accent-700 hover:bg-accent-100 ${canUploadProof ? "" : "pointer-events-none opacity-50"}"><i data-lucide="upload" class="w-4 h-4"></i>Uploader la fiche signee</button>` +
    proofInfo +
    `</div>` +
    `</div>` +
    `</div>`;
  if (fields)
    fields.innerHTML =
      [
      ["Bon d'entree", movement.reference],
      ["Date", formatDate(movement.date)],
      ["Articles", movement.lines.length > 1 ? movement.lines.length + " articles" : movement.lines[0]?.article ? movement.lines[0].article.code + " - " + movement.lines[0].article.designation : "-"],
      ["Fournisseur", movement.supplier?.name ?? "-"],
      ["Origine", origin],
      ["Magasin de reception", movement.toLocation?.name ?? "-"],
      ["Total attendu", formatNumber(expected)],
      ["Total recu", formatNumber(completed)],
      ["Ecart total", formatNumber(completed - expected)],
      ["Responsable", movement.handledBy ?? movement.receivedBy ?? "-"],
      ["Statut", entryStatusLabel(movement)],
      ["Observation", movement.notes ?? "-"],
      ]
        .map(
          ([label, value]) =>
            '<div><span class="text-gray-500">' +
            escapeHtml(label) +
            '</span><div class="font-semibold mt-1">' +
            escapeHtml(value) +
            "</div></div>",
        )
        .join("") + rows + documents;
  const resolveButton =
    root.querySelector<HTMLButtonElement>("#entryResolveButton");
  if (resolveButton) {
    const canResolve =
      movement.status !== "CANCELLED" &&
      movement.lines.some(
        (line) =>
          Number(line.expectedQuantity ?? 0) > 0 &&
          Number(line.completedQuantity ?? 0) !==
            Number(line.expectedQuantity ?? 0),
      );
    resolveButton.classList.toggle("hidden", !canResolve);
  }
  openModal(root, "entryDetailModal");
}

function entryResolutionRows(movement: StockMovement) {
  return movement.lines.filter((line) => {
    const expected = Number(line.expectedQuantity ?? 0);
    const completed = Number(line.completedQuantity ?? 0);
    return expected > 0 && completed !== expected;
  });
}

function openEntryResolution(root: HTMLElement) {
  const movement = selectedEntryId
    ? latestMovements.find((item) => item.id === selectedEntryId)
    : null;
  if (!movement) {
    showToast(root, "Entree stock introuvable.", "error");
    return;
  }
  const modal = root.querySelector<HTMLElement>("#entryResolutionModal");
  const body = root.querySelector<HTMLTableSectionElement>(
    "#entryResolutionLines",
  );
  if (!modal || !body) return;
  const lines = entryResolutionRows(movement);
  if (!lines.length) {
    showToast(root, "Cette entree n'a plus d'ecart a resoudre.");
    return;
  }
  modal.dataset.entryId = movement.id;
  setText(root, "#entryResolutionTitle", "Resoudre " + movement.reference);
  setText(
    root,
    "#entryResolutionSubtitle",
    "Completer un manquant ou accepter un surplus deja receptionne.",
  );
  body.innerHTML = lines
    .map((line) => {
      const expected = Number(line.expectedQuantity ?? 0);
      const completed = Number(line.completedQuantity ?? 0);
      const gap = expected - completed;
      const isMissing = gap > 0;
      return (
        `<tr data-line-id="${escapeHtml(line.id)}" data-gap="${gap}">` +
        '<td class="px-5 py-4"><div class="font-bold">' +
        escapeHtml(line.article?.designation ?? "-") +
        '</div><div class="text-xs text-gray-500">' +
        escapeHtml(line.article?.code ?? "-") +
        "</div></td>" +
        '<td class="px-5 py-4 text-right">' +
        formatNumber(expected) +
        "</td>" +
        '<td class="px-5 py-4 text-right font-bold">' +
        formatNumber(completed) +
        "</td>" +
        '<td class="px-5 py-4 text-right font-bold ' +
        (isMissing ? "text-warning-700" : "text-success-700") +
        '">' +
        formatNumber(completed - expected) +
        "</td>" +
        '<td class="px-5 py-4">' +
        (isMissing
          ? badge("Completer reception", "warning") +
            '<input type="hidden" class="entry-resolution-action" value="COMPLETE_MISSING">'
          : '<select class="entry-resolution-action h-10 rounded-lg border px-3 text-sm font-semibold"><option value="ACCEPT_SURPLUS">Accepter surplus</option><option value="RETURN_SURPLUS">Retourner surplus</option></select>') +
        "</td>" +
        '<td class="px-5 py-4 text-right"><input class="entry-resolution-quantity w-24 h-10 border rounded-lg px-3 text-right ' +
        (!isMissing ? "bg-gray-50 text-gray-400" : "") +
        `" value="${formatNumber(Math.abs(gap)).replace(/\s/g, "")}" ${isMissing ? "" : "disabled"}></td>` +
        '<td class="px-5 py-4"><input class="entry-resolution-observation w-full h-10 border rounded-lg px-3" placeholder="Observation"></td>' +
        "</tr>"
      );
    })
    .join("");
  body
    .querySelectorAll<HTMLSelectElement>(".entry-resolution-action")
    .forEach((select) => {
      select.onchange = () => {
        const row = select.closest<HTMLTableRowElement>("tr");
        const quantity = row?.querySelector<HTMLInputElement>(
          ".entry-resolution-quantity",
        );
        const returning = select.value === "RETURN_SURPLUS";
        if (quantity) {
          quantity.disabled = !returning;
          quantity.classList.toggle("bg-gray-50", !returning);
          quantity.classList.toggle("text-gray-400", !returning);
        }
      };
    });
  const handledBy = root.querySelector<HTMLInputElement>(
    "#entryResolutionHandledBy",
  );
  if (handledBy) handledBy.value = movement.handledBy ?? movement.receivedBy ?? "";
  const notes = root.querySelector<HTMLInputElement>("#entryResolutionNotes");
  if (notes) notes.value = "";
  openModal(root, "entryResolutionModal");
}

async function submitEntryResolution(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#entryResolutionModal");
  const entryId = modal?.dataset.entryId;
  if (!modal || !entryId) return;
  const rows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>("#entryResolutionLines tr"),
  );
  const lines = rows.map((row) => {
    const action =
      row.querySelector<HTMLInputElement>(".entry-resolution-action")?.value ===
      "ACCEPT_SURPLUS"
        ? "ACCEPT_SURPLUS"
        : "COMPLETE_MISSING";
    return {
      lineId: row.dataset.lineId ?? "",
      action: action as
        | "COMPLETE_MISSING"
        | "ACCEPT_SURPLUS"
        | "RETURN_SURPLUS",
      quantity: toNumber(
        row.querySelector<HTMLInputElement>(".entry-resolution-quantity")
          ?.value ?? "0",
      ),
      observation:
        row
          .querySelector<HTMLInputElement>(".entry-resolution-observation")
          ?.value.trim() || undefined,
      gap: Number(row.dataset.gap ?? 0),
    };
  });
  const invalidMissing = lines.some(
    (line) =>
      line.action === "COMPLETE_MISSING" &&
      (line.quantity <= 0 || line.quantity > line.gap),
  );
  const invalidSurplusReturn = lines.some(
    (line) =>
      line.action === "RETURN_SURPLUS" &&
      (line.quantity <= 0 || line.quantity > Math.abs(line.gap)),
  );
  if (!lines.length || invalidMissing || invalidSurplusReturn) {
    showToast(
      root,
      "Verifie les quantites de resolution avant validation.",
      "error",
    );
    return;
  }
  try {
    const updated = await resolveStockEntryDispute(entryId, {
      handledBy:
        root.querySelector<HTMLInputElement>("#entryResolutionHandledBy")?.value.trim() ||
        undefined,
      notes:
        root.querySelector<HTMLInputElement>("#entryResolutionNotes")?.value.trim() ||
        undefined,
      lines: lines.map(({ lineId, action, quantity, observation }) => ({
        lineId,
        action,
        quantity,
        observation,
      })),
    });
    latestMovements = await getStockMovements().catch(() =>
      latestMovements.map((item) => (item.id === updated.id ? updated : item)),
    );
    latestStockLevels = await getStockLevels().catch(() => latestStockLevels);
    closeModal(root, "entryResolutionModal");
    updateApiBackedViews(root);
    openEntryDetail(root, entryId);
    showToast(root, "Litige entree resolu et stock mis a jour.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Resolution impossible.",
      "error",
    );
  }
}

function entryFilterMatches(movement: StockMovement) {
  if (movement.type !== "ENTRY") return false;
  const isCancelled = movement.status === "CANCELLED";
  const isLitige = entryHasDispute(movement);
  const isRecue = entryIsReceived(movement);

  if (currentEntryFilter === "ALL") return true;
  if (currentEntryFilter === "RECEIVED") return isRecue;
  if (currentEntryFilter === "DISPUTES") return isLitige;
  if (currentEntryFilter === "CANCELLED") return isCancelled;
  return true;
}

function renderEntriesRegistry(root: HTMLElement) {
  const entriesBody = root.querySelector<HTMLElement>("#entrees tbody");
  const entries = latestMovements.filter(
    (movement) => movement.type === "ENTRY",
  );
  const visible = entries.filter(entryFilterMatches);
  if (entriesBody) {
    entriesBody.innerHTML = visible.length
      ? visible.map(entryMovementRow).join("")
      : emptyRow(12, "Aucune entree stock pour ce filtre.");
  }
  setText(
    root,
    "#entriesTodayCount",
    entries.filter((movement) => isToday(movement.date)).length,
  );
  setText(
    root,
    "#entriesReceivedCount",
    entries.filter(entryIsReceived).length,
  );
  setText(
    root,
    "#entriesPartialCount",
    entries.filter(entryHasPartial).length,
  );
  setText(
    root,
    "#entriesIssueCount",
    entries.filter(entryHasDispute).length,
  );
  root
    .querySelectorAll<HTMLElement>("#entrees [data-entry-filter]")
    .forEach((button) => {
      const active = button.dataset.entryFilter === currentEntryFilter;
      button.classList.toggle("bg-accent-50", active);
      button.classList.toggle("text-accent-600", active);
      button.classList.toggle("bg-gray-100", !active);
      button.classList.toggle("text-gray-600", !active);
    });
  window.lucide?.createIcons();
}

async function populateEntryModal(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#entryModal");
  if (!modal) return;
  const [articles, suppliers, locations, users] = await Promise.all([
    getArticles().catch(() => []),
    getSuppliers().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => []),
  ]);
  latestArticles = articles;
  latestSuppliers = suppliers;
  latestLocations = locations;
  const supplierSelect =
    modal.querySelector<HTMLSelectElement>("#entrySupplierSelect");
  const originSelect =
    modal.querySelector<HTMLSelectElement>("#entryOriginSelect");
  const locationSelect =
    modal.querySelector<HTMLSelectElement>("#entryLocationSelect");
  const handledBySelect =
    modal.querySelector<HTMLSelectElement>("#entryHandledBySelect");
  const receivedBySelect =
    modal.querySelector<HTMLSelectElement>("#entryReceivedBySelect");
  const previousSupplierId = supplierSelect?.value ?? "";
  const previousLocationId = locationSelect?.value ?? "";
  const previousHandledBy = handledBySelect?.value ?? "";
  const previousReceivedBy = receivedBySelect?.value ?? "";

  fillSelect(
    supplierSelect ?? undefined,
    suppliers.map((supplier) => option(supplier.id, supplier.name)).join(""),
    "Selectionner fournisseur",
  );
  if (supplierSelect && previousSupplierId) supplierSelect.value = previousSupplierId;
  const stockLocations = locations.filter((location) =>
    ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE"].includes(
      location.type.toUpperCase(),
    ),
  );
  fillSelect(
    locationSelect ?? undefined,
    stockLocations
      .map((location) => option(location.id, location.name))
      .join(""),
    "Selectionner magasin",
  );
  if (locationSelect && previousLocationId) locationSelect.value = previousLocationId;
  const peopleOptions = users
    .map((user) => {
      const name = userDisplayName(user);
      return option(name, name);
    })
    .join("");
  fillSelect(handledBySelect ?? undefined, peopleOptions, "Selectionner responsable");
  fillSelect(receivedBySelect ?? undefined, peopleOptions, "Selectionner receptionnaire");
  if (handledBySelect && previousHandledBy) handledBySelect.value = previousHandledBy;
  if (receivedBySelect && previousReceivedBy) receivedBySelect.value = previousReceivedBy;
  if (locationSelect) locationSelect.onchange = () => refreshEntryLines(root);
  const articleChoices =
    option("", "Selectionner article") + articleOptions(articles);
  modal
    .querySelectorAll<HTMLSelectElement>("#entryLines .entry-article")
    .forEach((select) => {
      const selected = select.value;
      select.innerHTML = articleChoices;
      select.value = selected;
    });
  modal.dataset.entryArticleChoices = articleChoices;
  refreshEntryLines(root);
}

function entryRows(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLTableRowElement>("#entryLines .entry-line"),
  );
}

function entryLineValues(row: HTMLTableRowElement) {
  return {
    articleId: row.querySelector<HTMLSelectElement>(".entry-article")?.value ?? "",
    expectedQuantity: toNumber(
      row.querySelector<HTMLInputElement>(".entry-expected")?.value ?? "0",
    ),
    completedQuantity: toNumber(
      row.querySelector<HTMLInputElement>(".entry-received")?.value ?? "0",
    ),
    unitPrice: toNumber(
      row.querySelector<HTMLInputElement>(".entry-unit-price")?.value ?? "0",
    ),
    observation:
      row.querySelector<HTMLInputElement>(".entry-observation")?.value.trim() ||
      undefined,
  };
}

function entryMovementTotals(movement: StockMovement) {
  return movement.lines.reduce(
    (totals, line) => ({
      expected: totals.expected + Number(line.expectedQuantity ?? 0),
      completed: totals.completed + Number(line.completedQuantity ?? 0),
    }),
    { expected: 0, completed: 0 },
  );
}

function entryStatusKindFromLines(
  lines: Array<{ expectedQuantity?: number | null; completedQuantity?: number | null }>,
) {
  const comparable = lines.filter((line) => Number(line.expectedQuantity ?? 0) > 0);
  if (!comparable.length) return "received";
  if (
    comparable.some(
      (line) =>
        Number(line.completedQuantity ?? 0) > Number(line.expectedQuantity ?? 0),
    )
  )
    return "issue";
  if (
    comparable.some(
      (line) =>
        Number(line.completedQuantity ?? 0) < Number(line.expectedQuantity ?? 0),
    )
  )
    return "partial";
  return "received";
}

function entryHasDispute(movement: StockMovement) {
  if (movement.status === "REJECTED") return true;
  return movement.lines.some((line) => {
    const expected = Number(line.expectedQuantity ?? 0);
    if (expected <= 0) return false;
    return Number(line.completedQuantity ?? 0) !== expected;
  });
}

function entryHasPartial(movement: StockMovement) {
  if (movement.status === "PREPARED") return true;
  return movement.lines.some((line) => {
    const expected = Number(line.expectedQuantity ?? 0);
    return (
      expected > 0 &&
      Number(line.completedQuantity ?? 0) > 0 &&
      Number(line.completedQuantity ?? 0) < expected
    );
  });
}

function entryIsReceived(movement: StockMovement) {
  if (movement.status === "CANCELLED" || entryHasDispute(movement)) return false;
  return (
    movement.status === "COMPLETED" ||
    entryStatusKindFromLines(movement.lines) === "received"
  );
}

function refreshEntryLines(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#entryModal");
  if (!modal) return;
  const rows = entryRows(modal);
  let totalExpected = 0;
  let totalReceived = 0;
  const selectedLocationId =
    modal.querySelector<HTMLSelectElement>("#entryLocationSelect")?.value;

  rows.forEach((row, index) => {
    const number = row.querySelector<HTMLElement>(".entry-line-number");
    if (number) number.textContent = String(index + 1);

    const articleSelect = row.querySelector<HTMLSelectElement>(".entry-article");
    const article = latestArticles.find((item) => item.id === articleSelect?.value);
    const values = entryLineValues(row);
    const delta = values.completedQuantity - values.expectedQuantity;
    totalExpected += values.expectedQuantity;
    totalReceived += values.completedQuantity;

    setText(row, ".entry-line-code", article?.code ?? "-");
    setText(row, ".entry-line-unit", article?.unit ?? "-");
    setText(row, ".entry-line-delta", formatNumber(delta));
    const status = row.querySelector<HTMLElement>(".entry-line-status");
    const statusLabel =
      values.expectedQuantity <= 0 && values.completedQuantity <= 0
        ? "A calculer"
        : values.expectedQuantity > 0 &&
            values.completedQuantity < values.expectedQuantity
          ? "Partielle"
          : values.expectedQuantity > 0 &&
              values.completedQuantity > values.expectedQuantity
            ? "Litige"
            : "Recue";
    if (status) {
      status.textContent = statusLabel;
      status.className =
        "entry-line-status text-xs font-semibold " +
        (statusLabel === "Recue"
          ? "text-success-700"
          : statusLabel === "Partielle"
            ? "text-warning-700"
            : statusLabel === "Litige"
              ? "text-error-700"
              : "text-gray-400");
    }

    const sync = () => refreshEntryLines(root);
    if (articleSelect) articleSelect.onchange = sync;
    row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      input.oninput = sync;
    });
  });

  setText(modal, "#entryLineCount", String(rows.length));
  setText(modal, "#entryTotalExpected", formatNumber(totalExpected));
  setText(modal, "#entryTotalReceived", formatNumber(totalReceived));
  const statusBox = modal.querySelector<HTMLElement>("#entryComputedStatus");
  if (statusBox) {
    const lineValues = rows.map(entryLineValues);
    const hasAnyQuantity = lineValues.some(
      (line) => line.expectedQuantity > 0 || line.completedQuantity > 0,
    );
    const kind = hasAnyQuantity ? entryStatusKindFromLines(lineValues) : "empty";
    const label =
      kind === "received"
        ? "Recue"
        : kind === "partial"
          ? "Partielle"
          : kind === "issue"
            ? "Litige"
            : "A calculer";
    const tone =
      label === "Recue"
        ? "border-success-100 bg-success-50 text-success-700"
        : label === "Partielle"
          ? "border-warning-100 bg-warning-50 text-warning-700"
          : label === "Litige"
            ? "border-error-100 bg-error-50 text-error-700"
            : "border-gray-200 bg-gray-50 text-gray-500";
    statusBox.className =
      "mt-2 h-11 rounded-lg border px-3 flex items-center font-semibold " + tone;
    statusBox.textContent = label;
  }
  window.lucide?.createIcons();
}

function addEntryLine(root: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#entryLines");
  const first = body?.querySelector<HTMLTableRowElement>(".entry-line");
  if (!body || !first) return;
  const row = first.cloneNode(true) as HTMLTableRowElement;
  row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
    input.value = "";
  });
  row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
    select.innerHTML =
      root.querySelector<HTMLElement>("#entryModal")?.dataset.entryArticleChoices ??
      first.querySelector<HTMLSelectElement>("select")?.innerHTML ??
      "";
    select.selectedIndex = 0;
  });
  row.querySelectorAll<HTMLElement>(".entry-line-code,.entry-line-unit").forEach(
    (element) => {
      element.textContent = "-";
    },
  );
  body.appendChild(row);
  refreshEntryLines(root);
}

function removeEntryLine(root: HTMLElement, trigger: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#entryLines");
  const rows = Array.from(
    body?.querySelectorAll<HTMLTableRowElement>(".entry-line") ?? [],
  );
  const row = trigger.closest<HTMLTableRowElement>(".entry-line");
  if (!body || !row) return;
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
  refreshEntryLines(root);
}

function selectArticleInEntry(root: HTMLElement, articleId: string) {
  const entryModal = root.querySelector<HTMLElement>("#entryModal");
  if (!entryModal) return;
  let targetRow =
    entryRows(entryModal).find(
      (row) => !row.querySelector<HTMLSelectElement>(".entry-article")?.value,
    ) ?? null;
  if (!targetRow) {
    addEntryLine(root);
    const rows = entryRows(entryModal);
    targetRow = rows[rows.length - 1] ?? null;
  }
  const select = targetRow?.querySelector<HTMLSelectElement>(".entry-article");
  if (select) select.value = articleId;
  refreshEntryLines(root);
}

async function submitStockEntry(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#entryModal");
  if (!modal) return;
  const rawNotes =
    modal.querySelector<HTMLTextAreaElement>("#entryNotesInput")?.value.trim();
  const originSelect =
    modal.querySelector<HTMLSelectElement>("#entryOriginSelect");
  const originLabel = selectedText(originSelect ?? undefined);
  const notes =
    [originLabel ? "Origine entree: " + originLabel : undefined, rawNotes]
      .filter(Boolean)
      .join(" - ") || undefined;
  const reference =
    modal.querySelector<HTMLInputElement>("#entryReferenceInput")?.value.trim() ||
    "BE-" + Date.now();
  const toLocationId =
    modal.querySelector<HTMLSelectElement>("#entryLocationSelect")?.value;
  const rows = entryRows(modal);
  const lines = rows.map(entryLineValues);
  const invalidLine = lines.some(
    (line) =>
      !line.articleId ||
      line.completedQuantity <= 0 ||
      line.expectedQuantity < 0 ||
      line.unitPrice < 0,
  );
  if (!toLocationId || !lines.length || invalidLine) {
    showToast(
      root,
      "Magasin, article et quantite recue positive sont obligatoires sur chaque ligne.",
      "error",
    );
    return;
  }
  try {
    await createStockEntry({
      reference,
      date:
        modal.querySelector<HTMLInputElement>("#entryDateInput")?.value ||
        new Date().toISOString(),
      supplierId:
        modal.querySelector<HTMLSelectElement>("#entrySupplierSelect")?.value ||
        undefined,
      toLocationId,
      handledBy:
        modal.querySelector<HTMLSelectElement>("#entryHandledBySelect")?.value ||
        undefined,
      receivedBy:
        modal.querySelector<HTMLSelectElement>("#entryReceivedBySelect")?.value ||
        undefined,
      deliveredBy:
        modal.querySelector<HTMLInputElement>("#entryDeliveredByInput")?.value.trim() ||
        undefined,
      notes,
      lines: lines.map((line) => ({
        ...line,
        observation: line.observation || undefined,
      })),
    });
    closeModal(root, "entryModal");
    updateApiBackedViews(root);
    showToast(root, "Entree stock enregistree et stock mis a jour.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Entree stock impossible.",
      "error",
    );
  }
}

async function uploadSignedEntryProof(root: HTMLElement, id: string) {
  const input = root.querySelector<HTMLInputElement>(
    `#signedEntryProof-${CSS.escape(id)}`,
  );
  const file = input?.files?.[0];
  if (!file) {
    showToast(root, "Ajoute la fiche d'entree signee.", "error");
    return;
  }
  try {
    const updated = await uploadEntryProof(id, {
      file,
      uploadedBy: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
        : undefined,
    });
    latestMovements = await getStockMovements();
    selectedEntryId = updated.id;
    openEntryDetail(root, updated.id);
    updateApiBackedViews(root);
    showToast(root, "Fiche d'entree signee uploadée.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Upload impossible.",
      "error",
    );
  }
}

async function viewSignedEntryProof(root: HTMLElement, id: string) {
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
    const proof = await getEntryProof(id);
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
export {
  cleanEntryLineObservation,
  entryHasDispute,
  entryHasPartial,
  entryIsReceived,
  entryMovementTotals,
  entryStatusLabel,
  entryStatusTone,
  movementLinesPreview,
};

export function setEntryFilter(filter: string, ctx: EntreesStockContext) {
  return withContext(ctx, () => {
    currentEntryFilter = filter;
  });
}

export function renderEntriesRegistryPage(root: HTMLElement, ctx: EntreesStockContext) {
  return withContext(ctx, () => renderEntriesRegistry(root));
}

export function populateEntryModalPage(root: HTMLElement, ctx: EntreesStockContext) {
  return withContextAsync(ctx, () => populateEntryModal(root));
}

export function addEntryLinePage(root: HTMLElement, ctx: EntreesStockContext) {
  return withContext(ctx, () => addEntryLine(root));
}

export function removeEntryLinePage(root: HTMLElement, trigger: HTMLElement, ctx: EntreesStockContext) {
  return withContext(ctx, () => removeEntryLine(root, trigger));
}

export function selectArticleInEntryPage(root: HTMLElement, articleId: string, ctx: EntreesStockContext) {
  return withContext(ctx, () => selectArticleInEntry(root, articleId));
}

export function submitStockEntryPage(root: HTMLElement, ctx: EntreesStockContext) {
  return withContextAsync(ctx, () => submitStockEntry(root));
}

export function openEntryDetailPage(root: HTMLElement, id: string, ctx: EntreesStockContext) {
  return withContext(ctx, () => openEntryDetail(root, id));
}

export function openEntryResolutionPage(root: HTMLElement, ctx: EntreesStockContext) {
  return withContext(ctx, () => openEntryResolution(root));
}

export function submitEntryResolutionPage(root: HTMLElement, ctx: EntreesStockContext) {
  return withContextAsync(ctx, () => submitEntryResolution(root));
}

export function downloadEntryPdfPage(root: HTMLElement, id: string, ctx: EntreesStockContext) {
  return withContext(ctx, () => downloadEntryPdf(root, id));
}

export function uploadSignedEntryProofPage(root: HTMLElement, id: string, ctx: EntreesStockContext) {
  return withContextAsync(ctx, () => uploadSignedEntryProof(root, id));
}

export function viewSignedEntryProofPage(root: HTMLElement, id: string, ctx: EntreesStockContext) {
  return withContextAsync(ctx, () => viewSignedEntryProof(root, id));
}
