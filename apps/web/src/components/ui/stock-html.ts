import type { StockLevel, StockMovement } from "../../api";
import { escapeHtml, formatNumber } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export function stockStatus(
  level: StockLevel,
  stockStatusCategory: (
    level: StockLevel,
  ) => "rupture" | "sous-seuil" | "disponible",
  badge: (label: string, tone?: BadgeTone) => string,
) {
  const cat = stockStatusCategory(level);
  if (cat === "rupture") return badge("Rupture", "error");
  if (cat === "sous-seuil") return badge("Sous seuil", "warning");
  return badge("Disponible", "success");
}

export function movementTypeBadge(type: StockMovement["type"]) {
  const labels: Record<StockMovement["type"], string> = {
    ENTRY: "Entree",
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

export function watchStockRow(
  level: StockLevel,
  deps: { stockStatus: (level: StockLevel) => string },
) {
  const actions =
    '<div class="flex items-center justify-end gap-2">' +
    '<button data-action="openModal(\'referentialDetailModal\')" title="Voir la fiche article" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50"><i data-lucide="eye" class="w-4 h-4"></i></button>' +
    '<button data-action="showView(\'historique\')" title="Voir historique" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"><i data-lucide="history" class="w-4 h-4"></i></button>' +
    '<button data-action="openModal(\'exitModal\')" title="Demander une sortie" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"><i data-lucide="arrow-up-right-square" class="w-4 h-4"></i></button>' +
    "</div>";
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
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(level.quantity) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(level.article.minimumStock) +
    "</td>" +
    '<td class="px-5 py-4">' +
    deps.stockStatus(level) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    actions +
    "</td>" +
    "</tr>"
  );
}
