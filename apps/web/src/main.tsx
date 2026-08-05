import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { StockHubShell } from "./components/StockHubShell";
import { getArticles, getDashboardSummary, getStockLevels, getUsers, type Article, type StockLevel, type StockUser } from "./api";
import "./template.css";

declare global {
  interface Window {
    lucide?: { createIcons: () => void };
  }
}

function setVisible(element: Element | null, visible: boolean) {
  if (!element) return;
  element.classList.toggle("active", visible);
  element.classList.toggle("show", visible);
}


function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "0";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat("fr-FR").format(parsed);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function badge(label: string, tone: "success" | "warning" | "error" | "gray" | "accent" = "gray") {
  const classes = {
    success: "bg-success-50 text-success-700",
    warning: "bg-warning-50 text-warning-700",
    error: "bg-error-50 text-error-700",
    gray: "bg-gray-100 text-gray-700",
    accent: "bg-accent-50 text-accent-600"
  }[tone];
  return `<span class="px-2 py-1 rounded-full ${classes} text-xs font-bold">${escapeHtml(label)}</span>`;
}

function setCardValue(root: HTMLElement, label: string, value: number | string) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>("#home .bg-white.rounded-xl"));
  const card = cards.find((element) => element.textContent?.includes(label));
  const number = card?.querySelector<HTMLElement>(".text-3xl");
  if (number) number.textContent = formatNumber(value);
}

function updateDashboard(root: HTMLElement) {
  getDashboardSummary()
    .then((summary) => {
      setCardValue(root, "Articles actifs", summary.articles);
      setCardValue(root, "Ruptures", summary.ruptures);
      setCardValue(root, "Equipements affectes", summary.equipmentAssigned);
      setCardValue(root, "Mouvements du jour", summary.movementsToday);
      window.lucide?.createIcons();
    })
    .catch(() => {
      // La maquette reste visible si l'API locale n'est pas lancee.
    });
}

function articleRow(article: Article) {
  const tracking = article.trackingMode === "INDIVIDUAL" ? "Suivi individuel" : "Article en quantite";
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(article.code)}</td><td class="px-5 py-4">${escapeHtml(article.designation)}</td><td class="px-5 py-4">${escapeHtml(article.category)}</td><td class="px-5 py-4">${escapeHtml(article.unit)}</td><td class="px-5 py-4">${badge(tracking)}</td><td class="px-5 py-4 text-gray-500">A definir</td><td class="px-5 py-4 text-right">${formatNumber(article.minimumStock)}</td><td class="px-5 py-4 text-right">${formatNumber(article.referencePrice)}</td><td class="px-5 py-4">${badge(article.active ? "Actif" : "Inactif", article.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><button data-action="openModal('referentialDetailModal')" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600 hover:bg-accent-50" title="Voir la fiche"><i data-lucide="eye" class="w-4 h-4"></i></button></td></tr>`;
}

function stockStatus(level: StockLevel) {
  if (level.quantity <= 0) return badge("Rupture", "error");
  if (level.quantity <= level.article.minimumStock) return badge("Rupture proche", "warning");
  return badge("Disponible", "success");
}

function stockRow(level: StockLevel) {
  return `<tr><td class="px-5 py-4 font-bold">${escapeHtml(level.article.designation)}</td><td class="px-5 py-4">${escapeHtml(level.article.category)}</td><td class="px-5 py-4">${escapeHtml(level.location.name)}</td><td class="px-5 py-4 text-right text-gray-400">-</td><td class="px-5 py-4 text-right text-gray-400">-</td><td class="px-5 py-4 text-right text-gray-400">-</td><td class="px-5 py-4 text-right font-bold">${formatNumber(level.quantity)}</td><td class="px-5 py-4">${stockStatus(level)}</td></tr>`;
}

function roleLabel(role: string) {
  return ({
    ADMIN_STOCK: "Admin Stock",
    GESTIONNAIRE_STOCK: "Gestionnaire",
    AUDIT: "Audit",
    RH: "RH",
    DIRECTION: "Direction",
    CHEF_PROJET: "Chef projet"
  } as Record<string, string>)[role] ?? role;
}

function accessLabel(roles: string[]) {
  if (roles.includes("ADMIN_STOCK")) return "Tous modules";
  if (roles.includes("GESTIONNAIRE_STOCK")) return "Entrees, sorties, retours";
  if (roles.includes("AUDIT")) return "Inventaire, alertes, exports";
  if (roles.includes("DIRECTION")) return "KPI et controles";
  if (roles.includes("CHEF_PROJET")) return "Demandes, stock consulte";
  if (roles.includes("RH")) return "Consultation inventaire";
  return "Acces limite";
}

function userRow(user: StockUser) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const role = user.roles[0] ?? "GESTIONNAIRE_STOCK";
  return `<tr><td class="px-5 py-4"><div class="font-bold">${escapeHtml(fullName)}</div><div class="text-xs text-gray-500">${escapeHtml(user.roles.map(roleLabel).join(", "))}</div></td><td class="px-5 py-4">${escapeHtml(user.email)}</td><td class="px-5 py-4">${badge(roleLabel(role), role === "ADMIN_STOCK" ? "accent" : role === "AUDIT" ? "warning" : "success")}</td><td class="px-5 py-4">${escapeHtml(accessLabel(user.roles))}</td><td class="px-5 py-4">${badge(user.active ? "Actif" : "Inactif", user.active ? "success" : "gray")}</td><td class="px-5 py-4 text-right"><button data-action="openModal('userModal')" title="Voir utilisateur" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-accent-600"><i data-lucide="eye" class="w-4 h-4"></i></button></td></tr>`;
}

function updateApiBackedViews(root: HTMLElement) {
  updateDashboard(root);
  getArticles()
    .then((articles) => {
      const articleBody = root.querySelector<HTMLElement>('#ref-articles tbody');
      if (articleBody && articles.length) articleBody.innerHTML = articles.map(articleRow).join("");
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getStockLevels()
    .then((levels) => {
      const stockBody = root.querySelector<HTMLElement>('#stock tbody');
      if (stockBody && levels.length) stockBody.innerHTML = levels.map(stockRow).join("");
      window.lucide?.createIcons();
    })
    .catch(() => undefined);

  getUsers()
    .then((users) => {
      const usersBody = root.querySelector<HTMLElement>('#users tbody');
      if (usersBody && users.length) usersBody.innerHTML = users.map(userRow).join("");
      window.lucide?.createIcons();
    })
    .catch(() => undefined);
}

function clearActiveNav(root: HTMLElement) {
  root.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.remove("bg-accent-50", "text-accent-600");
    button.classList.add("text-gray-600", "hover:bg-gray-100");
  });
}

function activateNavButton(button: HTMLElement) {
  button.classList.add("bg-accent-50", "text-accent-600");
  button.classList.remove("text-gray-600", "hover:bg-gray-100");
}

function renderHeaderButton(action: { label: string; icon: string; modal?: string; variant: "primary" | "secondary" }) {
  const classes = action.variant === "primary"
    ? "px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-semibold hover:bg-accent-500 flex items-center gap-2"
    : "px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2";
  const dataAction = action.modal ? ` data-action="openModal('${action.modal}')"` : "";
  return `<button class="${classes}"${dataAction}><i data-lucide="${action.icon}" class="w-4 h-4"></i>${action.label}</button>`;
}

function setViewActions(root: HTMLElement, view: string) {
  const actions = root.querySelector<HTMLElement>("#viewActions");
  if (!actions) return;
  const actionByView: Record<string, Array<{ label: string; icon: string; modal?: string; variant: "primary" | "secondary" }>> = {
    home: [{ label: "Importer XLS", icon: "upload", modal: "importModal", variant: "secondary" }],
    entrees: [
      { label: "Importer XLS", icon: "upload", modal: "importModal", variant: "secondary" },
      { label: "Nouvelle entree", icon: "plus", modal: "entryModal", variant: "primary" }
    ],
    referentiels: [{ label: "Nouvel element", icon: "plus", modal: "referentialModal", variant: "primary" }],
    stock: [{ label: "Importer XLS", icon: "upload", modal: "importModal", variant: "secondary" }],
    sortie: [
      { label: "Nouvelle sortie", icon: "package-minus", modal: "directExitModal", variant: "secondary" },
      { label: "Nouvelle demande", icon: "plus", modal: "exitModal", variant: "primary" }
    ],
    retours: [
      { label: "Nouveau transfert", icon: "shuffle", modal: "transferModal", variant: "secondary" },
      { label: "Nouveau retour", icon: "rotate-ccw", modal: "returnModal", variant: "primary" }
    ],
    reappro: [{ label: "Exporter liste", icon: "download", variant: "secondary" }],
    inventaire: [
      { label: "Modele Excel", icon: "download", variant: "secondary" },
      { label: "Importer XLS", icon: "upload", modal: "importModal", variant: "secondary" }
    ],
    equipements: [{ label: "Affecter equipement", icon: "plus", modal: "equipmentModal", variant: "primary" }],
    parcAuto: [{ label: "Nouveau vehicule", icon: "plus", modal: "vehicleModal", variant: "primary" }],
    audit: [],
    users: [{ label: "Nouvel utilisateur", icon: "user-plus", modal: "userModal", variant: "primary" }],
    historique: [{ label: "Export complet", icon: "file-down", variant: "secondary" }]
  };
  actions.innerHTML = (actionByView[view] ?? []).map(renderHeaderButton).join("");
}

function showView(root: HTMLElement, view: string, navButton?: HTMLElement) {
  root.querySelectorAll(".view").forEach((section) => setVisible(section, section.id === view));
  if (navButton?.classList.contains("nav-btn")) {
    clearActiveNav(root);
    activateNavButton(navButton);
  }
  const crumb = root.querySelector("#crumbPage");
  const titles: Record<string, string> = {
    home: "Accueil Module",
    referentiels: "Referentiels",
    stock: "Vue Stock",
    equipements: "Equipements",
    parcAuto: "Parc auto",
    entrees: "Entrees stock",
    sortie: "Sorties stock",
    retours: "Retours & transferts",
    reappro: "Reapprovisionnement",
    inventaire: "Inventaire de stock",
    audit: "Audit & alertes",
    historique: "Historique & exports",
    users: "Utilisateurs & roles"
  };
  if (crumb) crumb.textContent = titles[view] ?? "Accueil Module";
  setViewActions(root, view);
  window.lucide?.createIcons();
}

function showRef(root: HTMLElement, ref: string, button?: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".ref-panel").forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `ref-${ref}`);
  });
  root.querySelectorAll<HTMLElement>(".ref-tab").forEach((tab) => {
    tab.classList.remove("bg-accent-50", "text-accent-600");
    tab.classList.add("bg-gray-100", "text-gray-600");
  });
  if (button) {
    button.classList.add("bg-accent-50", "text-accent-600");
    button.classList.remove("bg-gray-100", "text-gray-600");
  }
  window.lucide?.createIcons();
}

function openModal(root: HTMLElement, id: string) {
  setVisible(root.querySelector(`#${CSS.escape(id)}`), true);
  window.lucide?.createIcons();
}

function closeModal(root: HTMLElement, id: string) {
  setVisible(root.querySelector(`#${CSS.escape(id)}`), false);
}

function togglePassword(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("#loginPassword");
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
}

function login(root: HTMLElement) {
  const overlay = root.querySelector<HTMLElement>("#loginOverlay");
  if (overlay) overlay.style.display = "none";
  localStorage.setItem("stock-hub.session", "1");
}

function logout(root: HTMLElement) {
  const overlay = root.querySelector<HTMLElement>("#loginOverlay");
  if (overlay) overlay.style.display = "flex";
  localStorage.removeItem("stock-hub.session");
}

function parseAction(action: string) {
  const viewMatch = action.match(/^showView\('([^']+)'/);
  if (viewMatch) return { type: "view", id: viewMatch[1] } as const;
  const openMatch = action.match(/^openModal\('([^']+)'\)/);
  if (openMatch) return { type: "open", id: openMatch[1] } as const;
  const closeMatch = action.match(/^closeModal\('([^']+)'\)/);
  if (closeMatch) return { type: "close", id: closeMatch[1] } as const;
  if (action.includes("toggleLoginPassword")) return { type: "toggle-password" } as const;
  if (action.includes("loginMock")) return { type: "login" } as const;
  if (action.includes("logoutMock")) return { type: "logout" } as const;
  const refMatch = action.match(/^showRef\('([^']+)'/);
  if (refMatch) return { type: "ref", id: refMatch[1] } as const;
  return { type: "unknown" } as const;
}

function StockHubTemplate() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (localStorage.getItem("stock-hub.session") === "1") {
      const overlay = root.querySelector<HTMLElement>("#loginOverlay");
      if (overlay) overlay.style.display = "none";
    }
    showView(root, "home", root.querySelector<HTMLElement>('.nav-btn[data-action*="home"]') ?? undefined);
    updateApiBackedViews(root);
    window.lucide?.createIcons();

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
      if (!target || !root.contains(target)) return;
      const action = target.dataset.action;
      if (!action) return;
      const parsed = parseAction(action);
      if (parsed.type === "view") showView(root, parsed.id, target);
      if (parsed.type === "open") openModal(root, parsed.id);
      if (parsed.type === "close") closeModal(root, parsed.id);
      if (parsed.type === "toggle-password") togglePassword(root);
      if (parsed.type === "login") login(root);
      if (parsed.type === "logout") logout(root);
      if (parsed.type === "ref") showRef(root, parsed.id, target);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  return <div ref={rootRef} className="template-part"><StockHubShell /></div>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StockHubTemplate />
  </React.StrictMode>
);

