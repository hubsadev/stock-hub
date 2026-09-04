import type { StockUser } from "../../api";
import type { HeaderAction } from "../../types/ui";

export type ViewActionsContext = {
  currentUser: StockUser | null;
  hasRole: (role: string) => boolean;
};

export function clearActiveNav(root: HTMLElement) {
  root.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.remove("bg-accent-50", "text-accent-600");
    button.classList.add("text-gray-600", "hover:bg-gray-100");
  });
}

export function activateNavButton(button: HTMLElement) {
  button.classList.add("bg-accent-50", "text-accent-600");
  button.classList.remove("text-gray-600", "hover:bg-gray-100");
}

export function renderHeaderButton(action: {
  label: string;
  icon: string;
  modal?: string;
  action?: string;
  variant: "primary" | "secondary";
}) {
  const classes =
    action.variant === "primary"
      ? "px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-semibold hover:bg-accent-500 flex items-center gap-2"
      : "px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2";
  const dataAction = action.action
    ? ` data-action="${action.action}"`
    : action.modal
      ? ` data-action="openModal('${action.modal}')"`
      : "";
  return `<button class="${classes}"${dataAction}><i data-lucide="${action.icon}" class="w-4 h-4"></i>${action.label}</button>`;
}

export function canUseHeaderAction(
  view: string,
  action: HeaderAction,
  context: ViewActionsContext,
) {
  if (!context.currentUser) return false;
  if (context.hasRole("ADMIN_STOCK")) return true;
  if (action.action?.startsWith("exportData"))
    return (
      context.hasRole("DIRECTION") ||
      context.hasRole("AUDIT") ||
      context.hasRole("GESTIONNAIRE_STOCK")
    );
  if (action.modal === "stockExportModal")
    return (
      context.hasRole("DIRECTION") ||
      context.hasRole("AUDIT") ||
      context.hasRole("GESTIONNAIRE_STOCK")
    );
  if (action.modal === "importModal" || action.modal === "inventoryImportModal")
    return context.hasRole("GESTIONNAIRE_STOCK");
  if (view === "referentiels") return context.hasRole("GESTIONNAIRE_STOCK");
  if (view === "entrees") return context.hasRole("GESTIONNAIRE_STOCK");
  if (view === "sortie" && action.modal === "directExitModal")
    return context.hasRole("GESTIONNAIRE_STOCK");
  if (view === "sortie" && action.modal === "exitModal")
    return context.hasRole("GESTIONNAIRE_STOCK") || context.hasRole("CHEF_PROJET");
  if (view === "retours") return context.hasRole("GESTIONNAIRE_STOCK");
  if (view === "inventaire")
    return context.hasRole("GESTIONNAIRE_STOCK") || context.hasRole("AUDIT");
  if (view === "equipements")
    return context.hasRole("GESTIONNAIRE_STOCK") || context.hasRole("RH");
  if (view === "parcAuto")
    return context.hasRole("GESTIONNAIRE_STOCK") || context.hasRole("RH");
  return false;
}

export function setViewActions(
  root: HTMLElement,
  view: string,
  context: ViewActionsContext,
) {
  const actions = root.querySelector<HTMLElement>("#viewActions");
  if (!actions) return;
  const actionByView: Record<string, HeaderAction[]> = {
    home: [
      {
        label: "Importer Excel",
        icon: "upload",
        modal: "importModal",
        variant: "secondary",
      },
    ],
    entrees: [
      {
        label: "Importer Excel",
        icon: "upload",
        modal: "importModal",
        variant: "secondary",
      },
      {
        label: "Nouvelle entree",
        icon: "plus",
        modal: "entryModal",
        variant: "primary",
      },
    ],
    referentiels: [
      {
        label: "Importer Excel",
        icon: "upload",
        modal: "importModal",
        variant: "secondary",
      },
      {
        label: "Nouvel element",
        icon: "plus",
        modal: "referentialModal",
        variant: "primary",
      },
    ],
    stock: [
      {
        label: "Telecharger",
        icon: "download",
        modal: "stockExportModal",
        variant: "secondary",
      },
    ],
    sortie: [
      {
        label: "Nouvelle sortie",
        icon: "package-minus",
        modal: "directExitModal",
        variant: "secondary",
      },
      {
        label: "Nouvelle demande",
        icon: "plus",
        modal: "exitModal",
        variant: "primary",
      },
    ],
    retours: [
      {
        label: "Nouveau transfert",
        icon: "shuffle",
        modal: "transferModal",
        variant: "secondary",
      },
      {
        label: "Nouveau retour",
        icon: "rotate-ccw",
        modal: "returnModal",
        variant: "primary",
      },
    ],
    reappro: [
      {
        label: "Exporter liste",
        icon: "download",
        action: "exportData('reappro')",
        variant: "secondary",
      },
    ],
    inventaire: [
      {
        label: "Importer Excel",
        icon: "upload",
        modal: "inventoryImportModal",
        variant: "secondary",
      },
    ],
    equipements: [
      {
        label: "Affecter equipement",
        icon: "plus",
        modal: "equipmentModal",
        variant: "primary",
      },
    ],
    parcAuto: [
      {
        label: "Nouveau vehicule",
        icon: "plus",
        modal: "vehicleModal",
        variant: "primary",
      },
    ],
    audit: [],
    users: [
      {
        label: "Nouvel utilisateur",
        icon: "user-plus",
        modal: "userModal",
        variant: "primary",
      },
    ],
    historique: [],
  };
  actions.innerHTML = (actionByView[view] ?? [])
    .filter((action) => canUseHeaderAction(view, action, context))
    .map(renderHeaderButton)
    .join("");
}
