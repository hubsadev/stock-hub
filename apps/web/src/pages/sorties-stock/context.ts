import type { SortiesStockContext } from "./render";

export function createSortiesStockContext(
  deps: SortiesStockContext,
): SortiesStockContext {
  return {
    ...deps,
  };
}
