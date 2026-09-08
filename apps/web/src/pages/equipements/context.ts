import type { EquipementsContext } from "./render";

export function createEquipementsContext(
  deps: EquipementsContext,
): EquipementsContext {
  return {
    ...deps,
  };
}
