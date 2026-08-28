import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import * as XLSX from "xlsx";
import { StockHubShell } from "./components/StockHubShell";
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
  getExitRequestProof,
  loginUser,
  prepareExitRequest,
  rejectExitRequest,
  resolveStockEntryDispute,
  uploadExitRequestProof,
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

declare global {
  interface Window {
    lucide?: { createIcons: () => void };
  }
}

let latestMovements: StockMovement[] = [];
let currentExitFilter = "ALL";
let currentEntryFilter = "ALL";
let currentVehicleFilter = "ALL";
let currentAuditAlertFilter = "ALL";
let latestAuditAlerts: AuditAlert[] = [];
let latestStockLevels: StockLevel[] = [];
let latestAuditLogs: AuditLog[] = [];
let latestEquipments: Equipment[] = [];
let latestVehicles: Vehicle[] = [];
let selectedEquipmentId: string | null = null;
let selectedVehicleId: string | null = null;
let latestClients: Client[] = [];
let latestEmployees: Employee[] = [];
let latestTeamServices: TeamService[] = [];
let latestArticles: Article[] = [];
let latestSuppliers: Supplier[] = [];
let latestProjects: StockProject[] = [];
let latestLocations: StockLocation[] = [];
let latestUsers: StockUser[] = [];
let selectedUserId: string | null = null;
let selectedExitRequestId: string | null = null;
let selectedRejectedExitRequestId: string | null = null;
let selectedEntryId: string | null = null;
let selectedReturnTransferId: string | null = null;
let currentUser: StockUser | null = readStoredUser();

type ReferentialImportType =
  | "article"
  | "supplier"
  | "client"
  | "project"
  | "site"
  | "employee"
  | "location"
  | "teamService";
type ReferentialImportRow = Record<string, any> & { errors: string[] };
type ArticleImportRow = ReferentialImportRow;
let referentialImportType: ReferentialImportType = "article";
let referentialImportRows: ReferentialImportRow[] = [];
let articleImportRows: ArticleImportRow[] = [];
const referentialImportFields: Record<
  ReferentialImportType,
  Array<[string, string]>
> = {
  article: [
    ["code", "Code"],
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
    ["code", "Code"],
    ["name", "Raison sociale"],
    ["fiscalId", "ID fiscal / NCC"],
    ["category", "Categorie"],
    ["contact", "Contact"],
    ["phone", "Telephone"],
    ["email", "Email"],
    ["address", "Adresse"],
  ],
  client: [
    ["code", "Code"],
    ["name", "Raison sociale"],
    ["contact", "Contact"],
    ["phone", "Telephone"],
    ["email", "Email"],
  ],
  project: [
    ["code", "Code"],
    ["name", "Nom projet"],
    ["client", "Client"],
    ["projectManager", "Chef de projet"],
    ["region", "Region"],
    ["city", "Ville"],
    ["startDate", "Date debut"],
    ["endDate", "Date fin prevue"],
  ],
  site: [
    ["code", "Code"],
    ["name", "Nom du site"],
    ["project", "Projet rattache"],
    ["responsible", "Responsable site"],
    ["region", "Region"],
    ["city", "Ville"],
    ["address", "Adresse / repere"],
  ],
  employee: [
    ["code", "Matricule"],
    ["lastName", "Nom"],
    ["firstName", "Prenom"],
    ["department", "Departement"],
    ["role", "Role"],
    ["phone", "Telephone"],
  ],
  location: [
    ["code", "Code"],
    ["name", "Nom emplacement"],
    ["type", "Type"],
    ["responsible", "Responsable"],
    ["project", "Projet rattache"],
    ["city", "Ville"],
    ["address", "Adresse / zone"],
  ],
  teamService: [
    ["code", "Code"],
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

function rolePriority(roles: string[]) {
  const order = [
    "ADMIN_STOCK",
    "DIRECTION",
    "GESTIONNAIRE_STOCK",
    "AUDIT",
    "CHEF_PROJET",
    "RH",
  ];
  return order.find((role) => roles.includes(role)) ?? roles[0] ?? "";
}

function hasRole(role: string) {
  return Boolean(currentUser?.roles.includes(role));
}

function canPrepareMaterialRequests() {
  return hasRole("ADMIN_STOCK") || hasRole("GESTIONNAIRE_STOCK");
}

function stockAvailableFor(articleId: string, locationId?: string | null) {
  return latestStockLevels
    .filter(
      (level) =>
        level.article.id === articleId &&
        (!locationId || level.location.id === locationId),
    )
    .reduce((sum, level) => sum + Number(level.quantity ?? 0), 0);
}

function canAccessView(view: string) {
  if (!currentUser) return false;
  if (hasRole("ADMIN_STOCK")) return true;
  if (view === "home") return true;
  const roles = currentUser.roles;
  const allowedByRole: Record<string, string[]> = {
    GESTIONNAIRE_STOCK: [
      "referentiels",
      "stock",
      "equipements",
      "parcAuto",
      "entrees",
      "sortie",
      "retours",
      "reappro",
      "inventaire",
    ],
    AUDIT: ["inventaire", "audit", "historique", "stock"],
    RH: ["stock", "equipements", "parcAuto"],
    DIRECTION: ["home", "stock", "audit", "historique"],
    CHEF_PROJET: ["stock", "sortie", "equipements"],
  };
  return roles.some((role) => allowedByRole[role]?.includes(view));
}

const LOGIN_ROUTE = "/login";
const DEFAULT_ROUTE = "/dashboard";
const VIEW_ROUTES: Record<string, string> = {
  home: DEFAULT_ROUTE,
  referentiels: "/referentiels",
  stock: "/stock",
  equipements: "/equipements",
  parcAuto: "/parc-auto",
  entrees: "/entrees-stock",
  sortie: "/sorties-stock",
  retours: "/retours-transferts",
  reappro: "/reapprovisionnement",
  inventaire: "/inventaire",
  audit: "/audit-alertes",
  historique: "/historique-exports",
  users: "/utilisateurs-roles",
};
const ROUTE_VIEWS: Record<string, string> = {
  [DEFAULT_ROUTE]: "home",
  "/referentiels": "referentiels",
  "/stock": "stock",
  "/equipements": "equipements",
  "/parc-auto": "parcAuto",
  "/entrees-stock": "entrees",
  "/sorties-stock": "sortie",
  "/retours-transferts": "retours",
  "/reapprovisionnement": "reappro",
  "/inventaire": "inventaire",
  "/audit-alertes": "audit",
  "/historique-exports": "historique",
  "/utilisateurs-roles": "users",
};
let pendingRouteAfterLogin = DEFAULT_ROUTE;

function normalizeRoute(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, "");
  return path || DEFAULT_ROUTE;
}

function routeForView(view: string) {
  return VIEW_ROUTES[view] ?? DEFAULT_ROUTE;
}

function viewForRoute(pathname = window.location.pathname) {
  return ROUTE_VIEWS[normalizeRoute(pathname)];
}

function navButtonForView(root: HTMLElement, view: string) {
  return root.querySelector<HTMLElement>(
    `.nav-btn[data-view="${CSS.escape(view)}"]`,
  );
}

function writeRoute(view: string, replace = false) {
  const route = routeForView(view);
  if (normalizeRoute() === route) return;
  const state = { stockHubView: view };
  if (replace) {
    window.history.replaceState(state, "", route);
  } else {
    window.history.pushState(state, "", route);
  }
}

function writeLoginRoute(replace = true) {
  if (normalizeRoute() === LOGIN_ROUTE) return;
  const state = { stockHubView: "login" };
  if (replace) {
    window.history.replaceState(state, "", LOGIN_ROUTE);
  } else {
    window.history.pushState(state, "", LOGIN_ROUTE);
  }
}

function applyRoleAccess(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(".nav-btn[data-view]")
    .forEach((button) => {
      const view = button.dataset.view ?? "";
      button.classList.toggle("hidden", !canAccessView(view));
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
function setVisible(element: Element | null, visible: boolean) {
  if (!element) return;
  element.classList.toggle("active", visible);
  element.classList.toggle("show", visible);
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "0";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat("fr-FR").format(parsed);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
function setText(root: HTMLElement, selector: string, value: number | string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = formatNumber(value);
}

function isToday(date: string | Date) {
  const value = new Date(date);
  const today = new Date();
  return (
    value.getFullYear() === today.getFullYear() &&
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate()
  );
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
let stockSortKey = "";
let stockSortDir: "asc" | "desc" = "asc";
let stockStatusFilter = "";
let openStockLevelId: string | null = null;

function stockStatusCategory(
  level: StockLevel,
): "rupture" | "sous-seuil" | "disponible" {
  if (level.quantity <= 0) return "rupture";
  if (level.quantity <= level.article.minimumStock) return "sous-seuil";
  return "disponible";
}

function stockStatus(level: StockLevel) {
  const cat = stockStatusCategory(level);
  if (cat === "rupture") return badge("Rupture", "error");
  if (cat === "sous-seuil") return badge("Sous seuil", "warning");
  return badge("Disponible", "success");
}

function stockInitialForLevel(level: StockLevel) {
  const explicitInitial = Number(level.article.initialStock);
  if (Number.isFinite(explicitInitial) && explicitInitial >= 0) {
    return explicitInitial;
  }

  const relevant = latestMovements
    .filter(
      (movement) =>
        movement.status !== "CANCELLED" &&
        movement.status !== "DRAFT" &&
        movement.lines.some((line) => line.articleId === level.article.id) &&
        (movement.fromLocationId === level.location.id ||
          movement.toLocationId === level.location.id),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const initialMovement = relevant.find(
    (movement) => movement.type === "INITIAL",
  );
  if (initialMovement) {
    return initialMovement.lines
      .filter((line) => line.articleId === level.article.id)
      .reduce(
        (sum, line) =>
          sum + Number(line.completedQuantity ?? line.expectedQuantity ?? 0),
        0,
      );
  }

  // Compatibilite avec les anciens articles : le premier inventaire conserve
  // le stock theorique d'avant comptage dans expectedQuantity.
  const firstInventory = relevant.find(
    (movement) => movement.type === "ADJUSTMENT",
  );
  const theoretical = firstInventory?.lines.find(
    (line) => line.articleId === level.article.id,
  )?.expectedQuantity;
  if (theoretical !== null && theoretical !== undefined) {
    return Number(theoretical);
  }

  return initialQuantityForLevel(level, latestMovements);
}

function stockMovementMetrics(level: StockLevel) {
  let entries = 0;
  let exits = 0;
  for (const movement of latestMovements) {
    if (movement.status === "CANCELLED" || movement.status === "DRAFT")
      continue;
    for (const line of movement.lines) {
      if (line.articleId !== level.article.id) continue;
      const quantity = Number(
        line.completedQuantity ??
          line.expectedQuantity ??
          line.requestedQuantity ??
          0,
      );
      if (quantity <= 0) continue;
      if (
        (movement.type === "ENTRY" || movement.type === "RETURN") &&
        movement.toLocationId === level.location.id
      )
        entries += quantity;
      if (
        movement.type === "EXIT" &&
        movement.fromLocationId === level.location.id
      )
        exits += quantity;
      if (movement.type === "TRANSFER") {
        if (movement.toLocationId === level.location.id) entries += quantity;
        if (movement.fromLocationId === level.location.id) exits += quantity;
      }
    }
  }
  return {
    entries,
    exits,
    // Le stock de depart est immuable : l'inventaire ne le remplace jamais.
    initial: stockInitialForLevel(level),
  };
}

function stockLastMovementDate(level: StockLevel): string {
  let latest = "";
  for (const movement of latestMovements) {
    if (movement.status === "CANCELLED" || movement.status === "DRAFT")
      continue;
    const hasArticle = movement.lines.some(
      (l) => l.articleId === level.article.id,
    );
    const hasLocation =
      movement.fromLocationId === level.location.id ||
      movement.toLocationId === level.location.id;
    if (hasArticle && hasLocation) {
      if (!latest || movement.date > latest) latest = movement.date;
    }
  }
  return latest ? formatDate(latest) : "-";
}

function stockDisponibleCell(level: StockLevel): string {
  return `<div class="font-bold">${formatNumber(Number(level.quantity))}</div>`;
}

function stockRow(level: StockLevel) {
  const metrics = stockMovementMetrics(level);
  const lastMvt = stockLastMovementDate(level);
  const levelId = escapeHtml(level.id);
  return (
    `<tr class="cursor-pointer hover:bg-gray-50 transition-colors" data-action="openStockDrawer('${levelId}')">` +
    `<td class="px-5 py-4"><div class="font-bold">${escapeHtml(level.article.designation)}</div><div class="text-xs text-gray-500">${escapeHtml(level.article.code)}</div></td>` +
    `<td class="px-5 py-4">${escapeHtml(level.article.category)}</td>` +
    `<td class="px-5 py-4">${escapeHtml(level.location.name)}</td>` +
    `<td class="px-5 py-4 text-right">${formatNumber(metrics.initial)}</td>` +
    `<td class="px-5 py-4 text-right text-success-700">${formatNumber(metrics.entries)}</td>` +
    `<td class="px-5 py-4 text-right text-error-700">${formatNumber(metrics.exits)}</td>` +
    `<td class="px-5 py-4">${stockDisponibleCell(level)}</td>` +
    `<td class="px-5 py-4">${stockStatus(level)}</td>` +
    `<td class="px-5 py-4 text-sm text-gray-500">${lastMvt}</td>` +
    `</tr>`
  );
}

function stockSortIconHtml(key: string) {
  if (stockSortKey !== key)
    return `<i data-lucide="chevrons-up-down" class="w-3 h-3 ml-1 inline opacity-40"></i>`;
  return stockSortDir === "asc"
    ? `<i data-lucide="chevron-up" class="w-3 h-3 ml-1 inline text-accent-600"></i>`
    : `<i data-lucide="chevron-down" class="w-3 h-3 ml-1 inline text-accent-600"></i>`;
}

function renderStockKpis(root: HTMLElement, levels: StockLevel[]) {
  const totalValue = levels.reduce(
    (sum, l) =>
      sum + Number(l.quantity) * Number(l.article.referencePrice ?? 0),
    0,
  );
  const belowThreshold = levels.filter(
    (l) =>
      stockStatusCategory(l) === "rupture" ||
      stockStatusCategory(l) === "sous-seuil",
  ).length;
  // count movements that touch any of the filtered levels in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filteredArticleIds = new Set(levels.map((l) => l.article.id));
  const filteredLocationIds = new Set(levels.map((l) => l.location.id));
  const mvtCount = latestMovements.filter((m) => {
    if (m.status === "CANCELLED" || m.status === "DRAFT") return false;
    const hasArticle = m.lines.some((line) =>
      filteredArticleIds.has(line.articleId),
    );
    const hasLocation =
      filteredLocationIds.has(m.fromLocationId ?? "") ||
      filteredLocationIds.has(m.toLocationId ?? "");
    const isRecent = new Date(m.date) >= thirtyDaysAgo;
    return hasArticle && hasLocation && isRecent;
  }).length;
  const kpiValueEl = root.querySelector<HTMLElement>("#stockKpiValue");
  const kpiRuptureEl = root.querySelector<HTMLElement>("#stockKpiRupture");
  const kpiMvtEl = root.querySelector<HTMLElement>("#stockKpiMvt");
  if (kpiValueEl) kpiValueEl.textContent = formatNumber(Math.round(totalValue));
  if (kpiRuptureEl) kpiRuptureEl.textContent = formatNumber(belowThreshold);
  if (kpiMvtEl) kpiMvtEl.textContent = formatNumber(mvtCount);
}

function renderStockSortHeaders(root: HTMLElement) {
  const headers = root.querySelectorAll<HTMLElement>(
    "#stockTableHead th[data-sort]",
  );
  headers.forEach((th) => {
    const key = th.dataset.sort ?? "";
    const icon = th.querySelector<HTMLElement>(".sort-icon");
    if (!icon) return;
    if (stockSortKey !== key) {
      icon.innerHTML = `<i data-lucide="chevrons-up-down" class="w-3 h-3 ml-1 inline opacity-40"></i>`;
    } else {
      icon.innerHTML =
        stockSortDir === "asc"
          ? `<i data-lucide="chevron-up" class="w-3 h-3 ml-1 inline text-accent-600"></i>`
          : `<i data-lucide="chevron-down" class="w-3 h-3 ml-1 inline text-accent-600"></i>`;
    }
  });
}

function renderStock(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>("#stock tbody");
  if (!body) return;
  const location =
    root.querySelector<HTMLSelectElement>("#stockLocationSelect")?.value ?? "";
  const category =
    root.querySelector<HTMLSelectElement>("#stockCategorySelect")?.value ?? "";
  const search =
    root
      .querySelector<HTMLInputElement>("#stockSearchInput")
      ?.value.trim()
      .toLowerCase() ?? "";
  const statusFilter =
    root.querySelector<HTMLSelectElement>("#stockStatusSelect")?.value ?? "";
  let levels = latestStockLevels.filter((level) => {
    const haystack =
      `${level.article.code} ${level.article.designation} ${level.location.name}`.toLowerCase();
    const statusOk =
      !statusFilter || stockStatusCategory(level) === statusFilter;
    return (
      (!location || level.location.id === location) &&
      (!category || level.article.category === category) &&
      (!search || haystack.includes(search)) &&
      statusOk
    );
  });
  // Sort
  if (stockSortKey) {
    levels = [...levels].sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      if (stockSortKey === "designation") {
        va = a.article.designation;
        vb = b.article.designation;
      } else if (stockSortKey === "category") {
        va = a.article.category;
        vb = b.article.category;
      } else if (stockSortKey === "location") {
        va = a.location.name;
        vb = b.location.name;
      } else if (stockSortKey === "quantity") {
        va = Number(a.quantity);
        vb = Number(b.quantity);
      } else if (stockSortKey === "status") {
        va = stockStatusCategory(a);
        vb = stockStatusCategory(b);
      }
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return stockSortDir === "asc" ? cmp : -cmp;
    });
  }
  body.innerHTML = levels.length
    ? levels.map(stockRow).join("")
    : emptyRow(9, "Aucun stock ne correspond aux critères.");
  renderStockKpis(root, levels);
  renderStockSortHeaders(root);
  window.lucide?.createIcons();
}

function populateStockFilters(root: HTMLElement) {
  const locationSelect = root.querySelector<HTMLSelectElement>(
    "#stockLocationSelect",
  );
  if (locationSelect) {
    const previous = locationSelect.value;
    locationSelect.innerHTML =
      '<option value="">Tous les emplacements</option>' +
      latestLocations
        .map((location) =>
          option(location.id, `${location.code} - ${location.name}`),
        )
        .join("");
    if (latestLocations.some((location) => location.id === previous))
      locationSelect.value = previous;
  }
  const categorySelect = root.querySelector<HTMLSelectElement>(
    "#stockCategorySelect",
  );
  if (categorySelect) {
    const previous = categorySelect.value;
    const categories = [
      ...new Set(latestStockLevels.map((level) => level.article.category)),
    ].sort();
    categorySelect.innerHTML =
      '<option value="">Toutes familles</option>' +
      categories.map((category) => option(category, category)).join("");
    if (categories.includes(previous)) categorySelect.value = previous;
  }
}

// ---- Stock Drawer ----
function openStockDrawer(root: HTMLElement, levelId: string) {
  openStockLevelId = levelId;
  renderStockDrawer(root);
}

function closeStockDrawer(root: HTMLElement) {
  openStockLevelId = null;
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

function movementTypeBadge(type: StockMovement["type"]) {
  const labels: Record<StockMovement["type"], string> = {
    ENTRY: "Entrée",
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

function initialQuantityForLevel(
  level: StockLevel,
  movements: StockMovement[],
) {
  let quantity = Number(level.quantity ?? 0);
  for (const movement of movements) {
    if (
      movement.status === "CANCELLED" ||
      movement.status === "DRAFT" ||
      movement.type === "INITIAL" ||
      movement.type === "ADJUSTMENT" ||
      movement.type === "EXIT_REQUEST"
    )
      continue;
    for (const line of movement.lines) {
      if (line.articleId !== level.article.id) continue;
      const amount = Number(
        line.completedQuantity ??
          line.expectedQuantity ??
          line.requestedQuantity ??
          0,
      );
      if (movement.type === "ENTRY" || movement.type === "RETURN") {
        if (movement.toLocationId === level.location.id) quantity -= amount;
      } else if (movement.type === "EXIT") {
        if (movement.fromLocationId === level.location.id) quantity += amount;
      } else if (movement.type === "TRANSFER") {
        if (movement.toLocationId === level.location.id) quantity -= amount;
        if (movement.fromLocationId === level.location.id) quantity += amount;
      }
    }
  }
  return Math.max(0, quantity);
}

function renderStockDrawer(root: HTMLElement) {
  const drawer = root.querySelector<HTMLElement>("#stockDrawer");
  const backdrop = root.querySelector<HTMLElement>("#stockDrawerBackdrop");
  if (!drawer || !backdrop) return;
  const level = latestStockLevels.find((l) => l.id === openStockLevelId);
  if (!level) return;

  backdrop.classList.remove("hidden");
  drawer.classList.remove("translate-x-full");
  drawer.classList.add("translate-x-0");
  drawer.classList.add("stock-drawer--open");

  // Header
  const header = drawer.querySelector<HTMLElement>("#stockDrawerHeader");
  if (header) {
    header.innerHTML = `
      <div class="min-w-0 flex-1">
        <div class="font-bold text-lg truncate">${escapeHtml(level.article.designation)}</div>
        <div class="text-sm text-gray-500">${escapeHtml(level.article.code)} &bull; ${escapeHtml(level.location.name)}</div>
      </div>
    `;
  }

  // Infos complementaires
  const infoEl = drawer.querySelector<HTMLElement>("#stockDrawerInfo");
  if (infoEl) {
    const supplier = latestSuppliers.find(
      (s) => s.id === level.article.defaultSupplierId,
    );
    const secondaryLocations = latestStockLevels.filter(
      (l) =>
        l.article.id === level.article.id &&
        l.location.id !== level.location.id,
    );
    const cat = stockStatusCategory(level);
    const statusColors: Record<string, string> = {
      rupture: "bg-error-50 text-error-700 border border-error-100",
      "sous-seuil": "bg-warning-50 text-warning-700 border border-warning-100",
      disponible: "bg-success-50 text-success-700 border border-success-100",
    };
    const statusLabels: Record<string, string> = {
      rupture: "Rupture",
      "sous-seuil": "Sous seuil",
      disponible: "Disponible",
    };
    infoEl.innerHTML = `
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Statut actuel</div>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[cat]}">${statusLabels[cat]}</span>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Disponible</div>
          <div class="font-bold text-base">${formatNumber(level.quantity)} <span class="text-xs font-normal text-gray-400">${escapeHtml(level.article.unit)}</span></div>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Seuil minimum</div>
          <div class="font-semibold">${formatNumber(level.article.minimumStock)} ${escapeHtml(level.article.unit)}</div>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Stock securite</div>
          <div class="font-semibold">${level.article.securityStock > 0 ? formatNumber(level.article.securityStock) + " " + escapeHtml(level.article.unit) : "-"}</div>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Fournisseur principal</div>
          <div class="font-semibold">${escapeHtml(supplier?.name ?? "-")}</div>
        </div>
        <div class="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-1">Emplacements secondaires</div>
          <div class="font-semibold text-xs">${secondaryLocations.length > 0 ? secondaryLocations.map((l) => escapeHtml(l.location.name) + " (" + formatNumber(l.quantity) + ")").join(", ") : "Aucun"}</div>
        </div>
      </div>
    `;
  }

  // Historique mouvements
  const histEl = drawer.querySelector<HTMLElement>("#stockDrawerHistory");
  if (histEl) {
    const dateFrom =
      drawer.querySelector<HTMLInputElement>("#stockDrawerDateFrom")?.value ??
      "";
    const dateTo =
      drawer.querySelector<HTMLInputElement>("#stockDrawerDateTo")?.value ?? "";
    const movements = latestMovements
      .filter((m) => {
        if (m.status === "CANCELLED" || m.status === "DRAFT") return false;
        // Une demande préparee est ensuite materialisee par une sortie reelle.
        // Elle ne doit pas apparaitre deux fois dans l'historique du stock.
        if (m.type === "EXIT_REQUEST" && linkedExitForRequest(m)) return false;
        const hasArticle = m.lines.some(
          (l) => l.articleId === level.article.id,
        );
        const hasLocation =
          m.fromLocationId === level.location.id ||
          m.toLocationId === level.location.id;
        if (!hasArticle || !hasLocation) return false;
        if (dateFrom && m.date < dateFrom) return false;
        if (dateTo && m.date > dateTo + "T23:59:59") return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Un meme comptage ne doit pas etre repete dans la fiche si le bouton a
    // ete valide plusieurs fois avec exactement les memes valeurs.
    const uniqueInventoryKeys = new Set<string>();
    const deduplicatedMovements = movements.filter((movement) => {
      if (movement.type !== "ADJUSTMENT") return true;
      const line = movement.lines.find(
        (item) => item.articleId === level.article.id,
      );
      const key = [
        level.article.id,
        level.location.id,
        line?.expectedQuantity ?? "",
        line?.completedQuantity ?? "",
      ].join("|");
      if (uniqueInventoryKeys.has(key)) return false;
      uniqueInventoryKeys.add(key);
      return true;
    });
    movements.splice(0, movements.length, ...deduplicatedMovements);

    // Les anciens articles n'avaient pas encore de mouvement INITIAL en base.
    // On reconstruit alors le stock de depart et on l'affiche toujours en premier.
    if (!movements.some((m) => m.type === "INITIAL")) {
      const initialQuantity = initialQuantityForLevel(level, latestMovements);
      movements.unshift({
        id: `initial-${level.article.id}-${level.location.id}`,
        reference: `INIT-${level.article.code}`,
        type: "INITIAL",
        status: "COMPLETED",
        date: level.article.createdAt ?? new Date(0).toISOString(),
        supplierId: null,
        clientId: null,
        projectId: null,
        teamServiceId: null,
        siteLocationId: null,
        fromLocationId: level.location.id,
        toLocationId: level.location.id,
        handledBy: null,
        requestedBy: null,
        receivedBy: null,
        deliveredBy: null,
        sourceRequestId: null,
        proofFileName: null,
        proofFileKey: null,
        proofMimeType: null,
        proofSizeBytes: null,
        proofUploadedAt: null,
        proofUploadedBy: null,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null,
        notes: "Stock de depart",
        lines: [
          {
            id: `initial-line-${level.article.id}-${level.location.id}`,
            articleId: level.article.id,
            article: level.article,
            requestedQuantity: initialQuantity,
            expectedQuantity: initialQuantity,
            completedQuantity: initialQuantity,
            unitPrice: null,
            observation: "Stock de depart",
          },
        ],
      });
    }
    // Lecture chronologique : le stock de depart apparait avant les mouvements.
    movements.sort((a, b) => a.date.localeCompare(b.date));

    if (!movements.length) {
      histEl.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Aucun mouvement trouvé pour cette période.</p>`;
    } else {
      histEl.innerHTML = movements
        .map((m) => {
          const lineForArticle = m.lines.find(
            (l) => l.articleId === level.article.id,
          );
          const qty = Number(
            lineForArticle?.completedQuantity ??
              lineForArticle?.requestedQuantity ??
              lineForArticle?.expectedQuantity ??
              0,
          );
          const isOut =
            m.type === "EXIT" ||
            m.type === "EXIT_REQUEST" ||
            (m.type === "TRANSFER" && m.fromLocationId === level.location.id);
          const displayedQuantity =
            m.type === "ADJUSTMENT"
              ? qty - Number(lineForArticle?.expectedQuantity ?? 0)
              : qty;
          const signedQuantity = isOut ? -displayedQuantity : displayedQuantity;
          const qtyClass =
            signedQuantity < 0 ? "text-error-700" : "text-success-700";
          const qtySign = signedQuantity > 0 ? "+" : "";
          const actor =
            m.handledBy ??
            m.receivedBy ??
            m.requestedBy ??
            m.deliveredBy ??
            "-";
          return `<div class="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
          <div class="shrink-0 mt-0.5">${movementTypeBadge(m.type)}</div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-gray-500">${escapeHtml(formatDate(m.date))}</span>
              <span class="font-bold text-sm ${qtyClass}">${qtySign}${formatNumber(signedQuantity)}</span>
            </div>
            <div class="text-xs text-gray-600 mt-0.5 truncate">${escapeHtml(m.reference)} &bull; ${escapeHtml(actor)}</div>
          </div>
        </div>`;
        })
        .join("");
    }
  }

  window.lucide?.createIcons();
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

function inventoryRow(level: StockLevel) {
  const good = Math.max(level.quantity, 0);
  const action =
    "openCount('" + level.article.id + "','" + level.location.id + "')";
  return (
    "<tr>" +
    '<td class="px-5 py-4"><div class="font-bold">' +
    escapeHtml(level.article.designation) +
    '</div><div class="text-xs text-gray-500">' +
    escapeHtml(level.article.code) +
    "</div></td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(level.quantity) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(level.quantity) +
    "</td>" +
    '<td class="px-5 py-4 text-right text-success-700 font-bold">' +
    formatNumber(good) +
    "</td>" +
    '<td class="px-5 py-4 text-right text-warning-700 font-bold">0</td>' +
    '<td class="px-5 py-4 text-right text-error-700 font-bold">0</td>' +
    '<td class="px-5 py-4 text-center">-</td>' +
    '<td class="px-5 py-4 text-gray-600">-</td>' +
    '<td class="px-5 py-4">' +
    badge("A compter", "gray") +
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
  const levels = selectedLocationId
    ? inventoryLevelsForLocation(selectedLocationId)
    : [];
  const inventoryBody = root.querySelector<HTMLElement>(
    "#inventoryTable tbody",
  );
  if (inventoryBody) {
    inventoryBody.innerHTML = levels.length
      ? levels.map(inventoryRow).join("")
      : emptyRow(
          10,
          selectedLocationId
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
    countElement.innerHTML = `${formatNumber(levels.length)} <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">0 saisi</span>`;
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
}

function equipmentStateLabel(state: string) {
  const labels: Record<string, string> = {
    GOOD: "Bon",
    DAMAGED: "Abime",
    LOST: "Perdu",
    REPAIR: "A reparer",
  };
  return labels[state] ?? state;
}

function equipmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponible",
    ASSIGNED: "Affecte",
    OUT: "Sorti",
    MAINTENANCE: "Maintenance",
    LOST: "Perdu",
  };
  return labels[status] ?? status;
}

function equipmentStatusTone(
  status: string,
): "success" | "warning" | "error" | "gray" | "accent" {
  if (status === "AVAILABLE") return "success";
  if (status === "ASSIGNED") return "accent";
  if (status === "MAINTENANCE") return "warning";
  if (status === "LOST") return "error";
  return "gray";
}

function equipmentHistoryLabel(action: string) {
  const labels: Record<string, string> = {
    CREATED: "Equipement cree",
    ASSIGNED: "Affectation",
    UNASSIGNED: "Desaffectation",
    RETURNED: "Retour au stock",
    LOCATION_CHANGED: "Emplacement modifie",
    STATUS_CHANGED: "Statut modifie",
    MAINTENANCE: "Maintenance",
    UPDATED: "Equipement mis a jour",
  };
  return labels[action] ?? action;
}

function equipmentHistoryIcon(action: string) {
  const icons: Record<string, string> = {
    CREATED: "package-plus",
    ASSIGNED: "user-round-check",
    UNASSIGNED: "user-round-minus",
    RETURNED: "rotate-ccw",
    LOCATION_CHANGED: "map-pin",
    STATUS_CHANGED: "refresh-cw",
    MAINTENANCE: "wrench",
    UPDATED: "pencil",
  };
  return icons[action] ?? "history";
}

function equipmentHistoryTone(action: string) {
  if (action === "CREATED") return "bg-accent-50 text-accent-600";
  if (action === "ASSIGNED") return "bg-success-50 text-success-700";
  if (action === "UNASSIGNED") return "bg-warning-50 text-warning-700";
  if (action === "RETURNED") return "bg-success-50 text-success-700";
  if (action === "MAINTENANCE" || action === "STATUS_CHANGED")
    return "bg-warning-50 text-warning-700";
  return "bg-gray-100 text-gray-600";
}

function equipmentHistoryTimeline(equipment: Equipment) {
  const events = equipment.history.length
    ? equipment.history
    : [
        {
          id: "created-" + equipment.id,
          action: "CREATED",
          status: equipment.status,
          state: equipment.state,
          assignedTo: equipment.assignedTo,
          locationId: equipment.locationId,
          observation: null,
          createdAt: equipment.createdAt,
        },
      ];
  return events
    .map((event, index) => {
      const eventDate = formatDate(event.createdAt);
      const detail =
        event.action === "CREATED"
          ? "Cree le " + eventDate
          : event.action === "ASSIGNED" && event.assignedTo
            ? "Affecte a " + event.assignedTo
            : event.action === "LOCATION_CHANGED" && event.locationId
              ? "Emplacement mis a jour"
              : event.action === "STATUS_CHANGED" && event.status
                ? "Nouveau statut : " + equipmentStatusLabel(event.status)
                : (event.observation ?? "");
      return (
        '<div class="relative flex gap-4 pb-6 last:pb-0">' +
        (index < events.length - 1
          ? '<div class="absolute left-5 top-10 bottom-0 w-px bg-gray-200"></div>'
          : "") +
        '<div class="relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center ' +
        equipmentHistoryTone(event.action) +
        '"><i data-lucide="' +
        equipmentHistoryIcon(event.action) +
        '" class="w-4 h-4"></i></div>' +
        '<div class="min-w-0 pt-1"><div class="font-bold">' +
        escapeHtml(equipmentHistoryLabel(event.action)) +
        '</div><div class="text-sm text-gray-600 mt-1">' +
        escapeHtml(eventDate) +
        "</div>" +
        (detail
          ? '<div class="text-sm text-gray-700 mt-1">' +
            escapeHtml(detail) +
            "</div>"
          : "") +
        "</div></div>"
      );
    })
    .join("");
}

function equipmentRow(equipment: Equipment) {
  const article = equipment.article
    ? equipment.article.code + " - " + equipment.article.designation
    : "Article non renseigne";
  const location =
    equipment.location?.name ??
    (equipment.locationId ? "Emplacement non charge" : "Non localise");
  return (
    "<tr>" +
    '<td class="px-5 py-4 font-bold">' +
    escapeHtml(equipment.code) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(article) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(equipment.serialNumber ?? "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(equipmentStateLabel(equipment.state)) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(location) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(equipment.assignedTo ?? "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(
      equipmentStatusLabel(equipment.status),
      equipmentStatusTone(equipment.status),
    ) +
    "</td>" +
    '<td class="px-5 py-4 text-right"><button data-action="openEquipmentDetail(\'' +
    escapeHtml(equipment.id) +
    '\')" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50" title="Voir la fiche"><i data-lucide="eye" class="w-4 h-4"></i></button></td>' +
    "</tr>"
  );
}

async function renderEquipmentDetail(
  root: HTMLElement,
  id: string,
  editing = false,
) {
  const equipment = latestEquipments.find((item) => item.id === id);
  if (!equipment) {
    showToast(root, "Equipement introuvable dans la liste chargee.", "error");
    return false;
  }
  selectedEquipmentId = id;
  const detailModal = root.querySelector<HTMLElement>("#equipmentDetailModal");
  if (!detailModal) return false;

  const title = detailModal.querySelector<HTMLElement>("#equipmentDetailTitle");
  const subtitle = detailModal.querySelector<HTMLElement>(
    "#equipmentDetailSubtitle",
  );
  const actions = detailModal.querySelector<HTMLElement>(
    "#equipmentDetailActions",
  );
  const cards = detailModal.querySelector<HTMLElement>("#equipmentDetailCards");
  const contentTitle = detailModal.querySelector<HTMLElement>(
    "#equipmentDetailContentTitle",
  );
  const fields = detailModal.querySelector<HTMLElement>(
    "#equipmentDetailFields",
  );
  const history = detailModal.querySelector<HTMLElement>("#equipmentHistory");
  const historyWrapper = detailModal.querySelector<HTMLElement>(
    "#equipmentHistoryPanelWrapper",
  );

  if (editing) {
    if (title) title.textContent = `${equipment.code} - Modifier l'equipement`;
    if (subtitle)
      subtitle.textContent =
        "Modifier directement les donnees saisies pour cet equipement.";
    if (contentTitle) contentTitle.textContent = "Modifier les informations";

    const [articles, locations, suppliers] = await Promise.all([
      latestArticles.length ? latestArticles : getArticles().catch(() => []),
      latestLocations.length ? latestLocations : getLocations().catch(() => []),
      latestSuppliers.length ? latestSuppliers : getSuppliers().catch(() => []),
    ]);
    latestArticles = articles;
    latestLocations = locations;
    latestSuppliers = suppliers;

    const individualArticles = articles.filter(
      (article) => article.trackingMode === "INDIVIDUAL",
    );
    const articleOptionsHtml =
      individualArticles
        .map((article) =>
          option(article.id, `${article.code} - ${article.designation}`),
        )
        .join("") || option("", "Aucun article en suivi individuel");

    const supplierOptionsHtml =
      option("", "Aucun fournisseur") +
      suppliers.map((supplier) => option(supplier.id, supplier.name)).join("");

    const locationOptionsHtml =
      option("", "Non localise") + locationOptions(locations);

    const stateOptionsHtml =
      option("GOOD", "Bon") +
      option("DAMAGED", "Abime") +
      option("REPAIR", "A reparer") +
      option("LOST", "Perdu");

    if (cards) {
      cards.innerHTML = "";
      cards.classList.add("hidden");
    }
    if (historyWrapper) historyWrapper.classList.add("hidden");

    if (fields) {
      fields.innerHTML = `
        <form id="equipmentDetailEditForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>
            <span class="text-sm font-semibold">Article modele</span>
            <select name="articleId" class="mt-2 w-full h-11 border rounded-lg px-3 bg-white">
              ${articleOptionsHtml}
            </select>
          </label>
          <label>
            <span class="text-sm font-semibold">Numero de serie</span>
            <input name="serialNumber" value="${escapeHtml(equipment.serialNumber ?? "")}" placeholder="Ex: SN-12345" class="mt-2 w-full h-11 border rounded-lg px-3">
          </label>
          <label>
            <span class="text-sm font-semibold">Etat</span>
            <select name="state" class="mt-2 w-full h-11 border rounded-lg px-3 bg-white">
              ${stateOptionsHtml}
            </select>
          </label>
          <label>
            <span class="text-sm font-semibold">Emplacement</span>
            <select name="locationId" class="mt-2 w-full h-11 border rounded-lg px-3 bg-white">
              ${locationOptionsHtml}
            </select>
          </label>
          <label>
            <span class="text-sm font-semibold">Date d'entree</span>
            <input name="entryDate" type="date" value="${escapeHtml(equipment.entryDate.slice(0, 10))}" class="mt-2 w-full h-11 border rounded-lg px-3">
          </label>
          <label>
            <span class="text-sm font-semibold">Fournisseur</span>
            <select name="supplierId" class="mt-2 w-full h-11 border rounded-lg px-3 bg-white">
              ${supplierOptionsHtml}
            </select>
          </label>
          <label class="md:col-span-2">
            <span class="text-sm font-semibold">Origine</span>
            <input name="origin" value="${escapeHtml(equipment.origin ?? "")}" placeholder="Ex: Reception commande, Transfert..." class="mt-2 w-full h-11 border rounded-lg px-3">
          </label>
          <label class="md:col-span-2">
            <span class="text-sm font-semibold">Observation</span>
            <textarea name="notes" placeholder="Notes ou observations..." class="mt-2 w-full min-h-20 border rounded-lg px-3 py-2">${escapeHtml(equipment.notes ?? "")}</textarea>
          </label>
        </form>
      `;
      const form = fields.querySelector<HTMLFormElement>(
        "#equipmentDetailEditForm",
      );
      if (form) {
        const articleSelect = form.querySelector<HTMLSelectElement>(
          'select[name="articleId"]',
        );
        const stateSelect = form.querySelector<HTMLSelectElement>(
          'select[name="state"]',
        );
        const locationSelect = form.querySelector<HTMLSelectElement>(
          'select[name="locationId"]',
        );
        const supplierSelect = form.querySelector<HTMLSelectElement>(
          'select[name="supplierId"]',
        );
        if (articleSelect) articleSelect.value = equipment.articleId;
        if (stateSelect) stateSelect.value = equipment.state;
        if (locationSelect) locationSelect.value = equipment.locationId ?? "";
        if (supplierSelect) supplierSelect.value = equipment.supplierId ?? "";
      }
    }

    if (actions) {
      actions.innerHTML = `
        <button title="Annuler" data-action="cancelEquipmentEdit" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="x" class="w-4 h-4"></i></button>
        <button title="Enregistrer" data-action="submitEquipmentEdit" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-600 text-white hover:bg-accent-500"><i data-lucide="save" class="w-4 h-4"></i></button>
      `;
    }
  } else {
    if (title) {
      title.textContent = `${equipment.code} - ${equipment.article?.designation ?? "Equipement"}`;
    }
    if (subtitle) {
      subtitle.textContent =
        "Piece suivie individuellement. Affectation separee de la creation.";
    }
    if (contentTitle) contentTitle.textContent = "Informations et tracabilite";

    if (cards) {
      cards.classList.remove("hidden");
      cards.innerHTML = [
        ["Numero serie", equipment.serialNumber ?? "-"],
        ["Etat", equipmentStateLabel(equipment.state)],
        ["Affecte a", equipment.assignedTo ?? "-"],
        ["Statut", equipmentStatusLabel(equipment.status)],
      ]
        .map(
          ([label, value]) =>
            '<div class="p-4 rounded-xl bg-gray-50 border"><div class="text-xs font-semibold text-gray-500">' +
            escapeHtml(label) +
            '</div><div class="font-bold mt-1">' +
            escapeHtml(value) +
            "</div></div>",
        )
        .join("");
    }

    if (fields) {
      fields.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          ${[
            [
              "Article modele",
              equipment.article
                ? equipment.article.code + " - " + equipment.article.designation
                : "-",
            ],
            ["Emplacement", equipment.location?.name ?? "Non localise"],
            ["Date d'entree", formatDate(equipment.entryDate)],
            ["Fournisseur", equipment.supplier?.name ?? "-"],
            ["Origine", equipment.origin ?? "-"],
            ["Observation", equipment.notes ?? "-"],
          ]
            .map(
              ([label, value]) =>
                '<div><span class="text-gray-500">' +
                escapeHtml(label) +
                '</span><div class="font-semibold mt-1">' +
                escapeHtml(value) +
                "</div></div>",
            )
            .join("")}
        </div>
      `;
    }

    if (history) {
      history.innerHTML = equipmentHistoryTimeline(equipment);
      history.classList.add("hidden");
    }
    if (historyWrapper) historyWrapper.classList.remove("hidden");

    if (actions) {
      actions.innerHTML = `
        <button title="Enregistrer retour" data-action="closeModal('equipmentDetailModal'); openModal('returnModal')" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-600 text-white hover:bg-accent-500"><i data-lucide="rotate-ccw" class="w-4 h-4"></i></button>
        <button title="Modifier" data-action="editEquipmentDetail" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="pencil" class="w-4 h-4"></i></button>
        <button title="Afficher l'historique" data-action="togglePanel('equipmentHistory')" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="history" class="w-4 h-4"></i></button>
        ${equipment.assignedTo ? '<button title="Supprimer l\'affectation" data-action="unassignEquipment" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="user-round-minus" class="w-4 h-4"></i></button>' : ""}
        <button title="Fermer" class="inline-flex items-center justify-center w-10 h-10 rounded-lg border text-gray-500 hover:text-gray-900" data-action="closeModal('equipmentDetailModal')"><i data-lucide="x" class="w-5 h-5"></i></button>
      `;
    }
  }

  window.lucide?.createIcons();
  return true;
}

function openEquipmentDetail(root: HTMLElement, id: string) {
  selectedEquipmentId = id;
  void renderEquipmentDetail(root, id, false).then((ok) => {
    if (ok) openModal(root, "equipmentDetailModal");
  });
}

function editEquipmentDetail(root: HTMLElement) {
  if (selectedEquipmentId) {
    void renderEquipmentDetail(root, selectedEquipmentId, true);
  }
}

function cancelEquipmentEdit(root: HTMLElement) {
  if (selectedEquipmentId) {
    void renderEquipmentDetail(root, selectedEquipmentId, false);
  }
}

async function openEquipmentEdit(root: HTMLElement) {
  editEquipmentDetail(root);
}

async function submitEquipmentEdit(root: HTMLElement) {
  if (!selectedEquipmentId) return;
  const form = root.querySelector<HTMLFormElement>("#equipmentDetailEditForm");
  if (!form) return;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const updated = await updateEquipment(selectedEquipmentId, {
      articleId: String(data.articleId || ""),
      serialNumber: String(data.serialNumber ?? "").trim() || undefined,
      state: String(data.state || "GOOD"),
      locationId: data.locationId ? String(data.locationId) : null,
      supplierId: data.supplierId ? String(data.supplierId) : null,
      entryDate: data.entryDate ? String(data.entryDate) : undefined,
      origin: String(data.origin ?? "").trim() || null,
      notes: String(data.notes ?? "").trim() || null,
    });
    latestEquipments = latestEquipments.map((item) =>
      item.id === updated.id ? updated : item,
    );
    await renderEquipmentDetail(root, updated.id, false);
    updateApiBackedViews(root);
    showToast(root, "Equipement mis a jour.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error
        ? error.message
        : "Modification equipement impossible.",
      "error",
    );
  }
}

async function unassignSelectedEquipment(root: HTMLElement) {
  if (!selectedEquipmentId) return;
  const equipment = latestEquipments.find(
    (item) => item.id === selectedEquipmentId,
  );
  if (!equipment?.assignedTo) {
    showToast(root, "Cet equipement n'est pas affecte.", "error");
    return;
  }
  if (!window.confirm("Supprimer l'affectation de cet equipement ?")) return;
  try {
    const updated = await unassignEquipment(selectedEquipmentId);
    latestEquipments = latestEquipments.map((item) =>
      item.id === updated.id ? updated : item,
    );
    await renderEquipmentDetail(root, updated.id, false);
    updateApiBackedViews(root);
    showToast(root, "Affectation supprimee et historisee.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Desaffectation impossible.",
      "error",
    );
  }
}

function equipmentOptions(equipments: Equipment[]) {
  return equipments
    .map((equipment) => {
      const article = equipment.article?.designation ?? "Article";
      const status = equipmentStatusLabel(equipment.status);
      return option(
        equipment.id,
        equipment.code + " - " + article + " - " + status,
      );
    })
    .join("");
}

async function populateEquipmentModal(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#equipmentModal");
  if (!modal) return;
  const [equipments, locations, users] = await Promise.all([
    getEquipments().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => []),
  ]);
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const equipmentSelect = selects[0];
  const beneficiarySelect = selects[2];
  const locationSelect = selects[3];
  const handledBySelect = selects[4];
  if (equipmentSelect)
    equipmentSelect.innerHTML = equipments.length
      ? equipmentOptions(equipments)
      : '<option value="">Aucun equipement en base</option>';
  if (beneficiarySelect) beneficiarySelect.innerHTML = userOptions(users);
  if (locationSelect) locationSelect.innerHTML = locationOptions(locations);
  if (handledBySelect) handledBySelect.innerHTML = userOptions(users);
}

async function populateEquipmentCreateModal(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#equipmentCreateModal");
  if (!modal) return;
  const [articles, locations, suppliers] = await Promise.all([
    getArticles().catch(() => []),
    getLocations().catch(() => []),
    getSuppliers().catch(() => []),
  ]);
  const articleSelect = modal.querySelector<HTMLSelectElement>(
    "#equipmentCreateArticle",
  );
  const locationSelect = modal.querySelector<HTMLSelectElement>(
    "#equipmentCreateLocation",
  );
  const supplierSelect = modal.querySelector<HTMLSelectElement>(
    "#equipmentCreateSupplier",
  );
  if (articleSelect)
    articleSelect.innerHTML =
      articles
        .filter((article) => article.trackingMode === "INDIVIDUAL")
        .map((article) =>
          option(article.id, article.code + " - " + article.designation),
        )
        .join("") ||
      '<option value="">Aucun article en suivi individuel</option>';
  if (locationSelect) locationSelect.innerHTML = locationOptions(locations);
  if (supplierSelect)
    supplierSelect.innerHTML =
      suppliers
        .map((supplier) => option(supplier.id, supplier.name))
        .join("") || '<option value="">Aucun fournisseur</option>';
}

async function submitEquipmentCreation(root: HTMLElement) {
  const articleId = root.querySelector<HTMLSelectElement>(
    "#equipmentCreateArticle",
  )?.value;
  if (!articleId) {
    showToast(root, "Selectionne un article en suivi individuel.", "error");
    return;
  }
  try {
    await createEquipment({
      articleId,
      serialNumber:
        root
          .querySelector<HTMLInputElement>("#equipmentCreateSerial")
          ?.value.trim() || undefined,
      state:
        root.querySelector<HTMLSelectElement>("#equipmentCreateState")?.value ||
        "GOOD",
      locationId:
        root.querySelector<HTMLSelectElement>("#equipmentCreateLocation")
          ?.value || undefined,
      supplierId:
        root.querySelector<HTMLSelectElement>("#equipmentCreateSupplier")
          ?.value || undefined,
      entryDate:
        root.querySelector<HTMLInputElement>("#equipmentCreateEntryDate")
          ?.value || undefined,
      origin:
        root
          .querySelector<HTMLInputElement>("#equipmentCreateOrigin")
          ?.value.trim() || undefined,
      notes:
        root
          .querySelector<HTMLTextAreaElement>("#equipmentCreateNotes")
          ?.value.trim() || undefined,
    });
    closeModal(root, "equipmentCreateModal");
    updateApiBackedViews(root);
    showToast(root, "Equipement cree et disponible.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error
        ? error.message
        : "Creation equipement impossible.",
      "error",
    );
  }
}

async function submitEquipmentAssignment(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#equipmentModal");
  if (!modal) return;
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const equipmentId = selects[0]?.value;
  if (!equipmentId) {
    showToast(root, "Selectionne d'abord un equipement disponible.", "error");
    return;
  }
  const beneficiary = selectedText(selects[2]);
  const locationId = selects[3]?.value || undefined;
  try {
    await updateEquipment(equipmentId, {
      status: "ASSIGNED",
      assignedTo: beneficiary,
      locationId,
    });
    closeModal(root, "equipmentModal");
    updateApiBackedViews(root);
    showToast(root, "Equipement affecte et journalise.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Affectation impossible.",
      "error",
    );
  }
}
function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("fr-FR").format(date);
}

function movementTypeLabel(type: StockMovement["type"]) {
  const labels: Record<StockMovement["type"], string> = {
    ENTRY: "Entree",
    EXIT_REQUEST: "Demande sortie",
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

function historyMovementRow(movement: StockMovement) {
  const quantity = movementQuantity(movement);
  const quantityClass = quantity < 0 ? "text-error-700" : "text-success-700";
  return (
    "<tr>" +
    '<td class="px-5 py-4">' +
    formatDate(movement.date) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(
      movementTypeLabel(movement.type),
      movement.type === "EXIT"
        ? "warning"
        : movement.type === "ADJUSTMENT"
          ? "accent"
          : "success",
    ) +
    "</td>" +
    '<td class="px-5 py-4 font-bold">' +
    escapeHtml(movement.reference) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movementArticleLabel(movement)) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold ' +
    quantityClass +
    '">' +
    (quantity > 0 ? "+" : "") +
    formatNumber(quantity) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movementActor(movement)) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge("A joindre", "gray") +
    "</td>" +
    "</tr>"
  );
}

function filteredHistory(root: HTMLElement) {
  const search =
    root
      .querySelector<HTMLInputElement>("#historySearch")
      ?.value.trim()
      .toLowerCase() ?? "";
  const type =
    root.querySelector<HTMLSelectElement>("#historyType")?.value ?? "ALL";
  return latestMovements.filter((movement) => {
    const typeOk = type === "ALL" || movement.type === type;
    const haystack = [
      movement.reference,
      movementTypeLabel(movement.type),
      movementActor(movement),
      movement.project?.name,
      movement.supplier?.name,
      movement.fromLocation?.name,
      movement.toLocation?.name,
      ...movement.lines.flatMap((line) => [
        line.article?.code,
        line.article?.designation,
      ]),
    ]
      .join(" ")
      .toLowerCase();
    return typeOk && (!search || haystack.includes(search));
  });
}

function renderHistory(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>("#history-table tbody");
  if (!body) return;
  const rows = filteredHistory(root);
  body.innerHTML = rows.length
    ? rows.map(historyMovementRow).join("")
    : emptyRow(7, "Aucun mouvement ne correspond au filtre.");
  window.lucide?.createIcons();
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
  const reference =
    root
      .querySelector<HTMLElement>("#materialRequestReference")
      ?.textContent?.trim() || "DS-2026-000";
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
      <div class="doc-name"><div class="small">Document interne</div><div class="value">Demande de matériels</div><div class="hint">Document de sortie stock et remise matériel</div></div>
      <div class="meta"><div><b>Doc N</b><span>${escapeHtml(input.docCode)}</span></div><div><b>Demande</b><span>${escapeHtml(input.reference)}</span></div><div><b>Bon sortie</b><span>${escapeHtml(input.exitReference)}</span></div><div><b>Date</b><span>${escapeHtml(formatDate(input.date))}</span></div></div>
    </header>
    <div class="title">Demande de matériels</div>
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
function exportRows(kind: string, root: HTMLElement) {
  if (kind === "stock" || kind === "inventory") {
    return [
      [
        "Article",
        "Code",
        "Categorie",
        "Emplacement",
        "Quantite",
        "Stock minimum",
        "Statut",
      ],
      ...latestStockLevels.map((level) => [
        level.article.designation,
        level.article.code,
        level.article.category,
        level.location.name,
        level.quantity,
        level.article.minimumStock,
        level.quantity <= 0
          ? "Rupture"
          : level.quantity <= level.article.minimumStock
            ? "Stock bas"
            : "OK",
      ]),
    ];
  }
  if (kind === "reappro") {
    const levels = reapproLevels();
    return [
      [
        "Article",
        "Code",
        "Emplacement",
        "Disponible",
        "Stock minimum",
        "A recommander",
        "Prix indicatif",
        "Valeur estimee",
      ],
      ...levels.map((level) => [
        level.article.designation,
        level.article.code,
        level.location.name,
        level.quantity,
        level.article.minimumStock,
        reorderQuantity(level),
        level.article.referencePrice,
        reorderQuantity(level) * Number(level.article.referencePrice ?? 0),
      ]),
    ];
  }
  if (kind === "audit") {
    return [
      ["Date", "Action", "Entite", "Reference", "Utilisateur"],
      ...latestAuditLogs.map((log) => [
        formatDate(log.createdAt),
        log.action,
        log.entity,
        log.entityId ?? "-",
        log.userId ?? "-",
      ]),
    ];
  }
  const movements = kind === "all" ? latestMovements : filteredHistory(root);
  return [
    [
      "Date",
      "Type",
      "Reference",
      "Article",
      "Quantite",
      "Utilisateur",
      "Projet",
      "Fournisseur",
      "Origine",
      "Destination",
      "Statut",
    ],
    ...movements.map((movement) => [
      formatDate(movement.date),
      movementTypeLabel(movement.type),
      movement.reference,
      movementArticleLabel(movement),
      movementQuantity(movement),
      movementActor(movement),
      movement.project?.name ?? "",
      movement.supplier?.name ?? "",
      movement.fromLocation?.name ?? "",
      movement.toLocation?.name ?? "",
      movement.status,
    ]),
  ];
}

function exportData(root: HTMLElement, kind: string) {
  const filename =
    "stock-hub-" + kind + "-" + new Date().toISOString().slice(0, 10) + ".csv";
  downloadCsv(filename, exportRows(kind, root));
  showToast(root, "Export CSV prepare : " + filename);
}

function movementStatus(movement: StockMovement) {
  if (movement.status === "CANCELLED") return badge("Annulee", "gray");
  return badge(entryStatusLabel(movement), entryStatusTone(movement));
}

function entryStatusLabel(movement: StockMovement) {
  if (movement.status === "CANCELLED") return "Annulee";
  const status = entryStatusKindFromLines(movement.lines);
  if (status === "issue") return "Litige";
  if (status === "partial") return "Partielle";
  return "Recue";
}

function entryStatusTone(movement: StockMovement) {
  if (movement.status === "CANCELLED") return "gray";
  const status = entryStatusKindFromLines(movement.lines);
  if (status === "issue") return "error";
  if (status === "partial") return "warning";
  return "success";
}

function movementLinesPreview(
  movement: StockMovement,
  _mode: "entry" | "exit",
) {
  const count = movement.lines.length;
  if (!count) {
    return '<div class="font-bold text-gray-500">Aucun article</div>';
  }

  const first = movement.lines[0];
  const code = first.article?.code ?? "-";
  const designation = first.article?.designation ?? "Article";
  const more =
    count > 1
      ? '<span class="shrink-0 rounded-full bg-accent-50 px-2 py-1 text-xs font-bold text-accent-600">+' +
        formatNumber(count - 1) +
        " autre" +
        (count - 1 > 1 ? "s" : "") +
        "</span>"
      : "";

  return (
    '<div class="flex min-w-[220px] max-w-[320px] items-center justify-between gap-3">' +
    '<div class="min-w-0">' +
    '<div class="truncate font-bold text-gray-900">' +
    escapeHtml(designation) +
    '</div><div class="truncate text-xs text-gray-500">' +
    escapeHtml(code) +
    "</div></div>" +
    more +
    "</div>"
  );
}

function entryMovementRow(movement: StockMovement) {
  const { expected, completed } = entryMovementTotals(movement);
  const delta = completed - expected;
  return (
    "<tr>" +
    '<td class="px-5 py-4 font-bold">' +
    escapeHtml(movement.reference) +
    "</td>" +
    '<td class="px-5 py-4">' +
    formatDate(movement.date) +
    "</td>" +
    '<td class="px-5 py-4">' +
    movementLinesPreview(movement, "entry") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movement.supplier?.name ?? "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movement.supplier?.name ?? "Reception directe") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movement.toLocation?.name ?? "-") +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(expected) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(completed) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    formatNumber(delta) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(movement.handledBy ?? movement.receivedBy ?? "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    movementStatus(movement) +
    "</td>" +
    '<td class="px-5 py-4 text-right"><button data-action="openEntryDetail(\'' +
    escapeHtml(movement.id) +
    '\')" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50" title="Voir la fiche"><i data-lucide="eye" class="w-4 h-4"></i></button></td>' +
    "</tr>"
  );
}

function openEntryDetail(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement) {
    showToast(
      root,
      "Entree stock introuvable dans le registre charge.",
      "error",
    );
    return;
  }
  selectedEntryId = id;
  const { expected, completed } = entryMovementTotals(movement);
  const origin =
    movement.notes?.match(/^Origine entree:\s*([^\-]+)/i)?.[1]?.trim() ??
    "Reception directe";
  setText(root, "#entryDetailTitle", movement.reference);
  setText(
    root,
    "#entryDetailSubtitle",
    "Fiche lecture seule de l'entree stock recue.",
  );
  const fields = root.querySelector<HTMLElement>("#entryDetailFields");
  const rows = movement.lines
    .map((line, index) => {
      const lineExpected = Number(line.expectedQuantity ?? 0);
      const lineCompleted = Number(line.completedQuantity ?? 0);
      return (
        '<div class="md:col-span-2 rounded-lg border border-gray-200 p-3">' +
        '<div class="flex items-start justify-between gap-3"><div><div class="text-xs font-semibold text-gray-400">Ligne ' +
        String(index + 1) +
        '</div><div class="font-bold mt-1">' +
        escapeHtml(line.article ? line.article.code + " - " + line.article.designation : "-") +
        '</div></div><div class="text-right"><div class="font-bold">' +
        formatNumber(lineCompleted) +
        '</div><div class="text-xs text-gray-500">' +
        escapeHtml(line.article?.unit ?? "U") +
        "</div></div></div>" +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm"><div><span class="text-gray-500">Attendue</span><div class="font-semibold">' +
        formatNumber(lineExpected) +
        '</div></div><div><span class="text-gray-500">Recue</span><div class="font-semibold">' +
        formatNumber(lineCompleted) +
        '</div></div><div><span class="text-gray-500">Ecart</span><div class="font-semibold">' +
        formatNumber(lineCompleted - lineExpected) +
        '</div></div><div><span class="text-gray-500">Prix unitaire</span><div class="font-semibold">' +
        formatNumber(Number(line.unitPrice ?? 0)) +
        "</div></div></div>" +
        (line.observation
          ? '<div class="mt-3 text-sm text-gray-600">' +
            escapeHtml(line.observation) +
            "</div>"
          : "") +
        "</div>"
      );
    })
    .join("");
  if (fields)
    fields.innerHTML =
      [
      ["Bon d'entree", movement.reference],
      ["Date", formatDate(movement.date)],
      ["Articles", movement.lines.length > 1 ? movement.lines.length + " articles" : movement.lines[0]?.article ? movement.lines[0].article.code + " - " + movement.lines[0].article.designation : "-"],
      ["Fournisseur", movement.supplier?.name ?? "-"],
      ["Origine", origin],
      ["Magasin de reception", movement.toLocation?.name ?? "-"],
      ["Total attendu", formatNumber(expected)],
      ["Total recu", formatNumber(completed)],
      ["Ecart total", formatNumber(completed - expected)],
      ["Responsable", movement.handledBy ?? movement.receivedBy ?? "-"],
      ["Statut", entryStatusLabel(movement)],
      ["Observation", movement.notes ?? "-"],
      ]
        .map(
          ([label, value]) =>
            '<div><span class="text-gray-500">' +
            escapeHtml(label) +
            '</span><div class="font-semibold mt-1">' +
            escapeHtml(value) +
            "</div></div>",
        )
        .join("") + rows;
  const resolveButton =
    root.querySelector<HTMLButtonElement>("#entryResolveButton");
  if (resolveButton) {
    const canResolve =
      movement.status !== "CANCELLED" &&
      movement.lines.some(
        (line) =>
          Number(line.expectedQuantity ?? 0) > 0 &&
          Number(line.completedQuantity ?? 0) !==
            Number(line.expectedQuantity ?? 0),
      );
    resolveButton.classList.toggle("hidden", !canResolve);
  }
  openModal(root, "entryDetailModal");
}

function entryResolutionRows(movement: StockMovement) {
  return movement.lines.filter((line) => {
    const expected = Number(line.expectedQuantity ?? 0);
    const completed = Number(line.completedQuantity ?? 0);
    return expected > 0 && completed !== expected;
  });
}

function openEntryResolution(root: HTMLElement) {
  const movement = selectedEntryId
    ? latestMovements.find((item) => item.id === selectedEntryId)
    : null;
  if (!movement) {
    showToast(root, "Entree stock introuvable.", "error");
    return;
  }
  const modal = root.querySelector<HTMLElement>("#entryResolutionModal");
  const body = root.querySelector<HTMLTableSectionElement>(
    "#entryResolutionLines",
  );
  if (!modal || !body) return;
  const lines = entryResolutionRows(movement);
  if (!lines.length) {
    showToast(root, "Cette entree n'a plus d'ecart a resoudre.");
    return;
  }
  modal.dataset.entryId = movement.id;
  setText(root, "#entryResolutionTitle", "Resoudre " + movement.reference);
  setText(
    root,
    "#entryResolutionSubtitle",
    "Completer un manquant ou accepter un surplus deja receptionne.",
  );
  body.innerHTML = lines
    .map((line) => {
      const expected = Number(line.expectedQuantity ?? 0);
      const completed = Number(line.completedQuantity ?? 0);
      const gap = expected - completed;
      const isMissing = gap > 0;
      return (
        `<tr data-line-id="${escapeHtml(line.id)}" data-gap="${gap}">` +
        '<td class="px-5 py-4"><div class="font-bold">' +
        escapeHtml(line.article?.designation ?? "-") +
        '</div><div class="text-xs text-gray-500">' +
        escapeHtml(line.article?.code ?? "-") +
        "</div></td>" +
        '<td class="px-5 py-4 text-right">' +
        formatNumber(expected) +
        "</td>" +
        '<td class="px-5 py-4 text-right font-bold">' +
        formatNumber(completed) +
        "</td>" +
        '<td class="px-5 py-4 text-right font-bold ' +
        (isMissing ? "text-warning-700" : "text-success-700") +
        '">' +
        formatNumber(completed - expected) +
        "</td>" +
        '<td class="px-5 py-4">' +
        (isMissing
          ? badge("Completer reception", "warning") +
            '<input type="hidden" class="entry-resolution-action" value="COMPLETE_MISSING">'
          : '<select class="entry-resolution-action h-10 rounded-lg border px-3 text-sm font-semibold"><option value="ACCEPT_SURPLUS">Accepter surplus</option><option value="RETURN_SURPLUS">Retourner surplus</option></select>') +
        "</td>" +
        '<td class="px-5 py-4 text-right"><input class="entry-resolution-quantity w-24 h-10 border rounded-lg px-3 text-right ' +
        (!isMissing ? "bg-gray-50 text-gray-400" : "") +
        `" value="${formatNumber(Math.abs(gap)).replace(/\s/g, "")}" ${isMissing ? "" : "disabled"}></td>` +
        '<td class="px-5 py-4"><input class="entry-resolution-observation w-full h-10 border rounded-lg px-3" placeholder="Observation"></td>' +
        "</tr>"
      );
    })
    .join("");
  body
    .querySelectorAll<HTMLSelectElement>(".entry-resolution-action")
    .forEach((select) => {
      select.onchange = () => {
        const row = select.closest<HTMLTableRowElement>("tr");
        const quantity = row?.querySelector<HTMLInputElement>(
          ".entry-resolution-quantity",
        );
        const returning = select.value === "RETURN_SURPLUS";
        if (quantity) {
          quantity.disabled = !returning;
          quantity.classList.toggle("bg-gray-50", !returning);
          quantity.classList.toggle("text-gray-400", !returning);
        }
      };
    });
  const handledBy = root.querySelector<HTMLInputElement>(
    "#entryResolutionHandledBy",
  );
  if (handledBy) handledBy.value = movement.handledBy ?? movement.receivedBy ?? "";
  const notes = root.querySelector<HTMLInputElement>("#entryResolutionNotes");
  if (notes) notes.value = "";
  openModal(root, "entryResolutionModal");
}

async function submitEntryResolution(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#entryResolutionModal");
  const entryId = modal?.dataset.entryId;
  if (!modal || !entryId) return;
  const rows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>("#entryResolutionLines tr"),
  );
  const lines = rows.map((row) => {
    const action =
      row.querySelector<HTMLInputElement>(".entry-resolution-action")?.value ===
      "ACCEPT_SURPLUS"
        ? "ACCEPT_SURPLUS"
        : "COMPLETE_MISSING";
    return {
      lineId: row.dataset.lineId ?? "",
      action: action as
        | "COMPLETE_MISSING"
        | "ACCEPT_SURPLUS"
        | "RETURN_SURPLUS",
      quantity: toNumber(
        row.querySelector<HTMLInputElement>(".entry-resolution-quantity")
          ?.value ?? "0",
      ),
      observation:
        row
          .querySelector<HTMLInputElement>(".entry-resolution-observation")
          ?.value.trim() || undefined,
      gap: Number(row.dataset.gap ?? 0),
    };
  });
  const invalidMissing = lines.some(
    (line) =>
      line.action === "COMPLETE_MISSING" &&
      (line.quantity <= 0 || line.quantity > line.gap),
  );
  const invalidSurplusReturn = lines.some(
    (line) =>
      line.action === "RETURN_SURPLUS" &&
      (line.quantity <= 0 || line.quantity > Math.abs(line.gap)),
  );
  if (!lines.length || invalidMissing || invalidSurplusReturn) {
    showToast(
      root,
      "Verifie les quantites de resolution avant validation.",
      "error",
    );
    return;
  }
  try {
    const updated = await resolveStockEntryDispute(entryId, {
      handledBy:
        root.querySelector<HTMLInputElement>("#entryResolutionHandledBy")?.value.trim() ||
        undefined,
      notes:
        root.querySelector<HTMLInputElement>("#entryResolutionNotes")?.value.trim() ||
        undefined,
      lines: lines.map(({ lineId, action, quantity, observation }) => ({
        lineId,
        action,
        quantity,
        observation,
      })),
    });
    latestMovements = await getStockMovements().catch(() =>
      latestMovements.map((item) => (item.id === updated.id ? updated : item)),
    );
    latestStockLevels = await getStockLevels().catch(() => latestStockLevels);
    closeModal(root, "entryResolutionModal");
    updateApiBackedViews(root);
    openEntryDetail(root, entryId);
    showToast(root, "Litige entree resolu et stock mis a jour.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Resolution impossible.",
      "error",
    );
  }
}

function entryFilterMatches(movement: StockMovement) {
  if (movement.type !== "ENTRY") return false;
  const isCancelled = movement.status === "CANCELLED";
  const isLitige = entryHasDispute(movement);
  const isRecue = entryIsReceived(movement);

  if (currentEntryFilter === "ALL") return true;
  if (currentEntryFilter === "RECEIVED") return isRecue;
  if (currentEntryFilter === "DISPUTES") return isLitige;
  if (currentEntryFilter === "CANCELLED") return isCancelled;
  return true;
}

function renderEntriesRegistry(root: HTMLElement) {
  const entriesBody = root.querySelector<HTMLElement>("#entrees tbody");
  const entries = latestMovements.filter(
    (movement) => movement.type === "ENTRY",
  );
  const visible = entries.filter(entryFilterMatches);
  if (entriesBody) {
    entriesBody.innerHTML = visible.length
      ? visible.map(entryMovementRow).join("")
      : emptyRow(12, "Aucune entree stock pour ce filtre.");
  }
  setText(
    root,
    "#entriesTodayCount",
    entries.filter((movement) => isToday(movement.date)).length,
  );
  setText(
    root,
    "#entriesReceivedCount",
    entries.filter(entryIsReceived).length,
  );
  setText(
    root,
    "#entriesPartialCount",
    entries.filter(entryHasPartial).length,
  );
  setText(
    root,
    "#entriesIssueCount",
    entries.filter(entryHasDispute).length,
  );
  root
    .querySelectorAll<HTMLElement>("#entrees [data-entry-filter]")
    .forEach((button) => {
      const active = button.dataset.entryFilter === currentEntryFilter;
      button.classList.toggle("bg-accent-50", active);
      button.classList.toggle("text-accent-600", active);
      button.classList.toggle("bg-gray-100", !active);
      button.classList.toggle("text-gray-600", !active);
    });
  window.lucide?.createIcons();
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

function requestForExit(movement: StockMovement) {
  if (movement.type !== "EXIT") return null;
  return (
    latestMovements.find(
      (item) =>
        item.type === "EXIT_REQUEST" && looksLikeGeneratedExit(item, movement),
    ) ??
    movement.sourceRequest ??
    null
  );
}

function materialPdfMovement(movement: StockMovement) {
  return movement.type === "EXIT"
    ? (requestForExit(movement) ?? movement)
    : movement;
}

function materialPdfLinkedExit(movement: StockMovement) {
  return movement.type === "EXIT" ? movement : linkedExitForRequest(movement);
}

function proofRequestForMovement(movement: StockMovement) {
  return movement.type === "EXIT_REQUEST" ? movement : requestForExit(movement);
}

function canUploadSignedProofFor(movement: StockMovement) {
  const proofSource = proofRequestForMovement(movement);
  const linkedExit = proofSource ? linkedExitForRequest(proofSource) : null;
  const preparedEnough =
    proofSource?.status !== "SUBMITTED" || Boolean(linkedExit);
  return Boolean(
    proofSource?.type === "EXIT_REQUEST" &&
    preparedEnough &&
    proofSource.status !== "REJECTED" &&
    proofSource.status !== "CANCELLED" &&
    !proofSource.proofFileName,
  );
}

function visibleExitMovements(movements: StockMovement[]) {
  return movements.filter((movement) => {
    if (movement.type === "EXIT") return true;
    if (movement.type !== "EXIT_REQUEST") return false;
    return !linkedExitForRequest(movement);
  });
}

function exitFilterMatches(movement: StockMovement) {
  const linkedExit = linkedExitForRequest(movement);
  if (currentExitFilter === "ALL")
    return !(movement.type === "EXIT_REQUEST" && linkedExit);
  if (currentExitFilter === "REQUESTED")
    return (
      movement.type === "EXIT_REQUEST" &&
      movement.status === "SUBMITTED" &&
      !linkedExit
    );
  if (currentExitFilter === "PREPARED") {
    const proofSource = proofRequestForMovement(movement);
    return Boolean(
      (movement.type === "EXIT" || movement.status === "PREPARED") &&
      proofSource &&
      !proofSource.proofFileName,
    );
  }
  if (currentExitFilter === "EXIT") return movement.type === "EXIT";
  if (currentExitFilter === "BLOCKED") return movement.status === "REJECTED";
  if (currentExitFilter === "CANCELLED") return movement.status === "CANCELLED";
  return true;
}

function renderExitRegistry(root: HTMLElement) {
  const exitsBody = root.querySelector<HTMLElement>("#sortie tbody");
  const visible =
    visibleExitMovements(latestMovements).filter(exitFilterMatches);
  if (exitsBody) {
    exitsBody.innerHTML = visible.length
      ? visible.map(exitMovementRow).join("")
      : emptyRow(12, "Aucune demande ou sortie stock pour ce filtre.");
  }
  root
    .querySelectorAll<HTMLElement>("#sortie [data-exit-filter]")
    .forEach((button) => {
      const active = button.dataset.exitFilter === currentExitFilter;
      button.classList.toggle("bg-accent-50", active);
      button.classList.toggle("text-accent-600", active);
      button.classList.toggle("bg-gray-100", !active);
      button.classList.toggle("text-gray-600", !active);
    });
  window.lucide?.createIcons();
}
function renderExitRequestDetail(root: HTMLElement, movement: StockMovement) {
  const body = root.querySelector<HTMLElement>("#exitRequestDetailBody");
  const title = root.querySelector<HTMLElement>("#exitRequestDetailTitle");
  const subtitle = root.querySelector<HTMLElement>(
    "#exitRequestDetailSubtitle",
  );
  const prepareButton = root.querySelector<HTMLElement>(
    "#exitRequestPrepareButton",
  );
  const rejectButton = root.querySelector<HTMLElement>(
    "#exitRequestRejectButton",
  );
  const downloadButton = root.querySelector<HTMLElement>(
    "#exitRequestDownloadButton",
  );
  if (!body) return;
  const linkedExit = linkedExitForRequest(movement);
  const sourceRequest = requestForExit(movement);
  const proofSource = proofRequestForMovement(movement);
  const displayedRequest =
    movement.type === "EXIT"
      ? (sourceRequest ?? proofSource ?? movement)
      : movement;
  const totalRequested = displayedRequest.lines.reduce(
    (sum, line) => sum + Number(line.requestedQuantity ?? 0),
    0,
  );
  const totalCompleted = movement.lines.reduce(
    (sum, line) => sum + Number(line.completedQuantity ?? 0),
    0,
  );
  const rows = movement.lines
    .map((line, index) => {
      const available = latestStockLevels
        .filter(
          (level) =>
            level.article.id === line.articleId &&
            (!movement.fromLocationId ||
              level.location.id === movement.fromLocationId),
        )
        .reduce((sum, level) => sum + Number(level.quantity ?? 0), 0);
      const requested = Number(line.requestedQuantity ?? 0);
      const shortageClass =
        requested > available && movement.status === "SUBMITTED"
          ? " text-error-700"
          : "";
      return `<tr>
      <td class="px-5 py-4 font-bold text-gray-400">${index + 1}</td>
      <td class="px-5 py-4"><div class="font-bold">${escapeHtml(line.article?.designation ?? "-")}</div><div class="text-xs text-gray-500">${escapeHtml(line.article?.code ?? "-")}</div></td>
      <td class="px-5 py-4 text-right font-bold">${formatNumber(requested)}</td>
      <td class="px-5 py-4 text-right font-bold${shortageClass}">${formatNumber(available)}</td>
      <td class="px-5 py-4 text-right">${formatNumber(line.completedQuantity ?? 0)}</td>
      <td class="px-5 py-4">${escapeHtml(line.observation ?? "-")}</td>
    </tr>`;
    })
    .join("");
  const canPrepareNow =
    movement.type === "EXIT_REQUEST" &&
    movement.status === "SUBMITTED" &&
    canPrepareMaterialRequests();
  const canRejectNow = canPrepareNow;
  if (title) title.textContent = movement.reference;
  if (subtitle)
    subtitle.textContent =
      movement.type === "EXIT_REQUEST"
        ? "Demande de materiel a preparer ou a suivre."
        : "Sortie stock deja enregistree" +
          (sourceRequest
            ? " depuis la demande " + sourceRequest.reference + "."
            : ".");
  if (prepareButton) {
    prepareButton.classList.toggle("hidden", !canPrepareNow);
    prepareButton.dataset.action = `prepareExitFromRequest('${movement.id}')`;
  }
  if (rejectButton) {
    rejectButton.classList.toggle("hidden", !canRejectNow);
    rejectButton.dataset.action = `openExitRequestRejection('${movement.id}')`;
  }
  const canDownloadPdf =
    movement.type === "EXIT" ||
    (movement.type === "EXIT_REQUEST" &&
      movement.status !== "SUBMITTED" &&
      movement.status !== "REJECTED" &&
      movement.status !== "CANCELLED");
  const canUploadProof = canUploadSignedProofFor(movement);
  const hasProof = Boolean(proofSource?.proofFileName || proofSource?.proofFileKey);
  if (downloadButton) {
    downloadButton.classList.toggle("hidden", !canDownloadPdf);
    downloadButton.dataset.action = `downloadPreparedMaterialPdf('${movement.id}')`;
  }
  const sourceReference =
    sourceRequest?.reference ??
    (movement.type === "EXIT_REQUEST" ? movement.reference : "-");
  const ficheStatus = hasProof
    ? "Signée uploadée"
    : canDownloadPdf
      ? "À signer"
      : "En attente";
  const ficheStatusClass = hasProof
    ? "text-success-700"
    : canDownloadPdf
      ? "text-warning-700"
      : "text-gray-500";
  const preparedPanel = canDownloadPdf
    ? `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="rounded-xl border-2 border-accent-300 bg-accent-50 p-5 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white"><i data-lucide="file-down" class="w-5 h-5"></i></div>
          <div>
            <div class="text-xs font-bold uppercase tracking-wide text-accent-700">Etape 1 - apres preparation</div>
            <div class="mt-1 font-bold text-gray-900">Telecharger la fiche de sortie</div>
            <p class="mt-1 text-sm text-gray-700">Genere la fiche preparee puis imprime-la pour recueillir les signatures.</p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" data-action="downloadPreparedMaterialPdf('${movement.id}')" class="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 font-semibold text-white hover:bg-accent-500"><i data-lucide="download" class="w-4 h-4"></i>Telecharger la fiche</button>
          ${hasProof && proofSource ? `<button type="button" data-action="viewSignedMaterialProof('${proofSource.id}')" class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"><i data-lucide="file-check" class="w-4 h-4"></i>Voir la preuve</button>` : ""}
        </div>
      </div>
      <div class="rounded-xl border-2 border-accent-300 bg-white p-5 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white"><i data-lucide="file-up" class="w-5 h-5"></i></div>
          <div>
            <div class="text-xs font-bold uppercase tracking-wide text-accent-700">Etape 2 - apres signature</div>
            <div class="mt-1 font-bold text-gray-900">Uploader la fiche de sortie signee</div>
            <p class="mt-1 text-sm text-gray-700">Ajoute le PDF ou l image signee dans la fiche pour cloturer la demande.</p>
          </div>
        </div>
        ${
          canUploadProof && proofSource
            ? `<div class="mt-4 space-y-2">
          <input id="signedProof-${escapeHtml(proofSource.id)}" type="file" accept=".pdf,image/*" class="form-input w-full" />
          <button type="button" data-action="uploadSignedMaterialProof('${proofSource.id}')" class="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-accent-300 bg-accent-50 px-4 py-2.5 font-semibold text-accent-700 hover:bg-accent-100"><i data-lucide="upload" class="w-4 h-4"></i>Uploader la fiche signee</button>
        </div>`
            : hasProof && proofSource
              ? `<div class="mt-4 flex items-center gap-2 rounded-lg border border-success-100 bg-success-50 px-3 py-2 text-sm font-semibold text-success-700"><i data-lucide="check" class="w-4 h-4 shrink-0"></i><span class="min-w-0 truncate">${escapeHtml(proofSource.proofFileName ?? "Preuve ajoutee")}</span></div>`
              : `<div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">Fiche signee deja transmise ou action indisponible pour cette demande.</div>`
        }
      </div>
    </div>`
    : "";

  body.innerHTML = `
    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div class="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        <div class="p-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge ${movement.type === "EXIT" ? "success" : "warning"}">${escapeHtml(movementStatusLabel(movement))}</span>
            <span class="text-sm text-gray-500">${formatDate(movement.date)}</span>
          </div>
          <div class="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div><span class="detail-label">Demande source</span> <strong>${escapeHtml(sourceReference)}</strong></div>
            <div><span class="detail-label">Fiche signée</span> <strong class="${ficheStatusClass}">${ficheStatus}</strong></div>
            <div><span class="detail-label">Projet / chantier</span> <strong>${escapeHtml(displayedRequest.project?.name ?? movement.project?.name ?? movement.toLocation?.name ?? "-")}</strong></div>
            <div><span class="detail-label">Magasin source</span> <strong>${escapeHtml(movement.fromLocation?.name ?? displayedRequest.fromLocation?.name ?? "-")}</strong></div>
          </div>
        </div>
        <div class="border-t bg-gray-50 p-5 md:border-l md:border-t-0">
          <div class="grid gap-3 text-sm">
            <div><span class="detail-label">Demandeur / bénéficiaire</span> <strong>${escapeHtml(displayedRequest.requestedBy ?? movement.receivedBy ?? "-")}</strong></div>
            <div><span class="detail-label">Sorti par</span> <strong>${escapeHtml(movement.handledBy ?? "-")}</strong></div>
            <div><span class="detail-label">Transporté par</span> <strong>${escapeHtml(movement.deliveredBy ?? "-")}</strong></div>
            <div><span class="detail-label">Remis à</span> <strong>${escapeHtml(movement.receivedBy ?? displayedRequest.receivedBy ?? displayedRequest.requestedBy ?? "-")}</strong></div>
          </div>
        </div>
      </div>
    </div>
    ${movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED" ? `<div class="rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm text-gray-700"><div class="font-bold text-accent-700 mb-1">Demande transmise au stock</div>En attente de préparation par le gestionnaire stock.</div>` : ""}
    ${movement.type === "EXIT_REQUEST" && movement.status === "REJECTED" ? `<div class="rounded-xl border border-error-100 bg-error-50 p-4 text-sm text-gray-700"><div class="font-bold text-error-700 mb-1">Demande refusee</div><div>${escapeHtml(movement.rejectionReason ?? "Motif non renseigne")}</div><div class="mt-2 text-xs text-gray-500">${escapeHtml(movement.rejectedBy ? "Refusee par " + movement.rejectedBy : "")}${movement.rejectedAt ? " - " + escapeHtml(formatDate(movement.rejectedAt)) : ""}</div></div>` : ""}
    ${preparedPanel}
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-5 py-4 bg-gray-50 border-b"><h3 class="font-bold">Articles demandes</h3><p class="text-sm text-gray-500 mt-1">Le stock disponible est calcule sur le magasin source de la demande.</p></div>
      <div class="overflow-x-auto"><table class="w-full min-w-[820px] text-sm"><thead class="bg-gray-50 text-xs uppercase text-gray-500"><tr><th class="px-5 py-3 text-left">N</th><th class="px-5 py-3 text-left">Article</th><th class="px-5 py-3 text-right">Demandee</th><th class="px-5 py-3 text-right">Dispo</th><th class="px-5 py-3 text-right">Remise</th><th class="px-5 py-3 text-left">Observation</th></tr></thead><tbody class="divide-y">${rows || emptyRow(6, "Aucune ligne sur cette demande.")}</tbody></table></div>
    </div>
    ${movement.notes ? `<div class="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700"><div class="font-bold mb-1">Note</div>${escapeHtml(movement.notes)}</div>` : ""}`;
  window.lucide?.createIcons();
}

function openPreparedExitForAction(
  root: HTMLElement,
  action: "download" | "upload",
) {
  const movement = latestMovements.find(
    (item) =>
      (item.type === "EXIT" || item.status === "PREPARED") &&
      (action === "download" || canUploadSignedProofFor(item)),
  );
  if (!movement) {
    showToast(
      root,
      action === "download"
        ? "Aucune sortie preparee disponible pour le moment."
        : "Aucune fiche preparee en attente de signature.",
      "error",
    );
    return;
  }
  openExitRequestDetail(root, movement.id);
}

function openExitRequestDetail(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement) {
    showToast(root, "Demande introuvable dans le registre charge.", "error");
    return;
  }
  renderExitRequestDetail(root, movement);
  openModal(root, "exitRequestDetailModal");
}

async function prepareExitFromRequest(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  const first = movement?.lines[0];
  if (!movement || !first) {
    showToast(root, "Impossible de preparer cette demande.", "error");
    return;
  }
  if (!canPrepareMaterialRequests() || movement.status !== "SUBMITTED") {
    renderExitRequestDetail(root, movement);
    openModal(root, "exitRequestDetailModal");
    showToast(
      root,
      movement.status === "SUBMITTED"
        ? "Demande transmise au stock. En attente de preparation."
        : "Cette demande est deja preparee ou terminee.",
    );
    return;
  }
  closeModal(root, "exitRequestDetailModal");
  await openMaterialRequestPreparation(root, id);
}
function exitStatusTone(
  movement: StockMovement,
): "success" | "warning" | "error" | "gray" {
  if (movement.type === "EXIT") return "success";
  if (movement.status === "COMPLETED") return "success";
  if (movement.status === "PREPARED") return "warning";
  if (movement.status === "REJECTED" || movement.status === "CANCELLED")
    return "error";
  return "warning";
}

function exitMenuItem(icon: string, label: string, action: string) {
  return `<button class="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50" data-action="${action}"><i data-lucide="${icon}" class="h-4 w-4 text-gray-500"></i><span>${label}</span></button>`;
}

function exitActionItems(movement: StockMovement) {
  const actions: string[] = [];
  const proofSource = proofRequestForMovement(movement);
  actions.push(
    exitMenuItem("eye", "Voir", `openExitRequestDetail('${movement.id}')`),
  );
  if (
    movement.type === "EXIT_REQUEST" &&
    movement.status === "SUBMITTED" &&
    canPrepareMaterialRequests()
  ) {
    actions.push(
      exitMenuItem(
        "package-check",
        "Preparer",
        `prepareExitFromRequest('${movement.id}')`,
      ),
    );
    actions.push(
      exitMenuItem(
        "ban",
        "Refuser",
        `openExitRequestRejection('${movement.id}')`,
      ),
    );
  }
  if (
    movement.type === "EXIT" ||
    (movement.type === "EXIT_REQUEST" && movement.status !== "SUBMITTED")
  ) {
    actions.push(
      exitMenuItem(
        "download",
        "Télécharger fiche",
        `downloadPreparedMaterialPdf('${movement.id}')`,
      ),
    );
  }
  if (canUploadSignedProofFor(movement)) {
    actions.push(
      exitMenuItem(
        "upload",
        "Uploader fiche signée",
        `openExitRequestDetail('${movement.id}')`,
      ),
    );
  }
  if (proofSource?.proofFileName) {
    actions.push(
      exitMenuItem(
        "file-check",
        "Voir preuve",
        `viewSignedMaterialProof('${proofSource.id}')`,
      ),
    );
  }
  return actions;
}

function closeFloatingExitActions(root: HTMLElement) {
  root.querySelector<HTMLElement>("[data-floating-exit-menu]")?.remove();
}

function toggleFloatingExitActions(
  root: HTMLElement,
  movementId: string,
  trigger: HTMLElement,
) {
  const existing = root.querySelector<HTMLElement>("[data-floating-exit-menu]");
  if (existing?.dataset.menuFor === movementId) {
    existing.remove();
    return;
  }
  existing?.remove();

  const movement = latestMovements.find((item) => item.id === movementId);
  if (!movement) return;

  const menu = document.createElement("div");
  menu.dataset.floatingExitMenu = "true";
  menu.dataset.menuFor = movementId;
  menu.className =
    "fixed z-[10000] min-w-[230px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-sm shadow-2xl";
  menu.innerHTML = exitActionItems(movement).join("");
  root.appendChild(menu);

  const triggerRect = trigger.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const left = Math.min(
    Math.max(12, triggerRect.right - menuRect.width),
    window.innerWidth - menuRect.width - 12,
  );
  const preferredTop = triggerRect.bottom + 8;
  const top =
    preferredTop + menuRect.height > window.innerHeight
      ? Math.max(12, triggerRect.top - menuRect.height - 8)
      : preferredTop;

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  window.lucide?.createIcons();
}

function exitActionsMenu(movement: StockMovement) {
  return `<button class="icon-btn" type="button" aria-label="Actions" data-action="toggleExitActions('${movement.id}')"><i data-lucide="more-vertical" class="h-4 w-4"></i></button>`;
}

function exitMovementRow(movement: StockMovement) {
  const first = movement.lines[0];
  const articleCount = movement.lines.length;
  const requested = movement.lines.reduce(
    (sum, line) => sum + Number(line.requestedQuantity ?? 0),
    0,
  );
  const completed = movement.lines.reduce(
    (sum, line) => sum + Number(line.completedQuantity ?? 0),
    0,
  );
  const quantity =
    movement.type === "EXIT_REQUEST" ? requested : completed || requested;
  const available = articleCount === 1 && first?.articleId
    ? latestStockLevels
        .filter(
          (level) =>
            level.article.id === first.articleId &&
            (!movement.fromLocationId ||
              level.location.id === movement.fromLocationId),
        )
        .reduce((sum, level) => sum + Number(level.quantity ?? 0), 0)
    : null;
  const linkedExit = linkedExitForRequest(movement);
  const sourceRequest = requestForExit(movement);
  const typeLabel =
    movement.type === "EXIT_REQUEST"
      ? linkedExit
        ? "Demande preparee"
        : "Demande"
      : "Sortie reelle";
  const project = movement.project?.name ?? movement.toLocation?.name ?? "-";
  const beneficiary = movement.requestedBy ?? movement.receivedBy ?? "-";
  const handledBy = movement.handledBy ?? movement.fromLocation?.name ?? "-";
  const transportedBy = movement.deliveredBy ?? "-";
  const deliveredTo = movement.receivedBy ?? movement.requestedBy ?? "-";
  const availableText =
    articleCount > 1 ? "Voir detail" : available === null ? "-" : formatNumber(available);
  const availableClass =
    available !== null &&
    movement.status === "SUBMITTED" &&
    quantity > available
      ? " text-error-700"
      : "";
  const linkedInfo = linkedExit
    ? `<div class="text-xs text-success-700 font-normal">Sortie : ${escapeHtml(linkedExit.reference)}</div>`
    : sourceRequest
      ? `<div class="text-xs text-primary-700 font-normal">Demande source : ${escapeHtml(sourceRequest.reference)}</div>`
      : "";
  return (
    "<tr>" +
    '<td class="px-5 py-4 font-bold">' +
    escapeHtml(movement.reference) +
    '<div class="text-xs text-gray-500 font-normal">' +
    typeLabel +
    "</div>" +
    linkedInfo +
    "</td>" +
    '<td class="px-5 py-4">' +
    formatDate(movement.date) +
    "</td>" +
    '<td class="px-5 py-4">' +
    movementLinesPreview(movement, "exit") +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold">' +
    formatNumber(quantity) +
    "</td>" +
    '<td class="px-5 py-4 text-right font-bold' +
    availableClass +
    '">' +
    availableText +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(project) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(beneficiary) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(handledBy) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(transportedBy) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(deliveredTo) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(movementStatusLabel(movement), exitStatusTone(movement)) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    exitActionsMenu(movement) +
    "</td>" +
    "</tr>"
  );
}

function returnTransferRow(movement: StockMovement) {
  const first = movement.lines[0];
  const origin =
    movement.type === "RETURN"
      ? (movement.deliveredBy ?? "Sortie retournee")
      : (movement.fromLocation?.name ?? "-");
  const destination = movement.toLocation?.name ?? "-";
  const state = first?.observation || movement.notes || "-";
  const label = movement.type === "RETURN" ? "Retour" : "Transfert";
  const statusLabel =
    movement.type === "RETURN"
      ? movement.status === "COMPLETED"
        ? "Traite"
        : "A controler"
      : movement.status === "COMPLETED"
        ? "Transfere"
        : movement.status;
  const tone: "success" | "warning" | "gray" =
    movement.status === "COMPLETED"
      ? "success"
      : movement.status === "PREPARED"
        ? "warning"
        : "gray";
  return (
    "<tr>" +
    '<td class="px-5 py-4 font-bold">' +
    escapeHtml(movement.reference) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(label) +
    "</td>" +
    '<td class="px-5 py-4">' +
    movementLinesPreview(movement, "exit") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(origin) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(destination) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(state) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(statusLabel, tone) +
    "</td>" +
    '<td class="px-5 py-4 text-right">' +
    actionEyeFor(`openReturnTransferDetail('${movement.id}')`) +
    "</td>" +
    "</tr>"
  );
}

function returnTransferDetailStatus(movement: StockMovement) {
  if (movement.type === "RETURN") {
    return movement.status === "COMPLETED" ? "Traite" : "A controler";
  }
  return movement.status === "COMPLETED" ? "Transfere" : movement.status;
}

function returnTransferDetailTone(movement: StockMovement): "success" | "warning" | "gray" {
  if (movement.status === "COMPLETED") return "success";
  if (movement.status === "PREPARED") return "warning";
  return "gray";
}

function returnLineBreakdown(
  line: StockMovement["lines"][number],
  movement?: StockMovement,
) {
  const text = line.observation ?? "";
  const readFrom = (source: string, label: string) => {
    const match = source.match(new RegExp(label + "\\s+(\\d+(?:[.,]\\d+)?)", "i"));
    return match ? Number(match[1].replace(",", ".")) : 0;
  };
  const read = (label: string) => readFrom(text, label);
  const structured = /Retour:\s*total/i.test(text);
  const fallbackTotal = Number(line.completedQuantity ?? 0);
  let good = read("bon etat");
  let damaged = read("endommage");
  let scrap = read("rebut");
  let pending = read("a controler");
  const parsedTotal = read("total");
  for (const section of text.split("|").map((part) => part.trim())) {
    if (!/^Controle retour:/i.test(section)) continue;
    const controlled = readFrom(section, "sur a controler");
    const accepted = readFrom(section, "quantite acceptee");
    if (/Reintegre au stock/i.test(section)) {
      good += accepted || controlled;
    } else if (/Rebut \/ inutilisable/i.test(section)) {
      scrap += controlled;
    } else if (/A reparer \/ anomalie/i.test(section)) {
      damaged += controlled;
    }
    pending = Math.max(0, pending - controlled);
  }
  return {
    total: parsedTotal || fallbackTotal,
    good: structured ? good : movement?.status === "COMPLETED" ? fallbackTotal : 0,
    damaged,
    scrap,
    pending: structured ? pending : movement?.status === "PREPARED" ? fallbackTotal : 0,
    structured,
  };
}

function returnLineDisplayObservation(line: StockMovement["lines"][number]) {
  return (line.observation ?? "")
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part && !/^Retour:/i.test(part) && !/^(bon etat|endommage|rebut|a controler)\s+/i.test(part))
    .join(" | ");
}

function openReturnTransferDetail(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement || (movement.type !== "RETURN" && movement.type !== "TRANSFER")) {
    showToast(root, "Retour ou transfert introuvable dans le registre charge.", "error");
    return;
  }
  selectedReturnTransferId = id;
  const kind = movement.type === "RETURN" ? "Fiche retour" : "Fiche transfert";
  const title = movement.type === "RETURN" ? "Retour stock" : "Transfert stock";
  const source = movement.sourceRequest ?? latestMovements.find((item) => item.id === movement.sourceRequestId);
  const sourceByArticle = new Map(
    returnSourceLines(source).map((line) => [line.articleId, line]),
  );
  const total = movement.lines.reduce(
    (sum, line) => sum + Number(line.completedQuantity ?? 0),
    0,
  );
  const rows = movement.lines
    .map(
      (line, index) => {
        const sourceQuantity = sourceByArticle.get(line.articleId)?.completedQuantity;
        const breakdown = returnLineBreakdown(line, movement);
        const observation = returnLineDisplayObservation(line) || movement.notes || "-";
        return `<tr>
          <td class="px-5 py-4 font-bold text-gray-400">${index + 1}</td>
          <td class="px-5 py-4"><div class="font-bold">${escapeHtml(line.article?.designation ?? "-")}</div><div class="text-xs text-gray-500">${escapeHtml(line.article?.code ?? "-")} - ${escapeHtml(line.article?.unit ?? "U")}</div></td>
          ${
            movement.type === "RETURN"
              ? '<td class="px-5 py-4 text-right font-semibold">' +
                (sourceQuantity === undefined ? "-" : formatNumber(sourceQuantity)) +
                "</td>"
              : ""
          }
          <td class="px-5 py-4 text-right font-bold">${formatNumber(breakdown.total)}</td>
          ${
            movement.type === "RETURN"
              ? '<td class="px-5 py-4 text-right">' +
                formatNumber(breakdown.good) +
                '</td><td class="px-5 py-4 text-right">' +
                formatNumber(breakdown.damaged) +
                '</td><td class="px-5 py-4 text-right">' +
                formatNumber(breakdown.scrap) +
                '</td><td class="px-5 py-4 text-right">' +
                formatNumber(breakdown.pending) +
                "</td>"
              : ""
          }
          <td class="px-5 py-4">${escapeHtml(observation)}</td>
        </tr>`;
      },
    )
    .join("");
  setText(root, "#returnTransferDetailKind", kind);
  setText(root, "#returnTransferDetailTitle", movement.reference);
  setText(
    root,
    "#returnTransferDetailSubtitle",
    title + " en lecture seule.",
  );
  const body = root.querySelector<HTMLElement>("#returnTransferDetailBody");
  if (body) {
    const sourceLine =
      movement.type === "RETURN"
        ? `<div><span class="detail-label">Sortie source</span> <strong>${escapeHtml(source?.reference ?? "-")}</strong></div>`
        : `<div><span class="detail-label">Origine</span> <strong>${escapeHtml(movement.fromLocation?.name ?? "-")}</strong></div>`;
    body.innerHTML = `
      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div class="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <div class="p-5">
            <div class="flex flex-wrap items-center gap-2">
              ${badge(returnTransferDetailStatus(movement), returnTransferDetailTone(movement))}
              <span class="text-sm text-gray-500">${formatDate(movement.date)}</span>
            </div>
            <div class="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div><span class="detail-label">Reference</span> <strong>${escapeHtml(movement.reference)}</strong></div>
              <div><span class="detail-label">Type</span> <strong>${escapeHtml(movement.type === "RETURN" ? "Retour" : "Transfert")}</strong></div>
              ${sourceLine}
              <div><span class="detail-label">Destination</span> <strong>${escapeHtml(movement.toLocation?.name ?? "-")}</strong></div>
              <div><span class="detail-label">Total articles</span> <strong>${formatNumber(movement.lines.length)} article${movement.lines.length > 1 ? "s" : ""}</strong></div>
              <div><span class="detail-label">${movement.type === "RETURN" ? "Quantite retournee" : "Quantite totale"}</span> <strong>${formatNumber(total)}</strong></div>
            </div>
          </div>
          <div class="border-t bg-gray-50 p-5 md:border-l md:border-t-0">
            <div class="grid gap-3 text-sm">
              <div><span class="detail-label">Responsable stock</span> <strong>${escapeHtml(movement.handledBy ?? "-")}</strong></div>
              <div><span class="detail-label">Transporte / ramene par</span> <strong>${escapeHtml(movement.deliveredBy ?? "-")}</strong></div>
              <div><span class="detail-label">Receptionne par</span> <strong>${escapeHtml(movement.receivedBy ?? "-")}</strong></div>
              <div><span class="detail-label">Statut</span> <strong>${escapeHtml(returnTransferDetailStatus(movement))}</strong></div>
            </div>
          </div>
        </div>
      </div>
      <div class="border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 bg-gray-50 border-b"><h3 class="font-bold">Articles ${movement.type === "RETURN" ? "retournes" : "transferes"}</h3><p class="text-sm text-gray-500 mt-1">Detail des lignes du bon.</p></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[1120px] text-sm"><thead class="bg-gray-50 text-xs uppercase text-gray-500"><tr><th class="px-5 py-3 text-left">N</th><th class="px-5 py-3 text-left">Article</th>${movement.type === "RETURN" ? '<th class="px-5 py-3 text-right">Quantite sortie</th>' : ""}<th class="px-5 py-3 text-right">${movement.type === "RETURN" ? "Quantite retournee" : "Quantite"}</th>${movement.type === "RETURN" ? '<th class="px-5 py-3 text-right">Bon etat</th><th class="px-5 py-3 text-right">Endommage</th><th class="px-5 py-3 text-right">Rebut</th><th class="px-5 py-3 text-right">A controler</th>' : ""}<th class="px-5 py-3 text-left">Observation</th></tr></thead><tbody class="divide-y">${rows || emptyRow(movement.type === "RETURN" ? 9 : 4, "Aucune ligne sur ce bon.")}</tbody></table></div>
      </div>
      ${movement.notes ? `<div class="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700"><div class="font-bold mb-1">Observation generale</div>${escapeHtml(movement.notes)}</div>` : ""}`;
  }
  const controlButton = root.querySelector<HTMLButtonElement>("#returnControlButton");
  if (controlButton) {
    const canControl =
      movement.type === "RETURN" &&
      movement.status === "PREPARED" &&
      movement.lines.some((line) => returnLineBreakdown(line, movement).pending > 0);
    controlButton.classList.toggle("hidden", !canControl);
  }
  openModal(root, "returnTransferDetailModal");
}

function returnControlDecisionLabel(decision: string) {
  if (decision === "REINTEGRATE") return "Reintegrer au stock";
  if (decision === "DISCARD") return "Rebut / inutilisable";
  if (decision === "REPAIR") return "A reparer / anomalie";
  return decision;
}

function refreshReturnControlLines(root: HTMLElement) {
  const rows = Array.from(
    root.querySelectorAll<HTMLTableRowElement>("#returnControlLines .return-control-line"),
  );
  rows.forEach((row) => {
    const decision = row.querySelector<HTMLSelectElement>(".return-control-decision")?.value ?? "REINTEGRATE";
    const quantity = row.querySelector<HTMLInputElement>(".return-control-accepted");
    const returned = Number(row.dataset.returnedQuantity ?? "0");
    if (!quantity) return;
    if (decision === "REINTEGRATE") {
      quantity.disabled = false;
      quantity.max = String(returned);
      if (!quantity.value || Number(quantity.value) <= 0) {
        quantity.value = String(returned);
      }
      quantity.classList.remove("bg-gray-50");
    } else {
      quantity.value = "0";
      quantity.disabled = true;
      quantity.classList.add("bg-gray-50");
    }
  });
}

function openReturnControl(root: HTMLElement) {
  const movement = selectedReturnTransferId
    ? latestMovements.find((item) => item.id === selectedReturnTransferId)
    : null;
  if (!movement || movement.type !== "RETURN" || movement.status !== "PREPARED") {
    showToast(root, "Ce retour ne peut pas etre controle.", "error");
    return;
  }
  const source = movement.sourceRequest ?? latestMovements.find((item) => item.id === movement.sourceRequestId);
  const sourceByArticle = new Map(
    returnSourceLines(source).map((line) => [line.articleId, line]),
  );
  const body = root.querySelector<HTMLTableSectionElement>("#returnControlLines");
  if (!body) return;
  const pendingLines = movement.lines.filter((line) => returnLineBreakdown(line, movement).pending > 0);
  if (!pendingLines.length) {
    showToast(root, "Ce retour n'a plus de quantite a controler.");
    return;
  }
  body.innerHTML = pendingLines
    .map((line) => {
      const returned = returnLineBreakdown(line, movement).pending;
      const sourceQuantity = sourceByArticle.get(line.articleId)?.completedQuantity;
      return `<tr class="return-control-line" data-line-id="${escapeHtml(line.id)}" data-returned-quantity="${returned}">
        <td class="px-5 py-4"><div class="font-bold">${escapeHtml(line.article?.designation ?? "-")}</div><div class="text-xs text-gray-500">${escapeHtml(line.article?.code ?? "-")} - ${escapeHtml(line.article?.unit ?? "U")}</div></td>
        <td class="px-5 py-4 text-right font-semibold">${sourceQuantity === undefined ? "-" : formatNumber(sourceQuantity)}</td>
        <td class="px-5 py-4 text-right font-bold">${formatNumber(returned)}</td>
        <td class="px-5 py-4"><select class="return-control-decision w-full h-10 border rounded-lg px-3"><option value="REINTEGRATE">Reintegrer au stock</option><option value="DISCARD">Rebut / inutilisable</option><option value="REPAIR">A reparer / anomalie</option></select></td>
        <td class="px-5 py-4 text-right"><input type="number" min="0" max="${returned}" value="${returned}" class="return-control-accepted w-28 h-10 border rounded-lg px-3 text-right"></td>
        <td class="px-5 py-4"><input class="return-control-observation w-full h-10 border rounded-lg px-3" placeholder="Observation de controle"></td>
      </tr>`;
    })
    .join("");
  setText(root, "#returnControlTitle", movement.reference);
  setText(
    root,
    "#returnControlSubtitle",
    "Controle du retour avant traitement final.",
  );
  const handledBy = root.querySelector<HTMLInputElement>("#returnControlHandledBy");
  const notes = root.querySelector<HTMLInputElement>("#returnControlNotes");
  if (handledBy) handledBy.value = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "";
  if (notes) notes.value = "";
  root
    .querySelectorAll<HTMLSelectElement>("#returnControlLines .return-control-decision")
    .forEach((select) => {
      select.onchange = () => refreshReturnControlLines(root);
    });
  refreshReturnControlLines(root);
  openModal(root, "returnControlModal");
}

async function submitReturnControl(root: HTMLElement) {
  const movement = selectedReturnTransferId
    ? latestMovements.find((item) => item.id === selectedReturnTransferId)
    : null;
  if (!movement || movement.type !== "RETURN") {
    showToast(root, "Retour stock introuvable.", "error");
    return;
  }
  const rows = Array.from(
    root.querySelectorAll<HTMLTableRowElement>("#returnControlLines .return-control-line"),
  );
  const lines = rows.map((row) => {
    const decision =
      row.querySelector<HTMLSelectElement>(".return-control-decision")?.value ??
      "REINTEGRATE";
    const acceptedQuantity =
      toNumber(row.querySelector<HTMLInputElement>(".return-control-accepted")?.value ?? "0") ?? 0;
    return {
      lineId: row.dataset.lineId ?? "",
      decision: decision as "REINTEGRATE" | "DISCARD" | "REPAIR",
      acceptedQuantity,
      observation:
        row.querySelector<HTMLInputElement>(".return-control-observation")?.value.trim() ||
        undefined,
      returnedQuantity: Number(row.dataset.returnedQuantity ?? "0"),
    };
  });
  if (
    !lines.length ||
    lines.some(
      (line) =>
        !line.lineId ||
        !["REINTEGRATE", "DISCARD", "REPAIR"].includes(line.decision) ||
        line.acceptedQuantity < 0 ||
        line.acceptedQuantity > line.returnedQuantity ||
        (line.decision === "REINTEGRATE" && line.acceptedQuantity <= 0),
    )
  ) {
    showToast(root, "Controle invalide : verifie les decisions et quantites acceptees.", "error");
    return;
  }
  try {
    await controlStockReturn(movement.id, {
      handledBy:
        root.querySelector<HTMLInputElement>("#returnControlHandledBy")?.value.trim() ||
        undefined,
      notes:
        root.querySelector<HTMLInputElement>("#returnControlNotes")?.value.trim() ||
        undefined,
      lines: lines.map(({ returnedQuantity: _returnedQuantity, ...line }) => line),
    });
    const [movements, stockLevels] = await Promise.all([
      getStockMovements(),
      getStockLevels().catch(() => latestStockLevels),
    ]);
    latestMovements = movements;
    latestStockLevels = stockLevels;
    closeModal(root, "returnControlModal");
    updateApiBackedViews(root);
    openReturnTransferDetail(root, movement.id);
    showToast(root, "Retour controle et traite.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Controle du retour impossible.",
      "error",
    );
  }
}

function fillSelect(
  select: HTMLSelectElement | undefined,
  options: string,
  placeholder?: string,
) {
  if (!select) return;
  select.innerHTML = placeholder ? option("", placeholder) + options : options;
}

function selectedText(select: HTMLSelectElement | undefined) {
  if (!select?.value) return undefined;
  return select.selectedOptions[0]?.textContent?.trim() || undefined;
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

function setSelectValueOrText(
  select: HTMLSelectElement | undefined,
  id: string | null | undefined,
  label: string | null | undefined,
  placeholder: string,
) {
  if (!select) return;
  if (id && Array.from(select.options).some((item) => item.value === id)) {
    select.value = id;
    return;
  }
  setSelectToText(select, label || placeholder);
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
  const theoretical = Number(level?.quantity ?? 0);
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
  if (inputs[0]) inputs[0].value = String(theoretical);
  if (inputs[1]) inputs[1].value = String(theoretical);
  if (inputs[2]) inputs[2].value = "0";
  if (inputs[3]) inputs[3].value = "0";
  inputs.slice(0, 4).forEach((input) => {
    input.type = "number";
    input.min = "0";
    input.oninput = () => updateCountSummary(modal);
  });
  const textarea = modal.querySelector<HTMLTextAreaElement>("textarea");
  if (textarea) textarea.value = "";
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
  if (counted !== good + repair + out) {
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
  const modal = root.querySelector<HTMLElement>("#entryModal");
  if (!modal) return;
  const [articles, suppliers, locations, users] = await Promise.all([
    getArticles().catch(() => []),
    getSuppliers().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => []),
  ]);
  latestArticles = articles;
  latestSuppliers = suppliers;
  latestLocations = locations;
  const supplierSelect =
    modal.querySelector<HTMLSelectElement>("#entrySupplierSelect");
  const originSelect =
    modal.querySelector<HTMLSelectElement>("#entryOriginSelect");
  const locationSelect =
    modal.querySelector<HTMLSelectElement>("#entryLocationSelect");
  const handledBySelect =
    modal.querySelector<HTMLSelectElement>("#entryHandledBySelect");
  const receivedBySelect =
    modal.querySelector<HTMLSelectElement>("#entryReceivedBySelect");
  const previousSupplierId = supplierSelect?.value ?? "";
  const previousLocationId = locationSelect?.value ?? "";
  const previousHandledBy = handledBySelect?.value ?? "";
  const previousReceivedBy = receivedBySelect?.value ?? "";

  fillSelect(
    supplierSelect ?? undefined,
    suppliers.map((supplier) => option(supplier.id, supplier.name)).join(""),
    "Selectionner fournisseur",
  );
  if (supplierSelect && previousSupplierId) supplierSelect.value = previousSupplierId;
  const stockLocations = locations.filter((location) =>
    ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE"].includes(
      location.type.toUpperCase(),
    ),
  );
  fillSelect(
    locationSelect ?? undefined,
    stockLocations
      .map((location) => option(location.id, location.name))
      .join(""),
    "Selectionner magasin",
  );
  if (locationSelect && previousLocationId) locationSelect.value = previousLocationId;
  const peopleOptions = users
    .map((user) => {
      const name = userDisplayName(user);
      return option(name, name);
    })
    .join("");
  fillSelect(handledBySelect ?? undefined, peopleOptions, "Selectionner responsable");
  fillSelect(receivedBySelect ?? undefined, peopleOptions, "Selectionner receptionnaire");
  if (handledBySelect && previousHandledBy) handledBySelect.value = previousHandledBy;
  if (receivedBySelect && previousReceivedBy) receivedBySelect.value = previousReceivedBy;
  if (locationSelect) locationSelect.onchange = () => refreshEntryLines(root);
  const articleChoices =
    option("", "Selectionner article") + articleOptions(articles);
  modal
    .querySelectorAll<HTMLSelectElement>("#entryLines .entry-article")
    .forEach((select) => {
      const selected = select.value;
      select.innerHTML = articleChoices;
      select.value = selected;
    });
  modal.dataset.entryArticleChoices = articleChoices;
  refreshEntryLines(root);
}

function entryRows(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLTableRowElement>("#entryLines .entry-line"),
  );
}

function entryLineValues(row: HTMLTableRowElement) {
  return {
    articleId: row.querySelector<HTMLSelectElement>(".entry-article")?.value ?? "",
    expectedQuantity: toNumber(
      row.querySelector<HTMLInputElement>(".entry-expected")?.value ?? "0",
    ),
    completedQuantity: toNumber(
      row.querySelector<HTMLInputElement>(".entry-received")?.value ?? "0",
    ),
    unitPrice: toNumber(
      row.querySelector<HTMLInputElement>(".entry-unit-price")?.value ?? "0",
    ),
    observation:
      row.querySelector<HTMLInputElement>(".entry-observation")?.value.trim() ||
      undefined,
  };
}

function entryMovementTotals(movement: StockMovement) {
  return movement.lines.reduce(
    (totals, line) => ({
      expected: totals.expected + Number(line.expectedQuantity ?? 0),
      completed: totals.completed + Number(line.completedQuantity ?? 0),
    }),
    { expected: 0, completed: 0 },
  );
}

function entryStatusKindFromLines(
  lines: Array<{ expectedQuantity?: number | null; completedQuantity?: number | null }>,
) {
  const comparable = lines.filter((line) => Number(line.expectedQuantity ?? 0) > 0);
  if (!comparable.length) return "received";
  if (
    comparable.some(
      (line) =>
        Number(line.completedQuantity ?? 0) > Number(line.expectedQuantity ?? 0),
    )
  )
    return "issue";
  if (
    comparable.some(
      (line) =>
        Number(line.completedQuantity ?? 0) < Number(line.expectedQuantity ?? 0),
    )
  )
    return "partial";
  return "received";
}

function entryHasDispute(movement: StockMovement) {
  if (movement.status === "REJECTED") return true;
  return movement.lines.some((line) => {
    const expected = Number(line.expectedQuantity ?? 0);
    if (expected <= 0) return false;
    return Number(line.completedQuantity ?? 0) !== expected;
  });
}

function entryHasPartial(movement: StockMovement) {
  if (movement.status === "PREPARED") return true;
  return movement.lines.some((line) => {
    const expected = Number(line.expectedQuantity ?? 0);
    return (
      expected > 0 &&
      Number(line.completedQuantity ?? 0) > 0 &&
      Number(line.completedQuantity ?? 0) < expected
    );
  });
}

function entryIsReceived(movement: StockMovement) {
  if (movement.status === "CANCELLED" || entryHasDispute(movement)) return false;
  return (
    movement.status === "COMPLETED" ||
    entryStatusKindFromLines(movement.lines) === "received"
  );
}

function refreshEntryLines(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#entryModal");
  if (!modal) return;
  const rows = entryRows(modal);
  let totalExpected = 0;
  let totalReceived = 0;
  const selectedLocationId =
    modal.querySelector<HTMLSelectElement>("#entryLocationSelect")?.value;

  rows.forEach((row, index) => {
    const number = row.querySelector<HTMLElement>(".entry-line-number");
    if (number) number.textContent = String(index + 1);

    const articleSelect = row.querySelector<HTMLSelectElement>(".entry-article");
    const article = latestArticles.find((item) => item.id === articleSelect?.value);
    const values = entryLineValues(row);
    const delta = values.completedQuantity - values.expectedQuantity;
    totalExpected += values.expectedQuantity;
    totalReceived += values.completedQuantity;

    setText(row, ".entry-line-code", article?.code ?? "-");
    setText(row, ".entry-line-unit", article?.unit ?? "-");
    setText(row, ".entry-line-delta", formatNumber(delta));
    const status = row.querySelector<HTMLElement>(".entry-line-status");
    const statusLabel =
      values.expectedQuantity <= 0 && values.completedQuantity <= 0
        ? "A calculer"
        : values.expectedQuantity > 0 &&
            values.completedQuantity < values.expectedQuantity
          ? "Partielle"
          : values.expectedQuantity > 0 &&
              values.completedQuantity > values.expectedQuantity
            ? "Litige"
            : "Recue";
    if (status) {
      status.textContent = statusLabel;
      status.className =
        "entry-line-status text-xs font-semibold " +
        (statusLabel === "Recue"
          ? "text-success-700"
          : statusLabel === "Partielle"
            ? "text-warning-700"
            : statusLabel === "Litige"
              ? "text-error-700"
              : "text-gray-400");
    }

    const sync = () => refreshEntryLines(root);
    if (articleSelect) articleSelect.onchange = sync;
    row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      input.oninput = sync;
    });
  });

  setText(modal, "#entryLineCount", String(rows.length));
  setText(modal, "#entryTotalExpected", formatNumber(totalExpected));
  setText(modal, "#entryTotalReceived", formatNumber(totalReceived));
  const firstArticleId =
    rows.find((row) => row.querySelector<HTMLSelectElement>(".entry-article")?.value)
      ?.querySelector<HTMLSelectElement>(".entry-article")?.value ?? "";
  const currentStock =
    firstArticleId && selectedLocationId
      ? stockAvailableFor(firstArticleId, selectedLocationId)
      : null;
  setText(
    modal,
    "#entryCurrentStock",
    currentStock === null ? "-" : formatNumber(currentStock),
  );
  setText(modal, "#entryExpectedControl", rows.length + " ligne(s)");

  const statusBox = modal.querySelector<HTMLElement>("#entryComputedStatus");
  if (statusBox) {
    const lineValues = rows.map(entryLineValues);
    const hasAnyQuantity = lineValues.some(
      (line) => line.expectedQuantity > 0 || line.completedQuantity > 0,
    );
    const kind = hasAnyQuantity ? entryStatusKindFromLines(lineValues) : "empty";
    const label =
      kind === "received"
        ? "Recue"
        : kind === "partial"
          ? "Partielle"
          : kind === "issue"
            ? "Litige"
            : "A calculer";
    const tone =
      label === "Recue"
        ? "border-success-100 bg-success-50 text-success-700"
        : label === "Partielle"
          ? "border-warning-100 bg-warning-50 text-warning-700"
          : label === "Litige"
            ? "border-error-100 bg-error-50 text-error-700"
            : "border-gray-200 bg-gray-50 text-gray-500";
    statusBox.className =
      "mt-2 h-11 rounded-lg border px-3 flex items-center font-semibold " + tone;
    statusBox.textContent = label;
  }
  window.lucide?.createIcons();
}

function addEntryLine(root: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#entryLines");
  const first = body?.querySelector<HTMLTableRowElement>(".entry-line");
  if (!body || !first) return;
  const row = first.cloneNode(true) as HTMLTableRowElement;
  row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
    input.value = "";
  });
  row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
    select.innerHTML =
      root.querySelector<HTMLElement>("#entryModal")?.dataset.entryArticleChoices ??
      first.querySelector<HTMLSelectElement>("select")?.innerHTML ??
      "";
    select.selectedIndex = 0;
  });
  row.querySelectorAll<HTMLElement>(".entry-line-code,.entry-line-unit").forEach(
    (element) => {
      element.textContent = "-";
    },
  );
  body.appendChild(row);
  refreshEntryLines(root);
}

function removeEntryLine(root: HTMLElement, trigger: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#entryLines");
  const rows = Array.from(
    body?.querySelectorAll<HTMLTableRowElement>(".entry-line") ?? [],
  );
  const row = trigger.closest<HTMLTableRowElement>(".entry-line");
  if (!body || !row) return;
  if (rows.length <= 1) {
    row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      input.value = "";
    });
    row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
      select.selectedIndex = 0;
    });
  } else {
    row.remove();
  }
  refreshEntryLines(root);
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
  const entryModal = root.querySelector<HTMLElement>("#entryModal");
  if (!entryModal) return;
  let targetRow =
    entryRows(entryModal).find(
      (row) => !row.querySelector<HTMLSelectElement>(".entry-article")?.value,
    ) ?? null;
  if (!targetRow) {
    addEntryLine(root);
    const rows = entryRows(entryModal);
    targetRow = rows[rows.length - 1] ?? null;
  }
  const select = targetRow?.querySelector<HTMLSelectElement>(".entry-article");
  if (select) select.value = articleId;
  refreshEntryLines(root);
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
  const modal = root.querySelector<HTMLElement>("#entryModal");
  if (!modal) return;
  const rawNotes =
    modal.querySelector<HTMLTextAreaElement>("#entryNotesInput")?.value.trim();
  const originSelect =
    modal.querySelector<HTMLSelectElement>("#entryOriginSelect");
  const originLabel = selectedText(originSelect ?? undefined);
  const notes =
    [originLabel ? "Origine entree: " + originLabel : undefined, rawNotes]
      .filter(Boolean)
      .join(" - ") || undefined;
  const reference =
    modal.querySelector<HTMLInputElement>("#entryReferenceInput")?.value.trim() ||
    "BE-" + Date.now();
  const toLocationId =
    modal.querySelector<HTMLSelectElement>("#entryLocationSelect")?.value;
  const rows = entryRows(modal);
  const lines = rows.map(entryLineValues);
  const invalidLine = lines.some(
    (line) =>
      !line.articleId ||
      line.completedQuantity <= 0 ||
      line.expectedQuantity < 0 ||
      line.unitPrice < 0,
  );
  if (!toLocationId || !lines.length || invalidLine) {
    showToast(
      root,
      "Magasin, article et quantite recue positive sont obligatoires sur chaque ligne.",
      "error",
    );
    return;
  }
  try {
    await createStockEntry({
      reference,
      date:
        modal.querySelector<HTMLInputElement>("#entryDateInput")?.value ||
        new Date().toISOString(),
      supplierId:
        modal.querySelector<HTMLSelectElement>("#entrySupplierSelect")?.value ||
        undefined,
      toLocationId,
      handledBy:
        modal.querySelector<HTMLSelectElement>("#entryHandledBySelect")?.value ||
        undefined,
      receivedBy:
        modal.querySelector<HTMLSelectElement>("#entryReceivedBySelect")?.value ||
        undefined,
      deliveredBy:
        modal.querySelector<HTMLInputElement>("#entryDeliveredByInput")?.value.trim() ||
        undefined,
      notes,
      lines: lines.map((line) => ({
        ...line,
        observation: line.observation ?? notes,
      })),
    });
    closeModal(root, "entryModal");
    updateApiBackedViews(root);
    showToast(root, "Entree stock enregistree et stock mis a jour.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Entree stock impossible.",
      "error",
    );
  }
}
async function populateExitModals(
  root: HTMLElement,
  modalId: "exitModal" | "directExitModal",
) {
  const modal = root.querySelector<HTMLElement>("#" + modalId);
  if (!modal) return;
  const [articles, projects, locations, users, clients, teamServices] =
    await Promise.all([
      getArticles().catch(() => []),
      getProjects().catch(() => []),
      getLocations().catch(() => []),
      getUsers().catch(() => []),
      getClients().catch(() => []),
      getTeamServices().catch(() => []),
    ]);
  latestProjects = projects;
  latestLocations = locations;
  latestClients = clients;
  latestTeamServices = teamServices;
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  if (modalId === "directExitModal") {
    fillSelect(selects[0], articleOptions(articles), "Selectionner article");
    fillSelect(selects[1], projectOptions(projects), "Selectionner projet");
    fillSelect(selects[2], userOptions(users), "Selectionner beneficiaire");
    fillSelect(selects[3], userOptions(users), "Selectionner responsable");
    fillSelect(selects[4], userOptions(users), "Selectionner transporteur");
    fillSelect(selects[5], userOptions(users), "Selectionner signataire");
    modal.dataset.defaultLocationId =
      locations.find((location) => location.type.toUpperCase() === "MAGASIN")
        ?.id ??
      locations[0]?.id ??
      "";
  } else {
    fillSelect(selects[0], clientOptions(clients), "Selectionner client");
    fillSelect(selects[1], projectOptions(projects), "Selectionner projet");
    fillSelect(
      selects[2],
      teamServiceOptions(teamServices),
      "Selectionner equipe ou service",
    );
    setProjectSiteOptions(selects[3], selects[1]?.value ?? "");
    fillSelect(selects[4], userOptions(users), "Selectionner demandeur");
    if (selects[1]) {
      selects[1].onchange = () =>
        setProjectSiteOptions(selects[3], selects[1]?.value ?? "");
    }
    const userChoices = userOptions(users);
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#materialStockManager") ??
        undefined,
      userChoices,
      "Selectionner responsable",
    );
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#materialDeliveredBy") ??
        undefined,
      userChoices,
      "Selectionner personne",
    );
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#materialReceivedBy") ??
        undefined,
      userChoices,
      "Selectionner signataire",
    );
    const choices =
      option("", "Selectionner article") + articleOptions(articles);
    Array.from(
      modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr"),
    ).forEach((row) => {
      const select = row.querySelector<HTMLSelectElement>("select");
      if (select) select.innerHTML = choices;
    });
    modal.dataset.defaultLocationId =
      locations.find((location) => location.type.toUpperCase() === "MAGASIN")
        ?.id ??
      locations[0]?.id ??
      "";
    refreshMaterialRequestLines(root);
  }
}
function setMaterialRequestPrepEnabled(modal: HTMLElement, enabled: boolean) {
  modal
    .querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >(".material-prep-field, .material-delivered-quantity")
    .forEach((field) => {
      field.disabled = !enabled;
      field.classList.toggle("bg-gray-50", !enabled);
      field.classList.toggle("text-gray-400", !enabled);
      field.classList.toggle("bg-white", enabled);
      field.classList.toggle("text-gray-900", enabled);
    });
  const pdfButtons = modal.querySelectorAll<HTMLElement>(
    "#materialPdfHeaderButton, #materialPdfFooterButton",
  );
  pdfButtons.forEach((button) => {
    button.classList.toggle("cursor-not-allowed", !enabled);
    button.classList.toggle("text-gray-400", !enabled);
    button.classList.toggle("bg-gray-100", !enabled);
    button.classList.toggle("text-gray-700", enabled);
    button.classList.toggle("bg-white", enabled);
  });
}

function setSelectToText(select: HTMLSelectElement | undefined, value: string) {
  if (!select) return;
  const label = value.trim() || "Non renseigne";
  const existing = Array.from(select.options).find(
    (item) => item.textContent?.trim() === label || item.value === label,
  );
  if (existing) {
    select.value = existing.value;
    return;
  }
  select.insertAdjacentHTML("beforeend", option(label, label));
  select.value = label;
}

function setDemandInfoLocked(modal: HTMLElement, locked: boolean) {
  const infoSelects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  ).slice(0, 5);
  const dateInput = modal.querySelector<HTMLInputElement>('input[type="date"]');
  const fields = dateInput ? [...infoSelects, dateInput] : infoSelects;
  fields.forEach((field) => {
    field.disabled = locked;
    field.classList.toggle("bg-gray-50", locked);
    field.classList.toggle("text-gray-500", locked);
    field.classList.toggle("bg-white", !locked);
    field.classList.toggle("text-gray-900", !locked);
  });
}
function setMaterialRequestMode(
  root: HTMLElement,
  mode: "create" | "prepare",
  movement?: StockMovement,
) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal) return;
  modal.dataset.mode = mode;
  selectedExitRequestId = mode === "prepare" ? (movement?.id ?? null) : null;
  const canPrepare =
    mode === "prepare" &&
    (hasRole("ADMIN_STOCK") || hasRole("GESTIONNAIRE_STOCK"));
  const title = root.querySelector<HTMLElement>("#materialRequestTitle");
  const subtitle = root.querySelector<HTMLElement>("#materialRequestSubtitle");
  const reference = root.querySelector<HTMLElement>(
    "#materialRequestReference",
  );
  const status = root.querySelector<HTMLElement>("#materialRequestStatus");
  const step = root.querySelector<HTMLElement>("#materialRequestStep");
  const lineCount = root.querySelector<HTMLElement>(
    "#materialRequestLineCount",
  );
  const addLine = root.querySelector<HTMLElement>("#materialAddLineButton");
  const treatmentTitle = root.querySelector<HTMLElement>(
    "#materialTreatmentTitle",
  );
  const treatmentHint = root.querySelector<HTMLElement>(
    "#materialTreatmentHint",
  );
  const submit = root.querySelector<HTMLButtonElement>("#materialSubmitButton");
  const draft = root.querySelector<HTMLElement>("#materialDraftButton");

  if (title)
    title.textContent =
      mode === "prepare"
        ? "Preparer la demande materiel"
        : "Nouvelle demande multi-articles";
  if (subtitle)
    subtitle.textContent =
      mode === "prepare"
        ? "Vue gestionnaire : renseigner les quantites remises, la tracabilite et le document final."
        : "Vue demandeur : seules les informations du besoin sont saisies ici.";
  if (reference) reference.textContent = movement?.reference ?? "Auto";
  if (status)
    status.textContent =
      mode === "prepare" ? movementStatusLabel(movement!) : "Brouillon";
  if (step) step.textContent = mode === "prepare" ? "Preparation" : "Saisie";
  if (lineCount)
    lineCount.textContent = String(
      movement?.lines.length ??
        root.querySelectorAll("#materialRequestLines tr").length,
    );
  addLine?.classList.toggle("hidden", mode === "prepare");
  draft?.classList.toggle("hidden", mode === "prepare");
  if (treatmentTitle)
    treatmentTitle.textContent = canPrepare
      ? "Traitement stock"
      : "Traitement stock verrouille";
  if (treatmentHint)
    treatmentHint.textContent = canPrepare
      ? "Renseigne les quantites remises, les signataires et joins le PDF signe si disponible."
      : "Ces informations sont reservees au gestionnaire stock ou a l'admin.";
  if (submit) {
    submit.textContent =
      mode === "prepare" ? "Valider preparation" : "Soumettre demande";
    submit.dataset.action =
      mode === "prepare"
        ? "submitMaterialRequestPreparation"
        : "submitExitRequest";
    submit.disabled = mode === "prepare" && !canPrepare;
    submit.classList.toggle("opacity-50", submit.disabled);
    submit.classList.toggle("cursor-not-allowed", submit.disabled);
  }
  setDemandInfoLocked(modal, mode === "prepare");
  setMaterialRequestPrepEnabled(modal, canPrepare);
  syncMaterialPreparationState(root);
}

function fillMaterialRequestRows(
  root: HTMLElement,
  movement: StockMovement,
  articleChoices: string,
) {
  const body = root.querySelector<HTMLTableSectionElement>(
    "#materialRequestLines",
  );
  if (!body) return;
  body.innerHTML = movement.lines
    .map((line, index) => {
      const requested = Number(line.requestedQuantity ?? 0);
      const completed = Number(line.completedQuantity ?? 0);
      const available = stockAvailableFor(
        line.articleId,
        movement.fromLocationId,
      );
      return `<tr data-requested="${requested}" data-available="${available}">
      <td class="px-5 py-4 font-bold text-gray-400 material-line-number">${index + 1}</td>
      <td class="px-5 py-4"><select class="w-full h-10 border rounded-lg px-3" disabled>${articleChoices}</select></td>
      <td class="px-5 py-4"><input class="w-20 h-10 border rounded-lg px-3 bg-gray-50 text-gray-500" value="${escapeHtml(line.article?.unit ?? "U")}" disabled></td>
      <td class="px-5 py-4 text-right"><input class="w-24 h-10 border rounded-lg px-3 text-right bg-gray-50 text-gray-500" value="${formatNumber(requested)}" disabled></td>
      <td class="px-5 py-4 text-right"><div class="font-bold">${formatNumber(available)}</div><div class="text-xs text-gray-500">stock</div></td>
      <td class="px-5 py-4 text-right"><input class="material-delivered-quantity w-24 h-10 border rounded-lg px-3 text-right" value="${completed > 0 ? completed : ""}" placeholder="0"><div class="material-line-feedback mt-1 text-xs font-semibold text-gray-400">A renseigner</div></td>
      <td class="px-5 py-4"><input class="material-remise-observation w-full h-10 border rounded-lg px-3" value="${escapeHtml(line.observation ?? "")}" placeholder="Observation remise"></td>
      <td class="px-5 py-4 text-right"><button title="Ligne issue de la demande" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"><i data-lucide="lock" class="w-4 h-4"></i></button></td>
    </tr>`;
    })
    .join("");
  body
    .querySelectorAll<HTMLSelectElement>("select")
    .forEach((select, index) => {
      select.value = movement.lines[index]?.articleId ?? "";
    });
  syncMaterialPreparationState(root);
}

function syncMaterialPreparationState(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal || modal.dataset.mode !== "prepare") return;
  const rows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr"),
  );
  const submit = root.querySelector<HTMLButtonElement>("#materialSubmitButton");
  let hasInvalidLine = false;
  let hasAnyQuantity = false;

  rows.forEach((row) => {
    const deliveredInput = row.querySelector<HTMLInputElement>(
      ".material-delivered-quantity",
    );
    const observationInput = row.querySelector<HTMLInputElement>(
      ".material-remise-observation",
    );
    const feedback = row.querySelector<HTMLElement>(".material-line-feedback");
    const requested = Number(row.dataset.requested ?? 0);
    const available = Number(row.dataset.available ?? 0);
    const raw = deliveredInput?.value.trim() ?? "";
    const delivered = raw ? toNumber(raw) : 0;
    const observation = observationInput?.value.trim() ?? "";

    deliveredInput?.classList.remove(
      "border-success-300",
      "bg-success-50",
      "text-success-700",
      "border-warning-300",
      "bg-warning-50",
      "text-warning-700",
      "border-error-300",
      "bg-error-50",
      "text-error-700",
    );
    if (feedback)
      feedback.className =
        "material-line-feedback mt-1 text-xs font-semibold text-gray-400";

    if (!raw) {
      hasInvalidLine = true;
      if (feedback) feedback.textContent = "A renseigner";
      return;
    }

    hasAnyQuantity = true;
    if (delivered > available) {
      hasInvalidLine = true;
      deliveredInput?.classList.add(
        "border-error-300",
        "bg-error-50",
        "text-error-700",
      );
      if (feedback) {
        feedback.className =
          "material-line-feedback mt-1 text-xs font-semibold text-error-700";
        feedback.textContent = "Stock insuffisant";
      }
      return;
    }

    if (delivered > requested) {
      hasInvalidLine = true;
      deliveredInput?.classList.add(
        "border-warning-300",
        "bg-warning-50",
        "text-warning-700",
      );
      if (feedback) {
        feedback.className =
          "material-line-feedback mt-1 text-xs font-semibold text-warning-700";
        feedback.textContent = "Superieur a la demande";
      }
      return;
    }

    if (delivered < requested && !observation) {
      hasInvalidLine = true;
      deliveredInput?.classList.add(
        "border-warning-300",
        "bg-warning-50",
        "text-warning-700",
      );
      if (feedback) {
        feedback.className =
          "material-line-feedback mt-1 text-xs font-semibold text-warning-700";
        feedback.textContent = "Remise partielle : ajoute une observation";
      }
      return;
    }

    deliveredInput?.classList.add(
      "border-success-300",
      "bg-success-50",
      "text-success-700",
    );
    if (feedback) {
      feedback.className =
        "material-line-feedback mt-1 text-xs font-semibold text-success-700";
      feedback.textContent =
        delivered < requested ? "Remise partielle" : "Disponible";
    }
  });

  if (submit && modal.dataset.mode === "prepare") {
    submit.disabled =
      hasInvalidLine || !hasAnyQuantity || !canPrepareMaterialRequests();
    submit.classList.toggle("opacity-50", submit.disabled);
    submit.classList.toggle("cursor-not-allowed", submit.disabled);
  }
}

function stockMovementLineKey(line: StockMovement["lines"][number]) {
  const articleId = (line as { articleId?: string | null }).articleId;
  return articleId ?? line.article?.code ?? "";
}

function linkedExitLineFor(
  sourceLine: StockMovement["lines"][number],
  index: number,
  linkedExit: StockMovement | null,
) {
  if (!linkedExit) return null;
  const key = stockMovementLineKey(sourceLine);
  return (
    linkedExit.lines.find(
      (line) => key && stockMovementLineKey(line) === key,
    ) ??
    linkedExit.lines[index] ??
    null
  );
}

function preparedMaterialPdfHtml(movement: StockMovement) {
  const source = materialPdfMovement(movement);
  const linkedExit = materialPdfLinkedExit(movement);
  const sourceLines = source.lines.length
    ? source.lines
    : (linkedExit?.lines ?? []);
  const rows = sourceLines
    .map((line, index) => {
      const exitLine = linkedExitLineFor(line, index, linkedExit);
      const article = line.article ?? exitLine?.article;
      const requested = Number(
        line.requestedQuantity ?? exitLine?.requestedQuantity ?? 0,
      );
      const completed = Number(
        exitLine?.completedQuantity ?? line.completedQuantity ?? 0,
      );
      const observation = exitLine?.observation ?? line.observation ?? "";
      return `<tr>
    <td class="num">${index + 1}</td>
    <td><strong>${escapeHtml(article?.designation ?? "-")}</strong><br><span>${escapeHtml(article?.code ?? "-")}</span></td>
    <td>${escapeHtml(article?.unit ?? "U")}</td>
    <td class="right strong">${formatNumber(requested)}</td>
    <td class="right strong">${formatNumber(completed)}</td>
    <td>${escapeHtml(observation)}</td>
  </tr>`;
    })
    .join("");
  return materialRequestDocumentHtml({
    reference: source.reference,
    docCode: source.reference.replace(/^DS-/, "DM-"),
    exitReference: linkedExit?.reference ?? "-",
    date: linkedExit?.date ?? movement.date,
    client: source.client?.name ?? "-",
    project: source.project?.name ?? "-",
    site: source.siteLocation?.name ?? source.toLocation?.name ?? "-",
    team: source.teamService?.name ?? "-",
    requester: source.requestedBy ?? source.receivedBy ?? "-",
    stockManager: linkedExit?.handledBy ?? source.handledBy ?? "-",
    receivedBy:
      linkedExit?.receivedBy ?? source.receivedBy ?? source.requestedBy ?? "-",
    rows,
  });
}
function downloadPreparedMaterialPdf(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (
    !movement ||
    (movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED")
  ) {
    showToast(root, "La fiche est disponible apres preparation.", "error");
    return;
  }
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour telecharger la fiche.", "error");
    return;
  }
  popup.document.write(preparedMaterialPdfHtml(movement));
  popup.document.close();
  try {
    popup.history.replaceState(
      null,
      "",
      "/documents/demande-materiel/" + encodeURIComponent(movement.reference),
    );
  } catch {
    // The printable document still works when the browser blocks URL replacement.
  }
  popup.focus();
  popup.print();
}

async function uploadSignedMaterialProof(root: HTMLElement, id: string) {
  const input = root.querySelector<HTMLInputElement>(
    `#signedProof-${CSS.escape(id)}`,
  );
  const file = input?.files?.[0];
  if (!file) {
    showToast(root, "Ajoute la fiche signee avant de cloturer.", "error");
    return;
  }
  try {
    const updated = await uploadExitRequestProof(id, {
      file,
      uploadedBy: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : undefined,
    });
    latestMovements = await getStockMovements();
    renderExitRequestDetail(
      root,
      latestMovements.find((item) => item.id === updated.id) ?? updated,
    );
    updateApiBackedViews(root);
    showToast(root, "Fiche signée. Demande terminée.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Upload impossible.",
      "error",
    );
  }
}

async function viewSignedMaterialProof(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement?.proofFileName && !movement?.proofFileKey) {
    showToast(root, "Aucune preuve signee jointe.", "error");
    return;
  }
  try {
    const proof = await getExitRequestProof(id);
    const popup = window.open(proof.url, "_blank", "noopener,noreferrer");
    if (!popup) {
      showToast(root, "Autorise les popups pour ouvrir la preuve.", "error");
      return;
    }
    showToast(root, "Preuve signee ouverte : " + (proof.fileName ?? movement.proofFileName ?? "fichier"));
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Preuve signee inaccessible.",
      "error",
    );
  }
}

function openExitRequestRejection(root: HTMLElement, id: string, reason = "") {
  const movement = latestMovements.find((item) => item.id === id);
  if (
    !movement ||
    movement.type !== "EXIT_REQUEST" ||
    movement.status !== "SUBMITTED" ||
    !canPrepareMaterialRequests()
  ) {
    showToast(root, "Cette demande ne peut pas etre refusee.", "error");
    return;
  }
  selectedRejectedExitRequestId = id;
  const input = root.querySelector<HTMLTextAreaElement>("#exitRequestRejectReason");
  if (input) input.value = reason;
  openModal(root, "exitRequestRejectModal");
}

async function submitExitRequestRejection(root: HTMLElement) {
  const id = selectedRejectedExitRequestId;
  const input = root.querySelector<HTMLTextAreaElement>("#exitRequestRejectReason");
  const reason = input?.value.trim() ?? "";
  if (!id) {
    showToast(root, "Demande introuvable.", "error");
    return;
  }
  if (!reason) {
    showToast(root, "Renseigne le motif du refus.", "error");
    input?.focus();
    return;
  }
  try {
    const rejected = await rejectExitRequest(id, {
      reason,
      rejectedBy: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : undefined,
    });
    latestMovements = await getStockMovements();
    const hydrated = latestMovements.find((item) => item.id === rejected.id) ?? rejected;
    closeModal(root, "exitRequestRejectModal");
    selectedRejectedExitRequestId = null;
    updateApiBackedViews(root);
    renderExitRequestDetail(root, hydrated);
    openModal(root, "exitRequestDetailModal");
    showToast(root, "Demande refusee.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Refus impossible.",
      "error",
    );
  }
}

async function openMaterialRequestPreparation(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement) {
    showToast(root, "Demande introuvable dans le registre charge.", "error");
    return;
  }
  if (
    movement.type !== "EXIT_REQUEST" ||
    movement.status !== "SUBMITTED" ||
    !canPrepareMaterialRequests()
  ) {
    renderExitRequestDetail(root, movement);
    openModal(root, "exitRequestDetailModal");
    if (movement.status !== "SUBMITTED")
      showToast(root, "Cette demande est deja preparee ou terminee.");
    return;
  }
  openModal(root, "exitModal");
  await populateExitModals(root, "exitModal").catch(() => undefined);
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal) return;
  const articles = await getArticles().catch(() => []);
  fillMaterialRequestRows(
    root,
    movement,
    option("", "Selectionner article") + articleOptions(articles),
  );
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const dateInput = modal.querySelector<HTMLInputElement>('input[type="date"]');
  setSelectValueOrText(
    selects[0],
    movement.clientId,
    movement.client?.name,
    "Client non renseigne",
  );
  setSelectValueOrText(
    selects[1],
    movement.projectId,
    movement.project?.name,
    "Projet non renseigne",
  );
  setSelectValueOrText(
    selects[2],
    movement.teamServiceId,
    movement.teamService?.name,
    "Equipe/service non renseigne",
  );
  setProjectSiteOptions(selects[3], movement.projectId ?? "");
  setSelectValueOrText(
    selects[3],
    movement.siteLocationId,
    movement.siteLocation?.name,
    "Site non renseigne",
  );
  setSelectToText(
    selects[4],
    movement.requestedBy || "Demandeur non renseigne",
  );
  if (dateInput) dateInput.value = movement.date.slice(0, 10);
  setMaterialRequestMode(root, "prepare", movement);
  window.lucide?.createIcons();
}

async function submitMaterialRequestPreparation(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  const movement = selectedExitRequestId
    ? latestMovements.find((item) => item.id === selectedExitRequestId)
    : null;
  if (!modal || !movement) return;
  syncMaterialPreparationState(root);
  const submit = root.querySelector<HTMLButtonElement>("#materialSubmitButton");
  if (submit?.disabled) {
    showToast(root, "Corrige les quantites remises avant validation.", "error");
    return;
  }
  const rows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr"),
  );
  const lines = rows
    .map((row, index) => {
      const inputs = Array.from(
        row.querySelectorAll<HTMLInputElement>("input"),
      );
      return {
        articleId: movement.lines[index]?.articleId ?? "",
        requestedQuantity: Number(
          movement.lines[index]?.requestedQuantity ?? 0,
        ),
        completedQuantity: toNumber(inputs[2]?.value) ?? 0,
        observation: inputs[3]?.value.trim() || undefined,
      };
    })
    .filter((line) => line.articleId && line.completedQuantity > 0);
  if (!lines.length) {
    showToast(root, "Renseigne au moins une quantite remise.", "error");
    return;
  }
  const stockManager = root.querySelector<HTMLSelectElement>(
    "#materialStockManager",
  );
  const deliveredBy = root.querySelector<HTMLSelectElement>(
    "#materialDeliveredBy",
  );
  const receivedBy = root.querySelector<HTMLSelectElement>(
    "#materialReceivedBy",
  );
  const file =
    root.querySelector<HTMLInputElement>("#materialSignedPdf")?.files?.[0];
  try {
    let prepared = await prepareExitRequest(movement.id, {
      reference: "BS-" + Date.now(),
      fromLocationId:
        movement.fromLocationId ?? modal.dataset.defaultLocationId ?? "",
      handledBy: selectedText(stockManager ?? undefined),
      deliveredBy: selectedText(deliveredBy ?? undefined),
      receivedBy: selectedText(receivedBy ?? undefined),
      lines: lines.map((line, index) => ({
        ...line,
        lineId: movement.lines[index]?.id,
      })),
    });
    if (file) {
      prepared = await uploadExitRequestProof(movement.id, {
        file,
        uploadedBy: selectedText(stockManager ?? undefined),
      });
    }
    closeModal(root, "exitModal");
    selectedExitRequestId = null;
    latestMovements = latestMovements.map((item) =>
      item.id === prepared.id ? prepared : item,
    );
    updateApiBackedViews(root);
    renderExitRequestDetail(root, prepared);
    openModal(root, "exitRequestDetailModal");
    showToast(
      root,
      file
        ? "Preparation validee et fiche signee ajoutee."
        : "Preparation validee. La fiche est prete a telecharger.",
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Preparation impossible.";
    if (message.toLowerCase().includes("stock insuffisant")) {
      openExitRequestRejection(root, movement.id, message);
      showToast(root, "Stock insuffisant : complete le motif pour refuser.", "error");
      return;
    }
    showToast(
      root,
      message,
      "error",
    );
  }
}
function addTransferLine(root: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#transferLines");
  const first = body?.querySelector<HTMLElement>(".transfer-line");
  if (!body || !first) return;
  const row = first.cloneNode(true) as HTMLElement;
  row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
    input.value = input.classList.contains("transfer-available") ? "0" : "";
  });
  row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
    select.innerHTML =
      first.querySelector<HTMLSelectElement>("select")?.innerHTML ?? "";
    select.selectedIndex = 0;
  });
  body.appendChild(row);
  void populateReturnTransferModals(root, "transferModal");
}

function removeTransferLine(root: HTMLElement, trigger: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#transferLines");
  const row = trigger.closest<HTMLElement>(".transfer-line");
  if (!body || !row) return;
  const rows = body.querySelectorAll(".transfer-line");
  if (rows.length > 1) row.remove();
  body
    .querySelectorAll<HTMLElement>(".transfer-line")
    .forEach((item, index) => {
      const number = item.querySelector<HTMLElement>(".transfer-line-number");
      if (number) number.textContent = String(index + 1);
    });
}

function refreshMaterialRequestLines(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>("#materialRequestLines tr")
    .forEach((row, index) => {
      const number = row.querySelector<HTMLElement>(".material-line-number");
      if (number) number.textContent = String(index + 1);
    });
  window.lucide?.createIcons();
}

function addMaterialRequestLine(root: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>(
    "#materialRequestLines",
  );
  const first = body?.querySelector<HTMLTableRowElement>("tr");
  if (!body || !first) return;
  const row = first.cloneNode(true) as HTMLTableRowElement;
  row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
    input.value = "";
  });
  row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
    select.selectedIndex = 0;
  });
  body.appendChild(row);
  refreshMaterialRequestLines(root);
}

function removeMaterialRequestLine(root: HTMLElement, trigger: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>(
    "#materialRequestLines",
  );
  const rows = Array.from(
    body?.querySelectorAll<HTMLTableRowElement>("tr") ?? [],
  );
  const row = trigger.closest("tr");
  if (!body || !row) return;
  if (rows.length <= 1) {
    row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      input.value = "";
    });
    row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
      select.selectedIndex = 0;
    });
  } else {
    row.remove();
  }
  refreshMaterialRequestLines(root);
}

async function submitExitRequest(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal) return;
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const rows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>("tbody tr"),
  );
  const lines = rows
    .map((row) => {
      const articleId =
        row.querySelector<HTMLSelectElement>("select")?.value ?? "";
      const lineInputs = Array.from(
        row.querySelectorAll<HTMLInputElement>("input"),
      );
      return {
        articleId,
        requestedQuantity: toNumber(lineInputs[1]?.value) ?? 0,
        observation: lineInputs[3]?.value.trim() || undefined,
      };
    })
    .filter((line) => line.articleId && line.requestedQuantity > 0);
  if (!lines.length) {
    showToast(
      root,
      "Ajoute au moins une ligne avec une quantite demandee.",
      "error",
    );
    return;
  }
  try {
    await createExitRequest({
      reference: "DS-" + Date.now(),
      date:
        modal.querySelector<HTMLInputElement>('input[type="date"]')?.value ||
        new Date().toISOString(),
      clientId: selects[0]?.value || undefined,
      projectId: selects[1]?.value || undefined,
      teamServiceId: selects[2]?.value || undefined,
      siteLocationId: selects[3]?.value || undefined,
      fromLocationId: modal.dataset.defaultLocationId || undefined,
      requestedBy: selectedText(selects[4]),
      notes: undefined,
      lines,
    });
    closeModal(root, "exitModal");
    updateApiBackedViews(root);
    showToast(
      root,
      "Demande materiel soumise. Elle apparait dans le registre sorties.",
    );
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Demande impossible.",
      "error",
    );
  }
}

async function submitDirectExit(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#directExitModal");
  if (!modal) return;
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const notes = modal
    .querySelector<HTMLTextAreaElement>("textarea")
    ?.value.trim();
  const articleId = selects[0]?.value;
  const fromLocationId = modal.dataset.defaultLocationId;
  const quantity = toNumber(inputs[2]?.value) ?? 0;
  if (!articleId || !fromLocationId || quantity <= 0) {
    showToast(
      root,
      "Article, magasin source et quantite sont requis pour une sortie.",
      "error",
    );
    return;
  }
  try {
    await createStockExit({
      reference: "BS-" + Date.now(),
      date: inputs[0]?.value.trim() || new Date().toISOString(),
      projectId: selects[1]?.value || undefined,
      fromLocationId,
      requestedBy:
        selects[2]?.selectedOptions[0]?.textContent?.trim() || undefined,
      handledBy:
        selects[3]?.selectedOptions[0]?.textContent?.trim() || undefined,
      deliveredBy:
        selects[5]?.selectedOptions[0]?.textContent?.trim() || undefined,
      notes,
      lines: [
        {
          articleId,
          requestedQuantity: quantity,
          completedQuantity: quantity,
          observation: inputs[3]?.value.trim() || undefined,
        },
      ],
    });
    closeModal(root, "directExitModal");
    updateApiBackedViews(root);
    showToast(root, "Sortie stock validee. Le stock disponible est diminue.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Sortie impossible.",
      "error",
    );
  }
}

function returnLineQuantity(movement: StockMovement, articleId: string) {
  return movement.lines
    .filter((line) => line.articleId === articleId)
    .reduce((sum, line) => sum + Number(line.completedQuantity ?? 0), 0);
}

function returnSourceLines(source: StockMovement | undefined | null) {
  if (!source) return [];
  const linesByArticle = new Map<string, StockMovement["lines"][number]>();
  source.lines.forEach((line) => {
    const existing = linesByArticle.get(line.articleId);
    if (!existing) {
      linesByArticle.set(line.articleId, { ...line });
      return;
    }
    linesByArticle.set(line.articleId, {
      ...existing,
      completedQuantity:
        Number(existing.completedQuantity ?? 0) +
        Number(line.completedQuantity ?? 0),
    });
  });
  return [...linesByArticle.values()];
}

function returnedQuantityForSource(sourceMovementId: string, articleId: string) {
  return latestMovements
    .filter(
      (movement) =>
        movement.type === "RETURN" &&
        movement.sourceRequestId === sourceMovementId &&
        movement.status !== "CANCELLED",
    )
    .reduce((sum, movement) => sum + returnLineQuantity(movement, articleId), 0);
}

function remainingReturnQuantity(sourceMovementId: string, articleId: string) {
  const source = latestMovements.find((movement) => movement.id === sourceMovementId);
  const sourceLine = returnSourceLines(source).find(
    (line) => line.articleId === articleId,
  );
  return Math.max(
    0,
    Number(sourceLine?.completedQuantity ?? 0) -
      returnedQuantityForSource(sourceMovementId, articleId),
  );
}

function returnLineRow(index: number) {
  return `<tr class="return-line">
    <td class="px-5 py-4 font-bold text-gray-400 return-line-number">${index + 1}</td>
    <td class="px-5 py-4"><select class="return-line-article w-full h-10 border rounded-lg px-3"><option value="">Selectionner article</option></select><div class="return-line-initial mt-1 text-xs font-semibold text-gray-500">Sortie initiale: -</div></td>
    <td class="px-5 py-4 text-right return-line-returned">-</td>
    <td class="px-5 py-4 text-right font-bold return-line-remaining">-</td>
    <td class="px-5 py-4 text-right"><input type="number" min="0" class="return-line-good w-24 h-10 border rounded-lg px-3 text-right" placeholder="0"></td>
    <td class="px-5 py-4 text-right"><input type="number" min="0" class="return-line-damaged w-24 h-10 border rounded-lg px-3 text-right" placeholder="0"></td>
    <td class="px-5 py-4 text-right"><input type="number" min="0" class="return-line-scrap w-24 h-10 border rounded-lg px-3 text-right" placeholder="0"></td>
    <td class="px-5 py-4 text-right"><input type="number" min="0" class="return-line-pending w-24 h-10 border rounded-lg px-3 text-right" placeholder="0"></td>
    <td class="px-5 py-4 text-right font-bold return-line-total">0</td>
    <td class="px-5 py-4"><input class="return-line-observation w-full h-10 border rounded-lg px-3" placeholder="Observation"></td>
    <td class="px-5 py-4 text-right"><button type="button" data-action="removeReturnLine" title="Retirer la ligne" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-error-700 hover:bg-error-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
  </tr>`;
}

function returnArticleOptions(
  sourceMovementId: string,
  selectedArticleId = "",
  blockedArticleIds: Set<string> = new Set(),
) {
  const source = latestMovements.find((movement) => movement.id === sourceMovementId);
  return (
    option("", "Selectionner article") +
    returnSourceLines(source)
      .map((line) => {
        const remaining = remainingReturnQuantity(sourceMovementId, line.articleId);
        const alreadySelected =
          blockedArticleIds.has(line.articleId) &&
          line.articleId !== selectedArticleId;
        const remainingLabel =
          remaining <= 0 ? "tout retourne" : "reste " + formatNumber(remaining);
        const label =
          (line.article?.code ?? "-") +
          " - " +
          (line.article?.designation ?? "Article") +
          " (" +
          remainingLabel +
          ")";
        const disabled =
          alreadySelected || (remaining <= 0 && line.articleId !== selectedArticleId);
        return `<option value="${escapeHtml(line.articleId)}"${line.articleId === selectedArticleId ? " selected" : ""}${disabled ? " disabled" : ""}>${escapeHtml(label)}</option>`;
      })
      .join("")
  );
}

function refreshReturnLines(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  const sourceMovementId = modal?.dataset.returnSourceMovementId ?? "";
  const body = modal?.querySelector<HTMLTableSectionElement>("#returnLines");
  if (!modal || !body || !sourceMovementId) return;
  const source = latestMovements.find((movement) => movement.id === sourceMovementId);
  const sourceLines = returnSourceLines(source);
  const sourceByArticle = new Map(sourceLines.map((line) => [line.articleId, line]));
  const rows = Array.from(body.querySelectorAll<HTMLTableRowElement>(".return-line"));
  const selectedIds = rows
    .map((row) => row.querySelector<HTMLSelectElement>(".return-line-article")?.value ?? "")
    .filter(Boolean);

  rows.forEach((row, index) => {
    const select = row.querySelector<HTMLSelectElement>(".return-line-article");
    const selectedArticleId = select?.value ?? "";
    const number = row.querySelector<HTMLElement>(".return-line-number");
    if (number) number.textContent = String(index + 1);
    if (select) {
      const selectedElsewhere = new Set(
        selectedIds.filter((articleId) => articleId !== selectedArticleId),
      );
      select.innerHTML = returnArticleOptions(
        sourceMovementId,
        selectedArticleId,
        selectedElsewhere,
      );
      select.value = selectedArticleId;
      select.onchange = () => refreshReturnLines(root);
    }
    const sourceLine = sourceByArticle.get(selectedArticleId);
    const exited = Number(sourceLine?.completedQuantity ?? 0);
    const returned = selectedArticleId
      ? returnedQuantityForSource(sourceMovementId, selectedArticleId)
      : 0;
    const remaining = selectedArticleId
      ? remainingReturnQuantity(sourceMovementId, selectedArticleId)
      : 0;
    const quantityInputs = [
      row.querySelector<HTMLInputElement>(".return-line-good"),
      row.querySelector<HTMLInputElement>(".return-line-damaged"),
      row.querySelector<HTMLInputElement>(".return-line-scrap"),
      row.querySelector<HTMLInputElement>(".return-line-pending"),
    ].filter(Boolean) as HTMLInputElement[];
    const totalNode = row.querySelector<HTMLElement>(".return-line-total");
    const duplicate =
      selectedArticleId &&
      selectedIds.filter((articleId) => articleId === selectedArticleId).length > 1;
    row.dataset.articleId = selectedArticleId;
    row.dataset.remaining = String(remaining);
    row.classList.toggle("bg-error-50", Boolean(duplicate));
    const total = quantityInputs.reduce(
      (sum, input) => sum + (toNumber(input.value) ?? 0),
      0,
    );
    quantityInputs.forEach((input) => {
      input.max = String(remaining);
      input.disabled = Boolean(selectedArticleId && remaining <= 0);
      input.oninput = () => refreshReturnLines(root);
      input.classList.toggle("text-error-700", total > remaining || Boolean(duplicate));
      input.classList.toggle("bg-gray-50", input.disabled);
    });
    if (totalNode) {
      totalNode.textContent = formatNumber(total);
      totalNode.classList.toggle("text-error-700", total > remaining || Boolean(duplicate));
    }
    setText(
      row,
      ".return-line-initial",
      selectedArticleId ? "Sortie initiale: " + formatNumber(exited) : "Sortie initiale: -",
    );
    setText(row, ".return-line-returned", selectedArticleId ? formatNumber(returned) : "-");
    setText(row, ".return-line-remaining", selectedArticleId ? formatNumber(remaining) : "-");
  });
  window.lucide?.createIcons();
}

function resetReturnLines(root: HTMLElement, sourceMovementId: string) {
  const body = root.querySelector<HTMLTableSectionElement>("#returnLines");
  if (!body) return;
  if (!sourceMovementId) {
    body.innerHTML =
      '<tr><td colspan="11" class="px-5 py-6 text-center text-gray-500">Selectionne une sortie pour afficher ses articles.</td></tr>';
    return;
  }
  body.innerHTML = returnLineRow(0);
  refreshReturnLines(root);
}

function addReturnLine(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  const body = modal?.querySelector<HTMLTableSectionElement>("#returnLines");
  const sourceMovementId = modal?.dataset.returnSourceMovementId ?? "";
  if (!body || !sourceMovementId) {
    showToast(root, "Selectionne d'abord une sortie.", "error");
    return;
  }
  const rows = body.querySelectorAll(".return-line");
  body.insertAdjacentHTML("beforeend", returnLineRow(rows.length));
  refreshReturnLines(root);
}

function removeReturnLine(root: HTMLElement, trigger: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#returnLines");
  const row = trigger.closest<HTMLTableRowElement>(".return-line");
  if (!body || !row) return;
  const rows = body.querySelectorAll(".return-line");
  if (rows.length <= 1) {
    row.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      input.value = "";
    });
    row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
      select.selectedIndex = 0;
    });
  } else {
    row.remove();
  }
  refreshReturnLines(root);
}

function updateReturnSelection(root: HTMLElement, movements: StockMovement[]) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  const select = modal?.querySelector<HTMLSelectElement>("#returnSourceSelect");
  if (!modal || !select) return;
  const movement = movements.find((item) => item.id === select.value);
  latestMovements = movements;
  const sourceLines = returnSourceLines(movement);
  const totalExited = sourceLines.reduce(
    (sum, line) => sum + Number(line.completedQuantity ?? 0),
    0,
  );
  const totalReturned = movement
    ? sourceLines.reduce(
        (sum, line) =>
          sum + returnedQuantityForSource(movement.id, line.articleId),
        0,
      )
    : 0;
  const values: Record<string, string> = {
    bon: movement?.reference ?? "-",
    article: sourceLines.length
      ? formatNumber(sourceLines.length) +
        " article" +
        (sourceLines.length > 1 ? "s" : "")
      : "-",
    beneficiary: movement?.requestedBy ?? movement?.receivedBy ?? "-",
    destination: movement?.toLocation?.name ?? movement?.project?.name ?? "-",
    quantity: movement ? formatNumber(Math.max(0, totalExited - totalReturned)) : "-",
    returned: movement ? formatNumber(totalReturned) : "-",
  };
  Object.entries(values).forEach(([key, value]) => {
    const node = modal.querySelector<HTMLElement>(
      `[data-return-kpi="${key}"] .font-bold`,
    );
    if (node) node.textContent = value;
  });
  modal.dataset.returnSourceMovementId = movement?.id ?? "";
  const summary = modal.querySelector<HTMLElement>("#returnSelectionSummary");
  if (summary)
    summary.innerHTML = movement
      ? `<div><div class="text-sm font-bold">${escapeHtml(movement.reference)} - sortie selectionnee</div><div class="text-xs text-gray-600">${escapeHtml(values.quantity)} encore dehors sur ${escapeHtml(values.article)}</div></div>`
      : `<div><div class="text-sm font-bold">Aucune sortie selectionnee</div><div class="text-xs text-gray-600">Selectionne une sortie pour pre-remplir le formulaire.</div></div>`;
  resetReturnLines(root, movement?.id ?? "");
}

async function populateReturnTransferModals(
  root: HTMLElement,
  modalId: "returnModal" | "transferModal",
) {
  const modal = root.querySelector<HTMLElement>("#" + modalId);
  if (!modal) return;
  const [articles, locations, users, movements] = await Promise.all([
    getArticles().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => []),
    getStockMovements().catch(() => []),
  ]);
  const selects = Array.from(
    modal.querySelectorAll<HTMLSelectElement>("select"),
  );
  const userChoices = userOptions(users);
  if (modalId === "transferModal") {
    const reference = root.querySelector<HTMLElement>("#transferReference");
    const transferNumber =
      latestMovements.filter((item) => item.type === "TRANSFER").length + 1;
    if (reference)
      reference.textContent = `TRF-${new Date().getFullYear()}-${String(transferNumber).padStart(3, "0")}`;
    const articleChoices =
      option("", "Selectionner article") + articleOptions(articles);
    const locationChoices =
      option("", "Selectionner emplacement") + locationOptions(locations);
    const fillTransferLine = (row: HTMLElement) => {
      const article = row.querySelector<HTMLSelectElement>(".transfer-article");
      const source = row.querySelector<HTMLSelectElement>(".transfer-source");
      const destination = row.querySelector<HTMLSelectElement>(
        ".transfer-destination",
      );
      if (article) article.innerHTML = articleChoices;
      if (source) source.innerHTML = locationChoices;
      if (destination) destination.innerHTML = locationChoices;
      const refresh = () => {
        const available = row.querySelector<HTMLInputElement>(
          ".transfer-available",
        );
        if (available)
          available.value =
            article?.value && source?.value
              ? String(articleStockAtLocation(article.value, source.value))
              : "0";
      };
      article?.addEventListener("change", refresh);
      source?.addEventListener("change", refresh);
      refresh();
    };
    modal
      .querySelectorAll<HTMLElement>("#transferLines .transfer-line")
      .forEach(fillTransferLine);
    modal.dataset.transferLineSetup = "1";
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#transferHandledBy") ?? undefined,
      userChoices,
    );
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#transferDeliveredBy") ??
        undefined,
      userChoices,
    );
    fillSelect(
      modal.querySelector<HTMLSelectElement>("#transferReceivedBy") ??
        undefined,
      userChoices,
    );
    return;
  }
  const exits = movements.filter(
    (movement) => movement.type === "EXIT" && movement.lines.length > 0,
  );
  const sourceSelect = modal.querySelector<HTMLSelectElement>(
    "#returnSourceSelect",
  );
  if (sourceSelect) {
    sourceSelect.innerHTML =
      option("", "Selectionner une sortie") +
      exits
        .map((movement) => {
          const articles = movement.lines
            .map((line) => line.article?.designation ?? "Article")
            .join(", ");
          const destination =
            movement.toLocation?.name ??
            movement.project?.name ??
            "Destination inconnue";
          return option(
            movement.id,
            `${movement.reference} - ${articles} - ${destination}`,
          );
        })
        .join("");
    sourceSelect.onchange = () => updateReturnSelection(root, latestMovements);
  }
  fillSelect(selects[1], locationOptions(locations));
  fillSelect(selects[2], userChoices);
  fillSelect(selects[3], userChoices);
  fillSelect(selects[4], userChoices);
  updateReturnSelection(root, movements);
}

async function submitStockReturn(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  if (!modal) return;
  const notes = modal
    .querySelector<HTMLTextAreaElement>("textarea")
    ?.value.trim();
  const sourceMovementId =
    modal.querySelector<HTMLSelectElement>("#returnSourceSelect")?.value ?? "";
  modal.dataset.returnSourceMovementId = sourceMovementId;
  try {
    latestMovements = await getStockMovements();
    refreshReturnLines(root);
  } catch {
    // Keep the current modal values if the refresh is temporarily unavailable.
  }
  const sourceMovement = latestMovements.find(
    (item) => item.id === sourceMovementId,
  );
  const lineRows = Array.from(
    modal.querySelectorAll<HTMLTableRowElement>(
      "#returnLines .return-line",
    ),
  );
  const lines = lineRows
    .map((row) => {
      const articleId =
        row.querySelector<HTMLSelectElement>(".return-line-article")?.value ??
        "";
      const goodQuantity =
        toNumber(row.querySelector<HTMLInputElement>(".return-line-good")?.value ?? "0") ?? 0;
      const damagedQuantity =
        toNumber(row.querySelector<HTMLInputElement>(".return-line-damaged")?.value ?? "0") ?? 0;
      const scrapQuantity =
        toNumber(row.querySelector<HTMLInputElement>(".return-line-scrap")?.value ?? "0") ?? 0;
      const pendingControlQuantity =
        toNumber(row.querySelector<HTMLInputElement>(".return-line-pending")?.value ?? "0") ?? 0;
      const completedQuantity =
        goodQuantity + damagedQuantity + scrapQuantity + pendingControlQuantity;
      return {
        articleId,
        completedQuantity,
        goodQuantity,
        damagedQuantity,
        scrapQuantity,
        pendingControlQuantity,
        remaining: Number(row.dataset.remaining ?? "0"),
        observation:
          row
            .querySelector<HTMLInputElement>(".return-line-observation")
            ?.value.trim() || notes,
      };
    })
    .filter((line) => line.completedQuantity > 0);
  const selectedArticleIds = lines.map((line) => line.articleId).filter(Boolean);
  const hasDuplicateArticle =
    new Set(selectedArticleIds).size !== selectedArticleIds.length;
  const attachmentFileName =
    root.querySelector<HTMLInputElement>("#returnAttachment")?.files?.[0]?.name;
  const toLocationId =
    modal.querySelector<HTMLSelectElement>("#returnLocation")?.value;
  if (
    !sourceMovement ||
    !toLocationId ||
    !lines.length ||
    lines.some((line) => !line.articleId) ||
    hasDuplicateArticle ||
    lines.some(
      (line) =>
        line.completedQuantity > line.remaining ||
        line.goodQuantity < 0 ||
        line.damagedQuantity < 0 ||
        line.scrapQuantity < 0 ||
        line.pendingControlQuantity < 0,
    )
  ) {
    showToast(
      root,
      hasDuplicateArticle
        ? "Chaque article ne peut apparaitre qu'une seule fois dans le retour."
        : "Sortie concernee, article, emplacement retour et quantite valide sont requis.",
      "error",
    );
    return;
  }
  try {
    const createdReturn = await createStockReturn({
      reference: "RET-" + Date.now(),
      date:
        root.querySelector<HTMLInputElement>("#returnDate")?.value ||
        new Date().toISOString(),
      sourceMovementId: sourceMovement.id,
      toLocationId,
      handledBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#returnHandledBy") ?? undefined,
      ),
      deliveredBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#returnDeliveredBy") ??
          undefined,
      ),
      receivedBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#returnReceivedBy") ??
          undefined,
      ),
      notes:
        [
          notes,
          attachmentFileName
            ? `Piece jointe: ${attachmentFileName}`
            : undefined,
        ]
          .filter(Boolean)
          .join(" - ") || undefined,
      attachmentFileName,
      lines,
    });
    if (!createdReturn.sourceRequestId) {
      throw new Error("Le retour a ete cree sans sortie source rattachee.");
    }
    const [movements, stockLevels] = await Promise.all([
      getStockMovements(),
      getStockLevels().catch(() => latestStockLevels),
    ]);
    latestMovements = movements;
    latestStockLevels = stockLevels;
    closeModal(root, "returnModal");
    updateApiBackedViews(root);
    showToast(
      root,
      lines.some((line) => line.pendingControlQuantity > 0)
        ? "Retour enregistre avec quantites a controler."
        : "Retour enregistre avec etat du materiel.",
    );
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Retour impossible.",
      "error",
    );
  }
}

async function submitStockTransfer(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#transferModal");
  if (!modal) return;
  const notes = modal
    .querySelector<HTMLTextAreaElement>("textarea")
    ?.value.trim();
  const lines = Array.from(
    modal.querySelectorAll<HTMLElement>("#transferLines .transfer-line"),
  )
    .map((row) => {
      const articleId =
        row.querySelector<HTMLSelectElement>(".transfer-article")?.value ?? "";
      const fromLocationId =
        row.querySelector<HTMLSelectElement>(".transfer-source")?.value ?? "";
      const toLocationId =
        row.querySelector<HTMLSelectElement>(".transfer-destination")?.value ??
        "";
      const quantity = toNumber(
        row.querySelector<HTMLInputElement>(".transfer-quantity")?.value ?? "0",
      );
      const available = articleStockAtLocation(articleId, fromLocationId);
      return { articleId, fromLocationId, toLocationId, quantity, available };
    })
    .filter(
      (line) =>
        line.articleId ||
        line.fromLocationId ||
        line.toLocationId ||
        line.quantity > 0,
    );
  if (
    !lines.length ||
    lines.some(
      (line) =>
        !line.articleId ||
        !line.fromLocationId ||
        !line.toLocationId ||
        line.quantity <= 0 ||
        line.quantity > line.available,
    )
  ) {
    showToast(
      root,
      "Chaque ligne doit avoir un article, une source, une destination et une quantite disponible.",
      "error",
    );
    return;
  }
  if (
    new Set(lines.map((line) => line.fromLocationId)).size > 1 ||
    new Set(lines.map((line) => line.toLocationId)).size > 1
  ) {
    showToast(
      root,
      "Les articles d'un meme transfert doivent partager la source et la destination.",
      "error",
    );
    return;
  }
  try {
    await createStockTransfer({
      reference:
        root
          .querySelector<HTMLElement>("#transferReference")
          ?.textContent?.trim() ||
        `TRF-${new Date().getFullYear()}-${Date.now()}`,
      date:
        root.querySelector<HTMLInputElement>("#transferDate")?.value ||
        new Date().toISOString(),
      fromLocationId: lines[0].fromLocationId,
      toLocationId: lines[0].toLocationId,
      handledBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#transferHandledBy") ??
          undefined,
      ),
      deliveredBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#transferDeliveredBy") ??
          undefined,
      ),
      receivedBy: selectedText(
        modal.querySelector<HTMLSelectElement>("#transferReceivedBy") ??
          undefined,
      ),
      notes,
      lines: lines.map(({ articleId, quantity }) => ({
        articleId,
        completedQuantity: quantity,
        observation: notes,
      })),
    });
    closeModal(root, "transferModal");
    updateApiBackedViews(root);
    showToast(
      root,
      "Transfert enregistre. Le stock source et destination sont mis a jour.",
    );
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Transfert impossible.",
      "error",
    );
  }
}

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

function auditSeverityBadge(severity: string) {
  if (severity === "CRITIQUE") return badge("Critique", "error");
  return badge("A verifier", "warning");
}

function auditAlertRow(alert: AuditAlert) {
  return (
    "<tr>" +
    '<td class="px-5 py-4 font-bold">' +
    escapeHtml(alert.type) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(alert.object) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(alert.location) +
    "</td>" +
    '<td class="px-5 py-4">' +
    auditSeverityBadge(alert.severity) +
    "</td>" +
    '<td class="px-5 py-4">' +
    formatDate(alert.date) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(alert.action) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(alert.status === "OUVERTE" ? "Ouverte" : alert.status, "warning") +
    "</td>" +
    '<td class="px-5 py-4 text-right"><button class="text-accent-600 font-semibold">Voir</button></td>' +
    "</tr>"
  );
}

function auditAlertFilterMatches(alert: AuditAlert) {
  if (currentAuditAlertFilter === "ALL") return true;
  if (currentAuditAlertFilter === "CRITICAL")
    return alert.severity === "CRITIQUE";
  if (currentAuditAlertFilter === "TO_VERIFY")
    return alert.severity === "A_VERIFIER" || alert.severity !== "CRITIQUE";
  if (currentAuditAlertFilter === "INVENTORY") {
    const text = (
      alert.type +
      " " +
      alert.object +
      " " +
      alert.action
    ).toLowerCase();
    return text.includes("inventaire") || text.includes("ecart");
  }
  return true;
}

function renderAuditAlerts(root: HTMLElement) {
  const alertsBody = root.querySelector<HTMLElement>("#audit-alerts tbody");
  const visible = latestAuditAlerts.filter(auditAlertFilterMatches);
  if (alertsBody) {
    alertsBody.innerHTML = visible.length
      ? visible.map(auditAlertRow).join("")
      : emptyRow(8, "Aucune alerte pour ce filtre.");
  }
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
      } as Record<string, string>
    )[action] ?? action
  );
}

function auditLogRow(log: AuditLog) {
  const after =
    log.after && typeof log.after === "object"
      ? (log.after as Record<string, unknown>)
      : {};
  const reference =
    typeof after.reference === "string"
      ? after.reference
      : (log.entityId ?? "-");
  const beforeLabel = log.before ? "Donnees avant" : "-";
  const afterLabel = reference;
  return (
    "<tr>" +
    '<td class="px-5 py-4">' +
    formatDate(log.createdAt) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(log.userId ?? "Systeme") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(auditActionLabel(log.action)) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(log.entity) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(beforeLabel) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(afterLabel) +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge("Trace", "success") +
    "</td>" +
    "</tr>"
  );
}

function vehicleStatusLabel(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponible",
    ASSIGNED: "Affecte",
    MAINTENANCE: "Maintenance",
    OUT_OF_SERVICE: "Hors service",
  };
  return labels[status] ?? status;
}

function vehicleStatusTone(
  status: string,
): "success" | "warning" | "error" | "gray" | "accent" {
  if (status === "AVAILABLE") return "success";
  if (status === "ASSIGNED") return "accent";
  if (status === "MAINTENANCE") return "warning";
  if (status === "OUT_OF_SERVICE") return "error";
  return "gray";
}

function vehicleHasDocumentWarning(vehicle: Vehicle) {
  const limit = new Date();
  limit.setDate(limit.getDate() + 30);
  const insurance = vehicle.insuranceExpiresAt
    ? new Date(vehicle.insuranceExpiresAt)
    : null;
  const visit = vehicle.technicalVisitAt
    ? new Date(vehicle.technicalVisitAt)
    : null;
  return Boolean(
    (insurance && insurance <= limit) || (visit && visit <= limit),
  );
}

function vehicleRow(vehicle: Vehicle) {
  const statusLabel =
    vehicleHasDocumentWarning(vehicle) &&
    vehicle.status !== "MAINTENANCE" &&
    vehicle.status !== "OUT_OF_SERVICE"
      ? "Document a suivre"
      : vehicleStatusLabel(vehicle.status);
  const statusTone =
    vehicleHasDocumentWarning(vehicle) &&
    vehicle.status !== "MAINTENANCE" &&
    vehicle.status !== "OUT_OF_SERVICE"
      ? "warning"
      : vehicleStatusTone(vehicle.status);
  return (
    "<tr>" +
    '<td class="px-5 py-4"><div class="font-bold">' +
    escapeHtml(vehicle.name) +
    '</div><div class="text-xs text-gray-500">' +
    escapeHtml(vehicle.code) +
    "</div></td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(vehicle.plateNumber) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(vehicle.type) +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(vehicle.assignment ?? "Disponible") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(vehicle.driverName ?? "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    escapeHtml(vehicle.apprenticeName ?? "-") +
    "</td>" +
    '<td class="px-5 py-4">' +
    badge(statusLabel, statusTone) +
    "</td>" +
    '<td class="px-5 py-4 text-right"><button data-action="openVehicleDetail(\'' +
    escapeHtml(vehicle.id) +
    '\')" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50" title="Voir la fiche"><i data-lucide="eye" class="w-4 h-4"></i></button></td>' +
    "</tr>"
  );
}

function vehicleHistoryLabel(action: string) {
  return (
    (
      {
        CREATED: "Vehicule cree",
        ASSIGNED: "Affectation",
        UNASSIGNED: "Desaffectation",
        DRIVER_CHANGED: "Chauffeur change",
        APPRENTICE_CHANGED: "Apprenti modifie",
        STATUS_CHANGED: "Statut modifie",
        MAINTENANCE: "Maintenance",
        UPDATED: "Vehicule mis a jour",
      } as Record<string, string>
    )[action] ?? action
  );
}

function vehicleHistoryIcon(action: string) {
  return (
    (
      {
        CREATED: "car-front",
        ASSIGNED: "map-pin",
        UNASSIGNED: "map-pin-off",
        DRIVER_CHANGED: "user-round-cog",
        APPRENTICE_CHANGED: "user-round",
        STATUS_CHANGED: "refresh-cw",
        MAINTENANCE: "wrench",
        UPDATED: "pencil",
      } as Record<string, string>
    )[action] ?? "history"
  );
}

function vehicleHistoryTimeline(vehicle: Vehicle) {
  const events = vehicle.history?.length
    ? vehicle.history
    : [
        {
          id: "created-" + vehicle.id,
          action: "CREATED",
          assignment: vehicle.assignment,
          previousAssignment: null,
          driverName: vehicle.driverName,
          previousDriverName: null,
          apprenticeName: vehicle.apprenticeName,
          previousApprenticeName: null,
          status: vehicle.status,
          previousStatus: null,
          observation: vehicle.notes,
          createdAt: vehicle.createdAt,
        },
      ];
  return events
    .map((event, index) => {
      const detail =
        event.action === "DRIVER_CHANGED"
          ? "Chauffeur : " +
            (event.previousDriverName ?? "-") +
            " -> " +
            (event.driverName ?? "-")
          : event.action === "ASSIGNED"
            ? "Affecte a " + (event.assignment ?? "-")
            : event.action === "UNASSIGNED"
              ? "Affectation retiree"
              : event.action === "STATUS_CHANGED" ||
                  event.action === "MAINTENANCE"
                ? "Statut : " +
                  vehicleStatusLabel(event.previousStatus ?? "-") +
                  " -> " +
                  vehicleStatusLabel(event.status ?? "-")
                : event.action === "CREATED"
                  ? "Cree le " + formatDate(event.createdAt)
                  : (event.observation ?? "");
      return (
        '<div class="relative flex gap-4 pb-6 last:pb-0">' +
        (index < events.length - 1
          ? '<div class="absolute left-5 top-10 bottom-0 w-px bg-gray-200"></div>'
          : "") +
        '<div class="relative z-10 w-10 h-10 shrink-0 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center"><i data-lucide="' +
        vehicleHistoryIcon(event.action) +
        '" class="w-4 h-4"></i></div><div class="min-w-0 pt-1"><div class="font-bold">' +
        escapeHtml(vehicleHistoryLabel(event.action)) +
        '</div><div class="text-sm text-gray-600 mt-1">' +
        escapeHtml(formatDate(event.createdAt)) +
        '</div><div class="text-sm text-gray-700 mt-1">' +
        escapeHtml(detail) +
        "</div></div></div>"
      );
    })
    .join("");
}

function setVehicleKpi(root: HTMLElement, key: string, value: number) {
  const target = root.querySelector<HTMLElement>(`[data-vehicle-kpi="${key}"]`);
  if (target) target.textContent = formatNumber(value);
}

function vehicleFilterMatches(vehicle: Vehicle) {
  if (currentVehicleFilter === "ALL") return true;
  if (currentVehicleFilter === "AVAILABLE")
    return (
      vehicle.status === "AVAILABLE" &&
      !vehicle.driverName &&
      !vehicle.assignment
    );
  if (currentVehicleFilter === "ASSIGNED")
    return (
      vehicle.status === "ASSIGNED" ||
      Boolean(vehicle.driverName) ||
      Boolean(vehicle.assignment)
    );
  if (currentVehicleFilter === "ALERTS")
    return (
      vehicleHasDocumentWarning(vehicle) ||
      vehicle.status === "MAINTENANCE" ||
      vehicle.status === "OUT_OF_SERVICE"
    );
  return true;
}

function renderVehicles(
  root: HTMLElement,
  vehicles: Vehicle[] = latestVehicles,
) {
  latestVehicles = vehicles;
  const body = root.querySelector<HTMLElement>("#vehicles-table tbody");
  const filtered = vehicles.filter(vehicleFilterMatches);
  if (body)
    body.innerHTML = filtered.length
      ? filtered.map(vehicleRow).join("")
      : emptyRow(8, "Aucun vehicule pour ce filtre.");
  setVehicleKpi(
    root,
    "active",
    vehicles.filter((vehicle) => vehicle.active).length,
  );
  setVehicleKpi(
    root,
    "assigned",
    vehicles.filter(
      (vehicle) =>
        vehicle.status === "ASSIGNED" ||
        Boolean(vehicle.driverName) ||
        Boolean(vehicle.assignment),
    ).length,
  );
  setVehicleKpi(
    root,
    "documents",
    vehicles.filter(vehicleHasDocumentWarning).length,
  );
  setVehicleKpi(
    root,
    "maintenance",
    vehicles.filter((vehicle) => vehicle.status === "MAINTENANCE").length,
  );
  root
    .querySelectorAll<HTMLElement>("#parcAuto [data-vehicle-filter]")
    .forEach((button) => {
      const active = button.dataset.vehicleFilter === currentVehicleFilter;
      button.classList.toggle("bg-accent-50", active);
      button.classList.toggle("text-accent-600", active);
      button.classList.toggle("bg-gray-100", !active);
      button.classList.toggle("text-gray-600", !active);
    });
  window.lucide?.createIcons();
}

function nextVehicleCode() {
  const numbers = latestVehicles
    .map((vehicle) => vehicle.code)
    .filter((code) => code.startsWith("VH-2026-"))
    .map((code) => Number(code.slice("VH-2026-".length)))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return "VH-2026-" + String(next).padStart(3, "0");
}

function prepareVehicleModal(root: HTMLElement) {
  const code = root.querySelector<HTMLInputElement>("#vehicleCode");
  if (code) code.value = nextVehicleCode();
  root
    .querySelectorAll<HTMLInputElement>(
      "#vehicleName,#vehiclePlate,#vehicleDriver,#vehicleApprentice,#vehicleAssignment,#vehicleInsurance,#vehicleVisit",
    )
    .forEach((input) => {
      input.value = "";
    });
  const notes = root.querySelector<HTMLTextAreaElement>("#vehicleNotes");
  if (notes) notes.value = "";
  const status = root.querySelector<HTMLSelectElement>("#vehicleStatus");
  if (status) status.value = "AVAILABLE";
}

async function submitVehicle(root: HTMLElement) {
  const name =
    root.querySelector<HTMLInputElement>("#vehicleName")?.value.trim() ?? "";
  const type =
    root.querySelector<HTMLSelectElement>("#vehicleType")?.value ?? "";
  const plateNumber =
    root.querySelector<HTMLInputElement>("#vehiclePlate")?.value.trim() ?? "";
  if (!type || !plateNumber) {
    showToast(root, "Type et immatriculation sont requis.", "error");
    return;
  }
  try {
    await createVehicle({
      name,
      type,
      plateNumber,
      assignment:
        root
          .querySelector<HTMLInputElement>("#vehicleAssignment")
          ?.value.trim() || undefined,
      driverName:
        root.querySelector<HTMLInputElement>("#vehicleDriver")?.value.trim() ||
        undefined,
      apprenticeName:
        root
          .querySelector<HTMLInputElement>("#vehicleApprentice")
          ?.value.trim() || undefined,
      insuranceExpiresAt:
        root
          .querySelector<HTMLInputElement>("#vehicleInsurance")
          ?.value.trim() || undefined,
      technicalVisitAt:
        root.querySelector<HTMLInputElement>("#vehicleVisit")?.value.trim() ||
        undefined,
      notes:
        root
          .querySelector<HTMLTextAreaElement>("#vehicleNotes")
          ?.value.trim() || undefined,
    });
    closeModal(root, "vehicleModal");
    updateApiBackedViews(root);
    showToast(root, "Vehicule cree et ajoute au parc auto.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error ? error.message : "Creation vehicule impossible.",
      "error",
    );
  }
}

function renderVehicleDetail(
  root: HTMLElement,
  id: string,
  editing = false,
  focusField?: string,
) {
  const vehicle = latestVehicles.find((item) => item.id === id);
  if (!vehicle) {
    showToast(root, "Vehicule introuvable dans la liste chargee.", "error");
    return false;
  }
  selectedVehicleId = id;
  const detailModal = root.querySelector<HTMLElement>("#vehicleDetailModal");
  if (!detailModal) return false;

  const title = detailModal.querySelector<HTMLElement>("#vehicleDetailTitle");
  const subtitle = detailModal.querySelector<HTMLElement>(
    "#vehicleDetailSubtitle",
  );
  const actions = detailModal.querySelector<HTMLElement>(
    "#vehicleDetailActions",
  );
  const cards = detailModal.querySelector<HTMLElement>("#vehicleDetailCards");
  const contentTitle = detailModal.querySelector<HTMLElement>(
    "#vehicleDetailContentTitle",
  );
  const fields = detailModal.querySelector<HTMLElement>("#vehicleDetailFields");
  const history = detailModal.querySelector<HTMLElement>(
    "#vehicleHistoryPanel",
  );
  const historyWrapper = detailModal.querySelector<HTMLElement>(
    "#vehicleHistoryPanelWrapper",
  );

  if (editing) {
    if (title) title.textContent = `${vehicle.code} - Modifier le vehicule`;
    if (subtitle) {
      subtitle.textContent =
        focusField === "driver"
          ? "Modification directe du chauffeur et de l'apprenti."
          : "Modifier directement les caracteristiques et le suivi du vehicule.";
    }
    if (contentTitle) {
      contentTitle.textContent =
        focusField === "driver"
          ? "Changer le chauffeur et l'apprenti"
          : "Modifier les informations du vehicule";
    }

    if (cards) {
      cards.innerHTML = "";
      cards.classList.add("hidden");
    }
    if (historyWrapper) historyWrapper.classList.add("hidden");

    const typeOptionsHtml = ["Voiture", "Pick-up", "Moto", "Camion", "Engin"]
      .map((t) => option(t, t))
      .join("");

    const statusOptionsHtml =
      option("AVAILABLE", "Disponible") +
      option("ASSIGNED", "Affecte") +
      option("MAINTENANCE", "Maintenance") +
      option("OUT_OF_SERVICE", "Hors service");

    const driverHighlightClass =
      focusField === "driver"
        ? " ring-2 ring-accent-500 border-accent-500 bg-accent-50/30 rounded-xl"
        : "";

    if (fields) {
      fields.innerHTML = `
        <form id="vehicleDetailEditForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label>
            <span class="text-sm font-semibold">Nom / modele</span>
            <input name="name" value="${escapeHtml(vehicle.name)}" placeholder="Ex: Toyota Hilux" class="mt-2 w-full h-11 border rounded-lg px-3">
          </label>
          <label>
            <span class="text-sm font-semibold">Type</span>
            <select name="type" class="mt-2 w-full h-11 border rounded-lg px-3 bg-white">
              ${typeOptionsHtml}
            </select>
          </label>
          <label>
            <span class="text-sm font-semibold">Immatriculation</span>
            <input name="plateNumber" value="${escapeHtml(vehicle.plateNumber)}" placeholder="Ex: 1234 AB 01" class="mt-2 w-full h-11 border rounded-lg px-3">
          </label>
          <label class="p-2 border border-transparent${driverHighlightClass}">
            <span class="text-sm font-semibold text-accent-700">Chauffeur</span>
            <input name="driverName" id="vehicleInlineDriverInput" value="${escapeHtml(vehicle.driverName ?? "")}" placeholder="Nom du chauffeur" class="mt-2 w-full h-11 border rounded-lg px-3 bg-white">
          </label>
          <label class="p-2 border border-transparent${driverHighlightClass}">
            <span class="text-sm font-semibold text-accent-700">Apprenti</span>
            <input name="apprenticeName" id="vehicleInlineApprenticeInput" value="${escapeHtml(vehicle.apprenticeName ?? "")}" placeholder="Nom de l'apprenti" class="mt-2 w-full h-11 border rounded-lg px-3 bg-white">
          </label>
          <label class="p-2">
            <span class="text-sm font-semibold">Affectation</span>
            <input name="assignment" value="${escapeHtml(vehicle.assignment ?? "")}" placeholder="Ex: Projet Riviera, Direction..." class="mt-2 w-full h-11 border rounded-lg px-3">
          </label>
          <label>
            <span class="text-sm font-semibold">Statut</span>
            <select name="status" class="mt-2 w-full h-11 border rounded-lg px-3 bg-white">
              ${statusOptionsHtml}
            </select>
          </label>
          <label>
            <span class="text-sm font-semibold">Assurance expire le</span>
            <input name="insuranceExpiresAt" type="date" value="${escapeHtml(vehicle.insuranceExpiresAt?.slice(0, 10) ?? "")}" class="mt-2 w-full h-11 border rounded-lg px-3">
          </label>
          <label>
            <span class="text-sm font-semibold">Visite technique</span>
            <input name="technicalVisitAt" type="date" value="${escapeHtml(vehicle.technicalVisitAt?.slice(0, 10) ?? "")}" class="mt-2 w-full h-11 border rounded-lg px-3">
          </label>
          <label class="md:col-span-3">
            <span class="text-sm font-semibold">Observation</span>
            <textarea name="notes" placeholder="Notes ou observations..." class="mt-2 w-full min-h-20 border rounded-lg px-3 py-2">${escapeHtml(vehicle.notes ?? "")}</textarea>
          </label>
        </form>
      `;

      const form = fields.querySelector<HTMLFormElement>(
        "#vehicleDetailEditForm",
      );
      if (form) {
        const typeSelect = form.querySelector<HTMLSelectElement>(
          'select[name="type"]',
        );
        const statusSelect = form.querySelector<HTMLSelectElement>(
          'select[name="status"]',
        );
        if (typeSelect) typeSelect.value = vehicle.type;
        if (statusSelect) statusSelect.value = vehicle.status;
      }
      if (focusField === "driver") {
        setTimeout(() => {
          const driverInput = fields.querySelector<HTMLInputElement>(
            "#vehicleInlineDriverInput",
          );
          driverInput?.focus();
          driverInput?.select();
        }, 50);
      }
    }

    if (actions) {
      actions.innerHTML = `
        <button title="Annuler" data-action="cancelVehicleEdit" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="x" class="w-4 h-4"></i></button>
        <button title="Enregistrer" data-action="submitVehicleEdit" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-600 text-white hover:bg-accent-500"><i data-lucide="save" class="w-4 h-4"></i></button>
      `;
    }
  } else {
    if (title) title.textContent = `${vehicle.code} - ${vehicle.name}`;
    if (subtitle) {
      subtitle.textContent = vehicle.assignment
        ? "Vehicule rattache a " + vehicle.assignment + "."
        : "Vehicule disponible ou sans affectation renseignee.";
    }
    if (contentTitle) contentTitle.textContent = "Suivi & Affectation";

    if (cards) {
      cards.classList.remove("hidden");
      cards.innerHTML = [
        ["Immatriculation", vehicle.plateNumber],
        ["Type", vehicle.type],
        ["Chauffeur", vehicle.driverName ?? "-"],
        ["Apprenti", vehicle.apprenticeName ?? "-"],
      ]
        .map(
          ([label, value]) =>
            '<div class="p-4 rounded-xl bg-gray-50 border"><div class="text-xs font-semibold text-gray-500">' +
            escapeHtml(label) +
            '</div><div class="font-bold mt-1">' +
            escapeHtml(value) +
            "</div></div>",
        )
        .join("");
    }

    if (fields) {
      fields.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          ${[
            ["Affectation", vehicle.assignment ?? "Disponible"],
            [
              "Assurance",
              vehicle.insuranceExpiresAt
                ? formatDate(vehicle.insuranceExpiresAt)
                : "Non renseignee",
            ],
            [
              "Visite technique",
              vehicle.technicalVisitAt
                ? formatDate(vehicle.technicalVisitAt)
                : "Non renseignee",
            ],
            ["Statut", vehicleStatusLabel(vehicle.status)],
            ["Observation", vehicle.notes ?? "-"],
            ["Derniere mise a jour", formatDate(vehicle.updatedAt)],
          ]
            .map(
              ([label, value]) =>
                '<div><span class="text-gray-500">' +
                escapeHtml(label) +
                '</span><div class="font-semibold mt-1">' +
                escapeHtml(value) +
                "</div></div>",
            )
            .join("")}
        </div>
      `;
    }

    if (history) {
      history.innerHTML = vehicleHistoryTimeline(vehicle);
      history.classList.add("hidden");
    }
    if (historyWrapper) historyWrapper.classList.remove("hidden");

    if (actions) {
      actions.innerHTML = `
        <button title="Modifier" data-action="editVehicleDetail" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-600 text-white hover:bg-accent-500"><i data-lucide="pencil" class="w-4 h-4"></i></button>
        <button title="Changer chauffeur" data-action="changeVehicleDriver" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="user-round-cog" class="w-4 h-4"></i></button>
        <button title="Planifier maintenance" data-action="setVehicleMaintenance" class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border text-gray-700 hover:bg-gray-50"><i data-lucide="wrench" class="w-4 h-4"></i></button>
        <button title="Fermer" class="inline-flex items-center justify-center w-10 h-10 rounded-lg border text-gray-500 hover:text-gray-900" data-action="closeModal('vehicleDetailModal')"><i data-lucide="x" class="w-5 h-5"></i></button>
      `;
    }
  }

  window.lucide?.createIcons();
  return true;
}

function openVehicleDetail(root: HTMLElement, id: string) {
  selectedVehicleId = id;
  if (renderVehicleDetail(root, id, false)) {
    openModal(root, "vehicleDetailModal");
  }
}

function editVehicleDetail(root: HTMLElement) {
  if (selectedVehicleId) {
    renderVehicleDetail(root, selectedVehicleId, true);
  }
}

function changeVehicleDriver(root: HTMLElement) {
  if (selectedVehicleId) {
    renderVehicleDetail(root, selectedVehicleId, true, "driver");
  }
}

function cancelVehicleEdit(root: HTMLElement) {
  if (selectedVehicleId) {
    renderVehicleDetail(root, selectedVehicleId, false);
  }
}

async function setVehicleMaintenance(root: HTMLElement) {
  if (!selectedVehicleId) return;
  const vehicle = latestVehicles.find((item) => item.id === selectedVehicleId);
  if (!vehicle) return;
  try {
    const updated = await updateVehicle(vehicle.id, { status: "MAINTENANCE" });
    latestVehicles = latestVehicles.map((item) =>
      item.id === updated.id ? updated : item,
    );
    renderVehicleDetail(root, updated.id, false);
    renderVehicles(root);
    showToast(root, "Vehicule passe en maintenance.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error
        ? error.message
        : "Mise en maintenance impossible.",
      "error",
    );
  }
}

function toggleVehicleHistory(root: HTMLElement) {
  root
    .querySelector<HTMLElement>("#vehicleHistoryPanel")
    ?.classList.toggle("hidden");
  window.lucide?.createIcons();
}

async function openVehicleEdit(root: HTMLElement, focusDriver = false) {
  if (focusDriver) changeVehicleDriver(root);
  else editVehicleDetail(root);
}

async function submitVehicleEdit(root: HTMLElement) {
  if (!selectedVehicleId) return;
  const form = root.querySelector<HTMLFormElement>("#vehicleDetailEditForm");
  if (!form) return;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const updated = await updateVehicle(selectedVehicleId, {
      name: String(data.name ?? "").trim() || undefined,
      type: String(data.type ?? "") || undefined,
      plateNumber: String(data.plateNumber ?? "").trim() || undefined,
      driverName: String(data.driverName ?? "").trim() || null,
      apprenticeName: String(data.apprenticeName ?? "").trim() || null,
      assignment: String(data.assignment ?? "").trim() || null,
      status: String(data.status ?? "AVAILABLE"),
      insuranceExpiresAt: data.insuranceExpiresAt
        ? String(data.insuranceExpiresAt)
        : null,
      technicalVisitAt: data.technicalVisitAt
        ? String(data.technicalVisitAt)
        : null,
      notes: String(data.notes ?? "").trim() || null,
    });
    latestVehicles = latestVehicles.map((item) =>
      item.id === updated.id ? updated : item,
    );
    renderVehicleDetail(root, updated.id, false);
    renderVehicles(root);
    showToast(root, "Vehicule mis a jour.");
  } catch (error) {
    showToast(
      root,
      error instanceof Error
        ? error.message
        : "Modification vehicule impossible.",
      "error",
    );
  }
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

function userRow(user: StockUser) {
  const fullName = userDisplayName(user);
  const role = user.roles[0] ?? "GESTIONNAIRE_STOCK";
  const identity = userIdentity(user);
  const contact = user.email ?? "Email non renseigne";
  return `<tr><td class="px-5 py-4"><div class="font-bold">${escapeHtml(fullName)}</div><div class="text-xs text-gray-500">${escapeHtml(user.roles.map(roleLabel).join(", "))}</div></td><td class="px-5 py-4"><div class="font-semibold">${escapeHtml(identity)}</div><div class="text-xs text-gray-500">${escapeHtml(contact)}</div></td><td class="px-5 py-4">${badge(roleLabel(role), role === "ADMIN_STOCK" ? "accent" : role === "AUDIT" ? "warning" : "success")}</td><td class="px-5 py-4">${escapeHtml(accessLabel(user.roles))}</td><td class="px-5 py-4">${badge(user.active ? "Actif" : "Inactif", user.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><button data-action="openUserDetail('${escapeHtml(user.id)}')" title="Voir utilisateur" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600"><i data-lucide="eye" class="w-4 h-4"></i></button></td></tr>`;
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
      const returnsBody = root.querySelector<HTMLElement>("#retours tbody");
      const returns = movements.filter(
        (movement) =>
          movement.type === "RETURN" || movement.type === "TRANSFER",
      );
      if (returnsBody)
        returnsBody.innerHTML = returns.length
          ? returns.map(returnTransferRow).join("")
          : emptyRow(8, "Aucun retour ou transfert en base pour le moment.");
      setText(
        root,
        "#returnsExpectedCount",
        returns.filter(
          (movement) =>
            movement.type === "RETURN" && movement.status !== "COMPLETED",
        ).length,
      );
      setText(
        root,
        "#transfersOpenCount",
        returns.filter(
          (movement) =>
            movement.type === "TRANSFER" && movement.status !== "COMPLETED",
        ).length,
      );
      setText(
        root,
        "#returnsReviewCount",
        returns.filter(
          (movement) =>
            movement.status === "SUBMITTED" || movement.status === "PREPARED",
        ).length,
      );
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
      const body = root.querySelector<HTMLElement>("#equipments-table tbody");
      if (body)
        body.innerHTML = equipments.length
          ? equipments.map(equipmentRow).join("")
          : emptyRow(8, "Aucun equipement individuel en base pour le moment.");
      window.lucide?.createIcons();
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
        alerts.filter((alert) => alert.type === "Rupture").length,
      );
      setAuditCardValue(
        root,
        "Ecarts inventaire",
        alerts.filter((alert) => alert.type === "Ecart inventaire").length,
      );
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getAuditLogs()
    .then((logs) => {
      const logsBody = root.querySelector<HTMLElement>("#audit-journal tbody");
      if (logsBody)
        logsBody.innerHTML = logs.length
          ? logs.map(auditLogRow).join("")
          : emptyRow(7, "Aucune trace audit pour le moment.");
      latestAuditLogs = logs;
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
type HeaderAction = {
  label: string;
  icon: string;
  modal?: string;
  action?: string;
  variant: "primary" | "secondary";
};

function canUseHeaderAction(view: string, action: HeaderAction) {
  if (!currentUser) return false;
  if (hasRole("ADMIN_STOCK")) return true;
  if (action.action?.startsWith("exportData"))
    return (
      hasRole("DIRECTION") || hasRole("AUDIT") || hasRole("GESTIONNAIRE_STOCK")
    );
  if (action.modal === "importModal") return hasRole("GESTIONNAIRE_STOCK");
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
        label: "Importer XLS",
        icon: "upload",
        modal: "importModal",
        variant: "secondary",
      },
    ],
    entrees: [
      {
        label: "Importer XLS",
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
        label: "Importer XLS",
        icon: "upload",
        modal: "importModal",
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
      { label: "Modele Excel", icon: "download", variant: "secondary" },
      {
        label: "Importer XLS",
        icon: "upload",
        modal: "importModal",
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
    historique: [
      {
        label: "Export complet",
        icon: "file-down",
        action: "exportData('all')",
        variant: "secondary",
      },
    ],
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
    historique: "Historique & exports",
    users: "Utilisateurs & roles",
  };
  if (crumb) crumb.textContent = titles[view] ?? "Accueil Module";
  setViewActions(root, view);
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
  if (!row.code.trim()) errors.push("Code obligatoire");
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
  if (Number.isFinite(index) && row.code.trim()) {
    const codeKey = articleImportKey(row.code);
    const occurrences = articleImportRows.filter(
      (other) => articleImportKey(other.code) === codeKey,
    ).length;
    if (occurrences > 1) errors.push("Code en doublon dans le fichier");
  }
  const existing =
    Boolean(row.code.trim()) &&
    latestArticles.some(
      (article) =>
        articleImportKey(article.code) === articleImportKey(row.code),
    );
  if (existing) errors.push("Code deja present dans le referentiel");
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
    ["code", "Code"],
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
  table.innerHTML = `<div class="overflow-auto border rounded-xl"><table class="w-full min-w-[1250px] text-sm"><thead class="bg-gray-50"><tr><th class="p-3 text-left">Ligne</th>${fields.map(([, label]) => `<th class="p-3 text-left">${label}</th>`).join("")}<th class="p-3 text-left">Validation</th></tr></thead><tbody class="divide-y">${articleImportRows.map((row, index) => `<tr class="${row.errors.length ? "bg-error-50/40" : "bg-success-50/20"}"><td class="p-2 font-bold">${index + 2}</td>${fields.map(([field]) => `<td class="p-2"><input data-import-row="${index}" data-import-field="${field}" value="${escapeHtml(row[field])}" class="w-32 h-9 border rounded px-2 bg-white"></td>`).join("")}<td class="p-2 ${row.errors.length ? "text-error-700" : "text-success-700"} font-semibold">${row.errors.length ? escapeHtml(row.errors.join(" • ")) : "Valide"}</td></tr>`).join("")}</tbody></table></div>`;
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
        code: row.code.trim(),
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
  const values = referentialImportFields[referentialImportType].map(
    ([field]) => row[field] ?? "",
  );
  const errors: string[] = [];
  if (!values[0]?.trim()) errors.push("Code ou identifiant obligatoire");
  const required =
    referentialImportType === "supplier" ||
    referentialImportType === "client" ||
    referentialImportType === "project" ||
    referentialImportType === "site" ||
    referentialImportType === "location" ||
    referentialImportType === "teamService"
      ? values[1]
      : values[0];
  if (!required?.trim()) errors.push("Nom ou designation obligatoire");
  const key = articleImportKey(values[0]);
  if (
    key &&
    referentialImportRows.filter(
      (item) =>
        articleImportKey(
          item[referentialImportFields[referentialImportType][0][0]],
        ) === key,
    ).length > 1
  )
    errors.push("Code en doublon dans le fichier");
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
    (item) =>
      articleImportKey(
        (item as { code?: string; matricule?: string }).code ??
          (item as { matricule?: string }).matricule,
      ) === key,
  );
  if (key && existing) errors.push("Code deja present dans le referentiel");
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
  table.innerHTML = `<div class="overflow-auto border rounded-xl"><table class="w-full min-w-[900px] text-sm"><thead class="bg-gray-50"><tr><th class="p-3 text-left">Ligne</th>${fields.map(([, label]) => `<th class="p-3 text-left">${label}</th>`).join("")}<th class="p-3 text-left">Validation</th></tr></thead><tbody class="divide-y">${referentialImportRows.map((row, index) => `<tr class="${row.errors.length ? "bg-error-50/40" : "bg-success-50/20"}"><td class="p-2 font-bold">${index + 2}</td>${fields.map(([field]) => `<td class="p-2"><input data-import-row="${index}" data-import-field="${field}" value="${escapeHtml(row[field] ?? "")}" class="w-32 h-9 border rounded px-2 bg-white"></td>`).join("")}<td class="p-2 font-semibold ${row.errors.length ? "text-error-700" : "text-success-700"}">${row.errors.length ? escapeHtml(row.errors.join(" • ")) : "Valide"}</td></tr>`).join("")}</tbody></table></div>`;
  if (save) {
    save.disabled = valid === 0;
    save.classList.toggle("opacity-50", !valid);
    save.classList.toggle("cursor-not-allowed", !valid);
  }
  window.lucide?.createIcons();
}
function referentialCodeExample(type: ReferentialImportType) {
  const examples: Record<ReferentialImportType, string> = {
    article: "FO-0001",
    supplier: "FRN-001",
    client: "CLI-001",
    project: "PROJ-2026-001",
    site: "SITE-001",
    employee: "EMP-001",
    location: "MAG-001",
    teamService: "SRV-001",
  };
  return examples[type];
}
function downloadReferentialTemplate(root: HTMLElement) {
  const fields = referentialImportFields[referentialImportType];
  const worksheet = XLSX.utils.aoa_to_sheet([
    fields.map(([, label]) => label),
    fields.map(([field]) =>
      field === "code"
        ? referentialCodeExample(referentialImportType)
        : field === "category"
          ? "Exemple"
          : "",
    ),
  ]);
  worksheet["!cols"] = fields.map(([, label]) => ({
    wch: Math.max(18, label.length + 2),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Import");
  XLSX.writeFile(
    workbook,
    `modele-import-${referentialImportType}-stock-hub.xlsx`,
  );
  showToast(root, "Modele Excel telecharge.");
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
          code: value("code")!,
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
          code: value("code")!,
          name: value("name")!,
          contact: value("contact"),
          phone: value("phone"),
          email: value("email"),
        });
      else if (type === "employee")
        await createEmployee({
          matricule: value("code")!,
          lastName: value("lastName")!,
          firstName: value("firstName")!,
          department: value("department"),
          role: value("role"),
          phone: value("phone"),
        });
      else if (type === "teamService")
        await createTeamService({
          code: value("code")!,
          name: value("name")!,
          type: value("type"),
          manager: value("manager"),
        });
      else if (type === "project")
        await createProject({
          code: value("code")!,
          name: value("name")!,
          client: value("client"),
          region: value("region"),
          city: value("city"),
          startDate: value("startDate"),
          endDate: value("endDate"),
        });
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
          code: value("code")!,
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

function downloadArticleImportTemplate(root: HTMLElement) {
  const headers = [
    "Code",
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
    "FO-0001",
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
  const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
  worksheet["!cols"] = headers.map((header) => ({
    wch: Math.max(header.length + 2, 18),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Articles");
  XLSX.writeFile(workbook, "modele-import-articles-stock-hub.xlsx");
  showToast(
    root,
    "Modele Excel telecharge. Complete-le sans modifier les noms de colonnes.",
  );
}

function openModal(root: HTMLElement, id: string) {
  setVisible(root.querySelector(`#${CSS.escape(id)}`), true);
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
  const exitActionsMatch = action.match(/^toggleExitActions\('([^']+)'\)/);
  if (exitActionsMatch)
    return { type: "toggle-exit-actions", id: exitActionsMatch[1] } as const;
  const panelMatch = action.match(/^togglePanel\('([^']+)'\)/);
  if (panelMatch) return { type: "toggle-panel", id: panelMatch[1] } as const;
  if (action === "refreshHistory") return { type: "refresh-history" } as const;
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
  const equipmentDetailMatch = action.match(
    /^openEquipmentDetail\('([^']+)'\)/,
  );
  if (equipmentDetailMatch)
    return { type: "equipment-detail", id: equipmentDetailMatch[1] } as const;
  const stockDrawerMatch = action.match(/^openStockDrawer\('([^']+)'\)/);
  if (stockDrawerMatch)
    return { type: "stock-drawer-open", id: stockDrawerMatch[1] } as const;
  if (action === "closeStockDrawer")
    return { type: "stock-drawer-close" } as const;
  if (action === "refreshStockDrawer")
    return { type: "stock-drawer-refresh" } as const;
  const stockSortMatch = action.match(/^sortStock\('([^']+)'\)/);
  if (stockSortMatch)
    return { type: "stock-sort", key: stockSortMatch[1] } as const;
  const refMatch = action.match(/^showRef\('([^']+)'/);
  if (refMatch) return { type: "ref", id: refMatch[1] } as const;
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
      if (parsed.type === "equipment-detail")
        openEquipmentDetail(root, parsed.id);
      if (parsed.type === "toggle-vehicle-history") toggleVehicleHistory(root);
      if (parsed.type === "exit-filter") {
        currentExitFilter = parsed.filter;
        renderExitRegistry(root);
      }
      if (parsed.type === "entry-filter") {
        currentEntryFilter = parsed.filter;
        renderEntriesRegistry(root);
      }
      if (parsed.type === "vehicle-filter") {
        currentVehicleFilter = parsed.filter;
        renderVehicles(root);
      }
      if (parsed.type === "audit-filter") {
        currentAuditAlertFilter = parsed.filter;
        renderAuditAlerts(root);
      }
      if (parsed.type === "audit-tab") {
        showAuditTab(root, parsed.id, target);
      }
      if (parsed.type === "refresh-history") renderHistory(root);
      if (parsed.type === "export") exportData(root, parsed.kind);
      if (parsed.type === "stock-filter") renderStock(root);
      if (parsed.type === "stock-drawer-open") openStockDrawer(root, parsed.id);
      if (parsed.type === "stock-drawer-close") closeStockDrawer(root);
      if (parsed.type === "stock-drawer-refresh") renderStockDrawer(root);
      if (parsed.type === "stock-sort") {
        if (stockSortKey === parsed.key) {
          stockSortDir = stockSortDir === "asc" ? "desc" : "asc";
        } else {
          stockSortKey = parsed.key;
          stockSortDir = "asc";
        }
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
      if (
        [
          "stockLocationSelect",
          "stockCategorySelect",
          "stockStatusSelect",
        ].includes(target.id)
      ) {
        renderStock(root);
      }
      if (target.closest("#materialRequestLines")) {
        syncMaterialPreparationState(root);
      }
    };
    const onInput = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.id === "stockSearchInput") renderStock(root);
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
