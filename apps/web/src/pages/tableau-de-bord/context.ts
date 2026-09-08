import type { TableauDeBordContext } from "./render";

export function createTableauDeBordContext(
  deps: TableauDeBordContext,
): TableauDeBordContext {
  return {
    ...deps,
  };
}
