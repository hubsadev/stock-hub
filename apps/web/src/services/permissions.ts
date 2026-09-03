import type { StockUser } from "../api";

export function rolePriority(roles: string[]) {
  const order = [
    "ADMIN_STOCK",
    "DIRECTION",
    "GESTIONNAIRE_STOCK",
    "AUDIT",
    "CHEF_PROJET",
    "RH",
  ];
  return order.find((role) => roles.includes(role)) ?? roles[0] ?? "";
}

export function hasRole(user: StockUser | null, role: string) {
  return Boolean(user?.roles.includes(role));
}

export function canPrepareMaterialRequests(user: StockUser | null) {
  return hasRole(user, "ADMIN_STOCK") || hasRole(user, "GESTIONNAIRE_STOCK");
}

export function canAccessView(user: StockUser | null, view: string) {
  if (!user) return false;
  if (view === "profil") return true;
  if (hasRole(user, "ADMIN_STOCK")) return true;
  if (view === "home") return true;
  const roles = user.roles;
  const allowedByRole: Record<string, string[]> = {
    GESTIONNAIRE_STOCK: [
      "referentiels",
      "stock",
      "equipements",
      "parcAuto",
      "entrees",
      "sortie",
      "retours",
      "reappro",
      "inventaire",
    ],
    AUDIT: ["inventaire", "audit", "historique", "stock"],
    RH: ["stock", "equipements", "parcAuto"],
    DIRECTION: ["home", "stock", "audit", "historique"],
    CHEF_PROJET: ["stock", "sortie", "equipements"],
  };
  return roles.some((role) => allowedByRole[role]?.includes(view));
}
