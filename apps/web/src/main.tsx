import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { StockHubShell } from "./components/StockHubShell";
import { createArticle, createClient, createEmployee, createExitRequest, createInventoryAdjustment, createLocation, createProject, createStockEntry, createStockExit, createStockReturn, createStockTransfer, createSupplier, createTeamService, createUser, getArticles, getAuditAlerts, getAuditLogs, getClients, getDashboardSummary, getEmployees, getEquipments, getLocations, getProjects, getStockLevels, getStockMovements, getSuppliers, getTeamServices, getUsers, getVehicles, loginUser, prepareExitRequest, uploadExitRequestProof, createVehicle, updateArticle, updateClient, updateEmployee, updateEquipment, updateLocation, updateProject, updateSupplier, updateTeamService, updateUser, type Article, type AuditAlert, type AuditLog, type Client, type Employee, type Equipment, type StockLevel, type StockLocation, type StockMovement, type StockProject, type StockUser, type Supplier, type TeamService, type Vehicle } from "./api";
import "./template.css";

declare global {
  interface Window {
    lucide?: { createIcons: () => void };
  }
}

let latestMovements: StockMovement[] = [];
let currentExitFilter = "ALL";
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
let selectedUserId: string | null = null;
let selectedExitRequestId: string | null = null;
let currentUser: StockUser | null = readStoredUser();

function readStoredUser(): StockUser | null {
  const raw = localStorage.getItem("stock-hub.user");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StockUser;
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

function setLoginError(root: HTMLElement, message: string | null) {
  const error = root.querySelector<HTMLElement>("#loginError");
  if (!error) return;
  error.textContent = message ?? "";
  error.classList.toggle("hidden", !message);
}

function rolePriority(roles: string[]) {
  const order = ["ADMIN_STOCK", "DIRECTION", "GESTIONNAIRE_STOCK", "AUDIT", "CHEF_PROJET", "RH"];
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
    .filter((level) => level.article.id === articleId && (!locationId || level.location.id === locationId))
    .reduce((sum, level) => sum + Number(level.quantity ?? 0), 0);
}

function canAccessView(view: string) {
  if (!currentUser) return false;
  if (hasRole("ADMIN_STOCK")) return true;
  if (view === "home") return true;
  const roles = currentUser.roles;
  const allowedByRole: Record<string, string[]> = {
    GESTIONNAIRE_STOCK: ["entrees", "sortie", "retours", "inventaire", "stock"],
    AUDIT: ["inventaire", "audit", "historique", "stock"],
    RH: ["stock", "equipements", "parcAuto"],
    DIRECTION: ["home", "stock", "audit", "historique"],
    CHEF_PROJET: ["stock", "sortie", "equipements"]
  };
  return roles.some((role) => allowedByRole[role]?.includes(view));
}

function applyRoleAccess(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".nav-btn[data-view]").forEach((button) => {
    const view = button.dataset.view ?? "";
    button.classList.toggle("hidden", !canAccessView(view));
  });
}

function updateCurrentUserDisplay(root: HTMLElement) {
  const storedUser = readStoredUser();
  const user = currentUser ?? storedUser;
  if (user) currentUser = user;
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : "Utilisateur";
  const primaryRole = user ? roleLabel(rolePriority(user.roles)) : "Non connecte";
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim().toUpperCase() || user.email.slice(0, 2).toUpperCase() : "--";
  const nameNode = root.querySelector<HTMLElement>("#currentUserName");
  const roleNode = root.querySelector<HTMLElement>("#currentUserRole");
  const initialsNodes = root.querySelectorAll<HTMLElement>("#currentUserInitials, #topUserInitials");
  if (nameNode) nameNode.textContent = fullName;
  if (roleNode) roleNode.textContent = primaryRole;
  initialsNodes.forEach((node) => { node.textContent = initials; });
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

function badge(label: string, tone: "success" | "warning" | "error" | "gray" | "accent" = "gray") {
  const classes = {
    success: "bg-success-50 text-success-700",
    warning: "bg-warning-50 text-warning-700",
    error: "bg-error-50 text-error-700",
    gray: "bg-gray-100 text-gray-700",
    accent: "bg-accent-50 text-accent-600"
  }[tone];
  return `<span class="px-2 py-1 rounded-full ${classes} text-xs font-bold">${escapeHtml(label)}</span>`;
}

function setCardValue(root: HTMLElement, label: string, value: number | string) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>("#home .bg-white.rounded-xl"));
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
  return value.getFullYear() === today.getFullYear()
    && value.getMonth() === today.getMonth()
    && value.getDate() === today.getDate();
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
  const tracking = article.trackingMode === "INDIVIDUAL" ? "Suivi individuel" : "Article en quantite";
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(article.code)}</td><td class="px-5 py-4">${escapeHtml(article.designation)}</td><td class="px-5 py-4">${escapeHtml(article.category)}</td><td class="px-5 py-4">${escapeHtml(article.unit)}</td><td class="px-5 py-4">${badge(tracking)}</td><td class="px-5 py-4 text-gray-500">A definir</td><td class="px-5 py-4 text-right">${formatNumber(article.minimumStock)}</td><td class="px-5 py-4 text-right">${formatNumber(article.referencePrice)}</td><td class="px-5 py-4">${badge(article.active ? "Actif" : "Inactif", article.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('article','${article.id}')`)}</td></tr>`;
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
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(supplier.code)}</td><td class="px-5 py-4">${escapeHtml(supplier.name)}</td><td class="px-5 py-4">${escapeHtml(supplier.contact ?? "-")}</td><td class="px-5 py-4">${escapeHtml(supplier.phone ?? "-")}</td><td class="px-5 py-4">${escapeHtml(supplier.email ?? "-")}</td><td class="px-5 py-4 text-gray-500">A definir</td><td class="px-5 py-4">${badge(supplier.active ? "Actif" : "Inactif", supplier.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('supplier','${supplier.id}')`)}</td></tr>`;
}

function projectRow(project: StockProject) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(project.code)}</td><td class="px-5 py-4">${escapeHtml(project.name)}</td><td class="px-5 py-4">${escapeHtml(projectClientName(project))}</td><td class="px-5 py-4">${escapeHtml(project.region ?? "-")}</td><td class="px-5 py-4">${escapeHtml(project.city ?? "-")}</td><td class="px-5 py-4">${escapeHtml(projectManagerName(project.projectManagerId))}</td><td class="px-5 py-4">${badge(project.active ? "Actif" : "Inactif", project.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('project','${project.id}')`)}</td></tr>`;
}

function locationRow(location: StockLocation) {
  const type = location.type.replace(/_/g, " ");
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(location.code)}</td><td class="px-5 py-4">${escapeHtml(location.name)}</td><td class="px-5 py-4">${escapeHtml(type)}</td><td class="px-5 py-4">${escapeHtml(location.address ?? "-")}</td><td class="px-5 py-4">${escapeHtml(location.responsible ?? "-")}</td><td class="px-5 py-4">${badge(location.active ? "Actif" : "Inactif", location.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('location','${location.id}')`)}</td></tr>`;
}

function siteRow(location: StockLocation) {
  const project = latestProjects.find((item) => item.id === location.projectId);
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(location.code)}</td><td class="px-5 py-4">${escapeHtml(project ? `${project.code} - ${project.name}` : "-")}</td><td class="px-5 py-4">${escapeHtml(location.name)}</td><td class="px-5 py-4">${escapeHtml(project?.region ?? "-")}</td><td class="px-5 py-4">${escapeHtml(project?.city ?? "-")}</td><td class="px-5 py-4">${badge(location.active ? "Ouvert" : "Ferme", location.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('site','${location.id}')`)}</td></tr>`;
}

function employeeRefRow(employee: Employee) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(employee.matricule)}</td><td class="px-5 py-4">${escapeHtml(employee.lastName)}</td><td class="px-5 py-4">${escapeHtml(employee.firstName)}</td><td class="px-5 py-4">${escapeHtml(employee.role ?? "-")}</td><td class="px-5 py-4">${escapeHtml(employee.department ?? "-")}</td><td class="px-5 py-4">${badge(employee.active ? "Actif" : "Inactif", employee.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('employee','${employee.id}')`)}</td></tr>`;
}

function stockStatus(level: StockLevel) {
  if (level.quantity <= 0) return badge("Rupture", "error");
  if (level.quantity <= level.article.minimumStock) return badge("Rupture proche", "warning");
  return badge("Disponible", "success");
}

function stockRow(level: StockLevel) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(level.article.designation)}</td><td class="px-5 py-4">${escapeHtml(level.article.category)}</td><td class="px-5 py-4">${escapeHtml(level.location.name)}</td><td class="px-5 py-4 text-right text-gray-400">-</td><td class="px-5 py-4 text-right text-gray-400">-</td><td class="px-5 py-4 text-right text-gray-400">-</td><td class="px-5 py-4 text-right font-bold">${formatNumber(level.quantity)}</td><td class="px-5 py-4">${stockStatus(level)}</td></tr>`;
}

function reapproLevels() {
  return latestStockLevels.filter((level) => level.article.minimumStock > 0 && level.quantity <= level.article.minimumStock);
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
  return "<tr>"
    + "<td class=\"px-5 py-4\"><div class=\"font-bold\">" + escapeHtml(level.article.designation) + "</div><div class=\"text-xs text-gray-500\">" + escapeHtml(level.article.code) + "</div></td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(level.location.name) + "</td>"
    + "<td class=\"px-5 py-4 text-right font-bold " + quantityClass + "\">" + formatNumber(level.quantity) + "</td>"
    + "<td class=\"px-5 py-4 text-right\">" + formatNumber(level.article.minimumStock) + "</td>"
    + "<td class=\"px-5 py-4 text-right font-bold\">" + formatNumber(reorder) + "</td>"
    + "<td class=\"px-5 py-4 text-right\">" + formatNumber(value) + "</td>"
    + "<td class=\"px-5 py-4\">" + badge(rupture ? "Rupture" : "Stock bas", rupture ? "error" : "warning") + "</td>"
    + "</tr>";
}

function watchStockRow(level: StockLevel) {
  const actions = "<div class=\"flex items-center justify-end gap-2\">"
    + "<button data-action=\"openModal('referentialDetailModal')\" title=\"Voir la fiche article\" class=\"inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50\"><i data-lucide=\"eye\" class=\"w-4 h-4\"></i></button>"
    + "<button data-action=\"showView('historique')\" title=\"Voir historique\" class=\"inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50\"><i data-lucide=\"history\" class=\"w-4 h-4\"></i></button>"
    + "<button data-action=\"openModal('exitModal')\" title=\"Demander une sortie\" class=\"inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50\"><i data-lucide=\"arrow-up-right-square\" class=\"w-4 h-4\"></i></button>"
    + "</div>";
  return "<tr>"
    + "<td class=\"px-5 py-4\"><div class=\"font-bold\">" + escapeHtml(level.article.designation) + "</div><div class=\"text-xs text-gray-500\">" + escapeHtml(level.article.code) + "</div></td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(level.location.name) + "</td>"
    + "<td class=\"px-5 py-4 text-right font-bold\">" + formatNumber(level.quantity) + "</td>"
    + "<td class=\"px-5 py-4 text-right\">" + formatNumber(level.article.minimumStock) + "</td>"
    + "<td class=\"px-5 py-4\">" + stockStatus(level) + "</td>"
    + "<td class=\"px-5 py-4 text-right\">" + actions + "</td>"
    + "</tr>";
}
function setReapproCardValue(root: HTMLElement, label: string, value: number | string) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>("#reappro .rounded-xl"));
  const card = cards.find((element) => element.textContent?.includes(label));
  const number = card?.querySelector<HTMLElement>(".text-3xl");
  if (number) number.textContent = formatNumber(value);
}

function renderReappro(root: HTMLElement) {
  const levels = reapproLevels();
  const body = root.querySelector<HTMLElement>("#reappro-table tbody");
  if (body) body.innerHTML = levels.length ? levels.map(reapproRow).join("") : emptyRow(7, "Aucun article sous seuil pour le moment.");
  const watchBody = root.querySelector<HTMLElement>("#home-watch-stock-body");
  if (watchBody) watchBody.innerHTML = levels.length ? levels.map(watchStockRow).join("") : emptyRow(6, "Aucun stock a surveiller pour le moment.");
  const ruptures = levels.filter((level) => level.quantity <= 0).length;
  const lowStock = levels.filter((level) => level.quantity > 0).length;
  const estimated = levels.reduce((sum, level) => sum + reorderQuantity(level) * Number(level.article.referencePrice ?? 0), 0);
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
  const action = "openCount('" + level.article.id + "','" + level.location.id + "')";
  return "<tr>"
    + "<td class=\"px-5 py-4\"><div class=\"font-bold\">" + escapeHtml(level.article.designation) + "</div><div class=\"text-xs text-gray-500\">" + escapeHtml(level.article.code) + "</div></td>"
    + "<td class=\"px-5 py-4 text-right\">" + formatNumber(level.quantity) + "</td>"
    + "<td class=\"px-5 py-4 text-right font-bold\">" + formatNumber(level.quantity) + "</td>"
    + "<td class=\"px-5 py-4 text-right text-success-700 font-bold\">" + formatNumber(good) + "</td>"
    + "<td class=\"px-5 py-4 text-right text-warning-700 font-bold\">0</td>"
    + "<td class=\"px-5 py-4 text-right text-error-700 font-bold\">0</td>"
    + "<td class=\"px-5 py-4 text-center\">-</td>"
    + "<td class=\"px-5 py-4 text-gray-600\">-</td>"
    + "<td class=\"px-5 py-4\">" + badge("A compter", "gray") + "</td>"
    + "<td class=\"px-5 py-4 text-right\"><button data-action=\"" + action + "\" title=\"Saisir ou modifier le comptage\" class=\"w-9 h-9 rounded-lg border border-gray-300 bg-white text-accent-600 inline-flex items-center justify-center\"><i data-lucide=\"pencil\" class=\"w-4 h-4\"></i></button></td>"
    + "</tr>";
}


function inventoryLevelsForLocation(locationId: string): StockLevel[] {
  const location = latestLocations.find((item) => item.id === locationId);
  if (!location) return [];
  const levels = latestStockLevels.filter((level) => level.location.id === locationId);
  const knownArticleIds = new Set(levels.map((level) => level.article.id));
  const defaultArticles = latestArticles
    .filter((article) => article.active && article.defaultLocationId === locationId && !knownArticleIds.has(article.id))
    .map((article) => ({
      id: `pending-${article.id}-${locationId}`,
      article,
      location,
      quantity: 0
    }));
  return [...levels, ...defaultArticles].sort((a, b) => a.article.code.localeCompare(b.article.code));
}

function renderInventory(root: HTMLElement) {
  const select = root.querySelector<HTMLSelectElement>("#inventoryLocationSelect");
  const stockLocations = latestLocations.filter((location) => ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE", "SITE", "CHANTIER"].includes(location.type.toUpperCase()));
  if (select) {
    const previous = select.value;
    fillSelect(select, locationOptions(stockLocations), stockLocations.length ? "Selectionner un emplacement" : "Aucun emplacement en base");
    if (previous && stockLocations.some((location) => location.id === previous)) {
      select.value = previous;
    } else {
      const firstWithStock = latestStockLevels.find((level) => stockLocations.some((location) => location.id === level.location.id));
      const firstWithDefaultArticle = latestArticles.find((article) => article.defaultLocationId && stockLocations.some((location) => location.id === article.defaultLocationId));
      select.value = firstWithStock?.location.id ?? firstWithDefaultArticle?.defaultLocationId ?? stockLocations[0]?.id ?? "";
    }
  }
  const selectedLocationId = select?.value ?? "";
  const levels = selectedLocationId ? inventoryLevelsForLocation(selectedLocationId) : [];
  const inventoryBody = root.querySelector<HTMLElement>('#inventoryTable tbody');
  if (inventoryBody) {
    inventoryBody.innerHTML = levels.length ? levels.map(inventoryRow).join("") : emptyRow(10, selectedLocationId ? "Aucun article ou stock theorique pour cet emplacement." : "Selectionne un emplacement pour lancer l'inventaire.");
  }
  const today = new Date().toISOString().slice(0, 10);
  setText(root, "#inventoryDate", selectedLocationId ? formatDate(today) : "-");
  setText(root, "#inventoryResponsible", currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "-");
  const countElement = root.querySelector<HTMLElement>("#inventoryLocationCount");
  if (countElement) countElement.innerHTML = `${formatNumber(levels.length)} <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">0 saisi</span>`;
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
    REPAIR: "A reparer"
  };
  return labels[state] ?? state;
}

function equipmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponible",
    ASSIGNED: "Affecte",
    OUT: "Sorti",
    MAINTENANCE: "Maintenance",
    LOST: "Perdu"
  };
  return labels[status] ?? status;
}

function equipmentStatusTone(status: string): "success" | "warning" | "error" | "gray" | "accent" {
  if (status === "AVAILABLE") return "success";
  if (status === "ASSIGNED") return "accent";
  if (status === "MAINTENANCE") return "warning";
  if (status === "LOST") return "error";
  return "gray";
}

function equipmentRow(equipment: Equipment) {
  const article = equipment.article ? equipment.article.code + " - " + equipment.article.designation : "Article non renseigne";
  const location = equipment.location?.name ?? (equipment.locationId ? "Emplacement non charge" : "Non localise");
  return "<tr>"
    + "<td class=\"px-5 py-4 font-bold\">" + escapeHtml(equipment.code) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(article) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(equipment.serialNumber ?? "-") + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(equipmentStateLabel(equipment.state)) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(location) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(equipment.assignedTo ?? "-") + "</td>"
    + "<td class=\"px-5 py-4\">" + badge(equipmentStatusLabel(equipment.status), equipmentStatusTone(equipment.status)) + "</td>"
    + "<td class=\"px-5 py-4 text-right\"><button data-action=\"openModal('equipmentDetailModal')\" class=\"inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50\" title=\"Voir la fiche\"><i data-lucide=\"eye\" class=\"w-4 h-4\"></i></button></td>"
    + "</tr>";
}

function equipmentOptions(equipments: Equipment[]) {
  return equipments.map((equipment) => {
    const article = equipment.article?.designation ?? "Article";
    const status = equipmentStatusLabel(equipment.status);
    return option(equipment.id, equipment.code + " - " + article + " - " + status);
  }).join("");
}

async function populateEquipmentModal(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#equipmentModal");
  if (!modal) return;
  const [equipments, locations, users] = await Promise.all([
    getEquipments().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => [])
  ]);
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const equipmentSelect = selects[0];
  const beneficiarySelect = selects[2];
  const locationSelect = selects[3];
  const handledBySelect = selects[4];
  if (equipmentSelect) equipmentSelect.innerHTML = equipments.length ? equipmentOptions(equipments) : "<option value=\"\">Aucun equipement en base</option>";
  if (beneficiarySelect) beneficiarySelect.innerHTML = userOptions(users);
  if (locationSelect) locationSelect.innerHTML = locationOptions(locations);
  if (handledBySelect) handledBySelect.innerHTML = userOptions(users);
}

async function submitEquipmentAssignment(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#equipmentModal");
  if (!modal) return;
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
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
      locationId
    });
    closeModal(root, "equipmentModal");
    updateApiBackedViews(root);
    showToast(root, "Equipement affecte et journalise.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Affectation impossible.", "error");
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
    ADJUSTMENT: "Inventaire"
  };
  return labels[type] ?? type;
}

function movementQuantity(movement: StockMovement) {
  const multiplier = movement.type === "EXIT" || movement.type === "TRANSFER" ? -1 : 1;
  const total = movement.lines.reduce((sum, line) => sum + Number(line.completedQuantity ?? line.requestedQuantity ?? line.expectedQuantity ?? 0), 0);
  return total * multiplier;
}

function movementActor(movement: StockMovement) {
  return movement.handledBy ?? movement.receivedBy ?? movement.deliveredBy ?? movement.requestedBy ?? "-";
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
  return "<tr>"
    + "<td class=\"px-5 py-4\">" + formatDate(movement.date) + "</td>"
    + "<td class=\"px-5 py-4\">" + badge(movementTypeLabel(movement.type), movement.type === "EXIT" ? "warning" : movement.type === "ADJUSTMENT" ? "accent" : "success") + "</td>"
    + "<td class=\"px-5 py-4 font-bold\">" + escapeHtml(movement.reference) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(movementArticleLabel(movement)) + "</td>"
    + "<td class=\"px-5 py-4 text-right font-bold " + quantityClass + "\">" + (quantity > 0 ? "+" : "") + formatNumber(quantity) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(movementActor(movement)) + "</td>"
    + "<td class=\"px-5 py-4\">" + badge("A joindre", "gray") + "</td>"
    + "</tr>";
}

function filteredHistory(root: HTMLElement) {
  const search = root.querySelector<HTMLInputElement>("#historySearch")?.value.trim().toLowerCase() ?? "";
  const type = root.querySelector<HTMLSelectElement>("#historyType")?.value ?? "ALL";
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
      ...movement.lines.flatMap((line) => [line.article?.code, line.article?.designation])
    ].join(" ").toLowerCase();
    return typeOk && (!search || haystack.includes(search));
  });
}

function renderHistory(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>("#history-table tbody");
  if (!body) return;
  const rows = filteredHistory(root);
  body.innerHTML = rows.length ? rows.map(historyMovementRow).join("") : emptyRow(7, "Aucun mouvement ne correspond au filtre.");
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
  const blob = new Blob(["\ufeff" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
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
    showToast(root, "Le PDF final est disponible apres preparation de la demande.", "error");
    return;
  }

  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const rows = Array.from(modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr"));
  const reference = root.querySelector<HTMLElement>("#materialRequestReference")?.textContent?.trim() || "DS-2026-000";
  const docCode = reference.replace(/^DS-/, "DM-");
  const date = modal.querySelector<HTMLInputElement>('input[type="date"]')?.value || new Date().toISOString().slice(0, 10);
  const client = selectedText(selects[0]) || "-";
  const project = selectedText(selects[1]) || "-";
  const team = selectedText(selects[2]) || "-";
  const site = selectedText(selects[3]) || "-";
  const requester = selectedText(selects[4]) || "-";
  const stockManager = selectedText(root.querySelector<HTMLSelectElement>("#materialStockManager") ?? undefined) || "-";
  const receivedBy = selectedText(root.querySelector<HTMLSelectElement>("#materialReceivedBy") ?? undefined) || "-";

  const lineHtml = rows.map((row, index) => {
    const inputs = Array.from(row.querySelectorAll<HTMLInputElement>("input"));
    const articleText = selectedText(row.querySelector<HTMLSelectElement>("select") ?? undefined) || "-";
    const articleName = articleText.replace(/\s*\([^)]*\)\s*$/, "");
    const articleCode = articleText.match(/\(([^)]*)\)/)?.[1] ?? "Article catalogue";
    const unit = inputs[0]?.value || "-";
    const requested = toNumber(inputs[1]?.value ?? "0");
    const delivered = toNumber(inputs[2]?.value ?? "0");
    const observation = inputs[3]?.value || (delivered < requested ? "Remise partielle" : "RAS");
    return '<tr>'
      + '<td class="num">' + (index + 1) + '</td>'
      + '<td><strong>' + escapeHtml(articleName) + '</strong><br><span>' + escapeHtml(articleCode) + '</span></td>'
      + '<td>' + escapeHtml(unit) + '</td>'
      + '<td class="right strong">' + escapeHtml(formatNumber(requested)) + '</td>'
      + '<td class="right strong">' + escapeHtml(formatNumber(delivered)) + '</td>'
      + '<td>' + escapeHtml(observation) + '</td>'
      + '</tr>';
  }).join("");

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
    showToast(root, "Impossible d'ouvrir le PDF. Autorise les popups pour Stock Hub.", "error");
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
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f6fb; color: #0f172a; font-family: Arial, Helvetica, sans-serif; font-size: 13px; }
    .toolbar { max-width: 1080px; margin: 16px auto 0; display: flex; justify-content: flex-end; }
    .toolbar button { border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; padding: 9px 13px; font-weight: 800; cursor: pointer; }
    .page { max-width: 1080px; margin: 16px auto 24px; background: #fff; border: 1px solid #cfd8e6; border-radius: 8px; overflow: hidden; }
    .doc-head { display: grid; grid-template-columns: 132px 1fr 250px; border-bottom: 1px solid #cfd8e6; min-height: 98px; }
    .logo-cell { display: flex; align-items: center; justify-content: center; border-right: 1px solid #cfd8e6; padding: 12px; }
    .hub-logo { width: 104px; height: 70px; background: #e71845; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: .86; }
    .hub-logo-main { font-size: 40px; font-weight: 950; letter-spacing: -.06em; }
    .hub-logo-tag { margin-top: 6px; font-size: 5.5px; font-weight: 900; letter-spacing: .06em; }
    .doc-name { padding: 20px 18px; display: flex; flex-direction: column; justify-content: center; }
    .doc-name .small { color: #475569; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .doc-name .value { margin-top: 8px; font-size: 21px; font-weight: 950; }
    .doc-name .hint { margin-top: 4px; color: #64748b; font-size: 12px; }
    .meta { border-left: 1px solid #cfd8e6; display: grid; grid-template-rows: repeat(4, 1fr); }
    .meta div { display: grid; grid-template-columns: 84px 1fr; align-items: center; border-bottom: 1px solid #d8e1ec; }
    .meta div:last-child { border-bottom: 0; }
    .meta b { padding: 8px 10px; font-size: 11px; text-transform: uppercase; color: #334155; }
    .meta span { padding: 8px 10px; text-align: right; font-weight: 800; }
    .title { padding: 24px 24px 14px; text-align: center; font-size: 23px; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; }
    .info-table, .items, .signature-table { width: calc(100% - 48px); margin: 0 24px 18px; border-collapse: collapse; }
    .info-table th, .info-table td { border: 1px solid #d8e1ec; padding: 9px 11px; text-align: left; }
    .info-table th { width: 16%; color: #475569; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; background: #f8fafc; }
    .info-table td { width: 17%; font-size: 14px; font-weight: 800; }
    .items th { background: #eaf1fb; color: #1e293b; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; text-align: left; }
    .items td, .items th { border: 1px solid #d8e1ec; padding: 10px 11px; vertical-align: middle; }
    .items td { min-height: 42px; font-size: 13px; }
    .items span { color: #64748b; font-size: 11px; }
    .right { text-align: right; }
    .strong { font-weight: 900; }
    .num { width: 42px; text-align: center; font-weight: 900; color: #1d4ed8; }
    .sign-title { margin: 28px 24px 10px; font-size: 14px; font-weight: 950; }
    .signature-table td { border: 1px solid #cfd8e6; width: 33.33%; height: 118px; vertical-align: top; padding: 11px; }
    .signature-table .role { color: #334155; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .05em; }
    .signature-table .name { margin-top: 8px; font-size: 14px; font-weight: 900; }
    .signature-table .line { margin-top: 54px; color: #64748b; font-size: 11px; }
    .footer { margin: 4px 24px 18px; color: #64748b; font-size: 10px; display: flex; justify-content: space-between; gap: 18px; }
    @media print { body { background: white; } .toolbar { display: none; } .page { max-width: none; margin: 0; border: 0; border-radius: 0; } }
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
    <table class="info-table">
      <tbody>
        <tr><th>Client</th><td>${escapeHtml(input.client)}</td><th>Projet</th><td>${escapeHtml(input.project)}</td><th>Site / zone</th><td>${escapeHtml(input.site)}</td></tr>
        <tr><th>Equipe / service</th><td>${escapeHtml(input.team)}</td><th>Demandeur</th><td>${escapeHtml(input.requester)}</td><th>Resp. stock</th><td>${escapeHtml(input.stockManager)}</td></tr>
      </tbody>
    </table>
    <table class="items"><thead><tr><th>N</th><th>Designation</th><th>Unite</th><th class="right">Demandee</th><th class="right">Remise</th><th>Observation</th></tr></thead><tbody>${input.rows}</tbody></table>
    <div class="sign-title">Signatures</div>
    <table class="signature-table"><tbody><tr>
      <td><div class="role">Demandeur</div><div class="name">${escapeHtml(input.requester)}</div><div class="line">Date et signature</div></td>
      <td><div class="role">PM / Responsable</div><div class="name">${escapeHtml(input.receivedBy)}</div><div class="line">Date et signature</div></td>
      <td><div class="role">Responsable logistique</div><div class="name">${escapeHtml(input.stockManager)}</div><div class="line">Date et signature</div></td>
    </tr></tbody></table>
    <div class="footer"><span>Fiche générée depuis Stock Hub.</span><span>La fiche signée doit être uploadée comme preuve après remise.</span></div>
  </main>
</body>
</html>`;
}
function exportRows(kind: string, root: HTMLElement) {
  if (kind === "stock" || kind === "inventory") {
    return [["Article", "Code", "Categorie", "Emplacement", "Quantite", "Stock minimum", "Statut"], ...latestStockLevels.map((level) => [level.article.designation, level.article.code, level.article.category, level.location.name, level.quantity, level.article.minimumStock, level.quantity <= 0 ? "Rupture" : level.quantity <= level.article.minimumStock ? "Stock bas" : "OK"] )];
  }
  if (kind === "reappro") {
    const levels = reapproLevels();
    return [["Article", "Code", "Emplacement", "Disponible", "Stock minimum", "A recommander", "Prix indicatif", "Valeur estimee"], ...levels.map((level) => [level.article.designation, level.article.code, level.location.name, level.quantity, level.article.minimumStock, reorderQuantity(level), level.article.referencePrice, reorderQuantity(level) * Number(level.article.referencePrice ?? 0)])];
  }
  if (kind === "audit") {
    return [["Date", "Action", "Entite", "Reference", "Utilisateur"], ...latestAuditLogs.map((log) => [formatDate(log.createdAt), log.action, log.entity, log.entityId ?? "-", log.userId ?? "-"] )];
  }
  const movements = kind === "all" ? latestMovements : filteredHistory(root);
  return [["Date", "Type", "Reference", "Article", "Quantite", "Utilisateur", "Projet", "Fournisseur", "Origine", "Destination", "Statut"], ...movements.map((movement) => [formatDate(movement.date), movementTypeLabel(movement.type), movement.reference, movementArticleLabel(movement), movementQuantity(movement), movementActor(movement), movement.project?.name ?? "", movement.supplier?.name ?? "", movement.fromLocation?.name ?? "", movement.toLocation?.name ?? "", movement.status])];
}

function exportData(root: HTMLElement, kind: string) {
  const filename = "stock-hub-" + kind + "-" + new Date().toISOString().slice(0, 10) + ".csv";
  downloadCsv(filename, exportRows(kind, root));
  showToast(root, "Export CSV prepare : " + filename);
}

function movementStatus(movement: StockMovement) {
  const first = movement.lines[0];
  const expected = first?.expectedQuantity ?? 0;
  const completed = first?.completedQuantity ?? 0;
  if (movement.status === "CANCELLED") return badge("Annulee", "gray");
  if (expected > completed) return badge("Partielle", "warning");
  return badge("Recue", "success");
}

function entryMovementRow(movement: StockMovement) {
  const first = movement.lines[0];
  const expected = first?.expectedQuantity ?? 0;
  const completed = first?.completedQuantity ?? 0;
  const delta = completed - expected;
  const article = first?.article;
  return "<tr>"
    + "<td class=\"px-5 py-4 font-bold\">" + escapeHtml(movement.reference) + "</td>"
    + "<td class=\"px-5 py-4\">" + formatDate(movement.date) + "</td>"
    + "<td class=\"px-5 py-4\"><div class=\"font-bold\">" + escapeHtml(article?.designation ?? "-") + "</div><div class=\"text-xs text-gray-500\">" + escapeHtml(article?.code ?? "-") + "</div></td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(movement.supplier?.name ?? "-") + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(movement.supplier?.name ?? "Reception directe") + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(movement.toLocation?.name ?? "-") + "</td>"
    + "<td class=\"px-5 py-4 text-right\">" + formatNumber(expected) + "</td>"
    + "<td class=\"px-5 py-4 text-right font-bold\">" + formatNumber(completed) + "</td>"
    + "<td class=\"px-5 py-4 text-right\">" + formatNumber(delta) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(movement.handledBy ?? movement.receivedBy ?? "-") + "</td>"
    + "<td class=\"px-5 py-4\">" + movementStatus(movement) + "</td>"
    + "<td class=\"px-5 py-4 text-right\"><button class=\"text-accent-600 font-semibold\" data-action=\"openModal('entryModal')\">Voir</button></td>"
    + "</tr>";
}

function movementStatusLabel(movement: StockMovement) {
  if (movement.type === "EXIT") return "Sortie reelle";
  if (movement.status === "SUBMITTED") return "Demandee";
  if (movement.status === "PREPARED") return "Preparee";
  if (movement.status === "COMPLETED") return "Terminee";
  if (movement.status === "REJECTED") return "Rejetee";
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
  return movement.projectId ?? movementTextKey(movement.project?.code ?? movement.project?.name);
}

function movementPersonKey(movement: StockMovement) {
  return movementTextKey(movement.receivedBy ?? movement.requestedBy ?? movement.handledBy);
}

function movementArticleKeys(movement: StockMovement) {
  return new Set(
    movement.lines
      .map((line) => line.articleId || line.article?.id || line.article?.code || line.article?.designation || "")
      .filter(Boolean)
  );
}

function movementRequestedTotal(movement: StockMovement) {
  return movement.lines.reduce((sum, line) => sum + Number(line.requestedQuantity ?? 0), 0);
}

function movementCompletedTotal(movement: StockMovement) {
  return movement.lines.reduce((sum, line) => sum + Number(line.completedQuantity ?? 0), 0);
}

function hasCommonArticle(left: StockMovement, right: StockMovement) {
  const leftKeys = movementArticleKeys(left);
  const rightKeys = movementArticleKeys(right);
  return [...leftKeys].some((key) => rightKeys.has(key));
}

function looksLikeGeneratedExit(request: StockMovement, exit: StockMovement) {
  if (request.type !== "EXIT_REQUEST" || exit.type !== "EXIT") return false;
  if (exit.sourceRequestId === request.id || request.generatedExits?.some((item) => item.id === exit.id)) return true;

  const requestProject = movementProjectKey(request);
  const exitProject = movementProjectKey(exit);
  const requestPerson = movementPersonKey(request);
  const exitPerson = movementPersonKey(exit);
  const requestedTotal = movementRequestedTotal(request);
  const completedTotal = movementCompletedTotal(exit);

  return Boolean(
    requestProject
    && exitProject
    && requestProject === exitProject
    && (!requestPerson || !exitPerson || requestPerson === exitPerson)
    && movementDateKey(request.date) === movementDateKey(exit.date)
    && hasCommonArticle(request, exit)
    && completedTotal > 0
    && (!requestedTotal || requestedTotal >= completedTotal)
  );
}

function linkedExitForRequest(movement: StockMovement) {
  if (movement.type !== "EXIT_REQUEST") return null;
  return movement.generatedExits?.[0]
    ?? latestMovements.find((item) => item.type === "EXIT" && looksLikeGeneratedExit(movement, item))
    ?? null;
}

function requestForExit(movement: StockMovement) {
  if (movement.type !== "EXIT") return null;
  return movement.sourceRequest
    ?? latestMovements.find((item) => item.type === "EXIT_REQUEST" && looksLikeGeneratedExit(item, movement))
    ?? null;
}

function materialPdfMovement(movement: StockMovement) {
  return movement.type === "EXIT" ? requestForExit(movement) ?? movement : movement;
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
  const preparedEnough = proofSource?.status !== "SUBMITTED" || Boolean(linkedExit);
  return Boolean(
    proofSource?.type === "EXIT_REQUEST"
    && preparedEnough
    && proofSource.status !== "REJECTED"
    && proofSource.status !== "CANCELLED"
    && !proofSource.proofFileName
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
  if (currentExitFilter === "ALL") return !(movement.type === "EXIT_REQUEST" && linkedExit);
  if (currentExitFilter === "REQUESTED") return movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED" && !linkedExit;
  if (currentExitFilter === "PREPARED") {
    const proofSource = proofRequestForMovement(movement);
    return Boolean((movement.type === "EXIT" || movement.status === "PREPARED") && proofSource && !proofSource.proofFileName);
  }
  if (currentExitFilter === "EXIT") return movement.type === "EXIT";
  if (currentExitFilter === "BLOCKED") return movement.status === "REJECTED" || movement.status === "CANCELLED";
  if (currentExitFilter === "CANCELLED") return movement.status === "CANCELLED";
  return true;
}

function renderExitRegistry(root: HTMLElement) {
  const exitsBody = root.querySelector<HTMLElement>("#sortie tbody");
  const visible = visibleExitMovements(latestMovements).filter(exitFilterMatches);
  if (exitsBody) {
    exitsBody.innerHTML = visible.length ? visible.map(exitMovementRow).join("") : emptyRow(12, "Aucune demande ou sortie stock pour ce filtre.");
  }
  root.querySelectorAll<HTMLElement>("[data-exit-filter]").forEach((button) => {
    const active = button.dataset.exitFilter === currentExitFilter;
    button.classList.toggle("bg-accent-50", active);
    button.classList.toggle("text-accent-600", active);
    button.classList.toggle("bg-gray-100", !active && button.dataset.exitFilter !== "BLOCKED");
    button.classList.toggle("text-gray-600", !active && button.dataset.exitFilter !== "BLOCKED");
    if (button.dataset.exitFilter === "BLOCKED") {
      button.classList.toggle("bg-error-50", !active);
      button.classList.toggle("text-error-700", !active);
    }
  });
  window.lucide?.createIcons();
}
function renderExitRequestDetail(root: HTMLElement, movement: StockMovement) {
  const body = root.querySelector<HTMLElement>("#exitRequestDetailBody");
  const title = root.querySelector<HTMLElement>("#exitRequestDetailTitle");
  const subtitle = root.querySelector<HTMLElement>("#exitRequestDetailSubtitle");
  const prepareButton = root.querySelector<HTMLElement>("#exitRequestPrepareButton");
  const downloadButton = root.querySelector<HTMLElement>("#exitRequestDownloadButton");
  if (!body) return;
  const linkedExit = linkedExitForRequest(movement);
  const sourceRequest = requestForExit(movement);
  const proofSource = proofRequestForMovement(movement);
  const displayedRequest = movement.type === "EXIT" ? proofSource ?? movement : movement;
  const totalRequested = displayedRequest.lines.reduce((sum, line) => sum + Number(line.requestedQuantity ?? 0), 0);
  const totalCompleted = movement.lines.reduce((sum, line) => sum + Number(line.completedQuantity ?? 0), 0);
  const rows = movement.lines.map((line, index) => {
    const available = latestStockLevels
      .filter((level) => level.article.id === line.articleId && (!movement.fromLocationId || level.location.id === movement.fromLocationId))
      .reduce((sum, level) => sum + Number(level.quantity ?? 0), 0);
    const requested = Number(line.requestedQuantity ?? 0);
    const shortageClass = requested > available && movement.status === "SUBMITTED" ? " text-error-700" : "";
    return `<tr>
      <td class="px-5 py-4 font-bold text-gray-400">${index + 1}</td>
      <td class="px-5 py-4"><div class="font-bold">${escapeHtml(line.article?.designation ?? "-")}</div><div class="text-xs text-gray-500">${escapeHtml(line.article?.code ?? "-")}</div></td>
      <td class="px-5 py-4 text-right font-bold">${formatNumber(requested)}</td>
      <td class="px-5 py-4 text-right font-bold${shortageClass}">${formatNumber(available)}</td>
      <td class="px-5 py-4 text-right">${formatNumber(line.completedQuantity ?? 0)}</td>
      <td class="px-5 py-4">${escapeHtml(line.observation ?? "-")}</td>
    </tr>`;
  }).join("");
  const canPrepareNow = movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED" && canPrepareMaterialRequests();
  if (title) title.textContent = movement.reference;
  if (subtitle) subtitle.textContent = movement.type === "EXIT_REQUEST"
    ? "Demande de materiel a preparer ou a suivre."
    : "Sortie stock deja enregistree" + (sourceRequest ? " depuis la demande " + sourceRequest.reference + "." : ".");
  if (prepareButton) {
    prepareButton.classList.toggle("hidden", !canPrepareNow);
    prepareButton.dataset.action = `prepareExitFromRequest('${movement.id}')`;
  }
  const canDownloadPdf = movement.type === "EXIT" || (movement.type === "EXIT_REQUEST" && movement.status !== "SUBMITTED");
  const canUploadProof = canUploadSignedProofFor(movement);
  const hasProof = Boolean(proofSource?.proofFileName);
  if (downloadButton) {
    downloadButton.classList.toggle("hidden", !canDownloadPdf);
    downloadButton.dataset.action = `downloadPreparedMaterialPdf('${movement.id}')`;
  }
  const sourceReference = sourceRequest?.reference ?? (movement.type === "EXIT_REQUEST" ? movement.reference : "-");
  const ficheStatus = hasProof ? "SignÃ©e uploadÃ©e" : canDownloadPdf ? "Ã€ signer" : "En attente";
  const ficheStatusClass = hasProof ? "text-success-700" : canDownloadPdf ? "text-warning-700" : "text-gray-500";
  const preparedPanel = canDownloadPdf ? `
    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div class="flex flex-col gap-3 border-b bg-gray-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="text-xs font-bold uppercase text-gray-500">Fiche de sortie</div>
          <div class="mt-1 font-bold text-gray-900">${linkedExit ? escapeHtml(linkedExit.reference) : escapeHtml(movement.reference)}</div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="icon-button" title="TÃ©lÃ©charger fiche" data-action="downloadPreparedMaterialPdf('${movement.id}')"><i data-lucide="download" class="h-4 w-4"></i></button>
          ${hasProof && proofSource ? `<button class="icon-button" title="Voir preuve" data-action="viewSignedMaterialProof('${proofSource.id}')"><i data-lucide="file-check" class="h-4 w-4"></i></button>` : ""}
        </div>
      </div>
      <div class="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
        <p class="text-sm text-gray-600">TÃ©lÃ©charger la fiche, la faire signer, puis ajouter la preuve signÃ©e au retour du document.</p>
        ${canUploadProof && proofSource ? `<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input id="signedProof-${escapeHtml(proofSource.id)}" type="file" accept=".pdf,image/*" class="form-input max-w-xs" />
          <button class="icon-button" title="Uploader fiche signÃ©e" data-action="uploadSignedMaterialProof('${proofSource.id}')"><i data-lucide="upload" class="h-4 w-4"></i></button>
        </div>` : hasProof && proofSource ? `<div class="rounded-lg border border-gray-200 bg-success-50 px-3 py-2 text-sm text-success-700">${escapeHtml(proofSource.proofFileName ?? "Preuve ajoutÃ©e")}</div>` : ""}
      </div>
    </div>` : "";

  body.innerHTML = `
    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div class="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        <div class="p-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge ${movement.type === "EXIT" ? "success" : "warning"}">${escapeHtml(movementStatusLabel(movement))}</span>
            <span class="text-sm text-gray-500">${formatDate(movement.date)}</span>
          </div>
          <div class="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div><span class="detail-label">Demande source</span><strong>${escapeHtml(sourceReference)}</strong></div>
            <div><span class="detail-label">Fiche signÃ©e</span><strong class="${ficheStatusClass}">${ficheStatus}</strong></div>
            <div><span class="detail-label">Projet / chantier</span><strong>${escapeHtml(displayedRequest.project?.name ?? movement.project?.name ?? movement.toLocation?.name ?? "-")}</strong></div>
            <div><span class="detail-label">Magasin source</span><strong>${escapeHtml(movement.fromLocation?.name ?? displayedRequest.fromLocation?.name ?? "-")}</strong></div>
          </div>
        </div>
        <div class="border-t bg-gray-50 p-5 md:border-l md:border-t-0">
          <div class="grid gap-3 text-sm">
            <div><span class="detail-label">Demandeur / bÃ©nÃ©ficiaire</span><strong>${escapeHtml(displayedRequest.requestedBy ?? movement.receivedBy ?? "-")}</strong></div>
            <div><span class="detail-label">Sorti par</span><strong>${escapeHtml(movement.handledBy ?? "-")}</strong></div>
            <div><span class="detail-label">TransportÃ© par</span><strong>${escapeHtml(movement.deliveredBy ?? "-")}</strong></div>
            <div><span class="detail-label">Remis Ã </span><strong>${escapeHtml(movement.receivedBy ?? displayedRequest.receivedBy ?? displayedRequest.requestedBy ?? "-")}</strong></div>
          </div>
        </div>
      </div>
    </div>
    ${movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED" ? `<div class="rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm text-gray-700"><div class="font-bold text-accent-700 mb-1">Demande transmise au stock</div>En attente de prÃ©paration par le gestionnaire stock.</div>` : ""}
    ${preparedPanel}
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-5 py-4 bg-gray-50 border-b"><h3 class="font-bold">Articles demandes</h3><p class="text-sm text-gray-500 mt-1">Le stock disponible est calcule sur le magasin source de la demande.</p></div>
      <div class="overflow-x-auto"><table class="w-full min-w-[820px] text-sm"><thead class="bg-gray-50 text-xs uppercase text-gray-500"><tr><th class="px-5 py-3 text-left">N</th><th class="px-5 py-3 text-left">Article</th><th class="px-5 py-3 text-right">Demandee</th><th class="px-5 py-3 text-right">Dispo</th><th class="px-5 py-3 text-right">Remise</th><th class="px-5 py-3 text-left">Observation</th></tr></thead><tbody class="divide-y">${rows || emptyRow(6, "Aucune ligne sur cette demande.")}</tbody></table></div>
    </div>
    ${movement.notes ? `<div class="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700"><div class="font-bold mb-1">Note</div>${escapeHtml(movement.notes)}</div>` : ""}`;
  window.lucide?.createIcons();
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
    showToast(root, movement.status === "SUBMITTED" ? "Demande transmise au stock. En attente de preparation." : "Cette demande est deja preparee ou terminee.");
    return;
  }
  closeModal(root, "exitRequestDetailModal");
  await openMaterialRequestPreparation(root, id);
}
function exitStatusTone(movement: StockMovement): "success" | "warning" | "error" | "gray" {
  if (movement.type === "EXIT") return "success";
  if (movement.status === "COMPLETED") return "success";
  if (movement.status === "PREPARED") return "warning";
  if (movement.status === "REJECTED" || movement.status === "CANCELLED") return "error";
  return "warning";
}

function exitMenuItem(icon: string, label: string, action: string) {
  return `<button class="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50" data-action="${action}"><i data-lucide="${icon}" class="h-4 w-4 text-gray-500"></i><span>${label}</span></button>`;
}

function exitActionsMenu(movement: StockMovement) {
  const actions: string[] = [];
  const proofSource = proofRequestForMovement(movement);
  actions.push(exitMenuItem("eye", "Voir", `openExitRequestDetail('${movement.id}')`));
  if (movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED" && canPrepareMaterialRequests()) {
    actions.push(exitMenuItem("package-check", "Preparer", `prepareExitFromRequest('${movement.id}')`));
  }
  if (movement.type === "EXIT" || (movement.type === "EXIT_REQUEST" && movement.status !== "SUBMITTED")) {
    actions.push(exitMenuItem("download", "Telecharger fiche", `downloadPreparedMaterialPdf('${movement.id}')`));
  }
  if (canUploadSignedProofFor(movement)) {
    actions.push(exitMenuItem("upload", "Uploader fiche signee", `openExitRequestDetail('${movement.id}')`));
  }
  if (proofSource?.proofFileName) {
    actions.push(exitMenuItem("file-check", "Voir preuve", `viewSignedMaterialProof('${proofSource.id}')`));
  }
  return `<div class="relative inline-block text-left group">
    <button class="icon-btn" type="button" aria-label="Actions"><i data-lucide="more-vertical" class="h-4 w-4"></i></button>
    <div class="absolute right-0 z-30 mt-2 hidden min-w-[220px] overflow-hidden rounded-xl border bg-white py-1 text-sm shadow-xl group-hover:block group-focus-within:block">${actions.join("")}</div>
  </div>`;
}

function exitMovementRow(movement: StockMovement) {
  const first = movement.lines[0];
  const articleCount = movement.lines.length;
  const article = articleCount > 1 ? articleCount + " articles" : first?.article?.designation ?? "-";
  const requested = movement.lines.reduce((sum, line) => sum + Number(line.requestedQuantity ?? 0), 0);
  const completed = movement.lines.reduce((sum, line) => sum + Number(line.completedQuantity ?? 0), 0);
  const quantity = movement.type === "EXIT_REQUEST" ? requested : completed || requested;
  const available = first?.articleId ? latestStockLevels
    .filter((level) => level.article.id === first.articleId && (!movement.fromLocationId || level.location.id === movement.fromLocationId))
    .reduce((sum, level) => sum + Number(level.quantity ?? 0), 0) : null;
  const linkedExit = linkedExitForRequest(movement);
  const sourceRequest = requestForExit(movement);
  const typeLabel = movement.type === "EXIT_REQUEST" ? (linkedExit ? "Demande preparee" : "Demande") : "Sortie reelle";
  const project = movement.project?.name ?? movement.toLocation?.name ?? "-";
  const beneficiary = movement.requestedBy ?? movement.receivedBy ?? "-";
  const handledBy = movement.handledBy ?? movement.fromLocation?.name ?? "-";
  const transportedBy = movement.deliveredBy ?? "-";
  const deliveredTo = movement.receivedBy ?? movement.requestedBy ?? "-";
  const availableText = available === null ? "-" : formatNumber(available);
  const availableClass = available !== null && movement.status === "SUBMITTED" && quantity > available ? " text-error-700" : "";
  const linkedInfo = linkedExit
    ? `<div class="text-xs text-success-700 font-normal">Sortie : ${escapeHtml(linkedExit.reference)}</div>`
    : sourceRequest ? `<div class="text-xs text-primary-700 font-normal">Demande source : ${escapeHtml(sourceRequest.reference)}</div>` : "";
  return '<tr>'
    + '<td class="px-5 py-4 font-bold">' + escapeHtml(movement.reference) + '<div class="text-xs text-gray-500 font-normal">' + typeLabel + '</div>' + linkedInfo + '</td>'
    + '<td class="px-5 py-4">' + formatDate(movement.date) + '</td>'
    + '<td class="px-5 py-4"><div class="font-bold">' + escapeHtml(article) + '</div><div class="text-xs text-gray-500">' + escapeHtml(first?.article?.code ?? '-') + '</div></td>'
    + '<td class="px-5 py-4 text-right font-bold">' + formatNumber(quantity) + '</td>'
    + '<td class="px-5 py-4 text-right font-bold' + availableClass + '">' + availableText + '</td>'
    + '<td class="px-5 py-4">' + escapeHtml(project) + '</td>'
    + '<td class="px-5 py-4">' + escapeHtml(beneficiary) + '</td>'
    + '<td class="px-5 py-4">' + escapeHtml(handledBy) + '</td>'
    + '<td class="px-5 py-4">' + escapeHtml(transportedBy) + '</td>'
    + '<td class="px-5 py-4">' + escapeHtml(deliveredTo) + '</td>'
    + '<td class="px-5 py-4">' + badge(movementStatusLabel(movement), exitStatusTone(movement)) + '</td>'
    + '<td class="px-5 py-4 text-right">' + exitActionsMenu(movement) + '</td>'
    + '</tr>';
}


function returnTransferRow(movement: StockMovement) {
  const first = movement.lines[0];
  const article = first?.article?.designation ?? "-";
  const origin = movement.type === "RETURN" ? movement.deliveredBy ?? "Sortie retournee" : movement.fromLocation?.name ?? "-";
  const destination = movement.toLocation?.name ?? "-";
  const state = first?.observation || movement.notes || "-";
  const label = movement.type === "RETURN" ? "Retour" : "Transfert";
  const statusLabel = movement.type === "RETURN" ? (movement.status === "COMPLETED" ? "Reintegre" : "A controler") : (movement.status === "COMPLETED" ? "Transfere" : movement.status);
  const tone: "success" | "warning" | "gray" = movement.status === "COMPLETED" ? "success" : movement.status === "PREPARED" ? "warning" : "gray";
  return "<tr>"
    + "<td class=\"px-5 py-4 font-bold\">" + escapeHtml(movement.reference) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(label) + "</td>"
    + "<td class=\"px-5 py-4\"><div class=\"font-bold\">" + escapeHtml(article) + "</div><div class=\"text-xs text-gray-500\">" + escapeHtml(first?.article?.code ?? "-") + "</div></td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(origin) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(destination) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(state) + "</td>"
    + "<td class=\"px-5 py-4\">" + badge(statusLabel, tone) + "</td>"
    + "</tr>";
}

function fillSelect(select: HTMLSelectElement | undefined, options: string, placeholder?: string) {
  if (!select) return;
  select.innerHTML = placeholder ? option("", placeholder) + options : options;
}

function selectedText(select: HTMLSelectElement | undefined) {
  if (!select?.value) return undefined;
  return select.selectedOptions[0]?.textContent?.trim() || undefined;
}

function userOptions(users: StockUser[]) {
  return users.map((user) => option(user.id, (user.firstName + " " + user.lastName).trim() || user.email)).join("");
}

function articleOptions(articles: Article[]) {
  return articles.map((article) => option(article.id, article.designation)).join("");
}

function projectOptions(projects: StockProject[]) {
  return projects.map((project) => option(project.id, project.code + " - " + project.name)).join("");
}

function clientOptions(clients: Client[]) {
  return clients.map((client) => option(client.id, client.name)).join("");
}

function supplierOptions(suppliers: Supplier[]) {
  return suppliers.map((supplier) => option(supplier.id, supplier.name)).join("");
}

function teamServiceOptions(services: TeamService[]) {
  return services.map((service) => option(service.id, service.name)).join("");
}

function sitesForProject(projectId: string, locations = latestLocations) {
  return locations.filter((location) => ["SITE", "CHANTIER"].includes(location.type.toUpperCase()) && (!projectId || location.projectId === projectId));
}

function siteOptions(locations: StockLocation[]) {
  return locations.map((location) => option(location.id, location.name)).join("");
}

function setProjectSiteOptions(siteSelect: HTMLSelectElement | undefined, projectId: string) {
  if (!siteSelect) return;
  if (!projectId) {
    fillSelect(siteSelect, "", "Selectionner un projet d'abord");
    return;
  }
  const sites = sitesForProject(projectId);
  fillSelect(siteSelect, siteOptions(sites), sites.length ? "Selectionner site ou zone" : "Aucun site rattache a ce projet");
}

function setSelectValueOrText(select: HTMLSelectElement | undefined, id: string | null | undefined, label: string | null | undefined, placeholder: string) {
  if (!select) return;
  if (id && Array.from(select.options).some((item) => item.value === id)) {
    select.value = id;
    return;
  }
  setSelectToText(select, label || placeholder);
}
function locationOptions(locations: StockLocation[]) {
  return locations.map((location) => option(location.id, location.name)).join("");
}

function option(value: string, label: string) {
  return "<option value=\"" + escapeHtml(value) + "\">" + escapeHtml(label) + "</option>";
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
  const gapNode = modal.querySelector<HTMLElement>('[data-count-summary="gap"]');
  const usableNode = modal.querySelector<HTMLElement>('[data-count-summary="usable"]');
  const toTreatNode = modal.querySelector<HTMLElement>('[data-count-summary="toTreat"]');
  if (gapNode) {
    gapNode.textContent = formatNumber(gap);
    gapNode.className = "mt-2 h-11 rounded-lg border px-3 flex items-center font-bold " + (gap === 0 ? "border-success-100 bg-success-50 text-success-700" : gap < 0 ? "border-error-100 bg-error-50 text-error-700" : "border-warning-100 bg-warning-50 text-warning-700");
  }
  if (usableNode) usableNode.textContent = formatNumber(good);
  if (toTreatNode) {
    toTreatNode.textContent = formatNumber(toTreat);
    toTreatNode.className = "mt-2 h-11 rounded-lg border px-3 flex items-center font-bold " + (toTreat > 0 ? "border-warning-100 bg-warning-50 text-warning-700" : "border-gray-200 bg-gray-50 text-gray-700");
  }
}

async function populateCountModal(root: HTMLElement, articleId: string, locationId: string) {
  const modal = root.querySelector<HTMLElement>("#countModal");
  if (!modal) return;
  latestStockLevels = await getStockLevels().catch(() => latestStockLevels);
  const location = latestLocations.find((item) => item.id === locationId);
  const level = latestStockLevels.find((item) => item.article.id === articleId && item.location.id === locationId);
  const article = level?.article ?? latestArticles.find((item) => item.id === articleId);
  if (!article || !location) {
    showToast(root, "Impossible de charger la ligne d'inventaire.", "error");
    return;
  }
  const theoretical = Number(level?.quantity ?? 0);
  modal.dataset.articleId = articleId;
  modal.dataset.locationId = locationId;
  modal.dataset.theoretical = String(theoretical);
  const cards = Array.from(modal.querySelectorAll<HTMLElement>(".grid .p-4"));
  if (cards[0]) cards[0].innerHTML = `<div class="text-xs font-semibold text-gray-500">Article</div><div class="font-bold mt-1">${escapeHtml(article.designation)}</div><div class="text-xs text-gray-500 mt-1">${escapeHtml(article.code)}</div>`;
  if (cards[1]) cards[1].innerHTML = `<div class="text-xs font-semibold text-gray-500">Emplacement</div><div class="font-bold mt-1">${escapeHtml(location.name)}</div>`;
  if (cards[2]) cards[2].innerHTML = `<div class="text-xs font-semibold text-accent-600">Stock theorique</div><div class="font-bold text-2xl mt-1">${formatNumber(theoretical)}</div>`;
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
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
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
    showToast(root, "La quantite constatee doit etre egale a bon etat + a reparer + hors service.", "error");
    return;
  }
  if (counted !== theoretical && !details) {
    showToast(root, "Justifie l'ecart avant d'enregistrer le comptage.", "error");
    return;
  }
  try {
    await createInventoryAdjustment({
      reference: "INV-" + Date.now(),
      date: new Date().toISOString(),
      locationId,
      notes: details,
      lines: [{ articleId, expectedQuantity: theoretical, completedQuantity: counted, observation: reason + (details ? " - " + details : "") }]
    });
    closeModal(root, "countModal");
    updateApiBackedViews(root);
    showToast(root, "Comptage inventaire enregistre et stock ajuste.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Comptage impossible.", "error");
  }
}

async function populateEntryModal(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#entryModal");
  if (!modal) return;
  const [articles, suppliers, locations, users] = await Promise.all([
    getArticles().catch(() => []),
    getSuppliers().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => [])
  ]);
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const supplierSelect = selects[0];
  const articleSelect = selects[1];
  const originSelect = selects[2];
  const locationSelect = selects[3];
  const handledBySelect = selects[4];
  const receivedBySelect = selects[5];
  const expectedInput = inputs[2];
  const receivedInput = inputs[3];
  const statusBox = modal.querySelector<HTMLElement>("#entryComputedStatus");

  fillSelect(supplierSelect, suppliers.map((supplier) => option(supplier.id, supplier.name)).join(""), "Selectionner fournisseur");
  fillSelect(articleSelect, articles.map((article) => option(article.id, article.designation)).join(""), "Selectionner article");
  const stockLocations = locations.filter((location) => ["MAGASIN", "DEPOT", "BUREAU", "VEHICULE"].includes(location.type.toUpperCase()));
  fillSelect(locationSelect, stockLocations.map((location) => option(location.id, location.name)).join(""), "Selectionner magasin");
  const peopleOptions = users.map((user) => {
    const name = (user.firstName + " " + user.lastName).trim() || user.email;
    return option(name, name);
  }).join("");
  fillSelect(handledBySelect, peopleOptions, "Selectionner responsable");
  fillSelect(receivedBySelect, peopleOptions, "Selectionner receptionnaire");

  const refreshEntryPreview = () => {
    const article = articles.find((item) => item.id === articleSelect?.value);
    const location = stockLocations.find((item) => item.id === locationSelect?.value);
    const tracking = article?.trackingMode === "INDIVIDUAL" ? "Suivi individuel" : article ? "Article en quantite" : "-";
    const expected = toNumber(expectedInput?.value ?? "0");
    const received = toNumber(receivedInput?.value ?? "0");
    setText(modal, "#entryPreviewCode", article?.code ?? "-");
    setText(modal, "#entryPreviewDesignation", article?.designation ?? "Selectionner article");
    setText(modal, "#entryPreviewTracking", tracking);
    setText(modal, "#entryPreviewOrigin", originSelect?.value ? selectedText(originSelect) ?? "Selectionner origine" : "Selectionner origine");
    setText(modal, "#entryPreviewDestination", location?.name ?? "Selectionner magasin");
    setText(modal, "#entryCurrentStock", "-");
    if (statusBox) {
      const label = !expected && !received ? "A calculer" : expected && received < expected ? "Partielle" : expected && received > expected ? "Litige" : "Recue";
      const tone = label === "Recue" ? "border-success-100 bg-success-50 text-success-700" : label === "Partielle" ? "border-warning-100 bg-warning-50 text-warning-700" : label === "Litige" ? "border-danger-100 bg-danger-50 text-danger-700" : "border-gray-200 bg-gray-50 text-gray-500";
      statusBox.className = "mt-2 h-11 rounded-lg border px-3 flex items-center font-semibold " + tone;
      statusBox.textContent = label;
    }
  };
  if (articleSelect) articleSelect.onchange = refreshEntryPreview;
  if (originSelect) originSelect.onchange = refreshEntryPreview;
  if (locationSelect) locationSelect.onchange = refreshEntryPreview;
  if (expectedInput) expectedInput.oninput = refreshEntryPreview;
  if (receivedInput) receivedInput.oninput = refreshEntryPreview;
  refreshEntryPreview();
}
async function submitStockEntry(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#entryModal");
  if (!modal) return;
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const rawNotes = modal.querySelector<HTMLTextAreaElement>("textarea")?.value.trim();
  const originLabel = selectedText(selects[2]);
  const notes = [originLabel ? "Origine entree: " + originLabel : undefined, rawNotes].filter(Boolean).join(" - ") || undefined;
  const reference = inputs[1]?.value.trim() || "BE-" + Date.now();
  const articleId = selects[1]?.value;
  const toLocationId = selects[3]?.value;
  const expectedQuantity = toNumber(inputs[2]?.value ?? "0");
  const completedQuantity = toNumber(inputs[3]?.value ?? "0");
  if (!articleId || !toLocationId || completedQuantity <= 0) {
    showToast(root, "Article, magasin et quantite recue sont obligatoires.", "error");
    return;
  }
  try {
    await createStockEntry({
      reference,
      date: inputs[0]?.value || new Date().toISOString(),
      supplierId: selects[0]?.value || undefined,
      toLocationId,
      handledBy: selects[4]?.value || undefined,
      receivedBy: selects[5]?.value || undefined,
      deliveredBy: inputs[5]?.value.trim() || undefined,
      notes,
      lines: [{ articleId, expectedQuantity, completedQuantity, unitPrice: toNumber(inputs[4]?.value ?? "0"), observation: notes }]
    });
    closeModal(root, "entryModal");
    updateApiBackedViews(root);
    showToast(root, "Entree stock enregistree et stock mis a jour.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Entree stock impossible.", "error");
  }
}
async function populateExitModals(root: HTMLElement, modalId: "exitModal" | "directExitModal") {
  const modal = root.querySelector<HTMLElement>("#" + modalId);
  if (!modal) return;
  const [articles, projects, locations, users, clients, teamServices] = await Promise.all([
    getArticles().catch(() => []),
    getProjects().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => []),
    getClients().catch(() => []),
    getTeamServices().catch(() => [])
  ]);
  latestProjects = projects;
  latestLocations = locations;
  latestClients = clients;
  latestTeamServices = teamServices;
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  if (modalId === "directExitModal") {
    fillSelect(selects[0], articleOptions(articles), "Selectionner article");
    fillSelect(selects[1], projectOptions(projects), "Selectionner projet");
    fillSelect(selects[2], userOptions(users), "Selectionner beneficiaire");
    fillSelect(selects[3], userOptions(users), "Selectionner responsable");
    fillSelect(selects[4], userOptions(users), "Selectionner transporteur");
    fillSelect(selects[5], userOptions(users), "Selectionner signataire");
    modal.dataset.defaultLocationId = locations.find((location) => location.type.toUpperCase() === "MAGASIN")?.id ?? locations[0]?.id ?? "";
  } else {
    fillSelect(selects[0], clientOptions(clients), "Selectionner client");
    fillSelect(selects[1], projectOptions(projects), "Selectionner projet");
    fillSelect(selects[2], teamServiceOptions(teamServices), "Selectionner equipe ou service");
    setProjectSiteOptions(selects[3], selects[1]?.value ?? "");
    fillSelect(selects[4], userOptions(users), "Selectionner demandeur");
    if (selects[1]) {
      selects[1].onchange = () => setProjectSiteOptions(selects[3], selects[1]?.value ?? "");
    }
    const userChoices = userOptions(users);
    fillSelect(modal.querySelector<HTMLSelectElement>("#materialStockManager") ?? undefined, userChoices, "Selectionner responsable");
    fillSelect(modal.querySelector<HTMLSelectElement>("#materialDeliveredBy") ?? undefined, userChoices, "Selectionner personne");
    fillSelect(modal.querySelector<HTMLSelectElement>("#materialReceivedBy") ?? undefined, userChoices, "Selectionner signataire");
    const choices = option("", "Selectionner article") + articleOptions(articles);
    Array.from(modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr")).forEach((row) => {
      const select = row.querySelector<HTMLSelectElement>("select");
      if (select) select.innerHTML = choices;
    });
    modal.dataset.defaultLocationId = locations.find((location) => location.type.toUpperCase() === "MAGASIN")?.id ?? locations[0]?.id ?? "";
    refreshMaterialRequestLines(root);
  }
}
function setMaterialRequestPrepEnabled(modal: HTMLElement, enabled: boolean) {
  modal.querySelectorAll<HTMLInputElement | HTMLSelectElement>(".material-prep-field, .material-delivered-quantity").forEach((field) => {
    field.disabled = !enabled;
    field.classList.toggle("bg-gray-50", !enabled);
    field.classList.toggle("text-gray-400", !enabled);
    field.classList.toggle("bg-white", enabled);
    field.classList.toggle("text-gray-900", enabled);
  });
  const pdfButtons = modal.querySelectorAll<HTMLElement>("#materialPdfHeaderButton, #materialPdfFooterButton");
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
  const existing = Array.from(select.options).find((item) => item.textContent?.trim() === label || item.value === label);
  if (existing) {
    select.value = existing.value;
    return;
  }
  select.insertAdjacentHTML("beforeend", option(label, label));
  select.value = label;
}

function setDemandInfoLocked(modal: HTMLElement, locked: boolean) {
  const infoSelects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select")).slice(0, 5);
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
function setMaterialRequestMode(root: HTMLElement, mode: "create" | "prepare", movement?: StockMovement) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal) return;
  modal.dataset.mode = mode;
  selectedExitRequestId = mode === "prepare" ? movement?.id ?? null : null;
  const canPrepare = mode === "prepare" && (hasRole("ADMIN_STOCK") || hasRole("GESTIONNAIRE_STOCK"));
  const title = root.querySelector<HTMLElement>("#materialRequestTitle");
  const subtitle = root.querySelector<HTMLElement>("#materialRequestSubtitle");
  const reference = root.querySelector<HTMLElement>("#materialRequestReference");
  const status = root.querySelector<HTMLElement>("#materialRequestStatus");
  const step = root.querySelector<HTMLElement>("#materialRequestStep");
  const lineCount = root.querySelector<HTMLElement>("#materialRequestLineCount");
  const addLine = root.querySelector<HTMLElement>("#materialAddLineButton");
  const treatmentTitle = root.querySelector<HTMLElement>("#materialTreatmentTitle");
  const treatmentHint = root.querySelector<HTMLElement>("#materialTreatmentHint");
  const submit = root.querySelector<HTMLButtonElement>("#materialSubmitButton");
  const draft = root.querySelector<HTMLElement>("#materialDraftButton");

  if (title) title.textContent = mode === "prepare" ? "Preparer la demande materiel" : "Nouvelle demande multi-articles";
  if (subtitle) subtitle.textContent = mode === "prepare" ? "Vue gestionnaire : renseigner les quantites remises, la tracabilite et le document final." : "Vue demandeur : seules les informations du besoin sont saisies ici.";
  if (reference) reference.textContent = movement?.reference ?? "Auto";
  if (status) status.textContent = mode === "prepare" ? movementStatusLabel(movement!) : "Brouillon";
  if (step) step.textContent = mode === "prepare" ? "Preparation" : "Saisie";
  if (lineCount) lineCount.textContent = String(movement?.lines.length ?? root.querySelectorAll("#materialRequestLines tr").length);
  addLine?.classList.toggle("hidden", mode === "prepare");
  draft?.classList.toggle("hidden", mode === "prepare");
  if (treatmentTitle) treatmentTitle.textContent = canPrepare ? "Traitement stock" : "Traitement stock verrouille";
  if (treatmentHint) treatmentHint.textContent = canPrepare ? "Renseigne les quantites remises, les signataires et joins le PDF signe si disponible." : "Ces informations sont reservees au gestionnaire stock ou a l'admin.";
  if (submit) {
    submit.textContent = mode === "prepare" ? "Valider preparation" : "Soumettre demande";
    submit.dataset.action = mode === "prepare" ? "submitMaterialRequestPreparation" : "submitExitRequest";
    submit.disabled = mode === "prepare" && !canPrepare;
    submit.classList.toggle("opacity-50", submit.disabled);
    submit.classList.toggle("cursor-not-allowed", submit.disabled);
  }
  setDemandInfoLocked(modal, mode === "prepare");
  setMaterialRequestPrepEnabled(modal, canPrepare);
  syncMaterialPreparationState(root);
}

function fillMaterialRequestRows(root: HTMLElement, movement: StockMovement, articleChoices: string) {
  const body = root.querySelector<HTMLTableSectionElement>("#materialRequestLines");
  if (!body) return;
  body.innerHTML = movement.lines.map((line, index) => {
    const requested = Number(line.requestedQuantity ?? 0);
    const completed = Number(line.completedQuantity ?? 0);
    const available = stockAvailableFor(line.articleId, movement.fromLocationId);
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
  }).join("");
  body.querySelectorAll<HTMLSelectElement>("select").forEach((select, index) => {
    select.value = movement.lines[index]?.articleId ?? "";
  });
  syncMaterialPreparationState(root);
}

function syncMaterialPreparationState(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal || modal.dataset.mode !== "prepare") return;
  const rows = Array.from(modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr"));
  const submit = root.querySelector<HTMLButtonElement>("#materialSubmitButton");
  let hasInvalidLine = false;
  let hasAnyQuantity = false;

  rows.forEach((row) => {
    const deliveredInput = row.querySelector<HTMLInputElement>(".material-delivered-quantity");
    const observationInput = row.querySelector<HTMLInputElement>(".material-remise-observation");
    const feedback = row.querySelector<HTMLElement>(".material-line-feedback");
    const requested = Number(row.dataset.requested ?? 0);
    const available = Number(row.dataset.available ?? 0);
    const raw = deliveredInput?.value.trim() ?? "";
    const delivered = raw ? toNumber(raw) : 0;
    const observation = observationInput?.value.trim() ?? "";

    deliveredInput?.classList.remove("border-success-300", "bg-success-50", "text-success-700", "border-warning-300", "bg-warning-50", "text-warning-700", "border-error-300", "bg-error-50", "text-error-700");
    if (feedback) feedback.className = "material-line-feedback mt-1 text-xs font-semibold text-gray-400";

    if (!raw) {
      hasInvalidLine = true;
      if (feedback) feedback.textContent = "A renseigner";
      return;
    }

    hasAnyQuantity = true;
    if (delivered > available) {
      hasInvalidLine = true;
      deliveredInput?.classList.add("border-error-300", "bg-error-50", "text-error-700");
      if (feedback) {
        feedback.className = "material-line-feedback mt-1 text-xs font-semibold text-error-700";
        feedback.textContent = "Stock insuffisant";
      }
      return;
    }

    if (delivered > requested) {
      hasInvalidLine = true;
      deliveredInput?.classList.add("border-warning-300", "bg-warning-50", "text-warning-700");
      if (feedback) {
        feedback.className = "material-line-feedback mt-1 text-xs font-semibold text-warning-700";
        feedback.textContent = "Superieur a la demande";
      }
      return;
    }

    if (delivered < requested && !observation) {
      hasInvalidLine = true;
      deliveredInput?.classList.add("border-warning-300", "bg-warning-50", "text-warning-700");
      if (feedback) {
        feedback.className = "material-line-feedback mt-1 text-xs font-semibold text-warning-700";
        feedback.textContent = "Remise partielle : ajoute une observation";
      }
      return;
    }

    deliveredInput?.classList.add("border-success-300", "bg-success-50", "text-success-700");
    if (feedback) {
      feedback.className = "material-line-feedback mt-1 text-xs font-semibold text-success-700";
      feedback.textContent = delivered < requested ? "Remise partielle" : "Disponible";
    }
  });

  if (submit && modal.dataset.mode === "prepare") {
    submit.disabled = hasInvalidLine || !hasAnyQuantity || !canPrepareMaterialRequests();
    submit.classList.toggle("opacity-50", submit.disabled);
    submit.classList.toggle("cursor-not-allowed", submit.disabled);
  }
}

function preparedMaterialPdfHtml(movement: StockMovement) {
  const source = materialPdfMovement(movement);
  const linkedExit = materialPdfLinkedExit(movement);
  const rows = source.lines.map((line, index) => `<tr>
    <td class="num">${index + 1}</td>
    <td><strong>${escapeHtml(line.article?.designation ?? "-")}</strong><br><span>${escapeHtml(line.article?.code ?? "-")}</span></td>
    <td>${escapeHtml(line.article?.unit ?? "U")}</td>
    <td class="right strong">${formatNumber(line.requestedQuantity ?? 0)}</td>
    <td class="right strong">${formatNumber(line.completedQuantity ?? 0)}</td>
    <td>${escapeHtml(line.observation ?? "")}</td>
  </tr>`).join("");
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
    stockManager: source.handledBy ?? linkedExit?.handledBy ?? "-",
    receivedBy: source.receivedBy ?? linkedExit?.receivedBy ?? "-",
    rows,
  });
}
function downloadPreparedMaterialPdf(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement || (movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED")) {
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
  popup.focus();
  popup.print();
}

async function uploadSignedMaterialProof(root: HTMLElement, id: string) {
  const input = root.querySelector<HTMLInputElement>(`#signedProof-${CSS.escape(id)}`);
  const file = input?.files?.[0];
  if (!file) {
    showToast(root, "Ajoute la fiche signee avant de cloturer.", "error");
    return;
  }
  try {
    const updated = await uploadExitRequestProof(id, { fileName: file.name, uploadedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined });
    latestMovements = latestMovements.map((item) => item.id === updated.id ? updated : item);
    renderExitRequestDetail(root, updated);
    updateApiBackedViews(root);
    showToast(root, "Fiche signee ajoutee. Demande terminee.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Upload impossible.", "error");
  }
}

function viewSignedMaterialProof(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement?.proofFileName) {
    showToast(root, "Aucune preuve signee jointe.", "error");
    return;
  }
  showToast(root, "Preuve signee : " + movement.proofFileName);
}

async function openMaterialRequestPreparation(root: HTMLElement, id: string) {
  const movement = latestMovements.find((item) => item.id === id);
  if (!movement) {
    showToast(root, "Demande introuvable dans le registre charge.", "error");
    return;
  }
  if (movement.type !== "EXIT_REQUEST" || movement.status !== "SUBMITTED" || !canPrepareMaterialRequests()) {
    renderExitRequestDetail(root, movement);
    openModal(root, "exitRequestDetailModal");
    if (movement.status !== "SUBMITTED") showToast(root, "Cette demande est deja preparee ou terminee.");
    return;
  }
  openModal(root, "exitModal");
  await populateExitModals(root, "exitModal").catch(() => undefined);
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal) return;
  const articles = await getArticles().catch(() => []);
  fillMaterialRequestRows(root, movement, option("", "Selectionner article") + articleOptions(articles));
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const dateInput = modal.querySelector<HTMLInputElement>('input[type="date"]');
  setSelectValueOrText(selects[0], movement.clientId, movement.client?.name, "Client non renseigne");
  setSelectValueOrText(selects[1], movement.projectId, movement.project?.name, "Projet non renseigne");
  setSelectValueOrText(selects[2], movement.teamServiceId, movement.teamService?.name, "Equipe/service non renseigne");
  setProjectSiteOptions(selects[3], movement.projectId ?? "");
  setSelectValueOrText(selects[3], movement.siteLocationId, movement.siteLocation?.name, "Site non renseigne");
  setSelectToText(selects[4], movement.requestedBy || "Demandeur non renseigne");
  if (dateInput) dateInput.value = movement.date.slice(0, 10);
  setMaterialRequestMode(root, "prepare", movement);
  window.lucide?.createIcons();
}

async function submitMaterialRequestPreparation(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  const movement = selectedExitRequestId ? latestMovements.find((item) => item.id === selectedExitRequestId) : null;
  if (!modal || !movement) return;
  syncMaterialPreparationState(root);
  const submit = root.querySelector<HTMLButtonElement>("#materialSubmitButton");
  if (submit?.disabled) {
    showToast(root, "Corrige les quantites remises avant validation.", "error");
    return;
  }
  const rows = Array.from(modal.querySelectorAll<HTMLTableRowElement>("#materialRequestLines tr"));
  const lines = rows.map((row, index) => {
    const inputs = Array.from(row.querySelectorAll<HTMLInputElement>("input"));
    return {
      articleId: movement.lines[index]?.articleId ?? "",
      requestedQuantity: Number(movement.lines[index]?.requestedQuantity ?? 0),
      completedQuantity: toNumber(inputs[2]?.value) ?? 0,
      observation: inputs[3]?.value.trim() || undefined
    };
  }).filter((line) => line.articleId && line.completedQuantity > 0);
  if (!lines.length) {
    showToast(root, "Renseigne au moins une quantite remise.", "error");
    return;
  }
  const stockManager = root.querySelector<HTMLSelectElement>("#materialStockManager");
  const deliveredBy = root.querySelector<HTMLSelectElement>("#materialDeliveredBy");
  const receivedBy = root.querySelector<HTMLSelectElement>("#materialReceivedBy");
  const file = root.querySelector<HTMLInputElement>("#materialSignedPdf")?.files?.[0];
  try {
    let prepared = await prepareExitRequest(movement.id, {
      reference: "BS-" + Date.now(),
      fromLocationId: movement.fromLocationId ?? modal.dataset.defaultLocationId ?? "",
      handledBy: selectedText(stockManager ?? undefined),
      deliveredBy: selectedText(deliveredBy ?? undefined),
      receivedBy: selectedText(receivedBy ?? undefined),
      lines: lines.map((line, index) => ({
        ...line,
        lineId: movement.lines[index]?.id
      }))
    });
    if (file) {
      prepared = await uploadExitRequestProof(movement.id, { fileName: file.name, uploadedBy: selectedText(stockManager ?? undefined) });
    }
    closeModal(root, "exitModal");
    selectedExitRequestId = null;
    latestMovements = latestMovements.map((item) => item.id === prepared.id ? prepared : item);
    updateApiBackedViews(root);
    renderExitRequestDetail(root, prepared);
    openModal(root, "exitRequestDetailModal");
    showToast(root, file ? "Preparation validee et fiche signee ajoutee." : "Preparation validee. La fiche est prete a telecharger.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Preparation impossible.", "error");
  }
}
function refreshMaterialRequestLines(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("#materialRequestLines tr").forEach((row, index) => {
    const number = row.querySelector<HTMLElement>(".material-line-number");
    if (number) number.textContent = String(index + 1);
  });
  window.lucide?.createIcons();
}

function addMaterialRequestLine(root: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#materialRequestLines");
  const first = body?.querySelector<HTMLTableRowElement>("tr");
  if (!body || !first) return;
  const row = first.cloneNode(true) as HTMLTableRowElement;
  row.querySelectorAll<HTMLInputElement>("input").forEach((input) => { input.value = ""; });
  row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => { select.selectedIndex = 0; });
  body.appendChild(row);
  refreshMaterialRequestLines(root);
}

function removeMaterialRequestLine(root: HTMLElement, trigger: HTMLElement) {
  const body = root.querySelector<HTMLTableSectionElement>("#materialRequestLines");
  const rows = Array.from(body?.querySelectorAll<HTMLTableRowElement>("tr") ?? []);
  const row = trigger.closest("tr");
  if (!body || !row) return;
  if (rows.length <= 1) {
    row.querySelectorAll<HTMLInputElement>("input").forEach((input) => { input.value = ""; });
    row.querySelectorAll<HTMLSelectElement>("select").forEach((select) => { select.selectedIndex = 0; });
  } else {
    row.remove();
  }
  refreshMaterialRequestLines(root);
}

async function submitExitRequest(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#exitModal");
  if (!modal) return;
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const rows = Array.from(modal.querySelectorAll<HTMLTableRowElement>("tbody tr"));
  const lines = rows.map((row) => {
    const articleId = row.querySelector<HTMLSelectElement>("select")?.value ?? "";
    const lineInputs = Array.from(row.querySelectorAll<HTMLInputElement>("input"));
    return { articleId, requestedQuantity: toNumber(lineInputs[1]?.value) ?? 0, observation: lineInputs[3]?.value.trim() || undefined };
  }).filter((line) => line.articleId && line.requestedQuantity > 0);
  if (!lines.length) {
    showToast(root, "Ajoute au moins une ligne avec une quantite demandee.", "error");
    return;
  }
  try {
    await createExitRequest({
      reference: "DS-" + Date.now(),
      date: modal.querySelector<HTMLInputElement>('input[type="date"]')?.value || new Date().toISOString(),
      clientId: selects[0]?.value || undefined,
      projectId: selects[1]?.value || undefined,
      teamServiceId: selects[2]?.value || undefined,
      siteLocationId: selects[3]?.value || undefined,
      fromLocationId: modal.dataset.defaultLocationId || undefined,
      requestedBy: selectedText(selects[4]),
      notes: undefined,
      lines
    });
    closeModal(root, "exitModal");
    updateApiBackedViews(root);
    showToast(root, "Demande materiel soumise. Elle apparait dans le registre sorties.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Demande impossible.", "error");
  }
}

async function submitDirectExit(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#directExitModal");
  if (!modal) return;
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const notes = modal.querySelector<HTMLTextAreaElement>("textarea")?.value.trim();
  const articleId = selects[0]?.value;
  const fromLocationId = modal.dataset.defaultLocationId;
  const quantity = toNumber(inputs[2]?.value) ?? 0;
  if (!articleId || !fromLocationId || quantity <= 0) {
    showToast(root, "Article, magasin source et quantite sont requis pour une sortie.", "error");
    return;
  }
  try {
    await createStockExit({
      reference: "BS-" + Date.now(),
      date: inputs[0]?.value.trim() || new Date().toISOString(),
      projectId: selects[1]?.value || undefined,
      fromLocationId,
      requestedBy: selects[2]?.selectedOptions[0]?.textContent?.trim() || undefined,
      handledBy: selects[3]?.selectedOptions[0]?.textContent?.trim() || undefined,
      deliveredBy: selects[5]?.selectedOptions[0]?.textContent?.trim() || undefined,
      notes,
      lines: [{ articleId, requestedQuantity: quantity, completedQuantity: quantity, observation: inputs[3]?.value.trim() || undefined }]
    });
    closeModal(root, "directExitModal");
    updateApiBackedViews(root);
    showToast(root, "Sortie stock validee. Le stock disponible est diminue.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Sortie impossible.", "error");
  }
}


async function populateReturnTransferModals(root: HTMLElement, modalId: "returnModal" | "transferModal") {
  const modal = root.querySelector<HTMLElement>("#" + modalId);
  if (!modal) return;
  const [articles, locations, users, movements] = await Promise.all([
    getArticles().catch(() => []),
    getLocations().catch(() => []),
    getUsers().catch(() => []),
    getStockMovements().catch(() => [])
  ]);
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const userChoices = userOptions(users);
  if (modalId === "transferModal") {
    fillSelect(selects[0], articleOptions(articles));
    fillSelect(selects[1], locationOptions(locations));
    fillSelect(selects[2], locationOptions(locations));
    fillSelect(selects[4], userChoices);
    fillSelect(selects[5], userChoices);
    fillSelect(selects[6], userChoices);
    return;
  }
  const exits = movements.filter((movement) => movement.type === "EXIT" && movement.lines.length > 0);
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const firstExit = exits[0];
  modal.dataset.returnArticleId = firstExit?.lines[0]?.articleId ?? "";
  modal.dataset.returnSourceMovementId = firstExit?.id ?? "";
  if (inputs[0]) {
    inputs[0].value = firstExit ? firstExit.reference + " - " + (firstExit.lines[0]?.article?.designation ?? "Article") : "Aucune sortie reelle disponible";
  }
  fillSelect(selects[2], locationOptions(locations));
  fillSelect(selects[3], userChoices);
  fillSelect(selects[4], userChoices);
  fillSelect(selects[5], userChoices);
}

async function submitStockReturn(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#returnModal");
  if (!modal) return;
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const notes = modal.querySelector<HTMLTextAreaElement>("textarea")?.value.trim();
  const articleId = modal.dataset.returnArticleId;
  const quantity = toNumber(inputs[2]?.value ?? "0");
  const toLocationId = selects[2]?.value;
  const decision = selectedText(selects[1])?.toLowerCase() ?? "";
  const reintegrate = decision.includes("reintegrer") || decision.includes("stock");
  if (!articleId || !toLocationId || quantity <= 0) {
    showToast(root, "Sortie concernee, emplacement retour et quantite sont requis.", "error");
    return;
  }
  try {
    await createStockReturn({
      reference: "RET-" + Date.now(),
      date: inputs[1]?.value.trim() || new Date().toISOString(),
      toLocationId,
      handledBy: selectedText(selects[3]),
      deliveredBy: selectedText(selects[4]),
      receivedBy: selectedText(selects[5]),
      notes,
      reintegrate,
      lines: [{ articleId, completedQuantity: quantity, observation: selectedText(selects[0]) || notes }]
    });
    closeModal(root, "returnModal");
    updateApiBackedViews(root);
    showToast(root, reintegrate ? "Retour enregistre et stock reintegre." : "Retour enregistre pour controle.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Retour impossible.", "error");
  }
}

async function submitStockTransfer(root: HTMLElement) {
  const modal = root.querySelector<HTMLElement>("#transferModal");
  if (!modal) return;
  const selects = Array.from(modal.querySelectorAll<HTMLSelectElement>("select"));
  const inputs = Array.from(modal.querySelectorAll<HTMLInputElement>("input"));
  const notes = modal.querySelector<HTMLTextAreaElement>("textarea")?.value.trim();
  const articleId = selects[0]?.value;
  const fromLocationId = selects[1]?.value;
  const toLocationId = selects[2]?.value;
  const quantity = toNumber(inputs[1]?.value ?? "0");
  if (!articleId || !fromLocationId || !toLocationId || quantity <= 0) {
    showToast(root, "Article, source, destination et quantite sont requis.", "error");
    return;
  }
  try {
    await createStockTransfer({
      reference: "TRF-" + Date.now(),
      date: inputs[0]?.value.trim() || new Date().toISOString(),
      fromLocationId,
      toLocationId,
      handledBy: selectedText(selects[4]),
      deliveredBy: selectedText(selects[5]),
      receivedBy: selectedText(selects[6]),
      notes,
      lines: [{ articleId, completedQuantity: quantity, observation: notes }]
    });
    closeModal(root, "transferModal");
    updateApiBackedViews(root);
    showToast(root, "Transfert enregistre. Le stock source et destination sont mis a jour.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Transfert impossible.", "error");
  }
}


function setAuditCardValue(root: HTMLElement, label: string, value: number | string) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>("#audit .bg-white.rounded-xl"));
  const card = cards.find((element) => element.textContent?.includes(label));
  const number = card?.querySelector<HTMLElement>(".text-3xl");
  if (number) number.textContent = formatNumber(value);
}

function auditSeverityBadge(severity: string) {
  if (severity === "CRITIQUE") return badge("Critique", "error");
  return badge("A verifier", "warning");
}

function auditAlertRow(alert: AuditAlert) {
  return "<tr>"
    + "<td class=\"px-5 py-4 font-bold\">" + escapeHtml(alert.type) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(alert.object) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(alert.location) + "</td>"
    + "<td class=\"px-5 py-4\">" + auditSeverityBadge(alert.severity) + "</td>"
    + "<td class=\"px-5 py-4\">" + formatDate(alert.date) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(alert.action) + "</td>"
    + "<td class=\"px-5 py-4\">" + badge(alert.status === "OUVERTE" ? "Ouverte" : alert.status, "warning") + "</td>"
    + "<td class=\"px-5 py-4 text-right\"><button class=\"text-accent-600 font-semibold\">Voir</button></td>"
    + "</tr>";
}

function auditActionLabel(action: string) {
  return ({
    CREATE_STOCK_ENTRY: "Creation entree",
    CREATE_EXIT_REQUEST: "Demande sortie",
    CREATE_STOCK_EXIT: "Sortie stock",
    CREATE_STOCK_RETURN: "Retour stock",
    CREATE_STOCK_TRANSFER: "Transfert stock",
    CREATE_INVENTORY_ADJUSTMENT: "Comptage inventaire"
  } as Record<string, string>)[action] ?? action;
}

function auditLogRow(log: AuditLog) {
  const after = log.after && typeof log.after === "object" ? log.after as Record<string, unknown> : {};
  const reference = typeof after.reference === "string" ? after.reference : log.entityId ?? "-";
  const beforeLabel = log.before ? "Donnees avant" : "-";
  const afterLabel = reference;
  return "<tr>"
    + "<td class=\"px-5 py-4\">" + formatDate(log.createdAt) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(log.userId ?? "Systeme") + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(auditActionLabel(log.action)) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(log.entity) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(beforeLabel) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(afterLabel) + "</td>"
    + "<td class=\"px-5 py-4\">" + badge("Trace", "success") + "</td>"
    + "</tr>";
}


function vehicleStatusLabel(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponible",
    ASSIGNED: "Affecte",
    MAINTENANCE: "Maintenance",
    OUT_OF_SERVICE: "Hors service"
  };
  return labels[status] ?? status;
}

function vehicleStatusTone(status: string): "success" | "warning" | "error" | "gray" | "accent" {
  if (status === "AVAILABLE") return "success";
  if (status === "ASSIGNED") return "accent";
  if (status === "MAINTENANCE") return "warning";
  if (status === "OUT_OF_SERVICE") return "error";
  return "gray";
}

function vehicleHasDocumentWarning(vehicle: Vehicle) {
  const limit = new Date();
  limit.setDate(limit.getDate() + 30);
  const insurance = vehicle.insuranceExpiresAt ? new Date(vehicle.insuranceExpiresAt) : null;
  const visit = vehicle.technicalVisitAt ? new Date(vehicle.technicalVisitAt) : null;
  return Boolean((insurance && insurance <= limit) || (visit && visit <= limit));
}

function vehicleRow(vehicle: Vehicle) {
  const statusLabel = vehicleHasDocumentWarning(vehicle) && vehicle.status !== "MAINTENANCE" && vehicle.status !== "OUT_OF_SERVICE"
    ? "Document a suivre"
    : vehicleStatusLabel(vehicle.status);
  const statusTone = vehicleHasDocumentWarning(vehicle) && vehicle.status !== "MAINTENANCE" && vehicle.status !== "OUT_OF_SERVICE"
    ? "warning"
    : vehicleStatusTone(vehicle.status);
  return "<tr>"
    + "<td class=\"px-5 py-4\"><div class=\"font-bold\">" + escapeHtml(vehicle.name) + "</div><div class=\"text-xs text-gray-500\">" + escapeHtml(vehicle.code) + "</div></td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(vehicle.plateNumber) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(vehicle.type) + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(vehicle.assignment ?? "Disponible") + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(vehicle.driverName ?? "-") + "</td>"
    + "<td class=\"px-5 py-4\">" + escapeHtml(vehicle.apprenticeName ?? "-") + "</td>"
    + "<td class=\"px-5 py-4\">" + badge(statusLabel, statusTone) + "</td>"
    + "<td class=\"px-5 py-4 text-right\"><button data-action=\"openVehicleDetail('" + escapeHtml(vehicle.id) + "')\" class=\"inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50\" title=\"Voir la fiche\"><i data-lucide=\"eye\" class=\"w-4 h-4\"></i></button></td>"
    + "</tr>";
}

function setVehicleKpi(root: HTMLElement, key: string, value: number) {
  const target = root.querySelector<HTMLElement>(`[data-vehicle-kpi="${key}"]`);
  if (target) target.textContent = formatNumber(value);
}

function renderVehicles(root: HTMLElement, vehicles: Vehicle[]) {
  latestVehicles = vehicles;
  const body = root.querySelector<HTMLElement>("#vehicles-table tbody");
  if (body) body.innerHTML = vehicles.length ? vehicles.map(vehicleRow).join("") : emptyRow(8, "Aucun vehicule en base pour le moment.");
  setVehicleKpi(root, "active", vehicles.filter((vehicle) => vehicle.active).length);
  setVehicleKpi(root, "assigned", vehicles.filter((vehicle) => vehicle.status === "ASSIGNED" || Boolean(vehicle.driverName) || Boolean(vehicle.assignment)).length);
  setVehicleKpi(root, "documents", vehicles.filter(vehicleHasDocumentWarning).length);
  setVehicleKpi(root, "maintenance", vehicles.filter((vehicle) => vehicle.status === "MAINTENANCE").length);
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
  root.querySelectorAll<HTMLInputElement>("#vehicleName,#vehiclePlate,#vehicleDriver,#vehicleApprentice,#vehicleAssignment,#vehicleInsurance,#vehicleVisit").forEach((input) => { input.value = ""; });
  const notes = root.querySelector<HTMLTextAreaElement>("#vehicleNotes");
  if (notes) notes.value = "";
  const status = root.querySelector<HTMLSelectElement>("#vehicleStatus");
  if (status) status.value = "AVAILABLE";
}

async function submitVehicle(root: HTMLElement) {
  const code = root.querySelector<HTMLInputElement>("#vehicleCode")?.value.trim() ?? "";
  const name = root.querySelector<HTMLInputElement>("#vehicleName")?.value.trim() ?? "";
  const type = root.querySelector<HTMLSelectElement>("#vehicleType")?.value ?? "Voiture";
  const plateNumber = root.querySelector<HTMLInputElement>("#vehiclePlate")?.value.trim() ?? "";
  if (!name || !plateNumber) {
    showToast(root, "Nom du vehicule et immatriculation sont requis.", "error");
    return;
  }
  try {
    await createVehicle({
      code,
      name,
      type,
      plateNumber,
      assignment: root.querySelector<HTMLInputElement>("#vehicleAssignment")?.value.trim() || undefined,
      driverName: root.querySelector<HTMLInputElement>("#vehicleDriver")?.value.trim() || undefined,
      apprenticeName: root.querySelector<HTMLInputElement>("#vehicleApprentice")?.value.trim() || undefined,
      status: root.querySelector<HTMLSelectElement>("#vehicleStatus")?.value || "AVAILABLE",
      insuranceExpiresAt: root.querySelector<HTMLInputElement>("#vehicleInsurance")?.value.trim() || undefined,
      technicalVisitAt: root.querySelector<HTMLInputElement>("#vehicleVisit")?.value.trim() || undefined,
      notes: root.querySelector<HTMLTextAreaElement>("#vehicleNotes")?.value.trim() || undefined
    });
    closeModal(root, "vehicleModal");
    updateApiBackedViews(root);
    showToast(root, "Vehicule cree et ajoute au parc auto.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Creation vehicule impossible.", "error");
  }
}

function openVehicleDetail(root: HTMLElement, id: string) {
  const vehicle = latestVehicles.find((item) => item.id === id);
  if (!vehicle) {
    showToast(root, "Vehicule introuvable dans la liste chargee.", "error");
    return;
  }
  const title = root.querySelector<HTMLElement>("#vehicleDetailTitle");
  const subtitle = root.querySelector<HTMLElement>("#vehicleDetailSubtitle");
  const cards = root.querySelector<HTMLElement>("#vehicleDetailCards");
  const tracking = root.querySelector<HTMLElement>("#vehicleDetailTracking");
  if (title) title.textContent = vehicle.code + " - " + vehicle.name;
  if (subtitle) subtitle.textContent = vehicle.assignment ? "Vehicule rattache a " + vehicle.assignment + "." : "Vehicule disponible ou sans affectation renseignee.";
  if (cards) cards.innerHTML = [
    ["Immatriculation", vehicle.plateNumber],
    ["Type", vehicle.type],
    ["Chauffeur", vehicle.driverName ?? "-"],
    ["Apprenti", vehicle.apprenticeName ?? "-"]
  ].map(([label, value]) => "<div class=\"p-4 rounded-xl bg-gray-50 border\"><div class=\"text-xs font-semibold text-gray-500\">" + escapeHtml(label) + "</div><div class=\"font-bold mt-1\">" + escapeHtml(value) + "</div></div>").join("");
  if (tracking) tracking.innerHTML = [
    ["Affectation", vehicle.assignment ?? "Disponible"],
    ["Assurance", vehicle.insuranceExpiresAt ? formatDate(vehicle.insuranceExpiresAt) : "Non renseignee"],
    ["Visite technique", vehicle.technicalVisitAt ? formatDate(vehicle.technicalVisitAt) : "Non renseignee"],
    ["Statut", vehicleStatusLabel(vehicle.status)],
    ["Observation", vehicle.notes ?? "-"],
    ["Derniere mise a jour", formatDate(vehicle.updatedAt)]
  ].map(([label, value]) => "<div><span class=\"text-gray-500\">" + escapeHtml(label) + "</span><div class=\"font-semibold\">" + escapeHtml(value) + "</div></div>").join("");
  const history = root.querySelector<HTMLElement>("#vehicleHistoryPanel");
  if (history) history.classList.add("hidden");
  openModal(root, "vehicleDetailModal");
}

function toggleVehicleHistory(root: HTMLElement) {
  root.querySelector<HTMLElement>("#vehicleHistoryPanel")?.classList.toggle("hidden");
}
function roleLabel(role: string) {
  return ({
    ADMIN_STOCK: "Admin Stock",
    GESTIONNAIRE_STOCK: "Gestionnaire",
    AUDIT: "Audit",
    RH: "RH",
    DIRECTION: "Direction",
    CHEF_PROJET: "Chef projet"
  } as Record<string, string>)[role] ?? role;
}

function accessLabel(roles: string[]) {
  if (roles.includes("ADMIN_STOCK")) return "Tous modules";
  if (roles.includes("GESTIONNAIRE_STOCK")) return "Entrees, sorties, retours";
  if (roles.includes("AUDIT")) return "Inventaire, alertes, exports";
  if (roles.includes("DIRECTION")) return "KPI et controles";
  if (roles.includes("CHEF_PROJET")) return "Demandes, stock consulte";
  if (roles.includes("RH")) return "Consultation inventaire";
  return "Acces limite";
}

function userRow(user: StockUser) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const role = user.roles[0] ?? "GESTIONNAIRE_STOCK";
  return `<tr><td class="px-5 py-4"><div class="font-bold">${escapeHtml(fullName)}</div><div class="text-xs text-gray-500">${escapeHtml(user.roles.map(roleLabel).join(", "))}</div></td><td class="px-5 py-4">${escapeHtml(user.email)}</td><td class="px-5 py-4">${badge(roleLabel(role), role === "ADMIN_STOCK" ? "accent" : role === "AUDIT" ? "warning" : "success")}</td><td class="px-5 py-4">${escapeHtml(accessLabel(user.roles))}</td><td class="px-5 py-4">${badge(user.active ? "Actif" : "Inactif", user.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><button data-action="openUserDetail('${escapeHtml(user.id)}')" title="Voir utilisateur" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600"><i data-lucide="eye" class="w-4 h-4"></i></button></td></tr>`;
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
      const articleBody = root.querySelector<HTMLElement>('#ref-articles tbody');
      if (articleBody) articleBody.innerHTML = articles.length ? articles.map(articleRow).join("") : emptyRow(10, "Aucun article en base pour le moment.");
      setText(root, "#refArticlesCount", articles.length);
      renderInventory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getSuppliers()
    .then((suppliers) => {
      latestSuppliers = suppliers;
      const suppliersBody = root.querySelector<HTMLElement>('#ref-suppliers tbody');
      if (suppliersBody) suppliersBody.innerHTML = suppliers.length ? suppliers.map(supplierRow).join("") : emptyRow(8, "Aucun fournisseur en base pour le moment.");
      setText(root, "#refSuppliersCount", suppliers.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getClients()
    .then((clients) => {
      latestClients = clients;
      const clientsBody = root.querySelector<HTMLElement>('#ref-clients tbody');
      if (clientsBody) clientsBody.innerHTML = clients.length ? clients.map(clientRow).join("") : emptyRow(7, "Aucun client en base pour le moment.");
      setText(root, "#refClientsCount", clients.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getTeamServices()
    .then((services) => {
      latestTeamServices = services;
      const servicesBody = root.querySelector<HTMLElement>('#ref-team-services tbody');
      if (servicesBody) servicesBody.innerHTML = services.length ? services.map(teamServiceRow).join("") : emptyRow(6, "Aucune equipe ou service en base pour le moment.");
      setText(root, "#refTeamServicesCount", services.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getEmployees()
    .then((employees) => {
      latestEmployees = employees;
      const employeesBody = root.querySelector<HTMLElement>('#ref-employees tbody');
      if (employeesBody) employeesBody.innerHTML = employees.length ? employees.map(employeeRefRow).join("") : emptyRow(7, "Aucun employe en base pour le moment.");
      setText(root, "#refEmployeesCount", employees.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);
  getProjects()
    .then((projects) => {
      latestProjects = projects;
      const projectsBody = root.querySelector<HTMLElement>('#ref-projects tbody');
      if (projectsBody) projectsBody.innerHTML = projects.length ? projects.map(projectRow).join("") : emptyRow(8, "Aucun projet en base pour le moment.");
      setText(root, "#refProjectsCount", projects.length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getLocations()
    .then((locations) => {
      latestLocations = locations;
      const locationBody = root.querySelector<HTMLElement>('#ref-locations tbody');
      if (locationBody) locationBody.innerHTML = locations.length ? locations.map(locationRow).join("") : emptyRow(7, "Aucun emplacement en base pour le moment.");
      setText(root, "#refLocationsCount", locations.length);
      const siteBody = root.querySelector<HTMLElement>('#ref-sites tbody');
      const sites = locations.filter((location) => ["SITE", "CHANTIER"].includes(location.type.toUpperCase()));
      if (siteBody) siteBody.innerHTML = sites.length ? sites.map(siteRow).join("") : emptyRow(7, "Aucun site ou chantier en base pour le moment.");
      setText(root, "#refSitesCount", sites.length);
      renderInventory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getStockMovements()
    .then((movements) => {
      const entriesBody = root.querySelector<HTMLElement>('#entrees tbody');
      const entries = movements.filter((movement) => movement.type === "ENTRY");
      if (entriesBody) entriesBody.innerHTML = entries.length ? entries.map(entryMovementRow).join("") : emptyRow(12, "Aucune entree stock en base pour le moment.");
      setText(root, "#entriesTodayCount", entries.filter((movement) => isToday(movement.date)).length);
      setText(root, "#entriesReceivedCount", entries.filter((movement) => movement.status === "COMPLETED").length);
      setText(root, "#entriesPartialCount", entries.filter((movement) => movement.status === "PREPARED").length);
      setText(root, "#entriesIssueCount", entries.filter((movement) => movement.status === "REJECTED").length);
      const exitsBody = root.querySelector<HTMLElement>('#sortie tbody');
      latestMovements = movements;
      const exits = visibleExitMovements(movements);
      const pendingExits = exits.filter((movement) => movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED");
      const pendingAlert = root.querySelector<HTMLElement>("#exitPendingAlert");
      const pendingCount = root.querySelector<HTMLElement>("#exitPendingCount");
      const dashboardPendingCount = root.querySelector<HTMLElement>("#dashboardPendingExitRequestsCount");
      if (pendingAlert) pendingAlert.classList.toggle("hidden", pendingExits.length === 0);
      if (pendingCount) pendingCount.textContent = String(pendingExits.length);
      if (dashboardPendingCount) dashboardPendingCount.textContent = String(pendingExits.length);
      renderExitRegistry(root);
      setText(root, "#exitRequestsCount", pendingExits.length);
      setText(root, "#exitCompletedCount", exits.filter((movement) => movement.type === "EXIT" && movement.status === "COMPLETED").length);
      setText(root, "#exitBlockedCount", exits.filter((movement) => movement.status === "REJECTED" || movement.status === "CANCELLED").length);
      setText(root, "#exitTodayCount", exits.filter((movement) => isToday(movement.date)).length);
      const returnsBody = root.querySelector<HTMLElement>('#retours tbody');
      const returns = movements.filter((movement) => movement.type === "RETURN" || movement.type === "TRANSFER");
      if (returnsBody) returnsBody.innerHTML = returns.length ? returns.map(returnTransferRow).join("") : emptyRow(7, "Aucun retour ou transfert en base pour le moment.");
      setText(root, "#returnsExpectedCount", returns.filter((movement) => movement.type === "RETURN" && movement.status !== "COMPLETED").length);
      setText(root, "#transfersOpenCount", returns.filter((movement) => movement.type === "TRANSFER" && movement.status !== "COMPLETED").length);
      setText(root, "#returnsReviewCount", returns.filter((movement) => movement.status === "SUBMITTED" || movement.status === "PREPARED").length);
      renderHistory(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getStockLevels()
    .then((levels) => {
      const stockBody = root.querySelector<HTMLElement>('#stock tbody');
      if (stockBody) stockBody.innerHTML = levels.length ? levels.map(stockRow).join("") : emptyRow(8, "Aucun stock disponible pour le moment.");
      latestStockLevels = levels;
      renderInventory(root);
      const exitsBody = root.querySelector<HTMLElement>('#sortie tbody');
      const exits = visibleExitMovements(latestMovements);
      if (exitsBody && exits.length) exitsBody.innerHTML = exits.map(exitMovementRow).join("");
      renderReappro(root);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getEquipments()
    .then((equipments) => {
      latestEquipments = equipments;
      const body = root.querySelector<HTMLElement>('#equipments-table tbody');
      if (body) body.innerHTML = equipments.length ? equipments.map(equipmentRow).join("") : emptyRow(8, "Aucun equipement individuel en base pour le moment.");
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
      const usersBody = root.querySelector<HTMLElement>('#users tbody');
      if (usersBody) usersBody.innerHTML = users.length ? users.map(userRow).join("") : emptyRow(6, "Aucun utilisateur en base pour le moment.");
      setText(root, "#usersAdminCount", users.filter((user) => user.roles.includes("ADMIN_STOCK")).length);
      setText(root, "#usersManagersCount", users.filter((user) => user.roles.includes("GESTIONNAIRE_STOCK")).length);
      setText(root, "#usersAuditCount", users.filter((user) => user.roles.includes("AUDIT")).length);
      setText(root, "#usersProjectManagersCount", users.filter((user) => user.roles.includes("CHEF_PROJET")).length);
      setText(root, "#usersDirectionCount", users.filter((user) => user.roles.includes("DIRECTION")).length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getAuditAlerts()
    .then((alerts) => {
      const alertsBody = root.querySelector<HTMLElement>('#audit-alerts tbody');
      if (alertsBody) alertsBody.innerHTML = alerts.length ? alerts.map(auditAlertRow).join("") : emptyRow(8, "Aucune alerte ouverte pour le moment.");      const homeAlerts = root.querySelector<HTMLElement>("#homeAuditAlerts");
      if (homeAlerts) homeAlerts.innerHTML = alerts.length
        ? alerts.slice(0, 3).map((alert) => "<div class=\"p-4 rounded-xl bg-warning-50 border border-warning-100\"><div class=\"font-bold text-warning-700\">" + escapeHtml(alert.type) + "</div><div class=\"text-sm text-gray-600 mt-1\">" + escapeHtml(alert.action + " - " + alert.object) + "</div></div>").join("")
        : "<div class=\"p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500\">Aucune alerte audit pour le moment.</div>";
      setAuditCardValue(root, "Alertes ouvertes", alerts.length);
      setAuditCardValue(root, "Ruptures", alerts.filter((alert) => alert.type === "Rupture").length);
      setAuditCardValue(root, "Ecarts inventaire", alerts.filter((alert) => alert.type === "Ecart inventaire").length);
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getAuditLogs()
    .then((logs) => {
      const logsBody = root.querySelector<HTMLElement>('#audit-journal tbody');
      if (logsBody) logsBody.innerHTML = logs.length ? logs.map(auditLogRow).join("") : emptyRow(7, "Aucune trace audit pour le moment.");
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

function renderHeaderButton(action: { label: string; icon: string; modal?: string; action?: string; variant: "primary" | "secondary" }) {
  const classes = action.variant === "primary"
    ? "px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-semibold hover:bg-accent-500 flex items-center gap-2"
    : "px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2";
  const dataAction = action.action ? ` data-action="${action.action}"` : action.modal ? ` data-action="openModal('${action.modal}')"` : "";
  return `<button class="${classes}"${dataAction}><i data-lucide="${action.icon}" class="w-4 h-4"></i>${action.label}</button>`;
}
type HeaderAction = { label: string; icon: string; modal?: string; action?: string; variant: "primary" | "secondary" };

function canUseHeaderAction(view: string, action: HeaderAction) {
  if (!currentUser) return false;
  if (hasRole("ADMIN_STOCK")) return true;
  if (action.action?.startsWith("exportData")) return hasRole("DIRECTION") || hasRole("AUDIT") || hasRole("GESTIONNAIRE_STOCK");
  if (action.modal === "importModal") return hasRole("GESTIONNAIRE_STOCK");
  if (view === "entrees") return hasRole("GESTIONNAIRE_STOCK");
  if (view === "sortie" && action.modal === "directExitModal") return hasRole("GESTIONNAIRE_STOCK");
  if (view === "sortie" && action.modal === "exitModal") return hasRole("GESTIONNAIRE_STOCK") || hasRole("CHEF_PROJET");
  if (view === "retours") return hasRole("GESTIONNAIRE_STOCK");
  if (view === "inventaire") return hasRole("GESTIONNAIRE_STOCK") || hasRole("AUDIT");
  if (view === "equipements") return hasRole("GESTIONNAIRE_STOCK") || hasRole("RH");
  return false;
}

function setViewActions(root: HTMLElement, view: string) {
  const actions = root.querySelector<HTMLElement>("#viewActions");
  if (!actions) return;
  const actionByView: Record<string, HeaderAction[]> = {
    home: [{ label: "Importer XLS", icon: "upload", modal: "importModal", variant: "secondary" }],
    entrees: [
      { label: "Importer XLS", icon: "upload", modal: "importModal", variant: "secondary" },
      { label: "Nouvelle entree", icon: "plus", modal: "entryModal", variant: "primary" }
    ],
    referentiels: [{ label: "Nouvel element", icon: "plus", modal: "referentialModal", variant: "primary" }],
    stock: [{ label: "Importer XLS", icon: "upload", modal: "importModal", variant: "secondary" }],
    sortie: [
      { label: "Nouvelle sortie", icon: "package-minus", modal: "directExitModal", variant: "secondary" },
      { label: "Nouvelle demande", icon: "plus", modal: "exitModal", variant: "primary" }
    ],
    retours: [
      { label: "Nouveau transfert", icon: "shuffle", modal: "transferModal", variant: "secondary" },
      { label: "Nouveau retour", icon: "rotate-ccw", modal: "returnModal", variant: "primary" }
    ],
    reappro: [{ label: "Exporter liste", icon: "download", action: "exportData('reappro')", variant: "secondary" }],
    inventaire: [
      { label: "Modele Excel", icon: "download", variant: "secondary" },
      { label: "Importer XLS", icon: "upload", modal: "importModal", variant: "secondary" }
    ],
    equipements: [{ label: "Affecter equipement", icon: "plus", modal: "equipmentModal", variant: "primary" }],
    parcAuto: [{ label: "Nouveau vehicule", icon: "plus", modal: "vehicleModal", variant: "primary" }],
    audit: [],
    users: [{ label: "Nouvel utilisateur", icon: "user-plus", modal: "userModal", variant: "primary" }],
    historique: [{ label: "Export complet", icon: "file-down", action: "exportData('all')", variant: "secondary" }]
  };
  actions.innerHTML = (actionByView[view] ?? []).filter((action) => canUseHeaderAction(view, action)).map(renderHeaderButton).join("");
}

function showView(root: HTMLElement, view: string, navButton?: HTMLElement) {
  root.querySelectorAll(".view").forEach((section) => setVisible(section, section.id === view));
  if (navButton?.classList.contains("nav-btn")) {
    clearActiveNav(root);
    activateNavButton(navButton);
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
    users: "Utilisateurs & roles"
  };
  if (crumb) crumb.textContent = titles[view] ?? "Accueil Module";
  setViewActions(root, view);
  window.lucide?.createIcons();
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
  const subtitleNode = modal?.querySelector<HTMLElement>(".text-xs.text-gray-500.font-semibold");
  const titleNode = modal?.querySelector<HTMLHeadingElement>("h2");
  if (subtitleNode) subtitleNode.textContent = subtitle;
  if (titleNode) titleNode.textContent = title;
}

function prepareUserModal(root: HTMLElement) {
  selectedUserId = null;
  setUserModalMode(root, "Nouvel utilisateur", "Administration");
  const firstName = root.querySelector<HTMLInputElement>("#userFirstName");
  const lastName = root.querySelector<HTMLInputElement>("#userLastName");
  const email = root.querySelector<HTMLInputElement>("#userEmail");
  const password = root.querySelector<HTMLInputElement>("#userPassword");
  const active = root.querySelector<HTMLSelectElement>("#userActive");
  if (firstName) firstName.value = "";
  if (lastName) lastName.value = "";
  if (email) email.value = "";
  if (password) password.value = "";
  if (active) active.value = "true";
  root.querySelectorAll<HTMLInputElement>('input[name="userRole"]').forEach((input) => {
    input.checked = input.value === "GESTIONNAIRE_STOCK";
  });
}

function fillUserModal(root: HTMLElement, user: StockUser) {
  selectedUserId = user.id;
  setUserModalMode(root, `${user.firstName} ${user.lastName}`.trim() || user.email, "Compte utilisateur");
  const firstName = root.querySelector<HTMLInputElement>("#userFirstName");
  const lastName = root.querySelector<HTMLInputElement>("#userLastName");
  const email = root.querySelector<HTMLInputElement>("#userEmail");
  const password = root.querySelector<HTMLInputElement>("#userPassword");
  const active = root.querySelector<HTMLSelectElement>("#userActive");
  if (firstName) firstName.value = user.firstName;
  if (lastName) lastName.value = user.lastName;
  if (email) email.value = user.email;
  if (password) password.value = "";
  if (active) active.value = user.active ? "true" : "false";
  root.querySelectorAll<HTMLInputElement>('input[name="userRole"]').forEach((input) => {
    input.checked = user.roles.includes(input.value);
  });
}

function openUserDetail(root: HTMLElement, id: string) {
  const user = latestUsers.find((item: StockUser) => item.id === id);
  if (!user) {
    showToast(root, "Utilisateur introuvable dans le registre charge.", "error");
    return;
  }
  openModal(root, "userModal");
  fillUserModal(root, user);
}
function openModal(root: HTMLElement, id: string) {
  setVisible(root.querySelector(`#${CSS.escape(id)}`), true);
  if (id === "userModal") {
    prepareUserModal(root);
  }
  if (id === "referentialModal") {
    updateReferentialForm(root, root.querySelector<HTMLSelectElement>("#referentialType")?.value ?? "");
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
  const email = root.querySelector<HTMLInputElement>("#loginEmail")?.value.trim() ?? "";
  const password = root.querySelector<HTMLInputElement>("#loginPassword")?.value ?? "";
  setLoginError(root, null);
  try {
    const { user } = await loginUser({ email, password });
    currentUser = user;
    localStorage.setItem("stock-hub.session", "1");
    localStorage.setItem("stock-hub.user", JSON.stringify(user));
    hideLogin(root);
    updateCurrentUserDisplay(root);
    applyRoleAccess(root);
    showView(root, "home", root.querySelector<HTMLElement>('.nav-btn[data-view="home"]') ?? undefined);
  } catch (error) {
    setLoginError(root, error instanceof Error ? error.message : "Connexion impossible.");
  }
}

function logout(root: HTMLElement) {
  currentUser = null;
  localStorage.removeItem("stock-hub.session");
  localStorage.removeItem("stock-hub.user");
  updateCurrentUserDisplay(root);
  showLogin(root);
}

function prepareTemplateActions(root: HTMLElement) {
  root.querySelectorAll<HTMLButtonElement>("#referentialModal button").forEach((button) => {
    if (!button.dataset.action && button.textContent?.trim().includes("Creer element")) {
      button.dataset.action = "submitReferential";
    }
  });
  root.querySelectorAll<HTMLButtonElement>("#entryModal button").forEach((button) => {
    if (!button.dataset.action && button.textContent?.trim().includes("Enregistrer entree")) {
      button.dataset.action = "submitStockEntry";
    }
  });
  root.querySelectorAll<HTMLButtonElement>("#exitModal button").forEach((button) => {
    if (button.textContent?.trim().includes("Soumettre demande")) {
      button.dataset.action = "submitExitRequest";
    }
  });
  root.querySelectorAll<HTMLButtonElement>("#directExitModal button").forEach((button) => {
    if (!button.dataset.action && button.textContent?.trim().includes("Valider sortie")) {
      button.dataset.action = "submitDirectExit";
    }
  });
  root.querySelectorAll<HTMLButtonElement>("#returnModal button").forEach((button) => {
    if (!button.dataset.action && button.textContent?.trim().includes("Enregistrer retour")) {
      button.dataset.action = "submitStockReturn";
    }
  });
  root.querySelectorAll<HTMLButtonElement>("#transferModal button").forEach((button) => {
    if (!button.dataset.action && button.textContent?.trim().includes("Enregistrer transfert")) {
      button.dataset.action = "submitStockTransfer";
    }
  });
  root.querySelectorAll<HTMLButtonElement>("#countModal button").forEach((button) => {
    if (button.textContent?.trim().includes("Enregistrer comptage")) {
      button.dataset.action = "submitInventoryCount";
    }
  });
  root.querySelectorAll<HTMLButtonElement>("#equipmentModal button").forEach((button) => {
    if (!button.dataset.action && button.textContent?.trim().includes("Affecter")) {
      button.dataset.action = "submitEquipmentAssignment";
    }
  });
}

function normalizedArticleFamily(value: unknown) {
  const family = String(value ?? "").trim().toUpperCase();
  return ["FO", "GSM", "BLR"].includes(family) ? family : "FO";
}

function nextCodeFromRows(root: HTMLElement, type: string, family?: string) {
  if (type === "article") {
    const selectedFamily = normalizedArticleFamily(family ?? root.querySelector<HTMLSelectElement>("#ref-form-article select")?.value);
    const prefix = selectedFamily + "-";
    const numbers = Array.from(root.querySelectorAll<HTMLElement>("#ref-articles tbody tr td:first-child"))
      .map((cell) => cell.textContent?.trim() ?? "")
      .filter((code) => code.startsWith(prefix))
      .map((code) => Number(code.slice(prefix.length).replace(/\D/g, "")))
      .filter((value) => Number.isFinite(value));
    const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
    return prefix + String(next).padStart(4, "0");
  }

  const config: Record<string, { selector: string; prefix: string; width: number }> = {
    supplier: { selector: "#ref-suppliers tbody tr td:first-child", prefix: "FRN-", width: 3 },
    client: { selector: "#ref-clients tbody tr td:first-child", prefix: "CLI-", width: 3 },
    project: { selector: "#ref-projects tbody tr td:first-child", prefix: "PROJ-2026-", width: 3 },
    site: { selector: "#ref-sites tbody tr td:first-child", prefix: "SITE-", width: 3 },
    teamService: { selector: "#ref-team-services tbody tr td:first-child", prefix: "SRV-", width: 3 },
    employee: { selector: "#ref-employees tbody tr td:first-child", prefix: "EMP-", width: 3 },
    location: { selector: "#ref-locations tbody tr td:first-child", prefix: "MAG-", width: 3 }
  };
  const selected = config[type];
  if (!selected) return "REF-0001";
  const numbers = Array.from(root.querySelectorAll<HTMLElement>(selected.selector))
    .map((cell) => cell.textContent?.trim() ?? "")
    .filter((code) => code.startsWith(selected.prefix))
    .map((code) => Number(code.slice(selected.prefix.length).replace(/\D/g, "")))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return selected.prefix + String(next).padStart(selected.width, "0");
}

function detailCard(label: string, value: unknown, tone: "gray" | "success" | "accent" = "gray") {
  const toneClass = tone === "success" ? "bg-success-50 border-success-100 text-success-700" : tone === "accent" ? "bg-accent-50 border-accent-100 text-accent-700" : "bg-gray-50 border-gray-200 text-gray-900";
  return `<div class="p-4 rounded-xl border ${toneClass}"><div class="text-xs font-semibold opacity-70">${escapeHtml(label)}</div><div class="font-bold mt-1">${escapeHtml(value ?? "-")}</div></div>`;
}

function detailField(label: string, value: unknown) {
  return `<div><span class="text-gray-500">${escapeHtml(label)}</span><div class="font-semibold">${escapeHtml(value ?? "-")}</div></div>`;
}

function lifecycleFields(item: { createdAt?: string; updatedAt?: string }) {
  return detailField("Cree le", formatDate(item.createdAt)) + detailField("Modifie le", formatDate(item.updatedAt));
}

function articleStockSummary(articleId: string) {
  const levels = latestStockLevels.filter((level) => level.article.id === articleId);
  const total = levels.reduce((sum, level) => sum + Number(level.quantity ?? 0), 0);
  const locations = levels.length
    ? levels.map((level) => `${level.location.name}: ${formatNumber(level.quantity)}`).join(" / ")
    : "Aucun stock enregistre";
  return { total, locations };
}

function articleStockAtLocation(articleId: string, locationId: string | null | undefined) {
  if (!locationId) return 0;
  return Number(latestStockLevels.find((level) => level.article.id === articleId && level.location.id === locationId)?.quantity ?? 0);
}

function textInput(name: string, label: string, value: unknown, placeholder = "") {
  return `<label><span class="text-sm font-semibold">${escapeHtml(label)}</span><input name="${escapeHtml(name)}" value="${escapeHtml(value ?? "")}" placeholder="${escapeHtml(placeholder)}" class="mt-2 w-full h-11 border rounded-lg px-3"></label>`;
}

function numberInput(name: string, label: string, value: unknown, placeholder = "0") {
  return `<label><span class="text-sm font-semibold">${escapeHtml(label)}</span><input name="${escapeHtml(name)}" type="number" value="${escapeHtml(value ?? "")}" placeholder="${escapeHtml(placeholder)}" class="mt-2 w-full h-11 border rounded-lg px-3"></label>`;
}

function selectInput(name: string, label: string, optionsHtml: string, selected = "") {
  const html = optionsHtml.replace(`value="${escapeHtml(selected)}"`, `value="${escapeHtml(selected)}" selected`);
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
  return latestClients.find((client) => client.id === project.clientId)?.name ?? project.client ?? "-";
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

function renderReferentialDetail(root: HTMLElement, type: string, id: string, editing = false) {
  let title = "Element referentiel";
  let subtitle = "Informations de l'element selectionne.";
  let kind = "Fiche referentiel";
  let cards = "";
  let fields = "";
  let editFields = "";

  if (type === "article") {
    const item = latestArticles.find((article) => article.id === id);
    if (!item) return false;
    const tracking = item.trackingMode === "INDIVIDUAL" ? "Suivi individuel" : "Article en quantite";
    title = `${item.code} - ${item.designation}`;
    subtitle = `${tracking} utilise dans les entrees, sorties et inventaires.`;
    kind = "Fiche article";
    const stock = articleStockSummary(item.id);
    const stockAtDefaultLocation = articleStockAtLocation(item.id, item.defaultLocationId);
    cards = detailCard("Code", item.code, "accent") + detailCard("Famille", item.category) + detailCard("Stock actuel", formatNumber(stock.total)) + detailCard("Statut", item.active ? "Actif" : "Inactif", item.active ? "success" : "gray");
    fields = detailField("Designation", item.designation) + detailField("Unite", item.unit) + detailField("Mode de suivi", tracking) + detailField("Stock minimum", formatNumber(item.minimumStock)) + detailField("Stock securite", formatNumber(item.securityStock)) + detailField("Prix indicatif", formatNumber(item.referencePrice)) + detailField("Fournisseur habituel", supplierName(item.defaultSupplierId)) + detailField("Emplacement par defaut", locationName(item.defaultLocationId)) + detailField("Stock actuel emplacement", item.defaultLocationId ? formatNumber(stockAtDefaultLocation) : "-") + detailField("Stock par emplacement", stock.locations) + lifecycleFields(item);
    editFields = textInput("designation", "Designation", item.designation) + selectInput("category", "Famille", option("FO", "FO") + option("GSM", "GSM") + option("BLR", "BLR"), item.category) + textInput("unit", "Unite", item.unit) + selectInput("trackingMode", "Mode de suivi", option("QUANTITY", "Article en quantite") + option("INDIVIDUAL", "Suivi individuel"), item.trackingMode) + numberInput("minimumStock", "Stock minimum", item.minimumStock) + numberInput("securityStock", "Stock securite", item.securityStock) + numberInput("referencePrice", "Prix indicatif", item.referencePrice ?? "") + selectInput("defaultSupplierId", "Fournisseur habituel", supplierOptions(latestSuppliers), item.defaultSupplierId ?? "") + selectInput("defaultLocationId", "Emplacement par defaut", locationOptions(latestLocations), item.defaultLocationId ?? "") + numberInput("stockQuantity", "Stock actuel emplacement", stockAtDefaultLocation) + activeSelect(item.active);
  } else if (type === "supplier") {
    const item = latestSuppliers.find((supplier) => supplier.id === id);
    if (!item) return false;
    title = `${item.code} - ${item.name}`;
    subtitle = "Fournisseur utilise pour les entrees stock.";
    kind = "Fiche fournisseur";
    cards = detailCard("Code", item.code, "accent") + detailCard("Type", "Fournisseur") + detailCard("Telephone", item.phone ?? "-") + detailCard("Statut", item.active ? "Actif" : "Inactif", item.active ? "success" : "gray");
    fields = detailField("Raison sociale", item.name) + detailField("ID fiscal / NCC", item.fiscalId ?? "-") + detailField("Categorie", item.category ?? "-") + detailField("Email", item.email ?? "-") + detailField("Contact", item.contact ?? "-") + detailField("Telephone", item.phone ?? "-") + detailField("Adresse", item.address ?? "-") + lifecycleFields(item);
    editFields = textInput("name", "Raison sociale", item.name) + textInput("fiscalId", "ID fiscal / NCC", item.fiscalId ?? "") + textInput("category", "Categorie", item.category ?? "") + textInput("contact", "Contact", item.contact ?? "") + textInput("phone", "Telephone", item.phone ?? "") + textInput("email", "Email", item.email ?? "") + textInput("address", "Adresse", item.address ?? "") + activeSelect(item.active);
  } else if (type === "client") {
    const item = latestClients.find((client) => client.id === id);
    if (!item) return false;
    title = `${item.code} - ${item.name}`;
    subtitle = "Client utilise dans les demandes et les projets.";
    kind = "Fiche client";
    cards = detailCard("Code", item.code, "accent") + detailCard("Type", "Client") + detailCard("Telephone", item.phone ?? "-") + detailCard("Statut", item.active ? "Actif" : "Inactif", item.active ? "success" : "gray");
    fields = detailField("Raison sociale", item.name) + detailField("Email", item.email ?? "-") + detailField("Contact", item.contact ?? "-") + detailField("Telephone", item.phone ?? "-") + lifecycleFields(item);
    editFields = textInput("name", "Raison sociale", item.name) + textInput("contact", "Contact", item.contact ?? "") + textInput("phone", "Telephone", item.phone ?? "") + textInput("email", "Email", item.email ?? "") + activeSelect(item.active);
  } else if (type === "teamService") {
    const item = latestTeamServices.find((service) => service.id === id);
    if (!item) return false;
    title = `${item.code} - ${item.name}`;
    subtitle = "Equipe, service ou departement demandeur.";
    kind = "Fiche equipe / service";
    cards = detailCard("Code", item.code, "accent") + detailCard("Type", item.type) + detailCard("Responsable", item.manager ?? "-") + detailCard("Statut", item.active ? "Actif" : "Inactif", item.active ? "success" : "gray");
    fields = detailField("Nom", item.name) + detailField("Type", item.type) + detailField("Responsable", item.manager ?? "-") + detailField("Usage", "Demandes de materiel") + lifecycleFields(item);
    editFields = textInput("name", "Nom equipe / service", item.name) + selectInput("type", "Type", option("EQUIPE", "Equipe terrain") + option("SERVICE", "Service interne") + option("DEPARTEMENT", "Departement"), item.type) + textInput("manager", "Responsable", item.manager ?? "") + activeSelect(item.active);
  } else if (type === "employee") {
    const item = latestEmployees.find((employee) => employee.id === id);
    if (!item) return false;
    title = `${item.matricule} - ${item.firstName} ${item.lastName}`;
    subtitle = "Employe ou beneficiaire trace dans les sorties et affectations. Ce n'est pas forcement un compte utilisateur.";
    kind = "Fiche employe";
    cards = detailCard("Matricule", item.matricule, "accent") + detailCard("Departement", item.department ?? "-") + detailCard("Role", item.role ?? "-") + detailCard("Statut", item.active ? "Actif" : "Inactif", item.active ? "success" : "gray");
    fields = detailField("Nom", item.lastName) + detailField("Prenom", item.firstName) + detailField("Telephone", item.phone ?? "-") + detailField("Departement", item.department ?? "-") + detailField("Role", item.role ?? "-") + lifecycleFields(item);
    editFields = textInput("matricule", "Matricule", item.matricule) + textInput("lastName", "Nom", item.lastName) + textInput("firstName", "Prenom", item.firstName) + textInput("department", "Departement", item.department ?? "") + textInput("role", "Role", item.role ?? "") + textInput("phone", "Telephone", item.phone ?? "") + activeSelect(item.active);
  } else if (type === "project") {
    const item = latestProjects.find((project) => project.id === id);
    if (!item) return false;
    const activeProjectManagers = latestUsers.filter((user) => user.active && user.roles.includes("CHEF_PROJET"));
    title = `${item.code} - ${item.name}`;
    subtitle = "Projet ou chantier utilise comme destination des sorties stock.";
    kind = "Fiche projet";
    cards = detailCard("Type", "Projet") + detailCard("Client", projectClientName(item)) + detailCard("Chef projet", projectManagerName(item.projectManagerId)) + detailCard("Statut", item.active ? "Actif" : "Inactif", item.active ? "success" : "gray");
    fields = detailField("Code", item.code) + detailField("Nom", item.name) + detailField("Client", projectClientName(item)) + detailField("Chef projet", projectManagerName(item.projectManagerId)) + detailField("Region", item.region ?? "-") + detailField("Ville", item.city ?? "-") + detailField("Date debut", formatDate(item.startDate)) + detailField("Date fin prevue", formatDate(item.endDate)) + lifecycleFields(item);
    editFields = textInput("name", "Nom projet", item.name) + selectInput("clientId", "Client", clientOptions(latestClients), item.clientId ?? "") + selectInput("projectManagerId", "Chef de projet", userOptions(activeProjectManagers), item.projectManagerId ?? "") + textInput("region", "Region", item.region ?? "") + textInput("city", "Ville", item.city ?? "") + dateInput("startDate", "Date debut", item.startDate) + dateInput("endDate", "Date fin prevue", item.endDate) + activeSelect(item.active);
  } else {
    const item = latestLocations.find((location) => location.id === id);
    if (!item) return false;
    const project = latestProjects.find((project) => project.id === item.projectId);
    title = `${item.code} - ${item.name}`;
    subtitle = type === "site" ? "Site ou chantier rattache a un projet." : "Emplacement de stock.";
    kind = type === "site" ? "Fiche site / chantier" : "Fiche emplacement";
    cards = detailCard("Type", item.type) + detailCard("Projet", project?.name ?? "-") + detailCard("Ville", item.city ?? project?.city ?? "-") + detailCard("Statut", item.active ? "Actif" : "Inactif", item.active ? "success" : "gray");
    fields = detailField("Nom", item.name) + detailField("Code", item.code) + detailField("Type", item.type) + detailField("Projet rattache", project ? `${project.code} - ${project.name}` : "-") + detailField("Responsable", item.responsible ?? "-") + detailField("Region", item.region ?? project?.region ?? "-") + detailField("Ville", item.city ?? project?.city ?? "-") + detailField("Adresse / zone", item.address ?? "-") + lifecycleFields(item);
    const typeOptions = type === "site" ? option("CHANTIER", "Chantier") + option("SITE", "Site") : option("MAGASIN", "Magasin") + option("DEPOT", "Depot") + option("BUREAU", "Bureau") + option("VEHICULE", "Vehicule");
    editFields = textInput("name", type === "site" ? "Nom site / chantier" : "Nom emplacement", item.name) + selectInput("type", "Type", typeOptions, item.type) + selectInput("projectId", "Projet rattache", projectOptions(latestProjects), item.projectId ?? "") + textInput("responsible", "Responsable", item.responsible ?? "") + textInput("region", "Region", item.region ?? "") + textInput("city", "Ville", item.city ?? "") + textInput("address", "Adresse / zone", item.address ?? "") + activeSelect(item.active);
  }

  const kindElement = root.querySelector<HTMLElement>("#refDetailKind");
  const titleElement = root.querySelector<HTMLElement>("#refDetailTitle");
  const subtitleElement = root.querySelector<HTMLElement>("#refDetailSubtitle");
  const cardsElement = root.querySelector<HTMLElement>("#refDetailCards");
  const fieldsElement = root.querySelector<HTMLElement>("#refDetailFields");
  const actionsElement = root.querySelector<HTMLElement>("#refDetailActions");
  const contentTitle = root.querySelector<HTMLElement>("#refDetailContentTitle");
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
  if (actionsElement) actionsElement.innerHTML = referentialActionButtons(editing) + `<button title="Fermer" class="inline-flex items-center justify-center w-10 h-10 rounded-lg border text-gray-500 hover:text-gray-900 shrink-0" data-action="closeModal('referentialDetailModal')"><i data-lucide="x" class="w-5 h-5"></i></button>`;
  if (contentTitle) contentTitle.textContent = editing ? "Modifier les informations" : "Informations";
  if (fieldsElement) fieldsElement.innerHTML = editing ? `<form id="refDetailEditForm" class="contents">${editFields}</form>` : fields;
  window.lucide?.createIcons();
  return true;
}

function openReferentialDetail(root: HTMLElement, type: string, id: string) {
  if (renderReferentialDetail(root, type, id, false)) openModal(root, "referentialDetailModal");
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
      const stockLocationId = data.defaultLocationId ? String(data.defaultLocationId) : null;
      const updated = await updateArticle(id, { designation: String(data.designation ?? ""), category: String(data.category ?? ""), unit: String(data.unit ?? ""), trackingMode: data.trackingMode === "INDIVIDUAL" ? "INDIVIDUAL" : "QUANTITY", minimumStock: toNumber(String(data.minimumStock ?? "0")), securityStock: toNumber(String(data.securityStock ?? "0")), referencePrice: toNumber(String(data.referencePrice ?? "0")), defaultSupplierId: data.defaultSupplierId ? String(data.defaultSupplierId) : null, defaultLocationId: stockLocationId, stockLocationId, stockQuantity: toNumber(String(data.stockQuantity ?? "0")), active: data.active !== "false" });
      latestArticles = latestArticles.map((item) => item.id === id ? updated : item);
      latestStockLevels = await getStockLevels().catch(() => latestStockLevels);
    } else if (type === "supplier") {
      const updated = await updateSupplier(id, { name: String(data.name ?? ""), fiscalId: String(data.fiscalId ?? ""), category: String(data.category ?? ""), contact: String(data.contact ?? ""), phone: String(data.phone ?? ""), email: String(data.email ?? ""), address: String(data.address ?? ""), active: data.active !== "false" });
      latestSuppliers = latestSuppliers.map((item) => item.id === id ? updated : item);
    } else if (type === "client") {
      const updated = await updateClient(id, { name: String(data.name ?? ""), contact: String(data.contact ?? ""), phone: String(data.phone ?? ""), email: String(data.email ?? ""), active: data.active !== "false" });
      latestClients = latestClients.map((item) => item.id === id ? updated : item);
    } else if (type === "teamService") {
      const updated = await updateTeamService(id, { name: String(data.name ?? ""), type: String(data.type ?? "SERVICE"), manager: String(data.manager ?? ""), active: data.active !== "false" });
      latestTeamServices = latestTeamServices.map((item) => item.id === id ? updated : item);
    } else if (type === "employee") {
      const updated = await updateEmployee(id, { matricule: String(data.matricule ?? ""), lastName: String(data.lastName ?? ""), firstName: String(data.firstName ?? ""), department: String(data.department ?? ""), role: String(data.role ?? ""), phone: String(data.phone ?? ""), active: data.active !== "false" });
      latestEmployees = latestEmployees.map((item) => item.id === id ? updated : item);
    } else if (type === "project") {
      if (!data.projectManagerId) {
        showToast(root, "Le chef de projet doit etre un compte utilisateur actif avec le role Chef projet.", "error");
        return;
      }
      const updated = await updateProject(id, { name: String(data.name ?? ""), clientId: String(data.clientId ?? ""), projectManagerId: String(data.projectManagerId ?? ""), region: String(data.region ?? ""), city: String(data.city ?? ""), startDate: String(data.startDate ?? ""), endDate: String(data.endDate ?? ""), active: data.active !== "false" });
      latestProjects = latestProjects.map((item) => item.id === id ? updated : item);
    } else if (type === "site" || type === "location") {
      const updated = await updateLocation(id, { name: String(data.name ?? ""), type: String(data.type ?? "MAGASIN"), projectId: data.projectId ? String(data.projectId) : null, responsible: String(data.responsible ?? ""), region: String(data.region ?? ""), city: String(data.city ?? ""), address: String(data.address ?? ""), active: data.active !== "false" });
      latestLocations = latestLocations.map((item) => item.id === id ? updated : item);
    }
    updateApiBackedViews(root);
    renderReferentialDetail(root, type, id, false);
    showToast(root, "Fiche referentiel mise a jour.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Modification impossible.", "error");
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
    if (type === "article") latestArticles = latestArticles.map((item) => item.id === id ? { ...item, active: false } : item);
    if (type === "supplier") latestSuppliers = latestSuppliers.map((item) => item.id === id ? { ...item, active: false } : item);
    if (type === "client") latestClients = latestClients.map((item) => item.id === id ? { ...item, active: false } : item);
    if (type === "teamService") latestTeamServices = latestTeamServices.map((item) => item.id === id ? { ...item, active: false } : item);
    if (type === "employee") latestEmployees = latestEmployees.map((item) => item.id === id ? { ...item, active: false } : item);
    if (type === "project") latestProjects = latestProjects.map((item) => item.id === id ? { ...item, active: false } : item);
    if (type === "site" || type === "location") latestLocations = latestLocations.map((item) => item.id === id ? { ...item, active: false } : item);
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
    showToast(root, error instanceof Error ? error.message : "Desactivation impossible.", "error");
  }
}

function updateReferentialForm(root: HTMLElement, type: string) {
  root.querySelectorAll<HTMLElement>(".referential-form").forEach((form) => form.classList.add("hidden"));
  root.querySelector<HTMLElement>("#ref-form-empty")?.classList.toggle("hidden", Boolean(type));
  root.querySelector<HTMLElement>("#ref-form-" + CSS.escape(type))?.classList.remove("hidden");
  const code = root.querySelector<HTMLElement>("#referentialCode");
  const articleFamily = root.querySelector<HTMLSelectElement>("#ref-form-article select");
  if (articleFamily) {
    articleFamily.onchange = () => {
      const codeTarget = root.querySelector<HTMLElement>("#referentialCode");
      if (codeTarget) codeTarget.textContent = nextCodeFromRows(root, "article", articleFamily.value);
    };
  }
  if (code) code.textContent = nextCodeFromRows(root, type);
  if (type === "article") {
    const supplierSelect = root.querySelector<HTMLSelectElement>("#articleSupplierSelect");
    const locationSelect = root.querySelector<HTMLSelectElement>("#articleInitialLocationSelect");
    fillSelect(supplierSelect ?? undefined, supplierOptions(latestSuppliers), latestSuppliers.length ? "Selectionner fournisseur" : "Aucun fournisseur en base");
    fillSelect(locationSelect ?? undefined, locationOptions(latestLocations), latestLocations.length ? "Selectionner emplacement" : "Aucun emplacement en base");
  }
  if (type === "project") {
    const clientSelect = root.querySelector<HTMLSelectElement>("#projectClientSelect");
    const managerSelect = root.querySelector<HTMLSelectElement>("#projectManagerSelect");
    const activeProjectManagers = latestUsers.filter((user) => user.active && user.roles.includes("CHEF_PROJET"));
    fillSelect(clientSelect ?? undefined, clientOptions(latestClients), latestClients.length ? "Selectionner client" : "Aucun client en base");
    fillSelect(managerSelect ?? undefined, userOptions(activeProjectManagers), activeProjectManagers.length ? "Selectionner chef projet" : "Aucun chef projet actif");
  }
  if (type === "site") {
    const siteProject = root.querySelector<HTMLSelectElement>("#ref-form-site select");
    fillSelect(siteProject ?? undefined, projectOptions(latestProjects), "Selectionner projet");
  }
  if (type === "location") {
    const locationSelects = Array.from(root.querySelectorAll<HTMLSelectElement>("#ref-form-location select"));
    fillSelect(locationSelects[1], projectOptions(latestProjects), "Selectionner projet rattache");
  }
}
function modalInputValues(root: HTMLElement, type: string) {
  const form = root.querySelector<HTMLElement>("#ref-form-" + CSS.escape(type));
  return {
    inputs: Array.from(form?.querySelectorAll<HTMLInputElement>("input") ?? []),
    selects: Array.from(form?.querySelectorAll<HTMLSelectElement>("select") ?? [])
  };
}

function toNumber(value: string) {
  const parsed = Number(value.replace(/\s/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function showToast(root: HTMLElement, message: string, tone: "success" | "error" = "success") {
  root.querySelector("#stockHubToast")?.remove();
  const toast = document.createElement("div");
  toast.id = "stockHubToast";
  toast.className = "fixed top-5 right-5 z-[80] max-w-md rounded-xl border px-4 py-3 shadow-xl text-sm font-semibold " + (tone === "success" ? "bg-success-50 border-success-100 text-success-700" : "bg-error-50 border-error-100 text-error-700");
  toast.textContent = message;
  root.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3500);
}

async function submitReferential(root: HTMLElement) {
  const type = root.querySelector<HTMLSelectElement>("#referentialType")?.value ?? "";
  const code = root.querySelector<HTMLElement>("#referentialCode")?.textContent?.trim() || "REF-0001";
  const { inputs, selects } = modalInputValues(root, type);
  try {
    if (type === "article") {
      const form = root.querySelector<HTMLElement>("#ref-form-article");
      const field = <T extends HTMLInputElement | HTMLSelectElement>(selector: string) => form?.querySelector<T>(selector);
      const category = normalizedArticleFamily(field<HTMLSelectElement>("#articleFamilySelect")?.value);
      const articleCode = code.startsWith(category + "-") ? code : nextCodeFromRows(root, "article", category);
      const initialLocationId = field<HTMLSelectElement>("#articleInitialLocationSelect")?.value || undefined;
      const initialStock = toNumber(field<HTMLInputElement>("#articleInitialStockInput")?.value ?? "0");
      await createArticle({
        code: articleCode,
        designation: field<HTMLInputElement>("#articleDesignationInput")?.value.trim() || "Nouvel article",
        category,
        unit: field<HTMLSelectElement>("#articleUnitSelect")?.value || "Piece",
        trackingMode: field<HTMLSelectElement>("#articleTrackingSelect")?.value === "INDIVIDUAL" ? "INDIVIDUAL" : "QUANTITY",
        minimumStock: toNumber(field<HTMLInputElement>("#articleMinimumStockInput")?.value ?? "0"),
        securityStock: toNumber(field<HTMLInputElement>("#articleSecurityStockInput")?.value ?? "0"),
        referencePrice: toNumber(field<HTMLInputElement>("#articleReferencePriceInput")?.value ?? "0"),
        defaultSupplierId: field<HTMLSelectElement>("#articleSupplierSelect")?.value || undefined,
        defaultLocationId: initialLocationId,
        initialStock,
        initialLocationId
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
        address: inputs[5]?.value.trim() || undefined
      });
    } else if (type === "client") {
      await createClient({
        code,
        name: inputs[0]?.value.trim() || "Nouveau client",
        contact: inputs[1]?.value.trim() || undefined,
        phone: inputs[2]?.value.trim() || undefined,
        email: inputs[3]?.value.trim() || undefined
      });
    } else if (type === "teamService") {
      await createTeamService({
        code,
        name: inputs[0]?.value.trim() || "Nouvelle equipe",
        type: selects[0]?.value || "SERVICE",
        manager: inputs[1]?.value.trim() || undefined
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
        endDate: inputs[4]?.value || undefined
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
        address: inputs[4]?.value.trim() || undefined
      });
    } else if (type === "location") {
      await createLocation({
        code,
        name: inputs[0]?.value.trim() || "Nouvel emplacement",
        type: selects[0]?.value.toUpperCase() || "MAGASIN",
        responsible: inputs[1]?.value.trim() || undefined,
        projectId: selects[1]?.value || undefined,
        city: inputs[2]?.value.trim() || undefined,
        address: inputs[3]?.value.trim() || undefined
      });
    } else if (type === "employee") {
      await createEmployee({
        matricule: inputs[0]?.value.trim() || code,
        lastName: inputs[1]?.value.trim() || "Nom",
        firstName: inputs[2]?.value.trim() || "Prenom",
        department: inputs[3]?.value.trim() || undefined,
        role: inputs[4]?.value.trim() || undefined,
        phone: inputs[5]?.value.trim() || undefined
      });
    } else {
      showToast(root, "Selectionne un type de referentiel avant de creer.", "error");
      return;
    }
    closeModal(root, "referentialModal");
    updateApiBackedViews(root);
    showToast(root, "Element referentiel cree et registre mis a jour.");
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Creation impossible.", "error");
  }
}


async function submitUser(root: HTMLElement) {
  const email = root.querySelector<HTMLInputElement>("#userEmail")?.value.trim().toLowerCase() ?? "";
  const firstName = root.querySelector<HTMLInputElement>("#userFirstName")?.value.trim() ?? "";
  const lastName = root.querySelector<HTMLInputElement>("#userLastName")?.value.trim() ?? "";
  const password = root.querySelector<HTMLInputElement>("#userPassword")?.value ?? "";
  const active = root.querySelector<HTMLSelectElement>("#userActive")?.value !== "false";
  const roles = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="userRole"]:checked')).map((input) => input.value);
  if (!email || !firstName || !lastName) {
    showToast(root, "Prenom, nom et email sont requis.", "error");
    return;
  }
  if (roles.length === 0) {
    showToast(root, "Selectionne au moins un role.", "error");
    return;
  }
  try {
    if (selectedUserId) {
      await updateUser(selectedUserId, { email, firstName, lastName, roles, password: password || undefined, active });
      showToast(root, "Utilisateur mis a jour.");
    } else {
      await createUser({ email, firstName, lastName, roles, password: password || undefined, active });
      showToast(root, "Utilisateur cree et registre mis a jour.");
    }
    closeModal(root, "userModal");
    selectedUserId = null;
    updateApiBackedViews(root);
  } catch (error) {
    showToast(root, error instanceof Error ? error.message : "Enregistrement utilisateur impossible.", "error");
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
  const refDetailMatch = action.match(/^openReferentialDetail\('([^']+)'\s*,\s*'([^']+)'\)/);
  if (refDetailMatch) return { type: "ref-detail", refType: refDetailMatch[1], id: refDetailMatch[2] } as const;
  const toastMatch = action.match(/^toast\('([^']+)'\)/);
  if (toastMatch) return { type: "toast", message: toastMatch[1] } as const;
  const openMatch = action.match(/^openModal\('([^']+)'\)/);
  if (openMatch) return { type: "open", id: openMatch[1] } as const;
  const closeMatch = action.match(/^closeModal\('([^']+)'\)/);
  if (closeMatch) return { type: "close", id: closeMatch[1] } as const;
  const countMatch = action.match(/^openCount\('([^']+)'\s*,\s*'([^']+)'\)/);
  if (countMatch) return { type: "count", articleId: countMatch[1], locationId: countMatch[2] } as const;
  const exportMatch = action.match(/^exportData\('([^']+)'\)/);
  if (exportMatch) return { type: "export", kind: exportMatch[1] } as const;
  const inventoryModeMatch = action.match(/^showInventoryMode\('([^']+)'\)/);
  if (inventoryModeMatch) return { type: "inventory-mode", mode: inventoryModeMatch[1] } as const;
  const exitFilterMatch = action.match(/^setExitFilter\('([^']+)'\)/);
  if (exitFilterMatch) return { type: "exit-filter", filter: exitFilterMatch[1] } as const;
  if (action === "refreshHistory") return { type: "refresh-history" } as const;
  if (action.includes("toggleLoginPassword")) return { type: "toggle-password" } as const;
  if (action.includes("toggleUserPassword")) return { type: "toggle-user-password" } as const;
  if (action.includes("loginMock") || action.includes("loginUser")) return { type: "login" } as const;
  if (action.includes("logoutMock")) return { type: "logout" } as const;
  if (action === "submitReferential") return { type: "submit-referential" } as const;
  if (action === "editReferentialDetail") return { type: "edit-referential-detail" } as const;
  if (action === "cancelReferentialEdit") return { type: "cancel-referential-edit" } as const;
  if (action === "submitReferentialEdit") return { type: "submit-referential-edit" } as const;
  if (action === "deactivateReferentialDetail") return { type: "deactivate-referential-detail" } as const;
  if (action === "submitStockEntry") return { type: "submit-stock-entry" } as const;
  if (action === "submitExitRequest") return { type: "submit-exit-request" } as const;
  if (action === "submitMaterialRequestPreparation") return { type: "submit-material-request-preparation" } as const;
  if (action === "downloadMaterialRequestPdf") return { type: "download-material-request-pdf" } as const;
  if (action === "addMaterialRequestLine") return { type: "add-material-request-line" } as const;
  if (action === "removeMaterialRequestLine") return { type: "remove-material-request-line" } as const;
  if (action === "submitDirectExit") return { type: "submit-direct-exit" } as const;
  if (action === "submitStockReturn") return { type: "submit-stock-return" } as const;
  if (action === "submitStockTransfer") return { type: "submit-stock-transfer" } as const;
  if (action === "submitInventoryCount") return { type: "submit-inventory-count" } as const;
  if (action === "submitEquipmentAssignment") return { type: "submit-equipment-assignment" } as const;
  if (action === "submitVehicle") return { type: "submit-vehicle" } as const;
  if (action === "submitUser") return { type: "submit-user" } as const;
  if (action === "toggleVehicleHistory") return { type: "toggle-vehicle-history" } as const;
  const userDetailMatch = action.match(/^openUserDetail\('([^']+)'\)/);
  if (userDetailMatch) return { type: "user-detail", id: userDetailMatch[1] } as const;
  const exitDetailMatch = action.match(/^openExitRequestDetail\('([^']+)'\)/);
  if (exitDetailMatch) return { type: "exit-detail", id: exitDetailMatch[1] } as const;
  const materialPrepMatch = action.match(/^openMaterialRequestPreparation\('([^']+)'\)/);
  if (materialPrepMatch) return { type: "material-request-prep", id: materialPrepMatch[1] } as const;
  const prepareExitMatch = action.match(/^prepareExitFromRequest\('([^']+)'\)/);
  if (prepareExitMatch) return { type: "prepare-exit-from-request", id: prepareExitMatch[1] } as const;
  const downloadPreparedPdfMatch = action.match(/^downloadPreparedMaterialPdf\('([^']+)'\)/);
  if (downloadPreparedPdfMatch) return { type: "download-prepared-material-pdf", id: downloadPreparedPdfMatch[1] } as const;
  const uploadProofMatch = action.match(/^uploadSignedMaterialProof\('([^']+)'\)/);
  if (uploadProofMatch) return { type: "upload-signed-material-proof", id: uploadProofMatch[1] } as const;
  const viewProofMatch = action.match(/^viewSignedMaterialProof\('([^']+)'\)/);
  if (viewProofMatch) return { type: "view-signed-material-proof", id: viewProofMatch[1] } as const;
  const vehicleDetailMatch = action.match(/^openVehicleDetail\('([^']+)'\)/);
  if (vehicleDetailMatch) return { type: "vehicle-detail", id: vehicleDetailMatch[1] } as const;
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
    showView(root, "home", root.querySelector<HTMLElement>('.nav-btn[data-action*="home"]') ?? undefined);
    prepareTemplateActions(root);
    updateReferentialForm(root, root.querySelector<HTMLSelectElement>("#referentialType")?.value ?? "");
    updateApiBackedViews(root);
    window.lucide?.createIcons();

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
      if (!target || !root.contains(target)) return;
      const action = target.dataset.action;
      if (!action) return;
      const parsed = parseAction(action);
      if (parsed.type === "view") showView(root, parsed.id, target);
      if (parsed.type === "open") openModal(root, parsed.id);
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
      if (parsed.type === "ref-detail") openReferentialDetail(root, parsed.refType, parsed.id);
      if (parsed.type === "toast") showToast(root, parsed.message);
      if (parsed.type === "submit-referential") void submitReferential(root);
      if (parsed.type === "edit-referential-detail") editReferentialDetail(root);
      if (parsed.type === "cancel-referential-edit") cancelReferentialEdit(root);
      if (parsed.type === "submit-referential-edit") void submitReferentialEdit(root);
      if (parsed.type === "deactivate-referential-detail") void deactivateReferentialDetail(root);
      if (parsed.type === "submit-stock-entry") void submitStockEntry(root);
      if (parsed.type === "submit-exit-request") void submitExitRequest(root);
      if (parsed.type === "submit-material-request-preparation") void submitMaterialRequestPreparation(root);
      if (parsed.type === "download-material-request-pdf") downloadMaterialRequestPdf(root);
      if (parsed.type === "add-material-request-line") addMaterialRequestLine(root);
      if (parsed.type === "remove-material-request-line") removeMaterialRequestLine(root, target);
      if (parsed.type === "submit-direct-exit") void submitDirectExit(root);
      if (parsed.type === "submit-stock-return") void submitStockReturn(root);
      if (parsed.type === "submit-stock-transfer") void submitStockTransfer(root);
      if (parsed.type === "submit-inventory-count") void submitInventoryCount(root);
      if (parsed.type === "submit-equipment-assignment") void submitEquipmentAssignment(root);
      if (parsed.type === "submit-vehicle") void submitVehicle(root);
      if (parsed.type === "submit-user") void submitUser(root);
      if (parsed.type === "user-detail") openUserDetail(root, parsed.id);
      if (parsed.type === "exit-detail") openExitRequestDetail(root, parsed.id);
      if (parsed.type === "material-request-prep") openMaterialRequestPreparation(root, parsed.id);
      if (parsed.type === "prepare-exit-from-request") void prepareExitFromRequest(root, parsed.id);
      if (parsed.type === "download-prepared-material-pdf") downloadPreparedMaterialPdf(root, parsed.id);
      if (parsed.type === "upload-signed-material-proof") void uploadSignedMaterialProof(root, parsed.id);
      if (parsed.type === "view-signed-material-proof") viewSignedMaterialProof(root, parsed.id);
      if (parsed.type === "vehicle-detail") openVehicleDetail(root, parsed.id);
      if (parsed.type === "toggle-vehicle-history") toggleVehicleHistory(root);
      if (parsed.type === "exit-filter") {
        currentExitFilter = parsed.filter;
        renderExitRegistry(root);
      }
      if (parsed.type === "refresh-history") renderHistory(root);
      if (parsed.type === "export") exportData(root, parsed.kind);
      if (parsed.type === "inventory-mode") showInventoryMode(root, parsed.mode);
    };
    const onChange = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.id === "referentialType") {
        updateReferentialForm(root, (target as HTMLSelectElement).value);
      }
      if (target.id === "inventoryLocationSelect") {
        renderInventory(root);
      }
      if (target.closest("#materialRequestLines")) {
        syncMaterialPreparationState(root);
      }
    };
    const onInput = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest("#materialRequestLines")) {
        syncMaterialPreparationState(root);
      }
    };
    root.addEventListener("click", onClick);
    root.addEventListener("change", onChange);
    root.addEventListener("input", onInput);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("change", onChange);
      root.removeEventListener("input", onInput);
    };
  }, []);

  return <div ref={rootRef} className="template-part"><StockHubShell /></div>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StockHubTemplate />
  </React.StrictMode>
);






































