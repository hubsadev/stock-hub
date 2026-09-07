import type { parseAction } from "./actions";
import type {
  InventoryExportScope,
  StockExportScope,
} from "../types/export";

type ParsedAction = ReturnType<typeof parseAction>;
type RootHandler = (root: HTMLElement) => void | Promise<void>;
type TargetHandler = (
  root: HTMLElement,
  target: HTMLElement,
) => void | Promise<void>;
type IdHandler = (root: HTMLElement, id: string) => void | Promise<void>;
type IdTargetHandler = (
  root: HTMLElement,
  id: string,
  target: HTMLElement,
) => void | Promise<void>;

export type DispatchActionContext = {
  toggleFloatingExitActions: IdTargetHandler;
  closeFloatingExitActions: RootHandler;
  installPwa: RootHandler;
  requireOnlineAction: (root: HTMLElement, actionType: string) => boolean;
  navigateToView: IdTargetHandler;
  openModal: IdHandler;
  closeModal: IdHandler;
  downloadArticleImportTemplate: RootHandler;
  downloadReferentialTemplate: RootHandler;
  importArticles: RootHandler;
  importReferentialElements: RootHandler;
  downloadInventoryImportTemplate: RootHandler;
  importInventoryRows: RootHandler;
  populateCountModal: (
    root: HTMLElement,
    articleId: string,
    locationId: string,
  ) => void | Promise<void>;
  togglePassword: RootHandler;
  toggleUserPassword: RootHandler;
  login: RootHandler;
  logout: RootHandler;
  showRef: IdTargetHandler;
  openReferentialDetail: (
    root: HTMLElement,
    refType: string,
    id: string,
  ) => void | Promise<void>;
  showToast: (root: HTMLElement, message: string) => void;
  submitReferential: RootHandler;
  submitQuickArticle: RootHandler;
  editReferentialDetail: RootHandler;
  cancelReferentialEdit: RootHandler;
  submitReferentialEdit: RootHandler;
  deactivateReferentialDetail: RootHandler;
  submitStockEntry: RootHandler;
  openEntryResolution: RootHandler;
  submitEntryResolution: RootHandler;
  addEntryLine: RootHandler;
  removeEntryLine: TargetHandler;
  submitExitRequest: RootHandler;
  submitMaterialRequestPreparation: RootHandler;
  downloadMaterialRequestPdf: RootHandler;
  addMaterialRequestLine: RootHandler;
  removeMaterialRequestLine: TargetHandler;
  submitDirectExit: RootHandler;
  submitStockReturn: RootHandler;
  submitStockTransfer: RootHandler;
  addReturnLine: RootHandler;
  removeReturnLine: TargetHandler;
  openReturnControl: RootHandler;
  submitReturnControl: RootHandler;
  addTransferLine: RootHandler;
  removeTransferLine: TargetHandler;
  submitInventoryCount: RootHandler;
  submitEquipmentAssignment: RootHandler;
  submitEquipmentCreation: RootHandler;
  editEquipmentDetail: RootHandler;
  cancelEquipmentEdit: RootHandler;
  submitEquipmentEdit: RootHandler;
  unassignSelectedEquipment: RootHandler;
  submitVehicle: RootHandler;
  editVehicleDetail: RootHandler;
  changeVehicleDriver: RootHandler;
  cancelVehicleEdit: RootHandler;
  submitVehicleEdit: RootHandler;
  setVehicleMaintenance: RootHandler;
  submitUser: RootHandler;
  submitProfile: RootHandler;
  submitPasswordChange: RootHandler;
  openUserDetail: IdHandler;
  openExitRequestDetail: IdHandler;
  openReturnTransferDetail: IdHandler;
  openPreparedExitForAction: (
    root: HTMLElement,
    action: "download" | "upload",
  ) => void | Promise<void>;
  openMaterialRequestPreparation: IdHandler;
  prepareExitFromRequest: IdHandler;
  downloadPreparedMaterialPdf: IdHandler;
  uploadSignedMaterialProof: IdHandler;
  viewSignedMaterialProof: IdHandler;
  openExitRequestRejection: IdHandler;
  submitExitRequestRejection: RootHandler;
  openVehicleDetail: IdHandler;
  openEntryDetail: IdHandler;
  openHistoryMovementDrawer: IdHandler;
  downloadEntryPdf: IdHandler;
  uploadSignedEntryProof: IdHandler;
  viewSignedEntryProof: IdHandler;
  downloadReturnPdf: IdHandler;
  downloadTransferPdf: IdHandler;
  uploadSignedReturnProof: IdHandler;
  uploadSignedTransferProof: IdHandler;
  viewSignedReturnProof: IdHandler;
  viewSignedTransferProof: IdHandler;
  openEquipmentDetail: IdHandler;
  toggleVehicleHistory: RootHandler;
  setExitFilter: (root: HTMLElement, filter: string) => void;
  setEntryFilter: (root: HTMLElement, filter: string) => void;
  setVehicleFilter: (root: HTMLElement, filter: string) => void;
  setAuditFilter: (root: HTMLElement, filter: string) => void;
  showAuditTab: IdTargetHandler;
  openAuditAlertDetail: IdHandler;
  openAuditLogDetail: IdHandler;
  setAuditLogDateRange: (root: HTMLElement, range: string) => void;
  toggleAuditLogDay: (root: HTMLElement, dayKey: string) => void;
  renderHistory: RootHandler;
  setHistoryProofFilter: (
    root: HTMLElement,
    filter: "ALL" | "MISSING",
  ) => void;
  exportData: (root: HTMLElement, kind: string) => void | Promise<void>;
  downloadStockExcel: (
    root: HTMLElement,
    scope: StockExportScope,
  ) => void | Promise<void>;
  downloadStockPdf: (
    root: HTMLElement,
    scope: StockExportScope,
  ) => void | Promise<void>;
  downloadInventoryExcel: (
    root: HTMLElement,
    scope: InventoryExportScope,
  ) => void | Promise<void>;
  downloadInventoryPdf: (
    root: HTMLElement,
    scope: InventoryExportScope,
  ) => void | Promise<void>;
  renderStock: RootHandler;
  openStockDrawer: IdHandler;
  openInventoryDetail: (
    root: HTMLElement,
    articleId: string,
    locationId: string,
  ) => void | Promise<void>;
  openInventoryGlobalDetail: IdHandler;
  closeStockDrawer: RootHandler;
  refreshStockDrawer: RootHandler;
  sortStock: (root: HTMLElement, key: string) => void;
  filterStockByLocation: (root: HTMLElement, id: string) => void;
  showInventoryMode: (root: HTMLElement, mode: string) => void;
  showInventoryLocation: (root: HTMLElement, id: string) => void;
};

export function dispatchAction(
  root: HTMLElement,
  parsed: ParsedAction,
  target: HTMLElement,
  ctx: DispatchActionContext,
) {
  if (parsed.type === "toggle-exit-actions") {
    ctx.toggleFloatingExitActions(root, parsed.id, target);
    return;
  }
  if (parsed.type === "toggle-panel") {
    root
      .querySelector<HTMLElement>(`#${CSS.escape(parsed.id)}`)
      ?.classList.toggle("hidden");
    return;
  }
  ctx.closeFloatingExitActions(root);
  if (parsed.type === "install-pwa") {
    void ctx.installPwa(root);
    return;
  }
  if (!ctx.requireOnlineAction(root, parsed.type)) return;
  if (parsed.type === "view") ctx.navigateToView(root, parsed.id, target);
  if (parsed.type === "open") ctx.openModal(root, parsed.id);
  if (parsed.type === "download-article-import-template")
    (root.querySelector<HTMLSelectElement>("#referentialImportType")?.value ||
      "article") === "article"
      ? ctx.downloadArticleImportTemplate(root)
      : ctx.downloadReferentialTemplate(root);
  if (parsed.type === "import-articles")
    void ((root.querySelector<HTMLSelectElement>("#referentialImportType")
      ?.value || "article") === "article"
      ? ctx.importArticles(root)
      : ctx.importReferentialElements(root));
  if (parsed.type === "download-inventory-import-template")
    ctx.downloadInventoryImportTemplate(root);
  if (parsed.type === "import-inventory-rows")
    void ctx.importInventoryRows(root);
  if (parsed.type === "count") {
    ctx.openModal(root, "countModal");
    void ctx.populateCountModal(root, parsed.articleId, parsed.locationId);
  }
  if (parsed.type === "close") ctx.closeModal(root, parsed.id);
  if (parsed.type === "toggle-password") ctx.togglePassword(root);
  if (parsed.type === "toggle-user-password") ctx.toggleUserPassword(root);
  if (parsed.type === "login") ctx.login(root);
  if (parsed.type === "logout") ctx.logout(root);
  if (parsed.type === "ref") ctx.showRef(root, parsed.id, target);
  if (parsed.type === "ref-detail")
    ctx.openReferentialDetail(root, parsed.refType, parsed.id);
  if (parsed.type === "toast") ctx.showToast(root, parsed.message);
  if (parsed.type === "submit-referential") void ctx.submitReferential(root);
  if (parsed.type === "submit-quick-article") void ctx.submitQuickArticle(root);
  if (parsed.type === "edit-referential-detail")
    ctx.editReferentialDetail(root);
  if (parsed.type === "cancel-referential-edit")
    ctx.cancelReferentialEdit(root);
  if (parsed.type === "submit-referential-edit")
    void ctx.submitReferentialEdit(root);
  if (parsed.type === "deactivate-referential-detail")
    void ctx.deactivateReferentialDetail(root);
  if (parsed.type === "submit-stock-entry") void ctx.submitStockEntry(root);
  if (parsed.type === "open-entry-resolution") ctx.openEntryResolution(root);
  if (parsed.type === "submit-entry-resolution")
    void ctx.submitEntryResolution(root);
  if (parsed.type === "add-entry-line") ctx.addEntryLine(root);
  if (parsed.type === "remove-entry-line") ctx.removeEntryLine(root, target);
  if (parsed.type === "submit-exit-request") void ctx.submitExitRequest(root);
  if (parsed.type === "submit-material-request-preparation")
    void ctx.submitMaterialRequestPreparation(root);
  if (parsed.type === "download-material-request-pdf")
    ctx.downloadMaterialRequestPdf(root);
  if (parsed.type === "add-material-request-line")
    ctx.addMaterialRequestLine(root);
  if (parsed.type === "remove-material-request-line")
    ctx.removeMaterialRequestLine(root, target);
  if (parsed.type === "submit-direct-exit") void ctx.submitDirectExit(root);
  if (parsed.type === "submit-stock-return") void ctx.submitStockReturn(root);
  if (parsed.type === "submit-stock-transfer")
    void ctx.submitStockTransfer(root);
  if (parsed.type === "add-return-line") ctx.addReturnLine(root);
  if (parsed.type === "remove-return-line") ctx.removeReturnLine(root, target);
  if (parsed.type === "open-return-control") ctx.openReturnControl(root);
  if (parsed.type === "submit-return-control")
    void ctx.submitReturnControl(root);
  if (parsed.type === "add-transfer-line") ctx.addTransferLine(root);
  if (parsed.type === "remove-transfer-line")
    ctx.removeTransferLine(root, target);
  if (parsed.type === "submit-inventory-count")
    void ctx.submitInventoryCount(root);
  if (parsed.type === "submit-equipment-assignment")
    void ctx.submitEquipmentAssignment(root);
  if (parsed.type === "submit-equipment-creation")
    void ctx.submitEquipmentCreation(root);
  if (parsed.type === "edit-equipment-detail") ctx.editEquipmentDetail(root);
  if (parsed.type === "cancel-equipment-edit") ctx.cancelEquipmentEdit(root);
  if (parsed.type === "submit-equipment-edit")
    void ctx.submitEquipmentEdit(root);
  if (parsed.type === "unassign-equipment")
    void ctx.unassignSelectedEquipment(root);
  if (parsed.type === "submit-vehicle") void ctx.submitVehicle(root);
  if (parsed.type === "edit-vehicle-detail") ctx.editVehicleDetail(root);
  if (parsed.type === "change-vehicle-driver") ctx.changeVehicleDriver(root);
  if (parsed.type === "cancel-vehicle-edit") ctx.cancelVehicleEdit(root);
  if (parsed.type === "submit-vehicle-edit") void ctx.submitVehicleEdit(root);
  if (parsed.type === "set-vehicle-maintenance")
    void ctx.setVehicleMaintenance(root);
  if (parsed.type === "submit-user") void ctx.submitUser(root);
  if (parsed.type === "submit-profile") void ctx.submitProfile(root);
  if (parsed.type === "submit-password-change")
    void ctx.submitPasswordChange(root);
  if (parsed.type === "user-detail") ctx.openUserDetail(root, parsed.id);
  if (parsed.type === "exit-detail") ctx.openExitRequestDetail(root, parsed.id);
  if (parsed.type === "return-transfer-detail")
    ctx.openReturnTransferDetail(root, parsed.id);
  if (parsed.type === "prepared-exit-action")
    ctx.openPreparedExitForAction(root, parsed.action);
  if (parsed.type === "material-request-prep")
    ctx.openMaterialRequestPreparation(root, parsed.id);
  if (parsed.type === "prepare-exit-from-request")
    void ctx.prepareExitFromRequest(root, parsed.id);
  if (parsed.type === "download-prepared-material-pdf")
    ctx.downloadPreparedMaterialPdf(root, parsed.id);
  if (parsed.type === "upload-signed-material-proof")
    void ctx.uploadSignedMaterialProof(root, parsed.id);
  if (parsed.type === "view-signed-material-proof")
    void ctx.viewSignedMaterialProof(root, parsed.id);
  if (parsed.type === "open-exit-request-rejection")
    ctx.openExitRequestRejection(root, parsed.id);
  if (parsed.type === "submit-exit-request-rejection")
    void ctx.submitExitRequestRejection(root);
  if (parsed.type === "vehicle-detail") ctx.openVehicleDetail(root, parsed.id);
  if (parsed.type === "entry-detail") ctx.openEntryDetail(root, parsed.id);
  if (parsed.type === "history-movement-detail")
    ctx.openHistoryMovementDrawer(root, parsed.id);
  if (parsed.type === "download-entry-pdf") ctx.downloadEntryPdf(root, parsed.id);
  if (parsed.type === "upload-signed-entry-proof")
    void ctx.uploadSignedEntryProof(root, parsed.id);
  if (parsed.type === "view-signed-entry-proof")
    void ctx.viewSignedEntryProof(root, parsed.id);
  if (parsed.type === "download-return-pdf")
    ctx.downloadReturnPdf(root, parsed.id);
  if (parsed.type === "download-transfer-pdf")
    ctx.downloadTransferPdf(root, parsed.id);
  if (parsed.type === "upload-signed-return-proof")
    void ctx.uploadSignedReturnProof(root, parsed.id);
  if (parsed.type === "upload-signed-transfer-proof")
    void ctx.uploadSignedTransferProof(root, parsed.id);
  if (parsed.type === "view-signed-return-proof")
    void ctx.viewSignedReturnProof(root, parsed.id);
  if (parsed.type === "view-signed-transfer-proof")
    void ctx.viewSignedTransferProof(root, parsed.id);
  if (parsed.type === "equipment-detail") ctx.openEquipmentDetail(root, parsed.id);
  if (parsed.type === "toggle-vehicle-history") ctx.toggleVehicleHistory(root);
  if (parsed.type === "exit-filter") ctx.setExitFilter(root, parsed.filter);
  if (parsed.type === "entry-filter") ctx.setEntryFilter(root, parsed.filter);
  if (parsed.type === "vehicle-filter") ctx.setVehicleFilter(root, parsed.filter);
  if (parsed.type === "audit-filter") ctx.setAuditFilter(root, parsed.filter);
  if (parsed.type === "audit-tab") ctx.showAuditTab(root, parsed.id, target);
  if (parsed.type === "audit-alert-detail")
    ctx.openAuditAlertDetail(root, parsed.id);
  if (parsed.type === "audit-log-detail") ctx.openAuditLogDetail(root, parsed.id);
  if (parsed.type === "audit-log-date-range")
    ctx.setAuditLogDateRange(root, parsed.range);
  if (parsed.type === "audit-log-day")
    ctx.toggleAuditLogDay(root, parsed.dayKey);
  if (parsed.type === "refresh-history") ctx.renderHistory(root);
  if (parsed.type === "history-proof-filter")
    ctx.setHistoryProofFilter(root, parsed.filter);
  if (parsed.type === "export") ctx.exportData(root, parsed.kind);
  if (parsed.type === "download-stock-excel")
    void ctx.downloadStockExcel(root, parsed.scope);
  if (parsed.type === "download-stock-pdf")
    ctx.downloadStockPdf(root, parsed.scope);
  if (parsed.type === "download-inventory-excel")
    void ctx.downloadInventoryExcel(root, parsed.scope);
  if (parsed.type === "download-inventory-pdf")
    ctx.downloadInventoryPdf(root, parsed.scope);
  if (parsed.type === "stock-filter") ctx.renderStock(root);
  if (parsed.type === "stock-drawer-open") ctx.openStockDrawer(root, parsed.id);
  if (parsed.type === "inventory-detail-open")
    ctx.openInventoryDetail(root, parsed.articleId, parsed.locationId);
  if (parsed.type === "inventory-global-detail-open")
    ctx.openInventoryGlobalDetail(root, parsed.articleId);
  if (parsed.type === "stock-drawer-close") ctx.closeStockDrawer(root);
  if (parsed.type === "stock-drawer-refresh") ctx.refreshStockDrawer(root);
  if (parsed.type === "stock-sort") ctx.sortStock(root, parsed.key);
  if (parsed.type === "stock-location")
    ctx.filterStockByLocation(root, parsed.id);
  if (parsed.type === "inventory-mode")
    ctx.showInventoryMode(root, parsed.mode);
  if (parsed.type === "inventory-location")
    ctx.showInventoryLocation(root, parsed.id);
}
