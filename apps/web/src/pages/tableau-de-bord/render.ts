import type {
  AuditAlert,
  DashboardSummary,
  StockLevel,
  StockMovement,
} from "../../api";

type TableauDeBordContext = {
  latestAuditAlerts: AuditAlert[];
  latestMovements: StockMovement[];
  latestStockLevels: StockLevel[];
  getDashboardSummary: () => Promise<DashboardSummary>;
  watchStockRow: (level: StockLevel) => string;
  auditAlertDomain: (alert: AuditAlert) => string;
  emptyRow: (colspan: number, message: string) => string;
  setText: (
    root: HTMLElement,
    selector: string,
    value: number | string,
  ) => void;
  formatNumber: (value: number | string | null | undefined) => string;
  escapeHtml: (value: unknown) => string;
};

let latestAuditAlerts: AuditAlert[] = [];
let latestMovements: StockMovement[] = [];
let latestStockLevels: StockLevel[] = [];
let activeCtx: TableauDeBordContext | null = null;

function syncFrom(ctx: TableauDeBordContext) {
  activeCtx = ctx;
  latestAuditAlerts = ctx.latestAuditAlerts;
  latestMovements = ctx.latestMovements;
  latestStockLevels = ctx.latestStockLevels;
}

function withContext<T>(ctx: TableauDeBordContext, callback: () => T): T {
  syncFrom(ctx);
  return callback();
}

function requireCtx() {
  if (!activeCtx) throw new Error("Tableau de bord context is not initialized.");
  return activeCtx;
}

function getDashboardSummary() {
  return requireCtx().getDashboardSummary();
}

function watchStockRow(level: StockLevel) {
  return requireCtx().watchStockRow(level);
}

function auditAlertDomain(alert: AuditAlert) {
  return requireCtx().auditAlertDomain(alert);
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

function setCardValue(
  root: HTMLElement,
  label: string,
  value: number | string,
) {
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("#home .bg-white.rounded-xl"),
  );
  const card = cards.find((element) => element.textContent?.includes(label));
  const number = card?.querySelector<HTMLElement>(".text-3xl");
  if (number) number.textContent = formatNumber(value);
}

function updateDashboard(root: HTMLElement) {
  getDashboardSummary()
    .then((summary) => {
      setCardValue(root, "Articles actifs", summary.articles);
      setText(root, "#homeArticlesCount", summary.articles);
      setCardValue(root, "Ruptures", summary.ruptures);
      setText(root, "#homeRupturesCount", summary.ruptures);
      setCardValue(root, "Equipements affectes", summary.equipmentAssigned);
      setText(root, "#homeEquipmentsCount", summary.equipmentAssigned);
      setCardValue(root, "Mouvements du jour", summary.movementsToday);
      setText(root, "#homeMovementsCount", summary.movementsToday);
      window.lucide?.createIcons();
    })
    .catch(() => {
      // La maquette reste visible si l'API locale n'est pas lancee.
    });
}

function renderDashboardWatchStock(root: HTMLElement, levels: StockLevel[]) {
  const watchBody = root.querySelector<HTMLElement>("#home-watch-stock-body");
  if (watchBody)
    watchBody.innerHTML = levels.length
      ? levels.map(watchStockRow).join("")
      : emptyRow(6, "Aucun stock a surveiller pour le moment.");
}

function renderDashboardPendingExitRequests(
  root: HTMLElement,
  pendingExits: StockMovement[],
) {
  const dashboardPendingCount = root.querySelector<HTMLElement>(
    "#dashboardPendingExitRequestsCount",
  );
  if (dashboardPendingCount)
    dashboardPendingCount.textContent = String(pendingExits.length);
}

function renderDashboardAuditAlerts(root: HTMLElement, alerts: AuditAlert[]) {
  const homeAlerts = root.querySelector<HTMLElement>("#homeAuditAlerts");
  if (homeAlerts)
    homeAlerts.innerHTML = alerts.length
      ? alerts
          .slice(0, 3)
          .map(
            (alert) =>
              '<div class="p-4 rounded-xl bg-warning-50 border border-warning-100"><div class="font-bold text-warning-700">' +
              escapeHtml(alert.type) +
              '</div><div class="text-sm text-gray-600 mt-1">' +
              escapeHtml(alert.action + " - " + alert.object) +
              "</div></div>",
          )
          .join("")
      : '<div class="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500">Aucune alerte audit pour le moment.</div>';
  setCardValue(root, "Alertes ouvertes", alerts.length);
  setCardValue(
    root,
    "Ruptures",
    alerts.filter((alert) => auditAlertDomain(alert) === "STOCK").length,
  );
  setCardValue(
    root,
    "Ecarts inventaire",
    alerts.filter((alert) => auditAlertDomain(alert) === "INVENTORY").length,
  );
  window.lucide?.createIcons();
}

function renderDashboardAuditLogCount(root: HTMLElement, count: number) {
  setCardValue(root, "Actions tracees", count);
  window.lucide?.createIcons();
}

export function setCardValuePage(
  root: HTMLElement,
  label: string,
  value: number | string,
  ctx: TableauDeBordContext,
) {
  return withContext(ctx, () => setCardValue(root, label, value));
}

export function updateDashboardPage(root: HTMLElement, ctx: TableauDeBordContext) {
  return withContext(ctx, () => updateDashboard(root));
}

export function renderDashboardWatchStockPage(
  root: HTMLElement,
  levels: StockLevel[],
  ctx: TableauDeBordContext,
) {
  return withContext(ctx, () => renderDashboardWatchStock(root, levels));
}

export function renderDashboardPendingExitRequestsPage(
  root: HTMLElement,
  pendingExits: StockMovement[],
  ctx: TableauDeBordContext,
) {
  return withContext(ctx, () =>
    renderDashboardPendingExitRequests(root, pendingExits),
  );
}

export function renderDashboardAuditAlertsPage(
  root: HTMLElement,
  alerts: AuditAlert[],
  ctx: TableauDeBordContext,
) {
  return withContext(ctx, () => renderDashboardAuditAlerts(root, alerts));
}

export function renderDashboardAuditLogCountPage(
  root: HTMLElement,
  count: number,
  ctx: TableauDeBordContext,
) {
  return withContext(ctx, () => renderDashboardAuditLogCount(root, count));
}

export type { TableauDeBordContext };
