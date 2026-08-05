export type StockRole = "ADMIN_STOCK" | "GESTIONNAIRE_STOCK" | "AUDIT" | "RH" | "DIRECTION" | "CHEF_PROJET";

export type ArticleTrackingMode = "QUANTITY" | "INDIVIDUAL";

export type StockMovementType = "ENTRY" | "EXIT_REQUEST" | "EXIT" | "RETURN" | "TRANSFER" | "ADJUSTMENT";

export type StockMovementStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "PREPARED" | "COMPLETED" | "REJECTED" | "CANCELLED";

export const STOCK_CATEGORIES = [
  "MATERIEL_RESEAU",
  "OUTILLAGE",
  "EQUIPEMENT_IT",
  "BUREAU",
  "VEHICULE",
  "DIVERS"
] as const;

export type StockCategory = (typeof STOCK_CATEGORIES)[number];

export function canCreateStockEntry(roles: StockRole[]): boolean {
  return roles.includes("ADMIN_STOCK") || roles.includes("GESTIONNAIRE_STOCK");
}

export function canRequestStockExit(roles: StockRole[]): boolean {
  return roles.includes("ADMIN_STOCK") || roles.includes("GESTIONNAIRE_STOCK") || roles.includes("CHEF_PROJET");
}

export function canAuditStock(roles: StockRole[]): boolean {
  return roles.includes("ADMIN_STOCK") || roles.includes("AUDIT") || roles.includes("DIRECTION");
}
