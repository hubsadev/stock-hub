import type { ViewActionsContext } from "../components/layout/view-actions";
import type { ExportDatasetsContext } from "../services/export-datasets";
import type { PwaContext } from "../services/pwa";
import type { DataRefreshContext } from "./data-refresh";
import type { DispatchActionContext } from "./dispatch";
import type { ModalControllerContext } from "./modals";
import type { ShellControllerContext } from "./shell-controller";

export function createPwaContext(deps: PwaContext): PwaContext {
  return {
    showToast: deps.showToast,
  };
}

export function createViewActionsContext(
  deps: ViewActionsContext,
): ViewActionsContext {
  return {
    currentUser: deps.currentUser,
    hasRole: deps.hasRole,
  };
}

export function createModalControllerContext(
  deps: ModalControllerContext,
): ModalControllerContext {
  return {
    ...deps,
  };
}

export function createDataRefreshContext(
  deps: DataRefreshContext,
): DataRefreshContext {
  return {
    ...deps,
  };
}

export function createExportDatasetsContext(
  deps: ExportDatasetsContext,
): ExportDatasetsContext {
  return {
    ...deps,
  };
}

export function createShellControllerContext(
  deps: ShellControllerContext,
): ShellControllerContext {
  return {
    ...deps,
  };
}

export function createDispatchContext(
  deps: DispatchActionContext,
): DispatchActionContext {
  return {
    ...deps,
  };
}
