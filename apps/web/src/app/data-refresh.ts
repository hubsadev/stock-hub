import type {
  Article,
  AuditAlert,
  AuditLog,
  Client,
  Employee,
  Equipment,
  StockLevel,
  StockLocation,
  StockMovement,
  StockProject,
  StockUser,
  Supplier,
  TeamService,
  Vehicle,
} from "../api";

export type DataRefreshContext = {
  getArticles: () => Promise<Article[]>;
  getSuppliers: () => Promise<Supplier[]>;
  getClients: () => Promise<Client[]>;
  getTeamServices: () => Promise<TeamService[]>;
  getEmployees: () => Promise<Employee[]>;
  getProjects: () => Promise<StockProject[]>;
  getLocations: () => Promise<StockLocation[]>;
  getStockMovements: () => Promise<StockMovement[]>;
  getStockLevels: () => Promise<StockLevel[]>;
  getEquipments: () => Promise<Equipment[]>;
  getVehicles: () => Promise<Vehicle[]>;
  getUsers: () => Promise<StockUser[]>;
  getAuditAlerts: () => Promise<AuditAlert[]>;
  getAuditLogs: () => Promise<AuditLog[]>;
  setLatestArticles: (articles: Article[]) => void;
  setLatestSuppliers: (suppliers: Supplier[]) => void;
  setLatestClients: (clients: Client[]) => void;
  setLatestTeamServices: (services: TeamService[]) => void;
  setLatestEmployees: (employees: Employee[]) => void;
  setLatestProjects: (projects: StockProject[]) => void;
  setLatestLocations: (locations: StockLocation[]) => void;
  setLatestMovements: (movements: StockMovement[]) => void;
  setLatestStockLevels: (levels: StockLevel[]) => void;
  setLatestEquipments: (equipments: Equipment[]) => void;
  setLatestUsers: (users: StockUser[]) => void;
  setLatestAuditAlerts: (alerts: AuditAlert[]) => void;
  setLatestAuditLogs: (logs: AuditLog[]) => void;
  updateDashboard: (root: HTMLElement) => void;
  renderReferentialsRegistry: (root: HTMLElement) => void;
  renderInventory: (root: HTMLElement) => void;
  populateStockFilters: (root: HTMLElement) => void;
  renderStock: (root: HTMLElement) => void;
  renderEntriesRegistry: (root: HTMLElement) => void;
  visibleExitMovements: (movements: StockMovement[]) => StockMovement[];
  renderDashboardPendingExitRequests: (
    root: HTMLElement,
    movements: StockMovement[],
  ) => void;
  renderExitRegistry: (root: HTMLElement) => void;
  renderReturnTransferRegistry: (
    root: HTMLElement,
    movements: StockMovement[],
  ) => void;
  renderReappro: (root: HTMLElement) => void;
  renderEquipmentsRegistry: (
    root: HTMLElement,
    equipments: Equipment[],
  ) => void;
  renderVehicles: (root: HTMLElement, vehicles: Vehicle[]) => void;
  renderUsersList: (root: HTMLElement) => void;
  renderAuditLogs: (root: HTMLElement) => void;
  renderHistory: (root: HTMLElement) => void;
  renderAuditAlerts: (root: HTMLElement) => void;
  renderDashboardAuditAlerts: (
    root: HTMLElement,
    alerts: AuditAlert[],
  ) => void;
  renderDashboardAuditLogCount: (
    root: HTMLElement,
    count: number,
  ) => void;
  setText: (root: HTMLElement, selector: string, value: string | number) => void;
  isToday: (value: string | Date) => boolean;
  createIcons: () => void;
};

export function updateApiBackedViewsPage(
  root: HTMLElement,
  ctx: DataRefreshContext,
) {
  ctx.updateDashboard(root);
  ctx
    .getArticles()
    .then((articles) => {
      ctx.setLatestArticles(articles);
      ctx.renderReferentialsRegistry(root);
      ctx.renderInventory(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getSuppliers()
    .then((suppliers) => {
      ctx.setLatestSuppliers(suppliers);
      ctx.renderReferentialsRegistry(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getClients()
    .then((clients) => {
      ctx.setLatestClients(clients);
      ctx.renderReferentialsRegistry(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getTeamServices()
    .then((services) => {
      ctx.setLatestTeamServices(services);
      ctx.renderReferentialsRegistry(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getEmployees()
    .then((employees) => {
      ctx.setLatestEmployees(employees);
      ctx.renderReferentialsRegistry(root);
      ctx.createIcons();
    })
    .catch(() => undefined);
  ctx
    .getProjects()
    .then((projects) => {
      ctx.setLatestProjects(projects);
      ctx.renderReferentialsRegistry(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getLocations()
    .then((locations) => {
      ctx.setLatestLocations(locations);
      ctx.renderReferentialsRegistry(root);
      ctx.populateStockFilters(root);
      ctx.renderStock(root);
      ctx.renderInventory(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getStockMovements()
    .then((movements) => {
      ctx.setLatestMovements(movements);
      ctx.renderStock(root);
      ctx.renderEntriesRegistry(root);
      const exits = ctx.visibleExitMovements(movements);
      const pendingExits = exits.filter(
        (movement) =>
          movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED",
      );
      const pendingAlert = root.querySelector<HTMLElement>("#exitPendingAlert");
      const pendingCount = root.querySelector<HTMLElement>("#exitPendingCount");
      if (pendingAlert)
        pendingAlert.classList.toggle("hidden", pendingExits.length === 0);
      if (pendingCount) pendingCount.textContent = String(pendingExits.length);
      ctx.renderDashboardPendingExitRequests(root, pendingExits);
      ctx.renderExitRegistry(root);
      ctx.setText(root, "#exitRequestsCount", pendingExits.length);
      ctx.setText(
        root,
        "#exitCompletedCount",
        exits.filter(
          (movement) =>
            movement.type === "EXIT" && movement.status === "COMPLETED",
        ).length,
      );
      ctx.setText(
        root,
        "#exitBlockedCount",
        exits.filter(
          (movement) =>
            movement.status === "REJECTED" || movement.status === "CANCELLED",
        ).length,
      );
      ctx.setText(
        root,
        "#exitTodayCount",
        exits.filter((movement) => ctx.isToday(movement.date)).length,
      );
      ctx.renderReturnTransferRegistry(root, movements);
      ctx.renderHistory(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getStockLevels()
    .then((levels) => {
      ctx.setLatestStockLevels(levels);
      ctx.populateStockFilters(root);
      ctx.renderStock(root);
      ctx.renderInventory(root);
      ctx.renderExitRegistry(root);
      ctx.renderReappro(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getEquipments()
    .then((equipments) => {
      ctx.setLatestEquipments(equipments);
      ctx.renderEquipmentsRegistry(root, equipments);
    })
    .catch(() => undefined);

  ctx
    .getVehicles()
    .then((vehicles) => {
      ctx.renderVehicles(root, vehicles);
    })
    .catch(() => undefined);

  ctx
    .getUsers()
    .then((users) => {
      ctx.setLatestUsers(users);
      ctx.renderUsersList(root);
      ctx.renderAuditLogs(root);
      ctx.renderHistory(root);
      ctx.createIcons();
    })
    .catch(() => undefined);

  ctx
    .getAuditAlerts()
    .then((alerts) => {
      ctx.setLatestAuditAlerts(alerts);
      ctx.renderAuditAlerts(root);
      ctx.renderDashboardAuditAlerts(root, alerts);
    })
    .catch(() => undefined);

  ctx
    .getAuditLogs()
    .then((logs) => {
      ctx.setLatestAuditLogs(logs);
      ctx.renderAuditLogs(root);
      ctx.renderHistory(root);
      ctx.renderDashboardAuditLogCount(root, logs.length);
    })
    .catch(() => undefined);
}
