import type { AuditLog, StockLevel, StockMovement } from "../api";
import type { ExcelExportColumn, ExcelExportRow } from "../types/export";

export type ExportDataset = {
  filenameKind: string;
  sheetName: string;
  columns: ExcelExportColumn[];
  rows: ExcelExportRow[];
};

export type ExportDatasetsContext = {
  latestStockLevels: StockLevel[];
  latestAuditLogs: AuditLog[];
  latestMovements: StockMovement[];
  inventoryGlobalExportRows: () => ExcelExportRow[];
  reapproLevels: () => StockLevel[];
  reorderQuantity: (level: StockLevel) => number;
  filteredHistory: (root: HTMLElement) => StockMovement[];
  movementTypeLabel: (type: StockMovement["type"]) => string;
  movementArticleLabel: (movement: StockMovement) => string;
  movementQuantity: (movement: StockMovement) => number;
  movementActor: (movement: StockMovement) => string;
  auditLogUserLabel: (log: AuditLog) => string;
  auditActionLabel: (action: string) => string;
  auditDocumentLabel: (log: AuditLog) => string;
  auditLogResult: (log: AuditLog) => string;
  auditLogResultLabel: (result: string) => string;
  exportDateValue: (value: string | Date | null | undefined) => Date | undefined;
  exportWorkbook: (input: {
    filename: string;
    sheetName: string;
    columns: ExcelExportColumn[];
    rows: ExcelExportRow[];
  }) => Promise<void>;
  showToast: (
    root: HTMLElement,
    message: string,
    tone?: "success" | "error",
  ) => void;
};

export function exportDatasetFromContext(
  kind: string,
  root: HTMLElement,
  ctx: ExportDatasetsContext,
): ExportDataset {
  if (kind === "stock" || kind === "inventory") {
    if (kind === "inventory") {
      return {
        filenameKind: "inventory",
        sheetName: "Inventaire",
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
        rows: ctx.inventoryGlobalExportRows(),
      };
    }
    return {
      filenameKind: "stock",
      sheetName: "Vue Stock",
      columns: [
        { key: "article", header: "Article" },
        { key: "code", header: "Code" },
        { key: "category", header: "Categorie" },
        { key: "location", header: "Emplacement" },
        { key: "quantity", header: "Quantite", type: "number" },
        { key: "minimumStock", header: "Stock minimum", type: "number" },
        { key: "status", header: "Statut" },
      ],
      rows: [...ctx.latestStockLevels]
        .sort((a, b) => {
          const quantityDiff = Number(b.quantity ?? 0) - Number(a.quantity ?? 0);
          if (quantityDiff !== 0) return quantityDiff;
          return a.article.designation.localeCompare(b.article.designation);
        })
        .map((level) => ({
          article: level.article.designation,
          code: level.article.code,
          category: level.article.category,
          location: level.location.name,
          quantity: Number(level.quantity ?? 0),
          minimumStock: Number(level.article.minimumStock ?? 0),
          status:
            level.quantity <= 0
              ? "Rupture"
              : level.quantity <= level.article.minimumStock
                ? "Stock bas"
                : "OK",
        })),
    };
  }
  if (kind === "reappro") {
    const levels = ctx.reapproLevels();
    return {
      filenameKind: "reappro",
      sheetName: "Reapprovisionnement",
      columns: [
        { key: "article", header: "Article" },
        { key: "code", header: "Code" },
        { key: "location", header: "Emplacement" },
        { key: "available", header: "Disponible", type: "number" },
        { key: "minimumStock", header: "Stock minimum", type: "number" },
        { key: "recommended", header: "A recommander", type: "number" },
        { key: "referencePrice", header: "Prix indicatif", type: "currency" },
        { key: "estimatedValue", header: "Valeur estimee", type: "currency" },
      ],
      rows: levels.map((level) => ({
        article: level.article.designation,
        code: level.article.code,
        location: level.location.name,
        available: Number(level.quantity ?? 0),
        minimumStock: Number(level.article.minimumStock ?? 0),
        recommended: ctx.reorderQuantity(level),
        referencePrice: Number(level.article.referencePrice ?? 0),
        estimatedValue: ctx.reorderQuantity(level) * Number(level.article.referencePrice ?? 0),
      })),
    };
  }
  if (kind === "audit") {
    return {
      filenameKind: "audit",
      sheetName: "Journal audit",
      columns: [
        { key: "date", header: "Date", type: "date" },
        { key: "user", header: "Utilisateur" },
        { key: "action", header: "Action metier" },
        { key: "document", header: "Document" },
        { key: "result", header: "Resultat" },
      ],
      rows: ctx.latestAuditLogs.map((log) => ({
        date: ctx.exportDateValue(log.createdAt),
        user: ctx.auditLogUserLabel(log),
        action: ctx.auditActionLabel(log.action),
        document: ctx.auditDocumentLabel(log),
        result: ctx.auditLogResultLabel(ctx.auditLogResult(log)),
      })),
    };
  }
  const movements = kind === "all" ? ctx.latestMovements : ctx.filteredHistory(root);
  return {
    filenameKind: "mouvements",
    sheetName: "Mouvements",
    columns: [
      { key: "date", header: "Date", type: "date" },
      { key: "type", header: "Type" },
      { key: "reference", header: "Reference" },
      { key: "article", header: "Article" },
      { key: "quantity", header: "Quantite", type: "number" },
      { key: "user", header: "Utilisateur" },
      { key: "project", header: "Projet" },
      { key: "supplier", header: "Fournisseur" },
      { key: "origin", header: "Origine" },
      { key: "destination", header: "Destination" },
      { key: "status", header: "Statut" },
    ],
    rows: movements.map((movement) => ({
      date: ctx.exportDateValue(movement.date),
      type: ctx.movementTypeLabel(movement.type),
      reference: movement.reference,
      article: ctx.movementArticleLabel(movement),
      quantity: ctx.movementQuantity(movement),
      user: ctx.movementActor(movement),
      project: movement.project?.name ?? "",
      supplier: movement.supplier?.name ?? "",
      origin: movement.fromLocation?.name ?? "",
      destination: movement.toLocation?.name ?? "",
      status: movement.status,
    })),
  };
}

export function exportRowsFromContext(
  kind: string,
  root: HTMLElement,
  ctx: ExportDatasetsContext,
) {
  const dataset = exportDatasetFromContext(kind, root, ctx);
  return [
    dataset.columns.map((column) => column.header),
    ...dataset.rows.map((row) => dataset.columns.map((column) => row[column.key])),
  ];
}

export async function exportDataFromContext(
  root: HTMLElement,
  kind: string,
  ctx: ExportDatasetsContext,
) {
  try {
    const dataset = exportDatasetFromContext(kind, root, ctx);
    const date = new Date().toISOString().slice(0, 10);
    const filename = "stock-hub-" + dataset.filenameKind + "-" + date + ".xlsx";
    await ctx.exportWorkbook({
      filename,
      sheetName: dataset.sheetName,
      columns: dataset.columns,
      rows: dataset.rows,
    });
    ctx.showToast(root, "Export Excel prepare : " + filename);
  } catch (error) {
    ctx.showToast(
      root,
      error instanceof Error ? error.message : "Export Excel impossible.",
      "error",
    );
  }
}
