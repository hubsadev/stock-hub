import type { HistoriqueContext } from "./render";

export function createHistoriqueContext(
  deps: HistoriqueContext,
): HistoriqueContext {
  return {
    ...deps,
  };
}
