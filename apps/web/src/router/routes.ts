export const LOGIN_ROUTE = "/login";
export const DEFAULT_ROUTE = "/dashboard";
export const VIEW_ROUTES: Record<string, string> = {
  home: DEFAULT_ROUTE,
  referentiels: "/referentiels",
  stock: "/stock",
  equipements: "/equipements",
  parcAuto: "/parc-auto",
  entrees: "/entrees-stock",
  sortie: "/sorties-stock",
  retours: "/retours-transferts",
  reappro: "/reapprovisionnement",
  inventaire: "/inventaire",
  audit: "/audit-alertes",
  historique: "/historiques",
  users: "/utilisateurs-roles",
  profil: "/profil",
};


export const ROUTE_VIEWS: Record<string, string> = {
  [DEFAULT_ROUTE]: "home",
  "/referentiels": "referentiels",
  "/stock": "stock",
  "/equipements": "equipements",
  "/parc-auto": "parcAuto",
  "/entrees-stock": "entrees",
  "/sorties-stock": "sortie",
  "/retours-transferts": "retours",
  "/reapprovisionnement": "reappro",
  "/inventaire": "inventaire",
  "/audit-alertes": "audit",
  "/historiques": "historique",
  "/historique-exports": "historique",
  "/utilisateurs-roles": "users",
  "/profil": "profil",
};

export function normalizeRoute(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, "");
  return path || DEFAULT_ROUTE;
}

export function routeForView(view: string) {
  return VIEW_ROUTES[view] ?? DEFAULT_ROUTE;
}

export function viewForRoute(pathname = window.location.pathname) {
  return ROUTE_VIEWS[normalizeRoute(pathname)];
}

export function navButtonForView(root: HTMLElement, view: string) {
  return root.querySelector<HTMLElement>(
    `.nav-btn[data-view="${CSS.escape(view)}"]`,
  );
}

export function writeRoute(view: string, replace = false) {
  const route = routeForView(view);
  if (normalizeRoute() === route) return;
  const state = { stockHubView: view };
  if (replace) {
    window.history.replaceState(state, "", route);
  } else {
    window.history.pushState(state, "", route);
  }
}

export function writeLoginRoute(replace = true) {
  if (normalizeRoute() === LOGIN_ROUTE) return;
  const state = { stockHubView: "login" };
  if (replace) {
    window.history.replaceState(state, "", LOGIN_ROUTE);
  } else {
    window.history.pushState(state, "", LOGIN_ROUTE);
  }
}
