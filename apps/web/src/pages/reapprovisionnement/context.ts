import type { ReapprovisionnementContext } from "./render";

export function createReapprovisionnementContext(
  deps: ReapprovisionnementContext,
): ReapprovisionnementContext {
  return {
    ...deps,
  };
}
