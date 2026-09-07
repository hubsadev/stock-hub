import type { StockUser } from "../api";

export function userIdentity(user: Pick<StockUser, "identifier" | "email">) {
  return user.identifier || user.email || "-";
}

export function userDisplayName(
  user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">,
) {
  return (
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    userIdentity(user)
  );
}

export function roleLabel(role: string) {
  return (
    (
      {
        ADMIN_STOCK: "Admin Stock",
        GESTIONNAIRE_STOCK: "Gestionnaire",
        AUDIT: "Audit",
        RH: "RH",
        DIRECTION: "Direction",
        CHEF_PROJET: "Chef projet",
      } as Record<string, string>
    )[role] ?? role
  );
}

export function accessLabel(roles: string[]) {
  if (roles.includes("ADMIN_STOCK")) return "Tous modules";
  if (roles.includes("GESTIONNAIRE_STOCK"))
    return "Referentiels, stock, equipements, parc auto, mouvements";
  if (roles.includes("AUDIT")) return "Inventaire, alertes, exports";
  if (roles.includes("DIRECTION")) return "KPI et controles";
  if (roles.includes("CHEF_PROJET")) return "Demandes, stock consulte";
  if (roles.includes("RH")) return "Consultation inventaire";
  return "Acces limite";
}

export function userInitials(user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">) {
  return (
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
      .trim()
      .toUpperCase() || userIdentity(user).slice(0, 2).toUpperCase()
  );
}
