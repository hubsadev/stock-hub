import type { StockUser, changeMyPassword, updateMyProfile } from "../../api";

type BadgeTone = "success" | "warning" | "error" | "gray" | "accent";

export type ProfilContext = {
  currentUser: StockUser | null;
  latestUsers: StockUser[];
  setCurrentUser: (user: StockUser) => void;
  setLatestUsers: (users: StockUser[]) => void;
  readStoredUser: () => StockUser | null;
  userIdentity: (user: Pick<StockUser, "identifier" | "email">) => string;
  userDisplayName: (
    user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">,
  ) => string;
  userInitials: (
    user: Pick<StockUser, "firstName" | "lastName" | "identifier" | "email">,
  ) => string;
  roleLabel: (role: string) => string;
  accessLabel: (roles: string[]) => string;
  badge: (label: string, tone?: BadgeTone) => string;
  setText: (root: HTMLElement, selector: string, value: string | number) => void;
  showToast: (
    root: HTMLElement,
    message: string,
    tone?: "success" | "error",
  ) => void;
  updateProfilePwaCards: (root: HTMLElement) => void;
  updateCurrentUserDisplay: (root: HTMLElement) => void;
  renderUsersList: (root: HTMLElement) => void;
  updateMyProfile: typeof updateMyProfile;
  changeMyPassword: typeof changeMyPassword;
};

export function profileRoleBadgePage(role: string, context: ProfilContext) {
  const variant = role === "ADMIN_STOCK" ? "accent" : role === "AUDIT" ? "warning" : "success";
  return context.badge(context.roleLabel(role), variant);
}

export function updateProfileViewPage(root: HTMLElement, context: ProfilContext) {
  const user = context.currentUser ?? context.readStoredUser();
  if (!user) return;
  context.setText(root, "#profileInitials", context.userInitials(user));
  context.setText(root, "#profileDisplayName", context.userDisplayName(user));
  context.setText(root, "#profileIdentity", context.userIdentity(user));
  const firstName = root.querySelector<HTMLInputElement>("#profileFirstName");
  const lastName = root.querySelector<HTMLInputElement>("#profileLastName");
  const email = root.querySelector<HTMLInputElement>("#profileEmail");
  const identifier = root.querySelector<HTMLInputElement>("#profileIdentifier");
  if (firstName) firstName.value = user.firstName;
  if (lastName) lastName.value = user.lastName;
  if (email) email.value = user.email ?? "";
  if (identifier) identifier.value = user.identifier;
  const roles = root.querySelector<HTMLElement>("#profileRoleBadges");
  if (roles) roles.innerHTML = user.roles.map((role) => profileRoleBadgePage(role, context)).join("");
  const status = root.querySelector<HTMLElement>("#profileStatus");
  if (status) status.innerHTML = context.badge(user.active ? "Actif" : "Inactif", user.active ? "success" : "gray");
  context.setText(root, "#profileAccess", context.accessLabel(user.roles));
  context.updateProfilePwaCards(root);
  window.lucide?.createIcons();
}

export function syncCurrentUserPage(
  root: HTMLElement,
  user: StockUser,
  context: ProfilContext,
) {
  context.setCurrentUser(user);
  localStorage.setItem("stock-hub.user", JSON.stringify(user));
  context.updateCurrentUserDisplay(root);
  updateProfileViewPage(root, context);
}

export async function submitProfilePage(root: HTMLElement, context: ProfilContext) {
  if (!context.currentUser) return;
  const firstName = root.querySelector<HTMLInputElement>("#profileFirstName")?.value.trim() ?? "";
  const lastName = root.querySelector<HTMLInputElement>("#profileLastName")?.value.trim() ?? "";
  const emailValue = root.querySelector<HTMLInputElement>("#profileEmail")?.value.trim() ?? "";
  if (!firstName || !lastName) {
    context.showToast(root, "Prenom et nom sont requis.", "error");
    return;
  }
  try {
    const user = await context.updateMyProfile(context.currentUser.id, {
      firstName,
      lastName,
      email: emailValue || null,
    });
    syncCurrentUserPage(root, user, context);
    context.setLatestUsers(context.latestUsers.map((item) => (item.id === user.id ? user : item)));
    context.renderUsersList(root);
    context.showToast(root, "Profil mis a jour.");
  } catch (error) {
    context.showToast(root, error instanceof Error ? error.message : "Modification du profil impossible.", "error");
  }
}

export async function submitPasswordChangePage(root: HTMLElement, context: ProfilContext) {
  if (!context.currentUser) return;
  const currentPassword = root.querySelector<HTMLInputElement>("#profileCurrentPassword")?.value ?? "";
  const newPassword = root.querySelector<HTMLInputElement>("#profileNewPassword")?.value ?? "";
  const confirmPassword = root.querySelector<HTMLInputElement>("#profileConfirmPassword")?.value ?? "";
  if (!currentPassword || !newPassword) {
    context.showToast(root, "Ancien et nouveau mot de passe sont requis.", "error");
    return;
  }
  if (newPassword.length < 8) {
    context.showToast(root, "Le nouveau mot de passe doit contenir au moins 8 caracteres.", "error");
    return;
  }
  if (newPassword !== confirmPassword) {
    context.showToast(root, "La confirmation ne correspond pas au nouveau mot de passe.", "error");
    return;
  }
  try {
    const user = await context.changeMyPassword(context.currentUser.id, { currentPassword, newPassword });
    syncCurrentUserPage(root, user, context);
    ["#profileCurrentPassword", "#profileNewPassword", "#profileConfirmPassword"].forEach((selector) => {
      const input = root.querySelector<HTMLInputElement>(selector);
      if (input) input.value = "";
    });
    context.showToast(root, "Mot de passe mis a jour.");
  } catch (error) {
    context.showToast(root, error instanceof Error ? error.message : "Changement de mot de passe impossible.", "error");
  }
}
