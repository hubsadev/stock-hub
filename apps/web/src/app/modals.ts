import { setVisible } from "../utils/dom";

export type ModalControllerContext = {
  prepareStockExportModal: (root: HTMLElement) => void;
  prepareInventoryExportModal: (root: HTMLElement) => void;
  resetReferentialImport: (root: HTMLElement) => void;
  resetInventoryImport: (root: HTMLElement) => void;
  prepareUserModal: (root: HTMLElement) => void;
  updateReferentialForm: (root: HTMLElement, type: string) => void;
  populateQuickArticleModal: (root: HTMLElement) => Promise<unknown> | unknown;
  populateEntryModal: (root: HTMLElement) => Promise<unknown> | unknown;
  setMaterialRequestMode: (root: HTMLElement, mode: "create" | "prepare") => void;
  populateExitModals: (
    root: HTMLElement,
    modalId: "exitModal" | "directExitModal",
  ) => Promise<unknown> | unknown;
  populateReturnTransferModals: (
    root: HTMLElement,
    modalId: "returnModal" | "transferModal",
  ) => Promise<unknown> | unknown;
  populateEquipmentModal: (root: HTMLElement) => Promise<unknown> | unknown;
  populateEquipmentCreateModal: (root: HTMLElement) => Promise<unknown> | unknown;
};

export function openModalPage(
  root: HTMLElement,
  id: string,
  context: ModalControllerContext,
) {
  setVisible(root.querySelector(`#${CSS.escape(id)}`), true);
  if (id === "stockExportModal") {
    context.prepareStockExportModal(root);
  }
  if (id === "inventoryExportModal") {
    context.prepareInventoryExportModal(root);
  }
  if (id === "importModal") {
    context.resetReferentialImport(root);
  }
  if (id === "inventoryImportModal") {
    context.resetInventoryImport(root);
  }
  if (id === "userModal") {
    context.prepareUserModal(root);
  }
  if (id === "referentialModal") {
    context.updateReferentialForm(
      root,
      root.querySelector<HTMLSelectElement>("#referentialType")?.value ?? "",
    );
  }
  if (id === "articleModal") {
    void context.populateQuickArticleModal(root);
  }
  if (id === "entryModal") {
    void context.populateEntryModal(root);
  }
  if (id === "exitModal" || id === "directExitModal") {
    if (id === "exitModal") context.setMaterialRequestMode(root, "create");
    void context.populateExitModals(root, id);
  }
  if (id === "returnModal" || id === "transferModal") {
    void context.populateReturnTransferModals(root, id);
  }
  if (id === "equipmentModal") {
    void context.populateEquipmentModal(root);
  }
  if (id === "equipmentCreateModal") {
    void context.populateEquipmentCreateModal(root);
  }
  window.lucide?.createIcons();
}

export function closeModalPage(root: HTMLElement, id: string) {
  setVisible(root.querySelector(`#${CSS.escape(id)}`), false);
}

export function prepareTemplateActionsPage(root: HTMLElement) {
  root
    .querySelectorAll<HTMLButtonElement>("#referentialModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Creer element")
      ) {
        button.dataset.action = "submitReferential";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#entryModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Enregistrer entree")
      ) {
        button.dataset.action = "submitStockEntry";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#exitModal button")
    .forEach((button) => {
      if (button.textContent?.trim().includes("Soumettre demande")) {
        button.dataset.action = "submitExitRequest";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#directExitModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Valider sortie")
      ) {
        button.dataset.action = "submitDirectExit";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#returnModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Enregistrer retour")
      ) {
        button.dataset.action = "submitStockReturn";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#transferModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Enregistrer transfert")
      ) {
        button.dataset.action = "submitStockTransfer";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#countModal button")
    .forEach((button) => {
      if (button.textContent?.trim().includes("Enregistrer comptage")) {
        button.dataset.action = "submitInventoryCount";
      }
    });
  root
    .querySelectorAll<HTMLButtonElement>("#equipmentModal button")
    .forEach((button) => {
      if (
        !button.dataset.action &&
        button.textContent?.trim().includes("Affecter")
      ) {
        button.dataset.action = "submitEquipmentAssignment";
      }
    });
}
