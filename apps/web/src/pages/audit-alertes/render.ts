import type { AuditAlert, AuditLog, StockUser } from "../../api";
import { setText } from "../../utils/dom";
import { escapeHtml, formatDate, formatNumber } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type AuditAlertesContext = {
  latestAuditAlerts: AuditAlert[];
  latestAuditLogs: AuditLog[];
  latestUsers: StockUser[];
  badge: (label: string, tone?: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  detailCard: (label: string, value: unknown, tone?: "gray" | "success" | "accent") => string;
  actionEyeFor: (action: string) => string;
  option: (value: string, label: string, selected?: boolean) => string;
  openModal: (root: HTMLElement, id: string) => void;
  showToast: (root: HTMLElement, message: string, type?: "success" | "error") => void;
  articleImportKey: (value: unknown) => string;
};

let latestAuditAlerts: AuditAlert[] = [];
let latestAuditLogs: AuditLog[] = [];
let latestUsers: StockUser[] = [];
let currentAuditAlertFilter = "ALL";
let collapsedAuditLogDays = new Set<string>();
let initializedAuditLogDays = new Set<string>();
let activeCtx: AuditAlertesContext | null = null;

function syncFrom(ctx: AuditAlertesContext) {
  activeCtx = ctx;
  latestAuditAlerts = ctx.latestAuditAlerts;
  latestAuditLogs = ctx.latestAuditLogs;
  latestUsers = ctx.latestUsers;
}

function withContext<T>(ctx: AuditAlertesContext, callback: () => T): T {
  syncFrom(ctx);
  return callback();
}

function requireCtx() {
  if (!activeCtx) throw new Error("Audit alertes context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone?: BadgeTone) { return requireCtx().badge(label, tone); }
function emptyRow(colspan: number, message: string) { return requireCtx().emptyRow(colspan, message); }
function detailCard(label: string, value: unknown, tone?: "gray" | "success" | "accent") { return requireCtx().detailCard(label, value, tone); }
function actionEyeFor(action: string) { return requireCtx().actionEyeFor(action); }
function option(value: string, label: string, selected?: boolean) { return requireCtx().option(value, label, selected); }
function openModal(root: HTMLElement, id: string) { return requireCtx().openModal(root, id); }
function showToast(root: HTMLElement, message: string, type?: "success" | "error") { return requireCtx().showToast(root, message, type); }
function articleImportKey(value: unknown) { return requireCtx().articleImportKey(value); }

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

export function setAuditAlertFilterPage(filter: string, ctx: AuditAlertesContext) { return withContext(ctx, () => { currentAuditAlertFilter = filter; }); }
export function renderAuditAlertsPage(root: HTMLElement, ctx: AuditAlertesContext) { return withContext(ctx, () => renderAuditAlerts(root)); }
export function renderAuditLogsPage(root: HTMLElement, ctx: AuditAlertesContext) { return withContext(ctx, () => renderAuditLogs(root)); }
export function showAuditTabPage(root: HTMLElement, tab: string, button: HTMLElement | undefined, ctx: AuditAlertesContext) { return withContext(ctx, () => showAuditTab(root, tab, button)); }
export function setAuditLogDateRangePage(root: HTMLElement, range: string, ctx: AuditAlertesContext) { return withContext(ctx, () => setAuditLogDateRange(root, range)); }
export function toggleAuditLogDayPage(root: HTMLElement, dayKey: string, ctx: AuditAlertesContext) { return withContext(ctx, () => toggleAuditLogDay(root, dayKey)); }
export function openAuditAlertDetailPage(root: HTMLElement, id: string, ctx: AuditAlertesContext) { return withContext(ctx, () => openAuditAlertDetail(root, id)); }
export function openAuditLogDetailPage(root: HTMLElement, id: string, ctx: AuditAlertesContext) { return withContext(ctx, () => openAuditLogDetail(root, id)); }
export function setAuditCardValuePage(root: HTMLElement, label: string, value: number | string, ctx: AuditAlertesContext) { return withContext(ctx, () => setAuditCardValue(root, label, value)); }
export function auditAlertDomainPage(alert: AuditAlert, ctx: AuditAlertesContext) { return withContext(ctx, () => auditAlertDomain(alert)); }
export function auditLogUserLabelPage(log: AuditLog, ctx: AuditAlertesContext) { return withContext(ctx, () => auditLogUserLabel(log)); }
export function auditActionLabelPage(action: string, ctx: AuditAlertesContext) { return withContext(ctx, () => auditActionLabel(action)); }
export function auditDocumentLabelPage(log: AuditLog, ctx: AuditAlertesContext) { return withContext(ctx, () => auditDocumentLabel(log)); }
export function auditLogResultPage(log: AuditLog, ctx: AuditAlertesContext) { return withContext(ctx, () => auditLogResult(log)); }
export function auditLogResultLabelPage(result: string, ctx: AuditAlertesContext) { return withContext(ctx, () => auditLogResultLabel(result)); }
