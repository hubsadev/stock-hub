import type { Article, Equipment, StockLocation, StockUser, Supplier } from "../../api";
import { selectedText } from "../../utils/dom";
import { escapeHtml, formatDate } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type EquipementsContext = {
  latestEquipments: Equipment[];
  setLatestEquipments: (equipments: Equipment[]) => void;
  latestArticles: Article[];
  setLatestArticles: (articles: Article[]) => void;
  latestLocations: StockLocation[];
  setLatestLocations: (locations: StockLocation[]) => void;
  latestSuppliers: Supplier[];
  setLatestSuppliers: (suppliers: Supplier[]) => void;
  badge: (label: string, tone: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  option: (value: string, label: string) => string;
  userOptions: (users: StockUser[]) => string;
  locationOptions: (locations: StockLocation[]) => string;
  showToast: (root: HTMLElement, message: string, type?: "success" | "error") => void;
  openModal: (root: HTMLElement, id: string) => void;
  closeModal: (root: HTMLElement, id: string) => void;
  updateApiBackedViews: (root: HTMLElement) => void;
  getArticles: () => Promise<Article[]>;
  getLocations: () => Promise<StockLocation[]>;
  getSuppliers: () => Promise<Supplier[]>;
  getEquipments: () => Promise<Equipment[]>;
  getUsers: () => Promise<StockUser[]>;
  createEquipment: (payload: Parameters<typeof import("../../api").createEquipment>[0]) => Promise<Equipment>;
  updateEquipment: (id: string, payload: Parameters<typeof import("../../api").updateEquipment>[1]) => Promise<Equipment>;
  unassignEquipment: (id: string) => Promise<Equipment>;
};

let latestEquipments: Equipment[] = [];
let latestArticles: Article[] = [];
let latestLocations: StockLocation[] = [];
let latestSuppliers: Supplier[] = [];
let selectedEquipmentId: string | null = null;
let activeCtx: EquipementsContext | null = null;

function syncFrom(ctx: EquipementsContext) {
  activeCtx = ctx;
  latestEquipments = ctx.latestEquipments;
  latestArticles = ctx.latestArticles;
  latestLocations = ctx.latestLocations;
  latestSuppliers = ctx.latestSuppliers;
}

function syncTo() {
  if (!activeCtx) return;
  activeCtx.setLatestEquipments(latestEquipments);
  activeCtx.setLatestArticles(latestArticles);
  activeCtx.setLatestLocations(latestLocations);
  activeCtx.setLatestSuppliers(latestSuppliers);
}

function withContext<T>(ctx: EquipementsContext, callback: () => T): T {
  syncFrom(ctx);
  try {
    return callback();
  } finally {
    syncTo();
  }
}

async function withContextAsync<T>(ctx: EquipementsContext, callback: () => Promise<T>): Promise<T> {
  syncFrom(ctx);
  try {
    return await callback();
  } finally {
    syncTo();
  }
}

function requireCtx() {
  if (!activeCtx) throw new Error("Equipements context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone: BadgeTone) { return requireCtx().badge(label, tone); }
function emptyRow(colspan: number, message: string) { return requireCtx().emptyRow(colspan, message); }
function option(value: string, label: string) { return requireCtx().option(value, label); }
function userOptions(users: StockUser[]) { return requireCtx().userOptions(users); }
function locationOptions(locations: StockLocation[]) { return requireCtx().locationOptions(locations); }
function showToast(root: HTMLElement, message: string, type?: "success" | "error") { return requireCtx().showToast(root, message, type); }
function openModal(root: HTMLElement, id: string) { return requireCtx().openModal(root, id); }
function closeModal(root: HTMLElement, id: string) { return requireCtx().closeModal(root, id); }
function updateApiBackedViews(root: HTMLElement) { return requireCtx().updateApiBackedViews(root); }
function getArticles() { return requireCtx().getArticles(); }
function getLocations() { return requireCtx().getLocations(); }
function getSuppliers() { return requireCtx().getSuppliers(); }
function getEquipments() { return requireCtx().getEquipments(); }
function getUsers() { return requireCtx().getUsers(); }
function createEquipment(payload: Parameters<EquipementsContext["createEquipment"]>[0]) { return requireCtx().createEquipment(payload); }
function updateEquipment(id: string, payload: Parameters<EquipementsContext["updateEquipment"]>[1]) { return requireCtx().updateEquipment(id, payload); }
function unassignEquipment(id: string) { return requireCtx().unassignEquipment(id); }

function renderEquipmentsRegistry(root: HTMLElement, equipments: Equipment[] = latestEquipments) {
  latestEquipments = equipments;
  const body = root.querySelector<HTMLElement>("#equipments-table tbody");
  if (body)
    body.innerHTML = equipments.length
      ? equipments.map(equipmentRow).join("")
      : emptyRow(8, "Aucun equipement individuel en base pour le moment.");
  window.lucide?.createIcons();
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
export function renderEquipmentsRegistryPage(root: HTMLElement, ctx: EquipementsContext, equipments?: Equipment[]) {
  return withContext(ctx, () => renderEquipmentsRegistry(root, equipments));
}

export function renderEquipmentDetailPage(root: HTMLElement, id: string, editing: boolean, ctx: EquipementsContext) {
  return withContextAsync(ctx, () => renderEquipmentDetail(root, id, editing));
}

export function openEquipmentDetailPage(root: HTMLElement, id: string, ctx: EquipementsContext) {
  return withContext(ctx, () => openEquipmentDetail(root, id));
}

export function editEquipmentDetailPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContext(ctx, () => editEquipmentDetail(root));
}

export function cancelEquipmentEditPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContext(ctx, () => cancelEquipmentEdit(root));
}

export function openEquipmentEditPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContextAsync(ctx, () => openEquipmentEdit(root));
}

export function submitEquipmentEditPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContextAsync(ctx, () => submitEquipmentEdit(root));
}

export function unassignSelectedEquipmentPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContextAsync(ctx, () => unassignSelectedEquipment(root));
}

export function populateEquipmentModalPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContextAsync(ctx, () => populateEquipmentModal(root));
}

export function populateEquipmentCreateModalPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContextAsync(ctx, () => populateEquipmentCreateModal(root));
}

export function submitEquipmentCreationPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContextAsync(ctx, () => submitEquipmentCreation(root));
}

export function submitEquipmentAssignmentPage(root: HTMLElement, ctx: EquipementsContext) {
  return withContextAsync(ctx, () => submitEquipmentAssignment(root));
}
