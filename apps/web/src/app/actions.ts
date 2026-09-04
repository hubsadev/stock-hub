import type {
  InventoryExportScope,
  StockExportScope,
} from "../types/export";

export function parseAction(action: string) {
  const viewMatch = action.match(/^showView\('([^']+)'/);
  if (viewMatch) return { type: "view", id: viewMatch[1] } as const;
  const refDetailMatch = action.match(
    /^openReferentialDetail\('([^']+)'\s*,\s*'([^']+)'\)/,
  );
  if (refDetailMatch)
    return {
      type: "ref-detail",
      refType: refDetailMatch[1],
      id: refDetailMatch[2],
    } as const;
  const toastMatch = action.match(/^toast\('([^']+)'\)/);
  if (toastMatch) return { type: "toast", message: toastMatch[1] } as const;
  const openMatch = action.match(/^openModal\('([^']+)'\)/);
  if (openMatch) return { type: "open", id: openMatch[1] } as const;
  const closeMatch = action.match(/^closeModal\('([^']+)'\)/);
  if (closeMatch) return { type: "close", id: closeMatch[1] } as const;
  const countMatch = action.match(/^openCount\('([^']+)'\s*,\s*'([^']+)'\)/);
  if (countMatch)
    return {
      type: "count",
      articleId: countMatch[1],
      locationId: countMatch[2],
    } as const;
  const exportMatch = action.match(/^exportData\('([^']+)'\)/);
  if (exportMatch) return { type: "export", kind: exportMatch[1] } as const;
  const stockLocationMatch = action.match(
    /^filterStockByLocation\('([^']+)'\)/,
  );
  if (stockLocationMatch)
    return { type: "stock-location", id: stockLocationMatch[1] } as const;
  if (action === "filterStock") return { type: "stock-filter" } as const;
  const inventoryModeMatch = action.match(/^showInventoryMode\('([^']+)'\)/);
  if (inventoryModeMatch)
    return { type: "inventory-mode", mode: inventoryModeMatch[1] } as const;
  const inventoryLocationMatch = action.match(/^showInventoryLocation\('([^']+)'\)/);
  if (inventoryLocationMatch)
    return { type: "inventory-location", id: inventoryLocationMatch[1] } as const;
  const exitFilterMatch = action.match(/^setExitFilter\('([^']+)'\)/);
  if (exitFilterMatch)
    return { type: "exit-filter", filter: exitFilterMatch[1] } as const;
  const entryFilterMatch = action.match(/^setEntryFilter\('([^']+)'\)/);
  if (entryFilterMatch)
    return { type: "entry-filter", filter: entryFilterMatch[1] } as const;
  const vehicleFilterMatch = action.match(/^setVehicleFilter\('([^']+)'\)/);
  if (vehicleFilterMatch)
    return { type: "vehicle-filter", filter: vehicleFilterMatch[1] } as const;
  const auditFilterMatch = action.match(/^setAuditFilter\('([^']+)'\)/);
  if (auditFilterMatch)
    return { type: "audit-filter", filter: auditFilterMatch[1] } as const;
  const auditTabMatch = action.match(/^showAudit\('([^']+)'/);
  if (auditTabMatch)
    return { type: "audit-tab", id: auditTabMatch[1] } as const;
  const auditAlertDetailMatch = action.match(/^openAuditAlertDetail\('([^']+)'\)/);
  if (auditAlertDetailMatch)
    return { type: "audit-alert-detail", id: auditAlertDetailMatch[1] } as const;
  const auditLogDetailMatch = action.match(/^openAuditLogDetail\('([^']+)'\)/);
  if (auditLogDetailMatch)
    return { type: "audit-log-detail", id: auditLogDetailMatch[1] } as const;
  const auditLogDateRangeMatch = action.match(/^setAuditLogDateRange\('([^']+)'\)/);
  if (auditLogDateRangeMatch)
    return { type: "audit-log-date-range", range: auditLogDateRangeMatch[1] } as const;
  const auditLogDayMatch = action.match(/^toggleAuditLogDay\('([^']+)'\)/);
  if (auditLogDayMatch)
    return { type: "audit-log-day", dayKey: auditLogDayMatch[1] } as const;
  const exitActionsMatch = action.match(/^toggleExitActions\('([^']+)'\)/);
  if (exitActionsMatch)
    return { type: "toggle-exit-actions", id: exitActionsMatch[1] } as const;
  const panelMatch = action.match(/^togglePanel\('([^']+)'\)/);
  if (panelMatch) return { type: "toggle-panel", id: panelMatch[1] } as const;
  if (action === "refreshHistory") return { type: "refresh-history" } as const;
  const historyProofFilterMatch = action.match(
    /^setHistoryProofFilter\('(ALL|MISSING)'\)/,
  );
  if (historyProofFilterMatch)
    return {
      type: "history-proof-filter",
      filter: historyProofFilterMatch[1] as "ALL" | "MISSING",
    } as const;
  if (action.includes("toggleLoginPassword"))
    return { type: "toggle-password" } as const;
  if (action.includes("toggleUserPassword"))
    return { type: "toggle-user-password" } as const;
  if (action.includes("loginMock") || action.includes("loginUser"))
    return { type: "login" } as const;
  if (action.includes("logoutMock")) return { type: "logout" } as const;
  if (action === "downloadArticleImportTemplate")
    return { type: "download-article-import-template" } as const;
  if (action === "importArticles") return { type: "import-articles" } as const;
  if (action === "downloadInventoryImportTemplate")
    return { type: "download-inventory-import-template" } as const;
  if (action === "importInventoryRows")
    return { type: "import-inventory-rows" } as const;
  if (action === "submitReferential")
    return { type: "submit-referential" } as const;
  if (action === "submitQuickArticle")
    return { type: "submit-quick-article" } as const;
  if (action === "editReferentialDetail")
    return { type: "edit-referential-detail" } as const;
  if (action === "cancelReferentialEdit")
    return { type: "cancel-referential-edit" } as const;
  if (action === "submitReferentialEdit")
    return { type: "submit-referential-edit" } as const;
  if (action === "deactivateReferentialDetail")
    return { type: "deactivate-referential-detail" } as const;
  if (action === "submitStockEntry")
    return { type: "submit-stock-entry" } as const;
  if (action === "openEntryResolution")
    return { type: "open-entry-resolution" } as const;
  if (action === "submitEntryResolution")
    return { type: "submit-entry-resolution" } as const;
  if (action === "addEntryLine") return { type: "add-entry-line" } as const;
  if (action === "removeEntryLine")
    return { type: "remove-entry-line" } as const;
  if (action === "submitExitRequest")
    return { type: "submit-exit-request" } as const;
  if (action === "submitMaterialRequestPreparation")
    return { type: "submit-material-request-preparation" } as const;
  if (action === "downloadMaterialRequestPdf")
    return { type: "download-material-request-pdf" } as const;
  if (action === "addMaterialRequestLine")
    return { type: "add-material-request-line" } as const;
  if (action === "removeMaterialRequestLine")
    return { type: "remove-material-request-line" } as const;
  if (action === "submitDirectExit")
    return { type: "submit-direct-exit" } as const;
  if (action === "submitStockReturn")
    return { type: "submit-stock-return" } as const;
  if (action === "submitStockTransfer")
    return { type: "submit-stock-transfer" } as const;
  if (action === "addReturnLine")
    return { type: "add-return-line" } as const;
  if (action === "removeReturnLine")
    return { type: "remove-return-line" } as const;
  if (action === "openReturnControl")
    return { type: "open-return-control" } as const;
  if (action === "submitReturnControl")
    return { type: "submit-return-control" } as const;
  if (action === "addTransferLine")
    return { type: "add-transfer-line" } as const;
  if (action === "removeTransferLine")
    return { type: "remove-transfer-line" } as const;
  if (action === "submitInventoryCount")
    return { type: "submit-inventory-count" } as const;
  if (action === "submitEquipmentAssignment")
    return { type: "submit-equipment-assignment" } as const;
  if (action === "submitEquipmentCreation")
    return { type: "submit-equipment-creation" } as const;
  if (action === "editEquipmentDetail" || action === "openEquipmentEdit")
    return { type: "edit-equipment-detail" } as const;
  if (action === "cancelEquipmentEdit")
    return { type: "cancel-equipment-edit" } as const;
  if (action === "submitEquipmentEdit")
    return { type: "submit-equipment-edit" } as const;
  if (action === "unassignEquipment")
    return { type: "unassign-equipment" } as const;
  if (action === "submitVehicle") return { type: "submit-vehicle" } as const;
  if (action === "editVehicleDetail" || action === "openVehicleEdit")
    return { type: "edit-vehicle-detail" } as const;
  if (action === "changeVehicleDriver")
    return { type: "change-vehicle-driver" } as const;
  if (action === "cancelVehicleEdit")
    return { type: "cancel-vehicle-edit" } as const;
  if (action === "submitVehicleEdit")
    return { type: "submit-vehicle-edit" } as const;
  if (action === "setVehicleMaintenance")
    return { type: "set-vehicle-maintenance" } as const;
  if (action === "submitUser") return { type: "submit-user" } as const;
  if (action === "submitProfile") return { type: "submit-profile" } as const;
  if (action === "submitPasswordChange")
    return { type: "submit-password-change" } as const;
  if (action === "toggleVehicleHistory")
    return { type: "toggle-vehicle-history" } as const;
  const userDetailMatch = action.match(/^openUserDetail\('([^']+)'\)/);
  if (userDetailMatch)
    return { type: "user-detail", id: userDetailMatch[1] } as const;
  const preparedExitActionMatch = action.match(
    /^openPreparedExitForAction\('(download|upload)'\)/,
  );
  if (preparedExitActionMatch)
    return {
      type: "prepared-exit-action",
      action: preparedExitActionMatch[1] as "download" | "upload",
    } as const;
  const exitDetailMatch = action.match(/^openExitRequestDetail\('([^']+)'\)/);
  if (exitDetailMatch)
    return { type: "exit-detail", id: exitDetailMatch[1] } as const;
  const returnTransferDetailMatch = action.match(
    /^openReturnTransferDetail\('([^']+)'\)/,
  );
  if (returnTransferDetailMatch)
    return {
      type: "return-transfer-detail",
      id: returnTransferDetailMatch[1],
    } as const;
  const materialPrepMatch = action.match(
    /^openMaterialRequestPreparation\('([^']+)'\)/,
  );
  if (materialPrepMatch)
    return { type: "material-request-prep", id: materialPrepMatch[1] } as const;
  const prepareExitMatch = action.match(/^prepareExitFromRequest\('([^']+)'\)/);
  if (prepareExitMatch)
    return {
      type: "prepare-exit-from-request",
      id: prepareExitMatch[1],
    } as const;
  const downloadPreparedPdfMatch = action.match(
    /^downloadPreparedMaterialPdf\('([^']+)'\)/,
  );
  if (downloadPreparedPdfMatch)
    return {
      type: "download-prepared-material-pdf",
      id: downloadPreparedPdfMatch[1],
    } as const;
  const uploadProofMatch = action.match(
    /^uploadSignedMaterialProof\('([^']+)'\)/,
  );
  if (uploadProofMatch)
    return {
      type: "upload-signed-material-proof",
      id: uploadProofMatch[1],
    } as const;
  const viewProofMatch = action.match(/^viewSignedMaterialProof\('([^']+)'\)/);
  if (viewProofMatch)
    return {
      type: "view-signed-material-proof",
      id: viewProofMatch[1],
    } as const;
  const rejectExitRequestMatch = action.match(
    /^openExitRequestRejection\('([^']+)'\)/,
  );
  if (rejectExitRequestMatch)
    return {
      type: "open-exit-request-rejection",
      id: rejectExitRequestMatch[1],
    } as const;
  if (action === "submitExitRequestRejection")
    return { type: "submit-exit-request-rejection" } as const;
  const vehicleDetailMatch = action.match(/^openVehicleDetail\('([^']+)'\)/);
  if (vehicleDetailMatch)
    return { type: "vehicle-detail", id: vehicleDetailMatch[1] } as const;
  const entryDetailMatch = action.match(/^openEntryDetail\('([^']+)'\)/);
  if (entryDetailMatch)
    return { type: "entry-detail", id: entryDetailMatch[1] } as const;
  const historyMovementDetailMatch = action.match(
    /^openHistoryMovementDetail\('([^']+)'\)/,
  );
  if (historyMovementDetailMatch)
    return { type: "history-movement-detail", id: historyMovementDetailMatch[1] } as const;
  const downloadEntryPdfMatch = action.match(/^downloadEntryPdf\('([^']+)'\)/);
  if (downloadEntryPdfMatch)
    return { type: "download-entry-pdf", id: downloadEntryPdfMatch[1] } as const;
  const uploadEntryProofMatch = action.match(
    /^uploadSignedEntryProof\('([^']+)'\)/,
  );
  if (uploadEntryProofMatch)
    return { type: "upload-signed-entry-proof", id: uploadEntryProofMatch[1] } as const;
  const viewEntryProofMatch = action.match(/^viewSignedEntryProof\('([^']+)'\)/);
  if (viewEntryProofMatch)
    return { type: "view-signed-entry-proof", id: viewEntryProofMatch[1] } as const;
  const downloadReturnPdfMatch = action.match(/^downloadReturnPdf\('([^']+)'\)/);
  if (downloadReturnPdfMatch)
    return { type: "download-return-pdf", id: downloadReturnPdfMatch[1] } as const;
  const downloadTransferPdfMatch = action.match(/^downloadTransferPdf\('([^']+)'\)/);
  if (downloadTransferPdfMatch)
    return { type: "download-transfer-pdf", id: downloadTransferPdfMatch[1] } as const;
  const uploadReturnProofMatch = action.match(
    /^uploadSignedReturnProof\('([^']+)'\)/,
  );
  if (uploadReturnProofMatch)
    return { type: "upload-signed-return-proof", id: uploadReturnProofMatch[1] } as const;
  const uploadTransferProofMatch = action.match(
    /^uploadSignedTransferProof\('([^']+)'\)/,
  );
  if (uploadTransferProofMatch)
    return { type: "upload-signed-transfer-proof", id: uploadTransferProofMatch[1] } as const;
  const viewReturnProofMatch = action.match(/^viewSignedReturnProof\('([^']+)'\)/);
  if (viewReturnProofMatch)
    return { type: "view-signed-return-proof", id: viewReturnProofMatch[1] } as const;
  const viewTransferProofMatch = action.match(/^viewSignedTransferProof\('([^']+)'\)/);
  if (viewTransferProofMatch)
    return { type: "view-signed-transfer-proof", id: viewTransferProofMatch[1] } as const;
  const equipmentDetailMatch = action.match(
    /^openEquipmentDetail\('([^']+)'\)/,
  );
  if (equipmentDetailMatch)
    return { type: "equipment-detail", id: equipmentDetailMatch[1] } as const;
  const stockDrawerMatch = action.match(/^openStockDrawer\('([^']+)'\)/);
  if (stockDrawerMatch)
    return { type: "stock-drawer-open", id: stockDrawerMatch[1] } as const;
  const inventoryDetailMatch = action.match(
    /^openInventoryDetail\('([^']+)','([^']+)'\)/,
  );
  if (inventoryDetailMatch)
    return {
      type: "inventory-detail-open",
      articleId: inventoryDetailMatch[1],
      locationId: inventoryDetailMatch[2],
    } as const;
  const inventoryGlobalDetailMatch = action.match(
    /^openInventoryGlobalDetail\('([^']+)'\)/,
  );
  if (inventoryGlobalDetailMatch)
    return {
      type: "inventory-global-detail-open",
      articleId: inventoryGlobalDetailMatch[1],
    } as const;
  if (action === "closeStockDrawer")
    return { type: "stock-drawer-close" } as const;
  if (action === "refreshStockDrawer")
    return { type: "stock-drawer-refresh" } as const;
  const stockSortMatch = action.match(/^sortStock\('([^']+)'\)/);
  if (stockSortMatch)
    return { type: "stock-sort", key: stockSortMatch[1] } as const;
  const stockExcelMatch = action.match(/^downloadStockExcel\('(location|global)'\)/);
  if (stockExcelMatch)
    return {
      type: "download-stock-excel",
      scope: stockExcelMatch[1] as StockExportScope,
    } as const;
  const stockPdfMatch = action.match(/^downloadStockPdf\('(location|global)'\)/);
  if (stockPdfMatch)
    return {
      type: "download-stock-pdf",
      scope: stockPdfMatch[1] as StockExportScope,
    } as const;
  const inventoryExcelMatch = action.match(
    /^downloadInventoryExcel\('(location|global)'\)/,
  );
  if (inventoryExcelMatch)
    return {
      type: "download-inventory-excel",
      scope: inventoryExcelMatch[1] as InventoryExportScope,
    } as const;
  const inventoryPdfMatch = action.match(
    /^downloadInventoryPdf\('(location|global)'\)/,
  );
  if (inventoryPdfMatch)
    return {
      type: "download-inventory-pdf",
      scope: inventoryPdfMatch[1] as InventoryExportScope,
    } as const;
  const refMatch = action.match(/^showRef\('([^']+)'/);
  if (refMatch) return { type: "ref", id: refMatch[1] } as const;
  if (action === "installPwa") return { type: "install-pwa" } as const;
  return { type: "unknown" } as const;
}
