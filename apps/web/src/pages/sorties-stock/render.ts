import type {
  Article,
  Client,
  StockLevel,
  StockLocation,
  StockMovement,
  StockProject,
  StockUser,
  TeamService,
} from "../../api";
import { requestForExitFromMovements } from "../../services/movements";
import { selectedText } from "../../utils/dom";
import { escapeHtml, formatDate, formatNumber, isToday } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type SortiesStockContext = {
  latestMovements: StockMovement[];
  setLatestMovements: (movements: StockMovement[]) => void;
  latestProjects: StockProject[];
  setLatestProjects: (projects: StockProject[]) => void;
  latestLocations: StockLocation[];
  setLatestLocations: (locations: StockLocation[]) => void;
  latestClients: Client[];
  setLatestClients: (clients: Client[]) => void;
  latestTeamServices: TeamService[];
  setLatestTeamServices: (services: TeamService[]) => void;
  latestStockLevels: StockLevel[];
  currentUser: StockUser | null;
  badge: (label: string, tone: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  option: (value: string, label: string) => string;
  fillSelect: (select: HTMLSelectElement | undefined, options: string, placeholder?: string) => void;
  articleOptions: (articles: Article[]) => string;
  projectOptions: (projects: StockProject[]) => string;
  clientOptions: (clients: Client[]) => string;
  teamServiceOptions: (services: TeamService[]) => string;
  userOptions: (users: StockUser[]) => string;
  setProjectSiteOptions: (siteSelect: HTMLSelectElement | undefined, projectId: string) => void;
  toNumber: (value: string) => number;
  openModal: (root: HTMLElement, id: string) => void;
  closeModal: (root: HTMLElement, id: string) => void;
  showToast: (root: HTMLElement, message: string, type?: "success" | "error") => void;
  updateApiBackedViews: (root: HTMLElement) => void;
  stockAvailableFor: (articleId: string, locationId?: string | null) => number;
  canPrepareMaterialRequests: () => boolean;
  hasRole: (role: string) => boolean;
  looksLikeGeneratedExit: (request: StockMovement, exit: StockMovement) => boolean;
  linkedExitForRequest: (movement: StockMovement) => StockMovement | null;
  movementStatusLabel: (movement: StockMovement) => string;
  movementLinesPreview: (movement: StockMovement, mode?: "entry" | "exit") => string;
  materialRequestDocumentHtml: (input: {
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
  }) => string;
  getArticles: () => Promise<Article[]>;
  getProjects: () => Promise<StockProject[]>;
  getLocations: () => Promise<StockLocation[]>;
  getUsers: () => Promise<StockUser[]>;
  getClients: () => Promise<Client[]>;
  getTeamServices: () => Promise<TeamService[]>;
  getStockMovements: () => Promise<StockMovement[]>;
  createExitRequest: (payload: Parameters<typeof import("../../api").createExitRequest>[0]) => Promise<StockMovement>;
  createStockExit: (payload: Parameters<typeof import("../../api").createStockExit>[0]) => Promise<StockMovement>;
  prepareExitRequest: (id: string, payload: Parameters<typeof import("../../api").prepareExitRequest>[1]) => Promise<StockMovement>;
  rejectExitRequest: (id: string, payload: Parameters<typeof import("../../api").rejectExitRequest>[1]) => Promise<StockMovement>;
  uploadExitRequestProof: (id: string, payload: Parameters<typeof import("../../api").uploadExitRequestProof>[1]) => Promise<StockMovement>;
  getExitRequestProof: (id: string) => Promise<{ url: string; fileName?: string | null }>;
};

let latestMovements: StockMovement[] = [];
let latestProjects: StockProject[] = [];
let latestLocations: StockLocation[] = [];
let latestClients: Client[] = [];
let latestTeamServices: TeamService[] = [];
let latestStockLevels: StockLevel[] = [];
let currentUser: StockUser | null = null;
let currentExitFilter = "ALL";
let selectedExitRequestId: string | null = null;
let selectedRejectedExitRequestId: string | null = null;
let activeCtx: SortiesStockContext | null = null;

function syncFrom(ctx: SortiesStockContext) {
  activeCtx = ctx;
  latestMovements = ctx.latestMovements;
  latestProjects = ctx.latestProjects;
  latestLocations = ctx.latestLocations;
  latestClients = ctx.latestClients;
  latestTeamServices = ctx.latestTeamServices;
  latestStockLevels = ctx.latestStockLevels;
  currentUser = ctx.currentUser;
}

function syncTo() {
  if (!activeCtx) return;
  activeCtx.setLatestMovements(latestMovements);
  activeCtx.setLatestProjects(latestProjects);
  activeCtx.setLatestLocations(latestLocations);
  activeCtx.setLatestClients(latestClients);
  activeCtx.setLatestTeamServices(latestTeamServices);
}

function withContext<T>(ctx: SortiesStockContext, callback: () => T): T {
  syncFrom(ctx);
  try {
    return callback();
  } finally {
    syncTo();
  }
}

async function withContextAsync<T>(ctx: SortiesStockContext, callback: () => Promise<T>): Promise<T> {
  syncFrom(ctx);
  try {
    return await callback();
  } finally {
    syncTo();
  }
}

function requireCtx() {
  if (!activeCtx) throw new Error("Sorties stock context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone: BadgeTone) { return requireCtx().badge(label, tone); }
function emptyRow(colspan: number, message: string) { return requireCtx().emptyRow(colspan, message); }
function option(value: string, label: string) { return requireCtx().option(value, label); }
function fillSelect(select: HTMLSelectElement | undefined, options: string, placeholder?: string) { return requireCtx().fillSelect(select, options, placeholder); }
function articleOptions(articles: Article[]) { return requireCtx().articleOptions(articles); }
function projectOptions(projects: StockProject[]) { return requireCtx().projectOptions(projects); }
function clientOptions(clients: Client[]) { return requireCtx().clientOptions(clients); }
function teamServiceOptions(services: TeamService[]) { return requireCtx().teamServiceOptions(services); }
function userOptions(users: StockUser[]) { return requireCtx().userOptions(users); }
function setProjectSiteOptions(siteSelect: HTMLSelectElement | undefined, projectId: string) { return requireCtx().setProjectSiteOptions(siteSelect, projectId); }
function toNumber(value: string) { return requireCtx().toNumber(value); }
function openModal(root: HTMLElement, id: string) { return requireCtx().openModal(root, id); }
function closeModal(root: HTMLElement, id: string) { return requireCtx().closeModal(root, id); }
function showToast(root: HTMLElement, message: string, type?: "success" | "error") { return requireCtx().showToast(root, message, type); }
function updateApiBackedViews(root: HTMLElement) { return requireCtx().updateApiBackedViews(root); }
function stockAvailableFor(articleId: string, locationId?: string | null) { return requireCtx().stockAvailableFor(articleId, locationId); }
function canPrepareMaterialRequests() { return requireCtx().canPrepareMaterialRequests(); }
function hasRole(role: string) { return requireCtx().hasRole(role); }
function looksLikeGeneratedExit(request: StockMovement, exit: StockMovement) { return requireCtx().looksLikeGeneratedExit(request, exit); }
function linkedExitForRequest(movement: StockMovement) { return requireCtx().linkedExitForRequest(movement); }
function movementStatusLabel(movement: StockMovement) { return requireCtx().movementStatusLabel(movement); }
function movementLinesPreview(movement: StockMovement, mode: "entry" | "exit" = "entry") { return requireCtx().movementLinesPreview(movement, mode); }
function materialRequestDocumentHtml(input: Parameters<SortiesStockContext["materialRequestDocumentHtml"]>[0]) { return requireCtx().materialRequestDocumentHtml(input); }
function getArticles() { return requireCtx().getArticles(); }
function getProjects() { return requireCtx().getProjects(); }
function getLocations() { return requireCtx().getLocations(); }
function getUsers() { return requireCtx().getUsers(); }
function getClients() { return requireCtx().getClients(); }
function getTeamServices() { return requireCtx().getTeamServices(); }
function getStockMovements() { return requireCtx().getStockMovements(); }
function createExitRequest(payload: Parameters<SortiesStockContext["createExitRequest"]>[0]) { return requireCtx().createExitRequest(payload); }
function createStockExit(payload: Parameters<SortiesStockContext["createStockExit"]>[0]) { return requireCtx().createStockExit(payload); }
function prepareExitRequest(id: string, payload: Parameters<SortiesStockContext["prepareExitRequest"]>[1]) { return requireCtx().prepareExitRequest(id, payload); }
function rejectExitRequest(id: string, payload: Parameters<SortiesStockContext["rejectExitRequest"]>[1]) { return requireCtx().rejectExitRequest(id, payload); }
function uploadExitRequestProof(id: string, payload: Parameters<SortiesStockContext["uploadExitRequestProof"]>[1]) { return requireCtx().uploadExitRequestProof(id, payload); }
function getExitRequestProof(id: string) { return requireCtx().getExitRequestProof(id); }

function requestForExit(movement: StockMovement) {
  return requestForExitFromMovements(movement, latestMovements);
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
    ? "Signee uploadee"
    : canDownloadPdf
      ? "A signer"
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
            <div><span class="detail-label">Fiche signee</span> <strong class="${ficheStatusClass}">${ficheStatus}</strong></div>
            <div><span class="detail-label">Projet / chantier</span> <strong>${escapeHtml(displayedRequest.project?.name ?? movement.project?.name ?? movement.toLocation?.name ?? "-")}</strong></div>
            <div><span class="detail-label">Magasin source</span> <strong>${escapeHtml(movement.fromLocation?.name ?? displayedRequest.fromLocation?.name ?? "-")}</strong></div>
          </div>
        </div>
        <div class="border-t bg-gray-50 p-5 md:border-l md:border-t-0">
          <div class="grid gap-3 text-sm">
            <div><span class="detail-label">Demandeur / beneficiaire</span> <strong>${escapeHtml(displayedRequest.requestedBy ?? movement.receivedBy ?? "-")}</strong></div>
            <div><span class="detail-label">Sorti par</span> <strong>${escapeHtml(movement.handledBy ?? "-")}</strong></div>
            <div><span class="detail-label">Transporte par</span> <strong>${escapeHtml(movement.deliveredBy ?? "-")}</strong></div>
            <div><span class="detail-label">Remis a</span> <strong>${escapeHtml(movement.receivedBy ?? displayedRequest.receivedBy ?? displayedRequest.requestedBy ?? "-")}</strong></div>
          </div>
        </div>
      </div>
    </div>
    ${movement.type === "EXIT_REQUEST" && movement.status === "SUBMITTED" ? `<div class="rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm text-gray-700"><div class="font-bold text-accent-700 mb-1">Demande transmise au stock</div>En attente de preparation par le gestionnaire stock.</div>` : ""}
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
        "Telecharger fiche",
        `downloadPreparedMaterialPdf('${movement.id}')`,
      ),
    );
  }
  if (canUploadSignedProofFor(movement)) {
    actions.push(
      exitMenuItem(
        "upload",
        "Uploader fiche signee",
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
    showToast(root, "Fiche signee. Demande terminee.");
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
  const popup = window.open("", "_blank");
  if (!popup) {
    showToast(root, "Autorise les popups pour ouvrir la preuve.", "error");
    return;
  }
  popup.opener = null;
  try {
    const proof = await getExitRequestProof(id);
    popup.location.href = proof.url;
    showToast(root, "Preuve signee ouverte : " + (proof.fileName ?? movement.proofFileName ?? "fichier"));
  } catch (error) {
    popup.close();
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
export function setExitFilter(filter: string, ctx: SortiesStockContext) {
  return withContext(ctx, () => {
    currentExitFilter = filter;
  });
}

export function requestForExitPage(movement: StockMovement, ctx: SortiesStockContext) {
  return withContext(ctx, () => requestForExit(movement));
}

export function materialPdfMovementPage(movement: StockMovement, ctx: SortiesStockContext) {
  return withContext(ctx, () => materialPdfMovement(movement));
}

export function materialPdfLinkedExitPage(movement: StockMovement, ctx: SortiesStockContext) {
  return withContext(ctx, () => materialPdfLinkedExit(movement));
}

export function proofRequestForMovementPage(movement: StockMovement, ctx: SortiesStockContext) {
  return withContext(ctx, () => proofRequestForMovement(movement));
}

export function canUploadSignedProofForPage(movement: StockMovement, ctx: SortiesStockContext) {
  return withContext(ctx, () => canUploadSignedProofFor(movement));
}

export function visibleExitMovementsPage(movements: StockMovement[], ctx: SortiesStockContext) {
  return withContext(ctx, () => visibleExitMovements(movements));
}

export function renderExitRegistryPage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContext(ctx, () => renderExitRegistry(root));
}

export function renderExitRequestDetailPage(root: HTMLElement, movement: StockMovement, ctx: SortiesStockContext) {
  return withContext(ctx, () => renderExitRequestDetail(root, movement));
}

export function openPreparedExitForActionPage(root: HTMLElement, action: "download" | "upload", ctx: SortiesStockContext) {
  return withContext(ctx, () => openPreparedExitForAction(root, action));
}

export function openExitRequestDetailPage(root: HTMLElement, id: string, ctx: SortiesStockContext) {
  return withContext(ctx, () => openExitRequestDetail(root, id));
}

export function prepareExitFromRequestPage(root: HTMLElement, id: string, ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => prepareExitFromRequest(root, id));
}

export function toggleFloatingExitActionsPage(root: HTMLElement, movementId: string, trigger: HTMLElement, ctx: SortiesStockContext) {
  return withContext(ctx, () => toggleFloatingExitActions(root, movementId, trigger));
}

export function closeFloatingExitActionsPage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContext(ctx, () => closeFloatingExitActions(root));
}

export function populateExitModalsPage(root: HTMLElement, modalId: "exitModal" | "directExitModal", ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => populateExitModals(root, modalId));
}

export function setMaterialRequestModePage(root: HTMLElement, mode: "create" | "prepare", movement: StockMovement | undefined, ctx: SortiesStockContext) {
  return withContext(ctx, () => setMaterialRequestMode(root, mode, movement));
}

export function downloadPreparedMaterialPdfPage(root: HTMLElement, id: string, ctx: SortiesStockContext) {
  return withContext(ctx, () => downloadPreparedMaterialPdf(root, id));
}

export function uploadSignedMaterialProofPage(root: HTMLElement, id: string, ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => uploadSignedMaterialProof(root, id));
}

export function viewSignedMaterialProofPage(root: HTMLElement, id: string, ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => viewSignedMaterialProof(root, id));
}

export function openExitRequestRejectionPage(root: HTMLElement, id: string, reason: string | undefined, ctx: SortiesStockContext) {
  return withContext(ctx, () => openExitRequestRejection(root, id, reason));
}

export function submitExitRequestRejectionPage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => submitExitRequestRejection(root));
}

export function openMaterialRequestPreparationPage(root: HTMLElement, id: string, ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => openMaterialRequestPreparation(root, id));
}

export function submitMaterialRequestPreparationPage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => submitMaterialRequestPreparation(root));
}

export function refreshMaterialRequestLinesPage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContext(ctx, () => refreshMaterialRequestLines(root));
}

export function syncMaterialPreparationStatePage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContext(ctx, () => syncMaterialPreparationState(root));
}

export function addMaterialRequestLinePage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContext(ctx, () => addMaterialRequestLine(root));
}

export function removeMaterialRequestLinePage(root: HTMLElement, trigger: HTMLElement, ctx: SortiesStockContext) {
  return withContext(ctx, () => removeMaterialRequestLine(root, trigger));
}

export function submitExitRequestPage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => submitExitRequest(root));
}

export function submitDirectExitPage(root: HTMLElement, ctx: SortiesStockContext) {
  return withContextAsync(ctx, () => submitDirectExit(root));
}
