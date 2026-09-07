import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { StockHubShell } from "./components/StockHubShell";
import { parseAction } from "./app/actions";
import {
  closeModalPage,
  openModalPage,
  prepareTemplateActionsPage,
  type ModalControllerContext,
} from "./app/modals";
import {
  updateApiBackedViewsPage,
  type DataRefreshContext,
} from "./app/data-refresh";
import {
  auditActionLabelPage,
  auditAlertDomainPage,
  auditDocumentLabelPage,
  auditLogResultLabelPage,
  auditLogResultPage,
  auditLogUserLabelPage,
  openAuditAlertDetailPage,
  openAuditLogDetailPage,
  renderAuditAlertsPage,
  renderAuditLogsPage,
  setAuditAlertFilterPage,
  setAuditCardValuePage,
  setAuditLogDateRangePage,
  showAuditTabPage,
  toggleAuditLogDayPage,
  type AuditAlertesContext,
} from "./pages/audit-alertes/render";
import {
  renderDashboardAuditAlertsPage,
  renderDashboardAuditLogCountPage,
  renderDashboardPendingExitRequestsPage,
  renderDashboardWatchStockPage,
  setCardValuePage,
  updateDashboardPage,
  type TableauDeBordContext,
} from "./pages/tableau-de-bord/render";
import {
  reapproLevelsPage,
  renderReapproPage,
  reorderQuantityPage,
  type ReapprovisionnementContext,
} from "./pages/reapprovisionnement/render";
import {
  addEntryLinePage,
  cleanEntryLineObservation as cleanEntryLineObservationPage,
  downloadEntryPdfPage,
  entryHasDispute as entryHasDisputePage,
  entryHasPartial as entryHasPartialPage,
  entryIsReceived as entryIsReceivedPage,
  entryMovementTotals as entryMovementTotalsPage,
  entryStatusLabel as entryStatusLabelPage,
  entryStatusTone as entryStatusTonePage,
  movementLinesPreview as movementLinesPreviewPage,
  openEntryDetailPage,
  openEntryResolutionPage,
  populateEntryModalPage,
  removeEntryLinePage,
  renderEntriesRegistryPage,
  selectArticleInEntryPage,
  setEntryFilter as setEntryFilterPage,
  submitEntryResolutionPage,
  submitStockEntryPage,
  uploadSignedEntryProofPage,
  viewSignedEntryProofPage,
  type EntreesStockContext,
} from "./pages/entrees-stock/render";
import {
  addMaterialRequestLinePage,
  closeFloatingExitActionsPage,
  downloadPreparedMaterialPdfPage,
  materialPdfLinkedExitPage,
  materialPdfMovementPage,
  openExitRequestDetailPage,
  openExitRequestRejectionPage,
  openMaterialRequestPreparationPage,
  openPreparedExitForActionPage,
  populateExitModalsPage,
  prepareExitFromRequestPage,
  refreshMaterialRequestLinesPage,
  removeMaterialRequestLinePage,
  renderExitRegistryPage,
  renderExitRequestDetailPage,
  setExitFilter as setExitFilterPage,
  setMaterialRequestModePage,
  submitDirectExitPage,
  submitExitRequestPage,
  submitExitRequestRejectionPage,
  submitMaterialRequestPreparationPage,
  syncMaterialPreparationStatePage,
  toggleFloatingExitActionsPage,
  uploadSignedMaterialProofPage,
  viewSignedMaterialProofPage,
  visibleExitMovementsPage,
  type SortiesStockContext,
} from "./pages/sorties-stock/render";
import {
  addReturnLinePage,
  addTransferLinePage,
  downloadReturnPdfPage,
  downloadTransferPdfPage,
  openReturnControlPage,
  openReturnTransferDetailPage,
  populateReturnTransferModalsPage,
  removeReturnLinePage,
  removeTransferLinePage,
  renderReturnTransferRegistryPage,
  returnedQuantityForSourcePage,
  returnSourceLinesPage,
  submitReturnControlPage,
  submitStockReturnPage,
  submitStockTransferPage,
  uploadSignedReturnProofPage,
  uploadSignedTransferProofPage,
  viewSignedReturnProofPage,
  viewSignedTransferProofPage,
  type RetoursTransfertsContext,
} from "./pages/retours-transferts/render";
import {
  clearHistoryMovementDrawerPage,
  filteredHistoryPage,
  hasOpenHistoryMovementDrawerPage,
  historyMovementActorLabelPage,
  openHistoryMovementDrawerPage,
  renderHistoryMovementDrawerPage,
  renderHistoryPage,
  setHistoryProofFilterPage,
  type HistoriqueContext,
} from "./pages/historique/render";
import {
  allInventoryComputedLinesPage,
  clearInventoryDrawerStatePage,
  downloadInventoryExcelPage,
  downloadInventoryImportTemplatePage,
  downloadInventoryPdfPage,
  hasOpenInventoryDrawerPage,
  importInventoryRowsPage,
  inventoryComputedLinesForLocationPage,
  inventoryGlobalExportRowsPage,
  openInventoryCountPage,
  openInventoryDetailPage,
  openInventoryGlobalDetailPage,
  prepareInventoryExportModalPage,
  readInventoryImportFilePage,
  renderInventoryDrawerPage,
  renderInventoryPage,
  resetInventoryImportPage,
  showInventoryModePage,
  submitInventoryCountPage,
  updateInventoryImportCellPage,
  type InventaireStockContext,
} from "./pages/inventaire-stock/render";
import {
  cancelEquipmentEditPage,
  editEquipmentDetailPage,
  openEquipmentDetailPage,
  openEquipmentEditPage,
  populateEquipmentCreateModalPage,
  populateEquipmentModalPage,
  renderEquipmentDetailPage,
  renderEquipmentsRegistryPage,
  submitEquipmentAssignmentPage,
  submitEquipmentCreationPage,
  submitEquipmentEditPage,
  unassignSelectedEquipmentPage,
  type EquipementsContext,
} from "./pages/equipements/render";
import {
  cancelVehicleEditPage,
  changeVehicleDriverPage,
  editVehicleDetailPage,
  openVehicleDetailPage,
  openVehicleEditPage,
  prepareVehicleModalPage,
  renderVehicleDetailPage,
  renderVehiclesPage,
  setVehicleFilterPage,
  setVehicleMaintenancePage,
  submitVehicleEditPage,
  submitVehiclePage,
  toggleVehicleHistoryPage,
  type ParcAutoContext,
} from "./pages/parc-auto/render";
import {
  cancelReferentialEditPage,
  deactivateReferentialDetailPage,
  downloadArticleImportTemplatePage,
  downloadReferentialTemplatePage,
  editReferentialDetailPage,
  importArticlesPage,
  importReferentialElementsPage,
  openReferentialDetailPage,
  populateQuickArticleModalPage,
  readArticleImportFilePage,
  readReferentialImportFilePage,
  renderReferentialsRegistryPage,
  renderReferentialDetailPage,
  resetReferentialImportPage,
  setReferentialImportTypePage,
  showRefPage,
  submitQuickArticlePage,
  submitReferentialEditPage,
  submitReferentialPage,
  updateImportCellPage,
  updateReferentialFormPage,
  type ReferentielsContext,
} from "./pages/referentiels/render";
import {
  clearVueStockDrawerState,
  downloadStockExcel as downloadVueStockExcel,
  downloadStockPdf as downloadVueStockPdf,
  openStockDrawer as openVueStockDrawer,
  populateStockFilters as populateVueStockFilters,
  prepareStockExportModal as prepareVueStockExportModal,
  renderStock as renderVueStock,
  renderStockDrawer as renderVueStockDrawer,
  sortStock as sortVueStock,
  stockExportDataset as vueStockExportDataset,
  stockGlobalExportRows as vueStockGlobalExportRows,
  stockLocationExportRows as vueStockLocationExportRows,
  type VueStockContext,
} from "./pages/vue-stock/render";
import {
  DEFAULT_ROUTE,
  LOGIN_ROUTE,
  VIEW_ROUTES,
  navButtonForView,
  normalizeRoute,
  viewForRoute,
  writeLoginRoute,
  writeRoute,
} from "./router/routes";
import {
  openUserDetailPage,
  renderUsersListPage,
  resetUserModalPage,
  submitUserPage,
  toggleUserPasswordPage,
  type UtilisateursRolesContext,
} from "./pages/utilisateurs-roles/render";
import {
  hideLoginPage,
  loginPage,
  logoutPage,
  readStoredUserPage,
  setLoginErrorPage,
  showLoginPage,
  togglePasswordPage,
  type LoginContext,
} from "./pages/login/render";
import {
  profileRoleBadgePage,
  submitPasswordChangePage,
  submitProfilePage,
  syncCurrentUserPage,
  updateProfileViewPage,
  type ProfilContext,
} from "./pages/profil/render";
import {
  canAccessView as canAccessViewForUser,
  canPrepareMaterialRequests as canPrepareMaterialRequestsForUser,
  hasRole as userHasRole,
  rolePriority,
} from "./services/permissions";
import {
  initialQuantityForLevel as computeInitialQuantityForLevel,
  stockAvailableFor as computeStockAvailableFor,
  stockInitialForLevel as computeStockInitialForLevel,
  stockLastMovementDate as computeStockLastMovementDate,
  stockMovementMetrics as computeStockMovementMetrics,
  stockStatusCategory,
} from "./services/stock-logic";
import {
  hasCommonArticle as movementHasCommonArticle,
  linkedExitForRequestFromMovements,
  looksLikeGeneratedExit as movementLooksLikeGeneratedExit,
  movementActor as movementActorValue,
  movementArticleKeys as movementArticleKeysValue,
  movementArticleLabel as movementArticleLabelValue,
  movementCompletedTotal as movementCompletedTotalValue,
  movementDateKey as movementDateKeyValue,
  movementPersonKey as movementPersonKeyValue,
  movementProjectKey as movementProjectKeyValue,
  movementQuantity as movementQuantityValue,
  movementRequestedTotal as movementRequestedTotalValue,
  movementStatusLabel as movementStatusLabelValue,
  movementTextKey as movementTextKeyValue,
  movementTypeLabel as movementTypeLabelValue,
  requestForExitFromMovements,
} from "./services/movements";
import {
  canUploadSignedProofFor as canUploadSignedProofForValue,
  movementHasProof as movementHasProofValue,
  movementProofCount as movementProofCountValue,
  movementProofSource as movementProofSourceValue,
  movementProofStatus as movementProofStatusValue,
  movementRequiresSignedProof as movementRequiresSignedProofValue,
  proofRequestForMovement as proofRequestForMovementValue,
} from "./services/proofs";
import {
  excelCellText,
  exportDateValue,
  exportWorkbook,
} from "./services/exports";
import {
  exportDataFromContext,
  exportDatasetFromContext,
  exportRowsFromContext,
  type ExportDatasetsContext,
} from "./services/export-datasets";
import {
  downloadMaterialRequestPdfDocument,
  hubLogoMarkup as hubLogoMarkupDocument,
  materialRequestDocumentHtml as materialRequestDocumentHtmlDocument,
  type MaterialRequestDocumentInput,
} from "./services/documents";
import {
  installPwa,
  requireOnlineAction,
  setupPwa,
  updateProfilePwaCards,
  type PwaContext,
} from "./services/pwa";
import {
  accessLabel as accessLabelService,
  roleLabel as roleLabelService,
  userDisplayName as userDisplayNameService,
  userIdentity as userIdentityService,
  userInitials as userInitialsService,
} from "./services/users";
import type {
  InventoryExportScope,
  StockExportScope,
} from "./types/export";
import type { ReferentialImportType } from "./types/import";
import { selectedText, setText, setVisible } from "./utils/dom";
import {
  articleOptions,
  articleStockAtLocation as formArticleStockAtLocation,
  clientOptions,
  fillSelect,
  locationOptions,
  option,
  projectOptions,
  setProjectSiteOptions as formSetProjectSiteOptions,
  siteOptions,
  sitesForProject as formSitesForProject,
  supplierOptions,
  teamServiceOptions,
  toNumber,
  userOptions as formUserOptions,
} from "./utils/forms";
import { escapeHtml, formatDate, formatNumber, isToday } from "./utils/format";
import {
  actionEye,
  actionEyeFor,
  badge,
  detailCard,
  detailField,
  emptyRow,
  lifecycleFields,
} from "./components/ui/html";
import {
  movementTypeBadge as movementTypeBadgeHtml,
  stockStatus as stockStatusHtml,
  watchStockRow as watchStockRowHtml,
} from "./components/ui/stock-html";
import { showToast as showToastUi } from "./components/ui/toast";
import {
  activateNavButton,
  clearActiveNav,
  setViewActions,
  type ViewActionsContext,
} from "./components/layout/view-actions";
import {
  controlStockReturn,
  createArticle,
  createClient,
  createEmployee,
  createEquipment,
  createExitRequest,
  createInventoryAdjustment,
  createLocation,
  createProject,
  createStockEntry,
  createStockExit,
  createStockReturn,
  createStockTransfer,
  createSupplier,
  createTeamService,
  createUser,
  getArticles,
  getAuditAlerts,
  getAuditLogs,
  getClients,
  getDashboardSummary,
  getEmployees,
  getEquipments,
  getLocations,
  getProjects,
  getStockLevels,
  getStockMovements,
  getSuppliers,
  getTeamServices,
  getUsers,
  getVehicles,
  getEntryProof,
  getExitRequestProof,
  getReturnProof,
  getTransferProof,
  loginUser,
  prepareExitRequest,
  rejectExitRequest,
  resolveStockEntryDispute,
  uploadEntryProof,
  uploadExitRequestProof,
  uploadReturnProof,
  uploadTransferProof,
  createVehicle,
  unassignEquipment,
  updateArticle,
  updateClient,
  updateEmployee,
  updateEquipment,
  updateLocation,
  updateProject,
  updateSupplier,
  updateTeamService,
  updateUser,
  updateVehicle,
  updateMyProfile,
  changeMyPassword,
  type Article,
  type AuditAlert,
  type AuditLog,
  type Client,
  type Employee,
  type Equipment,
  type StockLevel,
  type StockLocation,
  type StockMovement,
  type StockProject,
  type StockUser,
  type Supplier,
  type TeamService,
  type Vehicle,
} from "./api";
import "./template.css";

// ---- Application state ----
let latestMovements: StockMovement[] = [];
let latestAuditAlerts: AuditAlert[] = [];
let latestStockLevels: StockLevel[] = [];
let latestAuditLogs: AuditLog[] = [];
let latestEquipments: Equipment[] = [];
let latestVehicles: Vehicle[] = [];
let latestClients: Client[] = [];
let latestEmployees: Employee[] = [];
let latestTeamServices: TeamService[] = [];
let latestArticles: Article[] = [];
let latestSuppliers: Supplier[] = [];
let latestProjects: StockProject[] = [];
let latestLocations: StockLocation[] = [];
let latestUsers: StockUser[] = [];
let currentUser: StockUser | null = readStoredUser();

// ---- Session and permissions ----
function readStoredUser(): StockUser | null {
  return readStoredUserPage();
}

function userIdentity(user: Pick<StockUser, "identifier" | "email">) {
  return userIdentityService(user);
}

function userDisplayName(
  user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">,
) {
  return userDisplayNameService(user);
}

function setLoginError(root: HTMLElement, message: string | null) {
  return setLoginErrorPage(root, message);
}

function hasRole(role: string) {
  return userHasRole(currentUser, role);
}

function canPrepareMaterialRequests() {
  return canPrepareMaterialRequestsForUser(currentUser);
}

function stockAvailableFor(articleId: string, locationId?: string | null) {
  return computeStockAvailableFor(latestStockLevels, articleId, locationId);
}

function canAccessView(view: string) {
  return canAccessViewForUser(currentUser, view);
}

let pendingRouteAfterLogin = DEFAULT_ROUTE;

// ---- Context builders ----
function loginContext(): LoginContext {
  return {
    loginUser,
    getCurrentUser: () => currentUser,
    setCurrentUser: (user) => {
      currentUser = user;
    },
    getPendingRouteAfterLogin: () => pendingRouteAfterLogin,
    setPendingRouteAfterLogin: (route) => {
      pendingRouteAfterLogin = route;
    },
    updateCurrentUserDisplay,
    applyRoleAccess,
    canAccessView,
    navigateToView,
    viewForRoute,
    writeLoginRoute,
    DEFAULT_ROUTE,
  };
}

function pwaContext(): PwaContext {
  return { showToast };
}

function profilContext(): ProfilContext {
  return {
    currentUser,
    latestUsers,
    setCurrentUser: (user) => {
      currentUser = user;
    },
    setLatestUsers: (users) => {
      latestUsers = users;
    },
    readStoredUser,
    userIdentity,
    userDisplayName,
    userInitials,
    roleLabel,
    accessLabel,
    badge,
    setText,
    showToast,
    updateProfilePwaCards,
    updateCurrentUserDisplay,
    renderUsersList,
    updateMyProfile,
    changeMyPassword,
  };
}

function viewActionsContext(): ViewActionsContext {
  return {
    currentUser,
    hasRole,
  };
}

function modalControllerContext(): ModalControllerContext {
  return {
    prepareStockExportModal,
    prepareInventoryExportModal,
    resetReferentialImport: (root) =>
      resetReferentialImportPage(root, referentielsContext()),
    resetInventoryImport,
    prepareUserModal,
    updateReferentialForm,
    populateQuickArticleModal,
    populateEntryModal,
    setMaterialRequestMode: (root, mode) => setMaterialRequestMode(root, mode),
    populateExitModals,
    populateReturnTransferModals,
    populateEquipmentModal,
    populateEquipmentCreateModal,
  };
}

function dataRefreshContext(): DataRefreshContext {
  return {
    getArticles,
    getSuppliers,
    getClients,
    getTeamServices,
    getEmployees,
    getProjects,
    getLocations,
    getStockMovements,
    getStockLevels,
    getEquipments,
    getVehicles,
    getUsers,
    getAuditAlerts,
    getAuditLogs,
    setLatestArticles: (articles) => {
      latestArticles = articles;
    },
    setLatestSuppliers: (suppliers) => {
      latestSuppliers = suppliers;
    },
    setLatestClients: (clients) => {
      latestClients = clients;
    },
    setLatestTeamServices: (services) => {
      latestTeamServices = services;
    },
    setLatestEmployees: (employees) => {
      latestEmployees = employees;
    },
    setLatestProjects: (projects) => {
      latestProjects = projects;
    },
    setLatestLocations: (locations) => {
      latestLocations = locations;
    },
    setLatestMovements: (movements) => {
      latestMovements = movements;
    },
    setLatestStockLevels: (levels) => {
      latestStockLevels = levels;
    },
    setLatestEquipments: (equipments) => {
      latestEquipments = equipments;
    },
    setLatestUsers: (users) => {
      latestUsers = users;
    },
    setLatestAuditAlerts: (alerts) => {
      latestAuditAlerts = alerts;
    },
    setLatestAuditLogs: (logs) => {
      latestAuditLogs = logs;
    },
    updateDashboard,
    renderReferentialsRegistry,
    renderInventory,
    populateStockFilters,
    renderStock,
    renderEntriesRegistry,
    visibleExitMovements,
    renderDashboardPendingExitRequests: (root, movements) =>
      renderDashboardPendingExitRequestsPage(
        root,
        movements,
        tableauDeBordContext(),
      ),
    renderExitRegistry,
    renderReturnTransferRegistry,
    renderReappro,
    renderEquipmentsRegistry,
    renderVehicles,
    renderUsersList,
    renderAuditLogs,
    renderHistory,
    renderAuditAlerts,
    renderDashboardAuditAlerts: (root, alerts) =>
      renderDashboardAuditAlertsPage(root, alerts, tableauDeBordContext()),
    renderDashboardAuditLogCount: (root, count) =>
      renderDashboardAuditLogCountPage(root, count, tableauDeBordContext()),
    setText,
    isToday,
    createIcons: () => window.lucide?.createIcons(),
  };
}

function exportDatasetsContext(): ExportDatasetsContext {
  return {
    latestStockLevels,
    latestAuditLogs,
    latestMovements,
    inventoryGlobalExportRows,
    reapproLevels,
    reorderQuantity,
    filteredHistory,
    movementTypeLabel,
    movementArticleLabel,
    movementQuantity,
    movementActor,
    auditLogUserLabel,
    auditActionLabel,
    auditDocumentLabel,
    auditLogResult,
    auditLogResultLabel,
    exportDateValue,
    exportWorkbook,
    showToast,
  };
}

// ---- Shell UI ----
function applyRoleAccess(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(".nav-btn[data-view]")
    .forEach((button) => {
      const view = button.dataset.view ?? "";
      button.classList.toggle("hidden", !canAccessView(view));
    });
  root.querySelectorAll<HTMLElement>("aside nav").forEach((nav) => {
    const hasVisibleItem = Array.from(
      nav.querySelectorAll<HTMLElement>(".nav-btn[data-view]"),
    ).some((button) => !button.classList.contains("hidden"));
    nav.classList.toggle("hidden", !hasVisibleItem);
    const title = nav.previousElementSibling;
    if (
      title instanceof HTMLElement &&
      title.classList.contains("uppercase")
    ) {
      title.classList.toggle("hidden", !hasVisibleItem);
    }
  });
}

function updateCurrentUserDisplay(root: HTMLElement) {
  const storedUser = readStoredUser();
  const user = currentUser ?? storedUser;
  if (user) currentUser = user;
  const fullName = user ? userDisplayName(user) : "Utilisateur";
  const primaryRole = user
    ? roleLabel(rolePriority(user.roles))
    : "Non connecte";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
        .trim()
        .toUpperCase() || userIdentity(user).slice(0, 2).toUpperCase()
    : "--";
  const nameNode = root.querySelector<HTMLElement>("#currentUserName");
  const roleNode = root.querySelector<HTMLElement>("#currentUserRole");
  const initialsNodes = root.querySelectorAll<HTMLElement>(
    "#currentUserInitials, #topUserInitials",
  );
  if (nameNode) nameNode.textContent = fullName;
  if (roleNode) roleNode.textContent = primaryRole;
  initialsNodes.forEach((node) => {
    node.textContent = initials;
  });
}
function showLogin(root: HTMLElement) {
  return showLoginPage(root);
}

function hideLogin(root: HTMLElement) {
  return hideLoginPage(root);
}

function setCardValue(
  root: HTMLElement,
  label: string,
  value: number | string,
) {
  return setCardValuePage(root, label, value, tableauDeBordContext());
}

function updateDashboard(root: HTMLElement) {
  return updateDashboardPage(root, tableauDeBordContext());
}

// ---- Feature contexts ----
function tableauDeBordContext(): TableauDeBordContext {
  return {
    latestAuditAlerts,
    latestMovements,
    latestStockLevels,
    getDashboardSummary,
    watchStockRow,
    auditAlertDomain,
    emptyRow,
    setText,
    formatNumber,
    escapeHtml,
  };
}

function reapprovisionnementContext(): ReapprovisionnementContext {
  return {
    latestStockLevels,
    badge,
    emptyRow,
    setText,
    formatNumber,
    escapeHtml,
    renderDashboardWatchStock: (root, levels) =>
      renderDashboardWatchStockPage(root, levels, tableauDeBordContext()),
  };
}

function auditAlertesContext(): AuditAlertesContext {
  return {
    latestAuditAlerts,
    latestAuditLogs,
    latestUsers,
    badge,
    emptyRow,
    detailCard,
    actionEyeFor,
    option,
    openModal,
    showToast,
    articleImportKey,
  };
}

function referentielsContext(): ReferentielsContext {
  return {
    latestStockLevels,
    setLatestStockLevels: (levels) => {
      latestStockLevels = levels;
    },
    latestClients,
    setLatestClients: (clients) => {
      latestClients = clients;
    },
    latestEmployees,
    setLatestEmployees: (employees) => {
      latestEmployees = employees;
    },
    latestTeamServices,
    setLatestTeamServices: (services) => {
      latestTeamServices = services;
    },
    latestArticles,
    setLatestArticles: (articles) => {
      latestArticles = articles;
    },
    latestSuppliers,
    setLatestSuppliers: (suppliers) => {
      latestSuppliers = suppliers;
    },
    latestProjects,
    setLatestProjects: (projects) => {
      latestProjects = projects;
    },
    latestLocations,
    setLatestLocations: (locations) => {
      latestLocations = locations;
    },
    latestUsers,
    badge,
    emptyRow,
    actionEyeFor,
    option,
    fillSelect,
    userOptions,
    projectOptions,
    clientOptions,
    supplierOptions,
    locationOptions,
    userDisplayName,
    toNumber,
    exportWorkbook,
    openModal,
    closeModal,
    showToast,
    updateApiBackedViews,
    populateEntryModal,
    selectArticleInEntry,
    getArticles,
    getSuppliers,
    getLocations,
    getStockLevels,
    createArticle,
    createSupplier,
    createClient,
    createEmployee,
    createLocation,
    createProject,
    createTeamService,
    updateArticle,
    updateSupplier,
    updateClient,
    updateEmployee,
    updateLocation,
    updateProject,
    updateTeamService,
  };
}

function entreesStockContext(): EntreesStockContext {
  return {
    latestMovements,
    setLatestMovements: (movements) => {
      latestMovements = movements;
    },
    latestArticles,
    setLatestArticles: (articles) => {
      latestArticles = articles;
    },
    latestSuppliers,
    setLatestSuppliers: (suppliers) => {
      latestSuppliers = suppliers;
    },
    latestLocations,
    setLatestLocations: (locations) => {
      latestLocations = locations;
    },
    latestStockLevels,
    setLatestStockLevels: (levels) => {
      latestStockLevels = levels;
    },
    currentUser,
    badge,
    emptyRow,
    option,
    fillSelect,
    articleOptions,
    userDisplayName,
    toNumber,
    openModal,
    closeModal,
    showToast,
    updateApiBackedViews,
    hubLogoMarkup,
    getArticles,
    getSuppliers,
    getLocations,
    getUsers,
    getStockMovements,
    getStockLevels,
    createStockEntry,
    resolveStockEntryDispute,
    uploadEntryProof,
    getEntryProof,
  };
}

function sortiesStockContext(): SortiesStockContext {
  return {
    latestMovements,
    setLatestMovements: (movements) => {
      latestMovements = movements;
    },
    latestProjects,
    setLatestProjects: (projects) => {
      latestProjects = projects;
    },
    latestLocations,
    setLatestLocations: (locations) => {
      latestLocations = locations;
    },
    latestClients,
    setLatestClients: (clients) => {
      latestClients = clients;
    },
    latestTeamServices,
    setLatestTeamServices: (services) => {
      latestTeamServices = services;
    },
    latestStockLevels,
    currentUser,
    badge,
    emptyRow,
    option,
    fillSelect,
    articleOptions,
    projectOptions,
    clientOptions,
    teamServiceOptions,
    userOptions,
    setProjectSiteOptions,
    toNumber,
    openModal,
    closeModal,
    showToast,
    updateApiBackedViews,
    stockAvailableFor,
    canPrepareMaterialRequests,
    hasRole,
    looksLikeGeneratedExit,
    linkedExitForRequest,
    movementStatusLabel,
    movementLinesPreview: (movement, mode = "entry") =>
      movementLinesPreview(movement, mode),
    materialRequestDocumentHtml,
    getArticles,
    getProjects,
    getLocations,
    getUsers,
    getClients,
    getTeamServices,
    getStockMovements,
    createExitRequest,
    createStockExit,
    prepareExitRequest,
    rejectExitRequest,
    uploadExitRequestProof,
    getExitRequestProof,
  };
}

function retoursTransfertsContext(): RetoursTransfertsContext {
  return {
    latestMovements,
    setLatestMovements: (movements) => {
      latestMovements = movements;
    },
    latestStockLevels,
    setLatestStockLevels: (levels) => {
      latestStockLevels = levels;
    },
    currentUser,
    badge,
    emptyRow,
    option,
    fillSelect,
    userOptions,
    articleOptions,
    locationOptions,
    actionEyeFor,
    movementLinesPreview: (movement, mode = "entry") =>
      movementLinesPreview(movement, mode),
    hubLogoMarkup,
    toNumber,
    articleStockAtLocation,
    openModal,
    closeModal,
    showToast,
    updateApiBackedViews,
    getArticles,
    getLocations,
    getUsers,
    getStockMovements,
    getStockLevels,
    createStockReturn,
    createStockTransfer,
    controlStockReturn,
    uploadReturnProof,
    uploadTransferProof,
    getReturnProof,
    getTransferProof,
  };
}

function historiqueContext(): HistoriqueContext {
  return {
    latestMovements,
    latestAuditLogs,
    latestUsers,
    badge,
    emptyRow,
    detailCard,
    userInitials,
    clearOtherDrawerStates: () => {
      clearVueStockDrawerState();
      clearInventoryDrawerStatePage();
    },
    movementTypeLabel,
    movementQuantity,
    movementActor,
    movementArticleLabel,
    movementProofSource,
    movementProofCount,
    movementHasProof,
    movementProofStatus,
    linkedExitForRequest,
    requestForExit,
    cleanEntryLineObservation,
    entryStatusLabel,
  };
}

function equipementsContext(): EquipementsContext {
  return {
    latestEquipments,
    setLatestEquipments: (equipments) => {
      latestEquipments = equipments;
    },
    latestArticles,
    setLatestArticles: (articles) => {
      latestArticles = articles;
    },
    latestLocations,
    setLatestLocations: (locations) => {
      latestLocations = locations;
    },
    latestSuppliers,
    setLatestSuppliers: (suppliers) => {
      latestSuppliers = suppliers;
    },
    badge,
    emptyRow,
    option,
    userOptions,
    locationOptions,
    showToast,
    openModal,
    closeModal,
    updateApiBackedViews,
    getArticles,
    getLocations,
    getSuppliers,
    getEquipments,
    getUsers,
    createEquipment,
    updateEquipment,
    unassignEquipment,
  };
}

function parcAutoContext(): ParcAutoContext {
  return {
    latestVehicles,
    setLatestVehicles: (vehicles) => {
      latestVehicles = vehicles;
    },
    badge,
    emptyRow,
    option,
    showToast,
    openModal,
    closeModal,
    updateApiBackedViews,
    createVehicle,
    updateVehicle,
  };
}

function utilisateursRolesContext(): UtilisateursRolesContext {
  return {
    latestUsers,
    setLatestUsers: (users) => {
      latestUsers = users;
    },
    currentUser,
    createUser,
    updateUser,
    getUsers,
    badge,
    emptyRow,
    setText,
    showToast,
    openModal,
    closeModal,
    updateApiBackedViews,
    escapeHtml,
    userIdentity,
    userDisplayName,
    roleLabel,
    accessLabel,
  };
}

function vueStockContext(): VueStockContext {
  return {
    stockLevels: latestStockLevels,
    movements: latestMovements,
    suppliers: latestSuppliers,
    locations: latestLocations,
    badge,
    emptyRow,
    option,
    linkedExitForRequest,
    exportWorkbook,
    excelCellText,
    hubLogoMarkup,
    closeModal,
    showToast,
  };
}

function inventaireStockContext(): InventaireStockContext {
  return {
    latestArticles,
    latestLocations,
    latestStockLevels,
    latestMovements,
    setLatestStockLevels: (levels) => {
      latestStockLevels = levels;
    },
    setLatestMovements: (movements) => {
      latestMovements = movements;
    },
    currentUser,
    createInventoryAdjustment,
    getStockLevels,
    getStockMovements,
    exportWorkbook,
    closeStockDrawer,
    clearVueStockDrawerState,
    clearHistoryMovementDrawerPage,
    openModal,
    closeModal,
    showToast,
    emptyRow,
    badge,
    detailCard,
    fillSelect,
    option,
    setText,
    formatDate,
    formatNumber,
    escapeHtml,
    selectedText,
    articleImportKey,
    articleImportHeaderKey,
    articleImportNumber,
    excelCellText,
    hubLogoMarkup,
    movementTypeBadge,
    updateApiBackedViews,
  };
}

// ---- Page and service wrappers ----
function stockInitialForLevel(level: StockLevel) {
  return computeStockInitialForLevel(level, latestMovements);
}

function stockMovementMetrics(level: StockLevel) {
  return computeStockMovementMetrics(level, latestMovements);
}

function stockLastMovementDate(level: StockLevel): string {
  return computeStockLastMovementDate(level, latestMovements, formatDate);
}

function renderStock(root: HTMLElement) {
  renderVueStock(root, vueStockContext());
}

function populateStockFilters(root: HTMLElement) {
  populateVueStockFilters(root, vueStockContext());
}

// ---- Stock Drawer ----
function openStockDrawer(root: HTMLElement, levelId: string) {
  clearInventoryDrawerStatePage();
  clearHistoryMovementDrawerPage();
  openVueStockDrawer(root, levelId, vueStockContext());
}

function closeStockDrawer(root: HTMLElement) {
  clearVueStockDrawerState();
  clearInventoryDrawerStatePage();
  clearHistoryMovementDrawerPage();
  const drawers = root.querySelectorAll<HTMLElement>(
    "#stockDrawer, .stock-drawer",
  );
  const backdrops = root.querySelectorAll<HTMLElement>("#stockDrawerBackdrop");
  drawers.forEach((drawer) => {
    drawer.classList.remove("translate-x-0");
    drawer.classList.add("translate-x-full");
    drawer.classList.remove("stock-drawer--open");
  });
  backdrops.forEach((backdrop) => backdrop.classList.add("hidden"));
}

function initialQuantityForLevel(
  level: StockLevel,
  movements: StockMovement[],
) {
  return computeInitialQuantityForLevel(level, movements);
}

function renderStockDrawer(root: HTMLElement) {
  renderVueStockDrawer(root, vueStockContext());
}
function stockStatus(level: StockLevel) {
  return stockStatusHtml(level, stockStatusCategory, badge);
}

function movementTypeBadge(type: StockMovement["type"]) {
  return movementTypeBadgeHtml(type);
}

function reapproLevels() {
  return reapproLevelsPage(reapprovisionnementContext());
}

function reorderQuantity(level: StockLevel) {
  return reorderQuantityPage(level, reapprovisionnementContext());
}

function watchStockRow(level: StockLevel) {
  return watchStockRowHtml(level, { stockStatus });
}
function renderReappro(root: HTMLElement) {
  return renderReapproPage(root, reapprovisionnementContext());
}

function renderEquipmentsRegistry(root: HTMLElement, equipments = latestEquipments) {
  return renderEquipmentsRegistryPage(root, equipementsContext(), equipments);
}

async function renderEquipmentDetail(
  root: HTMLElement,
  id: string,
  editing = false,
) {
  return renderEquipmentDetailPage(root, id, editing, equipementsContext());
}

function openEquipmentDetail(root: HTMLElement, id: string) {
  return openEquipmentDetailPage(root, id, equipementsContext());
}

function editEquipmentDetail(root: HTMLElement) {
  return editEquipmentDetailPage(root, equipementsContext());
}

function cancelEquipmentEdit(root: HTMLElement) {
  return cancelEquipmentEditPage(root, equipementsContext());
}

async function openEquipmentEdit(root: HTMLElement) {
  return openEquipmentEditPage(root, equipementsContext());
}

async function submitEquipmentEdit(root: HTMLElement) {
  return submitEquipmentEditPage(root, equipementsContext());
}

async function unassignSelectedEquipment(root: HTMLElement) {
  return unassignSelectedEquipmentPage(root, equipementsContext());
}

async function populateEquipmentModal(root: HTMLElement) {
  return populateEquipmentModalPage(root, equipementsContext());
}

async function populateEquipmentCreateModal(root: HTMLElement) {
  return populateEquipmentCreateModalPage(root, equipementsContext());
}

async function submitEquipmentCreation(root: HTMLElement) {
  return submitEquipmentCreationPage(root, equipementsContext());
}

async function submitEquipmentAssignment(root: HTMLElement) {
  return submitEquipmentAssignmentPage(root, equipementsContext());
}
function movementTypeLabel(type: StockMovement["type"]) {
  return movementTypeLabelValue(type);
}

function movementQuantity(movement: StockMovement) {
  return movementQuantityValue(movement);
}

function movementActor(movement: StockMovement) {
  return movementActorValue(movement);
}

function movementArticleLabel(movement: StockMovement) {
  return movementArticleLabelValue(movement);
}

function movementProofSource(movement: StockMovement) {
  return movementProofSourceValue(movement, proofRequestForMovement(movement));
}

function movementProofCount(movement: StockMovement) {
  return movementProofCountValue(movement, proofRequestForMovement(movement));
}

function movementHasProof(movement: StockMovement) {
  return movementHasProofValue(movement, proofRequestForMovement(movement));
}

function movementRequiresSignedProof(movement: StockMovement) {
  return movementRequiresSignedProofValue(
    movement,
    linkedExitForRequest(movement),
  );
}

function movementProofStatus(movement: StockMovement) {
  return movementProofStatusValue(
    movement,
    linkedExitForRequest(movement),
    proofRequestForMovement(movement),
  );
}

function filteredHistory(root: HTMLElement) {
  return filteredHistoryPage(root, historiqueContext());
}

function renderHistory(root: HTMLElement) {
  return renderHistoryPage(root, historiqueContext());
}

function setHistoryProofFilter(root: HTMLElement, filter: "ALL" | "MISSING") {
  return setHistoryProofFilterPage(root, filter, historiqueContext());
}

function historyMovementActorLabel(movement: StockMovement) {
  return historyMovementActorLabelPage(movement, historiqueContext());
}

function openHistoryMovementDrawer(root: HTMLElement, id: string) {
  return openHistoryMovementDrawerPage(root, id, historiqueContext());
}

function renderHistoryMovementDrawer(root: HTMLElement) {
  return renderHistoryMovementDrawerPage(root, historiqueContext());
}

function hasOpenHistoryMovementDrawer() {
  return hasOpenHistoryMovementDrawerPage();
}

// ---- Documents and exports ----
function downloadMaterialRequestPdf(root: HTMLElement) {
  return downloadMaterialRequestPdfDocument(root, {
    showToast,
    selectedText,
    toNumber,
    escapeHtml,
    formatNumber,
  });
}

function hubLogoMarkup() {
  return hubLogoMarkupDocument();
}

function materialRequestDocumentHtml(input: MaterialRequestDocumentInput) {
  return materialRequestDocumentHtmlDocument(input);
}

function cleanEntryLineObservation(value: string | null | undefined) {
  return cleanEntryLineObservationPage(value);
}

function downloadEntryPdf(root: HTMLElement, id: string) {
  return downloadEntryPdfPage(root, id, entreesStockContext());
}

function downloadReturnPdf(root: HTMLElement, id: string) { return downloadReturnPdfPage(root, id, retoursTransfertsContext()); }

function downloadTransferPdf(root: HTMLElement, id: string) { return downloadTransferPdfPage(root, id, retoursTransfertsContext()); }

function renderReturnTransferRegistry(root: HTMLElement, movements = latestMovements) {
  return renderReturnTransferRegistryPage(root, retoursTransfertsContext(), movements);
}

function renderInventory(root: HTMLElement) {
  return renderInventoryPage(root, inventaireStockContext());
}

function showInventoryMode(root: HTMLElement, mode: string) {
  return showInventoryModePage(root, mode, inventaireStockContext());
}

function openInventoryDetail(
  root: HTMLElement,
  articleId: string,
  locationId: string,
) {
  return openInventoryDetailPage(
    root,
    articleId,
    locationId,
    inventaireStockContext(),
  );
}

function openInventoryGlobalDetail(root: HTMLElement, articleId: string) {
  return openInventoryGlobalDetailPage(root, articleId, inventaireStockContext());
}

function renderInventoryDrawer(root: HTMLElement) {
  return renderInventoryDrawerPage(root, inventaireStockContext());
}

function inventoryComputedLinesForLocation(locationId: string) {
  return inventoryComputedLinesForLocationPage(locationId, inventaireStockContext());
}

function allInventoryComputedLines() {
  return allInventoryComputedLinesPage(inventaireStockContext());
}

function inventoryGlobalExportRows(root?: HTMLElement) {
  return inventoryGlobalExportRowsPage(root, inventaireStockContext());
}

function prepareInventoryExportModal(root: HTMLElement) {
  return prepareInventoryExportModalPage(root, inventaireStockContext());
}

async function downloadInventoryExcel(
  root: HTMLElement,
  scope: InventoryExportScope,
) {
  return downloadInventoryExcelPage(root, scope, inventaireStockContext());
}

function downloadInventoryPdf(root: HTMLElement, scope: InventoryExportScope) {
  return downloadInventoryPdfPage(root, scope, inventaireStockContext());
}

async function populateCountModal(
  root: HTMLElement,
  articleId: string,
  locationId: string,
) {
  return openInventoryCountPage(
    root,
    articleId,
    locationId,
    inventaireStockContext(),
  );
}

async function submitInventoryCount(root: HTMLElement) {
  return submitInventoryCountPage(root, inventaireStockContext());
}

async function downloadInventoryImportTemplate(root: HTMLElement) {
  return downloadInventoryImportTemplatePage(root, inventaireStockContext());
}

async function readInventoryImportFile(root: HTMLElement, file: File) {
  return readInventoryImportFilePage(root, file, inventaireStockContext());
}

async function importInventoryRows(root: HTMLElement) {
  return importInventoryRowsPage(root, inventaireStockContext());
}

function resetInventoryImport(root: HTMLElement) {
  return resetInventoryImportPage(root, inventaireStockContext());
}

function updateInventoryImportCell(
  root: HTMLElement,
  rowIndex: number,
  field: string | undefined,
  value: string,
) {
  return updateInventoryImportCellPage(
    root,
    rowIndex,
    field,
    value,
    inventaireStockContext(),
  );
}

function exportDataset(kind: string, root: HTMLElement) {
  return exportDatasetFromContext(kind, root, exportDatasetsContext());
}

function exportRows(kind: string, root: HTMLElement) {
  return exportRowsFromContext(kind, root, exportDatasetsContext());
}

async function exportData(root: HTMLElement, kind: string) {
  return exportDataFromContext(root, kind, exportDatasetsContext());
}

function stockLocationExportRows(root: HTMLElement) {
  return vueStockLocationExportRows(root, vueStockContext());
}

function stockGlobalExportRows() {
  return vueStockGlobalExportRows(vueStockContext());
}

function stockExportDataset(root: HTMLElement, scope: StockExportScope) {
  return vueStockExportDataset(root, scope, vueStockContext());
}

async function downloadStockExcel(root: HTMLElement, scope: StockExportScope) {
  await downloadVueStockExcel(root, scope, vueStockContext());
}

function downloadStockPdf(root: HTMLElement, scope: StockExportScope) {
  downloadVueStockPdf(root, scope, vueStockContext());
}

function prepareStockExportModal(root: HTMLElement) {
  prepareVueStockExportModal(root, vueStockContext());
}
function movementStatus(movement: StockMovement) {
  if (movement.status === "CANCELLED") return badge("Annulee", "gray");
  return badge(entryStatusLabel(movement), entryStatusTone(movement));
}

function entryStatusLabel(movement: StockMovement) {
  return entryStatusLabelPage(movement);
}

function entryStatusTone(movement: StockMovement) {
  return entryStatusTonePage(movement);
}

function entryMovementTotals(movement: StockMovement) {
  return entryMovementTotalsPage(movement);
}

function entryHasDispute(movement: StockMovement) {
  return entryHasDisputePage(movement);
}

function entryHasPartial(movement: StockMovement) {
  return entryHasPartialPage(movement);
}

function entryIsReceived(movement: StockMovement) {
  return entryIsReceivedPage(movement);
}

function movementLinesPreview(
  movement: StockMovement,
  mode: "entry" | "exit",
) {
  return movementLinesPreviewPage(movement, mode);
}

function renderEntriesRegistry(root: HTMLElement) {
  return renderEntriesRegistryPage(root, entreesStockContext());
}

function openEntryDetail(root: HTMLElement, id: string) {
  return openEntryDetailPage(root, id, entreesStockContext());
}

function openEntryResolution(root: HTMLElement) {
  return openEntryResolutionPage(root, entreesStockContext());
}

async function submitEntryResolution(root: HTMLElement) {
  return submitEntryResolutionPage(root, entreesStockContext());
}

function movementStatusLabel(movement: StockMovement) {
  return movementStatusLabelValue(movement);
}

function movementTextKey(value: string | null | undefined) {
  return movementTextKeyValue(value);
}

function movementDateKey(value: string | null | undefined) {
  return movementDateKeyValue(value);
}

function movementProjectKey(movement: StockMovement) {
  return movementProjectKeyValue(movement);
}

function movementPersonKey(movement: StockMovement) {
  return movementPersonKeyValue(movement);
}

function movementArticleKeys(movement: StockMovement) {
  return movementArticleKeysValue(movement);
}

function movementRequestedTotal(movement: StockMovement) {
  return movementRequestedTotalValue(movement);
}

function movementCompletedTotal(movement: StockMovement) {
  return movementCompletedTotalValue(movement);
}

function hasCommonArticle(left: StockMovement, right: StockMovement) {
  return movementHasCommonArticle(left, right);
}

function looksLikeGeneratedExit(request: StockMovement, exit: StockMovement) {
  return movementLooksLikeGeneratedExit(request, exit);
}

function linkedExitForRequest(movement: StockMovement) {
  return linkedExitForRequestFromMovements(movement, latestMovements);
}

function requestForExit(movement: StockMovement) {
  return requestForExitFromMovements(movement, latestMovements);
}

function materialPdfMovement(movement: StockMovement) { return materialPdfMovementPage(movement, sortiesStockContext()); }

function materialPdfLinkedExit(movement: StockMovement) { return materialPdfLinkedExitPage(movement, sortiesStockContext()); }

function proofRequestForMovement(movement: StockMovement) {
  return proofRequestForMovementValue(movement, requestForExit);
}

function canUploadSignedProofFor(movement: StockMovement) {
  return canUploadSignedProofForValue(
    movement,
    requestForExit,
    linkedExitForRequest,
  );
}

function visibleExitMovements(movements: StockMovement[]) { return visibleExitMovementsPage(movements, sortiesStockContext()); }

function renderExitRegistry(root: HTMLElement) { return renderExitRegistryPage(root, sortiesStockContext()); }

function renderExitRequestDetail(root: HTMLElement, movement: StockMovement) { return renderExitRequestDetailPage(root, movement, sortiesStockContext()); }

function openPreparedExitForAction(root: HTMLElement, action: "download" | "upload") { return openPreparedExitForActionPage(root, action, sortiesStockContext()); }

function openExitRequestDetail(root: HTMLElement, id: string) { return openExitRequestDetailPage(root, id, sortiesStockContext()); }

async function prepareExitFromRequest(root: HTMLElement, id: string) { return prepareExitFromRequestPage(root, id, sortiesStockContext()); }

function closeFloatingExitActions(root: HTMLElement) { return closeFloatingExitActionsPage(root, sortiesStockContext()); }

function toggleFloatingExitActions(root: HTMLElement, movementId: string, trigger: HTMLElement) { return toggleFloatingExitActionsPage(root, movementId, trigger, sortiesStockContext()); }

function openReturnTransferDetail(root: HTMLElement, id: string) { return openReturnTransferDetailPage(root, id, retoursTransfertsContext()); }

function openReturnControl(root: HTMLElement) { return openReturnControlPage(root, retoursTransfertsContext()); }

async function submitReturnControl(root: HTMLElement) { return submitReturnControlPage(root, retoursTransfertsContext()); }

function userOptions(users: StockUser[]) {
  return formUserOptions(users, userDisplayName);
}

function sitesForProject(projectId: string, locations = latestLocations) {
  return formSitesForProject(projectId, locations);
}

function setProjectSiteOptions(
  siteSelect: HTMLSelectElement | undefined,
  projectId: string,
) {
  return formSetProjectSiteOptions(siteSelect, projectId, latestLocations);
}

async function populateEntryModal(root: HTMLElement) {
  return populateEntryModalPage(root, entreesStockContext());
}

function addEntryLine(root: HTMLElement) {
  return addEntryLinePage(root, entreesStockContext());
}

function removeEntryLine(root: HTMLElement, trigger: HTMLElement) {
  return removeEntryLinePage(root, trigger, entreesStockContext());
}

async function populateQuickArticleModal(root: HTMLElement) {
  return populateQuickArticleModalPage(root, referentielsContext());
}

function selectArticleInEntry(root: HTMLElement, articleId: string) {
  return selectArticleInEntryPage(root, articleId, entreesStockContext());
}

async function submitQuickArticle(root: HTMLElement) {
  return submitQuickArticlePage(root, referentielsContext());
}
async function submitStockEntry(root: HTMLElement) {
  return submitStockEntryPage(root, entreesStockContext());
}

async function populateExitModals(root: HTMLElement, modalId: "exitModal" | "directExitModal") { return populateExitModalsPage(root, modalId, sortiesStockContext()); }

function setMaterialRequestMode(root: HTMLElement, mode: "create" | "prepare", movement?: StockMovement) { return setMaterialRequestModePage(root, mode, movement, sortiesStockContext()); }

function syncMaterialPreparationState(root: HTMLElement) { return syncMaterialPreparationStatePage(root, sortiesStockContext()); }

function downloadPreparedMaterialPdf(root: HTMLElement, id: string) { return downloadPreparedMaterialPdfPage(root, id, sortiesStockContext()); }

async function uploadSignedMaterialProof(root: HTMLElement, id: string) { return uploadSignedMaterialProofPage(root, id, sortiesStockContext()); }

async function uploadSignedEntryProof(root: HTMLElement, id: string) {
  return uploadSignedEntryProofPage(root, id, entreesStockContext());
}

async function viewSignedMaterialProof(root: HTMLElement, id: string) { return viewSignedMaterialProofPage(root, id, sortiesStockContext()); }

async function viewSignedEntryProof(root: HTMLElement, id: string) {
  return viewSignedEntryProofPage(root, id, entreesStockContext());
}

async function uploadSignedReturnProof(root: HTMLElement, id: string) { return uploadSignedReturnProofPage(root, id, retoursTransfertsContext()); }

async function uploadSignedTransferProof(root: HTMLElement, id: string) { return uploadSignedTransferProofPage(root, id, retoursTransfertsContext()); }

async function viewSignedReturnProof(root: HTMLElement, id: string) { return viewSignedReturnProofPage(root, id, retoursTransfertsContext()); }

async function viewSignedTransferProof(root: HTMLElement, id: string) { return viewSignedTransferProofPage(root, id, retoursTransfertsContext()); }

function openExitRequestRejection(root: HTMLElement, id: string, reason = "") { return openExitRequestRejectionPage(root, id, reason, sortiesStockContext()); }

async function submitExitRequestRejection(root: HTMLElement) { return submitExitRequestRejectionPage(root, sortiesStockContext()); }

async function openMaterialRequestPreparation(root: HTMLElement, id: string) { return openMaterialRequestPreparationPage(root, id, sortiesStockContext()); }

async function submitMaterialRequestPreparation(root: HTMLElement) { return submitMaterialRequestPreparationPage(root, sortiesStockContext()); }

function addTransferLine(root: HTMLElement) { return addTransferLinePage(root, retoursTransfertsContext()); }

function removeTransferLine(root: HTMLElement, trigger: HTMLElement) { return removeTransferLinePage(root, trigger, retoursTransfertsContext()); }

function refreshMaterialRequestLines(root: HTMLElement) { return refreshMaterialRequestLinesPage(root, sortiesStockContext()); }

function addMaterialRequestLine(root: HTMLElement) { return addMaterialRequestLinePage(root, sortiesStockContext()); }

function removeMaterialRequestLine(root: HTMLElement, trigger: HTMLElement) { return removeMaterialRequestLinePage(root, trigger, sortiesStockContext()); }

async function submitExitRequest(root: HTMLElement) { return submitExitRequestPage(root, sortiesStockContext()); }

async function submitDirectExit(root: HTMLElement) { return submitDirectExitPage(root, sortiesStockContext()); }

function returnSourceLines(source: StockMovement | undefined | null) { return returnSourceLinesPage(source, retoursTransfertsContext()); }

function returnedQuantityForSource(sourceMovementId: string, articleId: string) { return returnedQuantityForSourcePage(sourceMovementId, articleId, retoursTransfertsContext()); }

function addReturnLine(root: HTMLElement) { return addReturnLinePage(root, retoursTransfertsContext()); }

function removeReturnLine(root: HTMLElement, trigger: HTMLElement) { return removeReturnLinePage(root, trigger, retoursTransfertsContext()); }

async function populateReturnTransferModals(root: HTMLElement, modalId: "returnModal" | "transferModal") { return populateReturnTransferModalsPage(root, modalId, retoursTransfertsContext()); }

async function submitStockReturn(root: HTMLElement) { return submitStockReturnPage(root, retoursTransfertsContext()); }

async function submitStockTransfer(root: HTMLElement) { return submitStockTransferPage(root, retoursTransfertsContext()); }

function setAuditCardValue(root: HTMLElement, label: string, value: number | string) {
  return setAuditCardValuePage(root, label, value, auditAlertesContext());
}

function auditAlertDomain(alert: AuditAlert) {
  return auditAlertDomainPage(alert, auditAlertesContext());
}

function renderAuditAlerts(root: HTMLElement) {
  return renderAuditAlertsPage(root, auditAlertesContext());
}

function showAuditTab(root: HTMLElement, tab: string, button?: HTMLElement) {
  return showAuditTabPage(root, tab, button, auditAlertesContext());
}

function auditActionLabel(action: string) {
  return auditActionLabelPage(action, auditAlertesContext());
}

function auditDocumentLabel(log: AuditLog) {
  return auditDocumentLabelPage(log, auditAlertesContext());
}

function auditLogUserLabel(log: AuditLog) {
  return auditLogUserLabelPage(log, auditAlertesContext());
}

function setAuditLogDateRange(root: HTMLElement, range: string) {
  return setAuditLogDateRangePage(root, range, auditAlertesContext());
}

function auditLogResult(log: AuditLog) {
  return auditLogResultPage(log, auditAlertesContext());
}

function renderAuditLogs(root: HTMLElement) {
  return renderAuditLogsPage(root, auditAlertesContext());
}

function toggleAuditLogDay(root: HTMLElement, dayKey: string) {
  return toggleAuditLogDayPage(root, dayKey, auditAlertesContext());
}

function auditLogResultLabel(result: string) {
  return auditLogResultLabelPage(result, auditAlertesContext());
}

function openAuditAlertDetail(root: HTMLElement, id: string) {
  return openAuditAlertDetailPage(root, id, auditAlertesContext());
}

function openAuditLogDetail(root: HTMLElement, id: string) {
  return openAuditLogDetailPage(root, id, auditAlertesContext());
}

function renderVehicles(
  root: HTMLElement,
  vehicles: Vehicle[] = latestVehicles,
) {
  return renderVehiclesPage(root, parcAutoContext(), vehicles);
}

function setVehicleFilter(root: HTMLElement, filter: string) {
  return setVehicleFilterPage(root, filter, parcAutoContext());
}

function prepareVehicleModal(root: HTMLElement) {
  return prepareVehicleModalPage(root, parcAutoContext());
}

async function submitVehicle(root: HTMLElement) {
  return submitVehiclePage(root, parcAutoContext());
}

function renderVehicleDetail(
  root: HTMLElement,
  id: string,
  editing = false,
  focusField?: string,
) {
  return renderVehicleDetailPage(root, id, editing, parcAutoContext(), focusField);
}

function openVehicleDetail(root: HTMLElement, id: string) {
  return openVehicleDetailPage(root, id, parcAutoContext());
}

function editVehicleDetail(root: HTMLElement) {
  return editVehicleDetailPage(root, parcAutoContext());
}

function changeVehicleDriver(root: HTMLElement) {
  return changeVehicleDriverPage(root, parcAutoContext());
}

function cancelVehicleEdit(root: HTMLElement) {
  return cancelVehicleEditPage(root, parcAutoContext());
}

async function setVehicleMaintenance(root: HTMLElement) {
  return setVehicleMaintenancePage(root, parcAutoContext());
}

function toggleVehicleHistory(root: HTMLElement) {
  return toggleVehicleHistoryPage(root, parcAutoContext());
}

async function openVehicleEdit(root: HTMLElement, focusDriver = false) {
  return openVehicleEditPage(root, parcAutoContext(), focusDriver);
}

async function submitVehicleEdit(root: HTMLElement) {
  return submitVehicleEditPage(root, parcAutoContext());
}
function roleLabel(role: string) {
  return roleLabelService(role);
}

function accessLabel(roles: string[]) {
  return accessLabelService(roles);
}

function userInitials(user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">) {
  return userInitialsService(user);
}

function profileRoleBadge(role: string) {
  return profileRoleBadgePage(role, profilContext());
}

function updateProfileView(root: HTMLElement) {
  return updateProfileViewPage(root, profilContext());
}

function syncCurrentUser(root: HTMLElement, user: StockUser) {
  return syncCurrentUserPage(root, user, profilContext());
}

async function submitProfile(root: HTMLElement) {
  return submitProfilePage(root, profilContext());
}

async function submitPasswordChange(root: HTMLElement) {
  return submitPasswordChangePage(root, profilContext());
}

function renderUsersList(root: HTMLElement) {
  return renderUsersListPage(root, utilisateursRolesContext());
}

function renderReferentialsRegistry(root: HTMLElement) {
  return renderReferentialsRegistryPage(root, referentielsContext());
}

function updateApiBackedViews(root: HTMLElement) {
  return updateApiBackedViewsPage(root, dataRefreshContext());
}

// ---- Routing ----
function showView(root: HTMLElement, view: string, navButton?: HTMLElement) {
  closeStockDrawer(root);
  root
    .querySelectorAll(".view")
    .forEach((section) => setVisible(section, section.id === view));
  const activeButton = navButton?.classList.contains("nav-btn")
    ? navButton
    : navButtonForView(root, view);
  if (activeButton?.classList.contains("nav-btn")) {
    clearActiveNav(root);
    activateNavButton(activeButton);
  } else if (view === "profil") {
    clearActiveNav(root);
  }
  const crumb = root.querySelector("#crumbPage");
  const titles: Record<string, string> = {
    home: "Accueil Module",
    referentiels: "Referentiels",
    stock: "Vue Stock",
    equipements: "Equipements",
    parcAuto: "Parc auto",
    entrees: "Entrees stock",
    sortie: "Sorties stock",
    retours: "Retours & transferts",
    reappro: "Reapprovisionnement",
    inventaire: "Inventaire de stock",
    audit: "Audit & alertes",
    historique: "Historique des mouvements",
    users: "Utilisateurs & roles",
    profil: "Mon profil",
  };
  if (crumb) crumb.textContent = titles[view] ?? "Accueil Module";
  setViewActions(root, view, viewActionsContext());
  if (view === "profil") updateProfileView(root);
  window.lucide?.createIcons();
}

function navigateToView(
  root: HTMLElement,
  view: string,
  navButton?: HTMLElement,
  options: { replace?: boolean; skipHistory?: boolean } = {},
) {
  const targetRoute = VIEW_ROUTES[view];
  let targetView = targetRoute ? view : "home";

  if (!currentUser) {
    pendingRouteAfterLogin = targetRoute ?? DEFAULT_ROUTE;
    showLogin(root);
    writeLoginRoute(true);
    return;
  }

  if (!canAccessView(targetView)) {
    showToast(root, "Acces non autorise pour cette page.");
    targetView = "home";
    options.replace = true;
  }

  hideLogin(root);
  showView(
    root,
    targetView,
    navButton ?? navButtonForView(root, targetView) ?? undefined,
  );

  if (!options.skipHistory) {
    writeRoute(targetView, options.replace);
  }
}

function openRoute(
  root: HTMLElement,
  options: { replace?: boolean; skipHistory?: boolean } = {},
) {
  const route = normalizeRoute();

  if (route === LOGIN_ROUTE) {
    if (currentUser) {
      navigateToView(root, "home", undefined, { replace: true });
    } else {
      showLogin(root);
    }
    return;
  }

  const view = viewForRoute(route);
  if (!currentUser) {
    pendingRouteAfterLogin = view ? route : DEFAULT_ROUTE;
    showLogin(root);
    writeLoginRoute(true);
    return;
  }

  if (!view) {
    showToast(root, "Page introuvable. Retour au tableau de bord.");
    navigateToView(root, "home", undefined, { replace: true });
    return;
  }

  navigateToView(root, view, undefined, options);
}

// ---- Modals and actions ----
function showRef(root: HTMLElement, ref: string, button?: HTMLElement) {
  return showRefPage(root, ref, button, referentielsContext());
}

function prepareUserModal(root: HTMLElement) {
  return resetUserModalPage(root);
}

function openUserDetail(root: HTMLElement, id: string) {
  return openUserDetailPage(root, id, utilisateursRolesContext());
}
function articleImportKey(value: unknown) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");
}
function articleImportHeaderKey(value: unknown) {
  return articleImportKey(value).replace(/[^a-z0-9]+/g, "");
}
function articleImportNumber(value: string) {
  return value.trim() === ""
    ? 0
    : Number(value.replace(/\s/g, "").replace(",", "."));
}
async function readArticleImportFile(root: HTMLElement, file: File) {
  return readArticleImportFilePage(root, file, referentielsContext());
}
async function importArticles(root: HTMLElement) {
  return importArticlesPage(root, referentielsContext());
}

async function downloadReferentialTemplate(root: HTMLElement) {
  return downloadReferentialTemplatePage(root, referentielsContext());
}
async function readReferentialImportFile(root: HTMLElement, file: File) {
  return readReferentialImportFilePage(root, file, referentielsContext());
}
async function importReferentialElements(root: HTMLElement) {
  return importReferentialElementsPage(root, referentielsContext());
}

async function downloadArticleImportTemplate(root: HTMLElement) {
  return downloadArticleImportTemplatePage(root, referentielsContext());
}

function openModal(root: HTMLElement, id: string) {
  return openModalPage(root, id, modalControllerContext());
}

function closeModal(root: HTMLElement, id: string) {
  return closeModalPage(root, id);
}

function togglePassword(root: HTMLElement) {
  return togglePasswordPage(root);
}

async function login(root: HTMLElement) {
  return loginPage(root, loginContext());
}

function logout(root: HTMLElement) {
  return logoutPage(root, loginContext());
}

function prepareTemplateActions(root: HTMLElement) {
  return prepareTemplateActionsPage(root);
}

function renderReferentialDetail(root: HTMLElement, type: string, id: string, editing = false) {
  return renderReferentialDetailPage(root, type, id, editing, referentielsContext());
}

function openReferentialDetail(root: HTMLElement, type: string, id: string) {
  return openReferentialDetailPage(root, type, id, referentielsContext());
}

function editReferentialDetail(root: HTMLElement) {
  return editReferentialDetailPage(root, referentielsContext());
}

function cancelReferentialEdit(root: HTMLElement) {
  return cancelReferentialEditPage(root, referentielsContext());
}

async function submitReferentialEdit(root: HTMLElement) {
  return submitReferentialEditPage(root, referentielsContext());
}

async function deactivateReferentialDetail(root: HTMLElement) {
  return deactivateReferentialDetailPage(root, referentielsContext());
}

function updateReferentialForm(root: HTMLElement, type: string) {
  return updateReferentialFormPage(root, type, referentielsContext());
}

function articleStockAtLocation(
  articleId: string,
  locationId: string | null | undefined,
) {
  return formArticleStockAtLocation(latestStockLevels, articleId, locationId);
}

function showToast(
  root: HTMLElement,
  message: string,
  tone: "success" | "error" = "success",
) {
  return showToastUi(root, message, tone);
}

async function submitReferential(root: HTMLElement) {
  return submitReferentialPage(root, referentielsContext());
}

async function submitUser(root: HTMLElement) {
  return submitUserPage(root, utilisateursRolesContext());
}

function toggleUserPassword(root: HTMLElement) {
  return toggleUserPasswordPage(root);
}

// ---- React shell ----
function StockHubTemplate() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    currentUser = readStoredUser();
    if (localStorage.getItem("stock-hub.session") === "1" && currentUser) {
      hideLogin(root);
    } else {
      showLogin(root);
    }
    updateCurrentUserDisplay(root);
    applyRoleAccess(root);
    prepareTemplateActions(root);
    updateReferentialForm(
      root,
      root.querySelector<HTMLSelectElement>("#referentialType")?.value ?? "",
    );
    updateApiBackedViews(root);
    openRoute(root, { replace: true, skipHistory: true });
    window.lucide?.createIcons();
    const cleanupPwa = setupPwa(root, pwaContext());

    const onClick = (event: MouseEvent) => {
      const clicked = event.target as HTMLElement;
      const target = clicked.closest<HTMLElement>("[data-action]");
      if (!target || !root.contains(target)) return;
      const action = target.dataset.action;
      if (!action) return;
      const parsed = parseAction(action);
      if (parsed.type === "toggle-exit-actions") {
        toggleFloatingExitActions(root, parsed.id, target);
        return;
      }
      if (parsed.type === "toggle-panel") {
        root
          .querySelector<HTMLElement>(`#${CSS.escape(parsed.id)}`)
          ?.classList.toggle("hidden");
        return;
      }
      closeFloatingExitActions(root);
      if (parsed.type === "install-pwa") {
        void installPwa(root, pwaContext());
        return;
      }
      if (!requireOnlineAction(root, parsed.type, pwaContext())) return;
      if (parsed.type === "view") navigateToView(root, parsed.id, target);
      if (parsed.type === "open") openModal(root, parsed.id);
      if (parsed.type === "download-article-import-template")
        ((root.querySelector<HTMLSelectElement>("#referentialImportType")
          ?.value as ReferentialImportType) || "article") === "article"
          ? downloadArticleImportTemplate(root)
          : downloadReferentialTemplate(root);
      if (parsed.type === "import-articles")
        void (((root.querySelector<HTMLSelectElement>("#referentialImportType")
          ?.value as ReferentialImportType) || "article") === "article"
          ? importArticles(root)
          : importReferentialElements(root));
      if (parsed.type === "download-inventory-import-template")
        downloadInventoryImportTemplate(root);
      if (parsed.type === "import-inventory-rows")
        void importInventoryRows(root);
      if (parsed.type === "count") {
        openModal(root, "countModal");
        void populateCountModal(root, parsed.articleId, parsed.locationId);
      }
      if (parsed.type === "close") closeModal(root, parsed.id);
      if (parsed.type === "toggle-password") togglePassword(root);
      if (parsed.type === "toggle-user-password") toggleUserPassword(root);
      if (parsed.type === "login") login(root);
      if (parsed.type === "logout") logout(root);
      if (parsed.type === "ref") showRef(root, parsed.id, target);
      if (parsed.type === "ref-detail")
        openReferentialDetail(root, parsed.refType, parsed.id);
      if (parsed.type === "toast") showToast(root, parsed.message);
      if (parsed.type === "submit-referential") void submitReferential(root);
      if (parsed.type === "submit-quick-article") void submitQuickArticle(root);
      if (parsed.type === "edit-referential-detail")
        editReferentialDetail(root);
      if (parsed.type === "cancel-referential-edit")
        cancelReferentialEdit(root);
      if (parsed.type === "submit-referential-edit")
        void submitReferentialEdit(root);
      if (parsed.type === "deactivate-referential-detail")
        void deactivateReferentialDetail(root);
      if (parsed.type === "submit-stock-entry") void submitStockEntry(root);
      if (parsed.type === "open-entry-resolution") openEntryResolution(root);
      if (parsed.type === "submit-entry-resolution")
        void submitEntryResolution(root);
      if (parsed.type === "add-entry-line") addEntryLine(root);
      if (parsed.type === "remove-entry-line") removeEntryLine(root, target);
      if (parsed.type === "submit-exit-request") void submitExitRequest(root);
      if (parsed.type === "submit-material-request-preparation")
        void submitMaterialRequestPreparation(root);
      if (parsed.type === "download-material-request-pdf")
        downloadMaterialRequestPdf(root);
      if (parsed.type === "add-material-request-line")
        addMaterialRequestLine(root);
      if (parsed.type === "remove-material-request-line")
        removeMaterialRequestLine(root, target);
      if (parsed.type === "submit-direct-exit") void submitDirectExit(root);
      if (parsed.type === "submit-stock-return") void submitStockReturn(root);
      if (parsed.type === "submit-stock-transfer")
        void submitStockTransfer(root);
      if (parsed.type === "add-return-line") addReturnLine(root);
      if (parsed.type === "remove-return-line") removeReturnLine(root, target);
      if (parsed.type === "open-return-control") openReturnControl(root);
      if (parsed.type === "submit-return-control")
        void submitReturnControl(root);
      if (parsed.type === "add-transfer-line") addTransferLine(root);
      if (parsed.type === "remove-transfer-line")
        removeTransferLine(root, target);
      if (parsed.type === "submit-inventory-count")
        void submitInventoryCount(root);
      if (parsed.type === "submit-equipment-assignment")
        void submitEquipmentAssignment(root);
      if (parsed.type === "submit-equipment-creation")
        void submitEquipmentCreation(root);
      if (parsed.type === "edit-equipment-detail") editEquipmentDetail(root);
      if (parsed.type === "cancel-equipment-edit") cancelEquipmentEdit(root);
      if (parsed.type === "submit-equipment-edit")
        void submitEquipmentEdit(root);
      if (parsed.type === "unassign-equipment")
        void unassignSelectedEquipment(root);
      if (parsed.type === "submit-vehicle") void submitVehicle(root);
      if (parsed.type === "edit-vehicle-detail") editVehicleDetail(root);
      if (parsed.type === "change-vehicle-driver") changeVehicleDriver(root);
      if (parsed.type === "cancel-vehicle-edit") cancelVehicleEdit(root);
      if (parsed.type === "submit-vehicle-edit") void submitVehicleEdit(root);
      if (parsed.type === "set-vehicle-maintenance")
        void setVehicleMaintenance(root);
      if (parsed.type === "submit-user") void submitUser(root);
      if (parsed.type === "submit-profile") void submitProfile(root);
      if (parsed.type === "submit-password-change")
        void submitPasswordChange(root);
      if (parsed.type === "user-detail") openUserDetail(root, parsed.id);
      if (parsed.type === "exit-detail") openExitRequestDetail(root, parsed.id);
      if (parsed.type === "return-transfer-detail")
        openReturnTransferDetail(root, parsed.id);
      if (parsed.type === "prepared-exit-action")
        openPreparedExitForAction(root, parsed.action);
      if (parsed.type === "material-request-prep")
        openMaterialRequestPreparation(root, parsed.id);
      if (parsed.type === "prepare-exit-from-request")
        void prepareExitFromRequest(root, parsed.id);
      if (parsed.type === "download-prepared-material-pdf")
        downloadPreparedMaterialPdf(root, parsed.id);
      if (parsed.type === "upload-signed-material-proof")
        void uploadSignedMaterialProof(root, parsed.id);
      if (parsed.type === "view-signed-material-proof")
        void viewSignedMaterialProof(root, parsed.id);
      if (parsed.type === "open-exit-request-rejection")
        openExitRequestRejection(root, parsed.id);
      if (parsed.type === "submit-exit-request-rejection")
        void submitExitRequestRejection(root);
      if (parsed.type === "vehicle-detail") openVehicleDetail(root, parsed.id);
      if (parsed.type === "entry-detail") openEntryDetail(root, parsed.id);
      if (parsed.type === "history-movement-detail")
        openHistoryMovementDrawer(root, parsed.id);
      if (parsed.type === "download-entry-pdf")
        downloadEntryPdf(root, parsed.id);
      if (parsed.type === "upload-signed-entry-proof")
        void uploadSignedEntryProof(root, parsed.id);
      if (parsed.type === "view-signed-entry-proof")
        void viewSignedEntryProof(root, parsed.id);
      if (parsed.type === "download-return-pdf")
        downloadReturnPdf(root, parsed.id);
      if (parsed.type === "download-transfer-pdf")
        downloadTransferPdf(root, parsed.id);
      if (parsed.type === "upload-signed-return-proof")
        void uploadSignedReturnProof(root, parsed.id);
      if (parsed.type === "upload-signed-transfer-proof")
        void uploadSignedTransferProof(root, parsed.id);
      if (parsed.type === "view-signed-return-proof")
        void viewSignedReturnProof(root, parsed.id);
      if (parsed.type === "view-signed-transfer-proof")
        void viewSignedTransferProof(root, parsed.id);
      if (parsed.type === "equipment-detail")
        openEquipmentDetail(root, parsed.id);
      if (parsed.type === "toggle-vehicle-history") toggleVehicleHistory(root);
      if (parsed.type === "exit-filter") {
        setExitFilterPage(parsed.filter, sortiesStockContext());
        renderExitRegistry(root);
      }
      if (parsed.type === "entry-filter") {
        setEntryFilterPage(parsed.filter, entreesStockContext());
        renderEntriesRegistry(root);
      }
      if (parsed.type === "vehicle-filter") {
        setVehicleFilter(root, parsed.filter);
      }
      if (parsed.type === "audit-filter") {
        setAuditAlertFilterPage(parsed.filter, auditAlertesContext());
        renderAuditAlerts(root);
      }
      if (parsed.type === "audit-tab") {
        showAuditTab(root, parsed.id, target);
      }
      if (parsed.type === "audit-alert-detail")
        openAuditAlertDetail(root, parsed.id);
      if (parsed.type === "audit-log-detail") openAuditLogDetail(root, parsed.id);
      if (parsed.type === "audit-log-date-range")
        setAuditLogDateRange(root, parsed.range);
      if (parsed.type === "audit-log-day")
        toggleAuditLogDay(root, parsed.dayKey);
      if (parsed.type === "refresh-history") renderHistory(root);
      if (parsed.type === "history-proof-filter")
        setHistoryProofFilter(root, parsed.filter);
      if (parsed.type === "export") exportData(root, parsed.kind);
      if (parsed.type === "download-stock-excel")
        void downloadStockExcel(root, parsed.scope);
      if (parsed.type === "download-stock-pdf")
        downloadStockPdf(root, parsed.scope);
      if (parsed.type === "download-inventory-excel")
        void downloadInventoryExcel(root, parsed.scope);
      if (parsed.type === "download-inventory-pdf")
        downloadInventoryPdf(root, parsed.scope);
      if (parsed.type === "stock-filter") renderStock(root);
      if (parsed.type === "stock-drawer-open") openStockDrawer(root, parsed.id);
      if (parsed.type === "inventory-detail-open")
        openInventoryDetail(root, parsed.articleId, parsed.locationId);
      if (parsed.type === "inventory-global-detail-open")
        openInventoryGlobalDetail(root, parsed.articleId);
      if (parsed.type === "stock-drawer-close") closeStockDrawer(root);
      if (parsed.type === "stock-drawer-refresh")
        hasOpenHistoryMovementDrawer()
          ? renderHistoryMovementDrawer(root)
          : hasOpenInventoryDrawerPage()
            ? renderInventoryDrawer(root)
            : renderStockDrawer(root);
      if (parsed.type === "stock-sort") {
        sortVueStock(parsed.key);
        renderStock(root);
      }
      if (parsed.type === "stock-location") {
        navigateToView(root, "stock");
        populateStockFilters(root);
        const select = root.querySelector<HTMLSelectElement>(
          "#stockLocationSelect",
        );
        if (select) select.value = parsed.id;
        renderStock(root);
      }
      if (parsed.type === "inventory-mode")
        showInventoryMode(root, parsed.mode);
      if (parsed.type === "inventory-location") {
        const select = root.querySelector<HTMLSelectElement>("#inventoryLocationSelect");
        if (select) select.value = parsed.id;
        showInventoryMode(root, "local");
        renderInventory(root);
      }
    };
    const importFile =
      root.querySelector<HTMLInputElement>("#articleImportFile");
    importFile?.addEventListener("change", () => {
      const file = importFile.files?.[0];
      if (!file) return;
      const type =
        (root.querySelector<HTMLSelectElement>("#referentialImportType")
          ?.value as ReferentialImportType) || "article";
      if (type === "article")
        void readArticleImportFile(root, file);
      else void readReferentialImportFile(root, file);
    });
    const inventoryImportFile =
      root.querySelector<HTMLInputElement>("#inventoryImportFile");
    inventoryImportFile?.addEventListener("change", () => {
      const file = inventoryImportFile.files?.[0];
      if (!file) return;
      void readInventoryImportFile(root, file);
    });
    root
      .querySelector<HTMLSelectElement>("#referentialImportType")
      ?.addEventListener("change", (event) => {
        setReferentialImportTypePage(
          root,
          (event.target as HTMLSelectElement).value as ReferentialImportType,
          referentielsContext(),
        );
        const fileInput =
          root.querySelector<HTMLInputElement>("#articleImportFile");
        if (fileInput) fileInput.value = "";
        root
          .querySelector<HTMLElement>("#articleImportSummary")
          ?.classList.add("hidden");
        root
          .querySelector<HTMLElement>("#articleImportTable")
          ?.classList.add("hidden");
      });
    const onChange = (event: Event) => {
      const target = event.target as HTMLElement;
      const importField = target as HTMLInputElement;
      if (
        importField.dataset.inventoryImportRow &&
        importField.dataset.inventoryImportField
      ) {
        updateInventoryImportCell(
          root,
          Number(importField.dataset.inventoryImportRow),
          importField.dataset.inventoryImportField,
          importField.value,
        );
        return;
      }
      if (importField.dataset.importRow && importField.dataset.importField) {
        const rowIndex = Number(importField.dataset.importRow);
        updateImportCellPage(
          root,
          rowIndex,
          importField.dataset.importField,
          importField.value,
          referentielsContext(),
        );
        return;
      }
      if (target.id === "referentialType") {
        updateReferentialForm(root, (target as HTMLSelectElement).value);
      }
      if (target.id === "inventoryLocationSelect") {
        renderInventory(root);
      }
      if (target.id === "inventoryHideValidated") {
        renderInventory(root);
      }
      if (
        [
          "auditAlertTypeSelect",
          "auditAlertSeveritySelect",
          "auditAlertStatusSelect",
        ].includes(target.id)
      ) {
        renderAuditAlerts(root);
      }
      if (
        [
          "auditLogDateFromInput",
          "auditLogDateToInput",
          "auditLogUserSelect",
          "auditLogDomainSelect",
          "auditLogActionSelect",
        ].includes(target.id)
      ) {
        renderAuditLogs(root);
      }
      if (
        [
          "historyType",
          "historyPeriod",
          "stockLocationSelect",
          "stockCategorySelect",
          "stockStatusSelect",
        ].includes(target.id)
      ) {
        if (target.id.startsWith("history")) renderHistory(root);
        else renderStock(root);
      }
      if (target.closest("#materialRequestLines")) {
        syncMaterialPreparationState(root);
      }
    };
    const onInput = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.id === "stockSearchInput") renderStock(root);
      if (target.id === "historySearch") renderHistory(root);
      if (target.id === "inventorySearchInput") renderInventory(root);
      if (target.id === "auditAlertSearchInput") renderAuditAlerts(root);
      if (target.id === "auditLogSearchInput") renderAuditLogs(root);
      if (target.closest("#materialRequestLines")) {
        syncMaterialPreparationState(root);
      }
    };
    const onWindowScroll = () => closeFloatingExitActions(root);
    root.addEventListener("click", onClick);
    root.addEventListener("change", onChange);
    root.addEventListener("input", onInput);
    const onPopState = () => {
      openRoute(root, { skipHistory: true });
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("resize", onWindowScroll);
    window.addEventListener("scroll", onWindowScroll, true);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("change", onChange);
      root.removeEventListener("input", onInput);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("resize", onWindowScroll);
      window.removeEventListener("scroll", onWindowScroll, true);
      cleanupPwa();
    };
  }, []);

  return (
    <div ref={rootRef} className="template-part">
      <StockHubShell />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StockHubTemplate />
  </React.StrictMode>,
);
