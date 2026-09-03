import type { AuditLog, StockMovement, StockUser } from "../../api";
import { setText } from "../../utils/dom";
import { escapeHtml, formatDate, formatNumber } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";
type ProofStatus = "jointe" | "manquante" | "non-requise";

export type HistoriqueContext = {
  latestMovements: StockMovement[];
  latestAuditLogs: AuditLog[];
  latestUsers: StockUser[];
  badge: (label: string, tone: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  detailCard: (label: string, value: unknown, tone?: "gray" | "success" | "accent") => string;
  userInitials: (user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">) => string;
  clearOtherDrawerStates: () => void;
  movementTypeLabel: (type: StockMovement["type"]) => string;
  movementQuantity: (movement: StockMovement) => number;
  movementActor: (movement: StockMovement) => string;
  movementArticleLabel: (movement: StockMovement) => string;
  movementProofSource: (movement: StockMovement) => StockMovement | null | undefined;
  movementProofCount: (movement: StockMovement) => number;
  movementHasProof: (movement: StockMovement) => boolean;
  movementProofStatus: (movement: StockMovement) => ProofStatus;
  linkedExitForRequest: (movement: StockMovement) => StockMovement | null | undefined;
  requestForExit: (movement: StockMovement) => StockMovement | null | undefined;
  cleanEntryLineObservation: (value: string | null | undefined) => string;
  entryStatusLabel: (movement: StockMovement) => string;
};

let latestMovements: StockMovement[] = [];
let latestAuditLogs: AuditLog[] = [];
let latestUsers: StockUser[] = [];
let historyProofFilter: "ALL" | "MISSING" = "ALL";
let openHistoryMovementId: string | null = null;
let activeCtx: HistoriqueContext | null = null;

function syncFrom(ctx: HistoriqueContext) {
  activeCtx = ctx;
  latestMovements = ctx.latestMovements;
  latestAuditLogs = ctx.latestAuditLogs;
  latestUsers = ctx.latestUsers;
}

function withContext<T>(ctx: HistoriqueContext, callback: () => T): T {
  syncFrom(ctx);
  return callback();
}

function requireCtx() {
  if (!activeCtx) throw new Error("Historique context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone: BadgeTone) { return requireCtx().badge(label, tone); }
function emptyRow(colspan: number, message: string) { return requireCtx().emptyRow(colspan, message); }
function detailCard(label: string, value: unknown, tone?: "gray" | "success" | "accent") { return requireCtx().detailCard(label, value, tone); }
function userInitials(user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">) { return requireCtx().userInitials(user); }
function clearOtherDrawerStates() { return requireCtx().clearOtherDrawerStates(); }
function movementTypeLabel(type: StockMovement["type"]) { return requireCtx().movementTypeLabel(type); }
function movementQuantity(movement: StockMovement) { return requireCtx().movementQuantity(movement); }
function movementActor(movement: StockMovement) { return requireCtx().movementActor(movement); }
function movementArticleLabel(movement: StockMovement) { return requireCtx().movementArticleLabel(movement); }
function movementProofSource(movement: StockMovement) { return requireCtx().movementProofSource(movement); }
function movementProofCount(movement: StockMovement) { return requireCtx().movementProofCount(movement); }
function movementHasProof(movement: StockMovement) { return requireCtx().movementHasProof(movement); }
function movementProofStatus(movement: StockMovement) { return requireCtx().movementProofStatus(movement); }
function linkedExitForRequest(movement: StockMovement) { return requireCtx().linkedExitForRequest(movement); }
function requestForExit(movement: StockMovement) { return requireCtx().requestForExit(movement); }
function cleanEntryLineObservation(value: string | null | undefined) { return requireCtx().cleanEntryLineObservation(value); }
function entryStatusLabel(movement: StockMovement) { return requireCtx().entryStatusLabel(movement); }

function historyProofBadge(movement: StockMovement) {
  const count = movementProofCount(movement);
  if (count > 0) {
    return `<span class="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-bold text-success-700"><i data-lucide="paperclip" class="h-3.5 w-3.5"></i>${formatNumber(count)}</span>`;
  }
  if (movementProofStatus(movement) === "non-requise") {
    return badge("Non requise", "gray");
  }
  return badge("Manquante", "warning");
}

function historyLineObservation(
  movement: StockMovement,
  line: StockMovement["lines"][number],
) {
  const observation =
    movement.type === "ENTRY"
      ? cleanEntryLineObservation(line.observation)
      : (line.observation ?? "").trim();
  if (/^Origine entree\s*:/i.test(observation)) return "";
  return observation;
}

function historyProofViewAction(movement: StockMovement) {
  const proofSource = movementProofSource(movement);
  if (!proofSource || !movementHasProof(movement)) return "";
  if (proofSource.type === "ENTRY") {
    return "viewSignedEntryProof('" + escapeHtml(proofSource.id) + "')";
  }
  if (proofSource.type === "EXIT" || proofSource.type === "EXIT_REQUEST") {
    return "viewSignedMaterialProof('" + escapeHtml(proofSource.id) + "')";
  }
  if (proofSource.type === "RETURN") {
    return "viewSignedReturnProof('" + escapeHtml(proofSource.id) + "')";
  }
  if (proofSource.type === "TRANSFER") {
    return "viewSignedTransferProof('" + escapeHtml(proofSource.id) + "')";
  }
  return "";
}

function historyExitRequestActorLabel(movement: StockMovement) {
  const request =
    movement.type === "EXIT"
      ? requestForExit(movement)
      : movement.type === "EXIT_REQUEST"
        ? movement
        : null;
  if (!request) return "";
  const auditActor = historyMovementActorLabel(request);
  if (auditActor !== "Non trace") return auditActor;
  return request.requestedBy?.trim() || "Non trace";
}

function historyExitPreparedByLabel(movement: StockMovement) {
  if (movement.type !== "EXIT") return "";
  return (
    movement.handledBy?.trim() ||
    movement.deliveredBy?.trim() ||
    movement.sourceRequest?.handledBy?.trim() ||
    "Non trace"
  );
}

function historyStats(movements: StockMovement[]) {
  const articleIds = new Set<string>();
  movements.forEach((movement) => {
    movement.lines.forEach((line) => {
      if (line.articleId) articleIds.add(line.articleId);
    });
  });
  return {
    movements: movements.length,
    missingProofs: movements.filter(
      (movement) => movementProofStatus(movement) === "manquante",
    ).length,
    articles: articleIds.size,
  };
}

function initialsFromText(value: string) {
  const cleaned = value.trim();
  if (!cleaned || cleaned === "-") return "?";
  const parts = cleaned
    .split(/[\s._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

function movementAuditActorUser(movement: StockMovement) {
  if (movement.createdByUser) return movement.createdByUser;
  const createActions = new Set([
    "CREATE_STOCK_ENTRY",
    "CREATE_EXIT_REQUEST",
    "CREATE_STOCK_EXIT",
    "PREPARE_EXIT_REQUEST",
    "CREATE_STOCK_RETURN",
    "CREATE_STOCK_TRANSFER",
    "CREATE_INVENTORY_ADJUSTMENT",
    "CREATE_INITIAL_STOCK",
  ]);
  const related = latestAuditLogs
    .filter((log) => log.entity === "StockMovement" && log.entityId === movement.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const log =
    related.find((item) => createActions.has(item.action)) ?? related[0];
  if (!log?.userId) return null;
  return latestUsers.find((user) => user.id === log.userId) ?? null;
}

function historyMovementActorLabel(movement: StockMovement) {
  const user = movementAuditActorUser(movement);
  if (user) return `${user.firstName} ${user.lastName}`.trim() || user.identifier;
  return "Non trace";
}

function historyActorMarkup(movement: StockMovement) {
  const auditUser = movementAuditActorUser(movement);
  const actor = auditUser
    ? `${auditUser.firstName} ${auditUser.lastName}`.trim() || auditUser.identifier
    : "Non trace";
  const normalized = actor.toLowerCase();
  const user = latestUsers.find((item) => {
    const fullName = `${item.firstName} ${item.lastName}`.trim().toLowerCase();
    return (
      item.identifier.toLowerCase() === normalized ||
      fullName === normalized ||
      item.email?.toLowerCase() === normalized
    );
  }) ?? auditUser;
  const label = user ? `${user.firstName} ${user.lastName}`.trim() : actor;
  const subtitle = user?.identifier ?? "";
  const initials = user ? userInitials(user) : initialsFromText(label);
  return `<div class="flex min-w-0 items-center gap-2"><div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs font-bold text-accent-700">${escapeHtml(initials)}</div><div class="min-w-0"><div class="truncate font-semibold">${escapeHtml(label)}</div>${subtitle ? `<div class="truncate text-xs text-gray-500">${escapeHtml(subtitle)}</div>` : ""}</div></div>`;
}

function historyMovementRow(movement: StockMovement) {
  const quantity = movementQuantity(movement);
  const quantityClass = quantity < 0 ? "text-error-700" : "text-success-700";
  return (
    `<tr class="cursor-pointer transition-colors hover:bg-gray-50" data-action="openHistoryMovementDetail('${escapeHtml(movement.id)}')">` +
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
    historyActorMarkup(movement) +
    "</td>" +
    '<td class="px-5 py-4">' +
    historyProofBadge(movement) +
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
  const period =
    root.querySelector<HTMLInputElement>("#historyPeriod")?.value.trim().toLowerCase() ?? "";
  return latestMovements.filter((movement) => {
    if (movement.type === "EXIT_REQUEST" && linkedExitForRequest(movement)) {
      return false;
    }
    const typeOk = type === "ALL" || movement.type === type;
    const proofOk =
      historyProofFilter === "ALL" ||
      (historyProofFilter === "MISSING" &&
        movementProofStatus(movement) === "manquante");
    const periodHaystack = [movement.date, formatDate(movement.date)]
      .join(" ")
      .toLowerCase();
    const haystack = [
      movement.reference,
      movement.date,
      formatDate(movement.date),
      movementTypeLabel(movement.type),
      historyMovementActorLabel(movement),
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
    return (
      typeOk &&
      proofOk &&
      (!period || periodHaystack.includes(period)) &&
      (!search || haystack.includes(search))
    );
  });
}

function renderHistory(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>("#history-table tbody");
  if (!body) return;
  const rows = filteredHistory(root);
  const stats = historyStats(rows);
  setText(root, "#historyMovementCount", stats.movements);
  setText(root, "#historyMissingProofCount", stats.missingProofs);
  setText(root, "#historyArticleCount", stats.articles);
  const toggle = root.querySelector<HTMLElement>("#historyMissingProofToggle");
  if (toggle) {
    const active = historyProofFilter === "MISSING";
    toggle.classList.toggle("bg-warning-50", active);
    toggle.classList.toggle("border-warning-200", active);
    toggle.classList.toggle("text-warning-700", active);
    toggle.classList.toggle("bg-white", !active);
    toggle.classList.toggle("border-gray-300", !active);
    toggle.classList.toggle("text-gray-700", !active);
  }
  body.innerHTML = rows.length
    ? rows.map(historyMovementRow).join("")
    : emptyRow(7, "Aucun mouvement ne correspond au filtre.");
  window.lucide?.createIcons();
}

function movementLocationSummary(movement: StockMovement) {
  const from = movement.fromLocation?.name;
  const to = movement.toLocation?.name;
  if (from && to) return from + " -> " + to;
  return to ?? from ?? "-";
}

function movementContextItems(movement: StockMovement) {
  return [
    ["Fournisseur", movement.supplier?.name],
    ["Client", movement.client?.name],
    ["Projet", movement.project?.name],
    ["Equipe", movement.teamService?.name],
    ["Site", movement.siteLocation?.name],
  ].filter((item): item is [string, string] => Boolean(item[1]?.trim()));
}

function movementContextCard(movement: StockMovement) {
  const items = movementContextItems(movement);
  if (!items.length) {
    return `<div class="col-span-2 p-4 rounded-xl border bg-gray-50 border-gray-200 text-gray-900"><div class="text-xs font-semibold opacity-70">Contexte</div><div class="font-bold mt-1">-</div></div>`;
  }
  return `
    <div class="col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-900">
      <div class="text-xs font-semibold opacity-70">Contexte</div>
      <div class="mt-3 grid grid-cols-1 gap-2">
        ${items
          .map(
            ([label, value]) => `
              <div class="flex min-w-0 items-start gap-2 rounded-lg bg-white px-3 py-2">
                <span class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">${escapeHtml(label)}</span>
                <span class="min-w-0 break-words text-sm font-bold leading-snug">${escapeHtml(value)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function movementStatusText(movement: StockMovement) {
  if (movement.status === "CANCELLED") return "Annule";
  if (movement.type === "ENTRY") return entryStatusLabel(movement);
  if (movement.type === "RETURN" && movement.status === "PREPARED")
    return "A controler";
  if (movement.status === "COMPLETED") return "Termine";
  if (movement.status === "PREPARED") return "Prepare";
  if (movement.status === "REJECTED") return "Refuse";
  return movement.status || "-";
}

function openHistoryMovementDrawer(root: HTMLElement, id: string) {
  clearOtherDrawerStates();
  openHistoryMovementId = id;
  renderHistoryMovementDrawer(root);
}

function renderHistoryMovementDrawer(root: HTMLElement) {
  const drawer = root.querySelector<HTMLElement>("#stockDrawer");
  const backdrop = root.querySelector<HTMLElement>("#stockDrawerBackdrop");
  const movement = latestMovements.find((item) => item.id === openHistoryMovementId);
  if (!drawer || !backdrop || !movement) return;

  backdrop.classList.remove("hidden");
  drawer.classList.remove("translate-x-full");
  drawer.classList.add("translate-x-0");
  drawer.classList.add("stock-drawer--open");

  const titles = drawer.querySelectorAll<HTMLElement>("h2");
  if (titles[0])
    titles[0].innerHTML =
      '<i data-lucide="info" class="w-4 h-4 text-accent-600"></i>Informations mouvement';
  if (titles[1])
    titles[1].innerHTML =
      '<i data-lucide="paperclip" class="w-4 h-4 text-accent-600"></i>Articles et preuves';

  const header = drawer.querySelector<HTMLElement>("#stockDrawerHeader");
  if (header) {
    header.innerHTML = `
      <div class="min-w-0 flex-1">
        <div class="font-bold text-lg truncate">${escapeHtml(movement.reference)}</div>
        <div class="text-sm text-gray-500">${escapeHtml(movementTypeLabel(movement.type))} &bull; ${escapeHtml(formatDate(movement.date))}</div>
      </div>
    `;
  }

  const infoEl = drawer.querySelector<HTMLElement>("#stockDrawerInfo");
  if (infoEl) {
    const requestedBy = historyExitRequestActorLabel(movement);
    const preparedBy = historyExitPreparedByLabel(movement);
    const proofStatus = movementProofStatus(movement);
    const proofLabel =
      proofStatus === "jointe"
        ? "Jointe"
        : proofStatus === "non-requise"
          ? "Non requise"
          : "Manquante";
    const proofTone =
      proofStatus === "jointe"
        ? "bg-success-50 border-success-100 text-success-700"
        : proofStatus === "non-requise"
          ? "bg-gray-50 border-gray-200 text-gray-700"
          : "bg-warning-50 border-warning-100 text-warning-700";
    infoEl.innerHTML = `
      <div class="grid grid-cols-2 gap-3 text-sm">
        ${detailCard("Statut", movementStatusText(movement))}
        ${detailCard("Quantite", (movementQuantity(movement) > 0 ? "+" : "") + formatNumber(movementQuantity(movement)))}
        ${detailCard("Enregistre par", historyMovementActorLabel(movement))}
        ${requestedBy ? detailCard("Demande par", requestedBy) : ""}
        ${preparedBy ? detailCard("Sorti / prepare par", preparedBy) : ""}
        ${detailCard("Emplacement", movementLocationSummary(movement))}
        <div class="p-4 rounded-xl border ${proofTone}"><div class="text-xs font-semibold opacity-70">Preuve</div><div class="font-bold mt-1">${proofLabel}</div></div>
        ${movementContextCard(movement)}
      </div>
    `;
  }

  const dateFilters = drawer.querySelector<HTMLElement>("#stockDrawerHistory")?.previousElementSibling;
  dateFilters?.classList.add("hidden");

  const histEl = drawer.querySelector<HTMLElement>("#stockDrawerHistory");
  if (histEl) {
    const lineRows = movement.lines
      .map((line) => {
        const quantity = Number(
          line.completedQuantity ?? line.requestedQuantity ?? line.expectedQuantity ?? 0,
        );
        const observation = historyLineObservation(movement, line);
        return `<tr>
          <td class="px-3 py-2"><div class="font-bold">${escapeHtml(line.article?.designation ?? "Article")}</div><div class="text-xs text-gray-500">${escapeHtml(line.article?.code ?? "-")}</div></td>
          <td class="px-3 py-2 text-right font-bold">${formatNumber(quantity)}</td>
          <td class="px-3 py-2 text-gray-600">${escapeHtml(observation)}</td>
        </tr>`;
      })
      .join("");
    const proofSource = movementProofSource(movement);
    const proofAction = historyProofViewAction(movement);
    const proofHtml = proofSource && movementHasProof(movement)
      ? `<div class="rounded-xl border border-success-100 bg-success-50 p-3 text-sm text-success-700">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 font-bold"><i data-lucide="paperclip" class="h-4 w-4 shrink-0"></i><span class="truncate">${escapeHtml(proofSource.proofFileName ?? "Piece jointe")}</span></div>
              <div class="mt-1 text-xs text-success-700/80">${escapeHtml(proofSource.proofUploadedAt ? "Ajoutee le " + formatDate(proofSource.proofUploadedAt) : "Piece justificative rattachee")}</div>
            </div>
            ${proofAction ? `<button type="button" data-action="${proofAction}" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-success-200 bg-white px-3 py-2 text-xs font-bold text-success-700 hover:bg-success-50"><i data-lucide="eye" class="h-4 w-4"></i>Voir la preuve</button>` : ""}
          </div>
        </div>`
      : movementProofStatus(movement) === "non-requise"
        ? `<div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-600">Preuve signee non requise pour ce type de mouvement.</div>`
        : `<div class="rounded-xl border border-warning-100 bg-warning-50 p-3 text-sm font-semibold text-warning-700">Aucune piece justificative rattachee a ce mouvement.</div>`;
    histEl.innerHTML = `
      <div class="space-y-4">
        <div class="overflow-hidden rounded-xl border border-gray-200">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs uppercase text-gray-500"><tr><th class="px-3 py-2 text-left">Article</th><th class="px-3 py-2 text-right">Quantite</th><th class="px-3 py-2 text-left">Observation</th></tr></thead>
            <tbody class="divide-y">${lineRows || `<tr><td colspan="3" class="px-3 py-6 text-center text-gray-500">Aucune ligne article.</td></tr>`}</tbody>
          </table>
        </div>
        ${proofHtml}
      </div>
    `;
  }
  window.lucide?.createIcons();
}

export function filteredHistoryPage(root: HTMLElement, ctx: HistoriqueContext) {
  return withContext(ctx, () => filteredHistory(root));
}

export function renderHistoryPage(root: HTMLElement, ctx: HistoriqueContext) {
  return withContext(ctx, () => renderHistory(root));
}

export function setHistoryProofFilterPage(root: HTMLElement, filter: "ALL" | "MISSING", ctx: HistoriqueContext) {
  return withContext(ctx, () => {
    historyProofFilter = historyProofFilter === filter ? "ALL" : filter;
    renderHistory(root);
  });
}

export function historyMovementActorLabelPage(movement: StockMovement, ctx: HistoriqueContext) {
  return withContext(ctx, () => historyMovementActorLabel(movement));
}

export function openHistoryMovementDrawerPage(root: HTMLElement, id: string, ctx: HistoriqueContext) {
  return withContext(ctx, () => openHistoryMovementDrawer(root, id));
}

export function renderHistoryMovementDrawerPage(root: HTMLElement, ctx: HistoriqueContext) {
  return withContext(ctx, () => renderHistoryMovementDrawer(root));
}

export function clearHistoryMovementDrawerPage() {
  openHistoryMovementId = null;
}

export function hasOpenHistoryMovementDrawerPage() {
  return Boolean(openHistoryMovementId);
}
