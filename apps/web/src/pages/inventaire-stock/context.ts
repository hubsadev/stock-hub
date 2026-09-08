import type { InventaireStockContext } from "./render";

export function createInventaireStockContext(
  deps: InventaireStockContext,
): InventaireStockContext {
  return {
    ...deps,
  };
}
