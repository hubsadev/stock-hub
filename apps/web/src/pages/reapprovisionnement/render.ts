import type { StockLevel } from "../../api";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type ReapprovisionnementContext = {
  latestStockLevels: StockLevel[];
  badge: (label: string, tone?: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  setText: (
    root: HTMLElement,
    selector: string,
    value: number | string,
  ) => void;
  formatNumber: (value: number | string | null | undefined) => string;
  escapeHtml: (value: unknown) => string;
  renderDashboardWatchStock: (
    root: HTMLElement,
    levels: StockLevel[],
  ) => void;
};

let latestStockLevels: StockLevel[] = [];
let activeCtx: ReapprovisionnementContext | null = null;

function syncFrom(ctx: ReapprovisionnementContext) {
  activeCtx = ctx;
  latestStockLevels = ctx.latestStockLevels;
}

function withContext<T>(ctx: ReapprovisionnementContext, callback: () => T): T {
  syncFrom(ctx);
  return callback();
}

function requireCtx() {
  if (!activeCtx)
    throw new Error("Reapprovisionnement context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone?: BadgeTone) {
  return requireCtx().badge(label, tone);
}

function emptyRow(colspan: number, message: string) {
  return requireCtx().emptyRow(colspan, message);
}

function setText(
  root: HTMLElement,
  selector: string,
  value: number | string,
) {
  return requireCtx().setText(root, selector, value);
}

function formatNumber(value: number | string | null | undefined) {
  return requireCtx().formatNumber(value);
}

function escapeHtml(value: unknown) {
  return requireCtx().escapeHtml(value);
}

function renderDashboardWatchStock(root: HTMLElement, levels: StockLevel[]) {
  return requireCtx().renderDashboardWatchStock(root, levels);
}

function reapproLevels() {
  return latestStockLevels.filter(
    (level) =>
      level.article.minimumStock > 0 &&
      level.quantity <= level.article.minimumStock,
  );
}

function reorderQuantity(level: StockLevel) {
  const target = level.article.minimumStock * 2;
  return Math.max(target - level.quantity, 0);
}

function reapproRow(level: StockLevel) {
  const rupture = level.quantity <= 0;
  const quantityClass = rupture ? "text-error-700" : "text-warning-700";
  const reorder = reorderQuantity(level);
  const value = reorder * Number(level.article.referencePrice ?? 0);
  return (
    "<tr>" +
    '<td class="px-5 py-4"><div class="font-bold">' +
    escapeHtml(level.article.designation) +
    '</div><div class="text-xs text-gray-500">' +
    escapeHtml(level.article.code) +
    "</div></td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(level.location.name) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold ' +
    quantityClass +
    '">' +
    formatNumber(level.quantity) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(level.article.minimumStock) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(reorder) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(value) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(rupture ? "Rupture" : "Stock bas", rupture ? "error" : "warning") +
    "</td>" +
    "</tr>"
  );
}

function setReapproCardValue(
  root: HTMLElement,
  label: string,
  value: number | string,
) {
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("#reappro .rounded-xl"),
  );
  const card = cards.find((element) => element.textContent?.includes(label));
  const number = card?.querySelector<HTMLElement>(".text-3xl");
  if (number) number.textContent = formatNumber(value);
}

function renderReappro(root: HTMLElement) {
  const levels = reapproLevels();
  const body = root.querySelector<HTMLElement>("#reappro-table tbody");
  if (body)
    body.innerHTML = levels.length
      ? levels.map(reapproRow).join("")
      : emptyRow(7, "Aucun article sous seuil pour le moment.");
  renderDashboardWatchStock(root, levels);
  const ruptures = levels.filter((level) => level.quantity <= 0).length;
  const lowStock = levels.filter((level) => level.quantity > 0).length;
  const estimated = levels.reduce(
    (sum, level) =>
      sum + reorderQuantity(level) * Number(level.article.referencePrice ?? 0),
    0,
  );
  setReapproCardValue(root, "Rupture", ruptures);
  setReapproCardValue(root, "Sous stock securite", lowStock);
  setReapproCardValue(root, "Valeur a commander", estimated);
  setText(root, "#reapproRuptureCount", ruptures);
  setText(root, "#reapproLowStockCount", lowStock);
  setText(root, "#reapproEstimatedValue", estimated);
  window.lucide?.createIcons();
}

export function reapproLevelsPage(ctx: ReapprovisionnementContext) {
  return withContext(ctx, () => reapproLevels());
}

export function reorderQuantityPage(
  level: StockLevel,
  ctx: ReapprovisionnementContext,
) {
  return withContext(ctx, () => reorderQuantity(level));
}

export function renderReapproPage(
  root: HTMLElement,
  ctx: ReapprovisionnementContext,
) {
  return withContext(ctx, () => renderReappro(root));
}
