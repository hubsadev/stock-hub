import * as XLSX from "xlsx";
import type {
  Article,
  Client,
  Employee,
  StockLevel,
  StockLocation,
  StockProject,
  StockUser,
  Supplier,
  TeamService,
} from "../../api";
import type { ExcelExportColumn, ExcelExportRow } from "../../types/export";
import type { ArticleImportRow, ReferentialImportRow, ReferentialImportType } from "../../types/import";
import { selectedText, setText } from "../../utils/dom";
import { escapeHtml, formatDate, formatNumber } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type ReferentielsContext = {
  latestStockLevels: StockLevel[];
  setLatestStockLevels: (levels: StockLevel[]) => void;
  latestClients: Client[];
  setLatestClients: (clients: Client[]) => void;
  latestEmployees: Employee[];
  setLatestEmployees: (employees: Employee[]) => void;
  latestTeamServices: TeamService[];
  setLatestTeamServices: (services: TeamService[]) => void;
  latestArticles: Article[];
  setLatestArticles: (articles: Article[]) => void;
  latestSuppliers: Supplier[];
  setLatestSuppliers: (suppliers: Supplier[]) => void;
  latestProjects: StockProject[];
  setLatestProjects: (projects: StockProject[]) => void;
  latestLocations: StockLocation[];
  setLatestLocations: (locations: StockLocation[]) => void;
  latestUsers: StockUser[];
  badge: (label: string, tone?: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  actionEyeFor: (action: string) => string;
  option: (value: string, label: string, selected?: boolean) => string;
  fillSelect: (select: HTMLSelectElement | undefined, options: string, placeholder?: string) => void;
  userOptions: (users: StockUser[]) => string;
  projectOptions: (projects: StockProject[]) => string;
  clientOptions: (clients: Client[]) => string;
  supplierOptions: (suppliers: Supplier[]) => string;
  locationOptions: (locations: StockLocation[]) => string;
  userDisplayName: (user: Pick<StockUser, "email" | "firstName" | "lastName" | "identifier">) => string;
  toNumber: (value: string) => number;
  exportWorkbook: (input: { filename: string; sheetName: string; columns: ExcelExportColumn[]; rows: ExcelExportRow[] }) => Promise<void>;
  openModal: (root: HTMLElement, id: string) => void;
  closeModal: (root: HTMLElement, id: string) => void;
  showToast: (root: HTMLElement, message: string, type?: "success" | "error") => void;
  updateApiBackedViews: (root: HTMLElement) => void;
  populateEntryModal: (root: HTMLElement) => Promise<void>;
  selectArticleInEntry: (root: HTMLElement, articleId: string) => void;
  getArticles: () => Promise<Article[]>;
  getSuppliers: () => Promise<Supplier[]>;
  getLocations: () => Promise<StockLocation[]>;
  getStockLevels: () => Promise<StockLevel[]>;
  createArticle: (payload: Parameters<typeof import("../../api").createArticle>[0]) => Promise<Article>;
  createSupplier: (payload: Parameters<typeof import("../../api").createSupplier>[0]) => Promise<Supplier>;
  createClient: (payload: Parameters<typeof import("../../api").createClient>[0]) => Promise<Client>;
  createEmployee: (payload: Parameters<typeof import("../../api").createEmployee>[0]) => Promise<Employee>;
  createLocation: (payload: Parameters<typeof import("../../api").createLocation>[0]) => Promise<StockLocation>;
  createProject: (payload: Parameters<typeof import("../../api").createProject>[0]) => Promise<StockProject>;
  createTeamService: (payload: Parameters<typeof import("../../api").createTeamService>[0]) => Promise<TeamService>;
  updateArticle: (id: string, payload: Parameters<typeof import("../../api").updateArticle>[1]) => Promise<Article>;
  updateSupplier: (id: string, payload: Parameters<typeof import("../../api").updateSupplier>[1]) => Promise<Supplier>;
  updateClient: (id: string, payload: Parameters<typeof import("../../api").updateClient>[1]) => Promise<Client>;
  updateEmployee: (id: string, payload: Parameters<typeof import("../../api").updateEmployee>[1]) => Promise<Employee>;
  updateLocation: (id: string, payload: Parameters<typeof import("../../api").updateLocation>[1]) => Promise<StockLocation>;
  updateProject: (id: string, payload: Parameters<typeof import("../../api").updateProject>[1]) => Promise<StockProject>;
  updateTeamService: (id: string, payload: Parameters<typeof import("../../api").updateTeamService>[1]) => Promise<TeamService>;
};

let latestStockLevels: StockLevel[] = [];
let latestClients: Client[] = [];
let latestEmployees: Employee[] = [];
let latestTeamServices: TeamService[] = [];
let latestArticles: Article[] = [];
let latestSuppliers: Supplier[] = [];
let latestProjects: StockProject[] = [];
let latestLocations: StockLocation[] = [];
let latestUsers: StockUser[] = [];
let referentialImportType: ReferentialImportType = "article";
let referentialImportRows: ReferentialImportRow[] = [];
let articleImportRows: ArticleImportRow[] = [];
let activeCtx: ReferentielsContext | null = null;

function syncFrom(ctx: ReferentielsContext) {
  activeCtx = ctx;
  latestStockLevels = ctx.latestStockLevels;
  latestClients = ctx.latestClients;
  latestEmployees = ctx.latestEmployees;
  latestTeamServices = ctx.latestTeamServices;
  latestArticles = ctx.latestArticles;
  latestSuppliers = ctx.latestSuppliers;
  latestProjects = ctx.latestProjects;
  latestLocations = ctx.latestLocations;
  latestUsers = ctx.latestUsers;
}

function syncTo() {
  if (!activeCtx) return;
  activeCtx.setLatestStockLevels(latestStockLevels);
  activeCtx.setLatestClients(latestClients);
  activeCtx.setLatestEmployees(latestEmployees);
  activeCtx.setLatestTeamServices(latestTeamServices);
  activeCtx.setLatestArticles(latestArticles);
  activeCtx.setLatestSuppliers(latestSuppliers);
  activeCtx.setLatestProjects(latestProjects);
  activeCtx.setLatestLocations(latestLocations);
}

function withContext<T>(ctx: ReferentielsContext, callback: () => T): T {
  syncFrom(ctx);
  try { return callback(); } finally { syncTo(); }
}

async function withContextAsync<T>(ctx: ReferentielsContext, callback: () => Promise<T>): Promise<T> {
  syncFrom(ctx);
  try { return await callback(); } finally { syncTo(); }
}

function requireCtx() {
  if (!activeCtx) throw new Error("Referentiels context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone?: BadgeTone) { return requireCtx().badge(label, tone); }
function emptyRow(colspan: number, message: string) { return requireCtx().emptyRow(colspan, message); }
function actionEyeFor(action: string) { return requireCtx().actionEyeFor(action); }
function option(value: string, label: string, selected?: boolean) { return requireCtx().option(value, label, selected); }
function fillSelect(select: HTMLSelectElement | undefined, options: string, placeholder?: string) { return requireCtx().fillSelect(select, options, placeholder); }
function userOptions(users: StockUser[]) { return requireCtx().userOptions(users); }
function projectOptions(projects: StockProject[]) { return requireCtx().projectOptions(projects); }
function clientOptions(clients: Client[]) { return requireCtx().clientOptions(clients); }
function supplierOptions(suppliers: Supplier[]) { return requireCtx().supplierOptions(suppliers); }
function locationOptions(locations: StockLocation[]) { return requireCtx().locationOptions(locations); }
function userDisplayName(user: Pick<StockUser, "email" | "firstName" | "lastName" | "identifier">) { return requireCtx().userDisplayName(user); }
function toNumber(value: string) { return requireCtx().toNumber(value); }
function exportWorkbook(input: { filename: string; sheetName: string; columns: ExcelExportColumn[]; rows: ExcelExportRow[] }) { return requireCtx().exportWorkbook(input); }
function openModal(root: HTMLElement, id: string) { return requireCtx().openModal(root, id); }
function closeModal(root: HTMLElement, id: string) { return requireCtx().closeModal(root, id); }
function showToast(root: HTMLElement, message: string, type?: "success" | "error") { return requireCtx().showToast(root, message, type); }
function updateApiBackedViews(root: HTMLElement) { return requireCtx().updateApiBackedViews(root); }
function populateEntryModal(root: HTMLElement) { return requireCtx().populateEntryModal(root); }
function selectArticleInEntry(root: HTMLElement, articleId: string) { return requireCtx().selectArticleInEntry(root, articleId); }
function getArticles() { return requireCtx().getArticles(); }
function getSuppliers() { return requireCtx().getSuppliers(); }
function getLocations() { return requireCtx().getLocations(); }
function getStockLevels() { return requireCtx().getStockLevels(); }
function createArticle(payload: Parameters<ReferentielsContext["createArticle"]>[0]) { return requireCtx().createArticle(payload); }
function createSupplier(payload: Parameters<ReferentielsContext["createSupplier"]>[0]) { return requireCtx().createSupplier(payload); }
function createClient(payload: Parameters<ReferentielsContext["createClient"]>[0]) { return requireCtx().createClient(payload); }
function createEmployee(payload: Parameters<ReferentielsContext["createEmployee"]>[0]) { return requireCtx().createEmployee(payload); }
function createLocation(payload: Parameters<ReferentielsContext["createLocation"]>[0]) { return requireCtx().createLocation(payload); }
function createProject(payload: Parameters<ReferentielsContext["createProject"]>[0]) { return requireCtx().createProject(payload); }
function createTeamService(payload: Parameters<ReferentielsContext["createTeamService"]>[0]) { return requireCtx().createTeamService(payload); }
function updateArticle(id: string, payload: Parameters<ReferentielsContext["updateArticle"]>[1]) { return requireCtx().updateArticle(id, payload); }
function updateSupplier(id: string, payload: Parameters<ReferentielsContext["updateSupplier"]>[1]) { return requireCtx().updateSupplier(id, payload); }
function updateClient(id: string, payload: Parameters<ReferentielsContext["updateClient"]>[1]) { return requireCtx().updateClient(id, payload); }
function updateEmployee(id: string, payload: Parameters<ReferentielsContext["updateEmployee"]>[1]) { return requireCtx().updateEmployee(id, payload); }
function updateLocation(id: string, payload: Parameters<ReferentielsContext["updateLocation"]>[1]) { return requireCtx().updateLocation(id, payload); }
function updateProject(id: string, payload: Parameters<ReferentielsContext["updateProject"]>[1]) { return requireCtx().updateProject(id, payload); }
function updateTeamService(id: string, payload: Parameters<ReferentielsContext["updateTeamService"]>[1]) { return requireCtx().updateTeamService(id, payload); }

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

function articleRow(article: Article) {
  const tracking =
    article.trackingMode === "INDIVIDUAL"
      ? "Suivi individuel"
      : "Article en quantite";
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(article.code)}</td><td class="px-5 py-4">${escapeHtml(article.designation)}</td><td class="px-5 py-4">${escapeHtml(article.category)}</td><td class="px-5 py-4">${escapeHtml(article.unit)}</td><td class="px-5 py-4">${badge(tracking)}</td><td class="px-5 py-4">${badge(article.active ? "Actif" : "Inactif", article.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right">${actionEyeFor(`openReferentialDetail('article','${article.id}')`)}</td></tr>`;
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

function clientRow(client: Client) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(client.code)}</td><td class="px-5 py-4">${escapeHtml(client.name)}</td><td class="px-5 py-4">${escapeHtml(client.contact ?? "-")}</td><td class="px-5 py-4">${escapeHtml(client.phone ?? "-")}</td><td class="px-5 py-4">${escapeHtml(client.email ?? "-")}</td><td class="px-5 py-4">${badge(client.active ? "Actif" : "Inactif", client.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><span class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400"><i data-lucide="eye" class="w-4 h-4"></i></span></td></tr>`;
}

function teamServiceRow(service: TeamService) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(service.code)}</td><td class="px-5 py-4">${escapeHtml(service.name)}</td><td class="px-5 py-4">${escapeHtml(service.type)}</td><td class="px-5 py-4">${escapeHtml(service.manager ?? "-")}</td><td class="px-5 py-4">${badge(service.active ? "Actif" : "Inactif", service.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><span class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400"><i data-lucide="eye" class="w-4 h-4"></i></span></td></tr>`;
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
function renderReferentialsRegistry(root: HTMLElement) {
  const articleBody = root.querySelector<HTMLElement>("#ref-articles tbody");
  if (articleBody) articleBody.innerHTML = latestArticles.length ? latestArticles.map(articleRow).join("") : emptyRow(7, "Aucun article en base pour le moment.");
  setText(root, "#refArticlesCount", latestArticles.length);

  const suppliersBody = root.querySelector<HTMLElement>("#ref-suppliers tbody");
  if (suppliersBody) suppliersBody.innerHTML = latestSuppliers.length ? latestSuppliers.map(supplierRow).join("") : emptyRow(7, "Aucun fournisseur en base pour le moment.");
  setText(root, "#refSuppliersCount", latestSuppliers.length);

  const clientsBody = root.querySelector<HTMLElement>("#ref-clients tbody");
  if (clientsBody) clientsBody.innerHTML = latestClients.length ? latestClients.map(clientRow).join("") : emptyRow(7, "Aucun client en base pour le moment.");
  setText(root, "#refClientsCount", latestClients.length);

  const servicesBody = root.querySelector<HTMLElement>("#ref-team-services tbody");
  if (servicesBody) servicesBody.innerHTML = latestTeamServices.length ? latestTeamServices.map(teamServiceRow).join("") : emptyRow(6, "Aucune equipe ou service en base pour le moment.");
  setText(root, "#refTeamServicesCount", latestTeamServices.length);

  const employeesBody = root.querySelector<HTMLElement>("#ref-employees tbody");
  if (employeesBody) employeesBody.innerHTML = latestEmployees.length ? latestEmployees.map(employeeRefRow).join("") : emptyRow(6, "Aucun employe en base pour le moment.");
  setText(root, "#refEmployeesCount", latestEmployees.length);

  const projectsBody = root.querySelector<HTMLElement>("#ref-projects tbody");
  if (projectsBody) projectsBody.innerHTML = latestProjects.length ? latestProjects.map(projectRow).join("") : emptyRow(8, "Aucun projet en base pour le moment.");
  setText(root, "#refProjectsCount", latestProjects.length);

  const locationBody = root.querySelector<HTMLElement>("#ref-locations tbody");
  if (locationBody) locationBody.innerHTML = latestLocations.length ? latestLocations.map(locationRow).join("") : emptyRow(7, "Aucun emplacement en base pour le moment.");
  setText(root, "#refLocationsCount", latestLocations.length);

  const sites = latestLocations.filter((location) => ["SITE", "CHANTIER"].includes(location.type.toUpperCase()));
  const siteBody = root.querySelector<HTMLElement>("#ref-sites tbody");
  if (siteBody) siteBody.innerHTML = sites.length ? sites.map(siteRow).join("") : emptyRow(7, "Aucun site ou chantier en base pour le moment.");
  setText(root, "#refSitesCount", sites.length);
  window.lucide?.createIcons();
}

export function renderReferentialsRegistryPage(root: HTMLElement, ctx: ReferentielsContext) { return withContext(ctx, () => renderReferentialsRegistry(root)); }
export function showRefPage(root: HTMLElement, ref: string, button: HTMLElement | undefined, ctx: ReferentielsContext) { return withContext(ctx, () => showRef(root, ref, button)); }
export function updateReferentialFormPage(root: HTMLElement, type: string, ctx: ReferentielsContext) { return withContext(ctx, () => updateReferentialForm(root, type)); }
export function renderReferentialDetailPage(root: HTMLElement, type: string, id: string, editing: boolean, ctx: ReferentielsContext) { return withContext(ctx, () => renderReferentialDetail(root, type, id, editing)); }
export function openReferentialDetailPage(root: HTMLElement, type: string, id: string, ctx: ReferentielsContext) { return withContext(ctx, () => openReferentialDetail(root, type, id)); }
export function editReferentialDetailPage(root: HTMLElement, ctx: ReferentielsContext) { return withContext(ctx, () => editReferentialDetail(root)); }
export function cancelReferentialEditPage(root: HTMLElement, ctx: ReferentielsContext) { return withContext(ctx, () => cancelReferentialEdit(root)); }
export function submitReferentialEditPage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => submitReferentialEdit(root)); }
export function deactivateReferentialDetailPage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => deactivateReferentialDetail(root)); }
export function populateQuickArticleModalPage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => populateQuickArticleModal(root)); }
export function submitQuickArticlePage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => submitQuickArticle(root)); }
export function submitReferentialPage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => submitReferential(root)); }
export function downloadArticleImportTemplatePage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => downloadArticleImportTemplate(root)); }
export function downloadReferentialTemplatePage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => downloadReferentialTemplate(root)); }
export function readArticleImportFilePage(root: HTMLElement, file: File, ctx: ReferentielsContext) { return withContextAsync(ctx, () => readArticleImportFile(root, file)); }
export function readReferentialImportFilePage(root: HTMLElement, file: File, ctx: ReferentielsContext) { return withContextAsync(ctx, () => readReferentialImportFile(root, file)); }
export function importArticlesPage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => importArticles(root)); }
export function importReferentialElementsPage(root: HTMLElement, ctx: ReferentielsContext) { return withContextAsync(ctx, () => importReferentialElements(root)); }
export function setReferentialImportTypePage(root: HTMLElement, type: ReferentialImportType, ctx: ReferentielsContext) {
  return withContext(ctx, () => {
    referentialImportType = type;
    referentialImportRows = [];
    articleImportRows = [];
    root.querySelector<HTMLElement>("#articleImportSummary")?.classList.add("hidden");
    root.querySelector<HTMLElement>("#articleImportTable")?.classList.add("hidden");
    const save = root.querySelector<HTMLButtonElement>("#articleImportSaveButton");
    if (save) {
      save.disabled = true;
      save.classList.add("opacity-50", "cursor-not-allowed");
    }
  });
}
export function resetReferentialImportPage(root: HTMLElement, ctx: ReferentielsContext) { return withContext(ctx, () => { referentialImportRows = []; articleImportRows = []; referentialImportType = (root.querySelector<HTMLSelectElement>("#referentialImportType")?.value as ReferentialImportType) || "article"; const file = root.querySelector<HTMLInputElement>("#articleImportFile"); if (file) file.value = ""; root.querySelector<HTMLElement>("#articleImportSummary")?.classList.add("hidden"); root.querySelector<HTMLElement>("#articleImportTable")?.classList.add("hidden"); const save = root.querySelector<HTMLButtonElement>("#articleImportSaveButton"); if (save) { save.disabled = true; save.classList.add("opacity-50", "cursor-not-allowed"); } }); }
export function updateImportCellPage(root: HTMLElement, rowIndex: number, field: string, value: string, ctx: ReferentielsContext) { return withContext(ctx, () => { if (referentialImportType === "article") { const row = articleImportRows[rowIndex]; if (row && field in row) { (row as unknown as Record<string, string>)[field] = value; renderArticleImport(root); } return; } const row = referentialImportRows[rowIndex]; if (row) { row[field] = value; renderReferentialImport(root); } }); }
