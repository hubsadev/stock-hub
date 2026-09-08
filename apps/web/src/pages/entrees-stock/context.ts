import type { EntreesStockContext } from "./render";

export function createEntreesStockContext(
  deps: EntreesStockContext,
): EntreesStockContext {
  return {
    ...deps,
  };
}
