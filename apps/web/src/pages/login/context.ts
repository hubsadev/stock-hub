import type { LoginContext } from "./render";

export function createLoginContext(deps: LoginContext): LoginContext {
  return {
    ...deps,
  };
}
