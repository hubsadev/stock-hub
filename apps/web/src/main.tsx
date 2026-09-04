import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { StockHubShell } from "./components/StockHubShell";
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
  canUploadSignedProofForPage,
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
  proofRequestForMovementPage,
  refreshMaterialRequestLinesPage,
  removeMaterialRequestLinePage,
  renderExitRegistryPage,
  renderExitRequestDetailPage,
  requestForExitPage,
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
import type { BeforeInstallPromptEvent } from "./types/browser";
import type {
  ExcelCellValue,
  ExcelExportColumn,
  ExcelExportRow,
  InventoryExportScope,
  StockExportScope,
} from "./types/export";
import type { ReferentialImportType } from "./types/import";
import type { HeaderAction } from "./types/ui";
import { isOnline, selectedText, setText, setVisible } from "./utils/dom";
import { escapeHtml, formatDate, formatNumber, isToday } from "./utils/format";
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
let deferredPwaInstallPrompt: BeforeInstallPromptEvent | null = null;
let pwaServiceWorkerRegistered = false;
let currentUser: StockUser | null = readStoredUser();

function readStoredUser(): StockUser | null {
  return readStoredUserPage();
}

function userIdentity(user: Pick<StockUser, "identifier" | "email">) {
  return user.identifier || user.email || "-";
}

function userDisplayName(
  user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">,
) {
  return (
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    userIdentity(user)
  );
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
function badge(
  label: string,
  tone: "success" | "warning" | "error" | "gray" | "accent" = "gray",
) {
  const classes = {
    success: "bg-success-50 text-success-700",
    warning: "bg-warning-50 text-warning-700",
    error: "bg-error-50 text-error-700",
    gray: "bg-gray-100 text-gray-700",
    accent: "bg-accent-50 text-accent-600",
  }[tone];
  return `<span class="px-2 py-1 rounded-full ${classes} text-xs font-bold">${escapeHtml(label)}</span>`;
}

function setCardValue(
  root: HTMLElement,
  label: string,
  value: number | string,
) {
  return setCardValuePage(root, label, value, tableauDeBordContext());
}
function updatePwaInstallButton(root: HTMLElement) {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const visible = import.meta.env.PROD && Boolean(deferredPwaInstallPrompt) && !standalone;
  root.querySelectorAll<HTMLElement>("[data-profile-pwa-install]").forEach((button) => {
    button.classList.toggle("hidden", !visible);
    button.classList.toggle("inline-flex", visible);
  });
  updateProfilePwaCards(root);
}

function updateNetworkStatus(root: HTMLElement) {
  const banner = root.querySelector<HTMLElement>("#networkStatusBanner");
  if (banner) banner.classList.toggle("hidden", isOnline());
  updatePwaInstallButton(root);
}

async function installPwa(root: HTMLElement) {
  if (!deferredPwaInstallPrompt) {
    showToast(root, "Installation indisponible sur ce navigateur pour le moment.", "error");
    return;
  }
  const prompt = deferredPwaInstallPrompt;
  deferredPwaInstallPrompt = null;
  updatePwaInstallButton(root);
  await prompt.prompt();
  const choice = await prompt.userChoice;
  if (choice.outcome === "accepted") {
    showToast(root, "Stock Hub est pret a etre lance comme application.");
  }
}

function offlineActionLabel(type: string) {
  const labels: Record<string, string> = {
    "import-articles": "importer le referentiel",
    "import-inventory-rows": "importer l'inventaire",
    "submit-referential": "enregistrer le referentiel",
    "submit-quick-article": "creer un article",
    "submit-referential-edit": "modifier le referentiel",
    "deactivate-referential-detail": "desactiver un element",
    "submit-stock-entry": "enregistrer une entree stock",
    "upload-signed-entry-proof": "joindre une preuve d'entree",
    "submit-entry-resolution": "resoudre une entree",
    "submit-exit-request": "creer une demande materiel",
    "submit-material-request-preparation": "preparer une demande",
    "submit-direct-exit": "enregistrer une sortie",
    "submit-stock-return": "enregistrer un retour",
    "submit-return-control": "controler un retour",
    "submit-stock-transfer": "enregistrer un transfert",
    "submit-inventory-count": "enregistrer un inventaire",
    "submit-equipment-assignment": "affecter un equipement",
    "submit-equipment-creation": "creer un equipement",
    "submit-equipment-edit": "modifier un equipement",
    "unassign-equipment": "retirer une affectation",
    "submit-vehicle": "enregistrer un vehicule",
    "submit-vehicle-edit": "modifier un vehicule",
    "submit-user": "enregistrer un utilisateur",
    "submit-profile": "enregistrer le profil",
    "submit-password-change": "changer le mot de passe",
    "submit-exit-request-rejection": "refuser une demande",
  };
  return labels[type] ?? "";
}

function requireOnlineAction(root: HTMLElement, type: string) {
  const label = offlineActionLabel(type);
  if (!label || isOnline()) return true;
  showToast(
    root,
    `Connexion requise pour ${label}. Le mode hors ligne est limite a la consultation.`,
    "error",
  );
  return false;
}

function cleanupDevelopmentPwa() {
  if (!import.meta.env.DEV) return;
  deferredPwaInstallPrompt = null;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations
            .filter((registration) => registration.active?.scriptURL.includes("/sw.js"))
            .map((registration) => registration.unregister()),
        ),
      )
      .catch(() => undefined);
  }

  if ("caches" in window) {
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("stock-hub-shell-") || key.startsWith("stock-hub-cdn-"))
            .map((key) => caches.delete(key)),
        ),
      )
      .catch(() => undefined);
  }
}

function setupPwa(root: HTMLElement) {
  cleanupDevelopmentPwa();

  const registerServiceWorker = () => {
    if (!import.meta.env.PROD) return;
    const alreadyControlled = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        pwaServiceWorkerRegistered = true;
        registration.update().catch(() => undefined);
        if (!alreadyControlled) {
          showToast(root, "Stock Hub peut maintenant se lancer hors ligne.");
        }
      })
      .catch(() => undefined);
  };

  if (import.meta.env.PROD && "serviceWorker" in navigator && !pwaServiceWorkerRegistered) {
    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker, { once: true });
    }
  }

  const onBeforeInstallPrompt = (event: Event) => {
    if (!import.meta.env.PROD) return;
    event.preventDefault();
    deferredPwaInstallPrompt = event as BeforeInstallPromptEvent;
    updatePwaInstallButton(root);
  };
  const onAppInstalled = () => {
    deferredPwaInstallPrompt = null;
    updatePwaInstallButton(root);
    showToast(root, "Stock Hub est installe.");
  };
  const onNetworkChange = () => updateNetworkStatus(root);

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
  window.addEventListener("online", onNetworkChange);
  window.addEventListener("offline", onNetworkChange);
  updateNetworkStatus(root);

  return () => {
    window.removeEventListener("load", registerServiceWorker);
    window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.removeEventListener("appinstalled", onAppInstalled);
    window.removeEventListener("online", onNetworkChange);
    window.removeEventListener("offline", onNetworkChange);
  };
}

function updateProfilePwaCards(root: HTMLElement) {
  const available = root.querySelector<HTMLElement>("#profilePwaAvailableCard");
  const dev = root.querySelector<HTMLElement>("#profilePwaDevCard");
  const installed = root.querySelector<HTMLElement>("#profilePwaInstalledCard");
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  available?.classList.toggle(
    "hidden",
    !import.meta.env.PROD || standalone || !deferredPwaInstallPrompt,
  );
  dev?.classList.toggle("hidden", !import.meta.env.DEV);
  installed?.classList.toggle("hidden", !import.meta.env.PROD || !standalone);
}

function updateDashboard(root: HTMLElement) {
  return updateDashboardPage(root, tableauDeBordContext());
}


function emptyRow(colspan: number, message: string) {
  return `<tr><td class="px-5 py-8 text-center text-gray-500" colspan="${colspan}">${escapeHtml(message)}</td></tr>`;
}

function actionEye(modal = "referentialDetailModal") {
  return `<button data-action="openModal('${modal}')" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50" title="Voir la fiche"><i data-lucide="eye" class="w-4 h-4"></i></button>`;
}

function actionEyeFor(action: string) {
  return `<button data-action="${escapeHtml(action)}" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50" title="Voir la fiche"><i data-lucide="eye" class="w-4 h-4"></i></button>`;
}

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
  const cat = stockStatusCategory(level);
  if (cat === "rupture") return badge("Rupture", "error");
  if (cat === "sous-seuil") return badge("Sous seuil", "warning");
  return badge("Disponible", "success");
}

function movementTypeBadge(type: StockMovement["type"]) {
  const labels: Record<StockMovement["type"], string> = {
    ENTRY: "Entree",
    EXIT_REQUEST: "Dem. sortie",
    EXIT: "Sortie",
    RETURN: "Retour",
    TRANSFER: "Transfert",
    ADJUSTMENT: "Inventaire",
    INITIAL: "Stock de depart",
  };
  const tones: Record<StockMovement["type"], string> = {
    INITIAL: "bg-accent-50 text-accent-600",
    ENTRY: "bg-success-50 text-success-700",
    EXIT_REQUEST: "bg-gray-100 text-gray-600",
    EXIT: "bg-error-50 text-error-700",
    RETURN: "bg-success-50 text-success-700",
    TRANSFER: "bg-accent-50 text-accent-600",
    ADJUSTMENT: "bg-warning-50 text-warning-700",
  };
  return `<span class="px-2 py-0.5 rounded-full text-xs font-bold ${tones[type]}">${escapeHtml(labels[type] ?? type)}</span>`;
}

function reapproLevels() {
  return reapproLevelsPage(reapprovisionnementContext());
}

function reorderQuantity(level: StockLevel) {
  return reorderQuantityPage(level, reapprovisionnementContext());
}

function watchStockRow(level: StockLevel) {
  const actions =
    '<div class="flex items-center justify-end gap-2">' +
    '<button data-action="openModal(\'referentialDetailModal\')" title="Voir la fiche article" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50"><i data-lucide="eye" class="w-4 h-4"></i></button>' +
    '<button data-action="showView(\'historique\')" title="Voir historique" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"><i data-lucide="history" class="w-4 h-4"></i></button>' +
    '<button data-action="openModal(\'exitModal\')" title="Demander une sortie" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"><i data-lucide="arrow-up-right-square" class="w-4 h-4"></i></button>' +
    "</div>";
  return (
    "<tr>" +
    '<td class="px-5 py-4"><div class="font-bold">' +
    escapeHtml(level.article.designation) +
    '</div><div class="text-xs text-gray-500">' +
    escapeHtml(level.article.code) +
    "</div></td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(level.location.name) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(level.quantity) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(level.article.minimumStock) +
    "</td>" +
    '<td class="px-5 py-4">' +
    stockStatus(level) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    actions +
    "</td>" +
    "</tr>"
  );
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
  const labels: Record<StockMovement["type"], string> = {
    ENTRY: "Entree",
    EXIT_REQUEST: "Demande de sortie",
    EXIT: "Sortie",
    RETURN: "Retour",
    TRANSFER: "Transfert",
    ADJUSTMENT: "Inventaire",
    INITIAL: "Stock de depart",
  };
  return labels[type] ?? type;
}

function movementQuantity(movement: StockMovement) {
  const multiplier =
    movement.type === "EXIT" ||
    movement.type === "EXIT_REQUEST" ||
    movement.type === "TRANSFER"
      ? -1
      : 1;
  const total = movement.lines.reduce(
    (sum, line) =>
      sum +
      Number(
        line.completedQuantity ??
          line.requestedQuantity ??
          line.expectedQuantity ??
          0,
      ),
    0,
  );
  return total * multiplier;
}

function movementActor(movement: StockMovement) {
  return (
    movement.handledBy ??
    movement.receivedBy ??
    movement.deliveredBy ??
    movement.requestedBy ??
    "-"
  );
}

function movementArticleLabel(movement: StockMovement) {
  if (movement.lines.length > 1) return movement.lines.length + " articles";
  const first = movement.lines[0];
  if (!first?.article) return "-";
  return first.article.designation + " (" + first.article.code + ")";
}

function movementProofSource(movement: StockMovement) {
  if (movement.type === "ENTRY" || movement.type === "EXIT_REQUEST") {
    return movement;
  }
  if (movement.type === "EXIT") {
    const request = proofRequestForMovement(movement);
    if (request?.proofFileKey || request?.proofFileName) return request;
    return movement;
  }
  return movement.proofFileKey || movement.proofFileName ? movement : null;
}

function movementProofCount(movement: StockMovement) {
  const proofSource = movementProofSource(movement);
  return proofSource?.proofFileKey || proofSource?.proofFileName ? 1 : 0;
}

function movementHasProof(movement: StockMovement) {
  return movementProofCount(movement) > 0;
}

function movementRequiresSignedProof(movement: StockMovement) {
  if (
    movement.type === "ENTRY" ||
    movement.type === "EXIT" ||
    movement.type === "RETURN" ||
    movement.type === "TRANSFER"
  )
    return true;
  if (movement.type === "EXIT_REQUEST") {
    return (
      movement.status !== "SUBMITTED" &&
      movement.status !== "DRAFT" &&
      !linkedExitForRequest(movement)
    );
  }
  return false;
}

function movementProofStatus(movement: StockMovement) {
  if (movementHasProof(movement)) return "jointe";
  if (movementRequiresSignedProof(movement)) return "manquante";
  return "non-requise";
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
function csvValue(value: unknown) {
  const text = String(value ?? "").replace(/"/g, '""');
  return /[";\n\r]/.test(text) ? '"' + text + '"' : text;
}

function toCsv(rows: Array<Array<unknown>>) {
  return rows.map((row) => row.map(csvValue).join(";")).join("\r\n");
}

function downloadCsv(filename: string, rows: Array<Array<unknown>>) {
  const blob = new Blob(["\ufeff" + toCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const stockHubExcelBlue = "3746F5";
const stockHubExcelBorder = "CBD5E1";
const stockHubExcelStripe = "F8FAFC";

function excelCellText(value: ExcelCellValue) {
  if (value instanceof Date) return formatDate(value);
  return String(value ?? "");
}

function autoExcelColumnWidth(
  column: ExcelExportColumn,
  rows: ExcelExportRow[],
) {
  const contentWidth = rows.reduce(
    (max, row) => Math.max(max, excelCellText(row[column.key]).length + 2),
    column.header.length + 2,
  );
  return Math.min(Math.max(column.width ?? contentWidth, 12), 42);
}

async function exportWorkbook(input: {
  filename: string;
  sheetName: string;
  columns: ExcelExportColumn[];
  rows: ExcelExportRow[];
}) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Stock Hub";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet(input.sheetName.slice(0, 31));
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.columns = input.columns.map((column) => ({
    key: column.key,
    header: column.header,
    width: autoExcelColumnWidth(column, input.rows),
  }));

  input.rows.forEach((row) => worksheet.addRow(row));

  const header = worksheet.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF" + stockHubExcelBlue },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
      left: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
      bottom: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
      right: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF" + stockHubExcelStripe },
        };
      });
    }
    row.eachCell((cell, columnNumber) => {
      const column = input.columns[columnNumber - 1];
      cell.border = {
        top: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
        left: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
        bottom: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
        right: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
      };
      if (rowNumber === 1) return;
      cell.alignment = {
        vertical: "middle",
        horizontal:
          column?.type === "number" || column?.type === "currency"
            ? "right"
            : column?.type === "date"
              ? "center"
              : "left",
      };
      if (column?.type === "currency") cell.numFmt = '#,##0.00';
      if (column?.type === "number") cell.numFmt = '#,##0';
      if (column?.type === "date") cell.numFmt = "dd/mm/yyyy";
    });
  });

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: input.columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = input.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadMaterialRequestPdf(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal || modal.dataset.mode !== "prepare") {
    showToast(
      root,
      "Le PDF final est disponible apres preparation de la demande.",
      "error",
    );
    return;
  }

  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const rows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr"),
  );
  const reference = "DS-AUTO";
  const docCode = reference.replace(/^DS-/, "DM-");
  const date =
    modal.querySelector<HTMLInputElement>('input[type="date"]')?.value ||
    new Date().toISOString().slice(0, 10);
  const client = selectedText(selects[0]) || "-";
  const project = selectedText(selects[1]) || "-";
  const team = selectedText(selects[2]) || "-";
  const site = selectedText(selects[3]) || "-";
  const requester = selectedText(selects[4]) || "-";
  const stockManager =
    selectedText(
      root.querySelector<HTMLSelectElement>("#materialStockManager") ??
        undefined,
    ) || "-";
  const receivedBy =
    selectedText(
      root.querySelector<HTMLSelectElement>("#materialReceivedBy") ?? undefined,
    ) || "-";

  const lineHtml = rows
    .map((row, index) => {
      const inputs = Array.from(
        row.querySelectorAll<HTMLInputElement>("input"),
      );
      const articleText =
        selectedText(
          row.querySelector<HTMLSelectElement>("select") ?? undefined,
        ) || "-";
      const articleName = articleText.replace(/\s*\([^)]*\)\s*$/, "");
      const articleCode =
        articleText.match(/\(([^)]*)\)/)?.[1] ?? "Article catalogue";
      const unit = inputs[0]?.value || "-";
      const requested = toNumber(inputs[1]?.value ?? "0");
      const delivered = toNumber(inputs[2]?.value ?? "0");
      const observation =
        inputs[3]?.value ||
        (delivered < requested ? "Remise partielle" : "RAS");
      return (
        "<tr>" +
        '<td class="num">' +
        (index + 1) +
        "</td>" +
        "<td><strong>" +
        escapeHtml(articleName) +
        "</strong><br><span>" +
        escapeHtml(articleCode) +
        "</span></td>" +
        "<td>" +
        escapeHtml(unit) +
        "</td>" +
        '<td class="right strong">' +
        escapeHtml(formatNumber(requested)) +
        "</td>" +
        '<td class="right strong">' +
        escapeHtml(formatNumber(delivered)) +
        "</td>" +
        "<td>" +
        escapeHtml(observation) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  const html = materialRequestDocumentHtml({
    reference,
    docCode,
    exitReference: "-",
    date,
    client,
    project,
    site,
    team,
    requester,
    stockManager,
    receivedBy,
    rows: lineHtml,
  });

  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(
      root,
      "Impossible d'ouvrir le PDF. Autorise les popups pour Stock Hub.",
      "error",
    );
    return;
  }
  popup.document.write(html);
  popup.document.close();
}

function hubLogoMarkup() {
  return `<div class="hub-logo" aria-label="HUB"><div class="hub-logo-main">HUB</div><div class="hub-logo-tag">QUALITE PRECISION FIABILITE</div></div>`;
}

function materialRequestDocumentHtml(input: {
  reference: string;
  docCode: string;
  exitReference: string;
  date: string;
  client: string;
  project: string;
  site: string;
  team: string;
  requester: string;
  stockManager: string;
  receivedBy: string;
  rows: string;
}) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Demande materiel ${escapeHtml(input.reference)}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e9edf4; color: #0f172a; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
    .toolbar { width: 210mm; margin: 10px auto 0; display: flex; justify-content: flex-end; }
    .toolbar button { border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 7px 11px; font-weight: 800; cursor: pointer; font-size: 12px; }
    .page { width: 210mm; min-height: 297mm; margin: 10px auto 18px; background: #fff; padding: 10mm; box-shadow: 0 8px 26px rgba(15, 23, 42, .12); }
    .doc-head { display: grid; grid-template-columns: 30mm 1fr 46mm; border: 1px solid #b9c7da; min-height: 23mm; }
    .logo-cell { display: flex; align-items: center; justify-content: center; border-right: 1px solid #b9c7da; padding: 3mm; }
    .hub-logo { width: 24mm; height: 16mm; background: #e71845; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: .86; }
    .hub-logo-main { font-size: 20pt; font-weight: 950; letter-spacing: -.07em; }
    .hub-logo-tag { margin-top: 1.5mm; font-size: 3pt; font-weight: 900; letter-spacing: .04em; }
    .doc-name { padding: 4mm 5mm; display: flex; flex-direction: column; justify-content: center; }
    .doc-name .small { color: #334155; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
    .doc-name .value { margin-top: 2mm; font-size: 15px; font-weight: 950; }
    .doc-name .hint { margin-top: 1mm; color: #64748b; font-size: 10px; }
    .meta { border-left: 1px solid #b9c7da; display: grid; grid-template-rows: repeat(4, 1fr); }
    .meta div { display: grid; grid-template-columns: 18mm 1fr; align-items: center; border-bottom: 1px solid #d3dcea; min-height: 5.8mm; }
    .meta div:last-child { border-bottom: 0; }
    .meta b { padding: 1.7mm; font-size: 7.5px; text-transform: uppercase; color: #1e293b; }
    .meta span { padding: 1.7mm; text-align: right; font-size: 9.5px; font-weight: 900; }
    .title { padding: 10mm 0 7mm; text-align: center; font-size: 17px; font-weight: 950; letter-spacing: .13em; text-transform: uppercase; }
    .info-strip { margin: 0 0 7mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm 10mm; }
    .info-item { min-width: 0; padding-bottom: 2.5mm; border-bottom: 1px solid #d8e1ec; }
    .info-item .label { color: #475569; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .09em; }
    .info-item .value { margin-top: 1.5mm; font-size: 12px; font-weight: 900; line-height: 1.25; }
    .items, .signature-table { width: 100%; border-collapse: collapse; }
    .items { margin-top: 2mm; }
    .items th { background: #eaf1fb; color: #102033; font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
    .items td, .items th { border: 1px solid #d3dcea; padding: 3mm; vertical-align: middle; }
    .items td { font-size: 11px; }
    .items span { color: #64748b; font-size: 9px; }
    .right { text-align: right; }
    .strong { font-weight: 900; }
    .num { width: 10mm; text-align: center; font-weight: 900; color: #1d4ed8; }
    .sign-title { margin: 10mm 0 3mm; font-size: 12px; font-weight: 950; }
    .signature-table td { border: 1px solid #b9c7da; width: 33.33%; height: 34mm; vertical-align: top; padding: 3mm; }
    .signature-table .role { color: #1e293b; font-size: 8.5px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .signature-table .name { margin-top: 3mm; font-size: 11px; font-weight: 900; }
    .signature-table .line { margin-top: 18mm; color: #475569; font-size: 9px; }
    .footer { margin-top: 6mm; color: #64748b; font-size: 8px; display: flex; justify-content: space-between; gap: 10mm; }
    @media print { body { background: white; } .toolbar { display: none; } .page { width: 210mm; min-height: 297mm; margin: 0; padding: 10mm; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer PDF</button></div>
  <main class="page">
    <header class="doc-head">
      <div class="logo-cell">${hubLogoMarkup()}</div>
      <div class="doc-name"><div class="small">Document interne</div><div class="value">Demande de materiels</div><div class="hint">Document de sortie stock et remise materiel</div></div>
      <div class="meta"><div><b>Doc N</b><span>${escapeHtml(input.docCode)}</span></div><div><b>Demande</b><span>${escapeHtml(input.reference)}</span></div><div><b>Bon sortie</b><span>${escapeHtml(input.exitReference)}</span></div><div><b>Date</b><span>${escapeHtml(formatDate(input.date))}</span></div></div>
    </header>
    <div class="title">Demande de materiels</div>
    <section class="info-strip" aria-label="Informations de la demande">
      <div class="info-item"><div class="label">Client</div><div class="value">${escapeHtml(input.client)}</div></div>
      <div class="info-item"><div class="label">Projet</div><div class="value">${escapeHtml(input.project)}</div></div>
      <div class="info-item"><div class="label">Site / zone</div><div class="value">${escapeHtml(input.site)}</div></div>
      <div class="info-item"><div class="label">Equipe / service</div><div class="value">${escapeHtml(input.team)}</div></div>
      <div class="info-item"><div class="label">Demandeur</div><div class="value">${escapeHtml(input.requester)}</div></div>
      <div class="info-item"><div class="label">Resp. stock</div><div class="value">${escapeHtml(input.stockManager)}</div></div>
    </section>
    <table class="items"><thead><tr><th>N</th><th>Designation</th><th>Unite</th><th class="right">Demandee</th><th class="right">Remise</th><th>Observation</th></tr></thead><tbody>${input.rows}</tbody></table>
    <div class="sign-title">Signatures</div>
    <table class="signature-table"><tbody><tr>
      <td><div class="role">Demandeur</div><div class="name">${escapeHtml(input.requester)}</div><div class="line">Date et signature</div></td>
      <td><div class="role">PM / Responsable</div><div class="name">${escapeHtml(input.receivedBy)}</div><div class="line">Date et signature</div></td>
      <td><div class="role">Responsable logistique</div><div class="name">${escapeHtml(input.stockManager)}</div><div class="line">Date et signature</div></td>
    </tr></tbody></table>
    
  </main>
</body>
</html>`;
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

function exportDateValue(value: string | Date | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function exportDataset(kind: string, root: HTMLElement): {
  filenameKind: string;
  sheetName: string;
  columns: ExcelExportColumn[];
  rows: ExcelExportRow[];
} {
  if (kind === "stock" || kind === "inventory") {
    if (kind === "inventory") {
      return {
        filenameKind: "inventory",
        sheetName: "Inventaire",
        columns: [
          { key: "article", header: "Article" },
          { key: "code", header: "Code" },
          { key: "theoretical", header: "Stock theorique global", type: "number" },
          { key: "counted", header: "Quantite constatee", type: "number" },
          { key: "good", header: "Bon etat", type: "number" },
          { key: "repair", header: "A reparer", type: "number" },
          { key: "outOfService", header: "Hors service", type: "number" },
          { key: "gap", header: "Ecart", type: "number" },
          { key: "locations", header: "Emplacements concernes" },
          { key: "status", header: "Statut" },
        ],
        rows: inventoryGlobalExportRows(),
      };
    }
    return {
      filenameKind: "stock",
      sheetName: "Vue Stock",
      columns: [
        { key: "article", header: "Article" },
        { key: "code", header: "Code" },
        { key: "category", header: "Categorie" },
        { key: "location", header: "Emplacement" },
        { key: "quantity", header: "Quantite", type: "number" },
        { key: "minimumStock", header: "Stock minimum", type: "number" },
        { key: "status", header: "Statut" },
      ],
      rows: [...latestStockLevels]
        .sort((a, b) => {
          const quantityDiff = Number(b.quantity ?? 0) - Number(a.quantity ?? 0);
          if (quantityDiff !== 0) return quantityDiff;
          return a.article.designation.localeCompare(b.article.designation);
        })
        .map((level) => ({
          article: level.article.designation,
          code: level.article.code,
          category: level.article.category,
          location: level.location.name,
          quantity: Number(level.quantity ?? 0),
          minimumStock: Number(level.article.minimumStock ?? 0),
          status:
            level.quantity <= 0
              ? "Rupture"
              : level.quantity <= level.article.minimumStock
                ? "Stock bas"
                : "OK",
        })),
    };
  }
  if (kind === "reappro") {
    const levels = reapproLevels();
    return {
      filenameKind: "reappro",
      sheetName: "Reapprovisionnement",
      columns: [
        { key: "article", header: "Article" },
        { key: "code", header: "Code" },
        { key: "location", header: "Emplacement" },
        { key: "available", header: "Disponible", type: "number" },
        { key: "minimumStock", header: "Stock minimum", type: "number" },
        { key: "recommended", header: "A recommander", type: "number" },
        { key: "referencePrice", header: "Prix indicatif", type: "currency" },
        { key: "estimatedValue", header: "Valeur estimee", type: "currency" },
      ],
      rows: levels.map((level) => ({
        article: level.article.designation,
        code: level.article.code,
        location: level.location.name,
        available: Number(level.quantity ?? 0),
        minimumStock: Number(level.article.minimumStock ?? 0),
        recommended: reorderQuantity(level),
        referencePrice: Number(level.article.referencePrice ?? 0),
        estimatedValue: reorderQuantity(level) * Number(level.article.referencePrice ?? 0),
      })),
    };
  }
  if (kind === "audit") {
    return {
      filenameKind: "audit",
      sheetName: "Journal audit",
      columns: [
        { key: "date", header: "Date", type: "date" },
        { key: "user", header: "Utilisateur" },
        { key: "action", header: "Action metier" },
        { key: "document", header: "Document" },
        { key: "result", header: "Resultat" },
      ],
      rows: latestAuditLogs.map((log) => ({
        date: exportDateValue(log.createdAt),
        user: auditLogUserLabel(log),
        action: auditActionLabel(log.action),
        document: auditDocumentLabel(log),
        result: auditLogResultLabel(auditLogResult(log)),
      })),
    };
  }
  const movements = kind === "all" ? latestMovements : filteredHistory(root);
  return {
    filenameKind: "mouvements",
    sheetName: "Mouvements",
    columns: [
      { key: "date", header: "Date", type: "date" },
      { key: "type", header: "Type" },
      { key: "reference", header: "Reference" },
      { key: "article", header: "Article" },
      { key: "quantity", header: "Quantite", type: "number" },
      { key: "user", header: "Utilisateur" },
      { key: "project", header: "Projet" },
      { key: "supplier", header: "Fournisseur" },
      { key: "origin", header: "Origine" },
      { key: "destination", header: "Destination" },
      { key: "status", header: "Statut" },
    ],
    rows: movements.map((movement) => ({
      date: exportDateValue(movement.date),
      type: movementTypeLabel(movement.type),
      reference: movement.reference,
      article: movementArticleLabel(movement),
      quantity: movementQuantity(movement),
      user: movementActor(movement),
      project: movement.project?.name ?? "",
      supplier: movement.supplier?.name ?? "",
      origin: movement.fromLocation?.name ?? "",
      destination: movement.toLocation?.name ?? "",
      status: movement.status,
    })),
  };
}

function exportRows(kind: string, root: HTMLElement) {
  const dataset = exportDataset(kind, root);
  return [
    dataset.columns.map((column) => column.header),
    ...dataset.rows.map((row) => dataset.columns.map((column) => row[column.key])),
  ];
}

async function exportData(root: HTMLElement, kind: string) {
  try {
    const dataset = exportDataset(kind, root);
    const date = new Date().toISOString().slice(0, 10);
    const filename = "stock-hub-" + dataset.filenameKind + "-" + date + ".xlsx";
    await exportWorkbook({
      filename,
      sheetName: dataset.sheetName,
      columns: dataset.columns,
      rows: dataset.rows,
    });
    showToast(root, "Export Excel prepare : " + filename);
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Export Excel impossible.",
      "error",
    );
  }
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
  if (movement.type === "EXIT") return "Sortie reelle";
  if (movement.status === "SUBMITTED") return "Demandee";
  if (movement.status === "PREPARED") return "Preparee";
  if (movement.status === "COMPLETED") return "Terminee";
  if (movement.status === "REJECTED") return "Refusee";
  if (movement.status === "CANCELLED") return "Annulee";
  return movement.status;
}

function movementTextKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function movementDateKey(value: string | null | undefined) {
  return (value ?? "").slice(0, 10);
}

function movementProjectKey(movement: StockMovement) {
  return (
    movement.projectId ??
    movementTextKey(movement.project?.code ?? movement.project?.name)
  );
}

function movementPersonKey(movement: StockMovement) {
  return movementTextKey(
    movement.receivedBy ?? movement.requestedBy ?? movement.handledBy,
  );
}

function movementArticleKeys(movement: StockMovement) {
  return new Set(
    movement.lines
      .map(
        (line) =>
          line.articleId ||
          line.article?.id ||
          line.article?.code ||
          line.article?.designation ||
          "",
      )
      .filter(Boolean),
  );
}

function movementRequestedTotal(movement: StockMovement) {
  return movement.lines.reduce(
    (sum, line) => sum + Number(line.requestedQuantity ?? 0),
    0,
  );
}

function movementCompletedTotal(movement: StockMovement) {
  return movement.lines.reduce(
    (sum, line) => sum + Number(line.completedQuantity ?? 0),
    0,
  );
}

function hasCommonArticle(left: StockMovement, right: StockMovement) {
  const leftKeys = movementArticleKeys(left);
  const rightKeys = movementArticleKeys(right);
  return [...leftKeys].some((key) => rightKeys.has(key));
}

function looksLikeGeneratedExit(request: StockMovement, exit: StockMovement) {
  if (request.type !== "EXIT_REQUEST" || exit.type !== "EXIT") return false;
  if (
    exit.sourceRequestId === request.id ||
    request.generatedExits?.some((item) => item.id === exit.id)
  )
    return true;

  const requestProject = movementProjectKey(request);
  const exitProject = movementProjectKey(exit);
  const requestPerson = movementPersonKey(request);
  const exitPerson = movementPersonKey(exit);
  const requestedTotal = movementRequestedTotal(request);
  const completedTotal = movementCompletedTotal(exit);

  return Boolean(
    requestProject &&
    exitProject &&
    requestProject === exitProject &&
    (!requestPerson || !exitPerson || requestPerson === exitPerson) &&
    movementDateKey(request.date) === movementDateKey(exit.date) &&
    hasCommonArticle(request, exit) &&
    completedTotal > 0 &&
    (!requestedTotal || requestedTotal >= completedTotal),
  );
}

function linkedExitForRequest(movement: StockMovement) {
  if (movement.type !== "EXIT_REQUEST") return null;
  return (
    latestMovements.find(
      (item) => item.type === "EXIT" && looksLikeGeneratedExit(movement, item),
    ) ??
    movement.generatedExits?.[0] ??
    null
  );
}

function requestForExit(movement: StockMovement) { return requestForExitPage(movement, sortiesStockContext()); }

function materialPdfMovement(movement: StockMovement) { return materialPdfMovementPage(movement, sortiesStockContext()); }

function materialPdfLinkedExit(movement: StockMovement) { return materialPdfLinkedExitPage(movement, sortiesStockContext()); }

function proofRequestForMovement(movement: StockMovement) { return proofRequestForMovementPage(movement, sortiesStockContext()); }

function canUploadSignedProofFor(movement: StockMovement) { return canUploadSignedProofForPage(movement, sortiesStockContext()); }

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

function fillSelect(
  select: HTMLSelectElement | undefined,
  options: string,
  placeholder?: string,
) {
  if (!select) return;
  select.innerHTML = placeholder ? option("", placeholder) + options : options;
}

function userOptions(users: StockUser[]) {
  return users.map((user) => option(user.id, userDisplayName(user))).join("");
}

function articleOptions(articles: Article[]) {
  return articles
    .map((article) => option(article.id, article.designation))
    .join("");
}

function projectOptions(projects: StockProject[]) {
  return projects
    .map((project) => option(project.id, project.code + " - " + project.name))
    .join("");
}

function clientOptions(clients: Client[]) {
  return clients.map((client) => option(client.id, client.name)).join("");
}

function supplierOptions(suppliers: Supplier[]) {
  return suppliers
    .map((supplier) => option(supplier.id, supplier.name))
    .join("");
}

function teamServiceOptions(services: TeamService[]) {
  return services.map((service) => option(service.id, service.name)).join("");
}

function sitesForProject(projectId: string, locations = latestLocations) {
  return locations.filter(
    (location) =>
      ["SITE", "CHANTIER"].includes(location.type.toUpperCase()) &&
      (!projectId || location.projectId === projectId),
  );
}

function siteOptions(locations: StockLocation[]) {
  return locations
    .map((location) => option(location.id, location.name))
    .join("");
}

function setProjectSiteOptions(
  siteSelect: HTMLSelectElement | undefined,
  projectId: string,
) {
  if (!siteSelect) return;
  if (!projectId) {
    fillSelect(siteSelect, "", "Selectionner un projet d'abord");
    return;
  }
  const sites = sitesForProject(projectId);
  fillSelect(
    siteSelect,
    siteOptions(sites),
    sites.length
      ? "Selectionner site ou zone"
      : "Aucun site rattache a ce projet",
  );
}

function locationOptions(locations: StockLocation[]) {
  return locations
    .map((location) => option(location.id, location.name))
    .join("");
}

function option(value: string, label: string) {
  return (
    '<option value="' +
    escapeHtml(value) +
    '">' +
    escapeHtml(label) +
    "</option>"
  );
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
  return (
    (
      {
        ADMIN_STOCK: "Admin Stock",
        GESTIONNAIRE_STOCK: "Gestionnaire",
        AUDIT: "Audit",
        RH: "RH",
        DIRECTION: "Direction",
        CHEF_PROJET: "Chef projet",
      } as Record<string, string>
    )[role] ?? role
  );
}

function accessLabel(roles: string[]) {
  if (roles.includes("ADMIN_STOCK")) return "Tous modules";
  if (roles.includes("GESTIONNAIRE_STOCK"))
    return "Referentiels, stock, equipements, parc auto, mouvements";
  if (roles.includes("AUDIT")) return "Inventaire, alertes, exports";
  if (roles.includes("DIRECTION")) return "KPI et controles";
  if (roles.includes("CHEF_PROJET")) return "Demandes, stock consulte";
  if (roles.includes("RH")) return "Consultation inventaire";
  return "Acces limite";
}

function userInitials(user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">) {
  return (
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
      .trim()
      .toUpperCase() || userIdentity(user).slice(0, 2).toUpperCase()
  );
}

function profileRoleBadge(role: string) {
  const variant = role === "ADMIN_STOCK" ? "accent" : role === "AUDIT" ? "warning" : "success";
  return badge(roleLabel(role), variant);
}

function updateProfileView(root: HTMLElement) {
  const user = currentUser ?? readStoredUser();
  if (!user) return;
  setText(root, "#profileInitials", userInitials(user));
  setText(root, "#profileDisplayName", userDisplayName(user));
  setText(root, "#profileIdentity", userIdentity(user));
  const firstName = root.querySelector<HTMLInputElement>("#profileFirstName");
  const lastName = root.querySelector<HTMLInputElement>("#profileLastName");
  const email = root.querySelector<HTMLInputElement>("#profileEmail");
  const identifier = root.querySelector<HTMLInputElement>("#profileIdentifier");
  if (firstName) firstName.value = user.firstName;
  if (lastName) lastName.value = user.lastName;
  if (email) email.value = user.email ?? "";
  if (identifier) identifier.value = user.identifier;
  const roles = root.querySelector<HTMLElement>("#profileRoleBadges");
  if (roles) roles.innerHTML = user.roles.map(profileRoleBadge).join("");
  const status = root.querySelector<HTMLElement>("#profileStatus");
  if (status) status.innerHTML = badge(user.active ? "Actif" : "Inactif", user.active ? "success" : "gray");
  setText(root, "#profileAccess", accessLabel(user.roles));
  updateProfilePwaCards(root);
  window.lucide?.createIcons();
}

function syncCurrentUser(root: HTMLElement, user: StockUser) {
  currentUser = user;
  localStorage.setItem("stock-hub.user", JSON.stringify(user));
  updateCurrentUserDisplay(root);
  updateProfileView(root);
}

async function submitProfile(root: HTMLElement) {
  if (!currentUser) return;
  const firstName = root.querySelector<HTMLInputElement>("#profileFirstName")?.value.trim() ?? "";
  const lastName = root.querySelector<HTMLInputElement>("#profileLastName")?.value.trim() ?? "";
  const emailValue = root.querySelector<HTMLInputElement>("#profileEmail")?.value.trim() ?? "";
  if (!firstName || !lastName) {
    showToast(root, "Prenom et nom sont requis.", "error");
    return;
  }
  try {
    const user = await updateMyProfile(currentUser.id, {
      firstName,
      lastName,
      email: emailValue || null,
    });
    syncCurrentUser(root, user);
    latestUsers = latestUsers.map((item) => (item.id === user.id ? user : item));
    renderUsersList(root);
    showToast(root, "Profil mis a jour.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Modification du profil impossible.", "error");
  }
}

async function submitPasswordChange(root: HTMLElement) {
  if (!currentUser) return;
  const currentPassword = root.querySelector<HTMLInputElement>("#profileCurrentPassword")?.value ?? "";
  const newPassword = root.querySelector<HTMLInputElement>("#profileNewPassword")?.value ?? "";
  const confirmPassword = root.querySelector<HTMLInputElement>("#profileConfirmPassword")?.value ?? "";
  if (!currentPassword || !newPassword) {
    showToast(root, "Ancien et nouveau mot de passe sont requis.", "error");
    return;
  }
  if (newPassword.length < 8) {
    showToast(root, "Le nouveau mot de passe doit contenir au moins 8 caracteres.", "error");
    return;
  }
  if (newPassword !== confirmPassword) {
    showToast(root, "La confirmation ne correspond pas au nouveau mot de passe.", "error");
    return;
  }
  try {
    const user = await changeMyPassword(currentUser.id, { currentPassword, newPassword });
    syncCurrentUser(root, user);
    ["#profileCurrentPassword", "#profileNewPassword", "#profileConfirmPassword"].forEach((selector) => {
      const input = root.querySelector<HTMLInputElement>(selector);
      if (input) input.value = "";
    });
    showToast(root, "Mot de passe mis a jour.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Changement de mot de passe impossible.", "error");
  }
}

function renderUsersList(root: HTMLElement) {
  return renderUsersListPage(root, utilisateursRolesContext());
}



function renderReferentialsRegistry(root: HTMLElement) {
  return renderReferentialsRegistryPage(root, referentielsContext());
}

function updateApiBackedViews(root: HTMLElement) {
  updateDashboard(root);
  getArticles()
    .then((articles) => {
      latestArticles = articles;
      renderReferentialsRegistry(root);
      renderInventory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getSuppliers()
    .then((suppliers) => {
      latestSuppliers = suppliers;
      renderReferentialsRegistry(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getClients()
    .then((clients) => {
      latestClients = clients;
      renderReferentialsRegistry(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getTeamServices()
    .then((services) => {
      latestTeamServices = services;
      renderReferentialsRegistry(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getEmployees()
    .then((employees) => {
      latestEmployees = employees;
      renderReferentialsRegistry(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);
  getProjects()
    .then((projects) => {
      latestProjects = projects;
      renderReferentialsRegistry(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getLocations()
    .then((locations) => {
      latestLocations = locations;
      renderReferentialsRegistry(root);
      populateStockFilters(root);
      renderStock(root);
      renderInventory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getStockMovements()
    .then((movements) => {
      latestMovements = movements;
      renderStock(root);
      renderEntriesRegistry(root);
      const exits = visibleExitMovements(movements);
      const pendingExits = exits.filter(
        (movement) =>
          movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED",
      );
      const pendingAlert = root.querySelector<HTMLElement>("#exitPendingAlert");
      const pendingCount = root.querySelector<HTMLElement>("#exitPendingCount");
      if (pendingAlert)
        pendingAlert.classList.toggle("hidden", pendingExits.length === 0);
      if (pendingCount) pendingCount.textContent = String(pendingExits.length);
      renderDashboardPendingExitRequestsPage(
        root,
        pendingExits,
        tableauDeBordContext(),
      );
      renderExitRegistry(root);
      setText(root, "#exitRequestsCount", pendingExits.length);
      setText(
        root,
        "#exitCompletedCount",
        exits.filter(
          (movement) =>
            movement.type === "EXIT" && movement.status === "COMPLETED",
        ).length,
      );
      setText(
        root,
        "#exitBlockedCount",
        exits.filter(
          (movement) =>
            movement.status === "REJECTED" || movement.status === "CANCELLED",
        ).length,
      );
      setText(
        root,
        "#exitTodayCount",
        exits.filter((movement) => isToday(movement.date)).length,
      );
      renderReturnTransferRegistry(root, movements);
      renderHistory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getStockLevels()
    .then((levels) => {
      latestStockLevels = levels;
      populateStockFilters(root);
      renderStock(root);
      renderInventory(root);
      renderExitRegistry(root);
      renderReappro(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getEquipments()
    .then((equipments) => {
      latestEquipments = equipments;
      renderEquipmentsRegistry(root, equipments);
    })
    .catch(() => undefined);

  getVehicles()
    .then((vehicles) => {
      renderVehicles(root, vehicles);
    })
    .catch(() => undefined);

  getUsers()
    .then((users) => {
      latestUsers = users;
      renderUsersList(root);
      renderAuditLogs(root);
      renderHistory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getAuditAlerts()
    .then((alerts) => {
      latestAuditAlerts = alerts;
      renderAuditAlerts(root);
      renderDashboardAuditAlertsPage(root, alerts, tableauDeBordContext());
    })
    .catch(() => undefined);

  getAuditLogs()
    .then((logs) => {
      latestAuditLogs = logs;
      renderAuditLogs(root);
      renderHistory(root);
      renderDashboardAuditLogCountPage(root, logs.length, tableauDeBordContext());
    })
    .catch(() => undefined);
}

function clearActiveNav(root: HTMLElement) {
  root.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.remove("bg-accent-50", "text-accent-600");
    button.classList.add("text-gray-600", "hover:bg-gray-100");
  });
}

function activateNavButton(button: HTMLElement) {
  button.classList.add("bg-accent-50", "text-accent-600");
  button.classList.remove("text-gray-600", "hover:bg-gray-100");
}

function renderHeaderButton(action: {
  label: string;
  icon: string;
  modal?: string;
  action?: string;
  variant: "primary" | "secondary";
}) {
  const classes =
    action.variant === "primary"
      ? "px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-semibold hover:bg-accent-500 flex items-center gap-2"
      : "px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2";
  const dataAction = action.action
    ? ` data-action="${action.action}"`
    : action.modal
      ? ` data-action="openModal('${action.modal}')"`
      : "";
  return `<button class="${classes}"${dataAction}><i data-lucide="${action.icon}" class="w-4 h-4"></i>${action.label}</button>`;
}
function canUseHeaderAction(view: string, action: HeaderAction) {
  if (!currentUser) return false;
  if (hasRole("ADMIN_STOCK")) return true;
  if (action.action?.startsWith("exportData"))
    return (
      hasRole("DIRECTION") || hasRole("AUDIT") || hasRole("GESTIONNAIRE_STOCK")
    );
  if (action.modal === "stockExportModal")
    return (
      hasRole("DIRECTION") || hasRole("AUDIT") || hasRole("GESTIONNAIRE_STOCK")
    );
  if (action.modal === "importModal" || action.modal === "inventoryImportModal")
    return hasRole("GESTIONNAIRE_STOCK");
  if (view === "referentiels") return hasRole("GESTIONNAIRE_STOCK");
  if (view === "entrees") return hasRole("GESTIONNAIRE_STOCK");
  if (view === "sortie" && action.modal === "directExitModal")
    return hasRole("GESTIONNAIRE_STOCK");
  if (view === "sortie" && action.modal === "exitModal")
    return hasRole("GESTIONNAIRE_STOCK") || hasRole("CHEF_PROJET");
  if (view === "retours") return hasRole("GESTIONNAIRE_STOCK");
  if (view === "inventaire")
    return hasRole("GESTIONNAIRE_STOCK") || hasRole("AUDIT");
  if (view === "equipements")
    return hasRole("GESTIONNAIRE_STOCK") || hasRole("RH");
  if (view === "parcAuto")
    return hasRole("GESTIONNAIRE_STOCK") || hasRole("RH");
  return false;
}

function setViewActions(root: HTMLElement, view: string) {
  const actions = root.querySelector<HTMLElement>("#viewActions");
  if (!actions) return;
  const actionByView: Record<string, HeaderAction[]> = {
    home: [
      {
        label: "Importer Excel",
        icon: "upload",
        modal: "importModal",
        variant: "secondary",
      },
    ],
    entrees: [
      {
        label: "Importer Excel",
        icon: "upload",
        modal: "importModal",
        variant: "secondary",
      },
      {
        label: "Nouvelle entree",
        icon: "plus",
        modal: "entryModal",
        variant: "primary",
      },
    ],
    referentiels: [
      {
        label: "Importer Excel",
        icon: "upload",
        modal: "importModal",
        variant: "secondary",
      },
      {
        label: "Nouvel element",
        icon: "plus",
        modal: "referentialModal",
        variant: "primary",
      },
    ],
    stock: [
      {
        label: "Telecharger",
        icon: "download",
        modal: "stockExportModal",
        variant: "secondary",
      },
    ],
    sortie: [
      {
        label: "Nouvelle sortie",
        icon: "package-minus",
        modal: "directExitModal",
        variant: "secondary",
      },
      {
        label: "Nouvelle demande",
        icon: "plus",
        modal: "exitModal",
        variant: "primary",
      },
    ],
    retours: [
      {
        label: "Nouveau transfert",
        icon: "shuffle",
        modal: "transferModal",
        variant: "secondary",
      },
      {
        label: "Nouveau retour",
        icon: "rotate-ccw",
        modal: "returnModal",
        variant: "primary",
      },
    ],
    reappro: [
      {
        label: "Exporter liste",
        icon: "download",
        action: "exportData('reappro')",
        variant: "secondary",
      },
    ],
    inventaire: [
      {
        label: "Importer Excel",
        icon: "upload",
        modal: "inventoryImportModal",
        variant: "secondary",
      },
    ],
    equipements: [
      {
        label: "Affecter equipement",
        icon: "plus",
        modal: "equipmentModal",
        variant: "primary",
      },
    ],
    parcAuto: [
      {
        label: "Nouveau vehicule",
        icon: "plus",
        modal: "vehicleModal",
        variant: "primary",
      },
    ],
    audit: [],
    users: [
      {
        label: "Nouvel utilisateur",
        icon: "user-plus",
        modal: "userModal",
        variant: "primary",
      },
    ],
    historique: [],
  };
  actions.innerHTML = (actionByView[view] ?? [])
    .filter((action) => canUseHeaderAction(view, action))
    .map(renderHeaderButton)
    .join("");
}

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
  setViewActions(root, view);
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
  setVisible(root.querySelector(`#${CSS.escape(id)}`), true);
  if (id === "stockExportModal") {
    prepareStockExportModal(root);
  }
  if (id === "inventoryExportModal") {
    prepareInventoryExportModal(root);
  }
  if (id === "importModal") {
    resetReferentialImportPage(root, referentielsContext());
  }
  if (id === "inventoryImportModal") {
    resetInventoryImport(root);
  }
  if (id === "userModal") {
    prepareUserModal(root);
  }
  if (id === "referentialModal") {
    updateReferentialForm(
      root,
      root.querySelector<HTMLSelectElement>("#referentialType")?.value ?? "",
    );
  }
  if (id === "articleModal") {
    void populateQuickArticleModal(root);
  }
  if (id === "entryModal") {
    void populateEntryModal(root);
  }
  if (id === "exitModal" || id === "directExitModal") {
    if (id === "exitModal") setMaterialRequestMode(root, "create");
    void populateExitModals(root, id);
  }
  if (id === "returnModal" || id === "transferModal") {
    void populateReturnTransferModals(root, id);
  }
  if (id === "equipmentModal") {
    void populateEquipmentModal(root);
  }
  if (id === "equipmentCreateModal") {
    void populateEquipmentCreateModal(root);
  }
  window.lucide?.createIcons();
}

function closeModal(root: HTMLElement, id: string) {
  setVisible(root.querySelector(`#${CSS.escape(id)}`), false);
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
  root
    .querySelectorAll<HTMLButtonElement>("#referentialModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Creer element")
      ) {
        button.dataset.action = "submitReferential";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#entryModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Enregistrer entree")
      ) {
        button.dataset.action = "submitStockEntry";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#exitModal button")
    .forEach((button) => {
      if (button.textContent?.trim().includes("Soumettre demande")) {
        button.dataset.action = "submitExitRequest";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#directExitModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Valider sortie")
      ) {
        button.dataset.action = "submitDirectExit";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#returnModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Enregistrer retour")
      ) {
        button.dataset.action = "submitStockReturn";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#transferModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Enregistrer transfert")
      ) {
        button.dataset.action = "submitStockTransfer";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#countModal button")
    .forEach((button) => {
      if (button.textContent?.trim().includes("Enregistrer comptage")) {
        button.dataset.action = "submitInventoryCount";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#equipmentModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Affecter")
      ) {
        button.dataset.action = "submitEquipmentAssignment";
      }
    });
}



function detailCard(
  label: string,
  value: unknown,
  tone: "gray" | "success" | "accent" = "gray",
) {
  const toneClass =
    tone === "success"
      ? "bg-success-50 border-success-100 text-success-700"
      : tone === "accent"
        ? "bg-accent-50 border-accent-100 text-accent-700"
        : "bg-gray-50 border-gray-200 text-gray-900";
  return `<div class="p-4 rounded-xl border ${toneClass}"><div class="text-xs font-semibold opacity-70">${escapeHtml(label)}</div><div class="font-bold mt-1">${escapeHtml(value ?? "-")}</div></div>`;
}

function detailField(label: string, value: unknown) {
  return `<div><span class="text-gray-500">${escapeHtml(label)}</span><div class="font-semibold">${escapeHtml(value ?? "-")}</div></div>`;
}

function lifecycleFields(item: { createdAt?: string; updatedAt?: string }) {
  return (
    detailField("Cree le", formatDate(item.createdAt)) +
    detailField("Modifie le", formatDate(item.updatedAt))
  );
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

function toNumber(value: string) {
  const parsed = Number(value.replace(/\s/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function articleStockAtLocation(
  articleId: string,
  locationId: string | null | undefined,
) {
  if (!locationId) return 0;
  return Number(
    latestStockLevels.find(
      (level) =>
        level.article.id === articleId && level.location.id === locationId,
    )?.quantity ?? 0,
  );
}

function showToast(
  root: HTMLElement,
  message: string,
  tone: "success" | "error" = "success",
) {
  root.querySelector("#stockHubToast")?.remove();
  const toast = document.createElement("div");
  toast.id = "stockHubToast";
  toast.className =
    "fixed top-5 right-5 z-[80] max-w-md rounded-xl border px-4 py-3 shadow-xl text-sm font-semibold " +
    (tone === "success"
      ? "bg-success-50 border-success-100 text-success-700"
      : "bg-error-50 border-error-100 text-error-700");
  toast.textContent = message;
  root.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3500);
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
function parseAction(action: string) {
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
    const cleanupPwa = setupPwa(root);

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
        void installPwa(root);
        return;
      }
      if (!requireOnlineAction(root, parsed.type)) return;
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
