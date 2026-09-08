import type { RetoursTransfertsContext } from "./render";

export function createRetoursTransfertsContext(
  deps: RetoursTransfertsContext,
): RetoursTransfertsContext {
  return {
    ...deps,
  };
}
