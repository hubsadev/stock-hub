import type { ProfilContext } from "./render";

export function createProfilContext(deps: ProfilContext): ProfilContext {
  return {
    ...deps,
  };
}
