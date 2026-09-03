const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3200";

function currentAuditUserId() {
  if (typeof localStorage === "undefined") return undefined;
  try {
    const raw = localStorage.getItem("stock-hub.user");
    if (!raw) return undefined;
    const user = JSON.parse(raw) as { id?: unknown };
    return typeof user.id === "string" && user.id ? user.id : undefined;
  } catch {
    return undefined;
  }
}

function withAuditUser(body: unknown) {
  const auditUserId = currentAuditUserId();
  if (
    !auditUserId ||
    !body ||
    typeof body !== "object" ||
    body instanceof FormData ||
    Array.isArray(body)
  ) {
    return body;
  }
  return { ...(body as Record<string, unknown>), auditUserId };
}

export type DashboardSummary = {
  articles: number;
  ruptures: number;
  movementsToday: number;
  equipmentAssigned: number;
};

export type Article = {
  id: string;
  code: string;
  designation: string;
  category: string;
  unit: string;
  trackingMode: "QUANTITY" | "INDIVIDUAL";
  minimumStock: number;
  securityStock: number;
  referencePrice: string | number | null;
  defaultSupplierId: string | null;
  defaultLocationId: string | null;
  initialStock: number | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Client = {
  id: string;
  code: string;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TeamService = {
  id: string;
  code: string;
  name: string;
  type: string;
  manager: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Employee = {
  id: string;
  matricule: string;
  lastName: string;
  firstName: string;
  department: string | null;
  role: string | null;
  phone: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Supplier = {
  id: string;
  code: string;
  name: string;
  fiscalId: string | null;
  category: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type StockProject = {
  id: string;
  code: string;
  name: string;
  client: string | null;
  clientId: string | null;
  projectManagerId: string | null;
  region: string | null;
  city: string | null;
  site: string | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  sites?: StockLocation[];
};

export type StockLocation = {
  id: string;
  code: string;
  name: string;
  type: string;
  responsible: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  projectId: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type StockLevel = {
  id: string;
  quantity: number;
  article: Article;
  location: StockLocation;
};

export type Equipment = {
  id: string;
  code: string;
  serialNumber: string | null;
  articleId: string;
  article: Article;
  state: string;
  status: string;
  assignedTo: string | null;
  locationId: string | null;
  location?: StockLocation | null;
  supplierId: string | null;
  supplier?: Supplier | null;
  entryDate: string;
  origin: string | null;
  notes: string | null;
  history: EquipmentHistory[];
  createdAt: string;
  updatedAt: string;
};

export type EquipmentHistory = {
  id: string;
  action: string;
  status: string | null;
  state: string | null;
  assignedTo: string | null;
  locationId: string | null;
  observation: string | null;
  createdAt: string;
};



export type Vehicle = {
  id: string;
  code: string;
  name: string;
  type: string;
  plateNumber: string;
  assignment: string | null;
  driverName: string | null;
  apprenticeName: string | null;
  status: string;
  insuranceExpiresAt: string | null;
  technicalVisitAt: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  history: VehicleHistory[];
};

export type VehicleHistory = {
  id: string;
  action: string;
  assignment: string | null;
  previousAssignment: string | null;
  driverName: string | null;
  previousDriverName: string | null;
  apprenticeName: string | null;
  previousApprenticeName: string | null;
  status: string | null;
  previousStatus: string | null;
  observation: string | null;
  createdAt: string;
};
export type StockMovementLine = {
  id: string;
  articleId: string;
  article: Article;
  requestedQuantity: number | null;
  expectedQuantity: number | null;
  completedQuantity: number | null;
  unitPrice: string | number | null;
  observation: string | null;
};

export type StockMovement = {
  id: string;
  reference: string;
  type: "INITIAL" | "ENTRY" | "EXIT_REQUEST" | "EXIT" | "RETURN" | "TRANSFER" | "ADJUSTMENT";
  status: string;
  date: string;
  supplierId: string | null;
  clientId: string | null;
  projectId: string | null;
  teamServiceId: string | null;
  siteLocationId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  handledBy: string | null;
  requestedBy: string | null;
  receivedBy: string | null;
  deliveredBy: string | null;
  sourceRequestId: string | null;
  proofFileName: string | null;
  proofFileKey: string | null;
  proofMimeType: string | null;
  proofSizeBytes: number | null;
  proofUploadedAt: string | null;
  proofUploadedBy: string | null;
  rejectionReason: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  notes: string | null;
  supplier?: Supplier | null;
  client?: Client | null;
  project?: StockProject | null;
  teamService?: TeamService | null;
  siteLocation?: StockLocation | null;
  fromLocation?: StockLocation | null;
  toLocation?: StockLocation | null;
  sourceRequest?: StockMovement | null;
  generatedExits?: StockMovement[];
  createdByUser?: StockUser | null;
  lines: StockMovementLine[];
};

export type StockUser = {
  id: string;
  identifier: string;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: string[];
  active: boolean;
};

export type AuditAlert = {
  id: string;
  type: string;
  object: string;
  location: string;
  severity: "CRITIQUE" | "A_VERIFIER" | string;
  date: string;
  action: string;
  status: string;
  domain?: string;
  objectCode?: string | null;
  locationId?: string | null;
  movementId?: string | null;
  movementReference?: string | null;
  articleId?: string | null;
  articleCode?: string | null;
  articleName?: string | null;
  impact?: string | null;
  expectedQuantity?: number | null;
  completedQuantity?: number | null;
  gapQuantity?: number | null;
  details?: Record<string, unknown> | null;
};

export type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  createdAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const isFormData = init?.body instanceof FormData;
  try {
    response = await fetch(API_URL + path, {
      ...init,
      headers: {
        ...(init?.body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {})
      }
    });
  } catch {
    throw new Error("API indisponible. Verifie que le serveur local tourne bien sur " + API_URL + " puis recharge la page.");
  }

  if (!response.ok) {
    let message = "API " + path + " failed with " + response.status;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // Keep generic message when the API does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function post<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(withAuditUser(body)),
  });
}

function patch<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(withAuditUser(body)),
  });
}

export function loginUser(body: { identifier: string; password: string }) {
  return post<{ user: StockUser }>("/auth/login", body);
}

export function createUser(body: {
  identifier: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  roles: string[];
  password?: string;
  active?: boolean;
}) {
  return post<StockUser>("/users", body);
}

export function getDashboardSummary() {
  return request<DashboardSummary>("/dashboard-summary");
}

export function getArticles() {
  return request<Article[]>("/articles");
}

export function createArticle(body: {
  code?: string;
  designation: string;
  category: string;
  unit: string;
  trackingMode: "QUANTITY" | "INDIVIDUAL";
  minimumStock: number;
  securityStock?: number;
  referencePrice: number | null;
  defaultSupplierId?: string;
  defaultLocationId?: string;
  initialStock?: number;
  initialLocationId?: string;
}) {
  return post<Article>("/articles", body);
}

export type UpdateArticleBody = Partial<Pick<Article, "designation" | "category" | "unit" | "trackingMode" | "minimumStock" | "securityStock" | "referencePrice" | "defaultSupplierId" | "defaultLocationId" | "active">> & {
  stockQuantity?: number;
  stockLocationId?: string | null;
};

export function updateArticle(id: string, body: UpdateArticleBody) {
  return patch<Article>("/articles/" + encodeURIComponent(id), body);
}
export function getClients() {
  return request<Client[]>("/clients");
}

export function createClient(body: {
  code?: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
}) {
  return post<Client>("/clients", body);
}

export function updateClient(id: string, body: Partial<Pick<Client, "name" | "contact" | "phone" | "email" | "active">>) {
  return patch<Client>("/clients/" + encodeURIComponent(id), body);
}

export function getTeamServices() {
  return request<TeamService[]>("/team-services");
}

export function createTeamService(body: {
  code?: string;
  name: string;
  type?: string;
  manager?: string;
}) {
  return post<TeamService>("/team-services", body);
}

export function updateTeamService(id: string, body: Partial<Pick<TeamService, "name" | "type" | "manager" | "active">>) {
  return patch<TeamService>("/team-services/" + encodeURIComponent(id), body);
}

export function getEmployees() {
  return request<Employee[]>("/employees");
}

export function createEmployee(body: {
  matricule?: string;
  lastName: string;
  firstName: string;
  department?: string;
  role?: string;
  phone?: string;
}) {
  return post<Employee>("/employees", body);
}

export function updateEmployee(id: string, body: Partial<Pick<Employee, "matricule" | "lastName" | "firstName" | "department" | "role" | "phone" | "active">>) {
  return patch<Employee>("/employees/" + encodeURIComponent(id), body);
}

export function getSuppliers() {
  return request<Supplier[]>("/suppliers");
}

export function createSupplier(body: {
  code?: string;
  name: string;
  fiscalId?: string;
  category?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  return post<Supplier>("/suppliers", body);
}

export function updateSupplier(id: string, body: Partial<Pick<Supplier, "name" | "fiscalId" | "category" | "contact" | "phone" | "email" | "address" | "active">>) {
  return patch<Supplier>("/suppliers/" + encodeURIComponent(id), body);
}

export function getProjects() {
  return request<StockProject[]>("/projects");
}

export function createProject(body: {
  code?: string;
  name: string;
  client?: string;
  clientId?: string;
  projectManagerId?: string;
  region?: string;
  city?: string;
  site?: string;
  startDate?: string;
  endDate?: string;
}) {
  return post<StockProject>("/projects", body);
}

export function updateProject(id: string, body: Partial<Pick<StockProject, "name" | "clientId" | "projectManagerId" | "region" | "city" | "site" | "startDate" | "endDate" | "active">>) {
  return patch<StockProject>("/projects/" + encodeURIComponent(id), body);
}

export function getLocations() {
  return request<StockLocation[]>("/locations");
}

export function createLocation(body: {
  code?: string;
  name: string;
  type: string;
  responsible?: string;
  region?: string;
  city?: string;
  address?: string;
  projectId?: string;
}) {
  return post<StockLocation>("/locations", body);
}

export function updateLocation(id: string, body: Partial<Pick<StockLocation, "name" | "type" | "responsible" | "region" | "city" | "address" | "projectId" | "active">>) {
  return patch<StockLocation>("/locations/" + encodeURIComponent(id), body);
}

export function getStockLevels() {
  return request<StockLevel[]>("/stock-levels");
}

export function getEquipments() {
  return request<Equipment[]>("/equipments");
}

export function createEquipment(body: {
  articleId: string;
  serialNumber?: string;
  state?: string;
  locationId?: string;
  supplierId?: string;
  entryDate?: string;
  origin?: string;
  notes?: string;
}) {
  return post<Equipment>("/equipments", body);
}

export function updateEquipment(id: string, body: {
  articleId?: string;
  serialNumber?: string;
  state?: string;
  status?: string;
  assignedTo?: string | null;
  locationId?: string | null;
  supplierId?: string | null;
  entryDate?: string;
  origin?: string | null;
  notes?: string | null;
}) {
  return patch<Equipment>("/equipments/" + encodeURIComponent(id), body);
}

export function unassignEquipment(id: string) {
  return post<Equipment>("/equipments/" + encodeURIComponent(id) + "/unassign", {});
}


export function getVehicles() {
  return request<Vehicle[]>("/vehicles");
}

export function createVehicle(body: {
  name?: string;
  type: string;
  plateNumber: string;
  assignment?: string;
  driverName?: string;
  apprenticeName?: string;
  status?: string;
  insuranceExpiresAt?: string;
  technicalVisitAt?: string;
  notes?: string;
}) {
  return post<Vehicle>("/vehicles", body);
}

export function updateVehicle(id: string, body: {
  name?: string;
  type?: string;
  plateNumber?: string;
  assignment?: string | null;
  driverName?: string | null;
  apprenticeName?: string | null;
  status?: string;
  insuranceExpiresAt?: string | null;
  technicalVisitAt?: string | null;
  notes?: string | null;
  active?: boolean;
}) {
  return patch<Vehicle>("/vehicles/" + encodeURIComponent(id), body);
}
export function getUsers() {
  return request<StockUser[]>("/users");
}

export function updateUser(id: string, body: {
  identifier?: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  password?: string;
  active?: boolean;
}) {
  return patch<StockUser>("/users/" + encodeURIComponent(id), body);
}

export function updateMyProfile(id: string, body: {
  firstName: string;
  lastName: string;
  email?: string | null;
}) {
  return patch<StockUser>("/users/" + encodeURIComponent(id) + "/profile", body);
}

export function changeMyPassword(id: string, body: {
  currentPassword: string;
  newPassword: string;
}) {
  return post<StockUser>("/users/" + encodeURIComponent(id) + "/change-password", body);
}

export function getStockMovements() {
  return request<StockMovement[]>("/stock-movements");
}

export function createStockEntry(body: {
  reference: string;
  date: string;
  supplierId?: string;
  projectId?: string;
  toLocationId?: string;
  handledBy?: string;
  receivedBy?: string;
  deliveredBy?: string;
  notes?: string;
  lines: Array<{
    articleId: string;
    expectedQuantity?: number;
    completedQuantity: number;
    unitPrice?: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>("/stock-movements/entries", body);
}

export function resolveStockEntryDispute(id: string, body: {
  handledBy?: string;
  notes?: string;
  lines: Array<{
    lineId: string;
    action: "COMPLETE_MISSING" | "ACCEPT_SURPLUS" | "RETURN_SURPLUS";
    quantity?: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>(
    "/stock-movements/entries/" + encodeURIComponent(id) + "/resolve",
    body,
  );
}

export function createExitRequest(body: {
  reference: string;
  date: string;
  clientId?: string;
  projectId?: string;
  teamServiceId?: string;
  siteLocationId?: string;
  fromLocationId?: string;
  requestedBy?: string;
  notes?: string;
  lines: Array<{
    articleId: string;
    requestedQuantity: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>("/stock-movements/exit-requests", body);
}

export function createStockExit(body: {
  reference: string;
  date: string;
  clientId?: string;
  projectId?: string;
  teamServiceId?: string;
  siteLocationId?: string;
  fromLocationId: string;
  requestedBy?: string;
  handledBy?: string;
  deliveredBy?: string;
  notes?: string;
  lines: Array<{
    articleId: string;
    requestedQuantity?: number;
    completedQuantity: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>("/stock-movements/exits", body);
}

export function prepareExitRequest(id: string, body: {
  reference?: string;
  fromLocationId: string;
  handledBy?: string;
  deliveredBy?: string;
  receivedBy?: string;
  lines: Array<{
    lineId?: string;
    articleId: string;
    requestedQuantity?: number;
    completedQuantity: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>("/stock-movements/exit-requests/" + encodeURIComponent(id) + "/prepare", body);
}

export function rejectExitRequest(id: string, body: { reason: string; rejectedBy?: string }) {
  return post<StockMovement>("/stock-movements/exit-requests/" + encodeURIComponent(id) + "/reject", body);
}

export function uploadExitRequestProof(id: string, body: { file: File; uploadedBy?: string }) {
  const form = new FormData();
  form.append("file", body.file);
  if (body.uploadedBy) form.append("uploadedBy", body.uploadedBy);
  const auditUserId = currentAuditUserId();
  if (auditUserId) form.append("auditUserId", auditUserId);
  return request<StockMovement>("/stock-movements/exit-requests/" + encodeURIComponent(id) + "/proof", {
    method: "POST",
    body: form
  });
}

export function getExitRequestProof(id: string) {
  return request<{ url: string; fileName: string | null; mimeType: string | null; expiresIn: number }>(
    "/stock-movements/exit-requests/" + encodeURIComponent(id) + "/proof"
  );
}

export function uploadEntryProof(id: string, body: { file: File; uploadedBy?: string }) {
  const form = new FormData();
  form.append("file", body.file);
  if (body.uploadedBy) form.append("uploadedBy", body.uploadedBy);
  const auditUserId = currentAuditUserId();
  if (auditUserId) form.append("auditUserId", auditUserId);
  return request<StockMovement>("/stock-movements/entries/" + encodeURIComponent(id) + "/proof", {
    method: "POST",
    body: form
  });
}

export function getEntryProof(id: string) {
  return request<{ url: string; fileName: string | null; mimeType: string | null; expiresIn?: number }>(
    "/stock-movements/entries/" + encodeURIComponent(id) + "/proof"
  );
}


export function createStockReturn(body: {
  reference: string;
  date: string;
  sourceMovementId: string;
  toLocationId: string;
  handledBy?: string;
  receivedBy?: string;
  deliveredBy?: string;
  notes?: string;
  reintegrate?: boolean;
  attachmentFileName?: string;
  lines: Array<{
    articleId: string;
    completedQuantity: number;
    goodQuantity?: number;
    damagedQuantity?: number;
    scrapQuantity?: number;
    pendingControlQuantity?: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>("/stock-movements/returns", body);
}

export function controlStockReturn(id: string, body: {
  handledBy?: string;
  notes?: string;
  lines: Array<{
    lineId: string;
    decision: "REINTEGRATE" | "DISCARD" | "REPAIR";
    acceptedQuantity?: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>("/stock-movements/returns/" + encodeURIComponent(id) + "/control", body);
}

export function uploadReturnProof(id: string, body: { file: File; uploadedBy?: string }) {
  const form = new FormData();
  form.append("file", body.file);
  if (body.uploadedBy) form.append("uploadedBy", body.uploadedBy);
  const auditUserId = currentAuditUserId();
  if (auditUserId) form.append("auditUserId", auditUserId);
  return request<StockMovement>("/stock-movements/returns/" + encodeURIComponent(id) + "/proof", {
    method: "POST",
    body: form
  });
}

export function getReturnProof(id: string) {
  return request<{ url: string; fileName: string | null; mimeType: string | null; expiresIn?: number }>(
    "/stock-movements/returns/" + encodeURIComponent(id) + "/proof"
  );
}

export function createStockTransfer(body: {
  reference: string;
  date: string;
  fromLocationId: string;
  toLocationId: string;
  handledBy?: string;
  receivedBy?: string;
  deliveredBy?: string;
  notes?: string;
  lines: Array<{
    articleId: string;
    completedQuantity: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>("/stock-movements/transfers", body);
}

export function uploadTransferProof(id: string, body: { file: File; uploadedBy?: string }) {
  const form = new FormData();
  form.append("file", body.file);
  if (body.uploadedBy) form.append("uploadedBy", body.uploadedBy);
  const auditUserId = currentAuditUserId();
  if (auditUserId) form.append("auditUserId", auditUserId);
  return request<StockMovement>("/stock-movements/transfers/" + encodeURIComponent(id) + "/proof", {
    method: "POST",
    body: form
  });
}

export function getTransferProof(id: string) {
  return request<{ url: string; fileName: string | null; mimeType: string | null; expiresIn?: number }>(
    "/stock-movements/transfers/" + encodeURIComponent(id) + "/proof"
  );
}


export function createInventoryAdjustment(body: {
  reference: string;
  date: string;
  locationId: string;
  handledBy?: string;
  notes?: string;
  lines: Array<{
    articleId: string;
    expectedQuantity?: number;
    completedQuantity: number;
    goodQuantity?: number;
    repairQuantity?: number;
    outOfServiceQuantity?: number;
    observation?: string;
  }>;
}) {
  return post<StockMovement>("/stock-movements/adjustments", body);
}


export function getAuditAlerts() {
  return request<AuditAlert[]>("/alerts");
}

export function getAuditLogs() {
  return request<AuditLog[]>("/audit-logs");
}








