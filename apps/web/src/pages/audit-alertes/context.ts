import type { AuditAlertesContext } from "./render";

export function createAuditAlertesContext(
  deps: AuditAlertesContext,
): AuditAlertesContext {
  return {
    ...deps,
  };
}
