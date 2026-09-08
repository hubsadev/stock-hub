import type { ParcAutoContext } from "./render";

export function createParcAutoContext(
  deps: ParcAutoContext,
): ParcAutoContext {
  return {
    ...deps,
  };
}
