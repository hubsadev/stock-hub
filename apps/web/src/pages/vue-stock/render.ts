import type { StockLevel, StockLocation, StockMovement, Supplier } from "../../api";
import type { ExcelExportColumn, ExcelExportRow, StockExportScope } from "../../types/export";
import { escapeHtml, formatDate, formatNumber } from "../../utils/format";
import {
  initialQuantityForLevel,
  stockLastMovementDate,
  stockMovementMetrics,
  stockStatusCategory,
} from "../../services/stock-logic";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type VueStockContext = {
  stockLevels: StockLevel[];
  movements: StockMovement[];
  suppliers: Supplier[];
  locations: StockLocation[];
  badge: (label: string, tone?: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  option: (value: string, label: string) => string;
  linkedExitForRequest: (movement: StockMovement) => StockMovement | null | undefined;
  exportWorkbook: (input: {
    filename: string;
    sheetName: string;
    columns: ExcelExportColumn[];
    rows: ExcelExportRow[];
  }) => Promise<void>;
  excelCellText: (value: string | number | Date | null | undefined) => string;
  hubLogoMarkup: () => string;
  closeModal: (root: HTMLElement, id: string) => void;
  showToast: (
    root: HTMLElement,
    message: string,
    tone?: "success" | "error",
  ) => void;
};

let stockSortKey = "";
let stockSortDir: "asc" | "desc" = "asc";
let openStockLevelId: string | null = null;

export function clearVueStockDrawerState() {
  openStockLevelId = null;
}

function stockStatus(level: StockLevel, ctx: VueStockContext) {
  const cat = stockStatusCategory(level);
  if (cat === "rupture") return ctx.badge("Rupture", "error");
  if (cat === "sous-seuil") return ctx.badge("Sous seuil", "warning");
  return ctx.badge("Disponible", "success");
}

function stockDisponibleCell(level: StockLevel): string {
  return `<div class="font-bold">${formatNumber(Number(level.quantity))}</div>`;
}

function stockRow(level: StockLevel, ctx: VueStockContext) {
  const metrics = stockMovementMetrics(level, ctx.movements);
  const lastMvt = stockLastMovementDate(level, ctx.movements, formatDate);
  const levelId = escapeHtml(level.id);
  return (
    `<tr class="cursor-pointer hover:bg-gray-50 transition-colors" data-action="openStockDrawer('${levelId}')">` +
    `<td class="px-5 py-4"><div class="font-bold">${escapeHtml(level.article.designation)}</div><div class="text-xs text-gray-500">${escapeHtml(level.article.code)}</div></td>` +
    `<td class="px-5 py-4">${escapeHtml(level.article.category)}</td>` +
    `<td class="px-5 py-4">${escapeHtml(level.location.name)}</td>` +
    `<td class="px-5 py-4 text-right">${formatNumber(metrics.initial)}</td>` +
    `<td class="px-5 py-4 text-right text-success-700">${formatNumber(metrics.entries)}</td>` +
    `<td class="px-5 py-4 text-right text-error-700">${formatNumber(metrics.exits)}</td>` +
    `<td class="px-5 py-4">${stockDisponibleCell(level)}</td>` +
    `<td class="px-5 py-4">${stockStatus(level, ctx)}</td>` +
    `<td class="px-5 py-4 text-sm text-gray-500">${lastMvt}</td>` +
    `</tr>`
  );
}

function renderStockKpis(
  root: HTMLElement,
  levels: StockLevel[],
  ctx: VueStockContext,
) {
  const totalValue = levels.reduce(
    (sum, l) =>
      sum + Number(l.quantity) * Number(l.article.referencePrice ?? 0),
    0,
  );
  const belowThreshold = levels.filter(
    (l) =>
      stockStatusCategory(l) === "rupture" ||
      stockStatusCategory(l) === "sous-seuil",
  ).length;
  // count movements that touch any of the filtered levels in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filteredArticleIds = new Set(levels.map((l) => l.article.id));
  const filteredLocationIds = new Set(levels.map((l) => l.location.id));
  const mvtCount = ctx.movements.filter((m) => {
    if (m.status === "CANCELLED" || m.status === "DRAFT") return false;
    const hasArticle = m.lines.some((line) =>
      filteredArticleIds.has(line.articleId),
    );
    const hasLocation =
      filteredLocationIds.has(m.fromLocationId ?? "") ||
      filteredLocationIds.has(m.toLocationId ?? "");
    const isRecent = new Date(m.date) >= thirtyDaysAgo;
    return hasArticle && hasLocation && isRecent;
  }).length;
  const kpiValueEl = root.querySelector<HTMLElement>("#stockKpiValue");
  const kpiRuptureEl = root.querySelector<HTMLElement>("#stockKpiRupture");
  const kpiMvtEl = root.querySelector<HTMLElement>("#stockKpiMvt");
  if (kpiValueEl) kpiValueEl.textContent = formatNumber(Math.round(totalValue));
  if (kpiRuptureEl) kpiRuptureEl.textContent = formatNumber(belowThreshold);
  if (kpiMvtEl) kpiMvtEl.textContent = formatNumber(mvtCount);
}

function renderStockSortHeaders(root: HTMLElement) {
  const headers = root.querySelectorAll<HTMLElement>(
    "#stockTableHead th[data-sort]",
  );
  headers.forEach((th) => {
    const key = th.dataset.sort ?? "";
    const icon = th.querySelector<HTMLElement>(".sort-icon");
    if (!icon) return;
    if (stockSortKey !== key) {
      icon.innerHTML = `<i data-lucide="chevrons-up-down" class="w-3 h-3 ml-1 inline opacity-40"></i>`;
    } else {
      icon.innerHTML =
        stockSortDir === "asc"
          ? `<i data-lucide="chevron-up" class="w-3 h-3 ml-1 inline text-accent-600"></i>`
          : `<i data-lucide="chevron-down" class="w-3 h-3 ml-1 inline text-accent-600"></i>`;
    }
  });
}

function filteredStockLevels(root: HTMLElement, ctx: VueStockContext) {
  const location =
    root.querySelector<HTMLSelectElement>("#stockLocationSelect")?.value ?? "";
  const category =
    root.querySelector<HTMLSelectElement>("#stockCategorySelect")?.value ?? "";
  const search =
    root
      .querySelector<HTMLInputElement>("#stockSearchInput")
      ?.value.trim()
      .toLowerCase() ?? "";
  const statusFilter =
    root.querySelector<HTMLSelectElement>("#stockStatusSelect")?.value ?? "";
  let levels = ctx.stockLevels.filter((level) => {
    const haystack =
      `${level.article.code} ${level.article.designation} ${level.location.name}`.toLowerCase();
    const statusOk =
      !statusFilter || stockStatusCategory(level) === statusFilter;
    return (
      (!location || level.location.id === location) &&
      (!category || level.article.category === category) &&
      (!search || haystack.includes(search)) &&
      statusOk
    );
  });
  // Sort
  if (stockSortKey) {
    levels = [...levels].sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      if (stockSortKey === "designation") {
        va = a.article.designation;
        vb = b.article.designation;
      } else if (stockSortKey === "category") {
        va = a.article.category;
        vb = b.article.category;
      } else if (stockSortKey === "location") {
        va = a.location.name;
        vb = b.location.name;
      } else if (stockSortKey === "quantity") {
        va = Number(a.quantity);
        vb = Number(b.quantity);
      } else if (stockSortKey === "status") {
        va = stockStatusCategory(a);
        vb = stockStatusCategory(b);
      }
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return stockSortDir === "asc" ? cmp : -cmp;
    });
  }
  return levels;
}

export function renderStock(root: HTMLElement, ctx: VueStockContext) {
  const body = root.querySelector<HTMLElement>("#stock tbody");
  if (!body) return;
  const levels = filteredStockLevels(root, ctx);
  body.innerHTML = levels.length
    ? levels.map((level) => stockRow(level, ctx)).join("")
    : ctx.emptyRow(9, "Aucun stock ne correspond aux critères.");
  renderStockKpis(root, levels, ctx);
  renderStockSortHeaders(root);
  window.lucide?.createIcons();
}

export function populateStockFilters(root: HTMLElement, ctx: VueStockContext) {
  const locationSelect = root.querySelector<HTMLSelectElement>(
    "#stockLocationSelect",
  );
  if (locationSelect) {
    const previous = locationSelect.value;
    locationSelect.innerHTML =
      '<option value="">Tous les emplacements</option>' +
      ctx.locations
        .map((location) =>
          ctx.option(location.id, `${location.code} - ${location.name}`),
        )
        .join("");
    if (ctx.locations.some((location) => location.id === previous))
      locationSelect.value = previous;
  }
  const categorySelect = root.querySelector<HTMLSelectElement>(
    "#stockCategorySelect",
  );
  if (categorySelect) {
    const previous = categorySelect.value;
    const categories = [
      ...new Set(ctx.stockLevels.map((level) => level.article.category)),
    ].sort();
    categorySelect.innerHTML =
      '<option value="">Toutes familles</option>' +
      categories.map((category) => ctx.option(category, category)).join("");
    if (categories.includes(previous)) categorySelect.value = previous;
  }
}

function movementTypeBadge(type: StockMovement["type"]) {
  const labels: Record<StockMovement["type"], string> = {
    ENTRY: "Entrée",
    EXIT_REQUEST: "Dem. sortie",
    EXIT: "Sortie",
    RETURN: "Retour",
    TRANSFER: "Transfert",
    ADJUSTMENT: "Inventaire",
    INITIAL: "Stock de depart",
  };
  const tones: Record<StockMovement["type"], string> = {
    INITIAL: "bg-accent-50 text-accent-600",
    ENTRY: "bg-success-50 text-success-700",
    EXIT_REQUEST: "bg-gray-100 text-gray-600",
    EXIT: "bg-error-50 text-error-700",
    RETURN: "bg-success-50 text-success-700",
    TRANSFER: "bg-accent-50 text-accent-600",
    ADJUSTMENT: "bg-warning-50 text-warning-700",
  };
  return `<span class="px-2 py-0.5 rounded-full text-xs font-bold ${tones[type]}">${escapeHtml(labels[type] ?? type)}</span>`;
}

export function openStockDrawer(
  root: HTMLElement,
  levelId: string,
  ctx: VueStockContext,
) {
  openStockLevelId = levelId;
  renderStockDrawer(root, ctx);
}

export function renderStockDrawer(root: HTMLElement, ctx: VueStockContext) {
  const drawer = root.querySelector<HTMLElement>("#stockDrawer");
  const backdrop = root.querySelector<HTMLElement>("#stockDrawerBackdrop");
  if (!drawer || !backdrop) return;
  const level = ctx.stockLevels.find((l) => l.id === openStockLevelId);
  if (!level) return;

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

  // Header
  const header = drawer.querySelector<HTMLElement>("#stockDrawerHeader");
  if (header) {
    header.innerHTML = `
      <div class="min-w-0 flex-1">
        <div class="font-bold text-lg truncate">${escapeHtml(level.article.designation)}</div>
        <div class="text-sm text-gray-500">${escapeHtml(level.article.code)} &bull; ${escapeHtml(level.location.name)}</div>
      </div>
    `;
  }

  // Infos complementaires
  const infoEl = drawer.querySelector<HTMLElement>("#stockDrawerInfo");
  if (infoEl) {
    const supplier = ctx.suppliers.find(
      (s) => s.id === level.article.defaultSupplierId,
    );
    const secondaryLocations = ctx.stockLevels.filter(
      (l) =>
        l.article.id === level.article.id &&
        l.location.id !== level.location.id,
    );
    const cat = stockStatusCategory(level);
    const statusColors: Record<string, string> = {
      rupture: "bg-error-50 text-error-700 border border-error-100",
      "sous-seuil": "bg-warning-50 text-warning-700 border border-warning-100",
      disponible: "bg-success-50 text-success-700 border border-success-100",
    };
    const statusLabels: Record<string, string> = {
      rupture: "Rupture",
      "sous-seuil": "Sous seuil",
      disponible: "Disponible",
    };
    infoEl.innerHTML = `
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Statut actuel</div>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[cat]}">${statusLabels[cat]}</span>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Disponible</div>
          <div class="font-bold text-base">${formatNumber(level.quantity)} <span class="text-xs font-normal text-gray-400">${escapeHtml(level.article.unit)}</span></div>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Seuil minimum</div>
          <div class="font-semibold">${formatNumber(level.article.minimumStock)} ${escapeHtml(level.article.unit)}</div>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Stock securite</div>
          <div class="font-semibold">${level.article.securityStock > 0 ? formatNumber(level.article.securityStock) + " " + escapeHtml(level.article.unit) : "-"}</div>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Fournisseur principal</div>
          <div class="font-semibold">${escapeHtml(supplier?.name ?? "-")}</div>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Emplacements secondaires</div>
          <div class="font-semibold text-xs">${secondaryLocations.length > 0 ? secondaryLocations.map((l) => escapeHtml(l.location.name) + " (" + formatNumber(l.quantity) + ")").join(", ") : "Aucun"}</div>
        </div>
      </div>
    `;
  }

  // Historique mouvements
  const histEl = drawer.querySelector<HTMLElement>("#stockDrawerHistory");
  if (histEl) {
    const dateFrom =
      drawer.querySelector<HTMLInputElement>("#stockDrawerDateFrom")?.value ??
      "";
    const dateTo =
      drawer.querySelector<HTMLInputElement>("#stockDrawerDateTo")?.value ?? "";
    const movements = ctx.movements
      .filter((m) => {
        if (m.status === "CANCELLED" || m.status === "DRAFT") return false;
        // Une demande preparee est ensuite materialisee par une sortie reelle.
        // Elle ne doit pas apparaitre deux fois dans l'historique du stock.
        if (m.type === "EXIT_REQUEST" && ctx.linkedExitForRequest(m)) return false;
        const hasArticle = m.lines.some(
          (l) => l.articleId === level.article.id,
        );
        const hasLocation =
          m.fromLocationId === level.location.id ||
          m.toLocationId === level.location.id;
        if (!hasArticle || !hasLocation) return false;
        if (dateFrom && m.date < dateFrom) return false;
        if (dateTo && m.date > dateTo + "T23:59:59") return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Un meme comptage ne doit pas etre repete dans la fiche si le bouton a
    // ete valide plusieurs fois avec exactement les memes valeurs.
    const uniqueInventoryKeys = new Set<string>();
    const deduplicatedMovements = movements.filter((movement) => {
      if (movement.type !== "ADJUSTMENT") return true;
      const line = movement.lines.find(
        (item) => item.articleId === level.article.id,
      );
      const key = [
        level.article.id,
        level.location.id,
        line?.expectedQuantity ?? "",
        line?.completedQuantity ?? "",
      ].join("|");
      if (uniqueInventoryKeys.has(key)) return false;
      uniqueInventoryKeys.add(key);
      return true;
    });
    movements.splice(0, movements.length, ...deduplicatedMovements);

    // Les anciens articles n'avaient pas encore de mouvement INITIAL en base.
    // On reconstruit alors le stock de depart et on l'affiche toujours en premier.
    if (!movements.some((m) => m.type === "INITIAL")) {
      const initialQuantity = initialQuantityForLevel(level, ctx.movements);
      movements.unshift({
        id: `initial-${level.article.id}-${level.location.id}`,
        reference: `INIT-${level.article.code}`,
        type: "INITIAL",
        status: "COMPLETED",
        date: level.article.createdAt ?? new Date(0).toISOString(),
        supplierId: null,
        clientId: null,
        projectId: null,
        teamServiceId: null,
        siteLocationId: null,
        fromLocationId: level.location.id,
        toLocationId: level.location.id,
        handledBy: null,
        requestedBy: null,
        receivedBy: null,
        deliveredBy: null,
        sourceRequestId: null,
        proofFileName: null,
        proofFileKey: null,
        proofMimeType: null,
        proofSizeBytes: null,
        proofUploadedAt: null,
        proofUploadedBy: null,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null,
        notes: "Stock de depart",
        lines: [
          {
            id: `initial-line-${level.article.id}-${level.location.id}`,
            articleId: level.article.id,
            article: level.article,
            requestedQuantity: initialQuantity,
            expectedQuantity: initialQuantity,
            completedQuantity: initialQuantity,
            unitPrice: null,
            observation: "Stock de depart",
          },
        ],
      });
    }
    // Lecture chronologique : le stock de depart apparait avant les mouvements.
    movements.sort((a, b) => a.date.localeCompare(b.date));

    if (!movements.length) {
      histEl.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Aucun mouvement trouvé pour cette période.</p>`;
    } else {
      histEl.innerHTML = movements
        .map((m) => {
          const lineForArticle = m.lines.find(
            (l) => l.articleId === level.article.id,
          );
          const qty = Number(
            lineForArticle?.completedQuantity ??
              lineForArticle?.requestedQuantity ??
              lineForArticle?.expectedQuantity ??
              0,
          );
          const isOut =
            m.type === "EXIT" ||
            m.type === "EXIT_REQUEST" ||
            (m.type === "TRANSFER" && m.fromLocationId === level.location.id);
          const displayedQuantity =
            m.type === "ADJUSTMENT"
              ? qty - Number(lineForArticle?.expectedQuantity ?? 0)
              : qty;
          const signedQuantity = isOut ? -displayedQuantity : displayedQuantity;
          const qtyClass =
            signedQuantity < 0 ? "text-error-700" : "text-success-700";
          const qtySign = signedQuantity > 0 ? "+" : "";
          const actor =
            m.handledBy ??
            m.receivedBy ??
            m.requestedBy ??
            m.deliveredBy ??
            "-";
          return `<div class="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
          <div class="shrink-0 mt-0.5">${movementTypeBadge(m.type)}</div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-gray-500">${escapeHtml(formatDate(m.date))}</span>
              <span class="font-bold text-sm ${qtyClass}">${qtySign}${formatNumber(signedQuantity)}</span>
            </div>
            <div class="text-xs text-gray-600 mt-0.5 truncate">${escapeHtml(m.reference)} &bull; ${escapeHtml(actor)}</div>
          </div>
        </div>`;
        })
        .join("");
    }
  }

  window.lucide?.createIcons();
}

function stockLevelStatusLabel(level: StockLevel) {
  const status = stockStatusCategory(level);
  if (status === "rupture") return "Rupture";
  if (status === "sous-seuil") return "Sous seuil";
  return "Disponible";
}

function selectedStockExportLocationId(root: HTMLElement) {
  return (
    root.querySelector<HTMLSelectElement>("#stockExportLocationSelect")?.value ||
    root.querySelector<HTMLSelectElement>("#stockLocationSelect")?.value ||
    ""
  );
}

export function stockLocationExportRows(root: HTMLElement, ctx: VueStockContext) {
  const locationId = selectedStockExportLocationId(root);
  if (!locationId) return [];
  return ctx.stockLevels
    .filter((level) => level.location.id === locationId)
    .sort((a, b) => {
      const quantityDiff = Number(b.quantity ?? 0) - Number(a.quantity ?? 0);
      if (quantityDiff !== 0) return quantityDiff;
      return a.article.designation.localeCompare(b.article.designation);
    })
    .map((level) => {
    const metrics = stockMovementMetrics(level, ctx.movements);
    const quantity = Number(level.quantity ?? 0);
    return {
      article: level.article.designation,
      code: level.article.code,
      category: level.article.category,
      location: level.location.name,
      initial: metrics.initial,
      entries: metrics.entries,
      exits: metrics.exits,
      quantity,
      minimumStock: Number(level.article.minimumStock ?? 0),
      value: quantity * Number(level.article.referencePrice ?? 0),
      status: stockLevelStatusLabel(level),
    };
  });
}

export function stockGlobalExportRows(ctx: VueStockContext) {
  const byArticle = new Map<string, StockLevel[]>();
  ctx.stockLevels.forEach((level) => {
    byArticle.set(level.article.id, [...(byArticle.get(level.article.id) ?? []), level]);
  });
  return [...byArticle.values()]
    .map((levels) => {
      const first = levels[0];
      const quantity = levels.reduce((sum, level) => sum + Number(level.quantity ?? 0), 0);
      const minimumStock = Number(first.article.minimumStock ?? 0);
      return {
        article: first.article.designation,
        code: first.article.code,
        category: first.article.category,
        locations: levels.map((level) => level.location.name).join(", "),
        quantity,
        minimumStock,
        value: quantity * Number(first.article.referencePrice ?? 0),
        status:
          quantity <= 0
            ? "Rupture"
            : quantity <= minimumStock
              ? "Sous seuil"
              : "Disponible",
      };
    })
    .sort((a, b) => {
      const quantityDiff = Number(b.quantity ?? 0) - Number(a.quantity ?? 0);
      if (quantityDiff !== 0) return quantityDiff;
      return String(a.article).localeCompare(String(b.article));
    });
}

export function stockExportDataset(root: HTMLElement, scope: StockExportScope, ctx: VueStockContext): {
  filenameKind: string;
  sheetName: string;
  title: string;
  columns: ExcelExportColumn[];
  rows: ExcelExportRow[];
  } {
  if (scope === "global") {
    return {
      filenameKind: "stock-global",
      sheetName: "Stock global",
      title: "Etat global du stock",
      columns: [
        { key: "article", header: "Article" },
        { key: "code", header: "Code" },
        { key: "category", header: "Famille" },
        { key: "locations", header: "Emplacements" },
        { key: "quantity", header: "Disponible global", type: "number" },
        { key: "minimumStock", header: "Stock minimum", type: "number" },
        { key: "value", header: "Valeur estimee", type: "currency" },
        { key: "status", header: "Statut" },
      ],
      rows: stockGlobalExportRows(ctx),
    };
  }
  if (!selectedStockExportLocationId(root)) {
    throw new Error("Selectionne l'emplacement a exporter.");
  }
  const locationName =
    ctx.locations.find((location) => location.id === selectedStockExportLocationId(root))?.name ??
    "Emplacement";
  return {
    filenameKind: "stock-par-emplacement",
    sheetName: "Stock par emplacement",
    title: "Etat du stock - " + locationName,
    columns: [
      { key: "article", header: "Article" },
      { key: "code", header: "Code" },
      { key: "category", header: "Famille" },
      { key: "location", header: "Emplacement" },
      { key: "initial", header: "Initial", type: "number" },
      { key: "entries", header: "Entrees", type: "number" },
      { key: "exits", header: "Sorties", type: "number" },
      { key: "quantity", header: "Disponible", type: "number" },
      { key: "minimumStock", header: "Stock minimum", type: "number" },
      { key: "status", header: "Statut" },
    ],
    rows: stockLocationExportRows(root, ctx),
  };
}

export async function downloadStockExcel(
  root: HTMLElement,
  scope: StockExportScope,
  ctx: VueStockContext,
) {
  try {
    const dataset = stockExportDataset(root, scope, ctx);
    const date = new Date().toISOString().slice(0, 10);
    const filename = "stock-hub-" + dataset.filenameKind + "-" + date + ".xlsx";
    await ctx.exportWorkbook({
      filename,
      sheetName: dataset.sheetName,
      columns: dataset.columns,
      rows: dataset.rows,
    });
    ctx.closeModal(root, "stockExportModal");
    ctx.showToast(root, "Export Excel prepare : " + filename);
  } catch (error) {
    ctx.showToast(root, error instanceof Error ? error.message : "Export Excel impossible.", "error");
  }
}

export function stockPdfHtml(
  dataset: ReturnType<typeof stockExportDataset>,
  ctx: VueStockContext,
) {
  const totalQuantity = dataset.rows.reduce(
    (sum, row) => sum + Number(row.quantity ?? 0),
    0,
  );
  const totalValue = dataset.rows.reduce(
    (sum, row) => sum + Number(row.value ?? 0),
    0,
  );
  const header = dataset.columns
    .map((column) => `<th class="${column.type === "number" || column.type === "currency" ? "right" : ""}">${escapeHtml(column.header)}</th>`)
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
                : ctx.excelCellText(value);
            return `<td class="${column.type === "number" || column.type === "currency" ? "right strong" : ""}">${escapeHtml(text)}</td>`;
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
    .kpi { border: 1px solid #d3dcea; padding: 3mm 5mm; min-width: 34mm; }
    .kpi .label { color: #64748b; font-size: 8px; text-transform: uppercase; font-weight: 900; }
    .kpi .value { margin-top: 1.5mm; font-size: 14px; font-weight: 950; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #3746f5; color: #fff; font-size: 8px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
    td, th { border: 1px solid #cbd5e1; padding: 2.2mm; vertical-align: middle; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    .right { text-align: right; }
    .strong { font-weight: 900; }
    @media print { body { background: white; } .toolbar { display: none; } .page { width: 297mm; min-height: 210mm; margin: 0; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer PDF</button></div>
  <main class="page">
    <header class="head">
      <div>${ctx.hubLogoMarkup()}</div>
      <div><div class="title">${escapeHtml(dataset.title)}</div><div class="meta">Export genere le ${escapeHtml(formatDate(new Date()))} - ${formatNumber(dataset.rows.length)} ligne(s)</div></div>
    </header>
    <section class="kpis">
      <div class="kpi"><div class="label">Lignes</div><div class="value">${formatNumber(dataset.rows.length)}</div></div>
      <div class="kpi"><div class="label">Quantite totale</div><div class="value">${formatNumber(totalQuantity)}</div></div>
      <div class="kpi"><div class="label">Valeur estimee</div><div class="value">${formatNumber(totalValue)}</div></div>
    </section>
    <table><thead><tr>${header}</tr></thead><tbody>${rows || `<tr><td colspan="${dataset.columns.length}">Aucune donnee a exporter.</td></tr>`}</tbody></table>
  </main>
</body>
</html>`;
}

export function downloadStockPdf(
  root: HTMLElement,
  scope: StockExportScope,
  ctx: VueStockContext,
) {
  let dataset: ReturnType<typeof stockExportDataset>;
  try {
    dataset = stockExportDataset(root, scope, ctx);
  } catch (error) {
    ctx.showToast(root, error instanceof Error ? error.message : "Export PDF impossible.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    ctx.showToast(root, "Autorise les popups pour telecharger le PDF.", "error");
    return;
  }
  popup.document.write(stockPdfHtml(dataset, ctx));
  popup.document.close();
  ctx.closeModal(root, "stockExportModal");
  popup.focus();
  popup.print();
}

export function prepareStockExportModal(root: HTMLElement, ctx: VueStockContext) {
  const select = root.querySelector<HTMLSelectElement>("#stockExportLocationSelect");
  if (!select) return;
  const currentFilter =
    root.querySelector<HTMLSelectElement>("#stockLocationSelect")?.value ?? "";
  const previous = select.value || currentFilter;
  const locationsWithStock = ctx.locations
    .filter((location) =>
      ctx.stockLevels.some((level) => level.location.id === location.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  select.innerHTML =
    '<option value="">Selectionner un emplacement</option>' +
    locationsWithStock
      .map((location) => ctx.option(location.id, `${location.code} - ${location.name}`))
      .join("");
  if (locationsWithStock.some((location) => location.id === previous)) {
    select.value = previous;
  }
}

export function sortStock(key: string) {
  if (stockSortKey === key) {
    stockSortDir = stockSortDir === "asc" ? "desc" : "asc";
  } else {
    stockSortKey = key;
    stockSortDir = "asc";
  }
}
