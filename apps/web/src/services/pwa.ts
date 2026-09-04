import type { BeforeInstallPromptEvent } from "../types/browser";
import { isOnline } from "../utils/dom";

export type PwaContext = {
  showToast: (
    root: HTMLElement,
    message: string,
    tone?: "success" | "error",
  ) => void;
};

let deferredPwaInstallPrompt: BeforeInstallPromptEvent | null = null;
let pwaServiceWorkerRegistered = false;

export function updatePwaInstallButton(root: HTMLElement) {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const visible = import.meta.env.PROD && Boolean(deferredPwaInstallPrompt) && !standalone;
  root.querySelectorAll<HTMLElement>("[data-profile-pwa-install]").forEach((button) => {
    button.classList.toggle("hidden", !visible);
    button.classList.toggle("inline-flex", visible);
  });
  updateProfilePwaCards(root);
}

export function updateNetworkStatus(root: HTMLElement) {
  const banner = root.querySelector<HTMLElement>("#networkStatusBanner");
  if (banner) banner.classList.toggle("hidden", isOnline());
  updatePwaInstallButton(root);
}

export async function installPwa(root: HTMLElement, context: PwaContext) {
  if (!deferredPwaInstallPrompt) {
    context.showToast(root, "Installation indisponible sur ce navigateur pour le moment.", "error");
    return;
  }
  const prompt = deferredPwaInstallPrompt;
  deferredPwaInstallPrompt = null;
  updatePwaInstallButton(root);
  await prompt.prompt();
  const choice = await prompt.userChoice;
  if (choice.outcome === "accepted") {
    context.showToast(root, "Stock Hub est pret a etre lance comme application.");
  }
}

export function offlineActionLabel(type: string) {
  const labels: Record<string, string> = {
    "import-articles": "importer le referentiel",
    "import-inventory-rows": "importer l'inventaire",
    "submit-referential": "enregistrer le referentiel",
    "submit-quick-article": "creer un article",
    "submit-referential-edit": "modifier le referentiel",
    "deactivate-referential-detail": "desactiver un element",
    "submit-stock-entry": "enregistrer une entree stock",
    "upload-signed-entry-proof": "joindre une preuve d'entree",
    "submit-entry-resolution": "resoudre une entree",
    "submit-exit-request": "creer une demande materiel",
    "submit-material-request-preparation": "preparer une demande",
    "submit-direct-exit": "enregistrer une sortie",
    "submit-stock-return": "enregistrer un retour",
    "submit-return-control": "controler un retour",
    "submit-stock-transfer": "enregistrer un transfert",
    "submit-inventory-count": "enregistrer un inventaire",
    "submit-equipment-assignment": "affecter un equipement",
    "submit-equipment-creation": "creer un equipement",
    "submit-equipment-edit": "modifier un equipement",
    "unassign-equipment": "retirer une affectation",
    "submit-vehicle": "enregistrer un vehicule",
    "submit-vehicle-edit": "modifier un vehicule",
    "submit-user": "enregistrer un utilisateur",
    "submit-profile": "enregistrer le profil",
    "submit-password-change": "changer le mot de passe",
    "submit-exit-request-rejection": "refuser une demande",
  };
  return labels[type] ?? "";
}

export function requireOnlineAction(
  root: HTMLElement,
  type: string,
  context: PwaContext,
) {
  const label = offlineActionLabel(type);
  if (!label || isOnline()) return true;
  context.showToast(
    root,
    `Connexion requise pour ${label}. Le mode hors ligne est limite a la consultation.`,
    "error",
  );
  return false;
}

export function cleanupDevelopmentPwa() {
  if (!import.meta.env.DEV) return;
  deferredPwaInstallPrompt = null;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations
            .filter((registration) => registration.active?.scriptURL.includes("/sw.js"))
            .map((registration) => registration.unregister()),
        ),
      )
      .catch(() => undefined);
  }

  if ("caches" in window) {
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("stock-hub-shell-") || key.startsWith("stock-hub-cdn-"))
            .map((key) => caches.delete(key)),
        ),
      )
      .catch(() => undefined);
  }
}

export function setupPwa(root: HTMLElement, context: PwaContext) {
  cleanupDevelopmentPwa();

  const registerServiceWorker = () => {
    if (!import.meta.env.PROD) return;
    const alreadyControlled = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        pwaServiceWorkerRegistered = true;
        registration.update().catch(() => undefined);
        if (!alreadyControlled) {
          context.showToast(root, "Stock Hub peut maintenant se lancer hors ligne.");
        }
      })
      .catch(() => undefined);
  };

  if (import.meta.env.PROD && "serviceWorker" in navigator && !pwaServiceWorkerRegistered) {
    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker, { once: true });
    }
  }

  const onBeforeInstallPrompt = (event: Event) => {
    if (!import.meta.env.PROD) return;
    event.preventDefault();
    deferredPwaInstallPrompt = event as BeforeInstallPromptEvent;
    updatePwaInstallButton(root);
  };
  const onAppInstalled = () => {
    deferredPwaInstallPrompt = null;
    updatePwaInstallButton(root);
    context.showToast(root, "Stock Hub est installe.");
  };
  const onNetworkChange = () => updateNetworkStatus(root);

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
  window.addEventListener("online", onNetworkChange);
  window.addEventListener("offline", onNetworkChange);
  updateNetworkStatus(root);

  return () => {
    window.removeEventListener("load", registerServiceWorker);
    window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.removeEventListener("appinstalled", onAppInstalled);
    window.removeEventListener("online", onNetworkChange);
    window.removeEventListener("offline", onNetworkChange);
  };
}

export function updateProfilePwaCards(root: HTMLElement) {
  const available = root.querySelector<HTMLElement>("#profilePwaAvailableCard");
  const dev = root.querySelector<HTMLElement>("#profilePwaDevCard");
  const installed = root.querySelector<HTMLElement>("#profilePwaInstalledCard");
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  available?.classList.toggle(
    "hidden",
    !import.meta.env.PROD || standalone || !deferredPwaInstallPrompt,
  );
  dev?.classList.toggle("hidden", !import.meta.env.DEV);
  installed?.classList.toggle("hidden", !import.meta.env.PROD || !standalone);
}
