import type {
  Article,
  Client,
  StockLevel,
  StockLocation,
  StockProject,
  StockUser,
  Supplier,
  TeamService,
} from "../api";
import { escapeHtml } from "./format";

export function fillSelect(
  select: HTMLSelectElement | undefined,
  options: string,
  placeholder?: string,
) {
  if (!select) return;
  select.innerHTML = placeholder ? option("", placeholder) + options : options;
}

export function userOptions(
  users: StockUser[],
  userDisplayName: (
    user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">,
  ) => string,
) {
  return users.map((user) => option(user.id, userDisplayName(user))).join("");
}

export function articleOptions(articles: Article[]) {
  return articles
    .map((article) => option(article.id, article.designation))
    .join("");
}

export function projectOptions(projects: StockProject[]) {
  return projects
    .map((project) => option(project.id, project.code + " - " + project.name))
    .join("");
}

export function clientOptions(clients: Client[]) {
  return clients.map((client) => option(client.id, client.name)).join("");
}

export function supplierOptions(suppliers: Supplier[]) {
  return suppliers
    .map((supplier) => option(supplier.id, supplier.name))
    .join("");
}

export function teamServiceOptions(services: TeamService[]) {
  return services.map((service) => option(service.id, service.name)).join("");
}

export function sitesForProject(projectId: string, locations: StockLocation[]) {
  return locations.filter(
    (location) =>
      ["SITE", "CHANTIER"].includes(location.type.toUpperCase()) &&
      (!projectId || location.projectId === projectId),
  );
}

export function siteOptions(locations: StockLocation[]) {
  return locations
    .map((location) => option(location.id, location.name))
    .join("");
}

export function setProjectSiteOptions(
  siteSelect: HTMLSelectElement | undefined,
  projectId: string,
  locations: StockLocation[],
) {
  if (!siteSelect) return;
  if (!projectId) {
    fillSelect(siteSelect, "", "Selectionner un projet d'abord");
    return;
  }
  const sites = sitesForProject(projectId, locations);
  fillSelect(
    siteSelect,
    siteOptions(sites),
    sites.length
      ? "Selectionner site ou zone"
      : "Aucun site rattache a ce projet",
  );
}

export function locationOptions(locations: StockLocation[]) {
  return locations
    .map((location) => option(location.id, location.name))
    .join("");
}

export function option(value: string, label: string) {
  return (
    '<option value="' +
    escapeHtml(value) +
    '">' +
    escapeHtml(label) +
    "</option>"
  );
}

export function toNumber(value: string) {
  const parsed = Number(value.replace(/\s/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function articleStockAtLocation(
  levels: StockLevel[],
  articleId: string,
  locationId: string | null | undefined,
) {
  if (!locationId) return 0;
  return Number(
    levels.find(
      (level) =>
        level.article.id === articleId && level.location.id === locationId,
    )?.quantity ?? 0,
  );
}
