import type { ReferentielsContext } from "./render";

export function createReferentielsContext(
  deps: ReferentielsContext,
): ReferentielsContext {
  return {
    ...deps,
  };
}
