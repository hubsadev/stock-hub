import type { UtilisateursRolesContext } from "./render";

export function createUtilisateursRolesContext(
  deps: UtilisateursRolesContext,
): UtilisateursRolesContext {
  return {
    ...deps,
  };
}
