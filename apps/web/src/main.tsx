import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import * as XLSX from "xlsx";
import { StockHubShell } from "./components/StockHubShell";
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
import type {
  ArticleImportRow,
  InventoryImportRow,
  ReferentialImportRow,
  ReferentialImportType,
} from "./types/import";
import type { InventoryComputedLine } from "./types/stock";
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
let currentAuditAlertFilter = "ALL";
let latestAuditAlerts: AuditAlert[] = [];
let latestStockLevels: StockLevel[] = [];
let latestAuditLogs: AuditLog[] = [];
let collapsedAuditLogDays = new Set<string>();
let initializedAuditLogDays = new Set<string>();
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
let selectedUserId: string | null = null;
let currentUser: StockUser | null = readStoredUser();

let referentialImportType: ReferentialImportType = "article";
let referentialImportRows: ReferentialImportRow[] = [];
let articleImportRows: ArticleImportRow[] = [];
let inventoryImportRows: InventoryImportRow[] = [];
const referentialImportFields: Record<
  ReferentialImportType,
  Array<[string, string]>
> = {
  article: [
    ["designation", "Designation"],
    ["category", "Famille"],
    ["unit", "Unite"],
    ["trackingMode", "Mode de suivi"],
    ["minimumStock", "Stock minimum"],
    ["securityStock", "Stock securite"],
    ["initialStock", "Stock de depart"],
    ["referencePrice", "Prix indicatif"],
    ["supplier", "Fournisseur habituel"],
    ["location", "Emplacement de depart"],
  ],
  supplier: [
    ["name", "Raison sociale"],
    ["fiscalId", "ID fiscal / NCC"],
    ["category", "Categorie"],
    ["contact", "Contact"],
    ["phone", "Telephone"],
    ["email", "Email"],
    ["address", "Adresse"],
  ],
  client: [
    ["name", "Raison sociale"],
    ["contact", "Contact"],
    ["phone", "Telephone"],
    ["email", "Email"],
  ],
  project: [
    ["name", "Nom projet"],
    ["client", "Client"],
    ["projectManager", "Chef de projet"],
    ["region", "Region"],
    ["city", "Ville"],
    ["startDate", "Date debut"],
    ["endDate", "Date fin prevue"],
  ],
  site: [
    ["name", "Nom du site"],
    ["project", "Projet rattache"],
    ["responsible", "Responsable site"],
    ["region", "Region"],
    ["city", "Ville"],
    ["address", "Adresse / repere"],
  ],
  employee: [
    ["lastName", "Nom"],
    ["firstName", "Prenom"],
    ["department", "Departement"],
    ["role", "Role"],
    ["phone", "Telephone"],
  ],
  location: [
    ["name", "Nom emplacement"],
    ["type", "Type"],
    ["responsible", "Responsable"],
    ["project", "Projet rattache"],
    ["city", "Ville"],
    ["address", "Adresse / zone"],
  ],
  teamService: [
    ["name", "Nom equipe / service"],
    ["type", "Type"],
    ["manager", "Responsable"],
  ],
};

function readStoredUser(): StockUser | null {
  const raw = localStorage.getItem("stock-hub.user");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StockUser;
    return parsed?.identifier || parsed?.email ? parsed : null;
  } catch {
    return null;
  }
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
  const error = root.querySelector<HTMLElement>("#loginError");
  if (!error) return;
  error.textContent = message ?? "";
  error.classList.toggle("hidden", !message);
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
  const overlay = root.querySelector<HTMLElement>("#loginOverlay");
  if (overlay) overlay.style.display = "flex";
}

function hideLogin(root: HTMLElement) {
  const overlay = root.querySelector<HTMLElement>("#loginOverlay");
  if (overlay) overlay.style.display = "none";
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
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("#home .bg-white.rounded-xl"),
  );
  const card = cards.find((element) => element.textContent?.includes(label));
  const number = card?.querySelector<HTMLElement>(".text-3xl");
  if (number) number.textContent = formatNumber(value);
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
  getDashboardSummary()
    .then((summary) => {
      setCardValue(root, "Articles actifs", summary.articles);
      setText(root, "#homeArticlesCount", summary.articles);
      setCardValue(root, "Ruptures", summary.ruptures);
      setText(root, "#homeRupturesCount", summary.ruptures);
      setCardValue(root, "Equipements affectes", summary.equipmentAssigned);
      setText(root, "#homeEquipmentsCount", summary.equipmentAssigned);
      setCardValue(root, "Mouvements du jour", summary.movementsToday);
      setText(root, "#homeMovementsCount", summary.movementsToday);
      window.lucide?.createIcons();
    })
    .catch(() => {
      // La maquette reste visible si l'API locale n'est pas lancee.
    });
}

function articleRow(article: Article) {
  const tracking =
    article.trackingMode === "INDIVIDUAL"
      ? "Suivi individuel"
      : "Article en quantite";
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(article.code)}</td><td class="px-5 py-4">${escapeHtml(article.designation)}</td><td class="px-5 py-4">${escapeHtml(article.category)}</td><td class="px-5 py-4">${escapeHtml(article.unit)}</td><td class="px-5 py-4">${badge(tracking)}</td><td class="px-5 py-4">${badge(article.active ? "Actif" : "Inactif", article.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('article','${article.id}')`)}</td></tr>`;
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
function supplierRow(supplier: Supplier) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(supplier.code)}</td><td class="px-5 py-4">${escapeHtml(supplier.name)}</td><td class="px-5 py-4">${escapeHtml(supplier.contact ?? "-")}</td><td class="px-5 py-4">${escapeHtml(supplier.phone ?? "-")}</td><td class="px-5 py-4">${escapeHtml(supplier.email ?? "-")}</td><td class="px-5 py-4">${badge(supplier.active ? "Actif" : "Inactif", supplier.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('supplier','${supplier.id}')`)}</td></tr>`;
}

function projectRow(project: StockProject) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(project.code)}</td><td class="px-5 py-4">${escapeHtml(project.name)}</td><td class="px-5 py-4">${escapeHtml(projectClientName(project))}</td><td class="px-5 py-4">${escapeHtml(project.region ?? "-")}</td><td class="px-5 py-4">${escapeHtml(project.city ?? "-")}</td><td class="px-5 py-4">${escapeHtml(projectManagerName(project.projectManagerId))}</td><td class="px-5 py-4">${badge(project.active ? "Actif" : "Inactif", project.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('project','${project.id}')`)}</td></tr>`;
}

function locationRow(location: StockLocation) {
  const type = location.type.replace(/_/g, " ");
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(location.code)}</td><td class="px-5 py-4">${escapeHtml(location.name)}</td><td class="px-5 py-4">${escapeHtml(type)}</td><td class="px-5 py-4">${escapeHtml(location.address ?? "-")}</td><td class="px-5 py-4">${escapeHtml(location.responsible ?? "-")}</td><td class="px-5 py-4">${badge(location.active ? "Actif" : "Inactif", location.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><div class="flex items-center justify-end gap-2"><button data-action="filterStockByLocation('${location.id}')" class="text-accent-600 font-semibold">Voir stock</button>${actionEyeFor(`openReferentialDetail('location','${location.id}')`)}</div></td></tr>`;
}

function siteRow(location: StockLocation) {
  const project = latestProjects.find((item) => item.id === location.projectId);
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(location.code)}</td><td class="px-5 py-4">${escapeHtml(project ? `${project.code} - ${project.name}` : "-")}</td><td class="px-5 py-4">${escapeHtml(location.name)}</td><td class="px-5 py-4">${escapeHtml(project?.region ?? "-")}</td><td class="px-5 py-4">${escapeHtml(project?.city ?? "-")}</td><td class="px-5 py-4">${badge(location.active ? "Ouvert" : "Ferme", location.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('site','${location.id}')`)}</td></tr>`;
}

function employeeRefRow(employee: Employee) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(employee.matricule)}</td><td class="px-5 py-4">${escapeHtml(employee.lastName)}</td><td class="px-5 py-4">${escapeHtml(employee.firstName)}</td><td class="px-5 py-4">${escapeHtml(employee.role ?? "-")}</td><td class="px-5 py-4">${badge(employee.active ? "Actif" : "Inactif", employee.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('employee','${employee.id}')`)}</td></tr>`;
}

// --- Stock view enrichment state ---
let openInventoryArticleId: string | null = null;
let openInventoryLocationId: string | null = null;
let openInventoryScope: "local" | "global" | null = null;

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
      openInventoryArticleId = null;
      openInventoryLocationId = null;
      openInventoryScope = null;
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
  openInventoryArticleId = null;
  openInventoryLocationId = null;
  openInventoryScope = null;
  clearHistoryMovementDrawerPage();
  openVueStockDrawer(root, levelId, vueStockContext());
}

function closeStockDrawer(root: HTMLElement) {
  clearVueStockDrawerState();
  openInventoryArticleId = null;
  openInventoryLocationId = null;
  openInventoryScope = null;
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
    ENTRY: "EntrÃƒÂ©e",
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
  return latestStockLevels.filter(
    (level) =>
      level.article.minimumStock > 0 &&
      level.quantity <= level.article.minimumStock,
  );
}

function reorderQuantity(level: StockLevel) {
  const target = level.article.minimumStock * 2;
  return Math.max(target - level.quantity, 0);
}

function reapproRow(level: StockLevel) {
  const rupture = level.quantity <= 0;
  const quantityClass = rupture ? "text-error-700" : "text-warning-700";
  const reorder = reorderQuantity(level);
  const value = reorder * Number(level.article.referencePrice ?? 0);
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
    '<td class="px-5 py-4 text-right font-bold ' +
    quantityClass +
    '">' +
    formatNumber(level.quantity) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(level.article.minimumStock) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(reorder) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(value) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(rupture ? "Rupture" : "Stock bas", rupture ? "error" : "warning") +
    "</td>" +
    "</tr>"
  );
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
function setReapproCardValue(
  root: HTMLElement,
  label: string,
  value: number | string,
) {
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("#reappro .rounded-xl"),
  );
  const card = cards.find((element) => element.textContent?.includes(label));
  const number = card?.querySelector<HTMLElement>(".text-3xl");
  if (number) number.textContent = formatNumber(value);
}

function renderReappro(root: HTMLElement) {
  const levels = reapproLevels();
  const body = root.querySelector<HTMLElement>("#reappro-table tbody");
  if (body)
    body.innerHTML = levels.length
      ? levels.map(reapproRow).join("")
      : emptyRow(7, "Aucun article sous seuil pour le moment.");
  const watchBody = root.querySelector<HTMLElement>("#home-watch-stock-body");
  if (watchBody)
    watchBody.innerHTML = levels.length
      ? levels.map(watchStockRow).join("")
      : emptyRow(6, "Aucun stock a surveiller pour le moment.");
  const ruptures = levels.filter((level) => level.quantity <= 0).length;
  const lowStock = levels.filter((level) => level.quantity > 0).length;
  const estimated = levels.reduce(
    (sum, level) =>
      sum + reorderQuantity(level) * Number(level.article.referencePrice ?? 0),
    0,
  );
  setReapproCardValue(root, "Rupture", ruptures);
  setReapproCardValue(root, "Sous stock securite", lowStock);
  setReapproCardValue(root, "Valeur a commander", estimated);
  setText(root, "#reapproRuptureCount", ruptures);
  setText(root, "#reapproLowStockCount", lowStock);
  setText(root, "#reapproEstimatedValue", estimated);
  window.lucide?.createIcons();
}

function inventoryPairKey(articleId: string, locationId: string) {
  return articleId + "::" + locationId;
}

function openInventoryDetail(
  root: HTMLElement,
  articleId: string,
  locationId: string,
) {
  clearVueStockDrawerState();
  openInventoryArticleId = articleId;
  openInventoryLocationId = locationId;
  openInventoryScope = "local";
  clearHistoryMovementDrawerPage();
  renderInventoryDrawer(root);
}

function openInventoryGlobalDetail(root: HTMLElement, articleId: string) {
  clearVueStockDrawerState();
  openInventoryArticleId = articleId;
  openInventoryLocationId = null;
  openInventoryScope = "global";
  clearHistoryMovementDrawerPage();
  renderInventoryDrawer(root);
}

function inventoryBreakdownFromObservation(observation?: string | null) {
  const text = observation ?? "";
  const read = (label: string) => {
    const match = text.match(new RegExp(label + "\\s+(\\d+(?:[.,]\\d+)?)", "i"));
    return match ? Number(match[1].replace(",", ".")) : 0;
  };
  const structured = /Inventaire:\s*constate/i.test(text);
  const userNote = text
    .split("|")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part &&
        !/^Inventaire:/i.test(part) &&
        !/^(bon etat|a reparer|hors service)\s+/i.test(part),
    )
    .join(" | ");
  return {
    structured,
    counted: read("constate"),
    good: read("bon etat"),
    repair: read("a reparer"),
    outOfService: read("hors service"),
    justification: userNote,
  };
}

function latestInventoryMovementLine(articleId: string, locationId: string) {
  return latestMovements
    .filter(
      (movement) =>
        movement.type === "ADJUSTMENT" &&
        movement.status !== "CANCELLED" &&
        movement.lines.some((line) => line.articleId === articleId) &&
        (movement.fromLocationId === locationId ||
          movement.toLocationId === locationId),
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0]
    ?.lines.find((line) => line.articleId === articleId);
}

function inventoryComputedLine(level: StockLevel): InventoryComputedLine {
  const lastLine = latestInventoryMovementLine(
    level.article.id,
    level.location.id,
  );
  const breakdown = inventoryBreakdownFromObservation(lastLine?.observation);
  const hasCount = Boolean(lastLine);
  const theoretical = Number(lastLine?.expectedQuantity ?? level.quantity ?? 0);
  const counted = hasCount
    ? Number(lastLine?.completedQuantity ?? breakdown.counted ?? 0)
    : Number(level.quantity ?? 0);
  const good = hasCount
    ? breakdown.structured
      ? breakdown.good
      : counted
    : Math.max(counted, 0);
  const repair = hasCount && breakdown.structured ? breakdown.repair : 0;
  const outOfService =
    hasCount && breakdown.structured ? breakdown.outOfService : 0;
  return {
    articleId: level.article.id,
    article: level.article,
    locationId: level.location.id,
    location: level.location,
    theoretical,
    counted,
    good,
    repair,
    outOfService,
    gap: counted - theoretical,
    justification: breakdown.justification || lastLine?.observation || "",
    countedAt: hasCount ? "1" : undefined,
  };
}

function inventoryLineStatus(line: InventoryComputedLine) {
  if (!line.countedAt) return { label: "A compter", tone: "gray" as const };
  if (line.gap === 0) return { label: "Valide", tone: "success" as const };
  return { label: "Ecart a justifier", tone: "warning" as const };
}

function inventoryLineIsValidated(line: InventoryComputedLine) {
  return line.gap === 0;
}

function inventoryRow(line: InventoryComputedLine) {
  const action =
    "openCount('" + line.article.id + "','" + line.location.id + "')";
  const detailAction =
    "openInventoryDetail('" +
    line.article.id +
    "','" +
    line.location.id +
    "')";
  const status = inventoryLineStatus(line);
  const rowClass = line.gap !== 0 ? "bg-error-50/40" : "";
  return (
    `<tr class="cursor-pointer hover:bg-gray-50 transition-colors ${rowClass}" data-action="${detailAction}">` +
    '<td class="px-5 py-4"><div class="font-bold">' +
    escapeHtml(line.article.designation) +
    '</div><div class="text-xs text-gray-500">' +
    escapeHtml(line.article.code) +
    "</div></td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(line.theoretical) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(line.counted) +
    "</td>" +
    '<td class="px-5 py-4 text-right text-success-700 font-bold">' +
    formatNumber(line.good) +
    "</td>" +
    '<td class="px-5 py-4 text-right text-warning-700 font-bold">' +
    formatNumber(line.repair) +
    "</td>" +
    '<td class="px-5 py-4 text-right text-error-700 font-bold">' +
    formatNumber(line.outOfService) +
    "</td>" +
    `<td class="px-5 py-4 text-center font-bold ${line.gap !== 0 ? "text-error-700" : ""}">` +
    (line.gap === 0 ? "-" : formatNumber(line.gap)) +
    "</td>" +
    '<td class="px-5 py-4 text-gray-600">' +
    escapeHtml(line.justification || "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(status.label, status.tone) +
    "</td>" +
    '<td class="px-5 py-4 text-right"><button data-action="' +
    action +
    '" title="Saisir ou modifier le comptage" class="w-9 h-9 rounded-lg border border-gray-300 bg-white text-accent-600 inline-flex items-center justify-center"><i data-lucide="pencil" class="w-4 h-4"></i></button></td>' +
    "</tr>"
  );
}

function inventoryLevelsForLocation(locationId: string): StockLevel[] {
  const location = latestLocations.find((item) => item.id === locationId);
  if (!location) return [];
  const levels = latestStockLevels.filter(
    (level) => level.location.id === locationId,
  );
  const knownArticleIds = new Set(levels.map((level) => level.article.id));
  const defaultArticles = latestArticles
    .filter(
      (article) =>
        article.active &&
        article.defaultLocationId === locationId &&
        !knownArticleIds.has(article.id),
    )
    .map((article) => ({
      id: `pending-${article.id}-${locationId}`,
      article,
      location,
      quantity: 0,
    }));
  return [...levels, ...defaultArticles].sort((a, b) =>
    a.article.code.localeCompare(b.article.code),
  );
}

function inventoryComputedLinesForLocation(locationId: string) {
  return inventoryLevelsForLocation(locationId).map(inventoryComputedLine);
}

function allInventoryComputedLines() {
  const locationIds = new Set(
    latestLocations
      .filter((location) =>
        ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE", "SITE", "CHANTIER"].includes(
          location.type.toUpperCase(),
        ),
      )
      .map((location) => location.id),
  );
  const pairMap = new Map<string, StockLevel>();
  latestStockLevels.forEach((level) => {
    if (locationIds.has(level.location.id)) {
      pairMap.set(inventoryPairKey(level.article.id, level.location.id), level);
    }
  });
  latestArticles
    .filter(
      (article) =>
        article.active &&
        article.defaultLocationId &&
        locationIds.has(article.defaultLocationId),
    )
    .forEach((article) => {
      const location = latestLocations.find(
        (item) => item.id === article.defaultLocationId,
      );
      if (!location) return;
      const key = inventoryPairKey(article.id, location.id);
      if (!pairMap.has(key)) {
        pairMap.set(key, {
          id: `pending-${article.id}-${location.id}`,
          article,
          location,
          quantity: 0,
        });
      }
    });
  return [...pairMap.values()].map(inventoryComputedLine);
}

function inventoryLocationsPreview(articleLines: InventoryComputedLine[]) {
  const relevant = articleLines
    .filter((line) => line.theoretical > 0 || line.countedAt)
    .sort((a, b) => {
      if (a.gap !== 0 && b.gap === 0) return -1;
      if (a.gap === 0 && b.gap !== 0) return 1;
      return a.location.name.localeCompare(b.location.name);
    });
  if (!relevant.length) return '<span class="text-gray-400">-</span>';
  const fullTitle = relevant
    .map((line) => line.location.name + (line.gap !== 0 ? " (ecart " + formatNumber(line.gap) + ")" : ""))
    .join(", ");
  const visible = relevant.slice(0, 2);
  const hidden = relevant.length - visible.length;
  const badges = visible
    .map((line) => {
      const tone =
        line.gap !== 0
          ? "border-error-100 bg-error-50 text-error-700"
          : "border-gray-200 bg-gray-50 text-gray-700";
      return `<span class="inline-flex max-w-[110px] shrink items-center truncate rounded-full border px-2 py-1 text-xs font-semibold ${tone}" title="${escapeHtml(line.location.name)}">${escapeHtml(line.location.name)}</span>`;
    })
    .join("");
  const more =
    hidden > 0
      ? `<span class="inline-flex shrink-0 items-center rounded-full border border-accent-100 bg-accent-50 px-2 py-1 text-xs font-bold text-accent-700" title="${escapeHtml(fullTitle)}">+${formatNumber(hidden)} autre${hidden > 1 ? "s" : ""}</span>`
      : "";
  return `<div class="flex max-w-[260px] items-center gap-1 overflow-hidden" title="${escapeHtml(fullTitle)}">${badges}${more}</div>`;
}

function inventoryLinesForDrawer() {
  if (!openInventoryArticleId || !openInventoryScope) return [];
  if (openInventoryScope === "local") {
    if (!openInventoryLocationId) return [];
    return inventoryComputedLinesForLocation(openInventoryLocationId).filter(
      (line) => line.articleId === openInventoryArticleId,
    );
  }
  return allInventoryComputedLines().filter(
    (line) => line.articleId === openInventoryArticleId,
  );
}

function inventoryTotals(lines: InventoryComputedLine[]) {
  return lines.reduce(
    (sum, line) => ({
      theoretical: sum.theoretical + line.theoretical,
      counted: sum.counted + line.counted,
      good: sum.good + line.good,
      repair: sum.repair + line.repair,
      outOfService: sum.outOfService + line.outOfService,
      gap: sum.gap + line.gap,
    }),
    {
      theoretical: 0,
      counted: 0,
      good: 0,
      repair: 0,
      outOfService: 0,
      gap: 0,
    },
  );
}

function inventoryMovementLocation(movement: StockMovement) {
  return (
    latestLocations.find(
      (location) =>
        location.id === movement.toLocationId ||
        location.id === movement.fromLocationId,
    ) ?? null
  );
}

function inventoryHistoryForDrawer(
  articleId: string,
  scope: "local" | "global",
  locationId: string | null,
  dateFrom: string,
  dateTo: string,
) {
  return latestMovements
    .filter((movement) => {
      if (movement.type !== "ADJUSTMENT") return false;
      if (movement.status === "CANCELLED" || movement.status === "DRAFT")
        return false;
      if (dateFrom && movement.date < dateFrom) return false;
      if (dateTo && movement.date > dateTo + "T23:59:59") return false;
      if (!movement.lines.some((line) => line.articleId === articleId))
        return false;
      if (scope === "local") {
        return (
          movement.fromLocationId === locationId ||
          movement.toLocationId === locationId
        );
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function inventoryDrawerStatCard(
  label: string,
  value: number,
  className = "",
  unit = "",
) {
  return `
    <div class="p-3 rounded-xl bg-gray-50 border border-gray-100 ${className}">
      <div class="text-xs font-semibold text-gray-500 mb-1">${escapeHtml(label)}</div>
      <div class="font-bold text-base">${formatNumber(value)}${unit ? ` <span class="text-xs font-normal text-gray-400">${escapeHtml(unit)}</span>` : ""}</div>
    </div>
  `;
}

function renderInventoryDrawer(root: HTMLElement) {
  const drawer = root.querySelector<HTMLElement>("#stockDrawer");
  const backdrop = root.querySelector<HTMLElement>("#stockDrawerBackdrop");
  if (!drawer || !backdrop || !openInventoryArticleId || !openInventoryScope)
    return;

  const article = latestArticles.find(
    (item) => item.id === openInventoryArticleId,
  );
  const lines = inventoryLinesForDrawer();
  if (!article || !lines.length) {
    showToast(root, "Article inventaire introuvable.");
    return;
  }

  backdrop.classList.remove("hidden");
  drawer.classList.remove("translate-x-full");
  drawer.classList.add("translate-x-0");
  drawer.classList.add("stock-drawer--open");

  const titles = drawer.querySelectorAll<HTMLElement>("h2");
  if (titles[0])
    titles[0].innerHTML =
      '<i data-lucide="info" class="w-4 h-4 text-accent-600"></i>Informations article';
  if (titles[1])
    titles[1].innerHTML =
      '<i data-lucide="history" class="w-4 h-4 text-accent-600"></i>Historique des mouvements';
  drawer
    .querySelector<HTMLElement>("#stockDrawerHistory")
    ?.previousElementSibling?.classList.remove("hidden");

  const totals = inventoryTotals(lines);
  const header = drawer.querySelector<HTMLElement>("#stockDrawerHeader");
  if (header) {
    const locationLabel =
      openInventoryScope === "local"
        ? lines[0]?.location.name ?? "Emplacement"
        : "Synthese globale inventaire";
    header.innerHTML = `
      <div class="min-w-0 flex-1">
        <div class="font-bold text-lg truncate">${escapeHtml(article.designation)}</div>
        <div class="text-sm text-gray-500">${escapeHtml(article.code)} &bull; ${escapeHtml(locationLabel)}</div>
      </div>
    `;
  }

  const infoEl = drawer.querySelector<HTMLElement>("#stockDrawerInfo");
  if (infoEl) {
    const gapClass =
      totals.gap !== 0
        ? "bg-error-50 border-error-100 text-error-700"
        : "bg-success-50 border-success-100 text-success-700";
    const locationsBlock =
      openInventoryScope === "global"
        ? `<div class="col-span-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div class="text-xs font-semibold text-gray-500 mb-2">Emplacements concernes</div>
            ${inventoryLocationsPreview(lines)}
          </div>`
        : "";
    infoEl.innerHTML = `
      <div class="grid grid-cols-2 gap-3 text-sm">
        ${inventoryDrawerStatCard("Stock theorique", totals.theoretical, "", article.unit)}
        ${inventoryDrawerStatCard("Quantite constatee", totals.counted, "", article.unit)}
        ${inventoryDrawerStatCard("Bon etat", totals.good, "text-success-700", article.unit)}
        ${inventoryDrawerStatCard("A reparer", totals.repair, "text-warning-700", article.unit)}
        ${inventoryDrawerStatCard("Hors service", totals.outOfService, "text-error-700", article.unit)}
        ${inventoryDrawerStatCard("Ecart", totals.gap, gapClass, article.unit)}
        ${locationsBlock}
      </div>
    `;
  }

  const histEl = drawer.querySelector<HTMLElement>("#stockDrawerHistory");
  if (histEl) {
    const dateFrom =
      drawer.querySelector<HTMLInputElement>("#stockDrawerDateFrom")?.value ??
      "";
    const dateTo =
      drawer.querySelector<HTMLInputElement>("#stockDrawerDateTo")?.value ?? "";
    const movements = inventoryHistoryForDrawer(
      article.id,
      openInventoryScope,
      openInventoryLocationId,
      dateFrom,
      dateTo,
    );
    if (!movements.length) {
      histEl.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Aucun historique inventaire pour cet article.</p>`;
    } else {
      histEl.innerHTML = movements
        .map((movement) => {
          const line = movement.lines.find((item) => item.articleId === article.id);
          const breakdown = inventoryBreakdownFromObservation(line?.observation);
          const theoretical = Number(line?.expectedQuantity ?? 0);
          const counted = Number(
            line?.completedQuantity ??
              (breakdown.structured ? breakdown.counted : 0),
          );
          const good = breakdown.structured ? breakdown.good : counted;
          const repair = breakdown.structured ? breakdown.repair : 0;
          const outOfService = breakdown.structured
            ? breakdown.outOfService
            : 0;
          const gap = counted - theoretical;
          const location = inventoryMovementLocation(movement);
          const locationName = location?.name ?? "-";
          const note = breakdown.justification || line?.observation || movement.notes || "-";
          return `
            <div class="py-3 border-b border-gray-100 last:border-0">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    ${movementTypeBadge("ADJUSTMENT")}
                    <span class="text-xs text-gray-500">${escapeHtml(formatDate(movement.date))}</span>
                  </div>
                  <div class="mt-1 text-sm font-bold truncate">${escapeHtml(movement.reference)}</div>
                  <div class="text-xs text-gray-500 truncate">${escapeHtml(locationName)}</div>
                </div>
                <div class="text-right text-sm font-bold ${gap !== 0 ? "text-error-700" : "text-success-700"}">${gap === 0 ? "-" : formatNumber(gap)}</div>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div class="rounded-lg bg-gray-50 px-2 py-1"><span class="text-gray-500">Theorique</span><span class="float-right font-bold">${formatNumber(theoretical)}</span></div>
                <div class="rounded-lg bg-gray-50 px-2 py-1"><span class="text-gray-500">Constatee</span><span class="float-right font-bold">${formatNumber(counted)}</span></div>
                <div class="rounded-lg bg-success-50 px-2 py-1 text-success-700"><span>Bon etat</span><span class="float-right font-bold">${formatNumber(good)}</span></div>
                <div class="rounded-lg bg-warning-50 px-2 py-1 text-warning-700"><span>A reparer</span><span class="float-right font-bold">${formatNumber(repair)}</span></div>
                <div class="rounded-lg bg-error-50 px-2 py-1 text-error-700"><span>Hors service</span><span class="float-right font-bold">${formatNumber(outOfService)}</span></div>
              </div>
              <div class="mt-2 text-xs text-gray-500">${escapeHtml(note)}</div>
            </div>
          `;
        })
        .join("");
    }
  }

  window.lucide?.createIcons();
}

function renderInventoryGlobal(root: HTMLElement) {
  const lines = allInventoryComputedLines();
  const countedLines = lines.filter((line) => line.countedAt);
  const countedLocationIds = new Set(countedLines.map((line) => line.locationId));
  const gapLines = countedLines.filter((line) => line.gap !== 0);
  const validLocationIds = new Set(
    [...countedLocationIds].filter((locationId) => {
      const locationLines = lines.filter((line) => line.locationId === locationId);
      return (
        locationLines.length > 0 &&
        locationLines.every((line) => line.countedAt && line.gap === 0)
      );
    }),
  );

  setText(root, "#inventoryGlobalLocations", countedLocationIds.size);
  setText(
    root,
    "#inventoryGlobalArticles",
    new Set(countedLines.map((line) => line.articleId)).size,
  );
  setText(root, "#inventoryGlobalGaps", gapLines.length);
  setText(root, "#inventoryGlobalValid", validLocationIds.size);
  setText(
    root,
    "#inventoryGlobalValidHint",
    "Sur " + formatNumber(new Set(lines.map((line) => line.locationId)).size) + " emplacements",
  );

  const byArticle = new Map<string, InventoryComputedLine[]>();
  lines.forEach((line) => {
    byArticle.set(line.articleId, [...(byArticle.get(line.articleId) ?? []), line]);
  });
  const articleRows = [...byArticle.values()]
    .map((articleLines) => {
      const first = articleLines[0];
      const totals = articleLines.reduce(
        (sum, line) => ({
          theoretical: sum.theoretical + line.theoretical,
          counted: sum.counted + line.counted,
          good: sum.good + line.good,
          repair: sum.repair + line.repair,
          outOfService: sum.outOfService + line.outOfService,
          gap: sum.gap + line.gap,
        }),
        {
          theoretical: 0,
          counted: 0,
          good: 0,
          repair: 0,
          outOfService: 0,
          gap: 0,
        },
      );
      const counted = articleLines.some((line) => line.countedAt);
      const status = !counted
        ? { label: "A compter", tone: "gray" as const }
        : totals.gap === 0
          ? { label: "Valide", tone: "success" as const }
          : { label: "Ecart a justifier", tone: "warning" as const };
      return `<tr class="cursor-pointer hover:bg-gray-50 transition-colors ${totals.gap !== 0 ? "bg-error-50/40" : ""}" data-action="openInventoryGlobalDetail('${escapeHtml(first.article.id)}')">
        <td class="px-5 py-4"><div class="font-bold">${escapeHtml(first.article.designation)}</div><div class="text-xs text-gray-500">${escapeHtml(first.article.code)}</div></td>
        <td class="px-5 py-4 text-right">${formatNumber(totals.theoretical)}</td>
        <td class="px-5 py-4 text-right font-bold">${formatNumber(totals.counted)}</td>
        <td class="px-5 py-4 text-right text-success-700 font-bold">${formatNumber(totals.good)}</td>
        <td class="px-5 py-4 text-right text-warning-700 font-bold">${formatNumber(totals.repair)}</td>
        <td class="px-5 py-4 text-right text-error-700 font-bold">${formatNumber(totals.outOfService)}</td>
        <td class="px-5 py-4 text-center font-bold ${totals.gap !== 0 ? "text-error-700" : ""}">${totals.gap === 0 ? "-" : formatNumber(totals.gap)}</td>
        <td class="px-5 py-4">${inventoryLocationsPreview(articleLines)}</td>
        <td class="px-5 py-4">${badge(status.label, status.tone)}</td>
      </tr>`;
    })
    .sort((a, b) => a.localeCompare(b));
  const globalBody = root.querySelector<HTMLElement>("#inventoryGlobalTable tbody");
  if (globalBody) {
    globalBody.innerHTML = articleRows.length
      ? articleRows.join("")
      : emptyRow(9, "Aucune synthese inventaire pour le moment.");
  }

}

function renderInventory(root: HTMLElement) {
  const select = root.querySelector<HTMLSelectElement>(
    "#inventoryLocationSelect",
  );
  const stockLocations = latestLocations.filter((location) =>
    ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE", "SITE", "CHANTIER"].includes(
      location.type.toUpperCase(),
    ),
  );
  if (select) {
    const previous = select.value;
    fillSelect(
      select,
      locationOptions(stockLocations),
      stockLocations.length
        ? "Selectionner un emplacement"
        : "Aucun emplacement en base",
    );
    if (
      previous &&
      stockLocations.some((location) => location.id === previous)
    ) {
      select.value = previous;
    } else {
      const firstWithStock = latestStockLevels.find((level) =>
        stockLocations.some((location) => location.id === level.location.id),
      );
      const firstWithDefaultArticle = latestArticles.find(
        (article) =>
          article.defaultLocationId &&
          stockLocations.some(
            (location) => location.id === article.defaultLocationId,
          ),
      );
      select.value =
        firstWithStock?.location.id ??
        firstWithDefaultArticle?.defaultLocationId ??
        stockLocations[0]?.id ??
        "";
    }
  }
  const selectedLocationId = select?.value ?? "";
  const search = articleImportKey(
    root.querySelector<HTMLInputElement>("#inventorySearchInput")?.value ?? "",
  );
  const hideValidated = Boolean(
    root.querySelector<HTMLInputElement>("#inventoryHideValidated")?.checked,
  );
  const allLines = selectedLocationId
    ? inventoryComputedLinesForLocation(selectedLocationId)
    : [];
  const levels = allLines.filter((line) => {
    const text = articleImportKey(
      `${line.article.code} ${line.article.designation} ${line.article.category}`,
    );
    if (search && !text.includes(search)) return false;
    if (hideValidated && inventoryLineIsValidated(line)) return false;
    return true;
  });
  const inventoryBody = root.querySelector<HTMLElement>(
    "#inventoryTable tbody",
  );
  if (inventoryBody) {
    inventoryBody.innerHTML = levels.length
      ? levels.map(inventoryRow).join("")
      : emptyRow(
          10,
          selectedLocationId && allLines.length && (search || hideValidated)
            ? "Aucune ligne ne correspond aux filtres."
            : selectedLocationId
            ? "Aucun article ou stock theorique pour cet emplacement."
            : "Selectionne un emplacement pour lancer l'inventaire.",
        );
  }
  const today = new Date().toISOString().slice(0, 10);
  setText(root, "#inventoryDate", selectedLocationId ? formatDate(today) : "-");
  setText(
    root,
    "#inventoryResponsible",
    currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "-",
  );
  const countElement = root.querySelector<HTMLElement>(
    "#inventoryLocationCount",
  );
  if (countElement)
    countElement.innerHTML = `${formatNumber(allLines.length)} <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">${formatNumber(allLines.filter((line) => line.countedAt).length)} saisi</span>`;
  renderInventoryGlobal(root);
  window.lucide?.createIcons();
}
function showInventoryMode(root: HTMLElement, mode: string) {
  const local = root.querySelector<HTMLElement>("#inventoryLocalPanel");
  const global = root.querySelector<HTMLElement>("#inventoryGlobalPanel");
  const localTab = root.querySelector<HTMLElement>("#inventoryLocalTab");
  const globalTab = root.querySelector<HTMLElement>("#inventoryGlobalTab");
  const isGlobal = mode === "global";
  local?.classList.toggle("hidden", isGlobal);
  global?.classList.toggle("hidden", !isGlobal);
  localTab?.classList.toggle("bg-white", !isGlobal);
  localTab?.classList.toggle("shadow-sm", !isGlobal);
  localTab?.classList.toggle("text-gray-500", isGlobal);
  globalTab?.classList.toggle("bg-white", isGlobal);
  globalTab?.classList.toggle("shadow-sm", isGlobal);
  globalTab?.classList.toggle("text-gray-500", !isGlobal);
  if (isGlobal) renderInventoryGlobal(root);
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
      <div class="doc-name"><div class="small">Document interne</div><div class="value">Demande de matÃƒÂ©riels</div><div class="hint">Document de sortie stock et remise matÃƒÂ©riel</div></div>
      <div class="meta"><div><b>Doc N</b><span>${escapeHtml(input.docCode)}</span></div><div><b>Demande</b><span>${escapeHtml(input.reference)}</span></div><div><b>Bon sortie</b><span>${escapeHtml(input.exitReference)}</span></div><div><b>Date</b><span>${escapeHtml(formatDate(input.date))}</span></div></div>
    </header>
    <div class="title">Demande de matÃƒÂ©riels</div>
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

function exportDateValue(value: string | Date | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function inventoryExportSearch(root?: HTMLElement) {
  return articleImportKey(
    root?.querySelector<HTMLInputElement>("#inventorySearchInput")?.value ?? "",
  );
}

function inventoryLineMatchesExportSearch(
  line: InventoryComputedLine,
  search: string,
) {
  if (!search) return true;
  return articleImportKey(
    `${line.article.code} ${line.article.designation} ${line.article.category}`,
  ).includes(search);
}

function inventoryGlobalExportRows(root?: HTMLElement) {
  const search = inventoryExportSearch(root);
  const byArticle = new Map<string, InventoryComputedLine[]>();
  allInventoryComputedLines()
    .filter((line) => inventoryLineMatchesExportSearch(line, search))
    .forEach((line) => {
      byArticle.set(line.articleId, [...(byArticle.get(line.articleId) ?? []), line]);
    });
  return [...byArticle.values()]
    .map((articleLines) => {
      const first = articleLines[0];
      const totals = articleLines.reduce(
        (sum, line) => ({
          theoretical: sum.theoretical + line.theoretical,
          counted: sum.counted + line.counted,
          good: sum.good + line.good,
          repair: sum.repair + line.repair,
          outOfService: sum.outOfService + line.outOfService,
          gap: sum.gap + line.gap,
        }),
        {
          theoretical: 0,
          counted: 0,
          good: 0,
          repair: 0,
          outOfService: 0,
          gap: 0,
        },
      );
      const counted = articleLines.some((line) => line.countedAt);
      return {
        article: first.article.designation,
        code: first.article.code,
        theoretical: totals.theoretical,
        counted: totals.counted,
        good: totals.good,
        repair: totals.repair,
        outOfService: totals.outOfService,
        gap: totals.gap,
        locations: articleLines.map((line) => line.location.name).join(", "),
        status: !counted ? "A compter" : totals.gap === 0 ? "Valide" : "Ecart a justifier",
      };
    })
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));
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
function selectedInventoryExportLocationId(root: HTMLElement) {
  return (
    root.querySelector<HTMLSelectElement>("#inventoryExportLocationSelect")
      ?.value ||
    root.querySelector<HTMLSelectElement>("#inventoryLocationSelect")?.value ||
    ""
  );
}

function inventoryLocationExportRows(root: HTMLElement) {
  const locationId = selectedInventoryExportLocationId(root);
  if (!locationId) return [];
  const search = inventoryExportSearch(root);
  const hideValidated = Boolean(
    root.querySelector<HTMLInputElement>("#inventoryHideValidated")?.checked,
  );
  return inventoryComputedLinesForLocation(locationId)
    .filter((line) => {
      if (!inventoryLineMatchesExportSearch(line, search)) return false;
      if (hideValidated && inventoryLineIsValidated(line)) return false;
      return true;
    })
    .sort((a, b) => a.article.code.localeCompare(b.article.code))
    .map((line) => ({
      article: line.article.designation,
      code: line.article.code,
      location: line.location.name,
      theoretical: line.theoretical,
      counted: line.counted,
      good: line.good,
      repair: line.repair,
      outOfService: line.outOfService,
      gap: line.gap,
      justification: line.justification,
      status: inventoryLineStatus(line).label,
    }));
}

function inventoryExportDataset(root: HTMLElement, scope: InventoryExportScope): {
  filenameKind: string;
  sheetName: string;
  title: string;
  columns: ExcelExportColumn[];
  rows: ExcelExportRow[];
} {
  if (scope === "global") {
    return {
      filenameKind: "inventaire-global",
      sheetName: "Inventaire global",
      title: "Synthese globale inventaire",
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
      rows: inventoryGlobalExportRows(root),
    };
  }
  const locationId = selectedInventoryExportLocationId(root);
  if (!locationId) {
    throw new Error("Selectionne l'emplacement a exporter.");
  }
  const locationName =
    latestLocations.find((location) => location.id === locationId)?.name ??
    "Emplacement";
  return {
    filenameKind: "inventaire-par-emplacement",
    sheetName: "Inventaire emplacement",
    title: "Inventaire - " + locationName,
    columns: [
      { key: "article", header: "Article" },
      { key: "code", header: "Code" },
      { key: "location", header: "Emplacement" },
      { key: "theoretical", header: "Stock theorique emplacement", type: "number" },
      { key: "counted", header: "Quantite constatee", type: "number" },
      { key: "good", header: "Bon etat", type: "number" },
      { key: "repair", header: "A reparer", type: "number" },
      { key: "outOfService", header: "Hors service", type: "number" },
      { key: "gap", header: "Ecart", type: "number" },
      { key: "justification", header: "Justification" },
      { key: "status", header: "Statut" },
    ],
    rows: inventoryLocationExportRows(root),
  };
}

async function downloadInventoryExcel(root: HTMLElement, scope: InventoryExportScope) {
  try {
    const dataset = inventoryExportDataset(root, scope);
    const date = new Date().toISOString().slice(0, 10);
    const filename = "stock-hub-" + dataset.filenameKind + "-" + date + ".xlsx";
    await exportWorkbook({
      filename,
      sheetName: dataset.sheetName,
      columns: dataset.columns,
      rows: dataset.rows,
    });
    closeModal(root, "inventoryExportModal");
    showToast(root, "Export Excel prepare : " + filename);
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Export Excel impossible.", "error");
  }
}

function inventoryPdfHtml(dataset: ReturnType<typeof inventoryExportDataset>) {
  const totalTheoretical = dataset.rows.reduce(
    (sum, row) => sum + Number(row.theoretical ?? 0),
    0,
  );
  const totalCounted = dataset.rows.reduce(
    (sum, row) => sum + Number(row.counted ?? 0),
    0,
  );
  const totalGap = dataset.rows.reduce(
    (sum, row) => sum + Number(row.gap ?? 0),
    0,
  );
  const header = dataset.columns
    .map(
      (column) =>
        `<th class="${column.type === "number" || column.type === "currency" ? "right" : ""}">${escapeHtml(column.header)}</th>`,
    )
    .join("");
  const rows = dataset.rows
    .map(
      (row) =>
        `<tr>${dataset.columns
          .map((column) => {
            const value = row[column.key];
            const text =
              column.type === "number" || column.type === "currency"
                ? formatNumber(Number(value ?? 0))
                : excelCellText(value);
            const emphasis =
              column.key === "gap" && Number(value ?? 0) !== 0
                ? " gap"
                : "";
            return `<td class="${column.type === "number" || column.type === "currency" ? "right strong" : ""}${emphasis}">${escapeHtml(text)}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(dataset.title)}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e9edf4; color: #0f172a; font-family: Arial, Helvetica, sans-serif; font-size: 10px; }
    .toolbar { width: 287mm; margin: 10px auto 0; display: flex; justify-content: flex-end; }
    .toolbar button { border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; padding: 7px 11px; font-weight: 800; cursor: pointer; font-size: 12px; }
    .page { width: 287mm; min-height: 200mm; margin: 10px auto 18px; background: #fff; padding: 10mm; box-shadow: 0 8px 26px rgba(15, 23, 42, .12); }
    .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12mm; border-bottom: 2px solid #d8e1ec; padding-bottom: 6mm; }
    .hub-logo { width: 24mm; height: 16mm; background: #e71845; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: .86; }
    .hub-logo-main { font-size: 20pt; font-weight: 950; letter-spacing: -.07em; }
    .hub-logo-tag { margin-top: 1.5mm; font-size: 3pt; font-weight: 900; letter-spacing: .04em; }
    .title { font-size: 18px; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; }
    .meta { color: #475569; font-size: 10px; margin-top: 2mm; }
    .kpis { display: flex; gap: 4mm; margin: 6mm 0; }
    .kpi { border: 1px solid #d3dcea; padding: 3mm 5mm; min-width: 36mm; }
    .kpi .label { color: #64748b; font-size: 8px; text-transform: uppercase; font-weight: 900; }
    .kpi .value { margin-top: 1.5mm; font-size: 14px; font-weight: 950; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #3746f5; color: #fff; font-size: 8px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
    td, th { border: 1px solid #cbd5e1; padding: 2.2mm; vertical-align: middle; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    .right { text-align: right; }
    .strong { font-weight: 900; }
    .gap { color: #b91c1c; }
    @media print { body { background: white; } .toolbar { display: none; } .page { width: 297mm; min-height: 210mm; margin: 0; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer PDF</button></div>
  <main class="page">
    <header class="head">
      <div>${hubLogoMarkup()}</div>
      <div><div class="title">${escapeHtml(dataset.title)}</div><div class="meta">Export genere le ${escapeHtml(formatDate(new Date()))} - ${formatNumber(dataset.rows.length)} ligne(s)</div></div>
    </header>
    <section class="kpis">
      <div class="kpi"><div class="label">Lignes</div><div class="value">${formatNumber(dataset.rows.length)}</div></div>
      <div class="kpi"><div class="label">Stock theorique</div><div class="value">${formatNumber(totalTheoretical)}</div></div>
      <div class="kpi"><div class="label">Quantite constatee</div><div class="value">${formatNumber(totalCounted)}</div></div>
      <div class="kpi"><div class="label">Ecart total</div><div class="value">${formatNumber(totalGap)}</div></div>
    </section>
    <table><thead><tr>${header}</tr></thead><tbody>${rows || `<tr><td colspan="${dataset.columns.length}">Aucune donnee a exporter.</td></tr>`}</tbody></table>
  </main>
</body>
</html>`;
}

function downloadInventoryPdf(root: HTMLElement, scope: InventoryExportScope) {
  let dataset: ReturnType<typeof inventoryExportDataset>;
  try {
    dataset = inventoryExportDataset(root, scope);
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Export PDF impossible.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour telecharger le PDF.", "error");
    return;
  }
  popup.document.write(inventoryPdfHtml(dataset));
  popup.document.close();
  closeModal(root, "inventoryExportModal");
  popup.focus();
  popup.print();
}

function prepareInventoryExportModal(root: HTMLElement) {
  const select = root.querySelector<HTMLSelectElement>(
    "#inventoryExportLocationSelect",
  );
  if (!select) return;
  const currentFilter =
    root.querySelector<HTMLSelectElement>("#inventoryLocationSelect")?.value ?? "";
  const previous = select.value || currentFilter;
  const locationsWithInventory = latestLocations
    .filter((location) =>
      allInventoryComputedLines().some((line) => line.locationId === location.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  select.innerHTML =
    '<option value="">Selectionner un emplacement</option>' +
    locationsWithInventory
      .map((location) => option(location.id, `${location.code} - ${location.name}`))
      .join("");
  if (locationsWithInventory.some((location) => location.id === previous)) {
    select.value = previous;
  }
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

function updateCountSummary(modal: HTMLElement) {
  const theoretical = toNumber(modal.dataset.theoretical ?? "0");
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const counted = toNumber(inputs[0]?.value ?? "0");
  const good = toNumber(inputs[1]?.value ?? "0");
  const repair = toNumber(inputs[2]?.value ?? "0");
  const out = toNumber(inputs[3]?.value ?? "0");
  const gap = counted - theoretical;
  const toTreat = repair + out;
  const gapNode = modal.querySelector<HTMLElement>(
    '[data-count-summary="gap"]',
  );
  const usableNode = modal.querySelector<HTMLElement>(
    '[data-count-summary="usable"]',
  );
  const toTreatNode = modal.querySelector<HTMLElement>(
    '[data-count-summary="toTreat"]',
  );
  if (gapNode) {
    gapNode.textContent = formatNumber(gap);
    gapNode.className =
      "mt-2 h-11 rounded-lg border px-3 flex items-center font-bold " +
      (gap === 0
        ? "border-success-100 bg-success-50 text-success-700"
        : gap < 0
          ? "border-error-100 bg-error-50 text-error-700"
          : "border-warning-100 bg-warning-50 text-warning-700");
  }
  if (usableNode) usableNode.textContent = formatNumber(good);
  if (toTreatNode) {
    toTreatNode.textContent = formatNumber(toTreat);
    toTreatNode.className =
      "mt-2 h-11 rounded-lg border px-3 flex items-center font-bold " +
      (toTreat > 0
        ? "border-warning-100 bg-warning-50 text-warning-700"
        : "border-gray-200 bg-gray-50 text-gray-700");
  }
}

async function populateCountModal(
  root: HTMLElement,
  articleId: string,
  locationId: string,
) {
  const modal = root.querySelector<HTMLElement>("#countModal");
  if (!modal) return;
  latestStockLevels = await getStockLevels().catch(() => latestStockLevels);
  const location = latestLocations.find((item) => item.id === locationId);
  const level = latestStockLevels.find(
    (item) => item.article.id === articleId && item.location.id === locationId,
  );
  const article =
    level?.article ?? latestArticles.find((item) => item.id === articleId);
  if (!article || !location) {
    showToast(root, "Impossible de charger la ligne d'inventaire.", "error");
    return;
  }
  const computed = inventoryComputedLine(
    level ?? {
      id: `pending-${articleId}-${locationId}`,
      article,
      location,
      quantity: 0,
    },
  );
  const theoretical = computed.theoretical;
  modal.dataset.articleId = articleId;
  modal.dataset.locationId = locationId;
  modal.dataset.theoretical = String(theoretical);
  const cards = Array.from(modal.querySelectorAll<HTMLElement>(".grid .p-4"));
  if (cards[0])
    cards[0].innerHTML = `<div class="text-xs font-semibold text-gray-500">Article</div><div class="font-bold mt-1">${escapeHtml(article.designation)}</div><div class="text-xs text-gray-500 mt-1">${escapeHtml(article.code)}</div>`;
  if (cards[1])
    cards[1].innerHTML = `<div class="text-xs font-semibold text-gray-500">Emplacement</div><div class="font-bold mt-1">${escapeHtml(location.name)}</div>`;
  if (cards[2])
    cards[2].innerHTML = `<div class="text-xs font-semibold text-accent-600">Stock theorique</div><div class="font-bold text-2xl mt-1">${formatNumber(theoretical)}</div>`;
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  if (inputs[0]) inputs[0].value = String(computed.counted);
  if (inputs[1]) inputs[1].value = String(computed.good);
  if (inputs[2]) inputs[2].value = String(computed.repair);
  if (inputs[3]) inputs[3].value = String(computed.outOfService);
  inputs.slice(0, 4).forEach((input) => {
    input.type = "number";
    input.min = "0";
    input.oninput = () => updateCountSummary(modal);
  });
  const textarea = modal.querySelector<HTMLTextAreaElement>("textarea");
  if (textarea) textarea.value = computed.justification;
  updateCountSummary(modal);
}

async function submitInventoryCount(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#countModal");
  if (!modal) return;
  const articleId = modal.dataset.articleId;
  const locationId = modal.dataset.locationId;
  const theoretical = toNumber(modal.dataset.theoretical ?? "0");
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const textarea = modal.querySelector<HTMLTextAreaElement>("textarea");
  const counted = toNumber(inputs[0]?.value ?? "0");
  const good = toNumber(inputs[1]?.value ?? "0");
  const repair = toNumber(inputs[2]?.value ?? "0");
  const out = toNumber(inputs[3]?.value ?? "0");
  const reason = selectedText(selects[0]) || "Comptage inventaire";
  const details = textarea?.value.trim();
  if (!articleId || !locationId) {
    showToast(root, "Aucune ligne d'inventaire selectionnee.", "error");
    return;
  }
  if (Math.abs(counted - (good + repair + out)) > 0.000001) {
    showToast(
      root,
      "La quantite constatee doit etre egale a bon etat + a reparer + hors service.",
      "error",
    );
    return;
  }
  if (counted !== theoretical && !details) {
    showToast(
      root,
      "Justifie l'ecart avant d'enregistrer le comptage.",
      "error",
    );
    return;
  }
  try {
    await createInventoryAdjustment({
      reference: "INV-" + Date.now(),
      date: new Date().toISOString(),
      locationId,
      notes: details,
      lines: [
        {
          articleId,
          expectedQuantity: theoretical,
          completedQuantity: counted,
          goodQuantity: good,
          repairQuantity: repair,
          outOfServiceQuantity: out,
          observation: reason + (details ? " - " + details : ""),
        },
      ],
    });
    closeModal(root, "countModal");
    updateApiBackedViews(root);
    showToast(root, "Comptage inventaire enregistre et stock ajuste.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Comptage impossible.",
      "error",
    );
  }
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
  const modal = root.querySelector<HTMLElement>("#articleModal");
  if (!modal) return;
  const [articles, suppliers, locations] = await Promise.all([
    getArticles().catch(() => latestArticles),
    getSuppliers().catch(() => latestSuppliers),
    getLocations().catch(() => latestLocations),
  ]);
  latestArticles = articles;
  latestSuppliers = suppliers;
  latestLocations = locations;

  const designation = modal.querySelector<HTMLInputElement>(
    "#quickArticleDesignationInput",
  );
  const family = modal.querySelector<HTMLSelectElement>(
    "#quickArticleFamilySelect",
  );
  const unit = modal.querySelector<HTMLSelectElement>("#quickArticleUnitSelect");
  const tracking = modal.querySelector<HTMLSelectElement>(
    "#quickArticleTrackingSelect",
  );
  const code = modal.querySelector<HTMLElement>("#quickArticleCodePreview");
  const minimumStock = modal.querySelector<HTMLInputElement>(
    "#quickArticleMinimumStockInput",
  );
  const initialStock = modal.querySelector<HTMLInputElement>(
    "#quickArticleInitialStockInput",
  );
  const referencePrice = modal.querySelector<HTMLInputElement>(
    "#quickArticleReferencePriceInput",
  );
  const supplier = modal.querySelector<HTMLSelectElement>(
    "#quickArticleSupplierSelect",
  );
  const location = modal.querySelector<HTMLSelectElement>(
    "#quickArticleInitialLocationSelect",
  );
  const status = modal.querySelector<HTMLSelectElement>(
    "#quickArticleStatusSelect",
  );

  if (designation) designation.value = "";
  if (family) family.value = "FO";
  if (unit) unit.value = "Piece";
  if (tracking) tracking.value = "QUANTITY";
  if (minimumStock) minimumStock.value = "";
  if (initialStock) initialStock.value = "";
  if (referencePrice) referencePrice.value = "";
  if (status) status.value = "ACTIVE";

  const activeSuppliers = suppliers.filter((item) => item.active);
  fillSelect(
    supplier ?? undefined,
    supplierOptions(activeSuppliers),
    activeSuppliers.length
      ? "Selectionner fournisseur"
      : "Aucun fournisseur en base",
  );

  const stockLocations = locations.filter(
    (item) =>
      item.active &&
      ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE"].includes(
        item.type.toUpperCase(),
      ),
  );
  fillSelect(
    location ?? undefined,
    locationOptions(stockLocations),
    stockLocations.length
      ? "Selectionner emplacement"
      : "Aucun emplacement en base",
  );

  const updateCode = () => {
    if (code) code.textContent = nextCodeFromRows(root, "article", family?.value);
  };
  if (family) family.onchange = updateCode;
  updateCode();
  window.lucide?.createIcons();
}

function selectArticleInEntry(root: HTMLElement, articleId: string) {
  return selectArticleInEntryPage(root, articleId, entreesStockContext());
}

async function submitQuickArticle(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#articleModal");
  if (!modal) return;
  const designation =
    modal
      .querySelector<HTMLInputElement>("#quickArticleDesignationInput")
      ?.value.trim() ?? "";
  const family = normalizedArticleFamily(
    modal.querySelector<HTMLSelectElement>("#quickArticleFamilySelect")?.value,
  );
  const code =
    modal.querySelector<HTMLElement>("#quickArticleCodePreview")?.textContent?.trim() ||
    nextCodeFromRows(root, "article", family);
  const initialLocationId =
    modal.querySelector<HTMLSelectElement>("#quickArticleInitialLocationSelect")
      ?.value || undefined;
  const initialStock = toNumber(
    modal.querySelector<HTMLInputElement>("#quickArticleInitialStockInput")
      ?.value ?? "0",
  );

  if (!designation) {
    showToast(root, "La designation de l'article est obligatoire.", "error");
    return;
  }
  if (initialStock > 0 && !initialLocationId) {
    showToast(
      root,
      "Selectionne un emplacement de depart pour le stock initial.",
      "error",
    );
    return;
  }

  try {
    const article = await createArticle({
      code,
      designation,
      category: family,
      unit:
        modal.querySelector<HTMLSelectElement>("#quickArticleUnitSelect")?.value ||
        "Piece",
      trackingMode:
        modal.querySelector<HTMLSelectElement>("#quickArticleTrackingSelect")
          ?.value === "INDIVIDUAL"
          ? "INDIVIDUAL"
          : "QUANTITY",
      minimumStock: toNumber(
        modal.querySelector<HTMLInputElement>("#quickArticleMinimumStockInput")
          ?.value ?? "0",
      ),
      referencePrice:
        toNumber(
          modal.querySelector<HTMLInputElement>(
            "#quickArticleReferencePriceInput",
          )?.value ?? "0",
        ) || null,
      defaultSupplierId:
        modal.querySelector<HTMLSelectElement>("#quickArticleSupplierSelect")
          ?.value || undefined,
      defaultLocationId: initialLocationId,
      initialStock,
      initialLocationId,
    });
    latestArticles = await getArticles().catch(() => [...latestArticles, article]);
    closeModal(root, "articleModal");
    await populateEntryModal(root);
    selectArticleInEntry(root, article.id);
    updateApiBackedViews(root);
    showToast(root, "Article cree et selectionne dans l'entree.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Creation article impossible.",
      "error",
    );
  }
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

function setAuditCardValue(
  root: HTMLElement,
  label: string,
  value: number | string,
) {
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("#audit .bg-white.rounded-xl"),
  );
  const card = cards.find((element) => element.textContent?.includes(label));
  const number = card?.querySelector<HTMLElement>(".text-3xl");
  if (number) number.textContent = formatNumber(value);
}

function auditSearchKey(value: unknown) {
  return articleImportKey(String(value ?? ""));
}

function auditSeverityBadge(severity: string) {
  if (severity === "CRITIQUE") return badge("Critique", "error");
  if (severity === "INFO") return badge("Info", "gray");
  return badge("A verifier", "warning");
}

function auditStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "TRAITEE" || normalized === "COMPLETED")
    return badge("Traitee", "success");
  if (normalized === "IGNOREE" || normalized === "CANCELLED")
    return badge("Ignoree", "gray");
  return badge(status === "OUVERTE" ? "Ouverte" : status, "warning");
}

function auditAlertDomain(alert: AuditAlert) {
  const domain = (alert.domain ?? "").toUpperCase();
  if (domain) return domain;
  const text = auditSearchKey(alert.type + " " + alert.action);
  if (text.includes("inventaire") || text.includes("ecart")) return "INVENTORY";
  if (text.includes("entree")) return "ENTRY";
  if (text.includes("retour")) return "RETURN";
  if (text.includes("demande") || text.includes("sortie") || text.includes("preuve"))
    return "EXIT";
  if (text.includes("rupture") || text.includes("stock")) return "STOCK";
  return "DATA";
}

function auditDomainLabel(domain: string) {
  return (
    (
      {
        STOCK: "Stock",
        INVENTORY: "Inventaire",
        ENTRY: "Entrees",
        EXIT: "Sorties",
        RETURN: "Retours",
        TRANSFER: "Transferts",
        REFERENTIAL: "Referentiel",
        DATA: "Donnees",
        SYSTEM: "Systeme",
      } as Record<string, string>
    )[domain] ?? domain
  );
}

function auditDomainIcon(domain: string) {
  return (
    (
      {
        STOCK: "package-check",
        INVENTORY: "clipboard-list",
        ENTRY: "archive-restore",
        EXIT: "send",
        RETURN: "rotate-ccw",
        TRANSFER: "repeat-2",
        REFERENTIAL: "database",
        DATA: "database-zap",
        SYSTEM: "shield-alert",
      } as Record<string, string>
    )[domain] ?? "shield-alert"
  );
}

function auditLooksLikeTechnicalId(value: unknown) {
  const text = String(value ?? "").trim();
  return /^c[a-z0-9]{18,}$/i.test(text) || /^[a-z0-9]{20,}$/i.test(text);
}

function auditReadableReference(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text || auditLooksLikeTechnicalId(text)) return "";
  if (/^(BE|BS|DS|RET|INV|TRF|INIT|FO|EQ|VH)-/i.test(text)) return text;
  return text.length <= 80 ? text : "";
}

function safeAuditContextLabel(value: unknown, fallback: string) {
  const readable = auditReadableReference(value);
  return readable || fallback;
}

function auditAlertGroupKey(alert: AuditAlert) {
  return (
    alert.articleId ||
    alert.articleCode ||
    alert.movementReference ||
    [alert.type, alert.object, alert.location].join("|")
  );
}

function groupAuditAlerts(alerts: AuditAlert[]) {
  const groups = new Map<string, AuditAlert[]>();
  alerts.forEach((alert) => {
    const key = auditAlertGroupKey(alert);
    groups.set(key, [...(groups.get(key) ?? []), alert]);
  });
  return [...groups.values()].sort(
    (left, right) =>
      auditAlertGroupSeverityRank(right) - auditAlertGroupSeverityRank(left) ||
      auditAlertGroupDate(right).localeCompare(auditAlertGroupDate(left)),
  );
}

function auditAlertGroupSeverity(group: AuditAlert[]) {
  if (group.some((alert) => alert.severity === "CRITIQUE")) return "CRITIQUE";
  if (group.some((alert) => alert.severity === "A_VERIFIER")) return "A_VERIFIER";
  return "INFO";
}

function auditAlertGroupSeverityRank(group: AuditAlert[]) {
  const severity = auditAlertGroupSeverity(group);
  if (severity === "CRITIQUE") return 3;
  if (severity === "A_VERIFIER") return 2;
  return 1;
}

function auditAlertGroupDate(group: AuditAlert[]) {
  return group.reduce((latest, alert) => (alert.date > latest ? alert.date : latest), "");
}

function auditAlertGroupStatus(group: AuditAlert[]) {
  if (group.some((alert) => alert.status === "OUVERTE")) return "OUVERTE";
  return group[0]?.status ?? "INFO";
}

function auditAlertGroupSubject(group: AuditAlert[]) {
  const first = group[0];
  if (!first) return { title: "-", subtitle: "" };
  const code = first.articleCode ?? first.objectCode;
  const rawName = first.articleName ?? first.object;
  const name = auditLooksLikeTechnicalId(rawName) ? "" : rawName;
  const title = [auditReadableReference(code), name]
    .filter(Boolean)
    .join(" - ");
  if (group.length === 1) {
    return {
      title: title || first.type,
      subtitle: auditReadableReference(first.movementReference) || first.type,
    };
  }
  const typeCounts = new Map<string, number>();
  group.forEach((alert) => {
    typeCounts.set(alert.type, (typeCounts.get(alert.type) ?? 0) + 1);
  });
  const parts = [...typeCounts.entries()]
    .map(([type, count]) => `${formatNumber(count)} ${type.toLowerCase()}${count > 1 ? "s" : ""}`)
    .join(", ");
  return {
    title: title || first.type,
    subtitle: parts,
  };
}

function auditAlertGroupContext(group: AuditAlert[]) {
  const first = group[0];
  if (!first) return "-";
  const domain = auditDomainLabel(auditAlertDomain(first));
  const locations = [
    ...new Set(
      group
        .map((alert) =>
          safeAuditContextLabel(
            alert.location,
            auditAlertDomain(alert) === "INVENTORY"
              ? "Inventaire"
              : "Emplacement concerne",
          ),
        )
        .filter(Boolean),
    ),
  ];
  const locationLabel =
    locations.length <= 1
      ? locations[0] ?? domain
      : `${locations[0]} + ${formatNumber(locations.length - 1)} autre${locations.length > 2 ? "s" : ""}`;
  return [domain, locationLabel].filter(Boolean).join(" - ");
}

function auditAlertGroupImpact(group: AuditAlert[]) {
  const numericGaps = group
    .map((alert) =>
      typeof alert.gapQuantity === "number" && Number.isFinite(alert.gapQuantity)
        ? alert.gapQuantity
        : null,
    )
    .filter((value): value is number => value !== null);
  if (numericGaps.length) {
    const total = numericGaps.reduce((sum, value) => sum + value, 0);
    return `Ecart total ${total > 0 ? "+" : ""}${formatNumber(total)}`;
  }
  const stockLocations = new Set(group.map((alert) => alert.location).filter(Boolean));
  if (group.every((alert) => auditAlertDomain(alert) === "STOCK")) {
    return `Stock bas sur ${formatNumber(Math.max(stockLocations.size, 1))} emplacement${stockLocations.size > 1 ? "s" : ""}`;
  }
  if (group.length === 1) return group[0]?.impact ?? "-";
  return `${formatNumber(group.length)} points a verifier`;
}

function auditAlertGroupAction(group: AuditAlert[]) {
  const actions = [...new Set(group.map((alert) => alert.action).filter(Boolean))];
  if (actions.length === 1) return actions[0];
  const domains = [...new Set(group.map((alert) => auditDomainLabel(auditAlertDomain(alert))))];
  return `Verifier ${formatNumber(group.length)} alerte${group.length > 1 ? "s" : ""} ${domains.join(" / ")}`;
}

function auditAlertGroupBorderClass(group: AuditAlert[]) {
  const severity = auditAlertGroupSeverity(group);
  const status = auditAlertGroupStatus(group).toUpperCase();
  if (status !== "OUVERTE" && status !== "OPEN") return "border-l-gray-300";
  if (severity === "CRITIQUE") return "border-l-error-500";
  if (severity === "A_VERIFIER") return "border-l-warning-500";
  return "border-l-gray-300";
}

function auditAlertSubject(group: AuditAlert[]) {
  const first = group[0];
  const subject = auditAlertGroupSubject(group);
  return `
    <div class="flex items-start gap-3 min-w-[240px]">
      <div class="w-9 h-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0"><i data-lucide="${auditDomainIcon(auditAlertDomain(first!))}" class="w-4 h-4"></i></div>
      <div class="min-w-0">
        <div class="font-bold truncate">${escapeHtml(subject.title)}</div>
        <div class="text-xs text-gray-500 truncate">${escapeHtml(subject.subtitle)}</div>
      </div>
    </div>
  `;
}

function auditAlertMatchesFilters(root: HTMLElement, alert: AuditAlert) {
  const search = auditSearchKey(
    root.querySelector<HTMLInputElement>("#auditAlertSearchInput")?.value ?? "",
  );
  const selectedType =
    root.querySelector<HTMLSelectElement>("#auditAlertTypeSelect")?.value ??
    "ALL";
  const selectedSeverity =
    root.querySelector<HTMLSelectElement>("#auditAlertSeveritySelect")?.value ??
    "ALL";
  const selectedStatus =
    root.querySelector<HTMLSelectElement>("#auditAlertStatusSelect")?.value ??
    "ALL";
  const domain = auditAlertDomain(alert);
  const haystack = auditSearchKey(
    [
      alert.type,
      alert.object,
      alert.objectCode,
      alert.articleCode,
      alert.articleName,
      alert.location,
      alert.movementReference,
      alert.impact,
      alert.action,
      alert.status,
    ].join(" "),
  );
  if (currentAuditAlertFilter === "CRITICAL" && alert.severity !== "CRITIQUE")
    return false;
  if (currentAuditAlertFilter === "TO_VERIFY" && alert.severity !== "A_VERIFIER")
    return false;
  if (currentAuditAlertFilter === "INVENTORY" && domain !== "INVENTORY")
    return false;
  if (currentAuditAlertFilter === "STOCK" && domain !== "STOCK") return false;
  if (selectedType !== "ALL" && domain !== selectedType) return false;
  if (selectedSeverity !== "ALL" && alert.severity !== selectedSeverity)
    return false;
  if (selectedStatus !== "ALL" && alert.status !== selectedStatus) return false;
  if (search && !haystack.includes(search)) return false;
  return true;
}

function auditAlertRow(group: AuditAlert[]) {
  const severity = auditAlertGroupSeverity(group);
  const first = group[0];
  if (!first) return "";
  return (
    `<tr class="border-l-4 ${auditAlertGroupBorderClass(group)} hover:bg-gray-50 transition-colors">` +
    '<td class="px-5 py-4">' +
    auditSeverityBadge(severity) +
    "</td>" +
    '<td class="px-5 py-4">' +
    auditAlertSubject(group) +
    "</td>" +
    '<td class="px-5 py-4"><div class="font-semibold">' +
    escapeHtml(auditAlertGroupContext(group)) +
    '</div><div class="text-xs text-gray-500">' +
    escapeHtml(group.length > 1 ? `${formatNumber(group.length)} alertes consolidees` : first.type) +
    "</div></td>" +
    '<td class="px-5 py-4 font-semibold">' +
    escapeHtml(auditAlertGroupImpact(group)) +
    "</td>" +
    '<td class="px-5 py-4 text-gray-700">' +
    escapeHtml(auditAlertGroupAction(group)) +
    "</td>" +
    '<td class="px-5 py-4">' +
    formatDate(auditAlertGroupDate(group)) +
    "</td>" +
    '<td class="px-5 py-4">' +
    auditStatusBadge(auditAlertGroupStatus(group)) +
    "</td>" +
    "</tr>"
  );
}

function renderAuditAlerts(root: HTMLElement) {
  const alertsBody = root.querySelector<HTMLElement>("#audit-alerts tbody");
  const visible = latestAuditAlerts.filter((alert) =>
    auditAlertMatchesFilters(root, alert),
  );
  const grouped = groupAuditAlerts(visible);
  if (alertsBody) {
    alertsBody.innerHTML = grouped.length
      ? grouped.map(auditAlertRow).join("")
      : emptyRow(7, "Aucune alerte pour ce filtre.");
  }
  setText(
    root,
    "#auditAlertCount",
    `${formatNumber(grouped.length)} ligne${grouped.length > 1 ? "s" : ""} consolidee${grouped.length > 1 ? "s" : ""}`,
  );
  setText(
    root,
    "#auditAlertCriticalKpi",
    visible.filter((alert) => alert.severity === "CRITIQUE").length,
  );
  setText(
    root,
    "#auditAlertVerifyKpi",
    visible.filter((alert) => alert.severity === "A_VERIFIER").length,
  );
  setText(root, "#auditAlertTotalKpi", visible.length);
  root
    .querySelectorAll<HTMLElement>("#audit-alerts [data-audit-filter]")
    .forEach((button) => {
      const active = button.dataset.auditFilter === currentAuditAlertFilter;
      button.classList.toggle("bg-accent-50", active);
      button.classList.toggle("text-accent-600", active);
      button.classList.toggle("bg-gray-100", !active);
      button.classList.toggle("text-gray-600", !active);
    });
  window.lucide?.createIcons();
}

function showAuditTab(root: HTMLElement, tab: string, button?: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".audit-view").forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `audit-${tab}`);
  });
  root.querySelectorAll<HTMLElement>(".audit-tab").forEach((t) => {
    t.classList.remove("bg-accent-50", "text-accent-600");
    t.classList.add("bg-gray-100", "text-gray-600");
  });
  if (button) {
    button.classList.add("bg-accent-50", "text-accent-600");
    button.classList.remove("bg-gray-100", "text-gray-600");
  }
  window.lucide?.createIcons();
}

function auditActionLabel(action: string) {
  return (
    (
      {
        CREATE_STOCK_ENTRY: "Creation entree",
        CREATE_EXIT_REQUEST: "Demande sortie",
        CREATE_STOCK_EXIT: "Sortie stock",
        CREATE_STOCK_RETURN: "Retour stock",
        CREATE_STOCK_TRANSFER: "Transfert stock",
        CREATE_INVENTORY_ADJUSTMENT: "Comptage inventaire",
        RESOLVE_STOCK_ENTRY_DISPUTE: "Resolution litige entree",
        REJECT_EXIT_REQUEST: "Refus demande materiel",
        UPLOAD_EXIT_REQUEST_PROOF: "Preuve signee ajoutee",
        CONTROL_STOCK_RETURN: "Controle retour",
        REPAIR_ORPHAN_RETURN_SOURCE: "Reparation rattachement retour",
      } as Record<string, string>
    )[action] ??
    action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function auditActionDomain(action: string, entity: string) {
  const value = `${action} ${entity}`.toUpperCase();
  if (value.includes("ENTRY")) return "ENTRY";
  if (value.includes("EXIT") || value.includes("PROOF") || value.includes("REQUEST"))
    return "EXIT";
  if (value.includes("RETURN")) return "RETURN";
  if (value.includes("TRANSFER")) return "TRANSFER";
  if (value.includes("INVENTORY") || value.includes("ADJUSTMENT"))
    return "INVENTORY";
  if (
    value.includes("ARTICLE") ||
    value.includes("SUPPLIER") ||
    value.includes("LOCATION") ||
    value.includes("REFERENTIAL")
  )
    return "REFERENTIAL";
  return "SYSTEM";
}

function auditRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function auditValueReference(value: unknown) {
  const record = auditRecord(value);
  const direct = record.reference ?? record.code ?? record.name ?? record.designation;
  if (typeof direct === "string" && direct.trim()) return direct;
  return "";
}

function auditDocumentLabel(log: AuditLog) {
  const after = auditRecord(log.after);
  const before = auditRecord(log.before);
  const reference = auditValueReference(after) || auditValueReference(before);
  if (reference) return reference;
  if (log.entity === "StockMovement") return "Mouvement stock";
  if (log.entityId) return "Trace " + log.entityId.slice(0, 8);
  return auditDomainLabel(auditActionDomain(log.action, log.entity));
}

function auditLineContextFromRecord(record: Record<string, unknown>) {
  const lines = Array.isArray(record.lines) ? record.lines : [];
  const first = lines[0] as Record<string, unknown> | undefined;
  const article = auditRecord(first?.article);
  const articleLabel =
    auditValueReference(article) ||
    (typeof first?.articleId === "string"
      ? "Article " + first.articleId.slice(0, 8)
      : "");
  const location =
    auditValueReference(auditRecord(record.toLocation)) ||
    auditValueReference(auditRecord(record.fromLocation)) ||
    auditValueReference(auditRecord(record.location));
  return [articleLabel, location].filter(Boolean).join(" - ");
}

function auditObjectContext(log: AuditLog) {
  const after = auditRecord(log.after);
  const before = auditRecord(log.before);
  return (
    auditLineContextFromRecord(after) ||
    auditLineContextFromRecord(before) ||
    auditValueReference(after) ||
    auditValueReference(before) ||
    auditDomainLabel(auditActionDomain(log.action, log.entity))
  );
}

function auditChangeSummary(log: AuditLog) {
  const after = auditRecord(log.after);
  const before = auditRecord(log.before);
  const reference = auditValueReference(after);
  const beforeReference = auditValueReference(before);
  if (reference && beforeReference && reference !== beforeReference)
    return beforeReference + " -> " + reference;
  if (reference) return "Document " + reference;
  if (log.before && log.after) return "Donnees modifiees";
  if (log.after) return "Creation enregistree";
  if (log.before) return "Etat precedent conserve";
  return "Trace conservee";
}

function auditLogUserLabel(log: AuditLog) {
  if (log.userId) {
    const user = latestUsers.find((item) => item.id === log.userId);
    return user ? `${user.firstName} ${user.lastName}`.trim() : log.userId;
  }
  const after = auditRecord(log.after);
  const before = auditRecord(log.before);
  const actor =
    after.handledBy ??
    after.receivedBy ??
    after.requestedBy ??
    after.deliveredBy ??
    after.rejectedBy ??
    after.proofUploadedBy ??
    before.handledBy ??
    before.receivedBy ??
    before.requestedBy ??
    before.deliveredBy ??
    before.rejectedBy ??
    before.proofUploadedBy;
  return typeof actor === "string" && actor.trim() ? actor : "Systeme";
}

function auditLogMatchesFilters(root: HTMLElement, log: AuditLog) {
  const search = auditSearchKey(
    root.querySelector<HTMLInputElement>("#auditLogSearchInput")?.value ?? "",
  );
  const dateFrom =
    root.querySelector<HTMLInputElement>("#auditLogDateFromInput")?.value ?? "";
  const dateTo =
    root.querySelector<HTMLInputElement>("#auditLogDateToInput")?.value ?? "";
  const user =
    root.querySelector<HTMLSelectElement>("#auditLogUserSelect")?.value ?? "";
  const domain =
    root.querySelector<HTMLSelectElement>("#auditLogDomainSelect")?.value ?? "";
  const action =
    root.querySelector<HTMLSelectElement>("#auditLogActionSelect")?.value ?? "";
  const logDomain = auditActionDomain(log.action, log.entity);
  const haystack = auditSearchKey(
    [
      auditActionLabel(log.action),
      auditDocumentLabel(log),
      auditObjectContext(log),
      auditChangeSummary(log),
      auditLogUserLabel(log),
      log.entity,
      log.entityId,
    ].join(" "),
  );
  if (dateFrom && log.createdAt < dateFrom) return false;
  if (dateTo && log.createdAt > dateTo + "T23:59:59") return false;
  if (user && (log.userId ?? "SYSTEM") !== user) return false;
  if (domain && logDomain !== domain) return false;
  if (action && log.action !== action) return false;
  if (search && !haystack.includes(search)) return false;
  return true;
}

function auditDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setAuditLogDateRange(root: HTMLElement, range: string) {
  const today = new Date();
  const from = new Date(today);
  if (range === "7d") from.setDate(today.getDate() - 6);
  if (range === "30d") from.setDate(today.getDate() - 29);
  const fromInput = root.querySelector<HTMLInputElement>(
    "#auditLogDateFromInput",
  );
  const toInput = root.querySelector<HTMLInputElement>("#auditLogDateToInput");
  if (fromInput) fromInput.value = auditDateInputValue(from);
  if (toInput) toInput.value = auditDateInputValue(today);
  renderAuditLogs(root);
}

function auditLogDayKey(log: AuditLog) {
  const date = new Date(log.createdAt);
  if (Number.isNaN(date.getTime())) return log.createdAt.slice(0, 10) || "-";
  return auditDateInputValue(date);
}

function auditLogDayLabel(dayKey: string) {
  const date = new Date(dayKey + "T00:00:00");
  if (Number.isNaN(date.getTime())) return dayKey;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function groupAuditLogsByDay(logs: AuditLog[]) {
  const groups = new Map<string, AuditLog[]>();
  logs.forEach((log) => {
    const key = auditLogDayKey(log);
    groups.set(key, [...(groups.get(key) ?? []), log]);
  });
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dayKey, items]) => ({
      dayKey,
      label: auditLogDayLabel(dayKey),
      logs: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }));
}

function auditLogResult(log: AuditLog) {
  const text = auditSearchKey(
    JSON.stringify({
      action: log.action,
      before: log.before,
      after: log.after,
    }),
  );
  if (
    /\b(error|erreur|failed|failure|echec|failed|rejected_by_system)\b/.test(
      text,
    ) ||
    text.includes("status failed") ||
    text.includes("statut echec")
  ) {
    return "FAILURE";
  }
  if (
    log.action.includes("REJECT") ||
    log.action.includes("RESOLVE_STOCK_ENTRY_DISPUTE") ||
    log.action.includes("REPAIR_ORPHAN_RETURN_SOURCE") ||
    text.includes("litige") ||
    text.includes("ecart") ||
    text.includes("a controler") ||
    text.includes("pendingcontrolquantity") ||
    text.includes("damagedquantity") ||
    text.includes("scrapquantity") ||
    text.includes("endommage") ||
    text.includes("rebut")
  ) {
    return "ANOMALY";
  }
  return "SUCCESS";
}

function auditLogResultBadge(log: AuditLog) {
  const result = auditLogResult(log);
  return badge(auditLogResultLabel(result), auditLogResultTone(result));
}

function auditActionIcon(action: string, domain: string) {
  const value = action.toUpperCase();
  if (value.includes("PROOF")) return "file-check";
  if (value.includes("REJECT") || value.includes("REPAIR") || value.includes("DISPUTE"))
    return "alert-triangle";
  if (value.includes("CREATE") && domain === "REFERENTIAL") return "plus-circle";
  if (domain === "INVENTORY") return "clipboard-list";
  if (domain === "RETURN") return "rotate-ccw";
  if (domain === "TRANSFER") return "repeat-2";
  if (domain === "ENTRY") return "archive-restore";
  if (domain === "EXIT") return "send";
  if (value.includes("CREATE")) return "plus-circle";
  return "activity";
}

function auditLogDayHeader(
  dayKey: string,
  label: string,
  logs: AuditLog[],
  collapsed: boolean,
) {
  const anomalies = logs.filter((log) => auditLogResult(log) === "ANOMALY").length;
  const failures = logs.filter((log) => auditLogResult(log) === "FAILURE").length;
  const resultText =
    failures > 0
      ? `${formatNumber(failures)} echec${failures > 1 ? "s" : ""}`
      : anomalies > 0
        ? `${formatNumber(anomalies)} anomalie${anomalies > 1 ? "s" : ""}`
        : "aucune anomalie";
  return `
    <tr class="bg-gray-50/90 hover:bg-gray-100 cursor-pointer" data-action="toggleAuditLogDay('${dayKey}')">
      <td colspan="7" class="px-5 py-3">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <i data-lucide="${collapsed ? "chevron-right" : "chevron-down"}" class="w-4 h-4 text-gray-500"></i>
            <span class="font-bold">${escapeHtml(label)}</span>
          </div>
          <div class="text-xs font-semibold text-gray-500">${formatNumber(logs.length)} trace${logs.length > 1 ? "s" : ""} ce jour-la - ${escapeHtml(resultText)}</div>
        </div>
      </td>
    </tr>
  `;
}

function auditLogRow(log: AuditLog) {
  const domain = auditActionDomain(log.action, log.entity);
  const date = new Date(log.createdAt);
  const time = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return (
    '<tr class="hover:bg-gray-50 transition-colors">' +
    '<td class="px-5 py-4 font-semibold whitespace-nowrap">' +
    escapeHtml(time || "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(auditLogUserLabel(log)) +
    "</td>" +
    '<td class="px-5 py-4"><div class="flex items-start gap-3 min-w-[220px]">' +
    `<span class="w-9 h-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0"><i data-lucide="${auditActionIcon(log.action, domain)}" class="w-4 h-4"></i></span>` +
    '<div class="min-w-0"><div class="font-bold truncate">' +
    escapeHtml(auditActionLabel(log.action)) +
    '</div><div class="text-xs text-gray-500 truncate">' +
    escapeHtml(auditDomainLabel(domain)) +
    "</div></div></div></td>" +
    '<td class="px-5 py-4 font-semibold">' +
    escapeHtml(auditDocumentLabel(log)) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(auditObjectContext(log)) +
    "</td>" +
    '<td class="px-5 py-4">' +
    auditLogResultBadge(log) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    actionEyeFor(`openAuditLogDetail('${log.id}')`) +
    "</td>" +
    "</tr>"
  );
}

function populateAuditLogFilters(root: HTMLElement) {
  const userSelect = root.querySelector<HTMLSelectElement>("#auditLogUserSelect");
  if (userSelect) {
    const previous = userSelect.value;
    const users = new Map<string, string>();
    latestAuditLogs.forEach((log) => {
      users.set(log.userId ?? "SYSTEM", auditLogUserLabel(log));
    });
    userSelect.innerHTML =
      '<option value="">Tous utilisateurs</option>' +
      [...users.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([id, label]) => option(id, label))
        .join("");
    userSelect.value = [...users.keys()].includes(previous) ? previous : "";
  }
  const actionSelect =
    root.querySelector<HTMLSelectElement>("#auditLogActionSelect");
  if (actionSelect) {
    const previous = actionSelect.value;
    const actions = [...new Set(latestAuditLogs.map((log) => log.action))].sort();
    actionSelect.innerHTML =
      '<option value="">Toutes actions</option>' +
      actions.map((action) => option(action, auditActionLabel(action))).join("");
    actionSelect.value = actions.includes(previous) ? previous : "";
  }
}

function renderAuditLogs(root: HTMLElement) {
  populateAuditLogFilters(root);
  const logsBody = root.querySelector<HTMLElement>("#audit-journal tbody");
  const visible = latestAuditLogs.filter((log) => auditLogMatchesFilters(root, log));
  const groups = groupAuditLogsByDay(visible);
  groups.forEach((group, index) => {
    if (!initializedAuditLogDays.has(group.dayKey)) {
      initializedAuditLogDays.add(group.dayKey);
      if (index > 0) collapsedAuditLogDays.add(group.dayKey);
    }
  });
  if (logsBody) {
    logsBody.innerHTML = groups.length
      ? groups
          .map((group) => {
            const collapsed = collapsedAuditLogDays.has(group.dayKey);
            return (
              auditLogDayHeader(group.dayKey, group.label, group.logs, collapsed) +
              (collapsed ? "" : group.logs.map(auditLogRow).join(""))
            );
          })
          .join("")
      : emptyRow(7, "Aucune trace audit pour ce filtre.");
  }
  const users = new Set(visible.map((log) => auditLogUserLabel(log)).filter(Boolean));
  const anomalies = visible.filter((log) => auditLogResult(log) === "ANOMALY").length;
  const failures = visible.filter((log) => auditLogResult(log) === "FAILURE").length;
  const issueText =
    failures > 0
      ? `${formatNumber(failures)} echec${failures > 1 ? "s" : ""}`
      : anomalies > 0
        ? `${formatNumber(anomalies)} anomalie${anomalies > 1 ? "s" : ""}`
        : "aucune anomalie";
  setText(
    root,
    "#auditLogCount",
    `${formatNumber(visible.length)} trace${visible.length > 1 ? "s" : ""} - ${formatNumber(users.size)} utilisateur${users.size > 1 ? "s" : ""} - ${issueText}`,
  );
  window.lucide?.createIcons();
}

function toggleAuditLogDay(root: HTMLElement, dayKey: string) {
  if (collapsedAuditLogDays.has(dayKey)) {
    collapsedAuditLogDays.delete(dayKey);
  } else {
    collapsedAuditLogDays.add(dayKey);
  }
  initializedAuditLogDays.add(dayKey);
  renderAuditLogs(root);
}

function auditDetailRows(rows: Array<[string, unknown]>) {
  return rows
    .map(
      ([label, value]) =>
        `<div><span class="detail-label">${escapeHtml(label)}</span> <strong>${escapeHtml(value ?? "-")}</strong></div>`,
    )
    .join("");
}

function auditLineQuantityLabel(line: Record<string, unknown>) {
  const expected = Number(line.expectedQuantity ?? 0);
  const completed = Number(line.completedQuantity ?? 0);
  if (expected && completed && expected !== completed) {
    return `${formatNumber(completed)} / attendu ${formatNumber(expected)}`;
  }
  return formatNumber(completed || expected || 0);
}

function auditLineRowsFromRecord(record: Record<string, unknown>) {
  const lines = Array.isArray(record.lines) ? record.lines : [];
  return lines
    .map((raw, index) => {
      const line = auditRecord(raw);
      const article = auditRecord(line.article);
      const articleLabel =
        auditValueReference(article) ||
        (typeof article.designation === "string" ? article.designation : "") ||
        `Ligne ${formatNumber(index + 1)}`;
      const code =
        typeof article.code === "string" && article.code.trim()
          ? article.code
          : "";
      const observation =
        typeof line.observation === "string" && line.observation.trim()
          ? line.observation
          : "-";
      return `
        <tr>
          <td class="px-5 py-4">
            <div class="font-bold">${escapeHtml(articleLabel)}</div>
            <div class="text-xs text-gray-500">${escapeHtml(code)}</div>
          </td>
          <td class="px-5 py-4 text-right font-semibold">${escapeHtml(auditLineQuantityLabel(line))}</td>
          <td class="px-5 py-4 text-gray-600">${escapeHtml(observation)}</td>
        </tr>
      `;
    })
    .join("");
}

function auditLogBusinessNotes(log: AuditLog) {
  const after = auditRecord(log.after);
  const before = auditRecord(log.before);
  const values = [
    after.rejectionReason,
    after.reason,
    after.notes,
    after.observation,
    before.rejectionReason,
    before.reason,
    before.notes,
    before.observation,
  ];
  const note = values.find((value) => typeof value === "string" && value.trim());
  return typeof note === "string" ? note : "";
}

function auditLogReadableSummary(log: AuditLog) {
  const action = auditActionLabel(log.action);
  const document = auditDocumentLabel(log);
  const context = auditObjectContext(log);
  const note = auditLogBusinessNotes(log);
  const parts = [`${action} enregistre${action.endsWith("e") ? "e" : ""}`];
  if (document && document !== "Mouvement stock") parts.push(`sur ${document}`);
  if (context && context !== document) parts.push(`pour ${context}`);
  if (note) parts.push(`Motif : ${note}`);
  return parts.join(". ");
}

function auditLogResultTone(
  result: string,
): "success" | "warning" | "error" | "gray" | "accent" {
  if (result === "FAILURE") return "error";
  if (result === "ANOMALY") return "warning";
  return "success";
}

function auditLogResultLabel(result: string) {
  if (result === "FAILURE") return "Echec";
  if (result === "ANOMALY") return "Anomalie detectee";
  return "Succes";
}

function openAuditAlertDetail(root: HTMLElement, id: string) {
  const alert = latestAuditAlerts.find((item) => item.id === id);
  if (!alert) {
    showToast(root, "Alerte introuvable.", "error");
    return;
  }
  setText(root, "#auditDetailKind", "Alerte stock");
  setText(root, "#auditDetailTitle", alert.type);
  setText(
    root,
    "#auditDetailSubtitle",
    `${alert.object}${alert.movementReference ? " - " + alert.movementReference : ""}`,
  );
  const body = root.querySelector<HTMLElement>("#auditDetailBody");
  const trace = alert.movementId
    ? latestAuditLogs.find((log) => log.entityId === alert.movementId)
    : null;
  if (body) {
    body.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        ${detailCard("Priorite", alert.severity === "CRITIQUE" ? "Critique" : "A verifier", alert.severity === "CRITIQUE" ? "accent" : "gray")}
        ${detailCard("Domaine", auditDomainLabel(auditAlertDomain(alert)), "accent")}
        ${detailCard("Impact stock", alert.impact ?? "-", "gray")}
        ${detailCard("Statut", alert.status === "OUVERTE" ? "Ouverte" : alert.status, "gray")}
      </div>
      <div class="border rounded-xl overflow-hidden">
        <div class="px-5 py-4 bg-gray-50 border-b font-bold">Contexte</div>
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          ${auditDetailRows([
            ["Sujet", alert.object],
            ["Code / reference", alert.articleCode ?? alert.objectCode ?? alert.movementReference ?? "-"],
            ["Emplacement", alert.location],
            ["Date", formatDate(alert.date)],
            ["Quantite theorique", alert.expectedQuantity ?? "-"],
            ["Quantite reelle", alert.completedQuantity ?? "-"],
            ["Ecart", alert.gapQuantity ?? "-"],
            ["Action attendue", alert.action],
          ])}
        </div>
      </div>
      <div class="border rounded-xl overflow-hidden">
        <div class="px-5 py-4 bg-gray-50 border-b font-bold">Trace associee</div>
        <div class="p-5 text-sm text-gray-600">${trace ? escapeHtml(auditActionLabel(trace.action) + " - " + auditChangeSummary(trace)) : "Aucune trace associee trouvee."}</div>
      </div>
    `;
  }
  openModal(root, "auditDetailModal");
  window.lucide?.createIcons();
}

function openAuditLogDetail(root: HTMLElement, id: string) {
  const log = latestAuditLogs.find((item) => item.id === id);
  if (!log) {
    showToast(root, "Trace audit introuvable.", "error");
    return;
  }
  const domain = auditActionDomain(log.action, log.entity);
  const result = auditLogResult(log);
  const after = auditRecord(log.after);
  const before = auditRecord(log.before);
  const lineRows =
    auditLineRowsFromRecord(after) || auditLineRowsFromRecord(before);
  const date = new Date(log.createdAt);
  const time = Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const note = auditLogBusinessNotes(log);
  setText(root, "#auditDetailKind", "Journal audit");
  setText(root, "#auditDetailTitle", auditActionLabel(log.action));
  setText(root, "#auditDetailSubtitle", auditDocumentLabel(log));
  const body = root.querySelector<HTMLElement>("#auditDetailBody");
  if (body) {
    body.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        ${detailCard("Domaine", auditDomainLabel(domain), "accent")}
        ${detailCard("Utilisateur", auditLogUserLabel(log), "gray")}
        ${detailCard("Document", auditDocumentLabel(log), "gray")}
        ${detailCard("Resultat", auditLogResultLabel(result), result === "SUCCESS" ? "success" : "gray")}
      </div>
      <div class="border rounded-xl overflow-hidden">
        <div class="px-5 py-4 bg-gray-50 border-b font-bold">Ce qui s'est passe</div>
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          ${auditDetailRows([
            ["Date", formatDate(log.createdAt)],
            ["Heure", time],
            ["Action", auditActionLabel(log.action)],
            ["Document concerne", auditDocumentLabel(log)],
            ["Article / emplacement", auditObjectContext(log)],
            ["Resume", auditLogReadableSummary(log)],
            ["Observation / motif", note || "-"],
          ])}
        </div>
      </div>
      ${
        lineRows
          ? `<div class="border rounded-xl overflow-hidden">
              <div class="px-5 py-4 bg-gray-50 border-b font-bold">Articles concernes</div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-xs uppercase text-gray-500"><tr><th class="px-5 py-3 text-left">Article</th><th class="px-5 py-3 text-right">Quantite</th><th class="px-5 py-3 text-left">Observation</th></tr></thead>
                  <tbody class="divide-y divide-gray-200">${lineRows}</tbody>
                </table>
              </div>
            </div>`
          : `<div class="border rounded-xl overflow-hidden">
              <div class="px-5 py-4 bg-gray-50 border-b font-bold">Detail metier</div>
              <div class="p-5 text-sm text-gray-600">${escapeHtml(auditChangeSummary(log))}</div>
            </div>`
      }
    `;
  }
  openModal(root, "auditDetailModal");
  window.lucide?.createIcons();
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

function userRow(user: StockUser) {
  const fullName = userDisplayName(user);
  const role = user.roles[0] ?? "GESTIONNAIRE_STOCK";
  const identity = userIdentity(user);
  const contact = user.email ?? "Email non renseigne";
  return `<tr><td class="px-5 py-4"><div class="font-bold">${escapeHtml(fullName)}</div><div class="text-xs text-gray-500">${escapeHtml(user.roles.map(roleLabel).join(", "))}</div></td><td class="px-5 py-4"><div class="font-semibold">${escapeHtml(identity)}</div><div class="text-xs text-gray-500">${escapeHtml(contact)}</div></td><td class="px-5 py-4">${badge(roleLabel(role), role === "ADMIN_STOCK" ? "accent" : role === "AUDIT" ? "warning" : "success")}</td><td class="px-5 py-4">${escapeHtml(accessLabel(user.roles))}</td><td class="px-5 py-4">${badge(user.active ? "Actif" : "Inactif", user.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><button data-action="openUserDetail('${escapeHtml(user.id)}')" title="Voir utilisateur" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600"><i data-lucide="eye" class="w-4 h-4"></i></button></td></tr>`;
}

function renderUsersList(root: HTMLElement) {
  const usersBody = root.querySelector<HTMLElement>("#users tbody");
  if (usersBody)
    usersBody.innerHTML = latestUsers.length
      ? latestUsers.map(userRow).join("")
      : emptyRow(6, "Aucun utilisateur en base pour le moment.");
  setText(
    root,
    "#usersAdminCount",
    latestUsers.filter((user) => user.roles.includes("ADMIN_STOCK")).length,
  );
  setText(
    root,
    "#usersManagersCount",
    latestUsers.filter((user) => user.roles.includes("GESTIONNAIRE_STOCK"))
      .length,
  );
  setText(
    root,
    "#usersAuditCount",
    latestUsers.filter((user) => user.roles.includes("AUDIT")).length,
  );
  setText(
    root,
    "#usersProjectManagersCount",
    latestUsers.filter((user) => user.roles.includes("CHEF_PROJET")).length,
  );
  setText(
    root,
    "#usersDirectionCount",
    latestUsers.filter((user) => user.roles.includes("DIRECTION")).length,
  );
  window.lucide?.createIcons();
}

function clientRow(client: Client) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(client.code)}</td><td class="px-5 py-4">${escapeHtml(client.name)}</td><td class="px-5 py-4">${escapeHtml(client.contact ?? "-")}</td><td class="px-5 py-4">${escapeHtml(client.phone ?? "-")}</td><td class="px-5 py-4">${escapeHtml(client.email ?? "-")}</td><td class="px-5 py-4">${badge(client.active ? "Actif" : "Inactif", client.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><span class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400"><i data-lucide="eye" class="w-4 h-4"></i></span></td></tr>`;
}

function teamServiceRow(service: TeamService) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(service.code)}</td><td class="px-5 py-4">${escapeHtml(service.name)}</td><td class="px-5 py-4">${escapeHtml(service.type)}</td><td class="px-5 py-4">${escapeHtml(service.manager ?? "-")}</td><td class="px-5 py-4">${badge(service.active ? "Actif" : "Inactif", service.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><span class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400"><i data-lucide="eye" class="w-4 h-4"></i></span></td></tr>`;
}

function updateApiBackedViews(root: HTMLElement) {
  updateDashboard(root);
  getArticles()
    .then((articles) => {
      latestArticles = articles;
      const articleBody = root.querySelector<HTMLElement>(
        "#ref-articles tbody",
      );
      if (articleBody)
        articleBody.innerHTML = articles.length
          ? articles.map(articleRow).join("")
          : emptyRow(7, "Aucun article en base pour le moment.");
      setText(root, "#refArticlesCount", articles.length);
      renderInventory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getSuppliers()
    .then((suppliers) => {
      latestSuppliers = suppliers;
      const suppliersBody = root.querySelector<HTMLElement>(
        "#ref-suppliers tbody",
      );
      if (suppliersBody)
        suppliersBody.innerHTML = suppliers.length
          ? suppliers.map(supplierRow).join("")
          : emptyRow(7, "Aucun fournisseur en base pour le moment.");
      setText(root, "#refSuppliersCount", suppliers.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getClients()
    .then((clients) => {
      latestClients = clients;
      const clientsBody = root.querySelector<HTMLElement>("#ref-clients tbody");
      if (clientsBody)
        clientsBody.innerHTML = clients.length
          ? clients.map(clientRow).join("")
          : emptyRow(7, "Aucun client en base pour le moment.");
      setText(root, "#refClientsCount", clients.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getTeamServices()
    .then((services) => {
      latestTeamServices = services;
      const servicesBody = root.querySelector<HTMLElement>(
        "#ref-team-services tbody",
      );
      if (servicesBody)
        servicesBody.innerHTML = services.length
          ? services.map(teamServiceRow).join("")
          : emptyRow(6, "Aucune equipe ou service en base pour le moment.");
      setText(root, "#refTeamServicesCount", services.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getEmployees()
    .then((employees) => {
      latestEmployees = employees;
      const employeesBody = root.querySelector<HTMLElement>(
        "#ref-employees tbody",
      );
      if (employeesBody)
        employeesBody.innerHTML = employees.length
          ? employees.map(employeeRefRow).join("")
          : emptyRow(6, "Aucun employe en base pour le moment.");
      setText(root, "#refEmployeesCount", employees.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);
  getProjects()
    .then((projects) => {
      latestProjects = projects;
      const projectsBody = root.querySelector<HTMLElement>(
        "#ref-projects tbody",
      );
      if (projectsBody)
        projectsBody.innerHTML = projects.length
          ? projects.map(projectRow).join("")
          : emptyRow(8, "Aucun projet en base pour le moment.");
      setText(root, "#refProjectsCount", projects.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getLocations()
    .then((locations) => {
      latestLocations = locations;
      const locationBody = root.querySelector<HTMLElement>(
        "#ref-locations tbody",
      );
      if (locationBody)
        locationBody.innerHTML = locations.length
          ? locations.map(locationRow).join("")
          : emptyRow(7, "Aucun emplacement en base pour le moment.");
      setText(root, "#refLocationsCount", locations.length);
      const siteBody = root.querySelector<HTMLElement>("#ref-sites tbody");
      const sites = locations.filter((location) =>
        ["SITE", "CHANTIER"].includes(location.type.toUpperCase()),
      );
      if (siteBody)
        siteBody.innerHTML = sites.length
          ? sites.map(siteRow).join("")
          : emptyRow(7, "Aucun site ou chantier en base pour le moment.");
      setText(root, "#refSitesCount", sites.length);
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
      const dashboardPendingCount = root.querySelector<HTMLElement>(
        "#dashboardPendingExitRequestsCount",
      );
      if (pendingAlert)
        pendingAlert.classList.toggle("hidden", pendingExits.length === 0);
      if (pendingCount) pendingCount.textContent = String(pendingExits.length);
      if (dashboardPendingCount)
        dashboardPendingCount.textContent = String(pendingExits.length);
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
      const usersBody = root.querySelector<HTMLElement>("#users tbody");
      if (usersBody)
        usersBody.innerHTML = users.length
          ? users.map(userRow).join("")
          : emptyRow(6, "Aucun utilisateur en base pour le moment.");
      setText(
        root,
        "#usersAdminCount",
        users.filter((user) => user.roles.includes("ADMIN_STOCK")).length,
      );
      setText(
        root,
        "#usersManagersCount",
        users.filter((user) => user.roles.includes("GESTIONNAIRE_STOCK"))
          .length,
      );
      setText(
        root,
        "#usersAuditCount",
        users.filter((user) => user.roles.includes("AUDIT")).length,
      );
      setText(
        root,
        "#usersProjectManagersCount",
        users.filter((user) => user.roles.includes("CHEF_PROJET")).length,
      );
      setText(
        root,
        "#usersDirectionCount",
        users.filter((user) => user.roles.includes("DIRECTION")).length,
      );
      renderAuditLogs(root);
      renderHistory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getAuditAlerts()
    .then((alerts) => {
      latestAuditAlerts = alerts;
      renderAuditAlerts(root);
      const homeAlerts = root.querySelector<HTMLElement>("#homeAuditAlerts");
      if (homeAlerts)
        homeAlerts.innerHTML = alerts.length
          ? alerts
              .slice(0, 3)
              .map(
                (alert) =>
                  '<div class="p-4 rounded-xl bg-warning-50 border border-warning-100"><div class="font-bold text-warning-700">' +
                  escapeHtml(alert.type) +
                  '</div><div class="text-sm text-gray-600 mt-1">' +
                  escapeHtml(alert.action + " - " + alert.object) +
                  "</div></div>",
              )
              .join("")
          : '<div class="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500">Aucune alerte audit pour le moment.</div>';
      setAuditCardValue(root, "Alertes ouvertes", alerts.length);
      setAuditCardValue(
        root,
        "Ruptures",
        alerts.filter((alert) => auditAlertDomain(alert) === "STOCK").length,
      );
      setAuditCardValue(
        root,
        "Ecarts inventaire",
        alerts.filter((alert) => auditAlertDomain(alert) === "INVENTORY").length,
      );
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getAuditLogs()
    .then((logs) => {
      latestAuditLogs = logs;
      renderAuditLogs(root);
      renderHistory(root);
      setAuditCardValue(root, "Actions tracees", logs.length);
      window.lucide?.createIcons();
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
  root.querySelectorAll<HTMLElement>(".ref-view").forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `ref-${ref}`);
  });
  root.querySelectorAll<HTMLElement>(".ref-tab").forEach((tab) => {
    tab.classList.remove("bg-accent-50", "text-accent-600");
    tab.classList.add("bg-gray-100", "text-gray-600");
  });
  if (button) {
    button.classList.add("bg-accent-50", "text-accent-600");
    button.classList.remove("bg-gray-100", "text-gray-600");
  }
  window.lucide?.createIcons();
}

function setUserModalMode(root: HTMLElement, title: string, subtitle: string) {
  const modal = root.querySelector<HTMLElement>("#userModal");
  const subtitleNode = modal?.querySelector<HTMLElement>(
    ".text-xs.text-gray-500.font-semibold",
  );
  const titleNode = modal?.querySelector<HTMLHeadingElement>("h2");
  if (subtitleNode) subtitleNode.textContent = subtitle;
  if (titleNode) titleNode.textContent = title;
}

function prepareUserModal(root: HTMLElement) {
  selectedUserId = null;
  setUserModalMode(root, "Nouvel utilisateur", "Administration");
  const firstName = root.querySelector<HTMLInputElement>("#userFirstName");
  const lastName = root.querySelector<HTMLInputElement>("#userLastName");
  const identifier = root.querySelector<HTMLInputElement>("#userIdentifier");
  const email = root.querySelector<HTMLInputElement>("#userEmail");
  const password = root.querySelector<HTMLInputElement>("#userPassword");
  const active = root.querySelector<HTMLSelectElement>("#userActive");
  if (firstName) firstName.value = "";
  if (lastName) lastName.value = "";
  if (identifier) identifier.value = "";
  if (email) email.value = "";
  if (password) password.value = "";
  if (active) active.value = "true";
  root
    .querySelectorAll<HTMLInputElement>('input[name="userRole"]')
    .forEach((input) => {
      input.checked = input.value === "GESTIONNAIRE_STOCK";
    });
}

function fillUserModal(root: HTMLElement, user: StockUser) {
  selectedUserId = user.id;
  setUserModalMode(root, userDisplayName(user), "Compte utilisateur");
  const firstName = root.querySelector<HTMLInputElement>("#userFirstName");
  const lastName = root.querySelector<HTMLInputElement>("#userLastName");
  const identifier = root.querySelector<HTMLInputElement>("#userIdentifier");
  const email = root.querySelector<HTMLInputElement>("#userEmail");
  const password = root.querySelector<HTMLInputElement>("#userPassword");
  const active = root.querySelector<HTMLSelectElement>("#userActive");
  if (firstName) firstName.value = user.firstName;
  if (lastName) lastName.value = user.lastName;
  if (identifier) identifier.value = user.identifier;
  if (email) email.value = user.email ?? "";
  if (password) password.value = "";
  if (active) active.value = user.active ? "true" : "false";
  root
    .querySelectorAll<HTMLInputElement>('input[name="userRole"]')
    .forEach((input) => {
      input.checked = user.roles.includes(input.value);
    });
}

function openUserDetail(root: HTMLElement, id: string) {
  const user = latestUsers.find((item: StockUser) => item.id === id);
  if (!user) {
    showToast(
      root,
      "Utilisateur introuvable dans le registre charge.",
      "error",
    );
    return;
  }
  openModal(root, "userModal");
  fillUserModal(root, user);
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
function validateArticleImportRow(row: ArticleImportRow, index: number) {
  const errors: string[] = [];
  if (!row.designation.trim()) errors.push("Designation obligatoire");
  const category = articleImportHeaderKey(row.category);
  if (!["fo", "gsm", "blr"].includes(category))
    errors.push("Famille invalide (FO, GSM ou BLR)");
  if (!articleImportKey(row.unit)) errors.push("Unite obligatoire");
  const tracking = articleImportHeaderKey(row.trackingMode);
  if (
    !(
      tracking === "quantity" ||
      tracking === "articleenquantite" ||
      tracking === "individual" ||
      tracking === "materielidentifie"
    )
  )
    errors.push("Mode de suivi invalide");
  (
    ["minimumStock", "securityStock", "initialStock", "referencePrice"] as const
  ).forEach((field) => {
    if (
      row[field].trim() !== "" &&
      (!Number.isFinite(articleImportNumber(row[field])) ||
        articleImportNumber(row[field]) < 0)
    )
      errors.push(field + " doit etre un nombre positif");
  });
  if (Number.isFinite(index) && row.designation.trim()) {
    const designationKey = articleImportKey(row.designation);
    const occurrences = articleImportRows.filter(
      (other) => articleImportKey(other.designation) === designationKey,
    ).length;
    if (occurrences > 1) errors.push("Designation en doublon dans le fichier");
  }
  const existing =
    Boolean(row.designation.trim()) &&
    latestArticles.some(
      (article) =>
        articleImportKey(article.designation) ===
        articleImportKey(row.designation),
    );
  if (existing) errors.push("Designation deja presente dans le referentiel");
  if (articleImportNumber(row.initialStock) > 0 && !row.location.trim())
    errors.push("Emplacement requis si stock de depart renseigne");
  if (
    row.supplier.trim() &&
    !latestSuppliers.some(
      (item) =>
        articleImportKey(item.name) === articleImportKey(row.supplier) ||
        articleImportKey(item.id) === articleImportKey(row.supplier),
    )
  )
    errors.push("Fournisseur introuvable");
  if (
    row.location.trim() &&
    !latestLocations.some(
      (item) =>
        articleImportKey(item.name) === articleImportKey(row.location) ||
        articleImportKey(item.code) === articleImportKey(row.location) ||
        item.id === row.location,
    )
  )
    errors.push("Emplacement introuvable");
  return errors;
}
function renderArticleImport(root: HTMLElement) {
  const table = root.querySelector<HTMLElement>("#articleImportTable");
  const summary = root.querySelector<HTMLElement>("#articleImportSummary");
  const save = root.querySelector<HTMLButtonElement>(
    "#articleImportSaveButton",
  );
  if (!table || !summary) return;
  articleImportRows.forEach(
    (row, index) => (row.errors = validateArticleImportRow(row, index)),
  );
  const valid = articleImportRows.filter((row) => !row.errors.length).length;
  summary.classList.remove("hidden");
  summary.classList.add("grid");
  summary.innerHTML =
    detailCard("Total lignes", articleImportRows.length) +
    detailCard("Lignes valides", valid, "success") +
    detailCard("Lignes invalides", articleImportRows.length - valid, "gray") +
    detailCard("A enregistrer", valid, "accent");
  const fields: Array<[keyof ArticleImportRow, string]> = [
    ["designation", "Designation"],
    ["category", "Famille"],
    ["unit", "Unite"],
    ["trackingMode", "Mode de suivi"],
    ["minimumStock", "Stock min."],
    ["securityStock", "Stock securite"],
    ["initialStock", "Stock depart"],
    ["referencePrice", "Prix indicatif"],
    ["supplier", "Fournisseur"],
    ["location", "Emplacement"],
  ];
  table.classList.remove("hidden");
  table.innerHTML = `<div class="mb-3 rounded-xl border border-accent-100 bg-accent-50 p-3 text-sm font-semibold text-accent-700">Les codes articles seront generes automatiquement a l'enregistrement.</div><div class="overflow-auto border rounded-xl"><table class="w-full min-w-[1150px] text-sm"><thead class="bg-gray-50"><tr><th class="p-3 text-left">Ligne</th>${fields.map(([, label]) => `<th class="p-3 text-left">${label}</th>`).join("")}<th class="p-3 text-left">Validation</th></tr></thead><tbody class="divide-y">${articleImportRows.map((row, index) => `<tr class="${row.errors.length ? "bg-error-50/40" : "bg-success-50/20"}"><td class="p-2 font-bold">${index + 2}</td>${fields.map(([field]) => `<td class="p-2"><input data-import-row="${index}" data-import-field="${field}" value="${escapeHtml(row[field])}" class="w-32 h-9 border rounded px-2 bg-white"></td>`).join("")}<td class="p-2 ${row.errors.length ? "text-error-700" : "text-success-700"} font-semibold">${row.errors.length ? escapeHtml(row.errors.join(" | ")) : "Valide"}</td></tr>`).join("")}</tbody></table></div>`;
  if (save) {
    save.disabled = valid === 0;
    save.classList.toggle("opacity-50", !valid);
    save.classList.toggle("cursor-not-allowed", !valid);
  }
  window.lucide?.createIcons();
}
async function readArticleImportFile(root: HTMLElement, file: File) {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
    const aliases: Record<string, keyof ArticleImportRow> = {
      code: "code",
      designation: "designation",
      famille: "category",
      category: "category",
      unite: "unit",
      unit: "unit",
      "mode de suivi": "trackingMode",
      trackingmode: "trackingMode",
      "stock minimum": "minimumStock",
      minimumstock: "minimumStock",
      "stock securite": "securityStock",
      securitystock: "securityStock",
      "stock depart": "initialStock",
      "stock de depart": "initialStock",
      initialstock: "initialStock",
      "prix indicatif": "referencePrice",
      referenceprice: "referencePrice",
      fournisseur: "supplier",
      "fournisseur habituel": "supplier",
      emplacement: "location",
      "emplacement de depart": "location",
    };
    articleImportRows = records.map((record) => {
      const row: ArticleImportRow = {
        code: "",
        designation: "",
        category: "",
        unit: "",
        trackingMode: "QUANTITY",
        minimumStock: "",
        securityStock: "",
        initialStock: "",
        referencePrice: "",
        supplier: "",
        location: "",
        errors: [],
      };
      Object.entries(record).forEach(([key, value]) => {
        const normalizedHeader = articleImportKey(key);
        const field =
          aliases[normalizedHeader] ?? aliases[articleImportHeaderKey(key)];
        if (field && field !== "errors")
          (row as unknown as Record<string, string>)[field] = String(
            value ?? "",
          ).trim();
      });
      return row;
    });
    if (!articleImportRows.length)
      throw new Error("Le fichier ne contient aucune ligne.");
    renderArticleImport(root);
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Lecture du fichier impossible.",
      "error",
    );
  }
}
async function importArticles(root: HTMLElement) {
  articleImportRows.forEach(
    (row, index) => (row.errors = validateArticleImportRow(row, index)),
  );
  const validRows = articleImportRows.filter((row) => !row.errors.length);
  if (!validRows.length) {
    renderArticleImport(root);
    showToast(root, "Aucune ligne valide a enregistrer.", "error");
    return;
  }
  try {
    for (const row of validRows) {
      const tracking = articleImportHeaderKey(row.trackingMode);
      const supplier = latestSuppliers.find(
        (item) =>
          articleImportKey(item.name) === articleImportKey(row.supplier) ||
          articleImportKey(item.id) === articleImportKey(row.supplier),
      );
      const location = latestLocations.find(
        (item) =>
          articleImportKey(item.name) === articleImportKey(row.location) ||
          articleImportKey(item.code) === articleImportKey(row.location) ||
          item.id === row.location,
      );
      await createArticle({
        designation: row.designation.trim(),
        category: row.category.trim().toUpperCase(),
        unit: row.unit.trim(),
        trackingMode:
          tracking === "individual" || tracking === "materielidentifie"
            ? "INDIVIDUAL"
            : "QUANTITY",
        minimumStock: articleImportNumber(row.minimumStock),
        securityStock: articleImportNumber(row.securityStock),
        referencePrice: row.referencePrice.trim()
          ? articleImportNumber(row.referencePrice)
          : null,
        defaultSupplierId: supplier?.id,
        defaultLocationId: location?.id,
        initialStock: articleImportNumber(row.initialStock),
        initialLocationId: location?.id,
      });
    }
    closeModal(root, "importModal");
    articleImportRows = [];
    updateApiBackedViews(root);
    showToast(
      root,
      `${validRows.length} article(s) importe(s). Les lignes invalides n'ont pas ete enregistrees.`,
    );
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Import impossible.",
      "error",
    );
  }
}

function referentialImportDefaults(
  type: ReferentialImportType,
): ReferentialImportRow {
  return Object.fromEntries([
    ...referentialImportFields[type].map(([field]) => [field, ""]),
    ["errors", []],
  ]) as ReferentialImportRow;
}
function referentialImportValid(row: ReferentialImportRow, index: number) {
  const errors: string[] = [];
  const primaryField =
    referentialImportType === "employee" ? "lastName" : "name";
  const secondaryField =
    referentialImportType === "employee" ? "firstName" : undefined;
  const primaryValue = String(row[primaryField] ?? "").trim();
  const secondaryValue = secondaryField
    ? String(row[secondaryField] ?? "").trim()
    : "";
  if (!primaryValue) errors.push("Nom ou designation obligatoire");
  if (secondaryField && !secondaryValue) errors.push("Prenom obligatoire");
  if (referentialImportType === "project") {
    const managerValue = String(row.projectManager ?? "").trim();
    if (!managerValue) {
      errors.push("Chef de projet obligatoire");
    } else if (
      !latestUsers.some(
        (item) =>
          item.active &&
          item.roles.includes("CHEF_PROJET") &&
          (articleImportKey(item.id) === articleImportKey(managerValue) ||
            articleImportKey(userDisplayName(item)) ===
              articleImportKey(managerValue) ||
            articleImportKey(item.identifier) === articleImportKey(managerValue) ||
            articleImportKey(item.email) === articleImportKey(managerValue)),
      )
    ) {
      errors.push("Chef de projet introuvable");
    }
  }
  const key = articleImportKey(
    [primaryValue, secondaryValue].filter(Boolean).join(" "),
  );
  if (
    key &&
    referentialImportRows.filter(
      (item) => {
        const itemPrimary = String(item[primaryField] ?? "").trim();
        const itemSecondary = secondaryField
          ? String(item[secondaryField] ?? "").trim()
          : "";
        return (
          articleImportKey(
            [itemPrimary, itemSecondary].filter(Boolean).join(" "),
          ) === key
        );
      },
    ).length > 1
  )
    errors.push("Nom en doublon dans le fichier");
  const collections: Record<string, unknown[]> = {
    supplier: latestSuppliers,
    client: latestClients,
    project: latestProjects,
    site: latestLocations.filter((item) =>
      ["SITE", "CHANTIER"].includes(item.type.toUpperCase()),
    ),
    location: latestLocations,
    teamService: latestTeamServices,
    employee: latestEmployees,
  };
  const existing = (collections[referentialImportType] ?? []).some(
    (item) => {
      const record = item as {
        name?: string;
        lastName?: string;
        firstName?: string;
      };
      return (
        articleImportKey(
          referentialImportType === "employee"
            ? [record.lastName, record.firstName].filter(Boolean).join(" ")
            : record.name,
        ) === key
      );
    },
  );
  if (key && existing) errors.push("Nom deja present dans le referentiel");
  return errors;
}
function renderReferentialImport(root: HTMLElement) {
  const table = root.querySelector<HTMLElement>("#articleImportTable");
  const summary = root.querySelector<HTMLElement>("#articleImportSummary");
  const save = root.querySelector<HTMLButtonElement>(
    "#articleImportSaveButton",
  );
  if (!table || !summary) return;
  referentialImportRows.forEach(
    (row, index) => (row.errors = referentialImportValid(row, index)),
  );
  const valid = referentialImportRows.filter(
    (row) => !row.errors.length,
  ).length;
  summary.classList.remove("hidden");
  summary.classList.add("grid");
  summary.innerHTML =
    detailCard("Total lignes", referentialImportRows.length) +
    detailCard("Lignes valides", valid, "success") +
    detailCard(
      "Lignes invalides",
      referentialImportRows.length - valid,
      "gray",
    );
  const fields = referentialImportFields[referentialImportType];
  table.classList.remove("hidden");
  table.innerHTML = `<div class="mb-3 rounded-xl border border-accent-100 bg-accent-50 p-3 text-sm font-semibold text-accent-700">Les codes seront generes automatiquement a l'enregistrement.</div><div class="overflow-auto border rounded-xl"><table class="w-full min-w-[900px] text-sm"><thead class="bg-gray-50"><tr><th class="p-3 text-left">Ligne</th>${fields.map(([, label]) => `<th class="p-3 text-left">${label}</th>`).join("")}<th class="p-3 text-left">Validation</th></tr></thead><tbody class="divide-y">${referentialImportRows.map((row, index) => `<tr class="${row.errors.length ? "bg-error-50/40" : "bg-success-50/20"}"><td class="p-2 font-bold">${index + 2}</td>${fields.map(([field]) => `<td class="p-2"><input data-import-row="${index}" data-import-field="${field}" value="${escapeHtml(row[field] ?? "")}" class="w-32 h-9 border rounded px-2 bg-white"></td>`).join("")}<td class="p-2 font-semibold ${row.errors.length ? "text-error-700" : "text-success-700"}">${row.errors.length ? escapeHtml(row.errors.join(" | ")) : "Valide"}</td></tr>`).join("")}</tbody></table></div>`;
  if (save) {
    save.disabled = valid === 0;
    save.classList.toggle("opacity-50", !valid);
    save.classList.toggle("cursor-not-allowed", !valid);
  }
  window.lucide?.createIcons();
}
async function downloadReferentialTemplate(root: HTMLElement) {
  try {
    const fields = referentialImportFields[referentialImportType];
    await exportWorkbook({
      filename: `modele-import-${referentialImportType}-stock-hub.xlsx`,
      sheetName: "Referentiel",
      columns: fields.map(([field, label]) => ({
        key: field,
        header: label,
      })),
      rows: [
        Object.fromEntries(
          fields.map(([field]) => [field, field === "category" ? "Exemple" : ""]),
        ),
      ],
    });
    showToast(root, "Modele Excel telecharge.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Telechargement impossible.",
      "error",
    );
  }
}
async function readReferentialImportFile(root: HTMLElement, file: File) {
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
    const fields = referentialImportFields[referentialImportType];
    referentialImportRows = records.map((record) => {
      const row = referentialImportDefaults(referentialImportType);
      Object.entries(record).forEach(([key, value]) => {
        const normalized = articleImportHeaderKey(key);
        const field = fields.find(
          ([name, label]) =>
            articleImportHeaderKey(name) === normalized ||
            articleImportHeaderKey(label) === normalized,
        )?.[0];
        if (field) row[field] = String(value ?? "").trim();
      });
      return row;
    });
    if (!referentialImportRows.length)
      throw new Error("Le fichier ne contient aucune ligne.");
    renderReferentialImport(root);
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Lecture du fichier impossible.",
      "error",
    );
  }
}
async function importReferentialElements(root: HTMLElement) {
  referentialImportRows.forEach(
    (row, index) => (row.errors = referentialImportValid(row, index)),
  );
  const rows = referentialImportRows.filter((row) => !row.errors.length);
  if (!rows.length) {
    renderReferentialImport(root);
    showToast(root, "Aucune ligne valide a enregistrer.", "error");
    return;
  }
  try {
    for (const row of rows) {
      const value = (field: string) =>
        String(row[field] ?? "").trim() || undefined;
      const type = referentialImportType;
      if (type === "supplier")
        await createSupplier({
          name: value("name")!,
          fiscalId: value("fiscalId"),
          category: value("category"),
          contact: value("contact"),
          phone: value("phone"),
          email: value("email"),
          address: value("address"),
        });
      else if (type === "client")
        await createClient({
          name: value("name")!,
          contact: value("contact"),
          phone: value("phone"),
          email: value("email"),
        });
      else if (type === "employee")
        await createEmployee({
          lastName: value("lastName")!,
          firstName: value("firstName")!,
          department: value("department"),
          role: value("role"),
          phone: value("phone"),
        });
      else if (type === "teamService")
        await createTeamService({
          name: value("name")!,
          type: value("type"),
          manager: value("manager"),
        });
      else if (type === "project")
        {
          const managerValue = value("projectManager");
          const manager = managerValue
            ? latestUsers.find(
                (item) =>
                  item.active &&
                  item.roles.includes("CHEF_PROJET") &&
                  (articleImportKey(item.id) === articleImportKey(managerValue) ||
                    articleImportKey(userDisplayName(item)) ===
                      articleImportKey(managerValue) ||
                    articleImportKey(item.identifier) ===
                      articleImportKey(managerValue) ||
                    articleImportKey(item.email) === articleImportKey(managerValue)),
              )
            : undefined;
          await createProject({
            name: value("name")!,
            client: value("client"),
            projectManagerId: manager?.id,
            region: value("region"),
            city: value("city"),
            startDate: value("startDate"),
            endDate: value("endDate"),
          });
        }
      else if (type === "site" || type === "location") {
        const projectValue = value("project");
        const project = projectValue
          ? latestProjects.find(
              (item) =>
                articleImportKey(item.id) === articleImportKey(projectValue) ||
                articleImportKey(item.code) ===
                  articleImportKey(projectValue) ||
                articleImportKey(item.name) === articleImportKey(projectValue),
            )
          : undefined;
        await createLocation({
          name: value("name")!,
          type: type === "site" ? "CHANTIER" : (value("type") ?? "MAGASIN"),
          projectId: project?.id,
          responsible: value("responsible"),
          region: value("region"),
          city: value("city"),
          address: value("address"),
        });
      }
    }
    closeModal(root, "importModal");
    referentialImportRows = [];
    updateApiBackedViews(root);
    showToast(root, `${rows.length} element(s) importe(s).`);
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Import impossible.",
      "error",
    );
  }
}

const inventoryImportFields: Array<[keyof InventoryImportRow, string]> = [
  ["articleCode", "Code article"],
  ["designation", "Designation"],
  ["location", "Emplacement"],
  ["theoretical", "Stock theorique"],
  ["counted", "Quantite constatee"],
  ["good", "Bon etat"],
  ["repair", "A reparer"],
  ["outOfService", "Hors service"],
  ["justification", "Justification"],
];

function findInventoryImportArticle(row: InventoryImportRow) {
  return latestArticles.find(
    (article) =>
      articleImportKey(article.code) === articleImportKey(row.articleCode) ||
      (row.designation.trim() &&
        articleImportKey(article.designation) === articleImportKey(row.designation)),
  );
}

function findInventoryImportLocation(row: InventoryImportRow) {
  return latestLocations.find(
    (location) =>
      articleImportKey(location.code) === articleImportKey(row.location) ||
      articleImportKey(location.name) === articleImportKey(row.location) ||
      location.id === row.location,
  );
}

function validateInventoryImportRow(row: InventoryImportRow, index: number) {
  const errors: string[] = [];
  const article = findInventoryImportArticle(row);
  const location = findInventoryImportLocation(row);
  if (!row.articleCode.trim() && !row.designation.trim())
    errors.push("Article obligatoire");
  if (!article) errors.push("Article introuvable");
  if (!row.location.trim()) errors.push("Emplacement obligatoire");
  if (!location) errors.push("Emplacement introuvable");
  (["theoretical", "counted", "good", "repair", "outOfService"] as const).forEach(
    (field) => {
      const value = articleImportNumber(row[field]);
      if (!Number.isFinite(value) || value < 0) {
        errors.push(inventoryImportFields.find(([name]) => name === field)?.[1] + " invalide");
      }
    },
  );
  const counted = articleImportNumber(row.counted);
  const good = articleImportNumber(row.good);
  const repair = articleImportNumber(row.repair);
  const outOfService = articleImportNumber(row.outOfService);
  if (
    [counted, good, repair, outOfService].every(Number.isFinite) &&
    Math.abs(counted - (good + repair + outOfService)) > 0.000001
  ) {
    errors.push("Somme des etats differente du constate");
  }
  if (
    Number.isFinite(counted) &&
    Number.isFinite(articleImportNumber(row.theoretical)) &&
    counted !== articleImportNumber(row.theoretical) &&
    !row.justification.trim()
  ) {
    errors.push("Justification obligatoire si ecart");
  }
  if (article && location) {
    const key = inventoryPairKey(article.id, location.id);
    const duplicateCount = inventoryImportRows.filter((other) => {
      const otherArticle = findInventoryImportArticle(other);
      const otherLocation = findInventoryImportLocation(other);
      return (
        otherArticle &&
        otherLocation &&
        inventoryPairKey(otherArticle.id, otherLocation.id) === key
      );
    }).length;
    if (Number.isFinite(index) && duplicateCount > 1)
      errors.push("Article/emplacement en doublon");
  }
  return errors;
}

function renderInventoryImport(root: HTMLElement) {
  const table = root.querySelector<HTMLElement>("#inventoryImportTable");
  const summary = root.querySelector<HTMLElement>("#inventoryImportSummary");
  const save = root.querySelector<HTMLButtonElement>(
    "#inventoryImportSaveButton",
  );
  if (!table || !summary) return;
  inventoryImportRows.forEach(
    (row, index) => (row.errors = validateInventoryImportRow(row, index)),
  );
  const valid = inventoryImportRows.filter((row) => !row.errors.length).length;
  summary.classList.remove("hidden");
  summary.classList.add("grid");
  summary.innerHTML =
    detailCard("Total lignes", inventoryImportRows.length) +
    detailCard("Lignes valides", valid, "success") +
    detailCard("Lignes invalides", inventoryImportRows.length - valid, "gray") +
    detailCard("A enregistrer", valid, "accent");
  table.classList.remove("hidden");
  table.innerHTML = `<div class="overflow-auto border rounded-xl"><table class="w-full min-w-[1180px] text-sm"><thead class="bg-gray-50"><tr><th class="p-3 text-left">Ligne</th>${inventoryImportFields.map(([, label]) => `<th class="p-3 text-left">${label}</th>`).join("")}<th class="p-3 text-left">Validation</th></tr></thead><tbody class="divide-y">${inventoryImportRows.map((row, index) => `<tr class="${row.errors.length ? "bg-error-50/40" : "bg-success-50/20"}"><td class="p-2 font-bold">${index + 2}</td>${inventoryImportFields.map(([field]) => `<td class="p-2"><input data-inventory-import-row="${index}" data-inventory-import-field="${field}" value="${escapeHtml(String(row[field] ?? ""))}" class="w-32 h-9 border rounded px-2 bg-white"></td>`).join("")}<td class="p-2 font-semibold ${row.errors.length ? "text-error-700" : "text-success-700"}">${row.errors.length ? escapeHtml(row.errors.join(" | ")) : "Valide"}</td></tr>`).join("")}</tbody></table></div>`;
  if (save) {
    save.disabled = valid === 0;
    save.classList.toggle("opacity-50", !valid);
    save.classList.toggle("cursor-not-allowed", !valid);
  }
  window.lucide?.createIcons();
}

async function downloadInventoryImportTemplate(root: HTMLElement) {
  const lines = allInventoryComputedLines();
  try {
    await exportWorkbook({
      filename: "modele-inventaire-stock-hub.xlsx",
      sheetName: "Inventaire",
      columns: inventoryImportFields.map(([field, label]) => ({
        key: field,
        header: label,
        type: ["theoretical", "counted", "good", "repair", "outOfService"].includes(field)
          ? "number"
          : "text",
      })),
      rows: lines.map((line) => ({
        articleCode: line.article.code,
        designation: line.article.designation,
        location: line.location.code || line.location.name,
        theoretical: line.theoretical,
        counted: line.counted,
        good: line.good,
        repair: line.repair,
        outOfService: line.outOfService,
        justification: line.justification,
      })),
    });
    showToast(root, "Modele inventaire telecharge.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Telechargement impossible.",
      "error",
    );
  }
}

async function readInventoryImportFile(root: HTMLElement, file: File) {
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
    const aliases: Record<string, keyof InventoryImportRow> = {
      codearticle: "articleCode",
      code: "articleCode",
      designation: "designation",
      article: "designation",
      emplacement: "location",
      location: "location",
      stocktheorique: "theoretical",
      stocktheoriqueemplacement: "theoretical",
      quantiteconstatee: "counted",
      constate: "counted",
      bonetat: "good",
      areparer: "repair",
      horsservice: "outOfService",
      justification: "justification",
      observation: "justification",
    };
    inventoryImportRows = records.map((record) => {
      const row: InventoryImportRow = {
        articleCode: "",
        designation: "",
        location: "",
        theoretical: "",
        counted: "",
        good: "",
        repair: "",
        outOfService: "",
        justification: "",
        errors: [],
      };
      Object.entries(record).forEach(([key, value]) => {
        const field =
          aliases[articleImportHeaderKey(key)] ?? aliases[articleImportKey(key)];
        if (field && field !== "errors") {
          row[field] = String(value ?? "").trim();
        }
      });
      return row;
    });
    if (!inventoryImportRows.length)
      throw new Error("Le fichier ne contient aucune ligne.");
    renderInventoryImport(root);
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Lecture du fichier impossible.",
      "error",
    );
  }
}

async function importInventoryRows(root: HTMLElement) {
  inventoryImportRows.forEach(
    (row, index) => (row.errors = validateInventoryImportRow(row, index)),
  );
  const rows = inventoryImportRows.filter((row) => !row.errors.length);
  if (!rows.length) {
    renderInventoryImport(root);
    showToast(root, "Aucune ligne valide a enregistrer.", "error");
    return;
  }
  const grouped = new Map<
    string,
    Array<{
      articleId: string;
      expectedQuantity: number;
      completedQuantity: number;
      goodQuantity: number;
      repairQuantity: number;
      outOfServiceQuantity: number;
      observation?: string;
    }>
  >();
  rows.forEach((row) => {
    const article = findInventoryImportArticle(row);
    const location = findInventoryImportLocation(row);
    if (!article || !location) return;
    grouped.set(location.id, [
      ...(grouped.get(location.id) ?? []),
      {
        articleId: article.id,
        expectedQuantity: articleImportNumber(row.theoretical),
        completedQuantity: articleImportNumber(row.counted),
        goodQuantity: articleImportNumber(row.good),
        repairQuantity: articleImportNumber(row.repair),
        outOfServiceQuantity: articleImportNumber(row.outOfService),
        observation: row.justification.trim() || undefined,
      },
    ]);
  });
  try {
    let index = 0;
    for (const [locationId, lines] of grouped.entries()) {
      index += 1;
      await createInventoryAdjustment({
        reference: "INV-" + Date.now() + "-" + index,
        date: new Date().toISOString(),
        locationId,
        handledBy: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
          : undefined,
        notes: "Import Excel inventaire",
        lines,
      });
    }
    closeModal(root, "inventoryImportModal");
    inventoryImportRows = [];
    const [movements, stockLevels] = await Promise.all([
      getStockMovements(),
      getStockLevels().catch(() => latestStockLevels),
    ]);
    latestMovements = movements;
    latestStockLevels = stockLevels;
    updateApiBackedViews(root);
    renderInventory(root);
    showToast(root, `${rows.length} ligne(s) d'inventaire importee(s).`);
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Import inventaire impossible.",
      "error",
    );
  }
}

async function downloadArticleImportTemplate(root: HTMLElement) {
  const headers = [
    "Designation",
    "Famille",
    "Unite",
    "Mode de suivi",
    "Stock minimum",
    "Stock securite",
    "Stock de depart",
    "Prix indicatif",
    "Fournisseur habituel",
    "Emplacement de depart",
  ];
  const example = [
    "Cable reseau Cat6",
    "FO",
    "Piece",
    "Article en quantite",
    "10",
    "20",
    "0",
    "1500",
    "",
    "",
  ];
  try {
    await exportWorkbook({
      filename: "modele-import-articles-stock-hub.xlsx",
      sheetName: "Articles",
      columns: headers.map((header) => ({
        key: articleImportHeaderKey(header),
        header,
        type: ["stockminimum", "stocksecurite", "stockdedepart", "prixindicatif"].includes(
          articleImportHeaderKey(header),
        )
          ? "number"
          : "text",
      })),
      rows: [
        Object.fromEntries(
          headers.map((header, index) => [
            articleImportHeaderKey(header),
            ["Stock minimum", "Stock securite", "Stock de depart", "Prix indicatif"].includes(header)
              ? Number(example[index] || 0)
              : example[index],
          ]),
        ),
      ],
    });
    showToast(
      root,
      "Modele Excel telecharge. Complete-le sans modifier les noms de colonnes.",
    );
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Telechargement impossible.",
      "error",
    );
  }
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
    articleImportRows = [];
    referentialImportRows = [];
    referentialImportType =
      (root.querySelector<HTMLSelectElement>("#referentialImportType")
        ?.value as ReferentialImportType) || "article";
    const file = root.querySelector<HTMLInputElement>("#articleImportFile");
    if (file) file.value = "";
    root
      .querySelector<HTMLElement>("#articleImportSummary")
      ?.classList.add("hidden");
    root
      .querySelector<HTMLElement>("#articleImportTable")
      ?.classList.add("hidden");
    const save = root.querySelector<HTMLButtonElement>(
      "#articleImportSaveButton",
    );
    if (save) {
      save.disabled = true;
      save.classList.add("opacity-50", "cursor-not-allowed");
    }
  }
  if (id === "inventoryImportModal") {
    inventoryImportRows = [];
    const file = root.querySelector<HTMLInputElement>("#inventoryImportFile");
    if (file) file.value = "";
    root
      .querySelector<HTMLElement>("#inventoryImportSummary")
      ?.classList.add("hidden");
    root
      .querySelector<HTMLElement>("#inventoryImportTable")
      ?.classList.add("hidden");
    const save = root.querySelector<HTMLButtonElement>(
      "#inventoryImportSaveButton",
    );
    if (save) {
      save.disabled = true;
      save.classList.add("opacity-50", "cursor-not-allowed");
    }
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
  const input = root.querySelector<HTMLInputElement>("#loginPassword");
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
}

async function login(root: HTMLElement) {
  const identifier =
    root
      .querySelector<HTMLInputElement>("#loginIdentifier")
      ?.value.trim()
      .toLowerCase() ?? "";
  const password =
    root.querySelector<HTMLInputElement>("#loginPassword")?.value ?? "";
  setLoginError(root, null);
  try {
    const { user } = await loginUser({ identifier, password });
    currentUser = user;
    localStorage.setItem("stock-hub.session", "1");
    localStorage.setItem("stock-hub.user", JSON.stringify(user));
    hideLogin(root);
    updateCurrentUserDisplay(root);
    applyRoleAccess(root);
    const requestedView = viewForRoute(pendingRouteAfterLogin) ?? "home";
    navigateToView(
      root,
      canAccessView(requestedView) ? requestedView : "home",
      undefined,
      { replace: true },
    );
    pendingRouteAfterLogin = DEFAULT_ROUTE;
  } catch (error) {
    setLoginError(
      root,
      error instanceof Error ? error.message : "Connexion impossible.",
    );
  }
}

function logout(root: HTMLElement) {
  currentUser = null;
  localStorage.removeItem("stock-hub.session");
  localStorage.removeItem("stock-hub.user");
  updateCurrentUserDisplay(root);
  showLogin(root);
  writeLoginRoute(true);
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

function normalizedArticleFamily(value: unknown) {
  const family = String(value ?? "")
    .trim()
    .toUpperCase();
  return ["FO", "GSM", "BLR"].includes(family) ? family : "FO";
}

function nextCodeFromRows(root: HTMLElement, type: string, family?: string) {
  if (type === "article") {
    const selectedFamily = normalizedArticleFamily(
      family ??
        root.querySelector<HTMLSelectElement>("#ref-form-article select")
          ?.value,
    );
    const prefix = selectedFamily + "-";
    const numbers = Array.from(
      root.querySelectorAll<HTMLElement>(
        "#ref-articles tbody tr td:first-child",
      ),
    )
      .map((cell) => cell.textContent?.trim() ?? "")
      .filter((code) => code.startsWith(prefix))
      .map((code) => Number(code.slice(prefix.length).replace(/\D/g, "")))
      .filter((value) => Number.isFinite(value));
    const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
    return prefix + String(next).padStart(4, "0");
  }

  const config: Record<
    string,
    { selector: string; prefix: string; width: number }
  > = {
    supplier: {
      selector: "#ref-suppliers tbody tr td:first-child",
      prefix: "FRN-",
      width: 3,
    },
    client: {
      selector: "#ref-clients tbody tr td:first-child",
      prefix: "CLI-",
      width: 3,
    },
    project: {
      selector: "#ref-projects tbody tr td:first-child",
      prefix: "PROJ-2026-",
      width: 3,
    },
    site: {
      selector: "#ref-sites tbody tr td:first-child",
      prefix: "SITE-",
      width: 3,
    },
    teamService: {
      selector: "#ref-team-services tbody tr td:first-child",
      prefix: "SRV-",
      width: 3,
    },
    employee: {
      selector: "#ref-employees tbody tr td:first-child",
      prefix: "EMP-",
      width: 3,
    },
    location: {
      selector: "#ref-locations tbody tr td:first-child",
      prefix: "MAG-",
      width: 3,
    },
  };
  const selected = config[type];
  if (!selected) return "REF-0001";
  const numbers = Array.from(
    root.querySelectorAll<HTMLElement>(selected.selector),
  )
    .map((cell) => cell.textContent?.trim() ?? "")
    .filter((code) => code.startsWith(selected.prefix))
    .map((code) =>
      Number(code.slice(selected.prefix.length).replace(/\D/g, "")),
    )
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return selected.prefix + String(next).padStart(selected.width, "0");
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

function articleStockSummary(articleId: string) {
  const levels = latestStockLevels.filter(
    (level) => level.article.id === articleId,
  );
  const total = levels.reduce(
    (sum, level) => sum + Number(level.quantity ?? 0),
    0,
  );
  const locations = levels.length
    ? levels
        .map(
          (level) => `${level.location.name}: ${formatNumber(level.quantity)}`,
        )
        .join(" / ")
    : "Aucun stock enregistre";
  return { total, locations };
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

function textInput(
  name: string,
  label: string,
  value: unknown,
  placeholder = "",
) {
  return `<label><span class="text-sm font-semibold">${escapeHtml(label)}</span><input name="${escapeHtml(name)}" value="${escapeHtml(value ?? "")}" placeholder="${escapeHtml(placeholder)}" class="mt-2 w-full h-11 border rounded-lg px-3"></label>`;
}

function numberInput(
  name: string,
  label: string,
  value: unknown,
  placeholder = "0",
) {
  return `<label><span class="text-sm font-semibold">${escapeHtml(label)}</span><input name="${escapeHtml(name)}" type="number" value="${escapeHtml(value ?? "")}" placeholder="${escapeHtml(placeholder)}" class="mt-2 w-full h-11 border rounded-lg px-3"></label>`;
}

function selectInput(
  name: string,
  label: string,
  optionsHtml: string,
  selected = "",
) {
  const html = optionsHtml.replace(
    `value="${escapeHtml(selected)}"`,
    `value="${escapeHtml(selected)}" selected`,
  );
  return `<label><span class="text-sm font-semibold">${escapeHtml(label)}</span><select name="${escapeHtml(name)}" class="mt-2 w-full h-11 border rounded-lg px-3"><option value="">Selectionner</option>${html}</select></label>`;
}

function activeSelect(active: boolean) {
  return `<label><span class="text-sm font-semibold">Statut</span><select name="active" class="mt-2 w-full h-11 border rounded-lg px-3"><option value="true"${active ? " selected" : ""}>Actif</option><option value="false"${!active ? " selected" : ""}>Inactif</option></select></label>`;
}

function referentialActionButtons(editing: boolean) {
  if (editing) {
    return `<button data-action="cancelReferentialEdit" title="Annuler" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="x" class="w-4 h-4"></i></button><button data-action="submitReferentialEdit" title="Enregistrer" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-600 text-white hover:bg-accent-500"><i data-lucide="save" class="w-4 h-4"></i></button>`;
  }
  return `<button data-action="editReferentialDetail" title="Modifier" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-600 text-white hover:bg-accent-500"><i data-lucide="pencil" class="w-4 h-4"></i></button><button data-action="showView('historique')" title="Voir historique" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="history" class="w-4 h-4"></i></button><button data-action="deactivateReferentialDetail" title="Desactiver" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="ban" class="w-4 h-4"></i></button>`;
}

function projectManagerName(projectManagerId: string | null | undefined) {
  const manager = latestUsers.find((user) => user.id === projectManagerId);
  return manager ? `${manager.firstName} ${manager.lastName}` : "-";
}

function projectClientName(project: StockProject) {
  return (
    latestClients.find((client) => client.id === project.clientId)?.name ??
    project.client ??
    "-"
  );
}

function supplierName(id: string | null | undefined) {
  return latestSuppliers.find((supplier) => supplier.id === id)?.name ?? "-";
}

function locationName(id: string | null | undefined) {
  return latestLocations.find((location) => location.id === id)?.name ?? "-";
}

function dateInput(name: string, label: string, value: unknown) {
  const formatted = value ? String(value).slice(0, 10) : "";
  return `<label><span class="text-sm font-semibold">${escapeHtml(label)}</span><input name="${escapeHtml(name)}" type="date" value="${escapeHtml(formatted)}" class="mt-2 w-full h-11 border rounded-lg px-3"></label>`;
}

function renderReferentialDetail(
  root: HTMLElement,
  type: string,
  id: string,
  editing = false,
) {
  let title = "Element referentiel";
  let subtitle = "Informations de l'element selectionne.";
  let kind = "Fiche referentiel";
  let cards = "";
  let fields = "";
  let editFields = "";

  if (type === "article") {
    const item = latestArticles.find((article) => article.id === id);
    if (!item) return false;
    const tracking =
      item.trackingMode === "INDIVIDUAL"
        ? "Suivi individuel"
        : "Article en quantite";
    title = `${item.code} - ${item.designation}`;
    subtitle = `${tracking} utilise dans les entrees, sorties et inventaires.`;
    kind = "Fiche article";
    const stock = articleStockSummary(item.id);
    const stockAtDefaultLocation = articleStockAtLocation(
      item.id,
      item.defaultLocationId,
    );
    cards =
      detailCard("Code", item.code, "accent") +
      detailCard("Famille", item.category) +
      detailCard("Stock actuel", formatNumber(stock.total)) +
      detailCard(
        "Statut",
        item.active ? "Actif" : "Inactif",
        item.active ? "success" : "gray",
      );
    fields =
      detailField("Designation", item.designation) +
      detailField("Unite", item.unit) +
      detailField("Mode de suivi", tracking) +
      detailField("Stock minimum", formatNumber(item.minimumStock)) +
      detailField("Stock securite", formatNumber(item.securityStock)) +
      detailField("Prix indicatif", formatNumber(item.referencePrice)) +
      detailField(
        "Fournisseur habituel",
        supplierName(item.defaultSupplierId),
      ) +
      detailField(
        "Emplacement par defaut",
        locationName(item.defaultLocationId),
      ) +
      detailField(
        "Stock actuel emplacement",
        item.defaultLocationId ? formatNumber(stockAtDefaultLocation) : "-",
      ) +
      detailField("Stock par emplacement", stock.locations) +
      lifecycleFields(item);
    editFields =
      textInput("designation", "Designation", item.designation) +
      selectInput(
        "category",
        "Famille",
        option("FO", "FO") + option("GSM", "GSM") + option("BLR", "BLR"),
        item.category,
      ) +
      textInput("unit", "Unite", item.unit) +
      selectInput(
        "trackingMode",
        "Mode de suivi",
        option("QUANTITY", "Article en quantite") +
          option("INDIVIDUAL", "Suivi individuel"),
        item.trackingMode,
      ) +
      numberInput("minimumStock", "Stock minimum", item.minimumStock) +
      numberInput("securityStock", "Stock securite", item.securityStock) +
      numberInput(
        "referencePrice",
        "Prix indicatif",
        item.referencePrice ?? "",
      ) +
      selectInput(
        "defaultSupplierId",
        "Fournisseur habituel",
        supplierOptions(latestSuppliers),
        item.defaultSupplierId ?? "",
      ) +
      selectInput(
        "defaultLocationId",
        "Emplacement par defaut",
        locationOptions(latestLocations),
        item.defaultLocationId ?? "",
      ) +
      numberInput(
        "stockQuantity",
        "Stock actuel emplacement",
        stockAtDefaultLocation,
      ) +
      activeSelect(item.active);
  } else if (type === "supplier") {
    const item = latestSuppliers.find((supplier) => supplier.id === id);
    if (!item) return false;
    title = `${item.code} - ${item.name}`;
    subtitle = "Fournisseur utilise pour les entrees stock.";
    kind = "Fiche fournisseur";
    cards =
      detailCard("Code", item.code, "accent") +
      detailCard("Type", "Fournisseur") +
      detailCard("Telephone", item.phone ?? "-") +
      detailCard(
        "Statut",
        item.active ? "Actif" : "Inactif",
        item.active ? "success" : "gray",
      );
    fields =
      detailField("Raison sociale", item.name) +
      detailField("ID fiscal / NCC", item.fiscalId ?? "-") +
      detailField("Categorie", item.category ?? "-") +
      detailField("Email", item.email ?? "-") +
      detailField("Contact", item.contact ?? "-") +
      detailField("Telephone", item.phone ?? "-") +
      detailField("Adresse", item.address ?? "-") +
      lifecycleFields(item);
    editFields =
      textInput("name", "Raison sociale", item.name) +
      textInput("fiscalId", "ID fiscal / NCC", item.fiscalId ?? "") +
      textInput("category", "Categorie", item.category ?? "") +
      textInput("contact", "Contact", item.contact ?? "") +
      textInput("phone", "Telephone", item.phone ?? "") +
      textInput("email", "Email", item.email ?? "") +
      textInput("address", "Adresse", item.address ?? "") +
      activeSelect(item.active);
  } else if (type === "client") {
    const item = latestClients.find((client) => client.id === id);
    if (!item) return false;
    title = `${item.code} - ${item.name}`;
    subtitle = "Client utilise dans les demandes et les projets.";
    kind = "Fiche client";
    cards =
      detailCard("Code", item.code, "accent") +
      detailCard("Type", "Client") +
      detailCard("Telephone", item.phone ?? "-") +
      detailCard(
        "Statut",
        item.active ? "Actif" : "Inactif",
        item.active ? "success" : "gray",
      );
    fields =
      detailField("Raison sociale", item.name) +
      detailField("Email", item.email ?? "-") +
      detailField("Contact", item.contact ?? "-") +
      detailField("Telephone", item.phone ?? "-") +
      lifecycleFields(item);
    editFields =
      textInput("name", "Raison sociale", item.name) +
      textInput("contact", "Contact", item.contact ?? "") +
      textInput("phone", "Telephone", item.phone ?? "") +
      textInput("email", "Email", item.email ?? "") +
      activeSelect(item.active);
  } else if (type === "teamService") {
    const item = latestTeamServices.find((service) => service.id === id);
    if (!item) return false;
    title = `${item.code} - ${item.name}`;
    subtitle = "Equipe, service ou departement demandeur.";
    kind = "Fiche equipe / service";
    cards =
      detailCard("Code", item.code, "accent") +
      detailCard("Type", item.type) +
      detailCard("Responsable", item.manager ?? "-") +
      detailCard(
        "Statut",
        item.active ? "Actif" : "Inactif",
        item.active ? "success" : "gray",
      );
    fields =
      detailField("Nom", item.name) +
      detailField("Type", item.type) +
      detailField("Responsable", item.manager ?? "-") +
      detailField("Usage", "Demandes de materiel") +
      lifecycleFields(item);
    editFields =
      textInput("name", "Nom equipe / service", item.name) +
      selectInput(
        "type",
        "Type",
        option("EQUIPE", "Equipe terrain") +
          option("SERVICE", "Service interne") +
          option("DEPARTEMENT", "Departement"),
        item.type,
      ) +
      textInput("manager", "Responsable", item.manager ?? "") +
      activeSelect(item.active);
  } else if (type === "employee") {
    const item = latestEmployees.find((employee) => employee.id === id);
    if (!item) return false;
    title = `${item.matricule} - ${item.firstName} ${item.lastName}`;
    subtitle =
      "Employe ou beneficiaire trace dans les sorties et affectations. Ce n'est pas forcement un compte utilisateur.";
    kind = "Fiche employe";
    cards =
      detailCard("Matricule", item.matricule, "accent") +
      detailCard("Departement", item.department ?? "-") +
      detailCard("Role", item.role ?? "-") +
      detailCard(
        "Statut",
        item.active ? "Actif" : "Inactif",
        item.active ? "success" : "gray",
      );
    fields =
      detailField("Nom", item.lastName) +
      detailField("Prenom", item.firstName) +
      detailField("Telephone", item.phone ?? "-") +
      detailField("Departement", item.department ?? "-") +
      detailField("Role", item.role ?? "-") +
      lifecycleFields(item);
    editFields =
      textInput("matricule", "Matricule", item.matricule) +
      textInput("lastName", "Nom", item.lastName) +
      textInput("firstName", "Prenom", item.firstName) +
      textInput("department", "Departement", item.department ?? "") +
      textInput("role", "Role", item.role ?? "") +
      textInput("phone", "Telephone", item.phone ?? "") +
      activeSelect(item.active);
  } else if (type === "project") {
    const item = latestProjects.find((project) => project.id === id);
    if (!item) return false;
    const activeProjectManagers = latestUsers.filter(
      (user) => user.active && user.roles.includes("CHEF_PROJET"),
    );
    title = `${item.code} - ${item.name}`;
    subtitle =
      "Projet ou chantier utilise comme destination des sorties stock.";
    kind = "Fiche projet";
    cards =
      detailCard("Type", "Projet") +
      detailCard("Client", projectClientName(item)) +
      detailCard("Chef projet", projectManagerName(item.projectManagerId)) +
      detailCard(
        "Statut",
        item.active ? "Actif" : "Inactif",
        item.active ? "success" : "gray",
      );
    fields =
      detailField("Code", item.code) +
      detailField("Nom", item.name) +
      detailField("Client", projectClientName(item)) +
      detailField("Chef projet", projectManagerName(item.projectManagerId)) +
      detailField("Region", item.region ?? "-") +
      detailField("Ville", item.city ?? "-") +
      detailField("Date debut", formatDate(item.startDate)) +
      detailField("Date fin prevue", formatDate(item.endDate)) +
      lifecycleFields(item);
    editFields =
      textInput("name", "Nom projet", item.name) +
      selectInput(
        "clientId",
        "Client",
        clientOptions(latestClients),
        item.clientId ?? "",
      ) +
      selectInput(
        "projectManagerId",
        "Chef de projet",
        userOptions(activeProjectManagers),
        item.projectManagerId ?? "",
      ) +
      textInput("region", "Region", item.region ?? "") +
      textInput("city", "Ville", item.city ?? "") +
      dateInput("startDate", "Date debut", item.startDate) +
      dateInput("endDate", "Date fin prevue", item.endDate) +
      activeSelect(item.active);
  } else {
    const item = latestLocations.find((location) => location.id === id);
    if (!item) return false;
    const project = latestProjects.find(
      (project) => project.id === item.projectId,
    );
    title = `${item.code} - ${item.name}`;
    subtitle =
      type === "site"
        ? "Site ou chantier rattache a un projet."
        : "Emplacement de stock.";
    kind = type === "site" ? "Fiche site / chantier" : "Fiche emplacement";
    cards =
      detailCard("Type", item.type) +
      detailCard("Projet", project?.name ?? "-") +
      detailCard("Ville", item.city ?? project?.city ?? "-") +
      detailCard(
        "Statut",
        item.active ? "Actif" : "Inactif",
        item.active ? "success" : "gray",
      );
    fields =
      detailField("Nom", item.name) +
      detailField("Code", item.code) +
      detailField("Type", item.type) +
      detailField(
        "Projet rattache",
        project ? `${project.code} - ${project.name}` : "-",
      ) +
      detailField("Responsable", item.responsible ?? "-") +
      detailField("Region", item.region ?? project?.region ?? "-") +
      detailField("Ville", item.city ?? project?.city ?? "-") +
      detailField("Adresse / zone", item.address ?? "-") +
      lifecycleFields(item);
    const typeOptions =
      type === "site"
        ? option("CHANTIER", "Chantier") + option("SITE", "Site")
        : option("MAGASIN", "Magasin") +
          option("DEPOT", "Depot") +
          option("BUREAU", "Bureau") +
          option("VEHICULE", "Vehicule");
    editFields =
      textInput(
        "name",
        type === "site" ? "Nom site / chantier" : "Nom emplacement",
        item.name,
      ) +
      selectInput("type", "Type", typeOptions, item.type) +
      selectInput(
        "projectId",
        "Projet rattache",
        projectOptions(latestProjects),
        item.projectId ?? "",
      ) +
      textInput("responsible", "Responsable", item.responsible ?? "") +
      textInput("region", "Region", item.region ?? "") +
      textInput("city", "Ville", item.city ?? "") +
      textInput("address", "Adresse / zone", item.address ?? "") +
      activeSelect(item.active);
  }

  const kindElement = root.querySelector<HTMLElement>("#refDetailKind");
  const titleElement = root.querySelector<HTMLElement>("#refDetailTitle");
  const subtitleElement = root.querySelector<HTMLElement>("#refDetailSubtitle");
  const cardsElement = root.querySelector<HTMLElement>("#refDetailCards");
  const fieldsElement = root.querySelector<HTMLElement>("#refDetailFields");
  const actionsElement = root.querySelector<HTMLElement>("#refDetailActions");
  const contentTitle = root.querySelector<HTMLElement>(
    "#refDetailContentTitle",
  );
  const modal = root.querySelector<HTMLElement>("#referentialDetailModal");
  if (modal) {
    modal.dataset.refType = type;
    modal.dataset.refId = id;
    modal.dataset.editing = editing ? "1" : "0";
  }
  if (kindElement) kindElement.textContent = kind;
  if (titleElement) titleElement.textContent = title;
  if (subtitleElement) subtitleElement.textContent = subtitle;
  if (cardsElement) cardsElement.innerHTML = cards;
  if (actionsElement)
    actionsElement.innerHTML =
      referentialActionButtons(editing) +
      `<button title="Fermer" class="inline-flex items-center justify-center w-10 h-10 rounded-lg border text-gray-500 hover:text-gray-900 shrink-0" data-action="closeModal('referentialDetailModal')"><i data-lucide="x" class="w-5 h-5"></i></button>`;
  if (contentTitle)
    contentTitle.textContent = editing
      ? "Modifier les informations"
      : "Informations";
  if (fieldsElement)
    fieldsElement.innerHTML = editing
      ? `<form id="refDetailEditForm" class="contents">${editFields}</form>`
      : fields;
  window.lucide?.createIcons();
  return true;
}

function openReferentialDetail(root: HTMLElement, type: string, id: string) {
  if (renderReferentialDetail(root, type, id, false))
    openModal(root, "referentialDetailModal");
}

function editReferentialDetail(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#referentialDetailModal");
  const type = modal?.dataset.refType ?? "";
  const id = modal?.dataset.refId ?? "";
  if (type && id) renderReferentialDetail(root, type, id, true);
}

function cancelReferentialEdit(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#referentialDetailModal");
  const type = modal?.dataset.refType ?? "";
  const id = modal?.dataset.refId ?? "";
  if (type && id) renderReferentialDetail(root, type, id, false);
}

async function submitReferentialEdit(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#referentialDetailModal");
  const type = modal?.dataset.refType ?? "";
  const id = modal?.dataset.refId ?? "";
  const form = root.querySelector<HTMLFormElement>("#refDetailEditForm");
  if (!type || !id || !form) return;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    if (type === "article") {
      const stockLocationId = data.defaultLocationId
        ? String(data.defaultLocationId)
        : null;
      const updated = await updateArticle(id, {
        designation: String(data.designation ?? ""),
        category: String(data.category ?? ""),
        unit: String(data.unit ?? ""),
        trackingMode:
          data.trackingMode === "INDIVIDUAL" ? "INDIVIDUAL" : "QUANTITY",
        minimumStock: toNumber(String(data.minimumStock ?? "0")),
        securityStock: toNumber(String(data.securityStock ?? "0")),
        referencePrice: toNumber(String(data.referencePrice ?? "0")),
        defaultSupplierId: data.defaultSupplierId
          ? String(data.defaultSupplierId)
          : null,
        defaultLocationId: stockLocationId,
        stockLocationId,
        stockQuantity: toNumber(String(data.stockQuantity ?? "0")),
        active: data.active !== "false",
      });
      latestArticles = latestArticles.map((item) =>
        item.id === id ? updated : item,
      );
      latestStockLevels = await getStockLevels().catch(() => latestStockLevels);
    } else if (type === "supplier") {
      const updated = await updateSupplier(id, {
        name: String(data.name ?? ""),
        fiscalId: String(data.fiscalId ?? ""),
        category: String(data.category ?? ""),
        contact: String(data.contact ?? ""),
        phone: String(data.phone ?? ""),
        email: String(data.email ?? ""),
        address: String(data.address ?? ""),
        active: data.active !== "false",
      });
      latestSuppliers = latestSuppliers.map((item) =>
        item.id === id ? updated : item,
      );
    } else if (type === "client") {
      const updated = await updateClient(id, {
        name: String(data.name ?? ""),
        contact: String(data.contact ?? ""),
        phone: String(data.phone ?? ""),
        email: String(data.email ?? ""),
        active: data.active !== "false",
      });
      latestClients = latestClients.map((item) =>
        item.id === id ? updated : item,
      );
    } else if (type === "teamService") {
      const updated = await updateTeamService(id, {
        name: String(data.name ?? ""),
        type: String(data.type ?? "SERVICE"),
        manager: String(data.manager ?? ""),
        active: data.active !== "false",
      });
      latestTeamServices = latestTeamServices.map((item) =>
        item.id === id ? updated : item,
      );
    } else if (type === "employee") {
      const updated = await updateEmployee(id, {
        matricule: String(data.matricule ?? ""),
        lastName: String(data.lastName ?? ""),
        firstName: String(data.firstName ?? ""),
        department: String(data.department ?? ""),
        role: String(data.role ?? ""),
        phone: String(data.phone ?? ""),
        active: data.active !== "false",
      });
      latestEmployees = latestEmployees.map((item) =>
        item.id === id ? updated : item,
      );
    } else if (type === "project") {
      if (!data.projectManagerId) {
        showToast(
          root,
          "Le chef de projet doit etre un compte utilisateur actif avec le role Chef projet.",
          "error",
        );
        return;
      }
      const updated = await updateProject(id, {
        name: String(data.name ?? ""),
        clientId: String(data.clientId ?? ""),
        projectManagerId: String(data.projectManagerId ?? ""),
        region: String(data.region ?? ""),
        city: String(data.city ?? ""),
        startDate: String(data.startDate ?? ""),
        endDate: String(data.endDate ?? ""),
        active: data.active !== "false",
      });
      latestProjects = latestProjects.map((item) =>
        item.id === id ? updated : item,
      );
    } else if (type === "site" || type === "location") {
      const updated = await updateLocation(id, {
        name: String(data.name ?? ""),
        type: String(data.type ?? "MAGASIN"),
        projectId: data.projectId ? String(data.projectId) : null,
        responsible: String(data.responsible ?? ""),
        region: String(data.region ?? ""),
        city: String(data.city ?? ""),
        address: String(data.address ?? ""),
        active: data.active !== "false",
      });
      latestLocations = latestLocations.map((item) =>
        item.id === id ? updated : item,
      );
    }
    updateApiBackedViews(root);
    renderReferentialDetail(root, type, id, false);
    showToast(root, "Fiche referentiel mise a jour.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Modification impossible.",
      "error",
    );
  }
}

async function deactivateReferentialDetail(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#referentialDetailModal");
  const type = modal?.dataset.refType ?? "";
  const id = modal?.dataset.refId ?? "";
  const form = root.querySelector<HTMLFormElement>("#refDetailEditForm");
  if (!type || !id) return;
  if (form) cancelReferentialEdit(root);
  try {
    if (type === "article")
      latestArticles = latestArticles.map((item) =>
        item.id === id ? { ...item, active: false } : item,
      );
    if (type === "supplier")
      latestSuppliers = latestSuppliers.map((item) =>
        item.id === id ? { ...item, active: false } : item,
      );
    if (type === "client")
      latestClients = latestClients.map((item) =>
        item.id === id ? { ...item, active: false } : item,
      );
    if (type === "teamService")
      latestTeamServices = latestTeamServices.map((item) =>
        item.id === id ? { ...item, active: false } : item,
      );
    if (type === "employee")
      latestEmployees = latestEmployees.map((item) =>
        item.id === id ? { ...item, active: false } : item,
      );
    if (type === "project")
      latestProjects = latestProjects.map((item) =>
        item.id === id ? { ...item, active: false } : item,
      );
    if (type === "site" || type === "location")
      latestLocations = latestLocations.map((item) =>
        item.id === id ? { ...item, active: false } : item,
      );
    const body = { active: false };
    if (type === "article") await updateArticle(id, body);
    else if (type === "supplier") await updateSupplier(id, body);
    else if (type === "client") await updateClient(id, body);
    else if (type === "teamService") await updateTeamService(id, body);
    else if (type === "employee") await updateEmployee(id, body);
    else if (type === "project") await updateProject(id, body);
    else await updateLocation(id, body);
    updateApiBackedViews(root);
    renderReferentialDetail(root, type, id, false);
    showToast(root, "Element desactive.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Desactivation impossible.",
      "error",
    );
  }
}

function updateReferentialForm(root: HTMLElement, type: string) {
  root
    .querySelectorAll<HTMLElement>(".referential-form")
    .forEach((form) => form.classList.add("hidden"));
  root
    .querySelector<HTMLElement>("#ref-form-empty")
    ?.classList.toggle("hidden", Boolean(type));
  root
    .querySelector<HTMLElement>("#ref-form-" + CSS.escape(type))
    ?.classList.remove("hidden");
  const code = root.querySelector<HTMLElement>("#referentialCode");
  const articleFamily = root.querySelector<HTMLSelectElement>(
    "#ref-form-article select",
  );
  if (articleFamily) {
    articleFamily.onchange = () => {
      const codeTarget = root.querySelector<HTMLElement>("#referentialCode");
      if (codeTarget)
        codeTarget.textContent = nextCodeFromRows(
          root,
          "article",
          articleFamily.value,
        );
    };
  }
  if (code) code.textContent = nextCodeFromRows(root, type);
  if (type === "article") {
    const supplierSelect = root.querySelector<HTMLSelectElement>(
      "#articleSupplierSelect",
    );
    const locationSelect = root.querySelector<HTMLSelectElement>(
      "#articleInitialLocationSelect",
    );
    fillSelect(
      supplierSelect ?? undefined,
      supplierOptions(latestSuppliers),
      latestSuppliers.length
        ? "Selectionner fournisseur"
        : "Aucun fournisseur en base",
    );
    fillSelect(
      locationSelect ?? undefined,
      locationOptions(latestLocations),
      latestLocations.length
        ? "Selectionner emplacement"
        : "Aucun emplacement en base",
    );
  }
  if (type === "project") {
    const clientSelect = root.querySelector<HTMLSelectElement>(
      "#projectClientSelect",
    );
    const managerSelect = root.querySelector<HTMLSelectElement>(
      "#projectManagerSelect",
    );
    const activeProjectManagers = latestUsers.filter(
      (user) => user.active && user.roles.includes("CHEF_PROJET"),
    );
    fillSelect(
      clientSelect ?? undefined,
      clientOptions(latestClients),
      latestClients.length ? "Selectionner client" : "Aucun client en base",
    );
    fillSelect(
      managerSelect ?? undefined,
      userOptions(activeProjectManagers),
      activeProjectManagers.length
        ? "Selectionner chef projet"
        : "Aucun chef projet actif",
    );
  }
  if (type === "site") {
    const siteProject = root.querySelector<HTMLSelectElement>(
      "#ref-form-site select",
    );
    fillSelect(
      siteProject ?? undefined,
      projectOptions(latestProjects),
      "Selectionner projet",
    );
  }
  if (type === "location") {
    const locationSelects = Array.from(
      root.querySelectorAll<HTMLSelectElement>("#ref-form-location select"),
    );
    fillSelect(
      locationSelects[1],
      projectOptions(latestProjects),
      "Selectionner projet rattache",
    );
  }
}
function modalInputValues(root: HTMLElement, type: string) {
  const form = root.querySelector<HTMLElement>("#ref-form-" + CSS.escape(type));
  return {
    inputs: Array.from(form?.querySelectorAll<HTMLInputElement>("input") ?? []),
    selects: Array.from(
      form?.querySelectorAll<HTMLSelectElement>("select") ?? [],
    ),
  };
}

function toNumber(value: string) {
  const parsed = Number(value.replace(/\s/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
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
  const type =
    root.querySelector<HTMLSelectElement>("#referentialType")?.value ?? "";
  const code =
    root.querySelector<HTMLElement>("#referentialCode")?.textContent?.trim() ||
    "REF-0001";
  const { inputs, selects } = modalInputValues(root, type);
  try {
    if (type === "article") {
      const form = root.querySelector<HTMLElement>("#ref-form-article");
      const field = <T extends HTMLInputElement | HTMLSelectElement>(
        selector: string,
      ) => form?.querySelector<T>(selector);
      const category = normalizedArticleFamily(
        field<HTMLSelectElement>("#articleFamilySelect")?.value,
      );
      const articleCode = code.startsWith(category + "-")
        ? code
        : nextCodeFromRows(root, "article", category);
      const initialLocationId =
        field<HTMLSelectElement>("#articleInitialLocationSelect")?.value ||
        undefined;
      const initialStock = toNumber(
        field<HTMLInputElement>("#articleInitialStockInput")?.value ?? "0",
      );
      await createArticle({
        code: articleCode,
        designation:
          field<HTMLInputElement>("#articleDesignationInput")?.value.trim() ||
          "Nouvel article",
        category,
        unit: field<HTMLSelectElement>("#articleUnitSelect")?.value || "Piece",
        trackingMode:
          field<HTMLSelectElement>("#articleTrackingSelect")?.value ===
          "INDIVIDUAL"
            ? "INDIVIDUAL"
            : "QUANTITY",
        minimumStock: toNumber(
          field<HTMLInputElement>("#articleMinimumStockInput")?.value ?? "0",
        ),
        securityStock: toNumber(
          field<HTMLInputElement>("#articleSecurityStockInput")?.value ?? "0",
        ),
        referencePrice: toNumber(
          field<HTMLInputElement>("#articleReferencePriceInput")?.value ?? "0",
        ),
        defaultSupplierId:
          field<HTMLSelectElement>("#articleSupplierSelect")?.value ||
          undefined,
        defaultLocationId: initialLocationId,
        initialStock,
        initialLocationId,
      });
    } else if (type === "supplier") {
      await createSupplier({
        code,
        name: inputs[0]?.value.trim() || "Nouveau fournisseur",
        fiscalId: inputs[1]?.value.trim() || undefined,
        category: selects[0]?.value || undefined,
        contact: inputs[2]?.value.trim() || undefined,
        phone: inputs[3]?.value.trim() || undefined,
        email: inputs[4]?.value.trim() || undefined,
        address: inputs[5]?.value.trim() || undefined,
      });
    } else if (type === "client") {
      await createClient({
        code,
        name: inputs[0]?.value.trim() || "Nouveau client",
        contact: inputs[1]?.value.trim() || undefined,
        phone: inputs[2]?.value.trim() || undefined,
        email: inputs[3]?.value.trim() || undefined,
      });
    } else if (type === "teamService") {
      await createTeamService({
        code,
        name: inputs[0]?.value.trim() || "Nouvelle equipe",
        type: selects[0]?.value || "SERVICE",
        manager: inputs[1]?.value.trim() || undefined,
      });
    } else if (type === "project") {
      const clientId = selects[0]?.value || undefined;
      const managerId = selects[1]?.value || undefined;
      await createProject({
        code,
        name: inputs[0]?.value.trim() || "Nouveau projet",
        client: selectedText(selects[0]),
        clientId,
        projectManagerId: managerId,
        region: inputs[1]?.value.trim() || undefined,
        city: inputs[2]?.value.trim() || undefined,
        startDate: inputs[3]?.value || undefined,
        endDate: inputs[4]?.value || undefined,
      });
    } else if (type === "site") {
      await createLocation({
        code,
        name: inputs[0]?.value.trim() || "Nouveau site",
        type: "CHANTIER",
        projectId: selects[0]?.value || undefined,
        responsible: inputs[1]?.value.trim() || undefined,
        region: inputs[2]?.value.trim() || undefined,
        city: inputs[3]?.value.trim() || undefined,
        address: inputs[4]?.value.trim() || undefined,
      });
    } else if (type === "location") {
      await createLocation({
        code,
        name: inputs[0]?.value.trim() || "Nouvel emplacement",
        type: selects[0]?.value.toUpperCase() || "MAGASIN",
        responsible: inputs[1]?.value.trim() || undefined,
        projectId: selects[1]?.value || undefined,
        city: inputs[2]?.value.trim() || undefined,
        address: inputs[3]?.value.trim() || undefined,
      });
    } else if (type === "employee") {
      await createEmployee({
        matricule: inputs[0]?.value.trim() || code,
        lastName: inputs[1]?.value.trim() || "Nom",
        firstName: inputs[2]?.value.trim() || "Prenom",
        department: inputs[3]?.value.trim() || undefined,
        role: inputs[4]?.value.trim() || undefined,
        phone: inputs[5]?.value.trim() || undefined,
      });
    } else {
      showToast(
        root,
        "Selectionne un type de referentiel avant de creer.",
        "error",
      );
      return;
    }
    closeModal(root, "referentialModal");
    updateApiBackedViews(root);
    showToast(root, "Element referentiel cree et registre mis a jour.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Creation impossible.",
      "error",
    );
  }
}

async function submitUser(root: HTMLElement) {
  const identifier =
    root
      .querySelector<HTMLInputElement>("#userIdentifier")
      ?.value.trim()
      .toLowerCase() ?? "";
  const email =
    root
      .querySelector<HTMLInputElement>("#userEmail")
      ?.value.trim()
      .toLowerCase() ?? "";
  const firstName =
    root.querySelector<HTMLInputElement>("#userFirstName")?.value.trim() ?? "";
  const lastName =
    root.querySelector<HTMLInputElement>("#userLastName")?.value.trim() ?? "";
  const password =
    root.querySelector<HTMLInputElement>("#userPassword")?.value ?? "";
  const active =
    root.querySelector<HTMLSelectElement>("#userActive")?.value !== "false";
  const roles = Array.from(
    root.querySelectorAll<HTMLInputElement>('input[name="userRole"]:checked'),
  ).map((input) => input.value);
  if (!identifier || !firstName || !lastName) {
    showToast(root, "Identifiant, prenom et nom sont requis.", "error");
    return;
  }
  if (roles.length === 0) {
    showToast(root, "Selectionne au moins un role.", "error");
    return;
  }
  try {
    if (selectedUserId) {
      await updateUser(selectedUserId, {
        identifier,
        email: email || null,
        firstName,
        lastName,
        roles,
        password: password || undefined,
        active,
      });
      showToast(root, "Utilisateur mis a jour.");
    } else {
      await createUser({
        identifier,
        email: email || null,
        firstName,
        lastName,
        roles,
        password: password || undefined,
        active,
      });
      showToast(root, "Utilisateur cree et registre mis a jour.");
    }
    closeModal(root, "userModal");
    selectedUserId = null;
    updateApiBackedViews(root);
  } catch (error) {
    showToast(
      root,
      error instanceof Error
        ? error.message
        : "Enregistrement utilisateur impossible.",
      "error",
    );
  }
}

function toggleUserPassword(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("#userPassword");
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
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
        referentialImportType === "article"
          ? downloadArticleImportTemplate(root)
          : downloadReferentialTemplate(root);
      if (parsed.type === "import-articles")
        void (referentialImportType === "article"
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
        currentAuditAlertFilter = parsed.filter;
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
          : openInventoryScope
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
      if (referentialImportType === "article")
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
        referentialImportType = (event.target as HTMLSelectElement)
          .value as ReferentialImportType;
        referentialImportRows = [];
        articleImportRows = [];
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
        const rowIndex = Number(importField.dataset.inventoryImportRow);
        const row = inventoryImportRows[rowIndex];
        if (row) {
          const field = importField.dataset
            .inventoryImportField as keyof InventoryImportRow;
          if (field !== "errors") {
            (row as unknown as Record<string, string>)[field] =
              importField.value;
            renderInventoryImport(root);
          }
        }
        return;
      }
      if (importField.dataset.importRow && importField.dataset.importField) {
        const rowIndex = Number(importField.dataset.importRow);
        if (referentialImportType === "article") {
          const row = articleImportRows[rowIndex];
          if (row) {
            (row as unknown as Record<string, string>)[
              importField.dataset.importField
            ] = importField.value;
            renderArticleImport(root);
          }
        } else {
          const row = referentialImportRows[rowIndex];
          if (row) {
            row[importField.dataset.importField] = importField.value;
            renderReferentialImport(root);
          }
        }
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
