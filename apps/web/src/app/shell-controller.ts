import type { StockUser } from "../api";
import type { ViewActionsContext } from "../components/layout/view-actions";

export type ShellControllerContext = {
  getCurrentUser: () => StockUser | null;
  setCurrentUser: (user: StockUser) => void;
  getPendingRouteAfterLogin: () => string;
  setPendingRouteAfterLogin: (route: string) => void;
  VIEW_ROUTES: Record<string, string>;
  DEFAULT_ROUTE: string;
  LOGIN_ROUTE: string;
  normalizeRoute: () => string;
  viewForRoute: (pathname?: string) => string | undefined;
  writeRoute: (view: string, replace?: boolean) => void;
  writeLoginRoute: (replace?: boolean) => void;
  navButtonForView: (root: HTMLElement, view: string) => HTMLElement | null;
  closeStockDrawer: (root: HTMLElement) => void;
  setVisible: (element: Element | null, visible: boolean) => void;
  clearActiveNav: (root: HTMLElement) => void;
  activateNavButton: (button: HTMLElement) => void;
  setViewActions: (
    root: HTMLElement,
    view: string,
    context: ViewActionsContext,
  ) => void;
  showLogin: (root: HTMLElement) => void;
  hideLogin: (root: HTMLElement) => void;
  showToast: (
    root: HTMLElement,
    message: string,
    tone?: "success" | "error",
  ) => void;
  updateProfileView: (root: HTMLElement) => void;
  createIcons: () => void;
  readStoredUser: () => StockUser | null;
  userDisplayName: (
    user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">,
  ) => string;
  userIdentity: (user: Pick<StockUser, "identifier" | "email">) => string;
  roleLabel: (role: string) => string;
  rolePriority: (roles: string[]) => string;
  canAccessView: (view: string) => boolean;
  viewActionsContext: () => ViewActionsContext;
};

export type NavigateToViewOptions = {
  replace?: boolean;
  skipHistory?: boolean;
};

export function applyRoleAccessPage(
  root: HTMLElement,
  ctx: ShellControllerContext,
) {
  root
    .querySelectorAll<HTMLElement>(".nav-btn[data-view]")
    .forEach((button) => {
      const view = button.dataset.view ?? "";
      button.classList.toggle("hidden", !ctx.canAccessView(view));
    });
  root.querySelectorAll<HTMLElement>("aside nav").forEach((nav) => {
    const hasVisibleItem = Array.from(
      nav.querySelectorAll<HTMLElement>(".nav-btn[data-view]"),
    ).some((button) => !button.classList.contains("hidden"));
    nav.classList.toggle("hidden", !hasVisibleItem);
    const title = nav.previousElementSibling;
    if (
      title instanceof HTMLElement &&
      title.classList.contains("uppercase")
    ) {
      title.classList.toggle("hidden", !hasVisibleItem);
    }
  });
}

export function updateCurrentUserDisplayPage(
  root: HTMLElement,
  ctx: ShellControllerContext,
) {
  const storedUser = ctx.readStoredUser();
  const user = ctx.getCurrentUser() ?? storedUser;
  if (user) ctx.setCurrentUser(user);
  const fullName = user ? ctx.userDisplayName(user) : "Utilisateur";
  const primaryRole = user
    ? ctx.roleLabel(ctx.rolePriority(user.roles))
    : "Non connecte";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
        .trim()
        .toUpperCase() || ctx.userIdentity(user).slice(0, 2).toUpperCase()
    : "--";
  const nameNode = root.querySelector<HTMLElement>("#currentUserName");
  const roleNode = root.querySelector<HTMLElement>("#currentUserRole");
  const initialsNodes = root.querySelectorAll<HTMLElement>(
    "#currentUserInitials, #topUserInitials",
  );
  if (nameNode) nameNode.textContent = fullName;
  if (roleNode) roleNode.textContent = primaryRole;
  initialsNodes.forEach((node) => {
    node.textContent = initials;
  });
}

export function showViewPage(
  root: HTMLElement,
  view: string,
  navButton: HTMLElement | undefined,
  ctx: ShellControllerContext,
) {
  ctx.closeStockDrawer(root);
  root
    .querySelectorAll(".view")
    .forEach((section) => ctx.setVisible(section, section.id === view));
  const activeButton = navButton?.classList.contains("nav-btn")
    ? navButton
    : ctx.navButtonForView(root, view);
  if (activeButton?.classList.contains("nav-btn")) {
    ctx.clearActiveNav(root);
    ctx.activateNavButton(activeButton);
  } else if (view === "profil") {
    ctx.clearActiveNav(root);
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
    historique: "Historique des mouvements",
    users: "Utilisateurs & roles",
    profil: "Mon profil",
  };
  if (crumb) crumb.textContent = titles[view] ?? "Accueil Module";
  ctx.setViewActions(root, view, ctx.viewActionsContext());
  if (view === "profil") ctx.updateProfileView(root);
  ctx.createIcons();
}

export function navigateToViewPage(
  root: HTMLElement,
  view: string,
  navButton: HTMLElement | undefined,
  options: NavigateToViewOptions,
  ctx: ShellControllerContext,
) {
  const targetRoute = ctx.VIEW_ROUTES[view];
  let targetView = targetRoute ? view : "home";

  if (!ctx.getCurrentUser()) {
    ctx.setPendingRouteAfterLogin(targetRoute ?? ctx.DEFAULT_ROUTE);
    ctx.showLogin(root);
    ctx.writeLoginRoute(true);
    return;
  }

  if (!ctx.canAccessView(targetView)) {
    ctx.showToast(root, "Acces non autorise pour cette page.");
    targetView = "home";
    options.replace = true;
  }

  ctx.hideLogin(root);
  showViewPage(
    root,
    targetView,
    navButton ?? ctx.navButtonForView(root, targetView) ?? undefined,
    ctx,
  );

  if (!options.skipHistory) {
    ctx.writeRoute(targetView, options.replace);
  }
}

export function openRoutePage(
  root: HTMLElement,
  options: NavigateToViewOptions,
  ctx: ShellControllerContext,
) {
  const route = ctx.normalizeRoute();

  if (route === ctx.LOGIN_ROUTE) {
    if (ctx.getCurrentUser()) {
      navigateToViewPage(root, "home", undefined, { replace: true }, ctx);
    } else {
      ctx.showLogin(root);
    }
    return;
  }

  const view = ctx.viewForRoute(route);
  if (!ctx.getCurrentUser()) {
    ctx.setPendingRouteAfterLogin(view ? route : ctx.DEFAULT_ROUTE);
    ctx.showLogin(root);
    ctx.writeLoginRoute(true);
    return;
  }

  if (!view) {
    ctx.showToast(root, "Page introuvable. Retour au tableau de bord.");
    navigateToViewPage(root, "home", undefined, { replace: true }, ctx);
    return;
  }

  navigateToViewPage(root, view, undefined, options, ctx);
}
