import type { Vehicle } from "../../api";
import { escapeHtml, formatDate, formatNumber, isToday } from "../../utils/format";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type ParcAutoContext = {
  latestVehicles: Vehicle[];
  setLatestVehicles: (vehicles: Vehicle[]) => void;
  badge: (label: string, tone: BadgeTone) => string;
  emptyRow: (colspan: number, message: string) => string;
  option: (value: string, label: string) => string;
  showToast: (root: HTMLElement, message: string, type?: "success" | "error") => void;
  openModal: (root: HTMLElement, id: string) => void;
  closeModal: (root: HTMLElement, id: string) => void;
  updateApiBackedViews: (root: HTMLElement) => void;
  createVehicle: (payload: Parameters<typeof import("../../api").createVehicle>[0]) => Promise<Vehicle>;
  updateVehicle: (id: string, payload: Parameters<typeof import("../../api").updateVehicle>[1]) => Promise<Vehicle>;
};

let latestVehicles: Vehicle[] = [];
let currentVehicleFilter = "ALL";
let selectedVehicleId: string | null = null;
let activeCtx: ParcAutoContext | null = null;

function syncFrom(ctx: ParcAutoContext) {
  activeCtx = ctx;
  latestVehicles = ctx.latestVehicles;
}

function syncTo() {
  if (!activeCtx) return;
  activeCtx.setLatestVehicles(latestVehicles);
}

function withContext<T>(ctx: ParcAutoContext, callback: () => T): T {
  syncFrom(ctx);
  try {
    return callback();
  } finally {
    syncTo();
  }
}

async function withContextAsync<T>(ctx: ParcAutoContext, callback: () => Promise<T>): Promise<T> {
  syncFrom(ctx);
  try {
    return await callback();
  } finally {
    syncTo();
  }
}

function requireCtx() {
  if (!activeCtx) throw new Error("Parc auto context is not initialized.");
  return activeCtx;
}

function badge(label: string, tone: BadgeTone) { return requireCtx().badge(label, tone); }
function emptyRow(colspan: number, message: string) { return requireCtx().emptyRow(colspan, message); }
function option(value: string, label: string) { return requireCtx().option(value, label); }
function showToast(root: HTMLElement, message: string, type?: "success" | "error") { return requireCtx().showToast(root, message, type); }
function openModal(root: HTMLElement, id: string) { return requireCtx().openModal(root, id); }
function closeModal(root: HTMLElement, id: string) { return requireCtx().closeModal(root, id); }
function updateApiBackedViews(root: HTMLElement) { return requireCtx().updateApiBackedViews(root); }
function createVehicle(payload: Parameters<ParcAutoContext["createVehicle"]>[0]) { return requireCtx().createVehicle(payload); }
function updateVehicle(id: string, payload: Parameters<ParcAutoContext["updateVehicle"]>[1]) { return requireCtx().updateVehicle(id, payload); }
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
export function renderVehiclesPage(root: HTMLElement, ctx: ParcAutoContext, vehicles?: Vehicle[]) {
  return withContext(ctx, () => renderVehicles(root, vehicles));
}

export function setVehicleFilterPage(root: HTMLElement, filter: string, ctx: ParcAutoContext) {
  return withContext(ctx, () => {
    currentVehicleFilter = filter;
    renderVehicles(root);
  });
}

export function prepareVehicleModalPage(root: HTMLElement, ctx: ParcAutoContext) {
  return withContext(ctx, () => prepareVehicleModal(root));
}

export function submitVehiclePage(root: HTMLElement, ctx: ParcAutoContext) {
  return withContextAsync(ctx, () => submitVehicle(root));
}

export function renderVehicleDetailPage(root: HTMLElement, id: string, editing: boolean, ctx: ParcAutoContext, focusField?: string) {
  return withContext(ctx, () => renderVehicleDetail(root, id, editing, focusField));
}

export function openVehicleDetailPage(root: HTMLElement, id: string, ctx: ParcAutoContext) {
  return withContext(ctx, () => openVehicleDetail(root, id));
}

export function editVehicleDetailPage(root: HTMLElement, ctx: ParcAutoContext) {
  return withContext(ctx, () => editVehicleDetail(root));
}

export function changeVehicleDriverPage(root: HTMLElement, ctx: ParcAutoContext) {
  return withContext(ctx, () => changeVehicleDriver(root));
}

export function cancelVehicleEditPage(root: HTMLElement, ctx: ParcAutoContext) {
  return withContext(ctx, () => cancelVehicleEdit(root));
}

export function setVehicleMaintenancePage(root: HTMLElement, ctx: ParcAutoContext) {
  return withContextAsync(ctx, () => setVehicleMaintenance(root));
}

export function toggleVehicleHistoryPage(root: HTMLElement, ctx: ParcAutoContext) {
  return withContext(ctx, () => toggleVehicleHistory(root));
}

export function openVehicleEditPage(root: HTMLElement, ctx: ParcAutoContext, focusDriver = false) {
  return withContextAsync(ctx, () => openVehicleEdit(root, focusDriver));
}

export function submitVehicleEditPage(root: HTMLElement, ctx: ParcAutoContext) {
  return withContextAsync(ctx, () => submitVehicleEdit(root));
}
