import * as XLSX from "xlsx";
import type {
  Article,
  StockLevel,
  StockLocation,
  StockMovement,
  StockUser,
} from "../../api";
import type {
  ExcelCellValue,
  ExcelExportColumn,
  ExcelExportRow,
  InventoryExportScope,
} from "../../types/export";
import type { InventoryImportRow } from "../../types/import";
import type { InventoryComputedLine } from "../../types/stock";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

type InventoryAdjustmentPayload = Parameters<InventaireStockContext["createInventoryAdjustment"]>[0];

export type InventaireStockContext = {
  latestArticles: Article[];
  latestLocations: StockLocation[];
  latestStockLevels: StockLevel[];
  latestMovements: StockMovement[];
  setLatestStockLevels: (levels: StockLevel[]) => void;
  setLatestMovements: (movements: StockMovement[]) => void;
  currentUser: StockUser | null;
  createInventoryAdjustment: (payload: {
    reference: string;
    date: string;
    locationId: string;
    handledBy?: string;
    notes?: string;
    lines: Array<{
      articleId: string;
      expectedQuantity: number;
      completedQuantity: number;
      goodQuantity?: number;
      repairQuantity?: number;
      outOfServiceQuantity?: number;
      observation?: string;
    }>;
  }) => Promise<StockMovement>;
  getStockLevels: () => Promise<StockLevel[]>;
  getStockMovements: () => Promise<StockMovement[]>;
  exportWorkbook: (params: {
    filename: string;
    sheetName: string;
    columns: ExcelExportColumn[];
    rows: ExcelExportRow[];
  }) => Promise<void>;
  closeStockDrawer: (root: HTMLElement) => void;
  clearVueStockDrawerState: () => void;
  clearHistoryMovementDrawerPage: () => void;
  openModal: (root: HTMLElement, id: string) => void;
  closeModal: (root: HTMLElement, id: string) => void;
  showToast: (root: HTMLElement, message: string, tone?: "success" | "error") => void;
  emptyRow: (colspan: number, message: string) => string;
  badge: (label: string, tone?: BadgeTone) => string;
  detailCard: (
    label: string,
    value: unknown,
    tone?: "success" | "gray" | "accent",
  ) => string;
  fillSelect: (select: HTMLSelectElement | undefined, options: string, placeholder?: string) => void;
  option: (value: string, label: string) => string;
  setText: (root: HTMLElement, selector: string, value: number | string) => void;
  formatDate: (value: string | Date | null | undefined) => string;
  formatNumber: (value: number | string | null | undefined) => string;
  escapeHtml: (value: string | number | null | undefined) => string;
  selectedText: (select: HTMLSelectElement | undefined) => string | undefined;
  articleImportKey: (value: string) => string;
  articleImportHeaderKey: (value: string) => string;
  articleImportNumber: (value: string) => number;
  excelCellText: (value: ExcelCellValue) => string;
  hubLogoMarkup: () => string;
  movementTypeBadge: (type: StockMovement["type"]) => string;
  updateApiBackedViews: (root: HTMLElement) => void;
};

let ctx: InventaireStockContext;
let latestArticles: Article[] = [];
let latestLocations: StockLocation[] = [];
let latestStockLevels: StockLevel[] = [];
let latestMovements: StockMovement[] = [];
let currentUser: StockUser | null = null;
let inventoryImportRows: InventoryImportRow[] = [];
let openInventoryArticleId: string | null = null;
let openInventoryLocationId: string | null = null;
let openInventoryScope: "local" | "global" | null = null;

function bind(context: InventaireStockContext) {
  ctx = context;
  latestArticles = context.latestArticles;
  latestLocations = context.latestLocations;
  latestStockLevels = context.latestStockLevels;
  latestMovements = context.latestMovements;
  currentUser = context.currentUser;
}

function commitLists() {
  ctx.setLatestMovements(latestMovements);
  ctx.setLatestStockLevels(latestStockLevels);
}

function badge(label: string, tone?: BadgeTone) { return ctx.badge(label, tone); }
function emptyRow(colspan: number, message: string) { return ctx.emptyRow(colspan, message); }
function detailCard(label: string, value: unknown, tone?: "success" | "gray" | "accent") { return ctx.detailCard(label, value, tone); }
function fillSelect(select: HTMLSelectElement | undefined, options: string, placeholder?: string) { return ctx.fillSelect(select, options, placeholder); }
function option(value: string, label: string) { return ctx.option(value, label); }
function setText(root: HTMLElement, selector: string, value: number | string) { return ctx.setText(root, selector, value); }
function formatDate(value: string | Date | null | undefined) { return ctx.formatDate(value); }
function formatNumber(value: number | string | null | undefined) { return ctx.formatNumber(value); }
function escapeHtml(value: string | number | null | undefined) { return ctx.escapeHtml(value); }
function selectedText(select: HTMLSelectElement | undefined) { return ctx.selectedText(select); }
function articleImportKey(value: string) { return ctx.articleImportKey(value); }
function articleImportHeaderKey(value: string) { return ctx.articleImportHeaderKey(value); }
function articleImportNumber(value: string) { return ctx.articleImportNumber(value); }
function excelCellText(value: ExcelCellValue) { return ctx.excelCellText(value); }
function hubLogoMarkup() { return ctx.hubLogoMarkup(); }
function movementTypeBadge(type: StockMovement["type"]) { return ctx.movementTypeBadge(type); }
function closeModal(root: HTMLElement, id: string) { return ctx.closeModal(root, id); }
function showToast(root: HTMLElement, message: string, tone?: "success" | "error") { return ctx.showToast(root, message, tone); }
function updateApiBackedViews(root: HTMLElement) { return ctx.updateApiBackedViews(root); }
function clearVueStockDrawerState() { return ctx.clearVueStockDrawerState(); }
function clearHistoryMovementDrawerPage() { return ctx.clearHistoryMovementDrawerPage(); }
function locationOptions(locations: StockLocation[]) { return locations.map((location) => option(location.id, location.name)).join(""); }
function toNumber(value: string) { return value.trim() === "" ? 0 : Number(value.replace(/\s/g, "").replace(",", ".")); }
async function createInventoryAdjustment(payload: InventoryAdjustmentPayload) { return ctx.createInventoryAdjustment(payload); }
async function getStockLevels() { return ctx.getStockLevels(); }
async function getStockMovements() { return ctx.getStockMovements(); }
async function exportWorkbook(params: Parameters<InventaireStockContext["exportWorkbook"]>[0]) { return ctx.exportWorkbook(params); }

function inventoryPairKey(articleId: string, locationId: string) {
  return articleId + "::" + locationId;
}

function openInventoryDetail(
  root: HTMLElement,
  articleId: string,
  locationId: string,
) {
  clearVueStockDrawerState();
  openInventoryArticleId = articleId;
  openInventoryLocationId = locationId;
  openInventoryScope = "local";
  clearHistoryMovementDrawerPage();
  renderInventoryDrawer(root);
}

function openInventoryGlobalDetail(root: HTMLElement, articleId: string) {
  clearVueStockDrawerState();
  openInventoryArticleId = articleId;
  openInventoryLocationId = null;
  openInventoryScope = "global";
  clearHistoryMovementDrawerPage();
  renderInventoryDrawer(root);
}

function inventoryBreakdownFromObservation(observation?: string | null) {
  const text = observation ?? "";
  const read = (label: string) => {
    const match = text.match(new RegExp(label + "\\s+(\\d+(?:[.,]\\d+)?)", "i"));
    return match ? Number(match[1].replace(",", ".")) : 0;
  };
  const structured = /Inventaire:\s*constate/i.test(text);
  const userNote = text
    .split("|")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part &&
        !/^Inventaire:/i.test(part) &&
        !/^(bon etat|a reparer|hors service)\s+/i.test(part),
    )
    .join(" | ");
  return {
    structured,
    counted: read("constate"),
    good: read("bon etat"),
    repair: read("a reparer"),
    outOfService: read("hors service"),
    justification: userNote,
  };
}

function latestInventoryMovementLine(articleId: string, locationId: string) {
  return latestMovements
    .filter(
      (movement) =>
        movement.type === "ADJUSTMENT" &&
        movement.status !== "CANCELLED" &&
        movement.lines.some((line) => line.articleId === articleId) &&
        (movement.fromLocationId === locationId ||
          movement.toLocationId === locationId),
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0]
    ?.lines.find((line) => line.articleId === articleId);
}

function inventoryComputedLine(level: StockLevel): InventoryComputedLine {
  const lastLine = latestInventoryMovementLine(
    level.article.id,
    level.location.id,
  );
  const breakdown = inventoryBreakdownFromObservation(lastLine?.observation);
  const hasCount = Boolean(lastLine);
  const theoretical = Number(lastLine?.expectedQuantity ?? level.quantity ?? 0);
  const counted = hasCount
    ? Number(lastLine?.completedQuantity ?? breakdown.counted ?? 0)
    : Number(level.quantity ?? 0);
  const good = hasCount
    ? breakdown.structured
      ? breakdown.good
      : counted
    : Math.max(counted, 0);
  const repair = hasCount && breakdown.structured ? breakdown.repair : 0;
  const outOfService =
    hasCount && breakdown.structured ? breakdown.outOfService : 0;
  return {
    articleId: level.article.id,
    article: level.article,
    locationId: level.location.id,
    location: level.location,
    theoretical,
    counted,
    good,
    repair,
    outOfService,
    gap: counted - theoretical,
    justification: breakdown.justification || lastLine?.observation || "",
    countedAt: hasCount ? "1" : undefined,
  };
}

function inventoryLineStatus(line: InventoryComputedLine) {
  if (!line.countedAt) return { label: "A compter", tone: "gray" as const };
  if (line.gap === 0) return { label: "Valide", tone: "success" as const };
  return { label: "Ecart a justifier", tone: "warning" as const };
}

function inventoryLineIsValidated(line: InventoryComputedLine) {
  return line.gap === 0;
}

function inventoryRow(line: InventoryComputedLine) {
  const action =
    "openCount('" + line.article.id + "','" + line.location.id + "')";
  const detailAction =
    "openInventoryDetail('" +
    line.article.id +
    "','" +
    line.location.id +
    "')";
  const status = inventoryLineStatus(line);
  const rowClass = line.gap !== 0 ? "bg-error-50/40" : "";
  return (
    `<tr class="cursor-pointer hover:bg-gray-50 transition-colors ${rowClass}" data-action="${detailAction}">` +
    '<td class="px-5 py-4"><div class="font-bold">' +
    escapeHtml(line.article.designation) +
    '</div><div class="text-xs text-gray-500">' +
    escapeHtml(line.article.code) +
    "</div></td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(line.theoretical) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(line.counted) +
    "</td>" +
    '<td class="px-5 py-4 text-right text-success-700 font-bold">' +
    formatNumber(line.good) +
    "</td>" +
    '<td class="px-5 py-4 text-right text-warning-700 font-bold">' +
    formatNumber(line.repair) +
    "</td>" +
    '<td class="px-5 py-4 text-right text-error-700 font-bold">' +
    formatNumber(line.outOfService) +
    "</td>" +
    `<td class="px-5 py-4 text-center font-bold ${line.gap !== 0 ? "text-error-700" : ""}">` +
    (line.gap === 0 ? "-" : formatNumber(line.gap)) +
    "</td>" +
    '<td class="px-5 py-4 text-gray-600">' +
    escapeHtml(line.justification || "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(status.label, status.tone) +
    "</td>" +
    '<td class="px-5 py-4 text-right"><button data-action="' +
    action +
    '" title="Saisir ou modifier le comptage" class="w-9 h-9 rounded-lg border border-gray-300 bg-white text-accent-600 inline-flex items-center justify-center"><i data-lucide="pencil" class="w-4 h-4"></i></button></td>' +
    "</tr>"
  );
}

function inventoryLevelsForLocation(locationId: string): StockLevel[] {
  const location = latestLocations.find((item) => item.id === locationId);
  if (!location) return [];
  const levels = latestStockLevels.filter(
    (level) => level.location.id === locationId,
  );
  const knownArticleIds = new Set(levels.map((level) => level.article.id));
  const defaultArticles = latestArticles
    .filter(
      (article) =>
        article.active &&
        article.defaultLocationId === locationId &&
        !knownArticleIds.has(article.id),
    )
    .map((article) => ({
      id: `pending-${article.id}-${locationId}`,
      article,
      location,
      quantity: 0,
    }));
  return [...levels, ...defaultArticles].sort((a, b) =>
    a.article.code.localeCompare(b.article.code),
  );
}

function inventoryComputedLinesForLocation(locationId: string) {
  return inventoryLevelsForLocation(locationId).map(inventoryComputedLine);
}

function allInventoryComputedLines() {
  const locationIds = new Set(
    latestLocations
      .filter((location) =>
        ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE", "SITE", "CHANTIER"].includes(
          location.type.toUpperCase(),
        ),
      )
      .map((location) => location.id),
  );
  const pairMap = new Map<string, StockLevel>();
  latestStockLevels.forEach((level) => {
    if (locationIds.has(level.location.id)) {
      pairMap.set(inventoryPairKey(level.article.id, level.location.id), level);
    }
  });
  latestArticles
    .filter(
      (article) =>
        article.active &&
        article.defaultLocationId &&
        locationIds.has(article.defaultLocationId),
    )
    .forEach((article) => {
      const location = latestLocations.find(
        (item) => item.id === article.defaultLocationId,
      );
      if (!location) return;
      const key = inventoryPairKey(article.id, location.id);
      if (!pairMap.has(key)) {
        pairMap.set(key, {
          id: `pending-${article.id}-${location.id}`,
          article,
          location,
          quantity: 0,
        });
      }
    });
  return [...pairMap.values()].map(inventoryComputedLine);
}

function inventoryLocationsPreview(articleLines: InventoryComputedLine[]) {
  const relevant = articleLines
    .filter((line) => line.theoretical > 0 || line.countedAt)
    .sort((a, b) => {
      if (a.gap !== 0 && b.gap === 0) return -1;
      if (a.gap === 0 && b.gap !== 0) return 1;
      return a.location.name.localeCompare(b.location.name);
    });
  if (!relevant.length) return '<span class="text-gray-400">-</span>';
  const fullTitle = relevant
    .map((line) => line.location.name + (line.gap !== 0 ? " (ecart " + formatNumber(line.gap) + ")" : ""))
    .join(", ");
  const visible = relevant.slice(0, 2);
  const hidden = relevant.length - visible.length;
  const badges = visible
    .map((line) => {
      const tone =
        line.gap !== 0
          ? "border-error-100 bg-error-50 text-error-700"
          : "border-gray-200 bg-gray-50 text-gray-700";
      return `<span class="inline-flex max-w-[110px] shrink items-center truncate rounded-full border px-2 py-1 text-xs font-semibold ${tone}" title="${escapeHtml(line.location.name)}">${escapeHtml(line.location.name)}</span>`;
    })
    .join("");
  const more =
    hidden > 0
      ? `<span class="inline-flex shrink-0 items-center rounded-full border border-accent-100 bg-accent-50 px-2 py-1 text-xs font-bold text-accent-700" title="${escapeHtml(fullTitle)}">+${formatNumber(hidden)} autre${hidden > 1 ? "s" : ""}</span>`
      : "";
  return `<div class="flex max-w-[260px] items-center gap-1 overflow-hidden" title="${escapeHtml(fullTitle)}">${badges}${more}</div>`;
}

function inventoryLinesForDrawer() {
  if (!openInventoryArticleId || !openInventoryScope) return [];
  if (openInventoryScope === "local") {
    if (!openInventoryLocationId) return [];
    return inventoryComputedLinesForLocation(openInventoryLocationId).filter(
      (line) => line.articleId === openInventoryArticleId,
    );
  }
  return allInventoryComputedLines().filter(
    (line) => line.articleId === openInventoryArticleId,
  );
}

function inventoryTotals(lines: InventoryComputedLine[]) {
  return lines.reduce(
    (sum, line) => ({
      theoretical: sum.theoretical + line.theoretical,
      counted: sum.counted + line.counted,
      good: sum.good + line.good,
      repair: sum.repair + line.repair,
      outOfService: sum.outOfService + line.outOfService,
      gap: sum.gap + line.gap,
    }),
    {
      theoretical: 0,
      counted: 0,
      good: 0,
      repair: 0,
      outOfService: 0,
      gap: 0,
    },
  );
}

function inventoryMovementLocation(movement: StockMovement) {
  return (
    latestLocations.find(
      (location) =>
        location.id === movement.toLocationId ||
        location.id === movement.fromLocationId,
    ) ?? null
  );
}

function inventoryHistoryForDrawer(
  articleId: string,
  scope: "local" | "global",
  locationId: string | null,
  dateFrom: string,
  dateTo: string,
) {
  return latestMovements
    .filter((movement) => {
      if (movement.type !== "ADJUSTMENT") return false;
      if (movement.status === "CANCELLED" || movement.status === "DRAFT")
        return false;
      if (dateFrom && movement.date < dateFrom) return false;
      if (dateTo && movement.date > dateTo + "T23:59:59") return false;
      if (!movement.lines.some((line) => line.articleId === articleId))
        return false;
      if (scope === "local") {
        return (
          movement.fromLocationId === locationId ||
          movement.toLocationId === locationId
        );
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function inventoryDrawerStatCard(
  label: string,
  value: number,
  className = "",
  unit = "",
) {
  return `
    <div class="p-3 rounded-xl bg-gray-50 border border-gray-100 ${className}">
      <div class="text-xs font-semibold text-gray-500 mb-1">${escapeHtml(label)}</div>
      <div class="font-bold text-base">${formatNumber(value)}${unit ? ` <span class="text-xs font-normal text-gray-400">${escapeHtml(unit)}</span>` : ""}</div>
    </div>
  `;
}

function renderInventoryDrawer(root: HTMLElement) {
  const drawer = root.querySelector<HTMLElement>("#stockDrawer");
  const backdrop = root.querySelector<HTMLElement>("#stockDrawerBackdrop");
  if (!drawer || !backdrop || !openInventoryArticleId || !openInventoryScope)
    return;

  const article = latestArticles.find(
    (item) => item.id === openInventoryArticleId,
  );
  const lines = inventoryLinesForDrawer();
  if (!article || !lines.length) {
    showToast(root, "Article inventaire introuvable.");
    return;
  }

  backdrop.classList.remove("hidden");
  drawer.classList.remove("translate-x-full");
  drawer.classList.add("translate-x-0");
  drawer.classList.add("stock-drawer--open");

  const titles = drawer.querySelectorAll<HTMLElement>("h2");
  if (titles[0])
    titles[0].innerHTML =
      '<i data-lucide="info" class="w-4 h-4 text-accent-600"></i>Informations article';
  if (titles[1])
    titles[1].innerHTML =
      '<i data-lucide="history" class="w-4 h-4 text-accent-600"></i>Historique des mouvements';
  drawer
    .querySelector<HTMLElement>("#stockDrawerHistory")
    ?.previousElementSibling?.classList.remove("hidden");

  const totals = inventoryTotals(lines);
  const header = drawer.querySelector<HTMLElement>("#stockDrawerHeader");
  if (header) {
    const locationLabel =
      openInventoryScope === "local"
        ? lines[0]?.location.name ?? "Emplacement"
        : "Synthese globale inventaire";
    header.innerHTML = `
      <div class="min-w-0 flex-1">
        <div class="font-bold text-lg truncate">${escapeHtml(article.designation)}</div>
        <div class="text-sm text-gray-500">${escapeHtml(article.code)} &bull; ${escapeHtml(locationLabel)}</div>
      </div>
    `;
  }

  const infoEl = drawer.querySelector<HTMLElement>("#stockDrawerInfo");
  if (infoEl) {
    const gapClass =
      totals.gap !== 0
        ? "bg-error-50 border-error-100 text-error-700"
        : "bg-success-50 border-success-100 text-success-700";
    const locationsBlock =
      openInventoryScope === "global"
        ? `<div class="col-span-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div class="text-xs font-semibold text-gray-500 mb-2">Emplacements concernes</div>
            ${inventoryLocationsPreview(lines)}
          </div>`
        : "";
    infoEl.innerHTML = `
      <div class="grid grid-cols-2 gap-3 text-sm">
        ${inventoryDrawerStatCard("Stock theorique", totals.theoretical, "", article.unit)}
        ${inventoryDrawerStatCard("Quantite constatee", totals.counted, "", article.unit)}
        ${inventoryDrawerStatCard("Bon etat", totals.good, "text-success-700", article.unit)}
        ${inventoryDrawerStatCard("A reparer", totals.repair, "text-warning-700", article.unit)}
        ${inventoryDrawerStatCard("Hors service", totals.outOfService, "text-error-700", article.unit)}
        ${inventoryDrawerStatCard("Ecart", totals.gap, gapClass, article.unit)}
        ${locationsBlock}
      </div>
    `;
  }

  const histEl = drawer.querySelector<HTMLElement>("#stockDrawerHistory");
  if (histEl) {
    const dateFrom =
      drawer.querySelector<HTMLInputElement>("#stockDrawerDateFrom")?.value ??
      "";
    const dateTo =
      drawer.querySelector<HTMLInputElement>("#stockDrawerDateTo")?.value ?? "";
    const movements = inventoryHistoryForDrawer(
      article.id,
      openInventoryScope,
      openInventoryLocationId,
      dateFrom,
      dateTo,
    );
    if (!movements.length) {
      histEl.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Aucun historique inventaire pour cet article.</p>`;
    } else {
      histEl.innerHTML = movements
        .map((movement) => {
          const line = movement.lines.find((item) => item.articleId === article.id);
          const breakdown = inventoryBreakdownFromObservation(line?.observation);
          const theoretical = Number(line?.expectedQuantity ?? 0);
          const counted = Number(
            line?.completedQuantity ??
              (breakdown.structured ? breakdown.counted : 0),
          );
          const good = breakdown.structured ? breakdown.good : counted;
          const repair = breakdown.structured ? breakdown.repair : 0;
          const outOfService = breakdown.structured
            ? breakdown.outOfService
            : 0;
          const gap = counted - theoretical;
          const location = inventoryMovementLocation(movement);
          const locationName = location?.name ?? "-";
          const note = breakdown.justification || line?.observation || movement.notes || "-";
          return `
            <div class="py-3 border-b border-gray-100 last:border-0">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    ${movementTypeBadge("ADJUSTMENT")}
                    <span class="text-xs text-gray-500">${escapeHtml(formatDate(movement.date))}</span>
                  </div>
                  <div class="mt-1 text-sm font-bold truncate">${escapeHtml(movement.reference)}</div>
                  <div class="text-xs text-gray-500 truncate">${escapeHtml(locationName)}</div>
                </div>
                <div class="text-right text-sm font-bold ${gap !== 0 ? "text-error-700" : "text-success-700"}">${gap === 0 ? "-" : formatNumber(gap)}</div>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div class="rounded-lg bg-gray-50 px-2 py-1"><span class="text-gray-500">Theorique</span><span class="float-right font-bold">${formatNumber(theoretical)}</span></div>
                <div class="rounded-lg bg-gray-50 px-2 py-1"><span class="text-gray-500">Constatee</span><span class="float-right font-bold">${formatNumber(counted)}</span></div>
                <div class="rounded-lg bg-success-50 px-2 py-1 text-success-700"><span>Bon etat</span><span class="float-right font-bold">${formatNumber(good)}</span></div>
                <div class="rounded-lg bg-warning-50 px-2 py-1 text-warning-700"><span>A reparer</span><span class="float-right font-bold">${formatNumber(repair)}</span></div>
                <div class="rounded-lg bg-error-50 px-2 py-1 text-error-700"><span>Hors service</span><span class="float-right font-bold">${formatNumber(outOfService)}</span></div>
              </div>
              <div class="mt-2 text-xs text-gray-500">${escapeHtml(note)}</div>
            </div>
          `;
        })
        .join("");
    }
  }

  window.lucide?.createIcons();
}

function renderInventoryGlobal(root: HTMLElement) {
  const lines = allInventoryComputedLines();
  const countedLines = lines.filter((line) => line.countedAt);
  const countedLocationIds = new Set(countedLines.map((line) => line.locationId));
  const gapLines = countedLines.filter((line) => line.gap !== 0);
  const validLocationIds = new Set(
    [...countedLocationIds].filter((locationId) => {
      const locationLines = lines.filter((line) => line.locationId === locationId);
      return (
        locationLines.length > 0 &&
        locationLines.every((line) => line.countedAt && line.gap === 0)
      );
    }),
  );

  setText(root, "#inventoryGlobalLocations", countedLocationIds.size);
  setText(
    root,
    "#inventoryGlobalArticles",
    new Set(countedLines.map((line) => line.articleId)).size,
  );
  setText(root, "#inventoryGlobalGaps", gapLines.length);
  setText(root, "#inventoryGlobalValid", validLocationIds.size);
  setText(
    root,
    "#inventoryGlobalValidHint",
    "Sur " + formatNumber(new Set(lines.map((line) => line.locationId)).size) + " emplacements",
  );

  const byArticle = new Map<string, InventoryComputedLine[]>();
  lines.forEach((line) => {
    byArticle.set(line.articleId, [...(byArticle.get(line.articleId) ?? []), line]);
  });
  const articleRows = [...byArticle.values()]
    .map((articleLines) => {
      const first = articleLines[0];
      const totals = articleLines.reduce(
        (sum, line) => ({
          theoretical: sum.theoretical + line.theoretical,
          counted: sum.counted + line.counted,
          good: sum.good + line.good,
          repair: sum.repair + line.repair,
          outOfService: sum.outOfService + line.outOfService,
          gap: sum.gap + line.gap,
        }),
        {
          theoretical: 0,
          counted: 0,
          good: 0,
          repair: 0,
          outOfService: 0,
          gap: 0,
        },
      );
      const counted = articleLines.some((line) => line.countedAt);
      const status = !counted
        ? { label: "A compter", tone: "gray" as const }
        : totals.gap === 0
          ? { label: "Valide", tone: "success" as const }
          : { label: "Ecart a justifier", tone: "warning" as const };
      return `<tr class="cursor-pointer hover:bg-gray-50 transition-colors ${totals.gap !== 0 ? "bg-error-50/40" : ""}" data-action="openInventoryGlobalDetail('${escapeHtml(first.article.id)}')">
        <td class="px-5 py-4"><div class="font-bold">${escapeHtml(first.article.designation)}</div><div class="text-xs text-gray-500">${escapeHtml(first.article.code)}</div></td>
        <td class="px-5 py-4 text-right">${formatNumber(totals.theoretical)}</td>
        <td class="px-5 py-4 text-right font-bold">${formatNumber(totals.counted)}</td>
        <td class="px-5 py-4 text-right text-success-700 font-bold">${formatNumber(totals.good)}</td>
        <td class="px-5 py-4 text-right text-warning-700 font-bold">${formatNumber(totals.repair)}</td>
        <td class="px-5 py-4 text-right text-error-700 font-bold">${formatNumber(totals.outOfService)}</td>
        <td class="px-5 py-4 text-center font-bold ${totals.gap !== 0 ? "text-error-700" : ""}">${totals.gap === 0 ? "-" : formatNumber(totals.gap)}</td>
        <td class="px-5 py-4">${inventoryLocationsPreview(articleLines)}</td>
        <td class="px-5 py-4">${badge(status.label, status.tone)}</td>
      </tr>`;
    })
    .sort((a, b) => a.localeCompare(b));
  const globalBody = root.querySelector<HTMLElement>("#inventoryGlobalTable tbody");
  if (globalBody) {
    globalBody.innerHTML = articleRows.length
      ? articleRows.join("")
      : emptyRow(9, "Aucune synthese inventaire pour le moment.");
  }

}

function renderInventory(root: HTMLElement) {
  const select = root.querySelector<HTMLSelectElement>(
    "#inventoryLocationSelect",
  );
  const stockLocations = latestLocations.filter((location) =>
    ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE", "SITE", "CHANTIER"].includes(
      location.type.toUpperCase(),
    ),
  );
  if (select) {
    const previous = select.value;
    fillSelect(
      select,
      locationOptions(stockLocations),
      stockLocations.length
        ? "Selectionner un emplacement"
        : "Aucun emplacement en base",
    );
    if (
      previous &&
      stockLocations.some((location) => location.id === previous)
    ) {
      select.value = previous;
    } else {
      const firstWithStock = latestStockLevels.find((level) =>
        stockLocations.some((location) => location.id === level.location.id),
      );
      const firstWithDefaultArticle = latestArticles.find(
        (article) =>
          article.defaultLocationId &&
          stockLocations.some(
            (location) => location.id === article.defaultLocationId,
          ),
      );
      select.value =
        firstWithStock?.location.id ??
        firstWithDefaultArticle?.defaultLocationId ??
        stockLocations[0]?.id ??
        "";
    }
  }
  const selectedLocationId = select?.value ?? "";
  const search = articleImportKey(
    root.querySelector<HTMLInputElement>("#inventorySearchInput")?.value ?? "",
  );
  const hideValidated = Boolean(
    root.querySelector<HTMLInputElement>("#inventoryHideValidated")?.checked,
  );
  const allLines = selectedLocationId
    ? inventoryComputedLinesForLocation(selectedLocationId)
    : [];
  const levels = allLines.filter((line) => {
    const text = articleImportKey(
      `${line.article.code} ${line.article.designation} ${line.article.category}`,
    );
    if (search && !text.includes(search)) return false;
    if (hideValidated && inventoryLineIsValidated(line)) return false;
    return true;
  });
  const inventoryBody = root.querySelector<HTMLElement>(
    "#inventoryTable tbody",
  );
  if (inventoryBody) {
    inventoryBody.innerHTML = levels.length
      ? levels.map(inventoryRow).join("")
      : emptyRow(
          10,
          selectedLocationId && allLines.length && (search || hideValidated)
            ? "Aucune ligne ne correspond aux filtres."
            : selectedLocationId
            ? "Aucun article ou stock theorique pour cet emplacement."
            : "Selectionne un emplacement pour lancer l'inventaire.",
        );
  }
  const today = new Date().toISOString().slice(0, 10);
  setText(root, "#inventoryDate", selectedLocationId ? formatDate(today) : "-");
  setText(
    root,
    "#inventoryResponsible",
    currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "-",
  );
  const countElement = root.querySelector<HTMLElement>(
    "#inventoryLocationCount",
  );
  if (countElement)
    countElement.innerHTML = `${formatNumber(allLines.length)} <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">${formatNumber(allLines.filter((line) => line.countedAt).length)} saisi</span>`;
  renderInventoryGlobal(root);
  window.lucide?.createIcons();
}
function showInventoryMode(root: HTMLElement, mode: string) {
  const local = root.querySelector<HTMLElement>("#inventoryLocalPanel");
  const global = root.querySelector<HTMLElement>("#inventoryGlobalPanel");
  const localTab = root.querySelector<HTMLElement>("#inventoryLocalTab");
  const globalTab = root.querySelector<HTMLElement>("#inventoryGlobalTab");
  const isGlobal = mode === "global";
  local?.classList.toggle("hidden", isGlobal);
  global?.classList.toggle("hidden", !isGlobal);
  localTab?.classList.toggle("bg-white", !isGlobal);
  localTab?.classList.toggle("shadow-sm", !isGlobal);
  localTab?.classList.toggle("text-gray-500", isGlobal);
  globalTab?.classList.toggle("bg-white", isGlobal);
  globalTab?.classList.toggle("shadow-sm", isGlobal);
  globalTab?.classList.toggle("text-gray-500", !isGlobal);
  if (isGlobal) renderInventoryGlobal(root);
}

function inventoryExportSearch(root?: HTMLElement) {
  return articleImportKey(
    root?.querySelector<HTMLInputElement>("#inventorySearchInput")?.value ?? "",
  );
}

function inventoryLineMatchesExportSearch(
  line: InventoryComputedLine,
  search: string,
) {
  if (!search) return true;
  return articleImportKey(
    `${line.article.code} ${line.article.designation} ${line.article.category}`,
  ).includes(search);
}

function inventoryGlobalExportRows(root?: HTMLElement) {
  const search = inventoryExportSearch(root);
  const byArticle = new Map<string, InventoryComputedLine[]>();
  allInventoryComputedLines()
    .filter((line) => inventoryLineMatchesExportSearch(line, search))
    .forEach((line) => {
      byArticle.set(line.articleId, [...(byArticle.get(line.articleId) ?? []), line]);
    });
  return [...byArticle.values()]
    .map((articleLines) => {
      const first = articleLines[0];
      const totals = articleLines.reduce(
        (sum, line) => ({
          theoretical: sum.theoretical + line.theoretical,
          counted: sum.counted + line.counted,
          good: sum.good + line.good,
          repair: sum.repair + line.repair,
          outOfService: sum.outOfService + line.outOfService,
          gap: sum.gap + line.gap,
        }),
        {
          theoretical: 0,
          counted: 0,
          good: 0,
          repair: 0,
          outOfService: 0,
          gap: 0,
        },
      );
      const counted = articleLines.some((line) => line.countedAt);
      return {
        article: first.article.designation,
        code: first.article.code,
        theoretical: totals.theoretical,
        counted: totals.counted,
        good: totals.good,
        repair: totals.repair,
        outOfService: totals.outOfService,
        gap: totals.gap,
        locations: articleLines.map((line) => line.location.name).join(", "),
        status: !counted ? "A compter" : totals.gap === 0 ? "Valide" : "Ecart a justifier",
      };
    })
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));
}

function selectedInventoryExportLocationId(root: HTMLElement) {
  return (
    root.querySelector<HTMLSelectElement>("#inventoryExportLocationSelect")
      ?.value ||
    root.querySelector<HTMLSelectElement>("#inventoryLocationSelect")?.value ||
    ""
  );
}

function inventoryLocationExportRows(root: HTMLElement) {
  const locationId = selectedInventoryExportLocationId(root);
  if (!locationId) return [];
  const search = inventoryExportSearch(root);
  const hideValidated = Boolean(
    root.querySelector<HTMLInputElement>("#inventoryHideValidated")?.checked,
  );
  return inventoryComputedLinesForLocation(locationId)
    .filter((line) => {
      if (!inventoryLineMatchesExportSearch(line, search)) return false;
      if (hideValidated && inventoryLineIsValidated(line)) return false;
      return true;
    })
    .sort((a, b) => a.article.code.localeCompare(b.article.code))
    .map((line) => ({
      article: line.article.designation,
      code: line.article.code,
      location: line.location.name,
      theoretical: line.theoretical,
      counted: line.counted,
      good: line.good,
      repair: line.repair,
      outOfService: line.outOfService,
      gap: line.gap,
      justification: line.justification,
      status: inventoryLineStatus(line).label,
    }));
}

function inventoryExportDataset(root: HTMLElement, scope: InventoryExportScope): {
  filenameKind: string;
  sheetName: string;
  title: string;
  columns: ExcelExportColumn[];
  rows: ExcelExportRow[];
} {
  if (scope === "global") {
    return {
      filenameKind: "inventaire-global",
      sheetName: "Inventaire global",
      title: "Synthese globale inventaire",
      columns: [
        { key: "article", header: "Article" },
        { key: "code", header: "Code" },
        { key: "theoretical", header: "Stock theorique global", type: "number" },
        { key: "counted", header: "Quantite constatee", type: "number" },
        { key: "good", header: "Bon etat", type: "number" },
        { key: "repair", header: "A reparer", type: "number" },
        { key: "outOfService", header: "Hors service", type: "number" },
        { key: "gap", header: "Ecart", type: "number" },
        { key: "locations", header: "Emplacements concernes" },
        { key: "status", header: "Statut" },
      ],
      rows: inventoryGlobalExportRows(root),
    };
  }
  const locationId = selectedInventoryExportLocationId(root);
  if (!locationId) {
    throw new Error("Selectionne l'emplacement a exporter.");
  }
  const locationName =
    latestLocations.find((location) => location.id === locationId)?.name ??
    "Emplacement";
  return {
    filenameKind: "inventaire-par-emplacement",
    sheetName: "Inventaire emplacement",
    title: "Inventaire - " + locationName,
    columns: [
      { key: "article", header: "Article" },
      { key: "code", header: "Code" },
      { key: "location", header: "Emplacement" },
      { key: "theoretical", header: "Stock theorique emplacement", type: "number" },
      { key: "counted", header: "Quantite constatee", type: "number" },
      { key: "good", header: "Bon etat", type: "number" },
      { key: "repair", header: "A reparer", type: "number" },
      { key: "outOfService", header: "Hors service", type: "number" },
      { key: "gap", header: "Ecart", type: "number" },
      { key: "justification", header: "Justification" },
      { key: "status", header: "Statut" },
    ],
    rows: inventoryLocationExportRows(root),
  };
}

async function downloadInventoryExcel(root: HTMLElement, scope: InventoryExportScope) {
  try {
    const dataset = inventoryExportDataset(root, scope);
    const date = new Date().toISOString().slice(0, 10);
    const filename = "stock-hub-" + dataset.filenameKind + "-" + date + ".xlsx";
    await exportWorkbook({
      filename,
      sheetName: dataset.sheetName,
      columns: dataset.columns,
      rows: dataset.rows,
    });
    closeModal(root, "inventoryExportModal");
    showToast(root, "Export Excel prepare : " + filename);
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Export Excel impossible.", "error");
  }
}

function inventoryPdfHtml(dataset: ReturnType<typeof inventoryExportDataset>) {
  const totalTheoretical = dataset.rows.reduce(
    (sum, row) => sum + Number(row.theoretical ?? 0),
    0,
  );
  const totalCounted = dataset.rows.reduce(
    (sum, row) => sum + Number(row.counted ?? 0),
    0,
  );
  const totalGap = dataset.rows.reduce(
    (sum, row) => sum + Number(row.gap ?? 0),
    0,
  );
  const header = dataset.columns
    .map(
      (column) =>
        `<th class="${column.type === "number" || column.type === "currency" ? "right" : ""}">${escapeHtml(column.header)}</th>`,
    )
    .join("");
  const rows = dataset.rows
    .map(
      (row) =>
        `<tr>${dataset.columns
          .map((column) => {
            const value = row[column.key];
            const text =
              column.type === "number" || column.type === "currency"
                ? formatNumber(Number(value ?? 0))
                : excelCellText(value);
            const emphasis =
              column.key === "gap" && Number(value ?? 0) !== 0
                ? " gap"
                : "";
            return `<td class="${column.type === "number" || column.type === "currency" ? "right strong" : ""}${emphasis}">${escapeHtml(text)}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(dataset.title)}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e9edf4; color: #0f172a; font-family: Arial, Helvetica, sans-serif; font-size: 10px; }
    .toolbar { width: 287mm; margin: 10px auto 0; display: flex; justify-content: flex-end; }
    .toolbar button { border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 7px 11px; font-weight: 800; cursor: pointer; font-size: 12px; }
    .page { width: 287mm; min-height: 200mm; margin: 10px auto 18px; background: #fff; padding: 10mm; box-shadow: 0 8px 26px rgba(15, 23, 42, .12); }
    .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12mm; border-bottom: 2px solid #d8e1ec; padding-bottom: 6mm; }
    .hub-logo { width: 24mm; height: 16mm; background: #e71845; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: .86; }
    .hub-logo-main { font-size: 20pt; font-weight: 950; letter-spacing: -.07em; }
    .hub-logo-tag { margin-top: 1.5mm; font-size: 3pt; font-weight: 900; letter-spacing: .04em; }
    .title { font-size: 18px; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; }
    .meta { color: #475569; font-size: 10px; margin-top: 2mm; }
    .kpis { display: flex; gap: 4mm; margin: 6mm 0; }
    .kpi { border: 1px solid #d3dcea; padding: 3mm 5mm; min-width: 36mm; }
    .kpi .label { color: #64748b; font-size: 8px; text-transform: uppercase; font-weight: 900; }
    .kpi .value { margin-top: 1.5mm; font-size: 14px; font-weight: 950; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #3746f5; color: #fff; font-size: 8px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
    td, th { border: 1px solid #cbd5e1; padding: 2.2mm; vertical-align: middle; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    .right { text-align: right; }
    .strong { font-weight: 900; }
    .gap { color: #b91c1c; }
    @media print { body { background: white; } .toolbar { display: none; } .page { width: 297mm; min-height: 210mm; margin: 0; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer PDF</button></div>
  <main class="page">
    <header class="head">
      <div>${hubLogoMarkup()}</div>
      <div><div class="title">${escapeHtml(dataset.title)}</div><div class="meta">Export genere le ${escapeHtml(formatDate(new Date()))} - ${formatNumber(dataset.rows.length)} ligne(s)</div></div>
    </header>
    <section class="kpis">
      <div class="kpi"><div class="label">Lignes</div><div class="value">${formatNumber(dataset.rows.length)}</div></div>
      <div class="kpi"><div class="label">Stock theorique</div><div class="value">${formatNumber(totalTheoretical)}</div></div>
      <div class="kpi"><div class="label">Quantite constatee</div><div class="value">${formatNumber(totalCounted)}</div></div>
      <div class="kpi"><div class="label">Ecart total</div><div class="value">${formatNumber(totalGap)}</div></div>
    </section>
    <table><thead><tr>${header}</tr></thead><tbody>${rows || `<tr><td colspan="${dataset.columns.length}">Aucune donnee a exporter.</td></tr>`}</tbody></table>
  </main>
</body>
</html>`;
}

function downloadInventoryPdf(root: HTMLElement, scope: InventoryExportScope) {
  let dataset: ReturnType<typeof inventoryExportDataset>;
  try {
    dataset = inventoryExportDataset(root, scope);
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Export PDF impossible.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour telecharger le PDF.", "error");
    return;
  }
  popup.document.write(inventoryPdfHtml(dataset));
  popup.document.close();
  closeModal(root, "inventoryExportModal");
  popup.focus();
  popup.print();
}

function prepareInventoryExportModal(root: HTMLElement) {
  const select = root.querySelector<HTMLSelectElement>(
    "#inventoryExportLocationSelect",
  );
  if (!select) return;
  const currentFilter =
    root.querySelector<HTMLSelectElement>("#inventoryLocationSelect")?.value ?? "";
  const previous = select.value || currentFilter;
  const locationsWithInventory = latestLocations
    .filter((location) =>
      allInventoryComputedLines().some((line) => line.locationId === location.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  select.innerHTML =
    '<option value="">Selectionner un emplacement</option>' +
    locationsWithInventory
      .map((location) => option(location.id, `${location.code} - ${location.name}`))
      .join("");
  if (locationsWithInventory.some((location) => location.id === previous)) {
    select.value = previous;
  }
}

function updateCountSummary(modal: HTMLElement) {
  const theoretical = toNumber(modal.dataset.theoretical ?? "0");
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const counted = toNumber(inputs[0]?.value ?? "0");
  const good = toNumber(inputs[1]?.value ?? "0");
  const repair = toNumber(inputs[2]?.value ?? "0");
  const out = toNumber(inputs[3]?.value ?? "0");
  const gap = counted - theoretical;
  const toTreat = repair + out;
  const gapNode = modal.querySelector<HTMLElement>(
    '[data-count-summary="gap"]',
  );
  const usableNode = modal.querySelector<HTMLElement>(
    '[data-count-summary="usable"]',
  );
  const toTreatNode = modal.querySelector<HTMLElement>(
    '[data-count-summary="toTreat"]',
  );
  if (gapNode) {
    gapNode.textContent = formatNumber(gap);
    gapNode.className =
      "mt-2 h-11 rounded-lg border px-3 flex items-center font-bold " +
      (gap === 0
        ? "border-success-100 bg-success-50 text-success-700"
        : gap < 0
          ? "border-error-100 bg-error-50 text-error-700"
          : "border-warning-100 bg-warning-50 text-warning-700");
  }
  if (usableNode) usableNode.textContent = formatNumber(good);
  if (toTreatNode) {
    toTreatNode.textContent = formatNumber(toTreat);
    toTreatNode.className =
      "mt-2 h-11 rounded-lg border px-3 flex items-center font-bold " +
      (toTreat > 0
        ? "border-warning-100 bg-warning-50 text-warning-700"
        : "border-gray-200 bg-gray-50 text-gray-700");
  }
}

async function populateCountModal(
  root: HTMLElement,
  articleId: string,
  locationId: string,
) {
  const modal = root.querySelector<HTMLElement>("#countModal");
  if (!modal) return;
  latestStockLevels = await getStockLevels().catch(() => latestStockLevels);
  const location = latestLocations.find((item) => item.id === locationId);
  const level = latestStockLevels.find(
    (item) => item.article.id === articleId && item.location.id === locationId,
  );
  const article =
    level?.article ?? latestArticles.find((item) => item.id === articleId);
  if (!article || !location) {
    showToast(root, "Impossible de charger la ligne d'inventaire.", "error");
    return;
  }
  const computed = inventoryComputedLine(
    level ?? {
      id: `pending-${articleId}-${locationId}`,
      article,
      location,
      quantity: 0,
    },
  );
  const theoretical = computed.theoretical;
  modal.dataset.articleId = articleId;
  modal.dataset.locationId = locationId;
  modal.dataset.theoretical = String(theoretical);
  const cards = Array.from(modal.querySelectorAll<HTMLElement>(".grid .p-4"));
  if (cards[0])
    cards[0].innerHTML = `<div class="text-xs font-semibold text-gray-500">Article</div><div class="font-bold mt-1">${escapeHtml(article.designation)}</div><div class="text-xs text-gray-500 mt-1">${escapeHtml(article.code)}</div>`;
  if (cards[1])
    cards[1].innerHTML = `<div class="text-xs font-semibold text-gray-500">Emplacement</div><div class="font-bold mt-1">${escapeHtml(location.name)}</div>`;
  if (cards[2])
    cards[2].innerHTML = `<div class="text-xs font-semibold text-accent-600">Stock theorique</div><div class="font-bold text-2xl mt-1">${formatNumber(theoretical)}</div>`;
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  if (inputs[0]) inputs[0].value = String(computed.counted);
  if (inputs[1]) inputs[1].value = String(computed.good);
  if (inputs[2]) inputs[2].value = String(computed.repair);
  if (inputs[3]) inputs[3].value = String(computed.outOfService);
  inputs.slice(0, 4).forEach((input) => {
    input.type = "number";
    input.min = "0";
    input.oninput = () => updateCountSummary(modal);
  });
  const textarea = modal.querySelector<HTMLTextAreaElement>("textarea");
  if (textarea) textarea.value = computed.justification;
  updateCountSummary(modal);
}

async function submitInventoryCount(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#countModal");
  if (!modal) return;
  const articleId = modal.dataset.articleId;
  const locationId = modal.dataset.locationId;
  const theoretical = toNumber(modal.dataset.theoretical ?? "0");
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const textarea = modal.querySelector<HTMLTextAreaElement>("textarea");
  const counted = toNumber(inputs[0]?.value ?? "0");
  const good = toNumber(inputs[1]?.value ?? "0");
  const repair = toNumber(inputs[2]?.value ?? "0");
  const out = toNumber(inputs[3]?.value ?? "0");
  const reason = selectedText(selects[0]) || "Comptage inventaire";
  const details = textarea?.value.trim();
  if (!articleId || !locationId) {
    showToast(root, "Aucune ligne d'inventaire selectionnee.", "error");
    return;
  }
  if (Math.abs(counted - (good + repair + out)) > 0.000001) {
    showToast(
      root,
      "La quantite constatee doit etre egale a bon etat + a reparer + hors service.",
      "error",
    );
    return;
  }
  if (counted !== theoretical && !details) {
    showToast(
      root,
      "Justifie l'ecart avant d'enregistrer le comptage.",
      "error",
    );
    return;
  }
  try {
    await createInventoryAdjustment({
      reference: "INV-" + Date.now(),
      date: new Date().toISOString(),
      locationId,
      notes: details,
      lines: [
        {
          articleId,
          expectedQuantity: theoretical,
          completedQuantity: counted,
          goodQuantity: good,
          repairQuantity: repair,
          outOfServiceQuantity: out,
          observation: reason + (details ? " - " + details : ""),
        },
      ],
    });
    closeModal(root, "countModal");
    updateApiBackedViews(root);
    showToast(root, "Comptage inventaire enregistre et stock ajuste.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Comptage impossible.",
      "error",
    );
  }
}

const inventoryImportFields: Array<[keyof InventoryImportRow, string]> = [
  ["articleCode", "Code article"],
  ["designation", "Designation"],
  ["location", "Emplacement"],
  ["theoretical", "Stock theorique"],
  ["counted", "Quantite constatee"],
  ["good", "Bon etat"],
  ["repair", "A reparer"],
  ["outOfService", "Hors service"],
  ["justification", "Justification"],
];

function findInventoryImportArticle(row: InventoryImportRow) {
  return latestArticles.find(
    (article) =>
      articleImportKey(article.code) === articleImportKey(row.articleCode) ||
      (row.designation.trim() &&
        articleImportKey(article.designation) === articleImportKey(row.designation)),
  );
}

function findInventoryImportLocation(row: InventoryImportRow) {
  return latestLocations.find(
    (location) =>
      articleImportKey(location.code) === articleImportKey(row.location) ||
      articleImportKey(location.name) === articleImportKey(row.location) ||
      location.id === row.location,
  );
}

function validateInventoryImportRow(row: InventoryImportRow, index: number) {
  const errors: string[] = [];
  const article = findInventoryImportArticle(row);
  const location = findInventoryImportLocation(row);
  if (!row.articleCode.trim() && !row.designation.trim())
    errors.push("Article obligatoire");
  if (!article) errors.push("Article introuvable");
  if (!row.location.trim()) errors.push("Emplacement obligatoire");
  if (!location) errors.push("Emplacement introuvable");
  (["theoretical", "counted", "good", "repair", "outOfService"] as const).forEach(
    (field) => {
      const value = articleImportNumber(row[field]);
      if (!Number.isFinite(value) || value < 0) {
        errors.push(inventoryImportFields.find(([name]) => name === field)?.[1] + " invalide");
      }
    },
  );
  const counted = articleImportNumber(row.counted);
  const good = articleImportNumber(row.good);
  const repair = articleImportNumber(row.repair);
  const outOfService = articleImportNumber(row.outOfService);
  if (
    [counted, good, repair, outOfService].every(Number.isFinite) &&
    Math.abs(counted - (good + repair + outOfService)) > 0.000001
  ) {
    errors.push("Somme des etats differente du constate");
  }
  if (
    Number.isFinite(counted) &&
    Number.isFinite(articleImportNumber(row.theoretical)) &&
    counted !== articleImportNumber(row.theoretical) &&
    !row.justification.trim()
  ) {
    errors.push("Justification obligatoire si ecart");
  }
  if (article && location) {
    const key = inventoryPairKey(article.id, location.id);
    const duplicateCount = inventoryImportRows.filter((other) => {
      const otherArticle = findInventoryImportArticle(other);
      const otherLocation = findInventoryImportLocation(other);
      return (
        otherArticle &&
        otherLocation &&
        inventoryPairKey(otherArticle.id, otherLocation.id) === key
      );
    }).length;
    if (Number.isFinite(index) && duplicateCount > 1)
      errors.push("Article/emplacement en doublon");
  }
  return errors;
}

function renderInventoryImport(root: HTMLElement) {
  const table = root.querySelector<HTMLElement>("#inventoryImportTable");
  const summary = root.querySelector<HTMLElement>("#inventoryImportSummary");
  const save = root.querySelector<HTMLButtonElement>(
    "#inventoryImportSaveButton",
  );
  if (!table || !summary) return;
  inventoryImportRows.forEach(
    (row, index) => (row.errors = validateInventoryImportRow(row, index)),
  );
  const valid = inventoryImportRows.filter((row) => !row.errors.length).length;
  summary.classList.remove("hidden");
  summary.classList.add("grid");
  summary.innerHTML =
    detailCard("Total lignes", inventoryImportRows.length) +
    detailCard("Lignes valides", valid, "success") +
    detailCard("Lignes invalides", inventoryImportRows.length - valid, "gray") +
    detailCard("A enregistrer", valid, "accent");
  table.classList.remove("hidden");
  table.innerHTML = `<div class="overflow-auto border rounded-xl"><table class="w-full min-w-[1180px] text-sm"><thead class="bg-gray-50"><tr><th class="p-3 text-left">Ligne</th>${inventoryImportFields.map(([, label]) => `<th class="p-3 text-left">${label}</th>`).join("")}<th class="p-3 text-left">Validation</th></tr></thead><tbody class="divide-y">${inventoryImportRows.map((row, index) => `<tr class="${row.errors.length ? "bg-error-50/40" : "bg-success-50/20"}"><td class="p-2 font-bold">${index + 2}</td>${inventoryImportFields.map(([field]) => `<td class="p-2"><input data-inventory-import-row="${index}" data-inventory-import-field="${field}" value="${escapeHtml(String(row[field] ?? ""))}" class="w-32 h-9 border rounded px-2 bg-white"></td>`).join("")}<td class="p-2 font-semibold ${row.errors.length ? "text-error-700" : "text-success-700"}">${row.errors.length ? escapeHtml(row.errors.join(" | ")) : "Valide"}</td></tr>`).join("")}</tbody></table></div>`;
  if (save) {
    save.disabled = valid === 0;
    save.classList.toggle("opacity-50", !valid);
    save.classList.toggle("cursor-not-allowed", !valid);
  }
  window.lucide?.createIcons();
}

async function downloadInventoryImportTemplate(root: HTMLElement) {
  const lines = allInventoryComputedLines();
  try {
    await exportWorkbook({
      filename: "modele-inventaire-stock-hub.xlsx",
      sheetName: "Inventaire",
      columns: inventoryImportFields.map(([field, label]) => ({
        key: field,
        header: label,
        type: ["theoretical", "counted", "good", "repair", "outOfService"].includes(field)
          ? "number"
          : "text",
      })),
      rows: lines.map((line) => ({
        articleCode: line.article.code,
        designation: line.article.designation,
        location: line.location.code || line.location.name,
        theoretical: line.theoretical,
        counted: line.counted,
        good: line.good,
        repair: line.repair,
        outOfService: line.outOfService,
        justification: line.justification,
      })),
    });
    showToast(root, "Modele inventaire telecharge.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Telechargement impossible.",
      "error",
    );
  }
}

async function readInventoryImportFile(root: HTMLElement, file: File) {
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
    const aliases: Record<string, keyof InventoryImportRow> = {
      codearticle: "articleCode",
      code: "articleCode",
      designation: "designation",
      article: "designation",
      emplacement: "location",
      location: "location",
      stocktheorique: "theoretical",
      stocktheoriqueemplacement: "theoretical",
      quantiteconstatee: "counted",
      constate: "counted",
      bonetat: "good",
      areparer: "repair",
      horsservice: "outOfService",
      justification: "justification",
      observation: "justification",
    };
    inventoryImportRows = records.map((record) => {
      const row: InventoryImportRow = {
        articleCode: "",
        designation: "",
        location: "",
        theoretical: "",
        counted: "",
        good: "",
        repair: "",
        outOfService: "",
        justification: "",
        errors: [],
      };
      Object.entries(record).forEach(([key, value]) => {
        const field =
          aliases[articleImportHeaderKey(key)] ?? aliases[articleImportKey(key)];
        if (field && field !== "errors") {
          row[field] = String(value ?? "").trim();
        }
      });
      return row;
    });
    if (!inventoryImportRows.length)
      throw new Error("Le fichier ne contient aucune ligne.");
    renderInventoryImport(root);
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Lecture du fichier impossible.",
      "error",
    );
  }
}

async function importInventoryRows(root: HTMLElement) {
  inventoryImportRows.forEach(
    (row, index) => (row.errors = validateInventoryImportRow(row, index)),
  );
  const rows = inventoryImportRows.filter((row) => !row.errors.length);
  if (!rows.length) {
    renderInventoryImport(root);
    showToast(root, "Aucune ligne valide a enregistrer.", "error");
    return;
  }
  const grouped = new Map<
    string,
    Array<{
      articleId: string;
      expectedQuantity: number;
      completedQuantity: number;
      goodQuantity: number;
      repairQuantity: number;
      outOfServiceQuantity: number;
      observation?: string;
    }>
  >();
  rows.forEach((row) => {
    const article = findInventoryImportArticle(row);
    const location = findInventoryImportLocation(row);
    if (!article || !location) return;
    grouped.set(location.id, [
      ...(grouped.get(location.id) ?? []),
      {
        articleId: article.id,
        expectedQuantity: articleImportNumber(row.theoretical),
        completedQuantity: articleImportNumber(row.counted),
        goodQuantity: articleImportNumber(row.good),
        repairQuantity: articleImportNumber(row.repair),
        outOfServiceQuantity: articleImportNumber(row.outOfService),
        observation: row.justification.trim() || undefined,
      },
    ]);
  });
  try {
    let index = 0;
    for (const [locationId, lines] of grouped.entries()) {
      index += 1;
      await createInventoryAdjustment({
        reference: "INV-" + Date.now() + "-" + index,
        date: new Date().toISOString(),
        locationId,
        handledBy: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
          : undefined,
        notes: "Import Excel inventaire",
        lines,
      });
    }
    closeModal(root, "inventoryImportModal");
    inventoryImportRows = [];
    const [movements, stockLevels] = await Promise.all([
      getStockMovements(),
      getStockLevels().catch(() => latestStockLevels),
    ]);
    latestMovements = movements;
    latestStockLevels = stockLevels;
    updateApiBackedViews(root);
    renderInventory(root);
    showToast(root, `${rows.length} ligne(s) d'inventaire importee(s).`);
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Import inventaire impossible.",
      "error",
    );
  }
}

export function clearInventoryDrawerStatePage() {
  openInventoryArticleId = null;
  openInventoryLocationId = null;
  openInventoryScope = null;
}

export function hasOpenInventoryDrawerPage() {
  return Boolean(openInventoryScope);
}

export function renderInventoryPage(root: HTMLElement, context: InventaireStockContext) {
  bind(context);
  return renderInventory(root);
}

export function showInventoryModePage(root: HTMLElement, mode: string, context: InventaireStockContext) {
  bind(context);
  return showInventoryMode(root, mode);
}

export function openInventoryDetailPage(root: HTMLElement, articleId: string, locationId: string, context: InventaireStockContext) {
  bind(context);
  return openInventoryDetail(root, articleId, locationId);
}

export function openInventoryGlobalDetailPage(root: HTMLElement, articleId: string, context: InventaireStockContext) {
  bind(context);
  return openInventoryGlobalDetail(root, articleId);
}

export function renderInventoryDrawerPage(root: HTMLElement, context: InventaireStockContext) {
  bind(context);
  return renderInventoryDrawer(root);
}

export function inventoryComputedLinesForLocationPage(locationId: string, context: InventaireStockContext) {
  bind(context);
  return inventoryComputedLinesForLocation(locationId);
}

export function allInventoryComputedLinesPage(context: InventaireStockContext) {
  bind(context);
  return allInventoryComputedLines();
}

export function inventoryGlobalExportRowsPage(root: HTMLElement | undefined, context: InventaireStockContext) {
  bind(context);
  return inventoryGlobalExportRows(root);
}

export function prepareInventoryExportModalPage(root: HTMLElement, context: InventaireStockContext) {
  bind(context);
  return prepareInventoryExportModal(root);
}

export function downloadInventoryExcelPage(root: HTMLElement, scope: InventoryExportScope, context: InventaireStockContext) {
  bind(context);
  return downloadInventoryExcel(root, scope);
}

export function downloadInventoryPdfPage(root: HTMLElement, scope: InventoryExportScope, context: InventaireStockContext) {
  bind(context);
  return downloadInventoryPdf(root, scope);
}

export function openInventoryCountPage(root: HTMLElement, articleId: string, locationId: string, context: InventaireStockContext) {
  bind(context);
  return populateCountModal(root, articleId, locationId);
}

export function submitInventoryCountPage(root: HTMLElement, context: InventaireStockContext) {
  bind(context);
  return submitInventoryCount(root);
}

export function downloadInventoryImportTemplatePage(root: HTMLElement, context: InventaireStockContext) {
  bind(context);
  return downloadInventoryImportTemplate(root);
}

export function readInventoryImportFilePage(root: HTMLElement, file: File, context: InventaireStockContext) {
  bind(context);
  return readInventoryImportFile(root, file);
}

export function importInventoryRowsPage(root: HTMLElement, context: InventaireStockContext) {
  bind(context);
  return importInventoryRows(root);
}

export function resetInventoryImportPage(root: HTMLElement, context: InventaireStockContext) {
  bind(context);
  inventoryImportRows = [];
  const file = root.querySelector<HTMLInputElement>("#inventoryImportFile");
  if (file) file.value = "";
  root.querySelector<HTMLElement>("#inventoryImportSummary")?.classList.add("hidden");
  root.querySelector<HTMLElement>("#inventoryImportTable")?.classList.add("hidden");
  const save = root.querySelector<HTMLButtonElement>("#inventoryImportSaveButton");
  if (save) {
    save.disabled = true;
    save.classList.add("opacity-50", "cursor-not-allowed");
  }
}

export function updateInventoryImportCellPage(
  root: HTMLElement,
  rowIndex: number,
  field: string | undefined,
  value: string,
  context: InventaireStockContext,
) {
  bind(context);
  const row = inventoryImportRows[rowIndex];
  if (!row || !field || field === "errors") return;
  (row as unknown as Record<string, string>)[field] = value;
  renderInventoryImport(root);
}
