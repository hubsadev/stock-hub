import type { VueStockContext } from "./render";

export function createVueStockContext(
  deps: VueStockContext,
): VueStockContext {
  return {
    ...deps,
  };
}
